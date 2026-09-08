import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface CardnewsReloadBtnConfig {
  type: string;
  icon?: string;
  label?: string;
}

@customElement('cardnews-reload-btn')
export class CardnewsReloadBtn extends LitElement {
  @property({ attribute: false }) hass?: unknown;
  @state() private _cfg?: CardnewsReloadBtnConfig;

  setConfig(cfg: CardnewsReloadBtnConfig) {
    this._cfg = { icon: 'mdi:refresh', ...cfg };
  }

  static styles = css`
    :host { display: block; height: 100%; }
    ha-card {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      height: 100% !important;
      min-height: 36px;
      border-radius: 999px !important;
      padding: 0 !important;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: opacity 0.15s;
      gap: 6px;
    }
    ha-card.with-label {
      padding: 6px 14px 6px 10px !important;
    }
    ha-card.icon-only {
      width: 44px;
      padding: 0 !important;
    }
    ha-card:active { opacity: 0.6; }
    ha-icon {
      --mdc-icon-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--secondary-text-color);
    }
    .label {
      font-size: 13px;
      font-weight: 600;
      color: var(--primary-text-color);
      line-height: 1;
      font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif;
    }
  `;

  render() {
    if (!this._cfg) return html``;
    const label = this._cfg.label;
    return html`
      <ha-card
        class=${label ? 'with-label' : 'icon-only'}
        @click=${() => window.location.reload()}
      >
        <ha-icon icon=${this._cfg.icon || 'mdi:refresh'}></ha-icon>
        ${label ? html`<span class="label">${label}</span>` : ''}
      </ha-card>
    `;
  }

  getCardSize() { return 1; }
  /** HA UI Visual Editor. */
  public static async getConfigElement(): Promise<HTMLElement> {
    await import('../editors/cardnews-reload-btn-editor.js');
    return document.createElement('cardnews-reload-btn-editor');
  }

  static getStubConfig() { return {}; }
}

declare global {
  interface HTMLElementTagNameMap { 'cardnews-reload-btn': CardnewsReloadBtn; }
}
