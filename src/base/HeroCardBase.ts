import { LitElement, css, html, nothing, unsafeCSS, type CSSResultGroup, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import type {
  HomeAssistant,
  HeroConfig,
  HeroAction,
  ListItem,
  ValueRow,
  SwitchRow,
  SliderRow,
  BarRow,
  SelectRow,
  BallsRow,
  ForecastRow,
  LightRow,
  CalendarEventsRow,
  VolumeRow,
  StatusColor,
  HassEntity,
} from './types.js';
import { evaluateTemplate } from './templateEngine.js';
import { openRemoteModal, type CardnewsRemoteModal } from '../cards/cardnews-remote-modal.js';
import { openTvRemoteModal, type CardnewsTvRemoteModal } from '../cards/cardnews-tv-remote-modal.js';
import { openLightModal, type CardnewsLightModal } from '../cards/cardnews-light-modal.js';
import { openCalendarEventModal, type CardnewsEventModal } from '../cards/cardnews-event-modal.js';

/**
 * HeroCardBase — LitElement base class shared by all CardNews cards.
 *
 * v0.6 — TOD (time-of-day) hero image resolver + crossfade.
 * v0.8 — light glow overlay + `room:` auto-hero-image config.
 *
 *   `hero_image` accepts:
 *     - Full URL/path (starts with `/` or `http`): used as-is
 *     - Base name (e.g. `hero-livingroom`): auto-resolved to
 *       `/local/cardnews/heroes/{base}-{tod}.png` where tod =
 *       dawn|morning|afternoon|evening|night.
 *   `room` (v0.8): when set and no hero_image, resolves to
 *     `/local/cardnews/heroes/hero-{room}-{tod}.png`.
 *   `glow_entities` (v0.8): list of light/switch entity_ids; when any is on,
 *     a warm radial gradient overlays the hero to simulate lights on.
 */

// Pretendard font — inject once into document head to guarantee availability.
const PRETENDARD_HREF =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';
function ensurePretendardLoaded(): void {
  if (typeof document === 'undefined') return;
  const id = 'cn-pretendard-font';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = PRETENDARD_HREF;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}
ensurePretendardLoaded();

const FONT_IMPORT = unsafeCSS(`@import url('${PRETENDARD_HREF}');`);
const FONT_STACK = `'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif`;

export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Compute the current TOD bucket. Prefers sun.sun state/attributes when
 * available (smoother, geo-aware), falls back to the current wall-clock hour.
 */
export function computeTod(hass?: HomeAssistant, now: Date = new Date()): TimeOfDay {
  const hour = now.getHours() + now.getMinutes() / 60;

  const sun = hass?.states?.['sun.sun'];
  if (sun) {
    const attrs = sun.attributes as Record<string, unknown>;
    const nextDawn = attrs['next_dawn'] ? new Date(String(attrs['next_dawn'])) : undefined;
    const nextDusk = attrs['next_dusk'] ? new Date(String(attrs['next_dusk'])) : undefined;
    const above = sun.state === 'above_horizon';
    if (nextDawn && !above) {
      const diffMin = (nextDawn.getTime() - now.getTime()) / 60000;
      if (diffMin >= 0 && diffMin <= 30) return 'dawn';
    }
    if (nextDusk && above) {
      const diffMin = (nextDusk.getTime() - now.getTime()) / 60000;
      if (diffMin >= 0 && diffMin <= 60) return 'evening';
    }
    if (above) {
      if (hour < 11) return 'morning';
      if (hour < 17) return 'afternoon';
      return 'evening';
    }
    if (hour >= 5 && hour < 7) return 'dawn';
    return 'night';
  }

  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

const TOD_BASE_PATH = '/local/cardnews/heroes';

interface CalendarEvent {
  entity_id: string;
  summary?: string;
  description?: string;
  start: string;      // ISO or "YYYY-MM-DD"
  end?: string;
  location?: string;
  allDay?: boolean;
}

const CAL_REFRESH_MS = 5 * 60 * 1000;
const CAL_PALETTE = ['#22d3ee', '#f472b6', '#fbbf24', '#a3e635', '#c084fc', '#fb7185', '#60a5fa', '#f97316'];

export abstract class HeroCardBase extends LitElement {
  @state() protected _openSelects: Record<string, boolean> = {};
  @state() private _calendarEvents: Record<string, CalendarEvent[]> = {};
  private _calendarLastFetch: Record<string, number> = {};
  private _calendarInflight: Record<string, boolean> = {};
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() protected _configError?: string;

  // ---------- HA native template subscription (v0.10) ----------
  // Replaces the local mini-Jinja engine. Each unique template string opens
  // one websocket subscription; results are cached and trigger requestUpdate
  // on change. `evaluateTemplate` is kept as a synchronous fallback only for
  // the first render (before the first result arrives) and for hass-less test
  // contexts.
  private _tmplCache: Map<string, string> = new Map();
  private _tmplUnsubs: Map<string, () => Promise<void>> = new Map();
  private _tmplPending: Set<string> = new Set();

  protected _renderTemplate(template: string): string {
    if (!template) return '';
    const cached = this._tmplCache.get(template);
    // No hass connection yet — fall back to sync mini-engine so first paint
    // is not blank.
    const conn = this.hass?.connection;
    if (!conn || typeof conn.subscribeMessage !== 'function') {
      return cached ?? evaluateTemplate(template, this.hass);
    }
    if (!this._tmplUnsubs.has(template) && !this._tmplPending.has(template)) {
      this._tmplPending.add(template);
      conn
        .subscribeMessage<{ result: string }>(
          (msg) => {
            const next = msg?.result ?? '';
            const prev = this._tmplCache.get(template);
            if (next !== prev) {
              this._tmplCache.set(template, next);
              this.requestUpdate();
            }
          },
          { type: 'render_template', template },
        )
        .then((unsub) => {
          this._tmplPending.delete(template);
          this._tmplUnsubs.set(template, unsub);
        })
        .catch(() => {
          // subscription failed — leave cache empty, mini-engine fallback used.
          this._tmplPending.delete(template);
        });
    }
    // Return cached if we already have a value; otherwise sync-fallback.
    return cached ?? evaluateTemplate(template, this.hass);
  }


  // Cross-fade state
  private _openRemoteModals = new Map<string, { el: CardnewsRemoteModal; close: () => void }>();
  private _openTvRemoteModals = new Map<string, { el: CardnewsTvRemoteModal; close: () => void }>();
  private _openLightModals = new Map<string, { el: CardnewsLightModal; close: () => void }>();
  private _openEventModals = new Map<string, { el: CardnewsEventModal; close: () => void }>();
  private _calendarScrolled: Record<string, boolean> = {};
  private _calendarRowHeight = 62;

  @state() private _heroImgA?: string;
  @state() private _heroImgB?: string;
  @state() private _heroActive: 'a' | 'b' = 'a';
  private _lastResolvedHero?: string;
  private _todTimer?: number;

  public setConfig(_config: unknown): void {
    this._configError = undefined;
  }

  public getCardSize(): number {
    return 6;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (typeof window !== 'undefined') {
      this._todTimer = window.setInterval(() => this.requestUpdate(), 5 * 60 * 1000);
    }
  }

  public disconnectedCallback(): void {
    if (this._todTimer) {
      clearInterval(this._todTimer);
      this._todTimer = undefined;
    }
    for (const unsub of this._tmplUnsubs.values()) {
      try { unsub(); } catch { /* ignore */ }
    }
    this._tmplUnsubs.clear();
    this._tmplCache.clear();
    this._tmplPending.clear();
    super.disconnectedCallback();
  }

  public willUpdate(changedProps: Map<string, unknown>): void {
    if (changedProps.has('hass') && this.hass) {
      if (this._openRemoteModals.size) {
        for (const [, entry] of this._openRemoteModals) entry.el.hass = this.hass;
      }
      if (this._openLightModals.size) {
        for (const [, entry] of this._openLightModals) entry.el.hass = this.hass;
      }
      if (this._openTvRemoteModals.size) {
        for (const [, entry] of this._openTvRemoteModals) entry.el.hass = this.hass;
      }
    }
  }

  // ---------- helpers ----------

  protected _entity(id?: string): HassEntity | undefined {
    if (!id || !this.hass) return undefined;
    return this.hass.states[id];
  }

  protected _entityState(id?: string, fallback = '—'): string {
    const e = this._entity(id);
    if (!e) return fallback;
    return e.state;
  }

  protected _entityFriendly(id?: string): string | undefined {
    const e = this._entity(id);
    return e?.attributes.friendly_name ?? id;
  }

  /**
   * Unified icon color policy (v0.11):
   *   - default = gray
   *   - on/off style domains → cyan when active
   *   - sensor numeric values → threshold-based color by device_class/unit
   *   - person/device_tracker → cyan when home
   *   - power/energy → gray (informational)
   * The `override` param is intentionally ignored — ad-hoc colors are
   * disallowed by policy.
   */
  protected _iconColor(entityId?: string, state?: string, _override?: string): string {
    const GRAY = '#9ca3af';
    const CYAN = '#22d3ee';
    if (!entityId) return GRAY;
    const [domain, ...rest] = entityId.split('.');
    const name = rest.join('.');
    const s = state ?? this._entityState(entityId, '');

    // On/off active-state domains
    if (domain === 'light' || domain === 'switch' || domain === 'fan' ||
        domain === 'media_player' || domain === 'cover' || domain === 'lock' ||
        domain === 'alarm_control_panel' || domain === 'input_boolean' ||
        domain === 'automation' || domain === 'script' || domain === 'vacuum' ||
        domain === 'climate' || domain === 'water_heater' || domain === 'humidifier' ||
        domain === 'remote') {
      const on = s === 'on' || s === 'home' || s === 'open' || s === 'playing' ||
                 s === 'unlocked' || s === 'disarmed' || s === 'cleaning' ||
                 s === 'active' || s === 'auto' ||
                 (domain === 'climate' && ['cool','heat','fan_only','dry','heat_cool','auto'].includes(s)) ||
                 (domain === 'humidifier' && s === 'on') ||
                 (domain === 'water_heater' && !['off','idle'].includes(s));
      return on ? CYAN : GRAY;
    }

    // person / device_tracker
    if (domain === 'person' || domain === 'device_tracker') {
      return s === 'home' ? CYAN : GRAY;
    }

    // sensor / number / input_number → threshold color if numeric
    if (domain === 'sensor' || domain === 'number' || domain === 'input_number' || domain === 'binary_sensor') {
      const e = this._entity(entityId);
      const dc = e?.attributes.device_class as string | undefined;
      const unit = (e?.attributes.unit_of_measurement as string | undefined) ?? '';
      const num = Number(s);
      if (!Number.isFinite(num)) return GRAY;

      // Temperature
      if (dc === 'temperature' || unit === '°C' || unit === 'C' || /temp|onDo/i.test(name)) {
        if (num < 18) return '#3b82f6';
        if (num < 22) return '#60a5fa';
        if (num < 26) return '#22c55e';
        if (num < 29) return '#f59e0b';
        return '#ef4444';
      }
      // Humidity
      if (dc === 'humidity' || (unit === '%' && /humid|seubdo|seubD/i.test(name))) {
        if (num < 30) return '#ef4444';
        if (num < 40) return '#f59e0b';
        if (num < 60) return '#22c55e';
        if (num < 70) return '#60a5fa';
        return '#3b82f6';
      }
      // CO2
      if (dc === 'carbon_dioxide' || /carbon_dioxide|co2/i.test(name) || unit === 'ppm') {
        if (num < 700) return '#22c55e';
        if (num < 1000) return '#60a5fa';
        if (num < 1400) return '#f59e0b';
        return '#ef4444';
      }
      // PM2.5
      if (/pm2_5|pm25/i.test(name) || unit === 'µg/m³' || unit === 'ug/m³' || unit === 'µg/m3') {
        if (num < 15) return '#22c55e';
        if (num < 35) return '#f59e0b';
        return '#ef4444';
      }
      // Power / energy → informational, no color
      if (dc === 'power' || dc === 'energy' || /power|energy|watt|kwh/i.test(name) ||
          unit === 'W' || unit === 'kW' || unit === 'kWh' || unit === 'Wh') {
        return GRAY;
      }
      return GRAY;
    }

    return GRAY;
  }

  protected _formatValue(item: ValueRow): string {
    if (item.value_template) {
      const rendered = this._renderTemplate(item.value_template);
      return rendered + (item.unit ?? '');
    }
    if (item.value !== undefined && item.value !== null) {
      return String(item.value) + (item.unit ?? '');
    }
    if (item.entity) {
      const e = this._entity(item.entity);
      if (!e) return '—';
      const unit = item.unit ?? (e.attributes.unit_of_measurement ?? '');
      const num = Number(e.state);
      if (!Number.isNaN(num)) {
        const rounded = Math.round(num * 10) / 10;
        return `${rounded}${unit ? ' ' + unit : ''}`;
      }
      return `${e.state}${unit ? ' ' + unit : ''}`;
    }
    return '—';
  }

  /** Render an <ha-icon> with an explicit size + optional color. */
  protected _renderIcon(name: string, size: number = 24, color?: string): TemplateResult {
    const px = `${size}px`;
    const style = color
      ? `--mdc-icon-size:${px};width:${px};height:${px};color:${color}`
      : `--mdc-icon-size:${px};width:${px};height:${px}`;
    return html`<ha-icon .icon=${name} style=${style}></ha-icon>`;
  }

  /**
   * Resolve a `hero_image` config value to a concrete URL.
   * Precedence:
   *  1. Full URL/absolute path → returned as-is
   *  2. Bare base name → `/local/cardnews/heroes/{base}-{tod}.png`
   *  3. undefined + `room` param → `/local/cardnews/heroes/hero-{room}-{tod}.png`
   *  4. undefined → undefined
   */
  protected _resolveHeroImage(
    hero_image: string | undefined,
    hass?: HomeAssistant,
    room?: string,
  ): string | undefined {
    if (hero_image) {
      if (hero_image.startsWith('/') || hero_image.startsWith('http')) return hero_image;
      const tod = computeTod(hass ?? this.hass);
      return `${TOD_BASE_PATH}/${hero_image}-${tod}.png`;
    }
    if (room) {
      const tod = computeTod(hass ?? this.hass);
      return `${TOD_BASE_PATH}/hero-${room}-${tod}.png`;
    }
    return undefined;
  }

  /** Legacy/compat: resolve a HeroConfig object down to a background URL. */
  protected _resolveHeroBackground(cfg: HeroConfig): string | undefined {
    // v0.13 — state-based hero image lookup takes precedence when configured.
    if (cfg.hero_image_by_state) {
      const { entity, map, default: fallback } = cfg.hero_image_by_state;
      const s = this._entityState(entity, '');
      const base = (s && map[s]) || fallback;
      if (base) return this._resolveHeroImage(base, this.hass);
    }
    if (cfg.hero_image) return this._resolveHeroImage(cfg.hero_image, this.hass);
    if (cfg.hero_image_entity) {
      const e = this._entity(cfg.hero_image_entity);
      const pic = e?.attributes.entity_picture;
      if (typeof pic === 'string') return pic;
    }
    if (cfg.room) return this._resolveHeroImage(undefined, this.hass, cfg.room);
    return undefined;
  }

  protected _resolveStatus(cfg: HeroConfig): {
    text?: string;
    color: StatusColor;
  } {
    let text = cfg.status_text;
    if (!text && cfg.status_text_template) {
      const rendered = this._renderTemplate(cfg.status_text_template).trim();
      if (rendered) text = rendered;
    }
    if (!text && cfg.status_entity) {
      const e = this._entity(cfg.status_entity);
      if (e) text = e.state;
    }
    let color: StatusColor = cfg.status_color ?? 'gray';
    if (cfg.status_template) {
      const rendered = this._renderTemplate(cfg.status_template).trim();
      if (rendered === 'green' || rendered === 'gray' || rendered === 'blue' || rendered === 'red' || rendered === 'amber') {
        color = rendered;
      }
    }
    return { text, color };
  }

  /** Returns true if any glow_entity is in an "on" state. */
  protected _glowActive(cfg: HeroConfig): boolean {
    if (!cfg.glow_entities || cfg.glow_entities.length === 0) return false;
    for (const id of cfg.glow_entities) {
      const s = this._entityState(id, 'off');
      if (s === 'on') return true;
    }
    return false;
  }

  // ---------- render blocks ----------

  protected renderHero(cfg: HeroConfig): TemplateResult {
    const bg = this._resolveHeroBackground(cfg);
    // Manage crossfade layer swap when the resolved URL changes.
    if (bg !== this._lastResolvedHero) {
      if (this._lastResolvedHero === undefined) {
        this._heroImgA = bg;
        this._heroActive = 'a';
      } else {
        if (this._heroActive === 'a') {
          this._heroImgB = bg;
          this._heroActive = 'b';
        } else {
          this._heroImgA = bg;
          this._heroActive = 'a';
        }
      }
      this._lastResolvedHero = bg;
    }

    const status = this._resolveStatus(cfg);
    const theme: 'dark' | 'light' = cfg.hero_theme ?? 'dark';

    const resolvedTitle = cfg.title_template
      ? this._renderTemplate(cfg.title_template)
      : (cfg.title ?? '');
    const resolvedSubtitle = cfg.subtitle_template
      ? this._renderTemplate(cfg.subtitle_template)
      : (cfg.subtitle ?? '');

    const heroClasses = {
      'cn-hero': true,
      'cn-hero--lg': cfg.size === 'lg',
      'cn-hero--light': theme === 'light',
      'cn-hero--dark': theme !== 'light',
      'cn-hero--has-image': !!bg,
    };
    const fallbackBg =
      theme === 'light'
        ? 'linear-gradient(135deg,#f4f4f6,#e5e7eb)'
        : 'linear-gradient(135deg,#3a3a3c,#1c1c1e)';

    const layerAStyle = this._heroImgA
      ? {
          backgroundImage: `url("${this._heroImgA}")`,
          opacity: this._heroActive === 'a' ? '1' : '0',
        }
      : { backgroundImage: fallbackBg, opacity: this._heroActive === 'a' ? '1' : '0' };
    const layerBStyle = this._heroImgB
      ? {
          backgroundImage: `url("${this._heroImgB}")`,
          opacity: this._heroActive === 'b' ? '1' : '0',
        }
      : { backgroundImage: fallbackBg, opacity: this._heroActive === 'b' ? '1' : '0' };

    const glowOn = this._glowActive(cfg);
    const glowPos = cfg.glow_position ?? '50% 30%';
    const glowColor = cfg.glow_color ?? 'rgba(255, 200, 100, 0.5)';
    const glowStyle = {
      background: `radial-gradient(ellipse at ${glowPos}, ${glowColor} 0%, transparent 60%)`,
      opacity: glowOn ? '1' : '0',
    };
    const hasGlowConfig = !!(cfg.glow_entities && cfg.glow_entities.length);

    return html`
      <div class=${classMap(heroClasses)}>
        <div class="cn-hero__image cn-hero__image--a" style=${styleMap(layerAStyle)}></div>
        <div class="cn-hero__image cn-hero__image--b" style=${styleMap(layerBStyle)}></div>
        ${hasGlowConfig
          ? html`<div class="cn-hero__glow" style=${styleMap(glowStyle)} aria-hidden="true"></div>`
          : nothing}
        ${bg ? html`<div class="cn-hero__overlay"></div>` : nothing}
        ${cfg.category
          ? html`
              <div class="cn-category">
                ${cfg.category_icon
                  ? this._renderIcon(cfg.category_icon, 14)
                  : nothing}
                <span>${cfg.category}</span>
              </div>
            `
          : nothing}
        ${status.text
          ? html`
              <div class="cn-status cn-status--${status.color}">
                <span class="cn-status__dot"></span>
                <span class="cn-status__text">${status.text}</span>
              </div>
            `
          : nothing}
        ${cfg.hero_actions && cfg.hero_actions.length
          ? html`<div class="cn-hero__actions">
              ${cfg.hero_actions.map((a) => this._renderHeroAction(a))}
            </div>`
          : nothing}
        <div class="cn-hero__text">
          <div class="cn-hero__title">${resolvedTitle}</div>
          ${resolvedSubtitle
            ? html`<div class="cn-hero__subtitle">${resolvedSubtitle}</div>`
            : nothing}
        </div>
      </div>
    `;
  }

  /** v0.10 — render a single top-right hero action chip. */
  protected _renderHeroAction(a: HeroAction): TemplateResult {
    const actionType = a.action_type ?? 'toggle';
    const state = a.entity ? this._entityState(a.entity, 'off') : 'off';
    const [domain] = (a.entity ?? '').split('.');
    const climateActive = domain === 'climate' && ['cool','heat','fan_only','dry','auto','heat_cool'].includes(state);
    const serviceActive = actionType === 'service' && !!a.active_states && a.active_states.includes(state);
    // v0.11: service actions light up ONLY when active_states matches. A service
    // button without active_states stays "off"-styled (it's a pure invoker,
    // not a state indicator — e.g. vacuum.return_to_base).
    const on = actionType === 'service'
      ? serviceActive
      : (state === 'on' || state === 'home' || state === 'open' || state === 'cleaning' || climateActive);
    // Unified policy: on = cyan; off = translucent white on the glass hero button.
    const color = on ? '#22d3ee' : 'rgba(255,255,255,0.6)';

    // Default icon by domain if none provided.
    // v0.11: if `active_icon` set and button is "on", use it instead of the base icon.
    let icon = (on && a.active_icon) ? a.active_icon : a.icon;
    if (!icon) {
      if (domain === 'light') icon = 'mdi:lightbulb';
      else if (domain === 'fan') icon = 'mdi:fan';
      else if (domain === 'switch') icon = 'mdi:power';
      else if (domain === 'climate') icon = 'mdi:air-conditioner';
      else if (domain === 'vacuum') icon = 'mdi:robot-vacuum';
      else icon = 'mdi:circle';
    }

    const invoke = () => {
      if (actionType === 'toggle' && a.entity) {
        this._callToggle(a.entity);
      } else if (actionType === 'remote_modal' && a.entity && this.hass) {
        this._openRemote(a);
      } else if (actionType === 'light_modal' && (a.entity || (a.entities && a.entities.length)) && this.hass) {
        this._openLight(a);
      } else if (actionType === 'tv_remote' && this.hass) {
        this._openTvRemote(a);
      } else if (actionType === 'service' && this.hass) {
        this._callHeroService(a, state);
      }
    };
    const onClick = (ev: Event) => {
      ev.stopPropagation();
      invoke();
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        ev.stopPropagation();
        invoke();
      }
    };

    const labelText = a.label ?? this._entityFriendly(a.entity) ?? '';
    return html`
      <div class="cn-hero-action-wrap">
        <button
          class="cn-hero-action ${on ? 'cn-hero-action--on' : 'cn-hero-action--off'} ${on && (domain === 'fan' || icon === 'mdi:fan' || (actionType === 'remote_modal' && a.remote === 'fan') || (actionType === 'service' && a.spin_when_active)) ? 'cn-hero-action--spin' : ''}"
          role="button"
          aria-pressed=${on ? 'true' : 'false'}
          aria-label=${labelText || a.entity}
          title=${labelText || a.entity}
          @click=${onClick}
          @keydown=${onKey}
        >
          ${this._renderIcon(icon, 18, color)}
        </button>
        ${labelText ? html`<div class="cn-hero-action__label">${labelText}</div>` : nothing}
      </div>
    `;
  }

  protected renderList(items: ListItem[] | undefined): TemplateResult | typeof nothing {
    if (!items || items.length === 0) return nothing;
    const visible = items.filter((item) => !this._shouldHideRow(item));
    if (visible.length === 0) return nothing;
    return html`
      <div class="cn-list">
        ${visible.map((item) => this._renderRow(item))}
      </div>
    `;
  }

  /** v0.14 — auto-hide rule: skip rendering a row when its data source has no
   *  meaningful value. Opt-out via `always_show: true`. */
  protected _shouldHideRow(row: ListItem): boolean {
    if (row.always_show) return false;
    if (row.type === 'header') return false;
    const HIDE = new Set(['', '-', 'null', 'undefined', 'unavailable', 'unknown', 'none', 'None', 'NaN']);
    const t = row.type ?? 'value';
    if (t === 'value') {
      const v = row as ValueRow;
      // static value provided → always show
      if (v.value !== undefined && v.value !== null && String(v.value).trim() !== '') return false;
      if (v.value_template) {
        const rendered = this._renderTemplate(v.value_template).trim();
        return rendered === '' || HIDE.has(rendered);
      }
      if (!v.entity) return true;
      const e = this._entity(v.entity);
      if (!e) return true;
      const st = String(e.state ?? '').trim();
      return HIDE.has(st);
    }
    if (t === 'bar') {
      const b = row as BarRow;
      if (b.value !== undefined && b.value !== null) return false;
      if (!b.entity) return true;
      const e = this._entity(b.entity);
      if (!e) return true;
      const st = String(e.state ?? '').trim();
      if (HIDE.has(st)) return true;
      return !Number.isFinite(Number(st));
    }
    if (t === 'balls') {
      const br = row as BallsRow;
      if (!br.entity) return true;
      const e = this._entity(br.entity);
      if (!e) return true;
      const st = String(e.state ?? '').trim();
      if (HIDE.has(st)) return true;
      // Need at least 6 numbers
      const nums = st.replace(/\+/g, ' ').split(/\s+/).filter(Boolean).map(Number).filter((n) => Number.isFinite(n));
      return nums.length < 6;
    }
    if (t === 'calendar_events') {
      return false;
    }
    if (t === 'forecast') {
      const fr = row as ForecastRow;
      if (!fr.entity) return true;
      const e = this._entity(fr.entity);
      if (!e) return true;
      const fc = e.attributes && (e.attributes as Record<string, unknown>)['forecast'];
      return !Array.isArray(fc) || fc.length === 0;
    }
    // switch / slider / select / light — always show (they represent an actionable
    // control; presence of the row itself is the value).
    if (t === 'light') {
      const lr = row as LightRow;
      if (lr.entity || (lr.entities && lr.entities.length)) return false;
      return true;
    }
    if (!row.entity) return t !== 'select';  // select w/o entity has nothing to render
    return false;
  }

  protected _renderRow(row: ListItem): TemplateResult {
    const t = row.type ?? 'value';
    if (t === 'switch') return this._renderSwitchRow(row as SwitchRow);
    if (t === 'slider') return this._renderSliderRow(row as SliderRow);
    if (t === 'bar') return this._renderBarRow(row as BarRow);
    if (t === 'select') return this._renderSelectRow(row as SelectRow);
    if (t === 'balls') return this._renderBallsRow(row as BallsRow);
    if (t === 'forecast') return this._renderForecastRow(row as ForecastRow);
    if (t === 'calendar_events') return this._renderCalendarEventsRow(row as CalendarEventsRow);
    if (t === 'light') return this._renderLightRow(row as LightRow);
    if (t === 'volume') return this._renderVolumeRow(row as VolumeRow);
    if (t === 'header') return this._renderHeaderRow(row as any);
    return this._renderValueRow(row as ValueRow);
  }

  private _rowIcon(row: ListItem): TemplateResult | typeof nothing {
    if (!row.icon) return nothing;
    const state = row.entity ? this._entityState(row.entity, '') : undefined;
    const color = this._iconColor(row.entity, state, row.icon_color);
    return this._renderIcon(row.icon, 24, color);
  }

  private _rowLabel(row: ListItem): string {
    return row.label ?? (row.entity ? this._entityFriendly(row.entity) ?? row.entity : '');
  }

  protected _renderValueRow(row: ValueRow): TemplateResult {
    const label = this._rowLabel(row);
    const [domain] = (row.entity ?? '').split('.');
    // button.* → render "실행" chip that calls button.press instead of showing timestamp state
    if (domain === 'button' && row.entity && !row.value_template && row.value === undefined) {
      const press = (ev: Event) => {
        ev.stopPropagation();
        if (this.hass && row.entity) {
          this.hass.callService('button', 'press', { entity_id: row.entity });
        }
      };
      return html`
        <div class="cn-row cn-row--value">
          <span class="cn-row__icon-slot">${this._rowIcon(row)}</span>
          <div class="cn-row__label">${label}</div>
          <span class="cn-chip-btn-wrap">
            <button class="cn-chip-btn" @click=${press}>실행</button>
          </span>
        </div>
      `;
    }
    const value = this._formatValue(row);
    const clickable = !!row.entity;
    // Auto power color: when the value is in watts, color-code by magnitude.
    const ent = row.entity ? this._entity(row.entity) : undefined;
    const unit = row.unit ?? (ent?.attributes.unit_of_measurement as string | undefined) ?? '';
    let valueStyle = '';
    if (unit === 'W' && row.entity) {
      const raw = Number(this._entityState(row.entity, ''));
      if (Number.isFinite(raw)) {
        const w = Math.max(0, raw);
        let color = '#9ca3af';
        if (w >= 500) color = '#ef4444';
        else if (w >= 200) color = '#f59e0b';
        else if (w >= 50) color = '#eab308';
        else if (w >= 5) color = '#a3a3a3';
        valueStyle = `color: ${color};`;
      }
    }
    return html`
      <div
        class="cn-row cn-row--value ${clickable ? 'cn-row--clickable' : ''}"
        @click=${clickable ? () => this._fireMoreInfo(row.entity!) : undefined}
      >
        <span class="cn-row__icon-slot">${this._rowIcon(row)}</span>
        <div class="cn-row__label">${label}</div>
        <div class="cn-row__value" style="${valueStyle}">${value}</div>
      </div>
    `;
  }

  protected _renderHeaderRow(row: { text?: string; label?: string }): TemplateResult {
    const text = row.text ?? row.label ?? '';
    return html`<div class="cn-row cn-row--header"><span class="cn-row__header-text">${text}</span></div>`;
  }

  protected _renderSwitchRow(row: SwitchRow): TemplateResult {
    const label = this._rowLabel(row);
    const state = row.entity ? this._entityState(row.entity, 'off') : 'off';
    const on = state === 'on';
    const toggle = () => {
      if (row.entity) this._callToggle(row.entity);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        toggle();
      }
    };
    const hasLight = !!(row.light_entity || (row.light_entities && row.light_entities.length));
    const openLightModal = (ev: Event) => {
      ev.stopPropagation();
      const ents = row.light_entities && row.light_entities.length ? row.light_entities : (row.light_entity ? [row.light_entity] : []);
      if (!this.hass || !ents.length) return;
      this._openLight({
        entity: ents.length === 1 ? ents[0] : undefined,
        entities: ents.length > 1 ? ents : undefined,
        labels: row.light_labels,
        label: row.label,
      } as import('./types.js').HeroAction & { entities?: string[]; labels?: string[] });
    };
    return html`
      <div
        class="cn-row cn-row--switch cn-row--clickable"
        role="button"
        tabindex="0"
        aria-pressed=${on ? 'true' : 'false'}
        @click=${toggle}
        @keydown=${onKey}
      >
        <span class="cn-row__icon-slot">${this._rowIcon(row)}</span>
        <div class="cn-row__label">${label}</div>
        ${hasLight ? html`
          <button class="cn-color-chip" title="색상 조절" @click=${openLightModal}>
            <span class="cn-color-chip__ring"></span>
            <ha-icon .icon=${'mdi:palette'} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
          </button>
        ` : nothing}
        <span class="cn-toggle-wrap">
          <span class="cn-toggle ${on ? 'cn-toggle--on' : 'cn-toggle--off'}" aria-hidden="true">
            <span class="cn-toggle__handle"></span>
          </span>
        </span>
      </div>
    `;
  }

  protected _renderSliderRow(row: SliderRow): TemplateResult {
    const label = this._rowLabel(row);
    const entity = row.entity ? this._entity(row.entity) : undefined;
    const [domain] = (row.entity ?? '').split('.');
    const min = row.min ?? 0;
    const max = row.max ?? 100;
    const step = row.step ?? 1;
    let current = 0;
    if (entity) {
      if (domain === 'light') {
        const b = Number(entity.attributes['brightness']);
        current = Number.isFinite(b) ? Math.round((b / 255) * 100) : 0;
      } else if (domain === 'media_player') {
        const v = Number(entity.attributes['volume_level']);
        current = Number.isFinite(v) ? Math.round(v * 100) : 0;
      } else if (domain === 'fan') {
        const p = Number(entity.attributes['percentage']);
        current = Number.isFinite(p) ? Math.round(p) : 0;
      } else {
        const n = Number(entity.state);
        if (Number.isFinite(n)) current = n;
      }
    }
    const unit = row.unit ?? (domain === 'light' || domain === 'media_player' || domain === 'fan' ? '%' : (entity?.attributes.unit_of_measurement ?? ''));
    const onInput = (ev: Event) => {
      const v = Number((ev.target as HTMLInputElement).value);
      if (!row.entity || !this.hass) return;
      if (domain === 'input_number') {
        this.hass.callService('input_number', 'set_value', { entity_id: row.entity, value: v });
      } else if (domain === 'light') {
        this.hass.callService('light', 'turn_on', { entity_id: row.entity, brightness_pct: v });
      } else if (domain === 'media_player') {
        this.hass.callService('media_player', 'volume_set', { entity_id: row.entity, volume_level: v / 100 });
      } else if (domain === 'fan') {
        this.hass.callService('fan', 'set_percentage', { entity_id: row.entity, percentage: v });
      } else if (row.service) {
        const [d, s] = row.service.split('.');
        this.hass.callService(d, s, { entity_id: row.entity, value: v });
      }
    };
    return html`
      <div class="cn-row cn-row--slider">
        <span class="cn-row__icon-slot">${this._rowIcon(row)}</span>
        <div class="cn-row__label">${label}</div>
        <input
          class="cn-slider"
          type="range"
          .min=${String(min)}
          .max=${String(max)}
          .step=${String(step)}
          .value=${String(current)}
          @change=${onInput}
        />
        <div class="cn-row__value">${current}${unit}</div>
      </div>
    `;
  }

  protected _renderBarRow(row: BarRow): TemplateResult {
    const label = this._rowLabel(row);
    // Determine value
    let val = 0;
    if (row.value !== undefined && row.value !== null) {
      val = Number(row.value);
    } else if (row.entity) {
      const e = this._entity(row.entity);
      if (e) {
        const n = Number(e.state);
        if (Number.isFinite(n)) val = n;
      }
    }
    if (!Number.isFinite(val)) val = 0;
    const max = row.max && row.max > 0 ? row.max : Math.max(val, 1);
    const pct = Math.max(0, Math.min(100, (val / max) * 100));
    const unit = row.unit ?? (row.entity ? this._entity(row.entity)?.attributes.unit_of_measurement ?? '' : '');
    const color = row.color ?? '#22d3ee';
    const clickable = !!row.entity;
    return html`
      <div
        class="cn-row cn-row--bar ${clickable ? 'cn-row--clickable' : ''}"
        @click=${clickable ? () => this._fireMoreInfo(row.entity!) : undefined}
      >
        <span class="cn-row__icon-slot">${this._rowIcon(row)}</span>
        <div class="cn-row__bar-body">
          <div class="cn-row__bar-top">
            <span class="cn-row__label">${label}</span>
            <span class="cn-row__value">${Math.round(val * 10) / 10}${unit ? ' ' + unit : ''}</span>
          </div>
          <div class="cn-bar-track">
            <div class="cn-bar-fill" style=${styleMap({ width: pct + '%', background: color })}></div>
          </div>
        </div>
      </div>
    `;
  }

  // ---------- v0.14: select / balls / forecast rows ----------

  protected _renderSelectRow(row: SelectRow): TemplateResult {
    const label = this._rowLabel(row);
    const entity = row.entity ? this._entity(row.entity) : undefined;
    const current = entity ? String(entity.state ?? '') : '';
    const optionsRaw = entity?.attributes?.options as unknown;
    const options: string[] = Array.isArray(optionsRaw) ? (optionsRaw as unknown[]).map(String) : [];
    const key = row.entity ?? '';
    const isOpen = !!this._openSelects[key];
    const toggle = (ev: Event) => {
      ev.stopPropagation();
      this._openSelects = { ...this._openSelects, [key]: !isOpen };
    };
    const pick = (ev: Event, v: string) => {
      ev.stopPropagation();
      if (row.entity && this.hass && v) {
        this.hass.callService('input_select', 'select_option', { entity_id: row.entity, option: v });
      }
      this._openSelects = { ...this._openSelects, [key]: false };
    };
    return html`
      <div class="cn-dropdown-anchor" data-open=${isOpen}>
        <div class="cn-row cn-row--select cn-row--clickable ${isOpen ? 'cn-row--select-open' : ''}" @click=${toggle}>
          <span class="cn-row__icon-slot">${this._rowIcon(row)}</span>
          <div class="cn-row__label">${label}</div>
          <span class="cn-dropdown__current">${current || '-'}</span>
          <span class="cn-dropdown__chevron ${isOpen ? 'cn-dropdown__chevron--open' : ''}">
            ${this._renderIcon('mdi:chevron-down', 20, 'var(--cn-text-dim, rgba(0,0,0,0.55))')}
          </span>
        </div>
        ${isOpen ? html`
          <div class="cn-dropdown__backdrop" @click=${toggle}></div>
          <div class="cn-dropdown__popover" data-select-key=${key} @click=${(ev: Event) => ev.stopPropagation()}>
            ${options.map(opt => html`
              <div class="cn-dropdown__opt ${opt === current ? 'cn-dropdown__opt--active' : ''}"
                   @click=${(ev: Event) => pick(ev, opt)}>
                ${opt === current
                  ? html`<span class="cn-dropdown__check">${this._renderIcon('mdi:check', 16, 'var(--cn-accent, #22d3ee)')}</span>`
                  : html`<span class="cn-dropdown__check"></span>`}
                <span class="cn-dropdown__opt-lbl">${opt}</span>
              </div>
            `)}
          </div>
        ` : nothing}
      </div>
    `;
  }

  protected override updated(changed: Map<string, unknown>): void {
    // Kick off calendar_events refetches when hass first arrives or ages out
    if (changed.has('hass')) {
      this._maybeFetchCalendarRows();
    }
    // Anchor scroll after any render (idempotent per key).
    this._maybeScrollCalendarLists();
    // Keep any open event modals in sync with hass.
    if (changed.has('hass') && this._openEventModals.size) {
      for (const [, entry] of this._openEventModals) entry.el.hass = this.hass;
    }
    if (changed.has('_openSelects')) {
      // Position all open popovers using fixed coords based on their trigger row.
      const roots = this.renderRoot as ShadowRoot | HTMLElement;
      const popovers = roots.querySelectorAll?.('.cn-dropdown__popover');
      popovers?.forEach((pop) => {
        const anchor = (pop as HTMLElement).parentElement;
        const rowEl = anchor?.querySelector('.cn-row--select') as HTMLElement | null;
        if (!rowEl) return;
        const r = rowEl.getBoundingClientRect();
        const el = pop as HTMLElement;
        el.style.position = 'fixed';
        el.style.top = `${r.top + 4}px`;
        el.style.right = `${window.innerWidth - r.right + 4}px`;
        el.style.zIndex = '10000';
      });
    }
  }

  /** Korean 6/45 lotto ball color by number range. */
  private _lottoBallColor(n: number): string {
    if (n >= 1 && n <= 10) return '#fbc400';   // yellow
    if (n >= 11 && n <= 20) return '#69c8f2';  // blue
    if (n >= 21 && n <= 30) return '#ff7272';  // red
    if (n >= 31 && n <= 40) return '#aaaaaa';  // gray
    if (n >= 41 && n <= 45) return '#b0d840';  // green
    return '#9ca3af';
  }

  protected _renderBallsRow(row: BallsRow): TemplateResult {
    const label = this._rowLabel(row);
    const entity = row.entity ? this._entity(row.entity) : undefined;
    const st = String(entity?.state ?? '').trim();
    // Parse "10 20 23 34 37 40 + 36" (or space-separated 7 numbers).
    const parts = st.split(/\s*\+\s*/);
    const mains = (parts[0] ?? '').split(/\s+/).filter(Boolean).map(Number).filter(Number.isFinite);
    const bonus = parts.length > 1
      ? Number((parts[1] ?? '').trim())
      : (mains.length >= 7 ? mains[6] : NaN);
    const main6 = mains.slice(0, 6);
    const ball = (n: number) => html`
      <span class="cn-ball" style=${styleMap({ background: this._lottoBallColor(n) })}>${n}</span>
    `;
    return html`
      <div class="cn-row cn-row--balls">
        ${label ? html`<div class="cn-row__label cn-row__label--balls">${label}</div>` : nothing}
        <div class="cn-balls">
          ${main6.map((n) => ball(n))}
          ${Number.isFinite(bonus) ? html`<span class="cn-balls__plus">+</span>${ball(bonus)}` : nothing}
        </div>
      </div>
    `;
  }

  protected _renderForecastRow(row: ForecastRow): TemplateResult {
    const label = this._rowLabel(row);
    const entity = row.entity ? this._entity(row.entity) : undefined;
    const attrs = (entity?.attributes ?? {}) as Record<string, unknown>;
    const forecastRaw = attrs['forecast'];
    const days = row.days ?? 5;
    const list = Array.isArray(forecastRaw) ? (forecastRaw as Array<Record<string, unknown>>).slice(0, days) : [];
    const KOR_DAY = ['일', '월', '화', '수', '목', '금', '토'];
    const iconFor = (cond: string): string => {
      const c = String(cond ?? '').toLowerCase();
      if (c.includes('clear-night')) return 'mdi:weather-night';
      if (c.includes('sunny') || c === 'clear') return 'mdi:weather-sunny';
      if (c.includes('partlycloudy') || c.includes('partly')) return 'mdi:weather-partly-cloudy';
      if (c.includes('cloud')) return 'mdi:weather-cloudy';
      if (c.includes('pouring')) return 'mdi:weather-pouring';
      if (c.includes('rain')) return 'mdi:weather-rainy';
      if (c.includes('snow')) return 'mdi:weather-snowy';
      if (c.includes('fog')) return 'mdi:weather-fog';
      if (c.includes('lightning') || c.includes('thunder')) return 'mdi:weather-lightning';
      if (c.includes('wind')) return 'mdi:weather-windy';
      if (c.includes('hail')) return 'mdi:weather-hail';
      return 'mdi:weather-partly-cloudy';
    };
    const items = list.map((f, idx) => {
      const dt = f['datetime'] ? new Date(String(f['datetime'])) : undefined;
      const dow = dt && !isNaN(dt.getTime()) ? (idx === 0 ? '오늘' : KOR_DAY[dt.getDay()]) : `+${idx}`;
      const cond = String(f['condition'] ?? '');
      const tHigh = f['temperature'];
      const tLow = f['templow'] ?? f['temperature_low'];
      const hi = tHigh !== undefined && tHigh !== null ? Math.round(Number(tHigh)) : null;
      const lo = tLow !== undefined && tLow !== null ? Math.round(Number(tLow)) : null;
      return html`
        <div class="cn-forecast__day">
          <div class="cn-forecast__dow">${dow}</div>
          ${this._renderIcon(iconFor(cond), 22)}
          <div class="cn-forecast__temps">
            ${hi !== null ? html`<span class="cn-forecast__hi">${hi}°</span>` : nothing}
            ${lo !== null ? html`<span class="cn-forecast__lo">${lo}°</span>` : nothing}
          </div>
        </div>
      `;
    });
    return html`
      <div class="cn-row cn-row--forecast">
        ${label ? html`<div class="cn-row__label cn-row__label--forecast">${label}</div>` : nothing}
        <div class="cn-forecast">${items}</div>
      </div>
    `;
  }


  // ---------- calendar_events row ----------

  /** Iterate current config's list items and refetch stale calendar rows. */
  private _maybeFetchCalendarRows(): void {
    if (!this.hass) return;
    const cfg = (this as unknown as { _config?: { list?: ListItem[] } })._config;
    const list = cfg?.list;
    if (!Array.isArray(list)) return;
    for (const item of list) {
      if (item && item.type === 'calendar_events') {
        this._fetchCalendarRow(item as CalendarEventsRow);
      }
    }
  }

  private _calendarKey(row: CalendarEventsRow): string {
    const ents = [...(row.entities ?? [])].sort().join(',');
    const before = row.days_before ?? 3;
    const after = row.days_after ?? 3;
    return `${ents}|b=${before}|a=${after}`;
  }

  private async _fetchCalendarRow(row: CalendarEventsRow): Promise<void> {
    if (!this.hass || !this.hass.callWS) return;
    const entities = (row.entities ?? []).filter(Boolean);
    if (!entities.length) return;
    const key = this._calendarKey(row);
    const now = Date.now();
    const last = this._calendarLastFetch[key] ?? 0;
    if (this._calendarInflight[key]) return;
    if (now - last < CAL_REFRESH_MS && this._calendarEvents[key]) return;
    this._calendarInflight[key] = true;
    try {
      const daysBefore = row.days_before ?? 3;
      const daysAfter = row.days_after ?? 3;
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - daysBefore);
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + daysAfter + 1);
      const fmt = (d: Date): string => {
        // "YYYY-MM-DD HH:MM:SS" in local time (calendar.get_events service accepts this)
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };
      const collected: CalendarEvent[] = [];
      try {
        // Use service call with return_response — the only universally
        // supported way across recent HA versions for multi-entity fetches.
        const resp = await this.hass!.callWS!<unknown>({
          type: 'call_service',
          domain: 'calendar',
          service: 'get_events',
          service_data: {
            entity_id: entities,
            start_date_time: fmt(start),
            end_date_time: fmt(end),
          },
          return_response: true,
        });
        const r = resp as { response?: Record<string, unknown> };
        const perEntity = r.response ?? {};
        for (const entity_id of Object.keys(perEntity)) {
          const bucket = perEntity[entity_id];
          let arr: unknown[] = [];
          if (Array.isArray(bucket)) arr = bucket;
          else if (bucket && typeof bucket === 'object') {
            const b = bucket as { events?: unknown[] };
            if (Array.isArray(b.events)) arr = b.events;
          }
          for (const e of arr) {
            const ev = e as Record<string, unknown>;
            const startRaw = ev['start'];
            const endRaw = ev['end'];
            const pick = (raw: unknown): string => {
              if (typeof raw === 'string') return raw;
              if (raw && typeof raw === 'object') {
                const o = raw as { dateTime?: string; date?: string };
                if (typeof o.dateTime === 'string') return o.dateTime;
                if (typeof o.date === 'string') return o.date;
              }
              return '';
            };
            const startStr = pick(startRaw);
            const endStr = pick(endRaw);
            if (!startStr) continue;
            collected.push({
              entity_id,
              summary: typeof ev['summary'] === 'string' ? (ev['summary'] as string) : '',
              description: typeof ev['description'] === 'string' ? (ev['description'] as string) : undefined,
              location: typeof ev['location'] === 'string' ? (ev['location'] as string) : undefined,
              start: startStr,
              end: endStr || undefined,
              allDay: !/T\d/.test(startStr),
            });
          }
        }
      } catch {
        // ignore fetch failures — empty state will render
      }
      this._calendarLastFetch[key] = Date.now();
      this._calendarScrolled[key] = false;
      this._calendarEvents = { ...this._calendarEvents, [key]: collected };
    } finally {
      this._calendarInflight[key] = false;
    }
  }

  private _calendarDotColor(entity_id: string, entities: string[]): string {
    const idx = entities.indexOf(entity_id);
    return CAL_PALETTE[(idx >= 0 ? idx : 0) % CAL_PALETTE.length];
  }

  private _fmtCalendarDate(iso: string, allDay: boolean): { day: string; time: string; date: Date } {
    const KOR_DAY = ['일', '월', '화', '수', '목', '금', '토'];
    const d = new Date(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = Math.round((dayStart.getTime() - today.getTime()) / (24 * 3600 * 1000));
    let day: string;
    if (diff === 0) day = '오늘';
    else if (diff === 1) day = '내일';
    else day = `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')} (${KOR_DAY[d.getDay()]})`;
    let time = '';
    if (!allDay) {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      time = `${hh}:${mm}`;
    }
    return { day, time, date: d };
  }

  private _calendarEntityName(entity_id: string): string {
    const st = this.hass?.states?.[entity_id];
    const fn = (st?.attributes as { friendly_name?: string } | undefined)?.friendly_name;
    return fn || entity_id;
  }

  private _openEventDetail(ev: CalendarEvent): void {
    if (!this.hass) return;
    const calendarName = this._calendarEntityName(ev.entity_id);
    const openKey = `${ev.entity_id}|${ev.start}|${ev.summary ?? ''}`;
    const existing = this._openEventModals.get(openKey);
    if (existing) return;
    const handle = openCalendarEventModal({
      hass: this.hass,
      event: ev,
      entityId: ev.entity_id,
      calendarName,
    });
    handle.el.addEventListener('close', () => {
      this._openEventModals.delete(openKey);
    });
    this._openEventModals.set(openKey, handle);
  }

  private _todayAnchorIndex(sorted: CalendarEvent[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const t = today.getTime();
    let firstFuture = -1;
    for (let i = 0; i < sorted.length; i++) {
      const ev = sorted[i];
      if (!ev) continue;
      const d = new Date(ev.start);
      const ds = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      if (ds === t) return i;
      if (ds > t && firstFuture < 0) firstFuture = i;
    }
    return firstFuture >= 0 ? firstFuture : Math.max(0, sorted.length - 1);
  }

  protected _renderCalendarEventsRow(row: CalendarEventsRow): TemplateResult {
    const key = this._calendarKey(row);
    const events = this._calendarEvents[key] ?? [];
    const groupBy = row.group_by_day !== false;
    const showDesc = row.show_description !== false;
    const cap = row.max ?? 40;
    const entities = row.entities ?? [];
    const visibleRows = Math.max(1, row.visible_rows ?? 4);
    const listMaxHeight = `${visibleRows * this._calendarRowHeight}px`;

    if (!events.length) {
      const loading = !this._calendarLastFetch[key];
      return html`
        <div class="cn-row cn-row--calendar-empty">
          <div class="cn-cal-empty">${loading ? '일정 불러오는 중...' : '예정된 일정 없음'}</div>
        </div>
      `;
    }

    const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start)).slice(0, cap);
    const anchorIdx = this._todayAnchorIndex(sorted);

    const renderOne = (ev: CalendarEvent, globalIdx: number): TemplateResult => {
      const { day, time } = this._fmtCalendarDate(ev.start, !!ev.allDay);
      const color = this._calendarDotColor(ev.entity_id, entities);
      const isAnchor = globalIdx === anchorIdx;
      return html`
        <div class="cn-row cn-row--calendar"
             data-cal-key=${key}
             data-cal-anchor=${isAnchor ? '1' : '0'}
             role="button"
             tabindex="0"
             @click=${() => this._openEventDetail(ev)}
             @keydown=${(e: KeyboardEvent) => {
               if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._openEventDetail(ev); }
             }}>
          <span class="cn-row--calendar__dot" style=${styleMap({ background: color })}></span>
          <div class="cn-row--calendar__main">
            <div class="cn-row--calendar__head">
              <span class="cn-row--calendar__date">${day}${time ? html` · ${time}` : nothing}</span>
              <span class="cn-row--calendar__title">${ev.summary || '(제목 없음)'}</span>
            </div>
            ${showDesc && ev.description
              ? html`<div class="cn-row--calendar__desc">${ev.description}</div>`
              : nothing}
          </div>
        </div>
      `;
    };

    if (!groupBy) {
      return html`
        <div class="cn-cal-list cn-cal-list--scroll"
             data-cal-key=${key}
             style=${styleMap({ maxHeight: listMaxHeight })}>
          ${sorted.map((ev, i) => renderOne(ev, i))}
        </div>
      `;
    }

    // Group by day label — need to preserve global index for anchor detection.
    const groups = new Map<string, Array<{ ev: CalendarEvent; gi: number }>>();
    const order: string[] = [];
    sorted.forEach((ev, gi) => {
      const { day } = this._fmtCalendarDate(ev.start, !!ev.allDay);
      if (!groups.has(day)) { groups.set(day, []); order.push(day); }
      groups.get(day)!.push({ ev, gi });
    });
    return html`
      <div class="cn-cal-list cn-cal-list--scroll"
           data-cal-key=${key}
           style=${styleMap({ maxHeight: listMaxHeight })}>
        ${order.map((label) => html`
          <div class="cn-cal-group">
            <div class="cn-cal-group__hdr">${label}</div>
            ${(groups.get(label) ?? []).map(({ ev, gi }) => renderOne(ev, gi))}
          </div>
        `)}
      </div>
    `;
  }

  /** Auto-scroll each freshly-rendered calendar list to its today-anchor row (once per fetch). */
  protected _maybeScrollCalendarLists(): void {
    const root = this.renderRoot as ShadowRoot | HTMLElement;
    if (!root || !root.querySelectorAll) return;
    const lists = root.querySelectorAll('.cn-cal-list--scroll') as NodeListOf<HTMLElement>;
    lists.forEach((list) => {
      const key = list.getAttribute('data-cal-key') || '';
      if (!key || this._calendarScrolled[key]) return;
      const anchor = list.querySelector('[data-cal-anchor="1"]') as HTMLElement | null;
      if (!anchor) return;
      // Offset relative to list's scroll container.
      const listRect = list.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const offset = (anchorRect.top - listRect.top) + list.scrollTop;
      list.scrollTop = Math.max(0, offset - 4);
      this._calendarScrolled[key] = true;
    });
  }


  protected renderCard(
    hero: TemplateResult,
    body: TemplateResult | typeof nothing,
    footer: TemplateResult | typeof nothing = nothing,
  ): TemplateResult {
    if (this._configError) {
      return html`<ha-card class="cn-card cn-card--error">
        <div class="cn-error">${this._configError}</div>
      </ha-card>`;
    }
    return html`
      <ha-card class="cn-card">
        ${hero}
        <div class="cn-body">
          ${body}
          ${footer}
        </div>
      </ha-card>
    `;
  }

  // ---------- actions ----------

  protected _renderVolumeRow(row: VolumeRow): TemplateResult {
    const label = this._rowLabel(row);
    const entity = row.entity ? this._entity(row.entity) : undefined;
    const [domain] = (row.entity ?? '').split('.');
    let current = 0;
    let muted = false;
    if (entity) {
      if (domain === 'media_player') {
        const v = Number(entity.attributes['volume_level']);
        current = Number.isFinite(v) ? Math.round(v * 100) : 0;
        muted = !!entity.attributes['is_volume_muted'];
      } else {
        const n = Number(entity.state);
        current = Number.isFinite(n) ? Math.round(n) : 0;
      }
    }
    const callSvc = (svc: string, extra: Record<string, unknown> = {}) => {
      if (!row.entity || !this.hass) return;
      if (domain === 'media_player') {
        this.hass.callService('media_player', svc, { entity_id: row.entity, ...extra });
      }
    };
    const showMute = row.mute !== false;
    return html`
      <div class="cn-row cn-row--volume">
        <span class="cn-row__icon-slot">${this._rowIcon(row)}</span>
        <div class="cn-row__label">${label}</div>
        <span class="cn-volstep">
          <button class="cn-volstep__btn" @click=${() => callSvc('volume_down')} title="볼륨 -">−</button>
          <span class="cn-volstep__val">${current}%</span>
          <button class="cn-volstep__btn" @click=${() => callSvc('volume_up')} title="볼륨 +">+</button>
          ${showMute ? html`
            <button class="cn-volstep__btn cn-volstep__btn--mute ${muted ? 'cn-volstep__btn--active' : ''}"
                    @click=${() => callSvc('volume_mute', { is_volume_muted: !muted })} title="음소거">
              <ha-icon .icon=${muted ? 'mdi:volume-off' : 'mdi:volume-high'} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
            </button>
          ` : nothing}
        </span>
      </div>
    `;
  }

  protected _renderLightRow(row: LightRow): TemplateResult {
    const label = this._rowLabel(row);
    const targets: string[] = (row.entities && row.entities.length)
      ? row.entities
      : (row.entity ? [row.entity] : []);
    const primary = targets[0] ? this._entity(targets[0]) : undefined;
    const anyOn = targets.some((id) => this._entityState(id, 'off') === 'on');
    const supportedModes = ((primary?.attributes.supported_color_modes as string[] | undefined) ?? []);
    const showColorChip = row.force_color_button
      || supportedModes.some((m) => ['hs', 'xy', 'rgb', 'rgbw', 'rgbww', 'color_temp'].includes(m));
    const toggle = (ev: Event) => {
      ev.stopPropagation();
      if (!this.hass || !targets.length) return;
      const svc = anyOn ? 'turn_off' : 'turn_on';
      this.hass.callService('light', svc, { entity_id: targets });
    };
    const openModal = (ev: Event) => {
      ev.stopPropagation();
      if (!this.hass || !targets.length) return;
      this._openLight({
        entity: targets.length === 1 ? targets[0] : undefined,
        entities: targets.length > 1 ? targets : undefined,
        labels: row.labels,
        label: row.label,
      } as import('./types.js').HeroAction & { entities?: string[]; labels?: string[] });
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(ev); }
    };
    return html`
      <div
        class="cn-row cn-row--switch cn-row--clickable"
        role="button"
        tabindex="0"
        aria-pressed=${anyOn ? 'true' : 'false'}
        @click=${toggle}
        @keydown=${onKey}
      >
        <span class="cn-row__icon-slot">${this._rowIcon(row)}</span>
        <div class="cn-row__label">${label}</div>
        ${showColorChip ? html`
          <button class="cn-color-chip" title="색상 조절" @click=${openModal}>
            <span class="cn-color-chip__ring"></span>
            <ha-icon .icon=${'mdi:palette'} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
          </button>
        ` : nothing}
        <span class="cn-toggle-wrap">
          <span class="cn-toggle ${anyOn ? 'cn-toggle--on' : 'cn-toggle--off'}" aria-hidden="true">
            <span class="cn-toggle__handle"></span>
          </span>
        </span>
      </div>
    `;
  }

  protected _openLight(a: import('./types.js').HeroAction & { entities?: string[]; labels?: string[] }): void {
    if (!this.hass) return;
    const targets = (a.entities && a.entities.length) ? a.entities : (a.entity ? [a.entity] : []);
    if (!targets.length) return;
    const key = `light:${targets.join(',')}`;
    const existing = this._openLightModals.get(key);
    if (existing) { existing.close(); this._openLightModals.delete(key); return; }
    const handle = openLightModal({
      hass: this.hass,
      entity: targets.length === 1 ? targets[0] : undefined,
      entities: targets.length > 1 ? targets : undefined,
      labels: a.labels,
      deviceName: a.label ?? this._entityFriendly(targets[0]) ?? undefined,
    });
    const el = document.body.lastElementChild as CardnewsLightModal | null;
    if (el && el.tagName?.toLowerCase() === 'cardnews-light-modal') {
      const cleanup = () => { this._openLightModals.delete(key); };
      el.addEventListener('close', cleanup, { once: true });
      this._openLightModals.set(key, { el, close: () => { handle.close(); cleanup(); } });
    }
  }

  protected _fireMoreInfo(entityId: string): void {
    const ev = new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId },
    });
    this.dispatchEvent(ev);
  }

  protected _openRemote(a: HeroAction): void {
    if (!this.hass || !a.entity) return;
    const kind = (a.remote as ('ac' | 'fan' | 'boiler') | undefined) ?? 'ac';
    const key = `${kind}:${a.entity}`;
    const existing = this._openRemoteModals.get(key);
    if (existing) {
      existing.close();
      this._openRemoteModals.delete(key);
      return;
    }
    const handle = openRemoteModal({
      hass: this.hass,
      kind,
      entity: a.entity,
      deviceName: a.label ?? this._entityFriendly(a.entity) ?? undefined,
    });
    // Track the element so we can push hass updates. We stash the element via
    // querying the last-appended child of body.
    const el = document.body.lastElementChild as CardnewsRemoteModal | null;
    if (el && el.tagName?.toLowerCase() === 'cardnews-remote-modal') {
      const cleanup = () => {
        this._openRemoteModals.delete(key);
      };
      el.addEventListener('close', cleanup, { once: true });
      this._openRemoteModals.set(key, { el, close: () => { handle.close(); cleanup(); } });
    }
  }

  protected _openTvRemote(a: HeroAction): void {
    if (!this.hass) return;
    const rem = (a.remote as string) || '';
    const tv = a.tv_entity || '';
    const key = `tv:${rem || tv || a.entity || ''}`;
    const existing = this._openTvRemoteModals.get(key);
    if (existing) {
      existing.close();
      this._openTvRemoteModals.delete(key);
      return;
    }
    const handle = openTvRemoteModal({
      hass: this.hass,
      action: a,
      deviceName: a.label ?? this._entityFriendly(tv || a.entity) ?? undefined,
    });
    const el = document.body.lastElementChild as CardnewsTvRemoteModal | null;
    if (el && el.tagName?.toLowerCase() === 'cardnews-tv-remote-modal') {
      const cleanup = () => { this._openTvRemoteModals.delete(key); };
      el.addEventListener('close', cleanup, { once: true });
      this._openTvRemoteModals.set(key, { el, close: () => { handle.close(); cleanup(); } });
    }
  }

  protected _callHeroService(a: import('./types.js').HeroAction, currentState: string): void {
    if (!this.hass) return;
    // If toggle_service + active_states configured and current state matches,
    // fire toggle_service instead of service.
    let svc = a.service;
    let data = a.service_data;
    if (a.toggle_service && a.active_states && a.active_states.includes(currentState)) {
      svc = a.toggle_service;
      data = a.toggle_service_data ?? a.service_data;
    }
    if (!svc) return;
    const [domain, service] = svc.split('.');
    if (!domain || !service) return;
    const payload: Record<string, unknown> = { ...(data ?? {}) };
    if (a.entity && !('entity_id' in payload)) payload.entity_id = a.entity;
    this.hass.callService(domain, service, payload);
  }

  protected _callToggle(entityId: string): void {
    if (!this.hass) return;
    const [domain] = entityId.split('.');
    if (!domain) return;
    this.hass.callService('homeassistant', 'toggle', { entity_id: entityId });
  }

  // ---------- styles ----------

  static styles: CSSResultGroup = css`
    ${FONT_IMPORT}

    :host {
      display: block;
      /* margin removed in v0.9 — parent grid handles spacing */
      --cn-radius: 20px;
      --cn-radius-inner: 12px;
      --cn-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      --cn-bg-card: var(--card-background-color, #ffffff);
      --cn-text-primary: var(--primary-text-color, #1a1a1a);
      --cn-text-secondary: var(--secondary-text-color, #6b7280);
      --cn-text-hero: #ffffff;

      --cn-chip-dark-bg: rgba(255, 255, 255, 0.15);
      --cn-chip-dark-fg: #ffffff;
      --cn-chip-light-bg: rgba(0, 0, 0, 0.06);
      --cn-chip-light-fg: var(--cn-text-primary);

      --cn-status-ok-dot: #34d399;
      --cn-status-warn-dot: #fbbf24;
      --cn-status-error-dot: #f87171;
      --cn-status-info-dot: #60a5fa;
      --cn-status-gray-dot: #9ca3af;

      --cn-toggle-track: #1f2937;
      --cn-toggle-handle-off: #9ca3af;
      --cn-toggle-handle-on: #22d3ee;

      --cn-divider: rgba(0, 0, 0, 0.06);

      --cn-hero-height: 260px;
      --cn-hero-height-lg: 340px;

      --cn-touch-min: 44px;
      --cn-row-height: 40px;

      --cn-font-family: ${unsafeCSS(FONT_STACK)};
      --cn-font-row: 15px;
      --cn-font-category: 13px;
      --cn-font-status: 13px;
      --cn-font-hero-subtitle: 13px;
      --cn-font-hero-title: 26px;
      --cn-font-hero-title-lg: 30px;
      --cn-line-tight: 1.2;
      --cn-line-normal: 1.45;
      --cn-letter-tight: -0.01em;
      --cn-letter-hero: -0.02em;
      --cn-letter-category: 0.06em;

      display: block;
      font-family: var(--cn-font-family);
      color: var(--cn-text-primary);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --cn-divider: rgba(255, 255, 255, 0.08);
      }
    }

    .cn-card {
      border-radius: var(--cn-radius);
      overflow: hidden;
      box-shadow: var(--cn-shadow);
      background: var(--cn-bg-card);
      color: var(--cn-text-primary);
      font-family: var(--cn-font-family);
    }

    /* --- hero --- */
    .cn-hero {
      position: relative;
      width: 100%;
      height: var(--cn-hero-height);
      isolation: isolate;
      overflow: hidden;
    }
    .cn-hero__image {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      transition: opacity 800ms ease;
      will-change: opacity;
      z-index: 0;
    }
    /* v0.8 — light glow overlay */
    .cn-hero__glow {
      position: absolute;
      inset: 0;
      pointer-events: none;
      mix-blend-mode: screen;
      transition: opacity 600ms ease;
      z-index: 1;
    }
    .cn-hero--dark { color: var(--cn-text-hero); }
    .cn-hero--light { color: var(--cn-text-primary); }
    .cn-hero--lg { height: var(--cn-hero-height-lg); }
    .cn-hero--lg .cn-hero__title { font-size: var(--cn-font-hero-title-lg); }
    .cn-hero__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.15) 0%,
        transparent 35%,
        rgba(0, 0, 0, 0.6) 100%
      );
      z-index: 2;
    }
    .cn-hero--light .cn-hero__overlay {
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.05) 0%,
        transparent 35%,
        rgba(255, 255, 255, 0.4) 100%
      );
    }

    /* --- category chip --- */
    .cn-category {
      position: absolute;
      top: 14px;
      left: 16px;
      z-index: 3;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      background: var(--cn-chip-dark-bg);
      color: var(--cn-chip-dark-fg);
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: var(--cn-font-category);
      line-height: 1;
      letter-spacing: var(--cn-letter-category);
      text-transform: uppercase;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    .cn-hero--light .cn-category {
      background: var(--cn-chip-light-bg);
      color: var(--cn-chip-light-fg);
    }

    /* --- status pill --- */
    .cn-status {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 3;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--cn-chip-dark-bg);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 999px;
      color: var(--cn-chip-dark-fg);
      font-family: var(--cn-font-family);
      font-weight: 500;
      font-size: var(--cn-font-status);
      line-height: 1;
    }
    .cn-hero--light .cn-status {
      background: var(--cn-chip-light-bg);
      color: var(--cn-chip-light-fg);
    }
    .cn-status__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--cn-status-ok-dot);
    }
    .cn-status--green .cn-status__dot { background: var(--cn-status-ok-dot); }
    .cn-status--gray .cn-status__dot { background: var(--cn-status-gray-dot); }
    .cn-status--blue .cn-status__dot { background: var(--cn-status-info-dot); }
    .cn-status--red .cn-status__dot { background: var(--cn-status-error-dot); }
    .cn-status--amber .cn-status__dot { background: var(--cn-status-warn-dot); }


    /* v0.10 — hero top-right action chip stack */
    .cn-hero__actions {
      position: absolute;
      bottom: 14px;
      right: 14px;
      z-index: 5;
      display: inline-flex;
      align-items: flex-end;
      gap: 10px;
      pointer-events: none;
    }
    .cn-hero-action-wrap {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      pointer-events: none;
    }
    .cn-hero-action__label {
      pointer-events: none;
      font-family: var(--cn-font-family);
      font-size: 13px;
      font-weight: 600;
      line-height: 1.1;
      color: #ffffff;
      letter-spacing: -0.02em;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.65), 0 0 6px rgba(0, 0, 0, 0.4);
      white-space: nowrap;
      max-width: 90px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cn-hero-action {
      pointer-events: auto;
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      border: 1px solid transparent;
      background:
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.04) 0%,
          rgba(255, 255, 255, 0.02) 45%,
          rgba(255, 255, 255, 0.00) 100%
        ) padding-box,
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.35) 0%,
          rgba(255, 255, 255, 0.08) 40%,
          rgba(255, 255, 255, 0.03) 60%,
          rgba(255, 255, 255, 0.18) 100%
        ) border-box;
      backdrop-filter: blur(3px) saturate(140%);
      -webkit-backdrop-filter: blur(3px) saturate(140%);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: transform 0.12s ease, border-color 0.18s ease, box-shadow 0.18s ease;
      padding: 0;
      overflow: hidden;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.32),
        0 2px 4px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.12);
    }
    /* specular highlight (glass sheen) */
    .cn-hero-action::before {
      content: '';
      position: absolute;
      inset: 2px 2px auto 2px;
      height: 45%;
      border-radius: 12px 12px 40% 40% / 12px 12px 100% 100%;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.08) 0%,
        rgba(255, 255, 255, 0) 100%
      );
      pointer-events: none;
    }
    .cn-hero-action--on {
      background:
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.10) 0%,
          rgba(255, 255, 255, 0.04) 45%,
          rgba(255, 255, 255, 0.02) 100%
        ) padding-box,
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.5) 0%,
          rgba(255, 255, 255, 0.12) 40%,
          rgba(255, 255, 255, 0.05) 60%,
          rgba(255, 255, 255, 0.25) 100%
        ) border-box;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(52, 211, 153, 0.4),
        0 0 6px rgba(52, 211, 153, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.28),
        inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    }
    .cn-hero-action:hover {
      transform: translateY(-1px);
    }
    .cn-hero-action:active { transform: scale(0.94); }
    .cn-hero-action:focus-visible {
      outline: 2px solid #22d3ee;
      outline-offset: 2px;
    }

    @keyframes cn-hero-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .cn-hero-action--spin ha-icon,
    .cn-hero-action--spin svg {
      animation: cn-hero-spin 2.5s linear infinite;
      transform-origin: center;
    }
    .cn-hero-action--spin.cn-hero-action--on ha-icon,
    .cn-hero-action--spin.cn-hero-action--on svg {
      animation-duration: 1.4s;
    }



        .cn-hero__text {
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 14px;
      z-index: 3;
      pointer-events: none;
    }
    .cn-hero--dark .cn-hero__title {
      color: #ffffff;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    }
    .cn-hero__title {
      font-family: var(--cn-font-family);
      font-weight: 700;
      font-size: var(--cn-font-hero-title);
      line-height: var(--cn-line-tight);
      letter-spacing: var(--cn-letter-hero);
    }
    .cn-hero--dark .cn-hero__subtitle {
      color: rgba(255, 255, 255, 0.85);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
    }
    .cn-hero__subtitle {
      margin-top: 4px;
      font-family: var(--cn-font-family);
      font-weight: 500;
      font-size: var(--cn-font-hero-subtitle);
      line-height: 1.3;
      color: var(--cn-text-secondary);
    }

    /* --- ha-icon reset --- */
    ha-icon {
      --mdc-icon-size: 24px;
      width: var(--mdc-icon-size);
      height: var(--mdc-icon-size);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: inherit;
    }

    /* --- body / list --- */
    .cn-body {
      padding: 4px 0 8px;
      font-family: var(--cn-font-family);
    }
    .cn-list {
      display: flex;
      flex-direction: column;
    }
    .cn-row {
      min-height: 40px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 20px;
      transition: background 120ms ease;
      color: var(--cn-text-primary);
    }
    .cn-row + .cn-row {
      border-top: 1px solid var(--cn-divider);
    }
    .cn-row--header {
      min-height: 26px;
      padding: 10px 20px 4px;
      color: var(--cn-text-secondary, #9ca3af);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .cn-row--header + .cn-row {
      border-top: none;
    }
    .cn-row + .cn-row--header {
      border-top: 1px solid var(--cn-divider);
      margin-top: 4px;
    }
    .cn-row__header-text { display: inline-block; }
    .cn-row--clickable {
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .cn-row--clickable:hover {
      background: rgba(0, 0, 0, 0.03);
    }
    @media (prefers-color-scheme: dark) {
      .cn-row--clickable:hover {
        background: rgba(255, 255, 255, 0.04);
      }
    }
    .cn-row--clickable:focus-visible {
      outline: 2px solid #22d3ee;
      outline-offset: -2px;
    }
    .cn-row__icon-slot {
      flex-shrink: 0;
      width: 32px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
    .cn-row__label {
      flex: 1;
      min-width: 0;
      font-family: var(--cn-font-family);
      font-weight: 500;
      font-size: var(--cn-font-row);
      line-height: var(--cn-line-normal);
      color: var(--cn-text-secondary);
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cn-row__value {
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: var(--cn-font-row);
      line-height: var(--cn-line-normal);
      letter-spacing: var(--cn-letter-tight);
      color: var(--cn-text-primary);
      text-align: right;
      font-variant-numeric: tabular-nums;
    }


    /* --- Light row color chip --- */
    .cn-color-chip {
      position: relative;
      width: 32px;
      height: 32px;
      margin-right: 4px;
      border-radius: 50%;
      border: none;
      background: conic-gradient(from 0deg,
        #ef4444, #f59e0b, #fde047, #4ade80, #22d3ee, #6366f1, #a855f7, #ec4899, #ef4444);
      cursor: pointer;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.95);
      box-shadow: inset 0 1px 2px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.28);
      transition: transform 0.12s, box-shadow 0.15s;
      flex-shrink: 0;
    }
    .cn-color-chip:hover { transform: scale(1.08); }
    .cn-color-chip:active { transform: scale(0.94); }
    .cn-color-chip__ring {
      position: absolute;
      inset: 4px;
      border-radius: 50%;
      background: rgba(0,0,0,0.35);
      backdrop-filter: blur(2px);
    }
    .cn-color-chip ha-icon { position: relative; z-index: 1; }

    /* --- iOS-style toggle --- */
    .cn-toggle-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      margin: -10px -8px -10px 0;
    }
    /* --- v0.16 iOS 26 liquid-glass toggle --- */
    .cn-toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 26px;
      border-radius: 13px;
      /* Track: neutral glass (off state) — semi-transparent dark on white cards, gets accent tint on-state */
      background:
        linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.05) 100%) padding-box,
        linear-gradient(145deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.04) 55%, rgba(0,0,0,0.10) 100%) border-box;
      border: 1px solid transparent;
      box-shadow:
        inset 0 1.5px 3px rgba(0,0,0,0.18),
        inset 0 -1px 0 rgba(255,255,255,0.3);
      transition: background 0.25s ease, box-shadow 0.25s ease;
      flex-shrink: 0;
      overflow: hidden;
    }
    .cn-toggle--on {
      background:
        linear-gradient(180deg,
          color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 62%, rgba(255,255,255,0.15)) 0%,
          color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 78%, transparent) 100%) padding-box,
        linear-gradient(145deg,
          color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 80%, rgba(255,255,255,0.4)) 0%,
          color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 40%, rgba(255,255,255,0.1)) 55%,
          color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 60%, rgba(0,0,0,0.15)) 100%) border-box;
      box-shadow:
        inset 0 1.5px 3px color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 40%, rgba(0,0,0,0.15)),
        inset 0 -1px 0 rgba(255,255,255,0.35),
        0 0 10px color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 35%, transparent);
    }
    .cn-toggle__handle {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      /* Liquid glass ball */
      background:
        radial-gradient(65% 65% at 32% 28%,
          rgba(255,255,255,0.98) 0%,
          rgba(255,255,255,0.75) 45%,
          rgba(255,255,255,0.55) 100%);
      box-shadow:
        0 2px 4px rgba(0,0,0,0.28),
        0 1px 1px rgba(0,0,0,0.14),
        inset 0 1px 0 rgba(255,255,255,0.9),
        inset 0 -1px 2px rgba(0,0,0,0.12);
      transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    /* Specular highlight on top of the ball */
    .cn-toggle__handle::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 4px;
      right: 4px;
      height: 40%;
      border-radius: 50% 50% 40% 40% / 60% 60% 30% 30%;
      background: linear-gradient(to bottom,
        rgba(255,255,255,0.85) 0%,
        rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }
    .cn-toggle--on .cn-toggle__handle {
      transform: translateX(18px);
    }

    /* --- slider --- */
    .cn-slider {
      flex: 1;
      min-width: 100px;
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
      border-radius: 2px;
      background: var(--cn-divider);
      outline: none;
      cursor: pointer;
    }
    .cn-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #22d3ee;
      border: 2px solid #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      cursor: pointer;
    }
    .cn-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #22d3ee;
      border: 2px solid #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      cursor: pointer;
    }


    /* --- bar row (v0.9) --- */
    .cn-row--bar {
      align-items: center;
      padding-top: 8px;
      padding-bottom: 8px;
    }
    .cn-row__bar-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .cn-row__bar-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
    }
    .cn-row--bar .cn-row__label {
      flex: 0 1 auto;
    }
    .cn-bar-track {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: var(--cn-divider);
      overflow: hidden;
    }
    .cn-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 300ms ease;
    }
    /* --- chip button (button.* domain) ---
       Sized to match .cn-toggle (40x24) so button.* rows visually align with
       switch.* rows in the same list. Wrapped in the same 44x44 tap target. */
    .cn-chip-btn-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      margin: -10px -8px -10px 0;
    }
    .cn-chip-btn {
      border: none;
      background: var(--cn-toggle-track);
      color: #fff;
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: 13px;
      line-height: 1;
      padding: 0;
      width: 40px;
      height: 24px;
      border-radius: 12px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: opacity 0.15s;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .cn-chip-btn:hover { opacity: 0.85; }
    .cn-chip-btn:active { opacity: 0.6; }
    /* --- volume row (media_player -/+/mute stepper) --- */
    .cn-row--volume { align-items: center; }
    .cn-volstep {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: -2px -8px -2px 0;
    }
    .cn-volstep__val {
      min-width: 42px;
      text-align: center;
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: 13px;
      color: var(--cn-text-primary);
      font-variant-numeric: tabular-nums;
    }
    .cn-volstep__btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 12px;
      border: 1px solid transparent;
      background:
        linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.00) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.18) 100%) border-box;
      backdrop-filter: blur(3px) saturate(140%);
      -webkit-backdrop-filter: blur(3px) saturate(140%);
      color: var(--cn-text-primary);
      font-family: var(--cn-font-family);
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      overflow: hidden;
      isolation: isolate;
      padding: 0;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.32),
        0 2px 4px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.12);
      transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease;
    }
    .cn-volstep__btn::before {
      content: '';
      position: absolute;
      inset: 2px 2px auto 2px;
      height: 45%;
      border-radius: 10px 10px 40% 40% / 10px 10px 100% 100%;
      background: linear-gradient(to bottom, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
      z-index: 1;
    }
    .cn-volstep__btn > * { position: relative; z-index: 2; }
    .cn-volstep__btn:hover { transform: translateY(-1px); }
    .cn-volstep__btn:active { transform: scale(0.97); }
    .cn-volstep__btn--active { color: var(--cn-accent, #22d3ee); }
    .cn-volstep__btn--mute { margin-left: 8px; }

        /* --- v0.15 inline accordion dropdown (replaces native <select>) --- */
    .cn-row--select { align-items: center; }
    .cn-dropdown__current {
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: var(--cn-font-row);
      line-height: var(--cn-line-normal);
      letter-spacing: var(--cn-letter-tight);
      color: var(--cn-text-primary);
      text-align: right;
      font-variant-numeric: tabular-nums;
      margin-right: 2px;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .cn-dropdown__chevron {
      margin-left: 2px;
      margin-right: -4px;
    }
    .cn-dropdown__chevron {
      display: inline-flex;
      align-items: center;
      transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .cn-dropdown__chevron--open { transform: rotate(180deg); }
    .cn-dropdown-anchor { position: relative; }
    .cn-dropdown__backdrop {
      position: fixed;
      inset: 0;
      background: transparent;
      z-index: 9999;
    }
    .cn-dropdown__popover {
      position: absolute;
      top: calc(-6px);
      right: 4px;
      z-index: 20;
      min-width: 160px;
      max-width: 260px;
      background: var(--cn-bg-card, #ffffff);
      color: var(--cn-text-primary, #1a1a1a);
      border: 1px solid rgba(0,0,0,0.10);
      border-radius: 14px;
      box-shadow:
        0 12px 32px rgba(0,0,0,0.18),
        0 2px 6px rgba(0,0,0,0.10);
      padding: 6px;
      overflow: hidden;
      animation: cn-dropdown-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes cn-dropdown-in {
      from { opacity: 0; transform: translateY(-4px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .cn-dropdown__opt {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 9px 10px;
      border-radius: 8px;
      font-family: var(--cn-font-family);
      font-size: 13px;
      font-weight: 500;
      color: var(--cn-text-primary);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: background 0.12s ease;
    }
    .cn-dropdown__opt-lbl { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cn-dropdown__opt:hover { background: rgba(0,0,0,0.05); }
    .cn-dropdown__opt:active { background: rgba(0,0,0,0.08); }
    .cn-dropdown__opt--active { color: var(--cn-accent, #22d3ee); font-weight: 700; }
    .cn-dropdown__check {
      width: 18px; height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* --- v0.14 balls row (Korean 6/45 lotto) --- */
    .cn-row--balls {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding-top: 10px;
      padding-bottom: 10px;
    }
    .cn-row__label--balls { width: 100%; }
    .cn-balls {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
      width: 100%;
    }
    .cn-ball {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      color: #fff;
      font-family: var(--cn-font-family);
      font-weight: 800;
      font-size: 14px;
      letter-spacing: -0.02em;
      box-shadow:
        inset 0 -3px 4px rgba(0, 0, 0, 0.25),
        inset 0 2px 2px rgba(255, 255, 255, 0.35),
        0 2px 4px rgba(0, 0, 0, 0.18);
      text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
    }
    .cn-balls__plus {
      font-family: var(--cn-font-family);
      font-weight: 700;
      font-size: 16px;
      color: var(--cn-text-secondary);
      margin: 0 2px;
    }

    /* --- v0.14 forecast row --- */
    .cn-row--forecast {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
      padding-top: 10px;
      padding-bottom: 10px;
    }
    .cn-forecast {
      display: flex;
      justify-content: space-between;
      gap: 6px;
      width: 100%;
    }
    .cn-forecast__day {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
    .cn-forecast__dow {
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: 13px;
      color: var(--cn-text-secondary);
      letter-spacing: -0.01em;
    }
    .cn-forecast__temps {
      display: inline-flex;
      align-items: baseline;
      gap: 4px;
      font-family: var(--cn-font-family);
      font-variant-numeric: tabular-nums;
    }
    .cn-forecast__hi {
      font-weight: 700;
      font-size: 13px;
      color: var(--cn-text-primary);
    }
    .cn-forecast__lo {
      font-weight: 500;
      font-size: 13px;
      color: var(--cn-text-secondary);
    }

    /* --- calendar_events row --- */
    .cn-cal-list--scroll {
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: rgba(148,163,184,0.35) transparent;
      padding-right: 4px;
    }
    .cn-cal-list--scroll::-webkit-scrollbar {
      width: 6px;
    }
    .cn-cal-list--scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .cn-cal-list--scroll::-webkit-scrollbar-thumb {
      background: rgba(148,163,184,0.28);
      border-radius: 999px;
    }
    .cn-cal-list--scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(148,163,184,0.5);
    }
    .cn-row--calendar {
      cursor: pointer;
      border-radius: 8px;
      transition: background 120ms ease;
    }
    .cn-row--calendar:hover {
      background: rgba(255,255,255,0.04);
    }
    .cn-row--calendar:focus-visible {
      outline: 1px solid rgba(34,211,238,0.5);
      outline-offset: 1px;
    }
    .cn-cal-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 4px 0;
    }
    .cn-cal-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .cn-cal-group__hdr {
      font-family: var(--cn-font-family);
      font-weight: 700;
      font-size: 14px;
      letter-spacing: -0.01em;
      color: var(--cn-text-secondary);
      padding: 6px 4px 2px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.18);
      margin-bottom: 2px;
    }
    .cn-row--calendar {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 4px;
      min-height: 0;
    }
    .cn-row--calendar__dot {
      display: inline-block;
      flex: 0 0 auto;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 8px;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
    }
    .cn-row--calendar__main {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1;
    }
    .cn-row--calendar__head {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
    }
    .cn-row--calendar__date {
      font-family: var(--cn-font-family);
      font-variant-numeric: tabular-nums;
      font-weight: 500;
      font-size: 13px;
      color: var(--cn-text-secondary);
      letter-spacing: -0.01em;
    }
    .cn-row--calendar__title {
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: 15px;
      color: var(--cn-text-primary);
      letter-spacing: -0.01em;
      line-height: 1.3;
    }
    .cn-row--calendar__desc {
      font-family: var(--cn-font-family);
      font-weight: 400;
      font-size: 13px;
      color: var(--cn-text-secondary);
      line-height: 1.35;
      opacity: 0.85;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .cn-row--calendar-empty {
      display: flex;
      justify-content: center;
      padding: 16px 8px;
    }
    .cn-cal-empty {
      font-family: var(--cn-font-family);
      font-weight: 500;
      font-size: 14px;
      color: var(--cn-text-secondary);
      opacity: 0.7;
    }

        .cn-error {
      padding: 16px;
      color: var(--cn-status-error-dot, #f87171);
      font-family: var(--cn-font-family);
      font-weight: 500;
      font-size: 13px;
      line-height: 1.4;
    }
  `;
}
