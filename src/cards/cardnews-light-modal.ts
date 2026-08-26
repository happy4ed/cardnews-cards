import { LitElement, css, html, nothing, unsafeCSS, type CSSResultGroup, type TemplateResult } from 'lit';
import { property, state, customElement, query } from 'lit/decorators.js';
import type { HomeAssistant, HassEntity } from '../base/types.js';

const PRETENDARD_HREF =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';
const FONT_IMPORT = unsafeCSS(`@import url('${PRETENDARD_HREF}');`);
const FONT_STACK = `'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif`;

// ---------- utils ----------
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const hh = (h % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hh >= 0 && hh < 1) { r = c; g = x; }
  else if (hh < 2) { r = x; g = c; }
  else if (hh < 3) { g = c; b = x; }
  else if (hh < 4) { g = x; b = c; }
  else if (hh < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = v - c;
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToCss([r, g, b]: [number, number, number]): string {
  return `rgb(${r}, ${g}, ${b})`;
}

// Approximate color temperature (Kelvin) -> RGB. Tanner Helland approximation.
function kelvinToRgb(kelvin: number): [number, number, number] {
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100;
  let r: number, g: number, b: number;
  if (temp <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(temp) - 161.1195681661;
    if (temp <= 19) b = 0;
    else b = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    b = 255;
  }
  const clamp = (v: number) => Math.round(Math.max(0, Math.min(255, v)));
  return [clamp(r), clamp(g), clamp(b)];
}

type HistoryEntry =
  | { type: 'hs'; h: number; s: number }
  | { type: 'temp'; k: number };

// Presets: mostly color-temperature values (except "파티" which uses HS color).
type Preset =
  | { label: string; kind: 'temp'; k: number; brightness_pct: number }
  | { label: string; kind: 'hs'; hs: [number, number]; brightness_pct: number };

const PRESETS: Preset[] = [
  { label: '웜 화이트', kind: 'temp', k: 2700, brightness_pct: 80 },
  { label: '독서',     kind: 'temp', k: 4000, brightness_pct: 90 },
  { label: '영화',     kind: 'temp', k: 2200, brightness_pct: 20 },
  { label: '파티',     kind: 'hs',   hs: [320, 80], brightness_pct: 70 },
];

@customElement('cardnews-light-modal')
export class CardnewsLightModal extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ type: String }) public entity = '';
  @property({ attribute: false }) public entities?: string[];
  @property({ attribute: false }) public labels?: string[];
  @property({ type: String }) public deviceName = '';

  @state() private _closing = false;
  @state() private _activeScope = -1;
  @state() private _hue = 0;
  @state() private _sat = 100;
  @state() private _brightPct = 100;
  @state() private _kelvin = 3500;
  @state() private _dragging = false;
  @state() private _history: HistoryEntry[] = [];
  @state() private _activeSlider: string | null = null;
  @state() private _dragSliderValue: number | null = null;
  @state() private _initialized = false;
  /** Which control the user last touched — drives brightness fill gradient + brightness slider commit target. */
  @state() private _lastControl: 'color' | 'temp' = 'color';

  private _lastServiceCall = 0;
  private _pendingColor: { h: number; s: number } | null = null;
  private _pendingColorTimer: number | null = null;

  @query('.cn-wheel__canvas') private _wheelCanvas?: HTMLCanvasElement;

  private _keydownHandler = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') this._close();
  };

  private _hassPollTimer: number | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this._keydownHandler);
    document.body.style.overflow = 'hidden';
    this._loadHistory();
    // Poll HA hass every 400ms so modal reflects state changes even when parent doesn't push updates
    this._hassPollTimer = window.setInterval(() => {
      const gHass = (document.querySelector('home-assistant') as any)?.hass;
      if (!gHass) return;
      const prev = this.hass?.states[this.entity]?.state;
      const now = gHass.states?.[this.entity]?.state;
      if (this.hass !== gHass || prev !== now) {
        this.hass = gHass;
      }
    }, 400);
  }

  disconnectedCallback(): void {
    document.removeEventListener('keydown', this._keydownHandler);
    document.body.style.overflow = '';
    if (this._hassPollTimer) { window.clearInterval(this._hassPollTimer); this._hassPollTimer = null; }
    super.disconnectedCallback();
  }

  updated(changed: Map<string, unknown>): void {
    if (!this._initialized && this.hass) {
      const e = this._primaryEntity();
      if (e) {
        const attrs = e.attributes as Record<string, unknown>;
        const hs = attrs.hs_color as [number, number] | undefined;
        const b = Number(attrs.brightness);
        if (hs && Array.isArray(hs)) { this._hue = hs[0]; this._sat = hs[1]; }
        if (Number.isFinite(b)) this._brightPct = Math.round((b / 255) * 100);
        const k = Number(attrs.color_temp_kelvin);
        if (Number.isFinite(k)) this._kelvin = k;
        const cm = String(attrs.color_mode ?? '');
        // Seed _lastControl from current color_mode
        if (cm === 'color_temp') this._lastControl = 'temp';
        else if (cm === 'hs' || cm === 'xy' || cm === 'rgb' || cm === 'rgbw' || cm === 'rgbww') this._lastControl = 'color';
        else this._lastControl = this._supportsColor() ? 'color' : 'temp';
        this._initialized = true;
      }
    }
    if (changed.has('_hue') || changed.has('_sat') || (changed.has('hass') && !this._wheelCanvas)) {
      Promise.resolve().then(() => this._drawWheel());
    }
  }

  firstUpdated(): void {
    this._drawWheel();
  }

  // ---------- targets ----------

  private _allEntities(): string[] {
    if (this.entities && this.entities.length) return this.entities;
    if (this.entity) return [this.entity];
    return [];
  }

  private _targetEntities(): string[] {
    const all = this._allEntities();
    if (this._activeScope < 0) return all;
    if (this._activeScope >= 0 && this._activeScope < all.length) return [all[this._activeScope]];
    return all;
  }

  private _primaryEntity(): HassEntity | undefined {
    const all = this._allEntities();
    if (!all.length || !this.hass) return undefined;
    const idx = this._activeScope >= 0 && this._activeScope < all.length ? this._activeScope : 0;
    return this.hass.states[all[idx]];
  }

  private _scopeLabel(idx: number): string {
    if (this.labels && this.labels[idx]) return this.labels[idx];
    const all = this._allEntities();
    const id = all[idx];
    if (!id) return `#${idx + 1}`;
    const st = this.hass?.states[id];
    const fn = st?.attributes?.friendly_name;
    if (typeof fn === 'string' && fn) return fn;
    const parts = id.split('.');
    return parts[1] ?? id;
  }

  private _syncFromPrimary(): void {
    const e = this._primaryEntity();
    if (!e) return;
    const attrs = e.attributes as Record<string, unknown>;
    const hs = attrs.hs_color as [number, number] | undefined;
    const b = Number(attrs.brightness);
    if (hs && Array.isArray(hs)) { this._hue = hs[0]; this._sat = hs[1]; }
    if (Number.isFinite(b)) this._brightPct = Math.round((b / 255) * 100);
    const k = Number(attrs.color_temp_kelvin);
    if (Number.isFinite(k)) this._kelvin = k;
    const cm = String(attrs.color_mode ?? '');
    if (cm === 'color_temp') this._lastControl = 'temp';
    else if (cm === 'hs' || cm === 'xy' || cm === 'rgb' || cm === 'rgbw' || cm === 'rgbww') this._lastControl = 'color';
  }

  private _setScope(idx: number): void {
    if (this._activeScope === idx) return;
    this._activeScope = idx;
    this._syncFromPrimary();
  }

  private _supportsColor(): boolean {
    const e = this._primaryEntity();
    if (!e) return true;
    const modes = (e.attributes.supported_color_modes as string[] | undefined) ?? [];
    return modes.some((m) => ['hs', 'xy', 'rgb', 'rgbw', 'rgbww'].includes(m));
  }

  private _supportsColorTemp(): boolean {
    const e = this._primaryEntity();
    if (!e) return true;
    const modes = (e.attributes.supported_color_modes as string[] | undefined) ?? [];
    return modes.includes('color_temp');
  }

  private _minKelvin(): number {
    const e = this._primaryEntity();
    return Number(e?.attributes.min_color_temp_kelvin) || 2000;
  }
  private _maxKelvin(): number {
    const e = this._primaryEntity();
    return Number(e?.attributes.max_color_temp_kelvin) || 6500;
  }

  private _clampKelvin(k: number): number {
    const mn = this._minKelvin();
    const mx = this._maxKelvin();
    if (!Number.isFinite(k)) return Math.round((mn + mx) / 2);
    return Math.max(mn, Math.min(mx, k));
  }

  // ---------- history (localStorage) ----------

  private _historyKey(): string {
    const ids = this._targetEntities();
    return `cardnews.lightHistory.v2.${ids.join(',')}`;
  }

  private _loadHistory(): void {
    try {
      const raw = localStorage.getItem(this._historyKey());
      if (raw) {
        const arr = JSON.parse(raw) as HistoryEntry[];
        if (Array.isArray(arr)) {
          this._history = arr
            .filter((e) => e && ((e.type === 'hs' && Number.isFinite((e as any).h)) || (e.type === 'temp' && Number.isFinite((e as any).k))))
            .slice(0, 10);
        }
      }
    } catch {}
  }

  private _pushHistoryHs(h: number, s: number): void {
    const rh = Math.round(h);
    const rs = Math.round(s);
    const filtered = this._history.filter((e) => !(e.type === 'hs' && Math.round(e.h) === rh && Math.round(e.s) === rs));
    const entry: HistoryEntry = { type: 'hs', h: rh, s: rs };
    this._history = [entry, ...filtered].slice(0, 10);
  }

  private _pushHistoryTemp(k: number): void {
    const rk = Math.round(k / 50) * 50;
    const filtered = this._history.filter((e) => !(e.type === 'temp' && Math.round(e.k / 50) * 50 === rk));
    const entry: HistoryEntry = { type: 'temp', k: rk };
    this._history = [entry, ...filtered].slice(0, 10);
  }

  private _saveHistory(): void {
    try { localStorage.setItem(this._historyKey(), JSON.stringify(this._history)); } catch {}
  }

  // ---------- service calls ----------

  private _callLight(data: Record<string, unknown>): void {
    if (!this.hass) return;
    const ids = this._targetEntities();
    if (!ids.length) return;
    this.hass.callService('light', 'turn_on', { entity_id: ids, ...data });
  }

  private _applyColorDebounced(h: number, s: number): void {
    this._pendingColor = { h, s };
    const now = performance.now();
    if (now - this._lastServiceCall > 200) {
      this._flushColor();
    } else if (!this._pendingColorTimer) {
      this._pendingColorTimer = window.setTimeout(() => this._flushColor(), 200);
    }
  }

  private _flushColor(): void {
    if (!this._pendingColor) return;
    const { h, s } = this._pendingColor;
    this._pendingColor = null;
    if (this._pendingColorTimer) { window.clearTimeout(this._pendingColorTimer); this._pendingColorTimer = null; }
    this._lastServiceCall = performance.now();
    this._callLight({ hs_color: [h, s] });
  }

  private _commitColor(h: number, s: number): void {
    this._hue = h;
    this._sat = s;
    this._lastControl = 'color';
    if (this._pendingColorTimer) { window.clearTimeout(this._pendingColorTimer); this._pendingColorTimer = null; }
    this._pendingColor = null;
    this._lastServiceCall = performance.now();
    this._callLight({ hs_color: [h, s] });
  }

  private _commitTemp(k: number): void {
    const kk = this._clampKelvin(k);
    this._kelvin = kk;
    this._lastControl = 'temp';
    this._callLight({ color_temp_kelvin: kk });
  }

  // ---------- close ----------

  private _close(): void {
    if (this._closing) return;
    // Save last-modified value to history
    if (this._lastControl === 'color' && Number.isFinite(this._hue) && Number.isFinite(this._sat) && this._sat > 5) {
      this._pushHistoryHs(this._hue, this._sat);
    } else if (this._lastControl === 'temp' && Number.isFinite(this._kelvin)) {
      this._pushHistoryTemp(this._kelvin);
    }
    this._saveHistory();
    this._closing = true;
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
      if (this.parentElement) this.parentElement.removeChild(this);
    }, 180);
  }

  private _onBackdrop(ev: MouseEvent): void {
    if ((ev.target as HTMLElement).classList.contains('cn-modal__backdrop')) this._close();
  }

  // ---------- color wheel ----------

  private _drawWheel(): void {
    const canvas = this._wheelCanvas;
    if (!canvas) return;
    const size = canvas.width;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 2;
    const img = ctx.createImageData(size, size);
    const d = img.data;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const i = (y * size + x) * 4;
        if (dist > radius) {
          d[i + 3] = 0;
          continue;
        }
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        const s = Math.min(1, dist / radius);
        const [r, g, bl] = hsvToRgb(angle, s, 1);
        d[i] = r; d[i + 1] = g; d[i + 2] = bl;
        const edge = radius - dist;
        d[i + 3] = edge < 1 ? Math.round(255 * edge) : 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  private _wheelPointerDown(ev: PointerEvent): void {
    ev.preventDefault();
    const el = ev.currentTarget as HTMLElement;
    el.setPointerCapture(ev.pointerId);
    this._dragging = true;
    const handle = (e: PointerEvent) => this._handleWheelEvent(e, el, false);
    const up = (e: PointerEvent) => {
      this._handleWheelEvent(e, el, true);
      this._dragging = false;
      el.releasePointerCapture(ev.pointerId);
      el.removeEventListener('pointermove', handle);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
    el.addEventListener('pointermove', handle);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    this._handleWheelEvent(ev, el, false);
  }

  private _handleWheelEvent(ev: PointerEvent, el: HTMLElement, commit: boolean): void {
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = ev.clientX - rect.left - cx;
    const y = ev.clientY - rect.top - cy;
    const dist = Math.sqrt(x * x + y * y);
    const r = Math.min(rect.width, rect.height) / 2 - 2;
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    const s = Math.max(0, Math.min(1, dist / r)) * 100;
    this._hue = angle;
    this._sat = s;
    this._lastControl = 'color';
    if (commit) {
      this._commitColor(angle, s);
    } else {
      this._applyColorDebounced(angle, s);
    }
  }

  // ---------- slider ----------

  private _sliderPointerDown(
    id: string, ev: PointerEvent, min: number, max: number, step: number,
    onLive: (v: number) => void,
    onCommit: (v: number) => void,
  ): void {
    ev.preventDefault();
    const track = ev.currentTarget as HTMLElement;
    track.setPointerCapture(ev.pointerId);
    this._activeSlider = id;

    const compute = (clientX: number): number => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      const snapped = Math.round(raw / step) * step;
      return Math.max(min, Math.min(max, snapped));
    };

    const move = (e: PointerEvent) => {
      const v = compute(e.clientX);
      this._dragSliderValue = v;
      onLive(v);
    };
    const up = (e: PointerEvent) => {
      const v = compute(e.clientX);
      this._dragSliderValue = null;
      this._activeSlider = null;
      track.releasePointerCapture(ev.pointerId);
      track.removeEventListener('pointermove', move);
      track.removeEventListener('pointerup', up);
      track.removeEventListener('pointercancel', up);
      onCommit(v);
    };
    track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);
    const initial = compute(ev.clientX);
    this._dragSliderValue = initial;
    onLive(initial);
  }

  private _brightFillGradient(): string {
    if (this._lastControl === 'temp') {
      const [r, g, b] = kelvinToRgb(this._kelvin);
      const dark = `rgb(${Math.round(r * 0.40)}, ${Math.round(g * 0.40)}, ${Math.round(b * 0.40)})`;
      const bright = `rgb(${r}, ${g}, ${b})`;
      return `linear-gradient(90deg, ${dark} 0%, ${bright} 100%)`;
    }
    const h = Math.round(this._hue);
    const s = Math.round(this._sat);
    return `linear-gradient(90deg, hsl(${h}, ${s}%, 22%) 0%, hsl(${h}, ${s}%, 55%) 100%)`;
  }

  private _renderBrightnessSlider(): TemplateResult {
    const val = this._activeSlider === 'brightness' && this._dragSliderValue !== null
      ? this._dragSliderValue : this._brightPct;
    const pct = val;
    const grad = this._brightFillGradient();
    return html`
      <div class="cn-section">
        <div class="cn-section__label">
          <span>밝기</span>
          <span class="cn-section__hint">${Math.round(val)}%</span>
        </div>
        <div class="cn-slider cn-slider--bright" style="--pct:${pct}%; --bright-grad:${grad}">
          <div class="cn-slider__track cn-slider__track--bright"
               @pointerdown=${(ev: PointerEvent) => this._sliderPointerDown(
                 'brightness', ev, 1, 100, 1,
                 (v) => { this._brightPct = v; },
                 (v) => {
                    this._brightPct = v;
                    if (this._lastControl === 'temp') {
                      this._callLight({ brightness_pct: v, color_temp_kelvin: this._clampKelvin(this._kelvin) });
                    } else {
                      this._callLight({ brightness_pct: v, hs_color: [this._hue, this._sat] });
                    }
                 },
               )}>
          </div>
          <div class="cn-slider__thumb" style="left:calc((100% - 32px) * ${pct} / 100 + 16px)"></div>
        </div>
      </div>
    `;
  }

  private _renderColorTempSlider(): TemplateResult | typeof nothing {
    if (!this._supportsColorTemp()) return nothing;
    const min = this._minKelvin();
    const max = this._maxKelvin();
    const val = this._activeSlider === 'ct' && this._dragSliderValue !== null
      ? this._dragSliderValue : this._clampKelvin(this._kelvin);
    const pct = ((val - min) / (max - min)) * 100;
    return html`
      <div class="cn-section">
        <div class="cn-section__label">
          <span>색온도</span>
          <span class="cn-section__hint">${Math.round(val)}K</span>
        </div>
        <div class="cn-slider cn-slider--ct" style="--pct:${pct}%">
          <div class="cn-slider__track cn-slider__track--ct"
               @pointerdown=${(ev: PointerEvent) => this._sliderPointerDown(
                 'ct', ev, min, max, 50,
                 (v) => { this._kelvin = v; this._lastControl = 'temp'; },
                 (v) => { this._commitTemp(v); },
               )}>
          </div>
          <div class="cn-slider__thumb" style="left:calc((100% - 32px) * ${pct} / 100 + 16px)"></div>
        </div>
        ${this._renderPresetChips()}
      </div>
    `;
  }

  private _renderPresetChips(): TemplateResult {
    return html`
      <div class="cn-presets-chips">
        ${PRESETS.map((p) => {
          let bg: string;
          if (p.kind === 'temp') {
            const [r, g, b] = kelvinToRgb(p.k);
            bg = rgbToCss([r, g, b]);
          } else {
            const [r, g, b] = hsvToRgb(p.hs[0], p.hs[1] / 100, 1);
            bg = rgbToCss([r, g, b]);
          }
          return html`
            <button class="cn-chip" style="--pcol:${bg}"
                    @click=${() => this._applyPreset(p)}>
              <span class="cn-chip__dot"></span>
              <span class="cn-chip__lbl">${p.label}</span>
            </button>
          `;
        })}
      </div>
    `;
  }

  private _applyPreset(p: Preset): void {
    this._brightPct = p.brightness_pct;
    if (p.kind === 'temp') {
      const k = this._clampKelvin(p.k);
      this._kelvin = k;
      this._lastControl = 'temp';
      this._callLight({ color_temp_kelvin: k, brightness_pct: p.brightness_pct });
      this._pushHistoryTemp(k);
    } else {
      this._hue = p.hs[0]; this._sat = p.hs[1];
      this._lastControl = 'color';
      this._callLight({ hs_color: p.hs, brightness_pct: p.brightness_pct });
      this._pushHistoryHs(p.hs[0], p.hs[1]);
    }
  }

  private _renderHistory(): TemplateResult | typeof nothing {
    if (!this._history.length) return nothing;
    return html`
      <div class="cn-section">
        <div class="cn-section__label"><span>최근 사용</span></div>
        <div class="cn-history">
          ${this._history.map((e) => {
            if (e.type === 'hs') {
              const [r, g, b] = hsvToRgb(e.h, e.s / 100, 1);
              return html`
                <button class="cn-swatch cn-swatch--hs" style="background:${rgbToCss([r, g, b])}"
                        title="H${Math.round(e.h)}° S${Math.round(e.s)}%"
                        @click=${() => this._commitColor(e.h, e.s)}>
                </button>
              `;
            } else {
              const [r, g, b] = kelvinToRgb(e.k);
              return html`
                <button class="cn-swatch cn-swatch--temp" style="background:${rgbToCss([r, g, b])}"
                        title="${Math.round(e.k)}K"
                        @click=${() => this._commitTemp(e.k)}>
                  <span class="cn-swatch__k">K</span>
                </button>
              `;
            }
          })}
        </div>
      </div>
    `;
  }

  private _renderScopeSegment(): TemplateResult | typeof nothing {
    const all = this._allEntities();
    if (all.length < 2) return nothing;
    const scopes: { idx: number; label: string }[] = [
      { idx: -1, label: '전체' },
      ...all.map((_, i) => ({ idx: i, label: this._scopeLabel(i) })),
    ];
    return html`
      <div class="cn-scope">
        ${scopes.map((sc) => html`
          <button
            class="cn-scope__chip ${this._activeScope === sc.idx ? 'cn-scope__chip--active' : ''}"
            @click=${() => this._setScope(sc.idx)}
          >${sc.label}</button>
        `)}
      </div>
    `;
  }

  render(): TemplateResult {
    const title = this.deviceName || '조명';
    const supportsColor = this._supportsColor();
    const supportsTemp = this._supportsColorTemp();
    const e = this._primaryEntity();
    const isOn = !!e && e.state === 'on';
    const activeCss = this._lastControl === 'temp'
      ? rgbToCss(kelvinToRgb(this._kelvin))
      : rgbToCss(hsvToRgb(this._hue, this._sat / 100, 1));
    const previewCss = isOn ? activeCss : 'rgba(120,120,120,0.5)';
    const isUnavailable = !!e && e.state === 'unavailable';

    return html`
      <div class="cn-modal__backdrop ${this._closing ? 'cn-modal__backdrop--closing' : ''}" @click=${this._onBackdrop}>
        <div class="cn-modal ${this._closing ? 'cn-modal--closing' : ''} ${isOn ? '' : 'cn-modal--off'}" role="dialog" aria-modal="true" aria-label=${title}>
          <div class="cn-modal__head">
            <div class="cn-modal__title">
              <span class="cn-modal__preview" style="background:${previewCss}"></span>
              <span>${title}</span>
              ${isUnavailable ? html`<span class="cn-modal__badge">unavailable</span>` : nothing}
            </div>
            <div class="cn-modal__head-right">
              <button class="cn-modal__power ${isOn ? 'cn-modal__power--on' : ''}"
                      @click=${() => {
                        if (isOn) {
                          this.hass?.callService('light', 'turn_off', { entity_id: this._targetEntities() });
                        } else {
                          const payload: Record<string, unknown> = {};
                          if (this._brightPct > 0) payload.brightness_pct = this._brightPct;
                          if (this._lastControl === 'temp' && this._supportsColorTemp()) {
                            payload.color_temp_kelvin = this._clampKelvin(this._kelvin);
                          } else if (this._supportsColor() && Number.isFinite(this._hue) && Number.isFinite(this._sat)) {
                            payload.hs_color = [this._hue, this._sat];
                          }
                          this._callLight(payload);
                        }
                      }}
                      title="전원">
                <ha-icon .icon=${'mdi:power'} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
              </button>
              <button class="cn-modal__close" @click=${() => this._close()} aria-label="닫기">
                <ha-icon .icon=${'mdi:close'} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
              </button>
            </div>
          </div>
          <div class="cn-modal__body">
            ${this._renderScopeSegment()}
            ${supportsColor ? html`
              <div class="cn-section cn-section--wheel">
                <div class="cn-wheel-wrap">
                  <canvas class="cn-wheel__canvas" width="240" height="240"
                          @pointerdown=${(ev: PointerEvent) => this._wheelPointerDown(ev)}></canvas>
                  <div class="cn-wheel__pointer"
                       style="left:${50 + Math.cos(this._hue * Math.PI / 180) * (this._sat / 2)}%;
                              top:${50 + Math.sin(this._hue * Math.PI / 180) * (this._sat / 2)}%;
                              background:${rgbToCss(hsvToRgb(this._hue, this._sat / 100, 1))}"></div>
                </div>
              </div>
            ` : nothing}
            ${supportsTemp ? this._renderColorTempSlider() : nothing}
            ${this._renderBrightnessSlider()}
            ${this._renderHistory()}
          </div>
        </div>
      </div>
    `;
  }

  static styles: CSSResultGroup = css`
    ${FONT_IMPORT}
    :host {
      position: fixed;
      inset: 0;
      z-index: 999999;
      font-family: ${unsafeCSS(FONT_STACK)};
      -webkit-font-smoothing: antialiased;
      --cn-accent: #22d3ee;
      --cn-text: #f4f6fb;
      --cn-text-dim: rgba(244, 246, 251, 0.62);
      --cn-text-muted: rgba(244, 246, 251, 0.42);
      --cn-border: rgba(255, 255, 255, 0.10);
      --cn-border-strong: rgba(255, 255, 255, 0.18);
      --cn-surface-1: rgba(255, 255, 255, 0.06);
      --cn-surface-hover: rgba(255, 255, 255, 0.14);
    }
    @keyframes cn-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes cn-fade-out { from { opacity: 1; } to { opacity: 0; } }
    @keyframes cn-scale-in {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes cn-scale-out {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to { opacity: 0; transform: translateY(8px) scale(0.98); }
    }

    .cn-modal__backdrop {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: radial-gradient(80% 60% at 50% 40%, rgba(20,22,28,0.55), rgba(0,0,0,0.75));
      backdrop-filter: blur(14px) saturate(140%);
      -webkit-backdrop-filter: blur(14px) saturate(140%);
      animation: cn-fade-in 180ms ease;
    }
    .cn-modal__backdrop--closing { animation: cn-fade-out 180ms ease forwards; }

    .cn-modal {
      position: relative;
      width: min(380px, 100%);
      max-height: min(90vh, 820px);
      overflow: hidden;
      border-radius: 24px;
      color: var(--cn-text);
      background: linear-gradient(180deg, rgba(30, 32, 40, 0.92) 0%, rgba(18, 20, 26, 0.94) 100%);
      border: 1px solid var(--cn-border-strong);
      box-shadow:
        0 40px 100px rgba(0,0,0,0.55),
        0 6px 20px rgba(0,0,0,0.35),
        inset 0 1px 0 rgba(255,255,255,0.08);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      animation: cn-scale-in 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
    }
    .cn-modal--closing { animation: cn-scale-out 180ms ease forwards; }

    .cn-modal__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 18px 12px;
      border-bottom: 1px solid var(--cn-border);
      gap: 10px;
    }
    .cn-modal__title {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .cn-modal--off .cn-modal__body { filter: grayscale(0.6) brightness(0.7); opacity: 0.75; transition: filter 0.2s ease, opacity 0.2s ease; }
    .cn-modal__body { transition: filter 0.2s ease, opacity 0.2s ease; }
    .cn-modal__preview {
      display: inline-block;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.35);
      box-shadow: inset 0 1px 2px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.4);
    }
    .cn-modal__badge {
      font-size: 13px;
      padding: 2px 6px;
      border-radius: 6px;
      background: rgba(248,113,113,0.18);
      color: #fca5a5;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .cn-modal__head-right { display: inline-flex; gap: 6px; align-items: center; }
    .cn-modal__close, .cn-modal__power {
      width: 32px; height: 32px;
      border-radius: 10px;
      border: 1px solid var(--cn-border);
      background: var(--cn-surface-1);
      color: var(--cn-text-dim);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s, transform 0.1s;
    }
    .cn-modal__close:hover, .cn-modal__power:hover { background: var(--cn-surface-hover); color: var(--cn-text); }
    .cn-modal__power--on { color: #34d399; border-color: rgba(52, 211, 153, 0.5); }
    .cn-modal__body {
      padding: 16px 18px 22px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    ha-icon { display: inline-flex; align-items: center; justify-content: center; color: inherit; }

    .cn-section { display: flex; flex-direction: column; gap: 10px; }
    .cn-section__label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.10em;
      text-transform: uppercase;
      color: var(--cn-text-dim);
      padding: 0 2px;
    }
    .cn-section__hint {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: -0.01em;
      text-transform: none;
      color: var(--cn-text);
      font-variant-numeric: tabular-nums;
    }

    /* ---- Color wheel ---- */
    .cn-section--wheel { align-items: center; }
    .cn-wheel-wrap {
      position: relative;
      width: 240px;
      height: 240px;
      touch-action: none;
      filter: drop-shadow(0 6px 18px rgba(0,0,0,0.45));
    }
    .cn-wheel__canvas {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      cursor: crosshair;
      display: block;
    }
    .cn-wheel__pointer {
      position: absolute;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      border: 3px solid rgba(255,255,255,0.95);
      box-shadow: 0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.5);
      pointer-events: none;
    }

    /* ---- Slider (brightness / color temp) ---- */
    /* IMPORTANT: thumb is a sibling of track (both inside .cn-slider), not inside track,
       so the track can safely keep overflow:hidden for its rounded pill fill without
       clipping the thumb at pct=0 or pct=100. Thumb position is computed as
       calc((100% - 32px) * pct/100 + 16px) so the thumb's 32px width always fits
       within the slider bounds without any translate hack pulling it outside. */
    .cn-slider {
      position: relative;
      outline: none; user-select: none; -webkit-tap-highlight-color: transparent;
      padding: 4px 0;
      touch-action: none;
      box-sizing: border-box;
      width: 100%;
    }
    .cn-slider__track {
      outline: none; user-select: none; -webkit-tap-highlight-color: transparent;
      position: relative;
      height: 44px;
      border-radius: 22px;
      background:
        linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.16) 100%);
      border: none;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      cursor: pointer;
      overflow: visible;
    }
    .cn-slider__track--bright {
      background: var(--bright-grad, linear-gradient(90deg, #333 0%, #eee 100%)) !important;
    }
    /* Color-temp track: full-width gradient across kelvin range */
    .cn-slider__track--ct {
      background:
        linear-gradient(90deg, #ff9a4b 0%, #ffdba0 25%, #ffffff 55%, #a8d5ff 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 55%, rgba(255,255,255,0.14) 100%) border-box;
    }
    .cn-slider__thumb {
      position: absolute;
      /* vertical center of the .cn-slider (which has 4px top/bottom padding + 44px track = 52px) */
      top: 50%;
      /* left is set inline via calc((100% - 32px) * pct/100 + 16px) — thumb width = 32px */
      width: 32px;
      height: 32px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background:
        radial-gradient(65% 65% at 32% 28%,
          rgba(255,255,255,0.98) 0%,
          rgba(255,255,255,0.75) 45%,
          rgba(255,255,255,0.5) 100%);
      border: 1px solid rgba(255,255,255,0.85);
      backdrop-filter: blur(10px) saturate(160%);
      -webkit-backdrop-filter: blur(10px) saturate(160%);
      box-shadow:
        0 4px 10px rgba(0,0,0,0.35),
        0 1px 2px rgba(0,0,0,0.18),
        inset 0 1.5px 0 rgba(255,255,255,0.95),
        inset 0 -1.5px 2px rgba(0,0,0,0.15);
      pointer-events: none;
      transition: left 120ms ease;
    }
    .cn-slider__thumb::before {
      content: '';
      position: absolute;
      top: 3px;
      left: 6px;
      right: 6px;
      height: 35%;
      border-radius: 50% 50% 40% 40% / 60% 60% 30% 30%;
      background: linear-gradient(to bottom,
        rgba(255,255,255,0.8) 0%,
        rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }

    /* ---- Preset chips (below color-temp slider) ---- */
    .cn-presets-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 2px 0 0;
    }
    .cn-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 30px;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid var(--cn-border);
      background: var(--cn-surface-1);
      color: var(--cn-text);
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.01em;
      cursor: pointer;
      transition: background 0.15s, transform 0.12s;
    }
    .cn-chip:hover { background: var(--cn-surface-hover); }
    .cn-chip:active { transform: scale(0.96); }
    .cn-chip__dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--pcol, #fff);
      box-shadow: inset 0 1px 2px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.4);
      flex-shrink: 0;
    }
    .cn-chip__lbl { flex: 1; text-align: left; white-space: nowrap; }

    /* ---- History swatches ---- */
    .cn-history {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .cn-swatch {
      position: relative;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.14);
      cursor: pointer;
      padding: 0;
      box-shadow: inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.35);
      transition: transform 0.12s, border-color 0.15s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .cn-swatch:hover { transform: scale(1.08); border-color: rgba(255,255,255,0.4); }
    .cn-swatch:active { transform: scale(0.94); }
    .cn-swatch--temp {
      border-color: rgba(255,255,255,0.28);
    }
    .cn-swatch__k {
      font-family: inherit;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.02em;
      color: rgba(20,22,28,0.72);
      text-shadow: 0 1px 0 rgba(255,255,255,0.55);
      pointer-events: none;
    }

    /* ---- Scope segment (group vs individual light) ---- */
    .cn-scope {
      display: flex;
      gap: 6px;
      padding: 4px;
      background: rgba(0,0,0,0.24);
      border: 1px solid var(--cn-border);
      border-radius: 14px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .cn-scope::-webkit-scrollbar { display: none; }
    .cn-scope__chip {
      flex: 1 0 auto;
      min-height: 32px;
      padding: 0 14px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--cn-text-dim);
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.01em;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, transform 0.1s;
      white-space: nowrap;
    }
    .cn-scope__chip:hover { color: var(--cn-text); background: rgba(255,255,255,0.06); }
    .cn-scope__chip:active { transform: scale(0.96); }
    .cn-scope__chip--active {
      background: linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 100%);
      color: var(--cn-text);
      box-shadow: 0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14);
    }

    @media (max-width: 480px) {
      .cn-modal { border-radius: 22px; max-height: 94vh; }
      .cn-wheel-wrap { width: 220px; height: 220px; }
      .cn-wheel__canvas { width: 220px; height: 220px; }
    }
  `;
}

/** Open the light modal, mounted at document.body. */
export function openLightModal(opts: {
  hass: HomeAssistant;
  entity?: string;
  entities?: string[];
  labels?: string[];
  deviceName?: string;
}): { close: () => void } {
  const el = document.createElement('cardnews-light-modal') as CardnewsLightModal;
  el.hass = opts.hass;
  if (opts.entity) el.entity = opts.entity;
  if (opts.entities) el.entities = opts.entities;
  if (opts.labels) el.labels = opts.labels;
  el.deviceName = opts.deviceName ?? '';
  document.body.appendChild(el);
  return {
    close: () => {
      if (el.parentElement) el.parentElement.removeChild(el);
    },
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'cardnews-light-modal': CardnewsLightModal;
  }
}
