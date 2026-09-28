import { LitElement, css, html, nothing, unsafeCSS, type CSSResultGroup, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

/**
 * cardnews-nav-tabs — icon-only top navigation tab bar.
 * Fixed row of icons, one per view. Current view highlighted with underline.
 * Auto-detects active tab from window.location.pathname (longest prefix match)
 * unless the config overrides via `active`.
 */

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

interface NavTab {
  icon: string;
  label?: string;
  path: string;
  /** Optional stable id used to match `active`. Defaults to path. */
  id?: string;
}

interface CardNewsNavTabsConfig {
  type: string;
  active?: string;
  tabs: NavTab[];
  /** Horizontal swipe on the view moves between tabs. Default true. */
  swipe?: boolean;
  /** Swiping past the last/first tab wraps around. Default false. */
  swipe_wrap?: boolean;
  /** Minimum horizontal travel in px to count as a swipe. Default 60. */
  swipe_threshold?: number;
}

/**
 * Only one nav-tabs instance may act on a given gesture: HA can keep the
 * outgoing view's cards mounted during a transition, so two instances would
 * otherwise navigate twice for one swipe.
 */
let lastSwipeNavAt = 0;

/** Elements whose own horizontal gestures must win over tab switching. */
const SWIPE_BLOCK_TAGS = new Set([
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'HA-SLIDER',
  'HA-CONTROL-SLIDER',
  'HA-CONTROL-CIRCULAR-SLIDER',
  'HA-MORE-INFO-DIALOG',
  'HA-DIALOG',
  'SWIPER-CONTAINER',
  'HUI-VIEW-BADGES',
]);

/** Cardnews modals mount at document.body; never switch tabs behind one. */
const MODAL_SELECTOR =
  'cardnews-light-modal, cardnews-remote-modal, cardnews-tv-remote-modal, cardnews-event-modal, ha-dialog, dialog[open]';

export class CardNewsNavTabs extends LitElement {
  @property({ attribute: false }) public hass?: unknown;
  @state() private _config?: CardNewsNavTabsConfig;
  @state() private _currentPath: string = '';
  private _locListener?: () => void;
  private _touchStart?: { x: number; y: number; t: number };
  private _swipeArmed = false;
  private _onTouchStart?: (ev: TouchEvent) => void;
  private _onTouchEnd?: (ev: TouchEvent) => void;
  private _onTouchCancel?: () => void;

  public setConfig(config: unknown): void {
    const cfg = config as Partial<CardNewsNavTabsConfig> | null;
    if (!cfg || typeof cfg !== 'object') throw new Error('cardnews-nav-tabs: invalid config');
    if (!Array.isArray(cfg.tabs) || cfg.tabs.length === 0) {
      throw new Error('cardnews-nav-tabs: `tabs` must be a non-empty array');
    }
    for (const t of cfg.tabs) {
      if (!t || typeof t !== 'object' || !t.icon || !t.path) {
        throw new Error('cardnews-nav-tabs: each tab requires `icon` and `path`');
      }
    }
    this._config = { type: 'custom:cardnews-nav-tabs', ...cfg } as CardNewsNavTabsConfig;
  }

  public getCardSize(): number {
    return 1;
  }

  /** HA UI Visual Editor. */
  public static async getConfigElement(): Promise<HTMLElement> {
    await import('../editors/cardnews-nav-tabs-editor.js');
    return document.createElement('cardnews-nav-tabs-editor');
  }

  public static getStubConfig(): Partial<CardNewsNavTabsConfig> {
    return {
      tabs: [
        { icon: 'mdi:view-dashboard', label: 'Summary', path: '/cardnews-lab/summary' },
        { icon: 'mdi:flash', label: '에너지', path: '/cardnews-lab/energy' },
      ],
    };
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    if (typeof window !== 'undefined') {
      this._currentPath = window.location.pathname;
      this._locListener = () => {
        this._currentPath = window.location.pathname;
      };
      window.addEventListener('location-changed', this._locListener);
      window.addEventListener('popstate', this._locListener);
      this._attachSwipe();
    }
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (typeof window !== 'undefined' && this._locListener) {
      window.removeEventListener('location-changed', this._locListener);
      window.removeEventListener('popstate', this._locListener);
    }
    this._detachSwipe();
  }

  // ---------------------------------------------------------------- swipe

  private _attachSwipe(): void {
    if (this._onTouchStart) return;
    this._onTouchStart = (ev: TouchEvent) => this._handleTouchStart(ev);
    this._onTouchEnd = (ev: TouchEvent) => this._handleTouchEnd(ev);
    this._onTouchCancel = () => {
      this._touchStart = undefined;
      this._swipeArmed = false;
    };
    // Passive: we never preventDefault, so vertical scrolling stays native.
    window.addEventListener('touchstart', this._onTouchStart, { passive: true });
    window.addEventListener('touchend', this._onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this._onTouchCancel, { passive: true });
  }

  private _detachSwipe(): void {
    if (typeof window === 'undefined') return;
    if (this._onTouchStart) window.removeEventListener('touchstart', this._onTouchStart);
    if (this._onTouchEnd) window.removeEventListener('touchend', this._onTouchEnd);
    if (this._onTouchCancel) window.removeEventListener('touchcancel', this._onTouchCancel);
    this._onTouchStart = undefined;
    this._onTouchEnd = undefined;
    this._onTouchCancel = undefined;
    this._touchStart = undefined;
    this._swipeArmed = false;
  }

  private get _swipeEnabled(): boolean {
    return this._config?.swipe !== false;
  }

  /** This instance is the one the user can actually see. */
  private _isVisible(): boolean {
    const r = this.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  /** True when the gesture started somewhere that owns horizontal movement. */
  private _startsInBlockedArea(ev: TouchEvent): boolean {
    if (document.querySelector(MODAL_SELECTOR)) return true;
    const path = (ev.composedPath?.() ?? []) as EventTarget[];
    for (const node of path) {
      if (!(node instanceof HTMLElement)) continue;
      if (SWIPE_BLOCK_TAGS.has(node.tagName)) return true;
      if (node.hasAttribute('data-no-swipe')) return true;
      if (node.scrollWidth - node.clientWidth > 2) {
        const ox = getComputedStyle(node).overflowX;
        if (ox === 'auto' || ox === 'scroll') return true;
      }
    }
    return false;
  }

  private _handleTouchStart(ev: TouchEvent): void {
    this._touchStart = undefined;
    this._swipeArmed = false;
    if (!this._swipeEnabled || !this._config) return;
    if (ev.touches.length !== 1) return;
    if (!this._isVisible()) return;
    if (this._startsInBlockedArea(ev)) return;
    const t = ev.touches[0];
    this._touchStart = { x: t.clientX, y: t.clientY, t: Date.now() };
    this._swipeArmed = true;
  }

  private _handleTouchEnd(ev: TouchEvent): void {
    const start = this._touchStart;
    const armed = this._swipeArmed;
    this._touchStart = undefined;
    this._swipeArmed = false;
    if (!armed || !start || !this._config) return;
    // A second finger landing mid-gesture (pinch/zoom) disqualifies it.
    if (ev.touches.length > 0) return;
    const t = ev.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dt = Date.now() - start.t;
    const threshold = Math.max(20, this._config.swipe_threshold ?? 60);
    if (dt > 800) return;
    if (Math.abs(dx) < threshold) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.8) return;

    const now = Date.now();
    if (now - lastSwipeNavAt < 400) return;

    const target = this._neighbourTab(dx < 0 ? 1 : -1);
    if (!target) return;
    lastSwipeNavAt = now;
    this._navigate(target.path);
  }

  /** Tab `step` positions from the active one, honouring swipe_wrap. */
  private _neighbourTab(step: number): NavTab | undefined {
    const tabs = this._config?.tabs ?? [];
    if (tabs.length < 2) return undefined;
    const cur = tabs.findIndex((t) => this._isActive(t));
    if (cur < 0) return undefined;
    let next = cur + step;
    if (next < 0 || next >= tabs.length) {
      if (!this._config?.swipe_wrap) return undefined;
      next = (next + tabs.length) % tabs.length;
    }
    return tabs[next];
  }

  private _isActive(tab: NavTab): boolean {
    if (!this._config) return false;
    const active = this._config.active;
    if (active) {
      if (tab.id && tab.id === active) return true;
      // Match against final path segment as a convenience
      const seg = tab.path.split('/').filter(Boolean).pop();
      if (seg && seg === active) return true;
      return false;
    }
    // Auto-detect: longest prefix match against currentPath
    const cur = this._currentPath || '';
    const tabs = this._config.tabs;
    let best: NavTab | undefined;
    let bestLen = -1;
    for (const t of tabs) {
      if (cur === t.path || cur.startsWith(t.path + '/') || cur.startsWith(t.path)) {
        if (t.path.length > bestLen) {
          best = t;
          bestLen = t.path.length;
        }
      }
    }
    return best === tab;
  }

  private _navigate(path: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.history.pushState(null, '', path);
    } catch {
      window.location.assign(path);
      return;
    }
    const ev = new CustomEvent('location-changed', {
      bubbles: true,
      composed: true,
      detail: { replace: false },
    });
    this.dispatchEvent(ev);
    window.dispatchEvent(new Event('location-changed'));
    this._currentPath = window.location.pathname;
  }

  protected override render(): TemplateResult {
    if (!this._config) return html``;
    return html`
      <ha-card class="cn-nav-card">
        <div class="cn-nav-scroll">
          <div class="cn-nav-row" role="tablist">
            ${this._config.tabs.map((tab) => {
              const active = this._isActive(tab);
              const cls = { 'cn-nav-tab': true, 'is-active': active };
              return html`
                <button
                  class=${classMap(cls)}
                  role="tab"
                  aria-selected=${active ? 'true' : 'false'}
                  aria-label=${tab.label ?? tab.path}
                  title=${tab.label ?? ''}
                  @click=${() => this._navigate(tab.path)}
                >
                  <ha-icon .icon=${tab.icon}></ha-icon>
                  <span class="cn-nav-underline" aria-hidden="true"></span>
                </button>
              `;
            })}
          </div>
        </div>
      </ha-card>
    `;
    // suppress unused import
    void nothing;
  }

  static styles: CSSResultGroup = css`
    ${FONT_IMPORT}

    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1;
      font-family: ${unsafeCSS(FONT_STACK)};
      --cn-nav-active: var(--primary-text-color, #1a1a1a);
      --cn-nav-inactive: var(--secondary-text-color, #6b7280);
    }
    .cn-nav-card {
      border-radius: 20px;
      overflow: hidden;
      background: var(--card-background-color, #ffffff);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }
    .cn-nav-scroll {
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .cn-nav-scroll::-webkit-scrollbar {
      display: none;
    }
    .cn-nav-row {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 0;
      padding: 0 4px;
      min-width: 100%;
    }
    .cn-nav-tab {
      position: relative;
      flex: 1 0 auto;
      min-width: 44px;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 12px 10px;
      background: transparent;
      border: 0;
      cursor: pointer;
      color: var(--cn-nav-inactive);
      -webkit-tap-highlight-color: transparent;
      transition: background 120ms ease, color 120ms ease;
      font-family: inherit;
    }
    .cn-nav-tab:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    @media (prefers-color-scheme: dark) {
      .cn-nav-tab:hover {
        background: rgba(255, 255, 255, 0.06);
      }
    }
    .cn-nav-tab:focus-visible {
      outline: 2px solid #22d3ee;
      outline-offset: -2px;
    }
    .cn-nav-tab.is-active {
      color: var(--cn-nav-active);
    }
    .cn-nav-tab ha-icon {
      --mdc-icon-size: 24px;
      width: 24px;
      height: 24px;
      color: inherit;
    }
    .cn-nav-underline {
      position: absolute;
      left: 20%;
      right: 20%;
      bottom: 4px;
      height: 2px;
      border-radius: 2px;
      background: transparent;
      transition: background 150ms ease;
    }
    .cn-nav-tab.is-active .cn-nav-underline {
      background: var(--cn-nav-active);
    }
  `;
}

if (!customElements.get('cardnews-nav-tabs')) {
  customElements.define('cardnews-nav-tabs', CardNewsNavTabs);
}
