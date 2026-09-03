import { css, html, nothing, type CSSResultGroup, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { HeroCardBase } from '../base/HeroCardBase.js';
import type { HeroConfig, ListItem, StatusColor } from '../base/types.js';

/**
 * cardnews-camera-hero — camera card with live stream as the hero.
 * Uses <ha-camera-stream> when the entity supports it, falls back to a
 * polled <img> against the camera's entity_picture. Overlay chips + list
 * rows behave the same as cardnews-hero-info.
 */

interface CardNewsCameraHeroConfig extends HeroConfig {
  type: string;
  camera_entity: string;
  list?: ListItem[];
  /** Fallback image poll interval in ms (default 2000). */
  poll_interval?: number;
  /** Explicit hero height override (e.g. '360px'). */
  hero_height?: string;
}

export class CardNewsCameraHero extends HeroCardBase {
  declare _config: CardNewsCameraHeroConfig;
  @state() private _hasConfig = false;
  @state() private _pollTick = 0;
  @state() private _imgFailed = false;
  /** v0.11 — URL currently visible. Only updated after a successful preload,
   * so the previous frame stays on screen while the new one downloads.
   * Eliminates the white/blank flash between map refreshes. */
  @state() private _displayedSrc?: string;
  private _preloadingSrc?: string;
  private _pollTimer?: ReturnType<typeof setInterval>;

  public override setConfig(config: unknown): void {
    super.setConfig(config);
    const cfg = config as Partial<CardNewsCameraHeroConfig> | null;
    if (!cfg || typeof cfg !== 'object') {
      this._configError = 'Invalid config';
      return;
    }
    if (!cfg.title) {
      this._configError = 'cardnews-camera-hero: `title` is required';
      return;
    }
    if (!cfg.camera_entity || typeof cfg.camera_entity !== 'string') {
      this._configError = 'cardnews-camera-hero: `camera_entity` is required';
      return;
    }
    this._config = {
      type: 'custom:cardnews-camera-hero',
      poll_interval: 2000,
      ...cfg,
    } as CardNewsCameraHeroConfig;
    this._hasConfig = true;
  }

  public static getStubConfig(): Partial<CardNewsCameraHeroConfig> {
    return {
      category: 'BEACON NETWORK',
      title: '주방캠',
      subtitle: '실시간 모니터링 중',
      camera_entity: 'camera.kitchen',
      status_color: 'green',
    };
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this._startPolling();
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopPolling();
  }

  private _startPolling(): void {
    this._stopPolling();
    const interval = this._config?.poll_interval ?? 2000;
    this._pollTimer = setInterval(() => {
      this._pollTick = (this._pollTick + 1) % 100000;
    }, interval);
  }

  private _stopPolling(): void {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = undefined;
    }
  }

  /** v0.11 — preload next frame off-screen; swap visible src on success. */
  private _preloadAndSwap(src: string): void {
    if (this._displayedSrc === src) return;
    if (this._preloadingSrc === src) return;
    this._preloadingSrc = src;
    const img = new Image();
    img.onload = () => {
      if (this._preloadingSrc === src) {
        this._displayedSrc = src;
        this._preloadingSrc = undefined;
        this._imgFailed = false;
      }
    };
    img.onerror = () => {
      if (this._preloadingSrc === src) {
        this._preloadingSrc = undefined;
        this._imgFailed = true;
      }
    };
    img.src = src;
  }

  private _renderCameraMedia(): TemplateResult {
    const cfg = this._config;
    const stateObj = this._entity(cfg.camera_entity);
    if (!stateObj || stateObj.state === 'unavailable') {
      return html`
        <div class="cn-cam-fallback">
          <ha-icon icon="mdi:camera-off"></ha-icon>
          <span>카메라 연결 없음</span>
        </div>
      `;
    }

    // image.* domain — poll entity_picture (map snapshots, etc.)
    const [entDomain] = cfg.camera_entity.split('.');
    if (entDomain === 'image') {
      const pic = stateObj.attributes.entity_picture as string | undefined;
      if (!pic) {
        return html`
          <div class="cn-cam-fallback">
            <ha-icon icon="mdi:image-off"></ha-icon>
            <span>이미지 없음</span>
          </div>
        `;
      }
      // Cache-bust using image_last_updated when available (image entities
      // publish it on each new frame), else use the poll tick.
      const lastUpdated =
        (stateObj.attributes.image_last_updated as string | undefined) ??
        (stateObj.state as string | undefined) ??
        '';
      const bust = lastUpdated
        ? encodeURIComponent(lastUpdated)
        : String(this._pollTick);
      const sep = pic.includes('?') ? '&' : '?';
      const nextSrc = `${pic}${sep}_t=${bust}`;
      // v0.11: preload nextSrc off-screen; only swap displayed src on success.
      // The visible layer keeps the previous frame during download — no flash.
      this._preloadAndSwap(nextSrc);
      const visibleSrc = this._displayedSrc ?? nextSrc;
      // Use a background-image div rather than <img>: many image.* sources
      // (e.g. Ecovacs Deebot maps) return SVGs with no intrinsic width/height,
      // which collapse to a tiny sliver under object-fit:contain. background-
      // image + background-size:contain always fills the container correctly.
      const style = `background-image:url("${visibleSrc}")`;
      return html`
        <div
          class="cn-cam-img cn-cam-img--contain cn-cam-bg"
          role="img"
          aria-label=${cfg.title}
          style=${style}
        ></div>
        ${this._imgFailed && !this._displayedSrc
          ? html`
              <div class="cn-cam-fallback cn-cam-fallback--overlay">
                <ha-icon icon="mdi:image-broken-variant"></ha-icon>
                <span>지도 로딩 실패</span>
              </div>
            `
          : nothing}
      `;
    }

    // Prefer HA's native stream element when available.
    const hasHaCameraStream =
      typeof customElements !== 'undefined' && !!customElements.get('ha-camera-stream');

    if (hasHaCameraStream) {
      // Pass hass + stateObj so ha-camera-stream can negotiate HLS/WebRTC.
      return html`
        <ha-camera-stream
          class="cn-cam-stream"
          .hass=${this.hass as unknown}
          .stateObj=${stateObj as unknown}
          controls=${false}
          muted
          allow-exoplayer
        ></ha-camera-stream>
      `;
    }

    // Fallback: poll the entity_picture as an <img>.
    const pic = stateObj.attributes.entity_picture as string | undefined;
    if (!pic) {
      return html`
        <div class="cn-cam-fallback">
          <ha-icon icon="mdi:camera-off"></ha-icon>
          <span>스트림 없음</span>
        </div>
      `;
    }
    const sep = pic.includes('?') ? '&' : '?';
    const src = `${pic}${sep}_t=${this._pollTick}`;
    return html`<img class="cn-cam-img" src=${src} alt=${cfg.title} loading="lazy" />`;
  }

  private _resolveStatusOverride(): { text?: string; color: StatusColor } {
    const cfg = this._config;
    let text = cfg.status_text;
    if (!text && cfg.status_entity) {
      const e = this._entity(cfg.status_entity);
      if (e) text = e.state;
    }
    return { text, color: (cfg.status_color ?? 'gray') as StatusColor };
  }

  private _renderHero(): TemplateResult {
    const cfg = this._config;
    const status = this._resolveStatusOverride();
    const theme: 'dark' | 'light' = cfg.hero_theme ?? 'dark';
    const heroClasses = {
      'cn-hero': true,
      'cn-hero--lg': cfg.size === 'lg',
      'cn-hero--light': theme === 'light',
      'cn-hero--dark': theme !== 'light',
      'cn-cam-hero': true,
    };
    const heroStyle = cfg.hero_height
      ? `height:${cfg.hero_height};min-height:${cfg.hero_height};aspect-ratio:auto;`
      : '';
    return html`
      <div class=${classMap(heroClasses)} style=${heroStyle}>
        <div class="cn-cam-media">${this._renderCameraMedia()}</div>
        <div class="cn-hero__overlay"></div>
        ${cfg.category
          ? html`
              <div class="cn-category">
                ${cfg.category_icon ? this._renderIcon(cfg.category_icon, 14) : nothing}
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
          <div class="cn-hero__title">${cfg.title}</div>
          ${cfg.subtitle
            ? html`<div class="cn-hero__subtitle">${cfg.subtitle}</div>`
            : nothing}
        </div>
      </div>
    `;
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this._hasConfig || !this._config) return nothing;
    const hero = this._renderHero();
    const list = this.renderList(this._config.list);
    return this.renderCard(hero, list);
  }

  static override styles: CSSResultGroup = [
    HeroCardBase.styles as CSSResultGroup,
    css`
      .cn-cam-hero {
        aspect-ratio: 16 / 9;
        height: auto;
        min-height: var(--cn-hero-height);
        background: #1c1c1e;
        overflow: hidden;
      }
      .cn-cam-media {
        position: absolute;
        inset: 0;
        z-index: 0;
        display: block;
      }
      .cn-cam-media > * {
        width: 100%;
        height: 100%;
      }
      .cn-cam-img,
      .cn-cam-stream {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .cn-cam-img--contain {
        object-fit: contain;
        background: #0a0a0a;
      }
      .cn-cam-bg {
        width: 100%;
        height: 100%;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        background-color: #0a0a0a;
        image-rendering: -webkit-optimize-contrast;
      }
      .cn-cam-img--probe {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      }
      .cn-cam-fallback--overlay {
        position: absolute;
        inset: 0;
        background: rgba(10, 10, 10, 0.85);
      }
      .cn-cam-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #9ca3af;
        background: linear-gradient(135deg, #3a3a3c, #1c1c1e);
      }
      .cn-cam-fallback ha-icon {
        --mdc-icon-size: 48px;
        width: 48px;
        height: 48px;
      }
      .cn-cam-fallback span {
        font-size: 13px;
        font-weight: 500;
      }
    `,
  ];
}

if (!customElements.get('cardnews-camera-hero')) {
  customElements.define('cardnews-camera-hero', CardNewsCameraHero);
}
