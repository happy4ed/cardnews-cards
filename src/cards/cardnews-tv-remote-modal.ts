import { LitElement, css, html, nothing, unsafeCSS, type CSSResultGroup, type TemplateResult } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';
import type { HomeAssistant, HassEntity, HeroAction } from '../base/types.js';

const PRETENDARD_HREF =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';
const FONT_IMPORT = unsafeCSS(`@import url('${PRETENDARD_HREF}');`);
const FONT_STACK = `'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif`;

type AppItem = { label: string; icon?: string; package?: string; url?: string; logo?: string };

@customElement('cardnews-tv-remote-modal')
export class CardnewsTvRemoteModal extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  /** The remote.* entity that sends commands (Android TV Remote 2). */
  @property({ type: String }) public remote = '';
  /** Optional media_player entity representing the TV itself (source/power). */
  @property({ type: String }) public tvEntity = '';
  /** Optional media_player entity that owns the volume (soundbar/AVR). */
  @property({ type: String }) public volumeEntity = '';
  @property({ type: String }) public deviceName = '';
  @property({ attribute: false }) public apps: AppItem[] = [];
  @property({ type: String }) public sourceAppsEntity = '';
  @property({ type: String }) public hdmiSelect = '';
  @property({ type: String }) public hdmiPower = '';
  @property({ type: String }) public hdmiPrev = '';
  @property({ type: String }) public hdmiNext = '';

  @state() private _closing = false;

  private _keydownHandler = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') this._close();
  };

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this._keydownHandler);
    document.body.style.overflow = 'hidden';
  }

  disconnectedCallback(): void {
    document.removeEventListener('keydown', this._keydownHandler);
    document.body.style.overflow = '';
    super.disconnectedCallback();
  }

  private _close(): void {
    if (this._closing) return;
    this._closing = true;
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
      if (this.parentElement) this.parentElement.removeChild(this);
    }, 180);
  }

  private _onBackdrop(ev: MouseEvent): void {
    if ((ev.target as HTMLElement).classList.contains('cn-modal__backdrop')) this._close();
  }

  private _ent(id?: string): HassEntity | undefined {
    if (!id || !this.hass) return undefined;
    return this.hass.states[id];
  }

  private _call(domain: string, service: string, data: Record<string, unknown>): void {
    if (!this.hass) return;
    this.hass.callService(domain, service, data);
  }

  // ---------- commands ----------

  private _sendCmd(command: string): void {
    if (!this.remote) return;
    this._call('remote', 'send_command', { entity_id: this.remote, command });
  }

  private _powerToggle(): void {
    // Prefer remote.turn_on/off (Android TV Remote 2 supports this reliably).
    // If we only have tv_entity (no remote), toggle the media_player.
    const tv = this._ent(this.tvEntity);
    const rem = this._ent(this.remote);
    const isOn = (tv && tv.state !== 'off' && tv.state !== 'unavailable' && tv.state !== 'unknown')
      || (rem && rem.state === 'on');
    if (this.remote) {
      this._call('remote', isOn ? 'turn_off' : 'turn_on', { entity_id: this.remote });
    } else if (this.tvEntity) {
      this._call('media_player.toggle'.split('.')[0], 'toggle', { entity_id: this.tvEntity });
    }
  }

  private _selectSource(src: string): void {
    if (!this.tvEntity) return;
    this._call('media_player', 'select_source', { entity_id: this.tvEntity, source: src });
  }

  private _volTarget(): string | undefined {
    return this.volumeEntity || this.tvEntity || undefined;
  }

  private _volUp(): void {
    const t = this._volTarget();
    if (!t) return;
    this._call('media_player', 'volume_up', { entity_id: t });
  }

  private _volDown(): void {
    const t = this._volTarget();
    if (!t) return;
    this._call('media_player', 'volume_down', { entity_id: t });
  }

  private _volMute(): void {
    const t = this._volTarget();
    if (!t) return;
    const e = this._ent(t);
    const muted = !!e?.attributes.is_volume_muted;
    this._call('media_player', 'volume_mute', { entity_id: t, is_volume_muted: !muted });
  }

  private _launchApp(app: AppItem): void {
    if (!this.remote) return;
    // Android TV Remote 2 integration: remote.turn_on with activity=<url or package>
    const activity = app.url ?? app.package;
    if (activity) {
      this._call('remote', 'turn_on', { entity_id: this.remote, activity });
    }
  }

  // ---------- render ----------

  private _renderHeader(): TemplateResult {
    const title = this.deviceName || 'TV 리모컨';
    const tv = this._ent(this.tvEntity);
    const rem = this._ent(this.remote);
    const isOn = (tv && tv.state !== 'off' && tv.state !== 'unavailable' && tv.state !== 'unknown')
      || (rem && rem.state === 'on');
    return html`
      <div class="cn-modal__head">
        <div class="cn-modal__title">
          <ha-icon .icon=${'mdi:remote-tv'} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
          <span>${title}</span>
        </div>
        <div class="cn-head__right">
          <button
            class="cn-btn cn-btn--pwr-hdr ${isOn ? 'cn-btn--active' : ''}"
            @click=${() => this._powerToggle()}
            title="전원"
          >
            <ha-icon .icon=${'mdi:power'} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
          </button>
          <button class="cn-modal__close" @click=${() => this._close()} aria-label="닫기">
            <ha-icon .icon=${'mdi:close'} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  private _renderSources(): TemplateResult | typeof nothing {
    const tv = this._ent(this.tvEntity);
    const list = (tv?.attributes.source_list as string[] | undefined) ?? [];
    if (!list.length) return nothing;
    // Hide when source_list is actually an app-package list (dotted names or too many entries).
    const looksLikeApps = list.length > 12 || list.filter(x => x.includes('.')).length > list.length * 0.3;
    if (looksLikeApps) return nothing;
    const cur = (tv?.attributes.source as string | undefined) ?? '';
    return html`
      <div class="cn-section">
        <div class="cn-section__label"><span>소스</span></div>
        <div class="cn-seg">
          ${list.map((s) => html`
            <button
              class="cn-btn cn-btn--seg ${cur === s ? 'cn-btn--active' : ''}"
              @click=${() => this._selectSource(s)}
            >${s}</button>
          `)}
        </div>
      </div>
    `;
  }

  private _renderDpad(): TemplateResult {
    return html`
      <div class="cn-section">
        <div class="cn-section__label"><span>방향키</span></div>
        <div class="cn-dpad">
          <div class="cn-dpad__slot cn-dpad__slot--tl"></div>
          <button class="cn-dpad__btn cn-dpad__btn--up" @click=${() => this._sendCmd('DPAD_UP')} title="위">
            <ha-icon .icon=${'mdi:chevron-up'} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
          </button>
          <div class="cn-dpad__slot cn-dpad__slot--tr"></div>
          <button class="cn-dpad__btn cn-dpad__btn--left" @click=${() => this._sendCmd('DPAD_LEFT')} title="왼쪽">
            <ha-icon .icon=${'mdi:chevron-left'} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
          </button>
          <button class="cn-dpad__btn cn-dpad__btn--ok" @click=${() => this._sendCmd('DPAD_CENTER')} title="확인">
            <span>OK</span>
          </button>
          <button class="cn-dpad__btn cn-dpad__btn--right" @click=${() => this._sendCmd('DPAD_RIGHT')} title="오른쪽">
            <ha-icon .icon=${'mdi:chevron-right'} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
          </button>
          <div class="cn-dpad__slot cn-dpad__slot--bl"></div>
          <button class="cn-dpad__btn cn-dpad__btn--down" @click=${() => this._sendCmd('DPAD_DOWN')} title="아래">
            <ha-icon .icon=${'mdi:chevron-down'} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
          </button>
          <div class="cn-dpad__slot cn-dpad__slot--br"></div>
        </div>
        <div class="cn-nav-row">
          <button class="cn-btn cn-btn--nav" @click=${() => this._sendCmd('BACK')} title="뒤로">
            <ha-icon .icon=${'mdi:keyboard-backspace'} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
            <span>BACK</span>
          </button>
          <button class="cn-btn cn-btn--nav" @click=${() => this._sendCmd('HOME')} title="홈">
            <ha-icon .icon=${'mdi:home'} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
            <span>HOME</span>
          </button>
          <button class="cn-btn cn-btn--nav" @click=${() => this._sendCmd('MENU')} title="메뉴">
            <ha-icon .icon=${'mdi:menu'} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
            <span>MENU</span>
          </button>
        </div>
      </div>
    `;
  }

  private _renderVolume(): TemplateResult | typeof nothing {
    const t = this._volTarget();
    if (!t) return nothing;
    const e = this._ent(t);
    const vol = e?.attributes.volume_level;
    const muted = !!e?.attributes.is_volume_muted;
    const volPct = typeof vol === 'number' ? Math.round(vol * 100) : null;
    return html`
      <div class="cn-section">
        <div class="cn-section__label">
          <span>볼륨</span>
          <span class="cn-section__right">
            ${volPct !== null ? html`<span class="cn-section__hint" style="--vc:#22d3ee">${volPct}%</span>` : nothing}
          </span>
        </div>
        <div class="cn-vol-row">
          <button class="cn-btn cn-btn--vol" @click=${() => this._volDown()} title="볼륨 -">
            <ha-icon .icon=${'mdi:volume-minus'} style="--mdc-icon-size:22px;width:22px;height:22px"></ha-icon>
          </button>
          <button class="cn-btn cn-btn--vol" @click=${() => this._volUp()} title="볼륨 +">
            <ha-icon .icon=${'mdi:volume-plus'} style="--mdc-icon-size:22px;width:22px;height:22px"></ha-icon>
          </button>
          <button class="cn-btn cn-btn--vol ${muted ? 'cn-btn--active' : ''}" @click=${() => this._volMute()} title="음소거">
            <ha-icon .icon=${muted ? 'mdi:volume-off' : 'mdi:volume-high'} style="--mdc-icon-size:22px;width:22px;height:22px"></ha-icon>
          </button>
        </div>
      </div>
      <div class="cn-section">
        <div class="cn-section__label"><span>재생 컨트롤</span></div>
        <div class="cn-nav-row cn-media-row">
          <button class="cn-btn cn-btn--nav" @click=${() => this._sendCmd('MEDIA_PREVIOUS')} title="이전 트랙">
            <ha-icon .icon=${'mdi:skip-previous'} style="--mdc-icon-size:22px;width:22px;height:22px"></ha-icon>
          </button>
          <button class="cn-btn cn-btn--nav" @click=${() => this._sendCmd('MEDIA_PLAY_PAUSE')} title="재생/일시정지">
            <ha-icon .icon=${'mdi:play-pause'} style="--mdc-icon-size:24px;width:24px;height:24px"></ha-icon>
          </button>
          <button class="cn-btn cn-btn--nav" @click=${() => this._sendCmd('MEDIA_NEXT')} title="다음 트랙">
            <ha-icon .icon=${'mdi:skip-next'} style="--mdc-icon-size:22px;width:22px;height:22px"></ha-icon>
          </button>
        </div>
        <div class="cn-nav-row cn-nav-row--2 cn-media-row">
          <button class="cn-btn cn-btn--nav" @click=${() => this._sendCmd('MEDIA_REWIND')} title="빨리 감기 뒤로">
            <ha-icon .icon=${'mdi:rewind'} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
          </button>
          <button class="cn-btn cn-btn--nav" @click=${() => this._sendCmd('MEDIA_FAST_FORWARD')} title="빨리 감기 앞으로">
            <ha-icon .icon=${'mdi:fast-forward'} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
          </button>
        </div>
      </div>
      <div class="cn-section">
        <div class="cn-nav-row cn-nav-row--2">
          <button class="cn-btn cn-btn--nav" @click=${() => this._sendCmd('SEARCH')} title="검색">
            <ha-icon .icon=${'mdi:magnify'} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
            <span>검색</span>
          </button>
          <button class="cn-btn cn-btn--nav" @click=${() => this._sendCmd('SETTINGS')} title="설정">
            <ha-icon .icon=${'mdi:cog'} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
            <span>설정</span>
          </button>
        </div>
      </div>
    `;
  }

  private _renderHdmi(): TemplateResult | typeof nothing {
    if (!this.hdmiSelect && !this.hdmiPower && !this.hdmiPrev && !this.hdmiNext) return nothing;
    const sel = this.hdmiSelect ? this._ent(this.hdmiSelect) : undefined;
    const cur = sel?.state ?? '';
    const opts = (sel?.attributes.options as string[] | undefined) ?? [];
    return html`
      <div class="cn-section">
        <div class="cn-section__label">
          <span>HDMI 셀렉터</span>
          ${cur ? html`<span class="cn-section__hint" style="--vc:#22d3ee">포트 ${cur}</span>` : nothing}
        </div>
        <div class="cn-nav-row">
          ${this.hdmiPower ? html`
            <button class="cn-btn cn-btn--nav" @click=${() => this._pressButton(this.hdmiPower)} title="전원">
              <ha-icon .icon=${'mdi:power'} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
              <span>전원</span>
            </button>
          ` : nothing}
          ${this.hdmiPrev ? html`
            <button class="cn-btn cn-btn--nav" @click=${() => this._pressButton(this.hdmiPrev)} title="이전 포트">
              <ha-icon .icon=${'mdi:chevron-left'} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
              <span>이전</span>
            </button>
          ` : nothing}
          ${this.hdmiNext ? html`
            <button class="cn-btn cn-btn--nav" @click=${() => this._pressButton(this.hdmiNext)} title="다음 포트">
              <span>다음</span>
              <ha-icon .icon=${'mdi:chevron-right'} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
            </button>
          ` : nothing}
        </div>
        ${opts.length ? html`
          <div class="cn-apps">
            ${opts.map((o) => html`
              <button class="cn-btn cn-btn--app ${o === cur ? 'cn-btn--active' : ''}"
                      @click=${() => this._selectOption(this.hdmiSelect, o)}>
                <span>${o}</span>
              </button>
            `)}
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _pressButton(entity: string): void {
    if (!entity || !this.hass) return;
    this.hass.callService('button', 'press', { entity_id: entity });
  }

  private _selectOption(entity: string, option: string): void {
    if (!entity || !this.hass) return;
    this.hass.callService('select', 'select_option', { entity_id: entity, option });
  }

  private _appLogoUrl(app: AppItem): string | null {
    if (app.logo) return app.logo;
    // Best-effort: use homarr-labs dashboard-icons CDN by app slug (lowercase, no spaces)
    const slug = (app.label || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g,'');
    if (!slug) return null;
    return `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/${slug}.png`;
  }

  private _autoApps(): AppItem[] {
    if (!this.sourceAppsEntity || !this.hass) return [];
    const e = this.hass.states[this.sourceAppsEntity];
    const list = (e?.attributes.source_list as string[] | undefined) ?? [];
    // Filter out system app packages, keep user-facing entries (no dots, or well-known)
    const isUser = (x: string) => {
      const low = x.toLowerCase();
      if (!x.includes('.')) return true; // friendly names
      if (low.startsWith('com.android') || low.startsWith('com.google.android.ext') || low.startsWith('com.google.android.gms') || low.startsWith('com.google.android.inputmethod') || low.startsWith('com.google.android.tv.remote') || low.includes('.systemui') || low.includes('.providers.') || low.includes(':coreservices')) return false;
      return true;
    };
    return list.filter(isUser).slice(0, 40).map(x => {
      const label = x.includes('.') ? this._pkgToLabel(x) : x;
      const pkg = x.includes('.') ? x : undefined;
      return { label, package: pkg };
    });
  }

  private _pkgToLabel(pkg: string): string {
    const map: Record<string, string> = {
      'com.netflix.ninja': 'Netflix',
      'com.google.android.youtube.tv': 'YouTube',
      'com.disney.disneyplus': 'Disney+',
      'com.apple.atve.androidtv.appletv': 'Apple TV',
      'net.cj.cjhv.gs.tving': 'TVING',
      'com.amazon.amazonvideo.livingroom': 'Prime Video',
      'kr.co.captv.pooqV2': 'Wavve',
      'com.frograms.wplay': 'Watcha',
      'com.coupang.mobile.play': 'Coupang Play',
      'com.hbo.hbonow': 'HBO Max',
      'tv.twitch.android.viewer': 'Twitch',
      'com.plexapp.android': 'Plex',
      'com.spotify.tv.android': 'Spotify',
      'com.google.android.apps.tv.launcherx': 'Google TV',
    };
    if (map[pkg]) return map[pkg];
    // Fallback: last segment title-cased
    const seg = pkg.split('.').pop() || pkg;
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  }

  private _effectiveApps(): AppItem[] {
    const configured = this.apps;
    const auto = this._autoApps();
    if (!auto.length) return configured;
    // Merge — configured take priority; append auto ones not already present (by package)
    const seen = new Set(configured.map(a => a.package).filter(Boolean));
    const merged = [...configured];
    for (const a of auto) {
      if (a.package && seen.has(a.package)) continue;
      merged.push(a);
      if (a.package) seen.add(a.package);
    }
    return merged;
  }

  private _renderApps(): TemplateResult | typeof nothing {
    const apps = this._effectiveApps();
    if (!apps.length) return nothing;
    return html`
      <div class="cn-section">
        <div class="cn-section__label"><span>앱</span></div>
        <div class="cn-apps">
          ${apps.map((app) => {
            const logo = this._appLogoUrl(app);
            return html`
              <button
                class="cn-btn cn-btn--app"
                @click=${() => this._launchApp(app)}
                title=${app.label}
              >
                ${logo
                  ? html`<img class="cn-app-logo" src=${logo} alt="" @error=${(e: Event) => { (e.target as HTMLImageElement).style.display='none'; }} />`
                  : (app.icon
                    ? html`<ha-icon .icon=${app.icon} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>`
                    : nothing)}
                <span>${app.label}</span>
              </button>
            `;
          })}
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    const title = this.deviceName || 'TV 리모컨';
    return html`
      <div class="cn-modal__backdrop ${this._closing ? 'cn-modal__backdrop--closing' : ''}" @click=${this._onBackdrop}>
        <div class="cn-modal ${this._closing ? 'cn-modal--closing' : ''}" role="dialog" aria-modal="true" aria-label=${title}>
          ${this._renderHeader()}
          <div class="cn-modal__body">
            <div class="cn-remote">
              ${this._renderSources()}
              ${this._renderHdmi()}
              ${this._renderDpad()}
              ${this._renderVolume()}
              ${this._renderApps()}
            </div>
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
      --cn-surface-1: rgba(255, 255, 255, 0.06);
      --cn-surface-2: rgba(255, 255, 255, 0.10);
      --cn-surface-hover: rgba(255, 255, 255, 0.14);
      --cn-border: rgba(255, 255, 255, 0.10);
      --cn-border-strong: rgba(255, 255, 255, 0.18);
      --cn-text: #f4f6fb;
      --cn-text-dim: rgba(244, 246, 251, 0.62);
      --cn-text-muted: rgba(244, 246, 251, 0.42);
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
      max-height: min(92vh, 820px);
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
      position: relative;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 12px;
      border-bottom: 1px solid var(--cn-border);
    }
    .cn-modal__title {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--cn-text);
    }
    .cn-modal__title ha-icon { color: var(--cn-text-dim); }
    .cn-head__right { display: inline-flex; align-items: center; gap: 8px; }
    .cn-modal__close {
      width: 32px;
      height: 32px;
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
    .cn-modal__close:hover { background: var(--cn-surface-hover); color: var(--cn-text); }
    .cn-modal__close:active { transform: scale(0.94); }

    .cn-modal__body {
      position: relative;
      z-index: 3;
      padding: 16px 18px 22px;
      overflow-y: auto;
    }

    ha-icon { display: inline-flex; align-items: center; justify-content: center; color: inherit; }

    .cn-remote { display: flex; flex-direction: column; gap: 18px; }

    /* Unified glass button — same look as remote-modal */
    .cn-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-radius: 12px;
      border: 1px solid transparent;
      background:
        linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.00) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.18) 100%) border-box;
      backdrop-filter: blur(3px) saturate(140%);
      -webkit-backdrop-filter: blur(3px) saturate(140%);
      color: rgba(244,246,251,0.78);
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.01em;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      overflow: hidden;
      isolation: isolate;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.32),
        0 2px 4px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.12);
      transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s ease, box-shadow 0.18s ease;
    }
    .cn-btn::before {
      content: '';
      position: absolute;
      inset: 2px 2px auto 2px;
      height: 45%;
      border-radius: 10px 10px 40% 40% / 10px 10px 100% 100%;
      background: linear-gradient(to bottom, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
      z-index: 1;
    }
    .cn-btn > * { position: relative; z-index: 2; }
    .cn-btn:hover:not(:disabled) { color: var(--cn-text); transform: translateY(-1px); }
    .cn-btn:active:not(:disabled) { transform: scale(0.97); }
    .cn-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .cn-btn:focus-visible { outline: 2px solid var(--cn-accent); outline-offset: 2px; }

    .cn-btn--active {
      color: var(--cn-accent);
      background:
        linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.02) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.25) 100%) border-box;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.35),
        0 0 0 1px color-mix(in srgb, var(--cn-accent) 55%, transparent),
        0 0 6px color-mix(in srgb, var(--cn-accent) 35%, transparent),
        inset 0 1px 0 rgba(255, 255, 255, 0.28),
        inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    }
    .cn-btn--active ha-icon { color: var(--cn-accent); }

    /* Power in header */
    .cn-btn--pwr-hdr {
      width: 36px; height: 32px;
      border-radius: 10px;
      --cn-accent: #34d399;
    }

    /* Sections */
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
      gap: 8px;
    }
    .cn-section__right { display: inline-flex; align-items: center; gap: 10px; text-transform: none; letter-spacing: 0; }
    .cn-section__hint {
      font-size: 13px; font-weight: 700; letter-spacing: -0.01em;
      text-transform: none; color: var(--vc, var(--cn-text-muted));
      font-variant-numeric: tabular-nums;
    }

    /* Segmented control */
    .cn-seg { display: flex; gap: 6px; border-radius: 14px; flex-wrap: wrap; }
    .cn-btn--seg { flex: 1; min-height: 40px; border-radius: 10px; font-size: 13px; min-width: 68px; }

    /* D-Pad — 3x3 grid, circular buttons */
    .cn-dpad {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr;
      gap: 8px;
      width: min(240px, 100%);
      aspect-ratio: 1 / 1;
      margin: 0 auto;
      padding: 10px;
      border-radius: 50%;
      background:
        radial-gradient(circle at 50% 45%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.00) 65%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.10) 100%) border-box;
      border: 1px solid transparent;
      box-shadow:
        inset 0 2px 6px rgba(0,0,0,0.30),
        inset 0 -1px 0 rgba(255,255,255,0.05),
        0 4px 14px rgba(0,0,0,0.28);
    }
    .cn-dpad__slot { pointer-events: none; }
    .cn-dpad__btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 1px solid transparent;
      background:
        linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0.20) 100%) border-box;
      color: rgba(244,246,251,0.86);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      overflow: hidden;
      isolation: isolate;
      box-shadow:
        0 6px 14px rgba(0,0,0,0.28),
        inset 0 1px 0 rgba(255,255,255,0.28),
        inset 0 -1px 0 rgba(0,0,0,0.15);
      transition: transform 0.1s ease, color 0.15s ease;
    }
    .cn-dpad__btn::before {
      content: '';
      position: absolute;
      inset: 3px 3px auto 3px;
      height: 45%;
      border-radius: 50% 50% 40% 40% / 50% 50% 100% 100%;
      background: linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
    }
    .cn-dpad__btn > * { position: relative; z-index: 2; }
    .cn-dpad__btn:hover { color: #fff; }
    .cn-dpad__btn:active { transform: scale(0.92); }
    .cn-dpad__btn--ok {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: var(--cn-text);
      background:
        linear-gradient(145deg, rgba(34,211,238,0.14) 0%, rgba(34,211,238,0.04) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.55) 0%, rgba(34,211,238,0.35) 55%, rgba(255,255,255,0.30) 100%) border-box;
      box-shadow:
        0 6px 18px rgba(0,0,0,0.34),
        0 0 12px rgba(34,211,238,0.18),
        inset 0 1px 0 rgba(255,255,255,0.35),
        inset 0 -1px 0 rgba(0,0,0,0.18);
    }

    .cn-nav-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
      margin-top: 4px;
    }
    .cn-nav-row--2 { grid-template-columns: 1fr 1fr; }
    .cn-btn--nav { min-height: 40px; border-radius: 12px; font-size: 12px; gap: 6px; }
    .cn-btn--nav ha-icon { color: var(--cn-text-dim); }

    /* Volume row */
    .cn-vol-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      align-items: center;
      gap: 8px;
    }
    .cn-btn--vol { height: 44px; border-radius: 12px; }
    .cn-vol-row__mid {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 44px;
      color: var(--cn-text-dim);
      background:
        linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.14) 100%) border-box;
      border: 1px solid transparent;
      border-radius: 12px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
    }

    /* Apps chips */
    .cn-app-logo {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .cn-apps {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .cn-btn--app {
      flex: 0 0 auto;
      min-height: 34px;
      padding: 0 12px;
      border-radius: 999px;
      font-size: 12px;
      gap: 5px;
    }
    .cn-btn--app ha-icon { color: var(--cn-text-dim); }

    @media (max-width: 480px) {
      .cn-modal { border-radius: 22px; max-height: 94vh; }
      .cn-dpad { width: min(220px, 100%); }
    }
  `;
}

/**
 * Open a themed TV-remote modal, mounted at document.body.
 */
export function openTvRemoteModal(opts: {
  hass: HomeAssistant;
  action: HeroAction;
  deviceName?: string;
}): { close: () => void } {
  const el = document.createElement('cardnews-tv-remote-modal') as CardnewsTvRemoteModal;
  el.hass = opts.hass;
  el.remote = (opts.action.remote as string) ?? '';
  el.tvEntity = opts.action.tv_entity ?? '';
  el.volumeEntity = opts.action.volume_entity ?? '';
  el.apps = (opts.action.apps as AppItem[]) ?? [];
  el.sourceAppsEntity = (opts.action as any).source_apps_entity ?? '';
  el.hdmiSelect = (opts.action as any).hdmi_select ?? '';
  el.hdmiPower = (opts.action as any).hdmi_power ?? '';
  el.hdmiPrev = (opts.action as any).hdmi_prev ?? '';
  el.hdmiNext = (opts.action as any).hdmi_next ?? '';
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
    'cardnews-tv-remote-modal': CardnewsTvRemoteModal;
  }
}
