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
}

export class CardNewsNavTabs extends LitElement {
  @property({ attribute: false }) public hass?: unknown;
  @state() private _config?: CardNewsNavTabsConfig;
  @state() private _currentPath: string = '';
  private _locListener?: () => void;

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
    }
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (typeof window !== 'undefined' && this._locListener) {
      window.removeEventListener('location-changed', this._locListener);
      window.removeEventListener('popstate', this._locListener);
    }
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
