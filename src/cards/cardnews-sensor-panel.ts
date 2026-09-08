import { css, html, nothing, svg, type CSSResultGroup, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { HeroCardBase } from '../base/HeroCardBase.js';
import type { HeroConfig, ListItem } from '../base/types.js';

/**
 * cardnews-sensor-panel — hero + 2x2 metric grid + sparkline + list.
 *
 * Fetches 24h history for `chart_entity` via HA WebSocket
 * (`history/history_during_period`), downsamples to <=100 points, and renders
 * an SVG sparkline with area fill. Re-fetches every 5 minutes.
 */

export interface MetricConfig {
  label: string;
  entity: string;
  unit?: string;
  accent?: string;
}

export interface ChartSeriesConfig {
  entity: string;
  label?: string;
  color?: string;
  /**
   * When set, series line color is chosen dynamically based on the current
   * entity value:
   *   value < low   → colors.low   (default '#60a5fa' blue)
   *   value > high  → colors.high  (default '#ef4444' red)
   *   otherwise     → colors.mid   (default '#f59e0b' amber)
   * Overrides `color`.
   */
  reactive_thresholds?: { low: number; high: number };
  reactive_colors?: { low?: string; mid?: string; high?: string };
}

export interface CardNewsSensorPanelConfig extends HeroConfig {
  type: string;
  metrics?: MetricConfig[];
  chart_entity?: string;
  chart_entities?: ChartSeriesConfig[];
  chart_hours?: number;
  chart_color?: string;
  list?: ListItem[];
  /**
   * Compute a discomfort-index-based subtitle from [temp_entity, humid_entity].
   * When set, overrides `subtitle`/`subtitle_template` on the hero.
   */
  discomfort_index_from?: [string, string];
}

interface Point {
  t: number;
  v: number;
}

const MAX_POINTS = 100;

export class CardNewsSensorPanel extends HeroCardBase {
  declare _config: CardNewsSensorPanelConfig;
  @state() private _hasConfig = false;
  @state() private _history: Point[] = [];
  @state() private _historySeries: Record<string, Point[]> = {};
  @state() private _historyState: 'idle' | 'loading' | 'ok' | 'error' = 'idle';
  private _refreshTimer?: ReturnType<typeof setInterval>;
  private _lastFetchKey?: string;

  private _chartEntities(): ChartSeriesConfig[] {
    const cfg = this._config;
    if (!cfg) return [];
    if (cfg.chart_entities && cfg.chart_entities.length > 0) return cfg.chart_entities;
    if (cfg.chart_entity) return [{ entity: cfg.chart_entity, color: cfg.chart_color }];
    return [];
  }

  public override setConfig(config: unknown): void {
    super.setConfig(config);
    const cfg = config as Partial<CardNewsSensorPanelConfig> | null;
    if (!cfg || typeof cfg !== 'object') {
      this._configError = 'Invalid config';
      return;
    }
    if (!cfg.title && !cfg.title_template) {
      this._configError = 'cardnews-sensor-panel: `title` or `title_template` is required';
      return;
    }
    this._config = {
      type: 'custom:cardnews-sensor-panel',
      chart_hours: 24,
      ...cfg,
    } as CardNewsSensorPanelConfig;
    this._hasConfig = true;
  }

  /** HA UI Visual Editor. */
  public static async getConfigElement(): Promise<HTMLElement> {
    await import('../editors/cardnews-sensor-panel-editor.js');
    return document.createElement('cardnews-sensor-panel-editor');
  }

  public static getStubConfig(): Partial<CardNewsSensorPanelConfig> {
    return {
      category: 'AIR QUALITY · LIVING ROOM',
      title: '거실 공기질',
      subtitle: '지금 매우 좋음',
      hero_image: 'hero-airquality',
      metrics: [
        { label: 'PM2.5', entity: 'sensor.pm25', unit: 'µg/m³' },
        { label: 'CO2', entity: 'sensor.co2', unit: 'ppm' },
      ],
      chart_entity: 'sensor.pm25',
      chart_hours: 24,
    };
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this._maybeFetch();
    this._refreshTimer = setInterval(() => this._fetchHistory(true), 5 * 60 * 1000);
  }

  public override disconnectedCallback(): void {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = undefined;
    }
    super.disconnectedCallback();
  }

  public override updated(changed: Map<string, unknown>): void {
    super.updated?.(changed);
    if (changed.has('hass') || changed.has('_hasConfig')) {
      this._maybeFetch();
    }
  }

  private _maybeFetch(): void {
    if (!this._hasConfig || !this.hass) return;
    const ents = this._chartEntities();
    if (ents.length === 0) return;
    const key = ents.map((e) => e.entity).join(',') + '|' + (this._config?.chart_hours ?? 24);
    if (key === this._lastFetchKey) return;
    this._lastFetchKey = key;
    void this._fetchHistory();
  }

  private async _fetchHistory(force = false): Promise<void> {
    const ents = this._chartEntities();
    if (ents.length === 0 || !this.hass) return;
    const entityIds = ents.map((e) => e.entity);
    const primaryId = entityIds[0];
    const hours = this._config?.chart_hours ?? 24;
    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1000);
    this._historyState = 'loading';
    try {
      const hass = this.hass as unknown as {
        callWS: (msg: Record<string, unknown>) => Promise<unknown>;
      };
      let raw: unknown;
      if (typeof hass.callWS === 'function') {
        raw = await hass.callWS({
          type: 'history/history_during_period',
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          entity_ids: entityIds,
          minimal_response: true,
          no_attributes: true,
        });
      } else {
        // REST fallback — requires user token; skipped when unavailable.
        raw = null;
      }
      const series: Record<string, Point[]> = {};
      for (const eid of entityIds) {
        const pts = this._parseHistory(raw, eid);
        series[eid] = this._downsample(pts, MAX_POINTS);
      }
      this._historySeries = series;
      this._history = series[primaryId] ?? [];
      const anyData = Object.values(series).some((arr) => arr.length > 0);
      this._historyState = anyData ? 'ok' : 'error';
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('cardnews-sensor-panel: history fetch failed', err);
      this._historyState = 'error';
      if (force) { this._history = []; this._historySeries = {}; }
    }
  }

  private _parseHistory(raw: unknown, entityId: string): Point[] {
    if (!raw) return [];
    // Format A (WS): { entity_id: [ {s|state, lu|last_updated}, ... ] }
    // Format B (REST): [ [ {state, last_changed}, ... ] ]
    let arr: unknown[] = [];
    if (Array.isArray(raw)) {
      arr = Array.isArray(raw[0]) ? (raw[0] as unknown[]) : (raw as unknown[]);
    } else if (typeof raw === 'object' && raw !== null) {
      const obj = raw as Record<string, unknown>;
      const v = obj[entityId];
      if (Array.isArray(v)) arr = v as unknown[];
    }
    const out: Point[] = [];
    for (const item of arr) {
      if (!item || typeof item !== 'object') continue;
      const r = item as Record<string, unknown>;
      const stateStr = (r.s ?? r.state) as string | undefined;
      const lu = r.lu ?? r.last_updated ?? r.last_changed;
      if (stateStr === undefined) continue;
      const n = Number(stateStr);
      if (!Number.isFinite(n)) continue;
      let ts: number;
      if (typeof lu === 'number') ts = lu * 1000;
      else if (typeof lu === 'string') ts = new Date(lu).getTime();
      else continue;
      if (!Number.isFinite(ts)) continue;
      out.push({ t: ts, v: n });
    }
    out.sort((a, b) => a.t - b.t);
    return out;
  }

  private _downsample(pts: Point[], max: number): Point[] {
    if (pts.length <= max) return pts;
    const bucket = pts.length / max;
    const out: Point[] = [];
    for (let i = 0; i < max; i++) {
      const start = Math.floor(i * bucket);
      const end = Math.floor((i + 1) * bucket);
      let sum = 0;
      let count = 0;
      let tSum = 0;
      for (let j = start; j < end && j < pts.length; j++) {
        sum += pts[j].v;
        tSum += pts[j].t;
        count++;
      }
      if (count > 0) out.push({ t: tSum / count, v: sum / count });
    }
    return out;
  }

  // ---------- metric grid ----------

  private _entityNumber(id: string): number | undefined {
    const e = this._entity(id);
    if (!e) return undefined;
    const n = Number(e.state);
    return Number.isFinite(n) ? n : undefined;
  }

  private _renderMetric(m: MetricConfig): TemplateResult {
    const cur = this._entityNumber(m.entity);
    const displayValue =
      cur === undefined ? '—' : Math.round(cur * 10) / 10;
    const unit = m.unit ?? this._entity(m.entity)?.attributes.unit_of_measurement ?? '';
    const trend = this._trendFor(m.entity, cur);
    const clickable = !!m.entity;
    return html`
      <div
        class="cn-metric ${clickable ? 'cn-metric--clickable' : ''}"
        @click=${clickable ? () => this._fireMoreInfo(m.entity) : undefined}
      >
        <div class="cn-metric__label">
          ${m.accent
            ? html`<span class="cn-metric__accent" style="background:${m.accent}"></span>`
            : nothing}
          ${m.label}
        </div>
        <div class="cn-metric__row">
          <span class="cn-metric__value">${displayValue}</span>
          ${unit ? html`<span class="cn-metric__unit">${unit}</span>` : nothing}
          ${trend
            ? html`<span class="cn-metric__trend cn-metric__trend--${trend.dir}">
                ${trend.symbol}
              </span>`
            : nothing}
        </div>
      </div>
    `;
  }

  /**
   * Compute a simple trend arrow by comparing the current value against the
   * point closest to ~1h ago in the fetched history. Only meaningful if
   * this metric is also `chart_entity`.
   */
  private _trendFor(
    entityId: string,
    current: number | undefined,
  ): { dir: 'up' | 'down' | 'flat'; symbol: string } | undefined {
    if (current === undefined) return undefined;
    if (entityId !== this._config?.chart_entity) return undefined;
    if (this._history.length < 2) return undefined;
    const now = this._history[this._history.length - 1].t;
    const target = now - 60 * 60 * 1000;
    let past: Point | undefined;
    for (let i = this._history.length - 1; i >= 0; i--) {
      if (this._history[i].t <= target) {
        past = this._history[i];
        break;
      }
    }
    if (!past) past = this._history[0];
    const diff = current - past.v;
    const pct = past.v !== 0 ? Math.abs(diff / past.v) : Math.abs(diff);
    if (pct < 0.05) return { dir: 'flat', symbol: '⟶' };
    return diff > 0
      ? { dir: 'up', symbol: '↑' }
      : { dir: 'down', symbol: '↓' };
  }

  private renderMetricGrid(): TemplateResult | typeof nothing {
    const metrics = this._config?.metrics ?? [];
    if (metrics.length === 0) return nothing;
    return html`
      <div class="cn-metrics">
        ${metrics.map((m) => this._renderMetric(m))}
      </div>
    `;
  }

  // ---------- sparkline ----------

  private _seriesColor(cfg: ChartSeriesConfig, fallback: string): string {
    if (cfg.reactive_thresholds) {
      const v = this._entityNumber(cfg.entity);
      const cols = cfg.reactive_colors ?? {};
      const low = cols.low ?? '#60a5fa';
      const mid = cols.mid ?? '#f59e0b';
      const high = cols.high ?? '#ef4444';
      if (v === undefined) return cfg.color ?? fallback;
      if (v < cfg.reactive_thresholds.low) return low;
      if (v > cfg.reactive_thresholds.high) return high;
      return mid;
    }
    return cfg.color ?? fallback;
  }

  private renderChart(): TemplateResult | typeof nothing {
    const ents = this._chartEntities();
    if (ents.length === 0) return nothing;
    const series = ents
      .map((s) => ({ cfg: s, pts: this._historySeries[s.entity] ?? [] }))
      .filter((s) => s.pts.length >= 2);
    if (this._historyState === 'loading' && series.length === 0) {
      return html`<div class="cn-chart cn-chart--empty">차트 불러오는 중…</div>`;
    }
    if (series.length === 0) {
      return html`<div class="cn-chart cn-chart--empty">데이터 없음</div>`;
    }

    const defaultColors = ['var(--cn-accent, #6ea8fe)', '#f59e0b', '#10b981', '#ef4444'];
    const hours = this._config?.chart_hours ?? 24;
    let maxT = -Infinity;
    for (const s of series) for (const p of s.pts) if (p.t > maxT) maxT = p.t;
    const now = Date.now();
    const endT = Math.max(maxT, now);
    const startT = endT - hours * 3600 * 1000;
    const dt = endT - startT || 1;

    const niceStep = (span: number): number => {
      if (span <= 4) return 1;
      if (span <= 10) return 2;
      if (span <= 25) return 5;
      if (span <= 60) return 10;
      return 20;
    };
    const seriesMeta = series.map((s) => {
      let mn = Infinity, mx = -Infinity;
      for (const p of s.pts) {
        if (p.v < mn) mn = p.v;
        if (p.v > mx) mx = p.v;
      }
      const rawSpan = mx - mn;
      const step = niceStep(rawSpan);
      const niceMn = Math.floor(mn / step) * step;
      const niceMx = Math.ceil(mx / step) * step;
      const finalMx = niceMx === niceMn ? niceMn + step : niceMx;
      return { mn: niceMn, mx: finalMx, rawMn: mn, rawMx: mx, step };
    });

    // Compact viewport; plot in the middle with Y-axis tick stacks on left/right.
    const W = 420;
    const H = 120;
    const yTop = 24;
    const yBot = 100;
    const LEFT_PAD = 32;
    const RIGHT_PAD = series.length > 1 ? 32 : 8;
    const plotLeft = LEFT_PAD;
    const plotRight = W - RIGHT_PAD;
    const plotW = plotRight - plotLeft;
    const xOf = (t: number) => plotLeft + ((t - startT) / dt) * plotW;
    const yOf = (v: number, i: number) => {
      const { mn, mx } = seriesMeta[i];
      const span = mx - mn || 1;
      return yBot - ((v - mn) / span) * (yBot - yTop);
    };

    const fmt = (n: number) =>
      Math.abs(n) >= 100 ? Math.round(n).toString() : (Math.round(n * 10) / 10).toString();

    const tickCount = 4;
    const xTicks: { x: number; label: string }[] = [];
    for (let i = 1; i <= tickCount; i++) {
      const t = startT + (dt * i) / tickCount;
      const d = new Date(t);
      const hh = d.getHours();
      const label = `${hh === 0 ? 24 : hh}시`;
      xTicks.push({ x: xOf(t), label });
    }

    const gridY = [(yTop + yBot) / 2];

    // Compute Y-axis ticks per series (3-5 ticks each).
    const computeYTicks = (meta: { mn: number; mx: number; step: number }) => {
      const { mn, mx } = meta;
      let step = meta.step;
      // Aim for 3-5 ticks. Adjust step if needed.
      let count = Math.floor((mx - mn) / step) + 1;
      while (count > 6) { step *= 2; count = Math.floor((mx - mn) / step) + 1; }
      const ticks: number[] = [];
      for (let v = mn; v <= mx + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100);
      return ticks;
    };

    const labelOf = (idx: number): string => {
      const cfg = series[idx].cfg;
      if (cfg.label) return cfg.label;
      const ent = this._entity(cfg.entity);
      const fname = ent?.attributes?.friendly_name;
      if (typeof fname === 'string' && fname.length > 0) return fname;
      // Simple fallback based on domain/id
      return cfg.entity;
    };

    const leftMeta = seriesMeta[0];
    const leftColor = this._seriesColor(series[0].cfg, defaultColors[0]);
    const leftTicks = computeYTicks(leftMeta);
    const leftHeader = labelOf(0);

    let rightMeta: typeof leftMeta | undefined;
    let rightColor = '';
    let rightTicks: number[] = [];
    let rightHeader = '';
    if (series.length > 1) {
      rightMeta = seriesMeta[1];
      rightColor = this._seriesColor(series[1].cfg, defaultColors[1]);
      rightTicks = computeYTicks(rightMeta);
      rightHeader = labelOf(1);
    }

    const svgContent = svg`
      <defs>
        ${series.map(
          (s, i) => svg`
            <linearGradient id="cn-area-${i}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color=${this._seriesColor(s.cfg, defaultColors[i % defaultColors.length])} stop-opacity="0.22" />
              <stop offset="100%" stop-color=${this._seriesColor(s.cfg, defaultColors[i % defaultColors.length])} stop-opacity="0" />
            </linearGradient>
          `,
        )}
      </defs>
      ${gridY.map(
        (y) => svg`
          <line x1=${plotLeft} x2=${plotRight} y1=${y} y2=${y} stroke="currentColor" stroke-opacity="0.08" stroke-width="1" />
        `,
      )}
      ${xTicks.map(
        (t) => svg`
          <line x1=${t.x.toFixed(1)} x2=${t.x.toFixed(1)} y1=${yBot} y2=${yBot + 3} stroke="currentColor" stroke-opacity="0.25" stroke-width="1" />
        `,
      )}
      <text x=${LEFT_PAD - 4} y=${yTop - 10} fill=${leftColor} fill-opacity="0.9" font-size="12" font-weight="500" text-anchor="end" font-family="inherit">${leftHeader}</text>
      ${leftTicks.map((v) => {
        const y = yOf(v, 0);
        return svg`<text x=${LEFT_PAD - 4} y=${y.toFixed(1)} fill=${leftColor} fill-opacity="0.85" font-size="10" text-anchor="end" dominant-baseline="central" font-family="inherit" style="font-variant-numeric: tabular-nums;">${fmt(v)}</text>`;
      })}
      ${rightMeta
        ? svg`<text x=${W - RIGHT_PAD + 4} y=${yTop - 10} fill=${rightColor} fill-opacity="0.9" font-size="12" font-weight="500" text-anchor="start" font-family="inherit">${rightHeader}</text>`
        : nothing}
      ${rightMeta
        ? rightTicks.map((v) => {
            const y = yOf(v, 1);
            return svg`<text x=${W - RIGHT_PAD + 4} y=${y.toFixed(1)} fill=${rightColor} fill-opacity="0.85" font-size="10" text-anchor="start" dominant-baseline="central" font-family="inherit" style="font-variant-numeric: tabular-nums;">${fmt(v)}</text>`;
          })
        : nothing}
      ${series.map((s, i) => {
        const color = this._seriesColor(s.cfg, defaultColors[i % defaultColors.length]);
        const coords: [number, number][] = s.pts.map((p) => [xOf(p.t), yOf(p.v, i)]);
        const linePath = coords
          .map(([x, y], j) => `${j === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
          .join(' ');
        const first = coords[0];
        const last = coords[coords.length - 1];
        const areaPath = `${linePath} L ${last[0].toFixed(1)} ${yBot} L ${first[0].toFixed(1)} ${yBot} Z`;
        let peakIdx = 0, valIdx = 0;
        for (let k = 1; k < s.pts.length; k++) {
          if (s.pts[k].v > s.pts[peakIdx].v) peakIdx = k;
          if (s.pts[k].v < s.pts[valIdx].v) valIdx = k;
        }
        const [px, py] = coords[peakIdx];
        const [vx, vy] = coords[valIdx];
        return svg`
          <path d=${areaPath} fill="url(#cn-area-${i})" opacity="0.7" />
          <path d=${linePath} fill="none" stroke=${color} stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
          <circle cx=${px.toFixed(1)} cy=${py.toFixed(1)} r="2" fill=${color} />
          <text x=${px.toFixed(1)} y=${(py - 4).toFixed(1)} fill=${color} font-size="9" text-anchor="middle" font-family="inherit">${fmt(s.pts[peakIdx].v)}</text>
          <circle cx=${vx.toFixed(1)} cy=${vy.toFixed(1)} r="2" fill=${color} />
          <text x=${vx.toFixed(1)} y=${(vy + 9).toFixed(1)} fill=${color} font-size="9" text-anchor="middle" font-family="inherit">${fmt(s.pts[valIdx].v)}</text>
        `;
      })}
      ${xTicks.map(
        (t) => svg`
          <text x=${t.x.toFixed(1)} y=${yBot + 14} fill="currentColor" fill-opacity="0.9" font-size="10" text-anchor="middle" font-weight="500" font-family="inherit">${t.label}</text>
        `,
      )}
    `;
    return html`
      <div class="cn-chart">
        <svg viewBox="0 0 ${W} ${H + 20}" preserveAspectRatio="none" role="img" aria-label="chart">
          ${svgContent}
        </svg>
      </div>
    `;
  }

    protected override render(): TemplateResult | typeof nothing {
    if (!this._hasConfig || !this._config) return nothing;
    let cfg = this._config;
    if (cfg.discomfort_index_from && cfg.discomfort_index_from.length === 2) {
      const di = this._computeDiscomfortIndex(
        cfg.discomfort_index_from[0],
        cfg.discomfort_index_from[1],
      );
      if (di !== undefined) {
        const label =
          di < 68 ? '쾌적'
          : di < 75 ? '보통'
          : di < 80 ? '약간 불쾌'
          : '불쾌';
        const color =
          di < 68 ? 'green'
          : di < 75 ? 'blue'
          : di < 80 ? 'amber'
          : 'red';
        cfg = {
          ...cfg,
          status_text: `${label} · 불쾌지수 ${di}`,
          status_color: color,
          status_text_template: undefined,
          status_template: undefined,
        };
      }
    }
    const hero = this.renderHero(cfg);
    const body = html`
      ${this.renderMetricGrid()}
      ${this.renderChart()}
      ${this.renderList(cfg.list)}
    `;
    return this.renderCard(hero, body);
  }

  private _computeDiscomfortIndex(tempId: string, humidId: string): number | undefined {
    const t = this._entityNumber(tempId);
    const h = this._entityNumber(humidId);
    if (t === undefined || h === undefined) return undefined;
    const di = 1.8 * t - 0.55 * (1 - h / 100) * (1.8 * t - 26) + 32;
    return Math.round(di);
  }

  static override styles: CSSResultGroup = [
    HeroCardBase.styles as CSSResultGroup,
    css`
      .cn-metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1px;
        background: rgba(0, 0, 0, 0.06);
        margin: 0 0 0 0;
      }
      @media (prefers-color-scheme: dark) {
        .cn-metrics {
          background: rgba(255, 255, 255, 0.08);
        }
      }
      .cn-metric {
        background: var(--cn-bg-card);
        padding: 14px 18px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .cn-metric--clickable {
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .cn-metric--clickable:hover {
        background: rgba(0, 0, 0, 0.03);
      }
      @media (prefers-color-scheme: dark) {
        .cn-metric--clickable:hover {
          background: rgba(255, 255, 255, 0.04);
        }
      }
      .cn-metric__label {
        font-size: 14px;
        font-weight: 500;
        color: var(--cn-text-secondary);
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .cn-metric__accent {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 2px;
      }
      .cn-metric__row {
        display: flex;
        align-items: baseline;
        gap: 2px;
      }
      .cn-metric__value {
        font-size: 22px;
        font-weight: 700;
        color: var(--cn-text-primary);
        font-variant-numeric: tabular-nums;
        line-height: 1.15;
      }
      .cn-metric__unit {
        font-size: 13px;
        font-weight: 500;
        color: var(--cn-text-secondary);
        margin-left: 4px;
      }
      .cn-metric__trend {
        display: inline-flex;
        align-items: center;
        font-size: 13px;
        color: var(--cn-text-secondary);
        margin-left: 6px;
      }
      .cn-metric__trend--up {
        color: #f87171;
      }
      .cn-metric__trend--down {
        color: #34d399;
      }
      .cn-metric__trend--flat {
        color: var(--cn-text-secondary);
      }
      .cn-chart {
        width: 100%;
        height: 170px;
        padding: 12px 12px 6px;
        box-sizing: border-box;
        color: var(--cn-text-primary);
        font-family: inherit;
      }
      .cn-chart svg {
        width: 100%;
        height: 100%;
        display: block;
        font-family: inherit;
      }
      .cn-chart svg text {
        font-family: inherit;
      }
      .cn-chart--empty {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cn-text-secondary);
        font-size: 13px;
        font-weight: 500;
      }
      .cn-chart-legend {
        display: flex;
        gap: 12px;
        justify-content: center;
        font-size: 13px;
        color: var(--cn-text-secondary);
        margin-top: 2px;
      }
      .cn-chart-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .cn-chart-legend-swatch {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 2px;
      }
    `,
  ];
}

if (!customElements.get('cardnews-sensor-panel')) {
  customElements.define('cardnews-sensor-panel', CardNewsSensorPanel);
}
