import { LitElement, css, html, nothing, unsafeCSS, type CSSResultGroup, type TemplateResult } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';
import type { HomeAssistant, HassEntity } from '../base/types.js';

const PRETENDARD_HREF =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';
const FONT_IMPORT = unsafeCSS(`@import url('${PRETENDARD_HREF}');`);
const FONT_STACK = `'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif`;

export type RemoteKind = 'ac' | 'fan' | 'boiler';

@customElement('cardnews-remote-modal')
export class CardnewsRemoteModal extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ type: String }) public kind: RemoteKind = 'ac';
  @property({ type: String }) public entity = '';
  @property({ type: String }) public deviceName = '';

  @state() private _closing = false;
  @state() private _dragValue: number | null = null;
  @state() private _dragging = false;
  @state() private _activeSliderId: string | null = null;
  @state() private _pendingAcTemp: number | null = null;
  private _pendingAcTempTimer: number | null = null;
  @state() private _timerLocal: Record<string, number> = {};
  @state() private _fanLocalPct: number | null = null;

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

  private _ent(): HassEntity | undefined {
    return this.hass?.states[this.entity];
  }

  private _call(domain: string, service: string, data: Record<string, unknown>): void {
    if (!this.hass) return;
    this.hass.callService(domain, service, data);
  }

  // ---------- Slider (shared) ----------

  private _sliderPointerDown(ev: PointerEvent, min: number, max: number, step: number, onCommit: (v: number) => void): void {
    ev.preventDefault();
    const track = ev.currentTarget as HTMLElement;
    track.setPointerCapture(ev.pointerId);
    this._dragging = true;

    const compute = (clientX: number): number => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      const snapped = Math.round(raw / step) * step;
      return Math.max(min, Math.min(max, snapped));
    };

    const move = (e: PointerEvent) => {
      this._dragValue = compute(e.clientX);
    };
    const up = (e: PointerEvent) => {
      const v = compute(e.clientX);
      this._dragValue = null;
      this._dragging = false;
      track.releasePointerCapture(ev.pointerId);
      track.removeEventListener('pointermove', move);
      track.removeEventListener('pointerup', up);
      track.removeEventListener('pointercancel', up);
      onCommit(v);
    };
    track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);
    this._dragValue = compute(ev.clientX);
  }

  private _sliderPointerDownWithId(
    id: string,
    ev: PointerEvent, min: number, max: number, step: number,
    onCommit: (v: number) => void,
  ): void {
    this._activeSliderId = id;
    this._sliderPointerDown(ev, min, max, step, (v) => {
      this._activeSliderId = null;
      onCommit(v);
    });
  }

  /**
   * Bare bar slider — no centered value label (the value lives in the section
   * header). Fill has an accent gradient with a glass sheen overlay so the
   * accent color reads clearly but the pill still looks glassy, not painted.
   */
  private _renderSlider(opts: {
    id?: string;
    value: number;
    min: number;
    max: number;
    step: number;
    disabled?: boolean;
    accent: string;
    onCommit: (v: number) => void;
  }): TemplateResult {
    const id = opts.id ?? 'default';
    const isActive = this._activeSliderId === id;
    const displayValue = isActive && this._dragValue !== null ? this._dragValue : opts.value;
    const clamped = Math.max(opts.min, Math.min(opts.max, displayValue));
    const pct = ((clamped - opts.min) / (opts.max - opts.min)) * 100;
    return html`
      <div class="cn-slider ${opts.disabled ? 'cn-slider--disabled' : ''} ${isActive && this._dragging ? 'cn-slider--drag' : ''}"
           style="--accent:${opts.accent};--pct:${pct}%">
        <div class="cn-slider__track"
             @pointerdown=${(ev: PointerEvent) => !opts.disabled && this._sliderPointerDownWithId(id, ev, opts.min, opts.max, opts.step, opts.onCommit)}>
          <div class="cn-slider__fill"></div>
          <div class="cn-slider__sheen"></div>
        </div>
      </div>
    `;
  }

  // ---------- AC controls ----------

  private _acIsOn(): boolean {
    const e = this._ent();
    return !!e && e.state !== 'off' && e.state !== 'unavailable';
  }

  private _acPower(on: boolean): void {
    const e = this._ent();
    const mode = on ? (e?.attributes.hvac_modes as string[] | undefined)?.find((m) => m === 'cool') ?? 'cool' : 'off';
    this._call('climate', 'set_hvac_mode', { entity_id: this.entity, hvac_mode: mode });
  }

  private _acSetMode(mode: string): void {
    this._call('climate', 'set_hvac_mode', { entity_id: this.entity, hvac_mode: mode });
  }

  private _acSetTemp(temp: number): void {
    this._pendingAcTemp = temp;
    if (this._pendingAcTempTimer) window.clearTimeout(this._pendingAcTempTimer);
    // Clear pending after 4s so HA state takes over.
    this._pendingAcTempTimer = window.setTimeout(() => { this._pendingAcTemp = null; }, 4000);
    this._call('climate', 'set_temperature', { entity_id: this.entity, temperature: temp });
  }

  private _acBumpTemp(delta: number): void {
    const e = this._ent();
    if (!e) return;
    const cur = this._pendingAcTemp ?? (Number(e.attributes.temperature) || 24);
    const min = Number(e.attributes.min_temp) || 18;
    const max = Number(e.attributes.max_temp) || 30;
    const next = Math.max(min, Math.min(max, cur + delta));
    this._acSetTemp(next);
  }

  private _acSetFan(mode: string): void {
    this._call('climate', 'set_fan_mode', { entity_id: this.entity, fan_mode: mode });
  }

  /** Derive room prefix like 'livingroom_lg' from 'climate.livingroom_lg_ac'. */
  private _acRoomPrefix(): string | null {
    const local = this.entity.split('.')[1] ?? '';
    const m = local.match(/^(.*?_lg)_/);
    return m ? m[1] : null;
  }

  private _acExtraSwitches(): { entity: string; label: string; icon: string }[] {
    const room = this._acRoomPrefix();
    if (!room || !this.hass) return [];
    const candidates: { suffix: string; label: string; icon: string }[] = [
      { suffix: 'supsogbaram',    label: '숲속바람',   icon: 'mdi:pine-tree' },
      { suffix: 'kulpaweo',       label: '쿨파워',     icon: 'mdi:snowflake-variant' },
      { suffix: 'jwaubaram',      label: '좌우바람',   icon: 'mdi:arrow-left-right' },
      { suffix: 'sanghabaram',    label: '상하바람',   icon: 'mdi:arrow-up-down' },
      { suffix: 'gonggiceongjeong', label: '공기청정', icon: 'mdi:air-purifier' },
      { suffix: 'jadonggeonjo',   label: '자동건조',   icon: 'mdi:hair-dryer' },
      { suffix: 'jeoljeon',       label: '절전',       icon: 'mdi:leaf' },
    ];
    return candidates
      .map((c) => ({ entity: `switch.${room}_${c.suffix}`, label: c.label, icon: c.icon }))
      .filter((c) => !!this.hass!.states[c.entity]);
  }

  private _numAttrs(entity?: string): { min: number; max: number; step: number; value: number } {
    const st = entity ? this.hass?.states[entity] : undefined;
    const a = st?.attributes ?? {};
    return {
      min: Number(a.min ?? 0),
      max: Number(a.max ?? 12),
      step: Number(a.step ?? 0.5),
      value: Number(st?.state ?? 0),
    };
  }

  private _acTimerEntities(): { on?: string; off?: string; onBtn?: string; offBtn?: string; cancelBtn?: string; trop?: string; tropBtn?: string } {
    const room = this._acRoomPrefix();
    if (!room || !this.hass) return {};
    const st = this.hass.states;
    const on = `number.${room}_kyeojim_yeyag_sigan`;
    const off = `number.${room}_ggeojim_yeyag_sigan`;
    const onBtn = `button.${room}_kyeojim_yeyag_balsa`;
    const offBtn = `button.${room}_ggeojim_yeyag_balsa`;
    const cancelBtn = `button.${room}_yeyaghaeje`;
    const trop = `number.${room}_yeoldaeya_sigan`;
    const tropBtn = `button.${room}_yeoldaeya_balsa`;
    return {
      on: st[on] ? on : undefined,
      off: st[off] ? off : undefined,
      onBtn: st[onBtn] ? onBtn : undefined,
      offBtn: st[offBtn] ? offBtn : undefined,
      cancelBtn: st[cancelBtn] ? cancelBtn : undefined,
      trop: st[trop] ? trop : undefined,
      tropBtn: st[tropBtn] ? tropBtn : undefined,
    };
  }

  private _timerLsKey(numberEntity: string): string {
    return `cardnews.timerLocal.${numberEntity}`;
  }

  private _setTimerLocal(numberEntity: string, value: number): void {
    this._timerLocal = { ...this._timerLocal, [numberEntity]: value };
    try { localStorage.setItem(this._timerLsKey(numberEntity), String(value)); } catch {}
  }

  private _readTimerLocal(numberEntity: string): number | null {
    if (numberEntity in this._timerLocal) return this._timerLocal[numberEntity];
    try {
      const v = localStorage.getItem(this._timerLsKey(numberEntity));
      if (v !== null && v !== '') return Number(v);
    } catch {}
    return null;
  }

  private _timerDisplayValue(numberEntity: string): number {
    const local = this._readTimerLocal(numberEntity);
    if (local !== null) return local;
    return Number(this.hass?.states[numberEntity]?.state ?? 0);
  }

  private _timerHasChange(numberEntity: string): boolean {
    const local = this._readTimerLocal(numberEntity);
    if (local === null) return false;
    const haVal = Number(this.hass?.states[numberEntity]?.state ?? 0);
    return local !== haVal;
  }

  private _applyTimer(numberEntity: string, fireBtn?: string): void {
    const value = this._timerDisplayValue(numberEntity);
    this._call('number', 'set_value', { entity_id: numberEntity, value });
    if (fireBtn) {
      window.setTimeout(() => this._call('button', 'press', { entity_id: fireBtn }), 300);
    }
    // After apply, clear local so future opens track HA state (unless user drags again).
    try { localStorage.removeItem(this._timerLsKey(numberEntity)); } catch {}
    const { [numberEntity]: _, ...rest } = this._timerLocal;
    this._timerLocal = rest;
  }

  // ---------------------------------------------------------------- boiler

  /** 보일러(SiHAS BCM) 관련 엔티티. climate entity_id 에서 규칙대로 유도한다. */
  private _boilerEntities(): {
    mode?: string;
    room?: string;
    onsu?: string;
    away?: string;
    cur?: string;
  } {
    const base = this.entity.split('.')[1] ?? '';
    const states = this.hass?.states ?? {};
    const pick = (id: string): string | undefined => (states[id] ? id : undefined);
    return {
      mode: pick(`select.${base}_operation_mode`),
      room: pick(`number.${base}_room_temp`),
      onsu: pick(`number.${base}_hot_water_temp`),
      away: pick(`switch.${base}_away_mode`),
      cur: pick(`sensor.${base}_current_hot_water`),
    };
  }

  private _numState(entityId?: string): { value: number | null; usable: boolean; min: number; max: number } {
    const st = entityId ? this.hass?.states[entityId] : undefined;
    const usable = !!st && st.state !== 'unavailable' && st.state !== 'unknown';
    return {
      value: usable ? Number(st?.state) : null,
      usable,
      min: Number(st?.attributes.min ?? 0),
      max: Number(st?.attributes.max ?? 100),
    };
  }

  private _boilerPower(on: boolean): void {
    this.hass?.callService('climate', 'set_hvac_mode', {
      entity_id: this.entity,
      hvac_mode: on ? 'auto' : 'off',
    });
  }

  private _boilerSetMode(selEntity: string, option: string): void {
    this.hass?.callService('select', 'select_option', { entity_id: selEntity, option });
  }

  private _boilerBump(entityId: string, delta: number): void {
    const { value, usable, min, max } = this._numState(entityId);
    if (!usable || value === null) return;
    const next = Math.min(max, Math.max(min, value + delta));
    if (next === value) return;
    this.hass?.callService('number', 'set_value', { entity_id: entityId, value: next });
  }

  private _boilerToggleSwitch(entityId: string, on: boolean): void {
    this.hass?.callService('switch', on ? 'turn_on' : 'turn_off', { entity_id: entityId });
  }

  private _boilerSetSchedule(scheduled: boolean): void {
    this.hass?.callService('climate', 'set_hvac_mode', {
      entity_id: this.entity,
      hvac_mode: scheduled ? 'heat' : 'auto',
    });
  }

  private _renderBoiler(): TemplateResult {
    const e = this._ent();
    const isOn = !!e && e.state !== 'off' && e.state !== 'unavailable';
    const ids = this._boilerEntities();
    const modeSt = ids.mode ? this.hass?.states[ids.mode] : undefined;
    const options = (modeSt?.attributes.options as string[] | undefined) ?? [];
    const curMode = modeSt?.state ?? '';
    const room = this._numState(ids.room);
    const onsu = this._numState(ids.onsu);
    const awaySt = ids.away ? this.hass?.states[ids.away] : undefined;
    const isAway = awaySt ? awaySt.state === 'on' : e?.state === 'fan_only';
    const isSched = e?.state === 'heat';
    const curOnsu = ids.cur ? this.hass?.states[ids.cur]?.state : undefined;
    const roomCur = e?.attributes.current_temperature;

    const modeIcon: Record<string, string> = {
      '실내': 'mdi:home-thermometer',
      '온수': 'mdi:water-boiler',
      '실내+온수': 'mdi:home-plus',
    };

    return html`
      <div class="cn-remote cn-remote--boiler">
        <!-- 전원 + 실내 설정온도 -->
        <div class="cn-row cn-row--power">
          <button
            class="cn-btn cn-btn--power ${isOn ? 'cn-btn--active' : ''}"
            @click=${() => this._boilerPower(!isOn)}
            title="전원"
          >
            <ha-icon .icon=${'mdi:power'} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
          </button>
          <div class="cn-tempctl">
            <button
              class="cn-btn cn-btn--step"
              ?disabled=${!ids.room || !room.usable}
              @click=${() => ids.room && this._boilerBump(ids.room, -1)}
            >−</button>
            <div class="cn-tempctl__val">
              ${room.usable ? room.value : '—'}<sup class="cn-tempctl__unit">°C</sup>
            </div>
            <button
              class="cn-btn cn-btn--step"
              ?disabled=${!ids.room || !room.usable}
              @click=${() => ids.room && this._boilerBump(ids.room, 1)}
            >+</button>
          </div>
        </div>

        <!-- 운전 모드 -->
        ${ids.mode && options.length
          ? html`
              <div class="cn-section">
                <div class="cn-section__label"><span>운전 모드</span></div>
                <div class="cn-seg">
                  ${options.map(
                    (o) => html`
                      <button
                        class="cn-btn cn-btn--seg ${curMode === o ? 'cn-btn--active' : ''}"
                        ?disabled=${!isOn}
                        @click=${() => this._boilerSetMode(ids.mode as string, o)}
                      >
                        <ha-icon
                          .icon=${modeIcon[o] ?? 'mdi:circle-small'}
                          style="--mdc-icon-size:16px;width:16px;height:16px"
                        ></ha-icon>
                        <span>${o}</span>
                      </button>
                    `,
                  )}
                </div>
              </div>
            `
          : nothing}

        <!-- 온수 설정온도 -->
        ${ids.onsu
          ? html`
              <div class="cn-section">
                <div class="cn-section__label">
                  <span>온수 온도</span>
                  ${curOnsu !== undefined && curOnsu !== 'unavailable'
                    ? html`<span class="cn-section__hint">현재 ${curOnsu}°C</span>`
                    : nothing}
                </div>
                <div class="cn-tempctl cn-tempctl--wide">
                  <button
                    class="cn-btn cn-btn--step"
                    ?disabled=${!onsu.usable}
                    @click=${() => ids.onsu && this._boilerBump(ids.onsu, -1)}
                  >−</button>
                  <div class="cn-tempctl__val">
                    ${onsu.usable ? onsu.value : '—'}<sup class="cn-tempctl__unit">°C</sup>
                  </div>
                  <button
                    class="cn-btn cn-btn--step"
                    ?disabled=${!onsu.usable}
                    @click=${() => ids.onsu && this._boilerBump(ids.onsu, 1)}
                  >+</button>
                </div>
              </div>
            `
          : nothing}

        <!-- 재실/외출 · 수동/예약 -->
        <div class="cn-section">
          <div class="cn-section__label">
            <span>재실 상태</span>
            ${roomCur !== undefined ? html`<span class="cn-section__hint">실내 ${roomCur}°C</span>` : nothing}
          </div>
          <div class="cn-seg">
            <button
              class="cn-btn cn-btn--seg ${!isAway ? 'cn-btn--active' : ''}"
              ?disabled=${!isOn}
              @click=${() =>
                ids.away
                  ? this._boilerToggleSwitch(ids.away, false)
                  : this.hass?.callService('climate', 'set_hvac_mode', {
                      entity_id: this.entity,
                      hvac_mode: 'auto',
                    })}
            >
              <ha-icon .icon=${'mdi:home'} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
              <span>재실</span>
            </button>
            <button
              class="cn-btn cn-btn--seg ${isAway ? 'cn-btn--active' : ''}"
              ?disabled=${!isOn}
              @click=${() =>
                ids.away
                  ? this._boilerToggleSwitch(ids.away, true)
                  : this.hass?.callService('climate', 'set_hvac_mode', {
                      entity_id: this.entity,
                      hvac_mode: 'fan_only',
                    })}
            >
              <ha-icon .icon=${'mdi:walk'} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
              <span>외출</span>
            </button>
          </div>
        </div>

        <div class="cn-section">
          <div class="cn-section__label"><span>운전 방식</span></div>
          <div class="cn-seg">
            <button
              class="cn-btn cn-btn--seg ${!isSched ? 'cn-btn--active' : ''}"
              ?disabled=${!isOn}
              @click=${() => this._boilerSetSchedule(false)}
            >
              <ha-icon .icon=${'mdi:pencil'} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
              <span>수동</span>
            </button>
            <button
              class="cn-btn cn-btn--seg ${isSched ? 'cn-btn--active' : ''}"
              ?disabled=${!isOn}
              @click=${() => this._boilerSetSchedule(true)}
            >
              <ha-icon .icon=${'mdi:clock-outline'} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
              <span>예약</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderAc(): TemplateResult {
    const e = this._ent();
    const isOn = !!e && e.state !== 'off' && e.state !== 'unavailable';
    const hvacModes = ((e?.attributes.hvac_modes as string[] | undefined) ?? ['off','cool','dry','fan_only','auto']).filter(m => m !== 'off');
    const fanModes = (e?.attributes.fan_modes as string[] | undefined) ?? ['low','mid','high','auto'];
    const rawMode = e?.state ?? 'off';
    const curMode = rawMode === 'off' ? ((e?.attributes.hvac_modes as string[] | undefined)?.find(m => m !== 'off') ?? 'cool') : rawMode;
    const curFan = (e?.attributes.fan_mode as string | undefined) ?? '';
    const curTemp = this._pendingAcTemp ?? (Number(e?.attributes.temperature) || 24);
    const min = Number(e?.attributes.min_temp) || 18;
    const max = Number(e?.attributes.max_temp) || 30;

    const modeLabel: Record<string,string> = { cool: '냉방', dry: '제습', fan_only: '송풍', auto: '자동', heat: '난방' };
    const modeIcon: Record<string,string> = { cool: 'mdi:snowflake', dry: 'mdi:water-percent', fan_only: 'mdi:fan', auto: 'mdi:refresh-auto', heat: 'mdi:fire' };
    const fanLabel: Record<string,string> = { low: '약', mid: '중', high: '강', auto: '자동' };

    return html`
      <div class="cn-remote cn-remote--ac">
        <!-- Power + temp -->
        <div class="cn-row cn-row--power">
          <button
            class="cn-btn cn-btn--power ${isOn ? 'cn-btn--active' : ''}"
            @click=${() => this._acPower(!isOn)}
            title="전원"
          >
            <ha-icon .icon=${'mdi:power'} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
          </button>
          <div class="cn-tempctl">
            <button class="cn-btn cn-btn--step" @click=${() => this._acBumpTemp(-1)} ?disabled=${!isOn || curTemp <= min}>−</button>
            <div class="cn-tempctl__val">${curTemp}<sup class="cn-tempctl__unit">°C</sup></div>
            <button class="cn-btn cn-btn--step" @click=${() => this._acBumpTemp(1)} ?disabled=${!isOn || curTemp >= max}>+</button>
          </div>
        </div>

        <!-- Mode segmented -->
        <div class="cn-section">
          <div class="cn-section__label"><span>운전 모드</span></div>
          <div class="cn-seg">
            ${hvacModes.map(m => html`
              <button
                class="cn-btn cn-btn--seg ${curMode === m ? 'cn-btn--active' : ''}"
                ?disabled=${!isOn}
                @click=${() => this._acSetMode(m)}
              >
                <ha-icon .icon=${modeIcon[m] ?? 'mdi:circle-small'} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
                <span>${modeLabel[m] ?? m}</span>
              </button>
            `)}
          </div>
        </div>

        <!-- Fan speed segmented -->
        <div class="cn-section">
          <div class="cn-section__label"><span>바람 세기</span></div>
          <div class="cn-seg">
            ${fanModes.map(f => html`
              <button
                class="cn-btn cn-btn--seg ${curFan === f ? 'cn-btn--active' : ''}"
                @click=${() => this._acSetFan(f)}
                ?disabled=${!isOn}
              >
                <span>${fanLabel[f] ?? f}</span>
              </button>
            `)}
          </div>
        </div>

        ${this._renderAcExtras()}
        ${this._renderAcTimer()}
      </div>
    `;
  }

  private _renderAcExtras(): TemplateResult | typeof nothing {
    const extras = this._acExtraSwitches();
    if (!extras.length) return nothing;
    return html`
      <div class="cn-section">
        <div class="cn-section__label"><span>부가 기능</span></div>
        <div class="cn-extras">
          ${extras.map((x) => {
            const st = this.hass?.states[x.entity];
            const on = st?.state === 'on';
            const toggle = () => this._call('switch', 'toggle', { entity_id: x.entity });
            return html`
              <button
                class="cn-btn cn-btn--extra ${on ? 'cn-btn--active' : ''}"
                ?disabled=${!this._acIsOn()}
                @click=${toggle}
                title=${x.label}
              >
                <ha-icon .icon=${x.icon} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
                <span class="cn-extra__label">${x.label}</span>
                <span class="cn-extra__pill ${on ? 'cn-extra__pill--on' : ''}">
                  <span class="cn-extra__dot"></span>
                </span>
              </button>
            `;
          })}
        </div>
      </div>
    `;
  }

  private _renderAcTimer(): TemplateResult | typeof nothing {
    const t = this._acTimerEntities();
    if (!t.on && !t.off && !t.cancelBtn) return nothing;
    // Section-header summary uses LOCAL pending value if any (so header
    // reflects what will be sent when 설정 is pressed), else HA state.
    const renderTimerRow = (
      id: string,
      numberEntity: string,
      fireBtn: string | undefined,
      label: string,
      accent: string,
      step: number,
      snap?: (v: number) => number,
      fmt?: (v: number) => string,
    ) => {
      const a = this._numAttrs(numberEntity);
      const localVal = this._timerDisplayValue(numberEntity);
      const isDragging = this._activeSliderId === id && this._dragValue !== null;
      const dispRaw = isDragging ? this._dragValue! : localVal;
      const finalSnap = snap ?? ((v: number) => v);
      const finalFmt = fmt ?? ((v: number) => v <= 0 ? '해제' : `${v}h`);
      const changed = this._timerHasChange(numberEntity);
      return html`
        <div class="cn-timer-row">
          <div class="cn-timer-row__head">
            <span class="cn-timer-row__label">
              <span>${label}</span>
              <span class="cn-timer-row__label-sep">·</span>
              <span class="cn-timer-row__label-val" style="--vc:${accent}">${finalFmt(finalSnap(dispRaw))}</span>
            </span>
          </div>
          <div class="cn-timer-row__body">
            ${this._renderSlider({
              id,
              value: localVal, min: a.min, max: a.max, step,
              accent,
              onCommit: (v) => this._setTimerLocal(numberEntity, finalSnap(v)),
            })}
            <button
              class="cn-btn cn-btn--chip cn-btn--apply ${changed ? 'cn-btn--active' : ''}"
              @click=${() => this._applyTimer(numberEntity, fireBtn)}
              title="설정 전송"
              style="--cn-accent:${accent}"
            >설정</button>
          </div>
        </div>
      `;
    };
    const tropSnap = (v: number) => v <= 0 ? 0 : v < 0.75 ? 0.5 : Math.round(v);
    const tropFmt = (v: number) => v <= 0 ? '해제' : v < 1 ? '30분' : `${v}h`;
    return html`
      <div class="cn-section">
        <div class="cn-section__label">
          <span>예약 타이머</span>
          <span class="cn-section__right">
            ${t.cancelBtn ? html`
              <button
                class="cn-btn cn-btn--chip cn-btn--chip-danger"
                @click=${() => this._call('button', 'press', { entity_id: t.cancelBtn! })}
                title="모든 예약 취소"
              >
                <ha-icon .icon=${'mdi:close-circle-outline'} style="--mdc-icon-size:14px;width:14px;height:14px"></ha-icon>
                <span>예약 취소</span>
              </button>
            ` : nothing}
          </span>
        </div>
        ${t.on ? renderTimerRow('timer-on', t.on, t.onBtn, '켜짐 예약', '#22d3ee', 1) : nothing}
        ${t.off ? renderTimerRow('timer-off', t.off, t.offBtn, '꺼짐 예약', '#f59e0b', 1) : nothing}
        ${t.trop ? renderTimerRow('timer-trop', t.trop, t.tropBtn, '열대야 모드', '#a855f7', 0.5, tropSnap, tropFmt) : nothing}
      </div>
    `;
  }

  // ---------- Fan controls ----------

  private _fanEnt(): HassEntity | undefined {
    return this.hass?.states[this.entity];
  }

  private _fanIsButton(): boolean {
    return this.entity.startsWith('button.');
  }

  private _fanPowerToggle(): void {
    const [domain] = this.entity.split('.');
    if (domain === 'button') {
      this._call('button', 'press', { entity_id: this.entity });
    } else if (domain === 'fan') {
      this._call('fan', 'toggle', { entity_id: this.entity });
    } else if (domain === 'switch') {
      this._call('switch', 'toggle', { entity_id: this.entity });
    }
  }

  private _fanIrButtons(): { key: string; label: string; icon: string }[] {
    // For IR button-based fans (안방), sibling button.<room>_seonpunggi_<fn>.
    if (!this.entity.startsWith('button.') || !this.hass) return [];
    const m = this.entity.match(/^button\.(.+)_seonpunggi_(?:jeonweon)$/);
    if (!m) return [];
    const room = m[1];
    const st = this.hass.states;
    const candidates: { key: string; label: string; icon: string }[] = [
      { key: `button.${room}_seonpunggi_pungsog`,      label: '풍속+',  icon: 'mdi:arrow-up-bold' },
      { key: `button.${room}_seonpunggi_pungsog_2`,    label: '풍속−',  icon: 'mdi:arrow-down-bold' },
      { key: `button.${room}_seonpunggi_gagdo`,        label: '각도',   icon: 'mdi:angle-acute' },
      { key: `button.${room}_seonpunggi_modeu`,        label: '모드',   icon: 'mdi:sync' },
      { key: `button.${room}_seonpunggi_hoejeon`,      label: '회전',   icon: 'mdi:rotate-3d-variant' },
      { key: `button.${room}_seonpunggi_cwicim`,       label: '취침',   icon: 'mdi:power-sleep' },
      { key: `button.${room}_seonpunggi_taimeo`,       label: '타이머', icon: 'mdi:timer-outline' },
    ];
    return candidates.filter(c => !!st[c.key]);
  }

  private _fanPressIr(entityId: string): void {
    this._call('button', 'press', { entity_id: entityId });
  }

  private _fanSetPct(pct: number): void {
    this._call('fan', 'set_percentage', { entity_id: this.entity, percentage: pct });
    this._fanLocalPct = null;
  }

  private _fanSetPreset(preset: string): void {
    this._call('fan', 'set_preset_mode', { entity_id: this.entity, preset_mode: preset });
  }

  private _fanOscillate(v: boolean): void {
    this._call('fan', 'oscillate', { entity_id: this.entity, oscillating: v });
  }

  private _fanSetProperty(prop: string, value: unknown): void {
    // Xiaomi Miot / Dmaker fan uses xiaomi_miot.set_property to change extras like vertical swing.
    this._call('xiaomi_miot', 'set_property', {
      entity_id: this.entity,
      field: prop,
      value: value,
    });
  }

  private _renderFan(): TemplateResult {
    const e = this._fanEnt();
    // const isButton = this._fanIsButton();
    const isFan = this.entity.startsWith('fan.');
    const isOn = !!e && e.state === 'on';
    const pct = Number(e?.attributes.percentage) || 0;
    const localPct = this._fanLocalPct ?? pct;
    const displayPct = this._activeSliderId === 'fan-pct' && this._dragValue !== null
      ? Math.round(this._dragValue) : localPct;
    const pctChanged = this._fanLocalPct !== null && this._fanLocalPct !== pct;
    const oscillating = !!e?.attributes.oscillating;
    const presets = (e?.attributes.preset_modes as string[] | undefined) ?? [];
    const curPreset = (e?.attributes.preset_mode as string | undefined) ?? '';

    const presetLabel: Record<string,string> = {
      'Straight Wind': '직바람',
      'Natural Wind': '자연풍',
      'Smart': '스마트',
      'Sleep': '수면',
    };

    return html`
      <div class="cn-remote cn-remote--fan">
        ${isFan ? html`
          <div class="cn-row cn-row--power">
            <button
              class="cn-btn cn-btn--power ${isOn ? 'cn-btn--active' : ''}"
              @click=${() => this._fanPowerToggle()}
              title="전원"
            >
              <ha-icon .icon=${'mdi:power'} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
            </button>
            <div class="cn-tempctl">
              <button class="cn-btn cn-btn--step" @click=${() => this._fanSetPct(Math.max(10, displayPct - 5))} ?disabled=${!isOn}>−</button>
              <div class="cn-tempctl__val">${displayPct}<sup class="cn-tempctl__unit">%</sup></div>
              <button class="cn-btn cn-btn--step" @click=${() => this._fanSetPct(Math.min(100, displayPct + 5))} ?disabled=${!isOn}>+</button>
            </div>
          </div>
        ` : nothing}

        ${isFan ? html`
          <div class="cn-section">
            <div class="cn-section__label">
              <span>세기 조절</span>
              <span class="cn-section__right">
                <span class="cn-section__hint" style="--vc:#a78bfa">${displayPct}%</span>
              </span>
            </div>
            ${this._renderSlider({
              id: 'fan-pct',
              value: pct,
              min: 10, max: 100, step: 5,
              disabled: !isOn,
              accent: '#a78bfa',
              onCommit: (v) => this._fanSetPct(v),
            })}
          </div>

          ${presets.length ? html`
            <div class="cn-section">
              <div class="cn-section__label"><span>모드</span></div>
              <div class="cn-seg">
                ${presets.map(p => html`
                  <button
                    class="cn-btn cn-btn--seg ${curPreset === p ? 'cn-btn--active' : ''}"
                    @click=${() => this._fanSetPreset(p)}
                    ?disabled=${!isOn}
                  >${presetLabel[p] ?? p}</button>
                `)}
              </div>
            </div>
          ` : nothing}

          <div class="cn-section">
            <div class="cn-section__label"><span>좌우 회전</span></div>
            <div class="cn-seg">
              <button class="cn-btn cn-btn--seg ${oscillating ? 'cn-btn--active' : ''}" @click=${() => this._fanOscillate(true)} ?disabled=${!isOn}>ON</button>
              <button class="cn-btn cn-btn--seg ${!oscillating ? 'cn-btn--active' : ''}" @click=${() => this._fanOscillate(false)} ?disabled=${!isOn}>OFF</button>
            </div>
          </div>

          ${e?.attributes['fan.vertical_swing'] !== undefined ? (() => {
            const vsw = !!e!.attributes['fan.vertical_swing'];
            return html`
              <div class="cn-section">
                <div class="cn-section__label"><span>상하 회전</span></div>
                <div class="cn-seg">
                  <button class="cn-btn cn-btn--seg ${vsw ? 'cn-btn--active' : ''}" @click=${() => this._fanSetProperty('fan.vertical_swing', true)} ?disabled=${!isOn}>ON</button>
                  <button class="cn-btn cn-btn--seg ${!vsw ? 'cn-btn--active' : ''}" @click=${() => this._fanSetProperty('fan.vertical_swing', false)} ?disabled=${!isOn}>OFF</button>
                </div>
              </div>
            `;
          })() : nothing}
        ` : nothing}
        ${!isFan ? (() => {
          const ir = Object.fromEntries(this._fanIrButtons().map(b => [b.key.split('_').pop() ?? b.key, b]));
          const mode = ir['modeu'];
          const spdUp = ir['pungsog'];
          const spdDn = ir['2'];
          const ang = ir['gagdo'];
          const rot = ir['hoejeon'];
          const sleep = ir['cwicim'];
          const timer = ir['taimeo'];
          const segBtn = (b: any) => b ? html`
            <button
              class="cn-btn cn-btn--seg"
              @click=${() => this._fanPressIr(b.key)}
              title=${b.label}
            >
              <ha-icon .icon=${b.icon} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
              <span>${b.label}</span>
            </button>
          ` : nothing;
          return html`
            <!-- Row 1: power + mode (matches AC's 전원+온도 row height) -->
            <div class="cn-row cn-row--power cn-row--ir-power">
              <button
                class="cn-btn cn-btn--power cn-btn--ir-power-flex"
                @click=${() => this._fanPowerToggle()}
                title="전원"
              >
                <ha-icon .icon=${'mdi:power'} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
                <span class="cn-btn--ir-power-flex__lbl">전원</span>
              </button>
              ${mode ? html`
                <button
                  class="cn-btn cn-btn--power cn-btn--ir-mode-flex"
                  @click=${() => this._fanPressIr(mode.key)}
                  title=${mode.label}
                >
                  <ha-icon .icon=${mode.icon} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
                  <span class="cn-btn--ir-mode-flex__lbl">${mode.label}</span>
                </button>
              ` : nothing}
            </div>

            ${(spdUp || spdDn) ? html`
              <div class="cn-section">
                <div class="cn-section__label"><span>풍속 조절</span></div>
                <div class="cn-seg">${segBtn(spdUp)}${segBtn(spdDn)}</div>
              </div>
            ` : nothing}

            ${(rot || ang) ? html`
              <div class="cn-section">
                <div class="cn-section__label"><span>방향 조절</span></div>
                <div class="cn-seg">${segBtn(rot)}${segBtn(ang)}</div>
              </div>
            ` : nothing}

            ${(sleep || timer) ? html`
              <div class="cn-section">
                <div class="cn-section__label"><span>예약</span></div>
                <div class="cn-seg">${segBtn(sleep)}${segBtn(timer)}</div>
              </div>
            ` : nothing}
          `;
        })() : nothing}
      </div>
    `;
  }

  render(): TemplateResult {
    const kindTitle: Record<string, string> = { ac: '에어컨', fan: '선풍기', boiler: '보일러' };
    const kindIcon: Record<string, string> = {
      ac: 'mdi:air-conditioner',
      fan: 'mdi:fan',
      boiler: 'mdi:water-boiler',
    };
    const title = this.deviceName || kindTitle[this.kind] || '리모컨';
    return html`
      <div class="cn-modal__backdrop ${this._closing ? 'cn-modal__backdrop--closing' : ''}" @click=${this._onBackdrop}>
        <div class="cn-modal ${this._closing ? 'cn-modal--closing' : ''}" role="dialog" aria-modal="true" aria-label=${title}>
          <div class="cn-modal__head">
            <div class="cn-modal__title">
              <ha-icon
                .icon=${kindIcon[this.kind] ?? 'mdi:remote'}
                style="--mdc-icon-size:18px;width:18px;height:18px"
              ></ha-icon>
              <span>${title}</span>
            </div>
            <button class="cn-modal__close" @click=${() => this._close()} aria-label="닫기">
              <ha-icon .icon=${'mdi:close'} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
            </button>
          </div>
          <div class="cn-modal__body">
            ${this.kind === 'boiler'
              ? this._renderBoiler()
              : this.kind === 'ac'
                ? this._renderAc()
                : this._renderFan()}
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

    /* ---- Modal shell ---- */
    .cn-modal {
      position: relative;
      width: min(380px, 100%);
      max-height: min(88vh, 760px);
      overflow: hidden;
      border-radius: 24px;
      color: var(--cn-text);
      background:
        linear-gradient(180deg, rgba(30, 32, 40, 0.92) 0%, rgba(18, 20, 26, 0.94) 100%);
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
      padding: 18px 20px 10px;
      color: var(--cn-text);
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

    /* ==================================================================
       UNIFIED GLASS BUTTON — modeled 1:1 on HeroCardBase .cn-hero-action.
       Border-box gradient border (very subtle 1px), padding-box glass
       gradient background, backdrop blur, subtle inset white top hairline,
       subtle outer shadow, ::before specular sheen. NO thick rings, NO
       solid fills, NO neon outlines.
       ================================================================== */
    .cn-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-radius: 12px;
      border: 1px solid transparent;
      background:
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.05) 0%,
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
      transition:
        transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1),
        color 0.15s ease,
        box-shadow 0.18s ease;
    }
    /* Specular sheen — same as hero-action */
    .cn-btn::before {
      content: '';
      position: absolute;
      inset: 2px 2px auto 2px;
      height: 45%;
      border-radius: 10px 10px 40% 40% / 10px 10px 100% 100%;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.10) 0%,
        rgba(255, 255, 255, 0) 100%
      );
      pointer-events: none;
      z-index: 1;
    }
    .cn-btn > * { position: relative; z-index: 2; }
    .cn-btn:hover:not(:disabled) {
      color: var(--cn-text);
      transform: translateY(-1px);
    }
    .cn-btn:active:not(:disabled) { transform: scale(0.97); }
    .cn-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .cn-btn:focus-visible { outline: 2px solid var(--cn-accent); outline-offset: 2px; }

    /* ---- Active state ----
       Same glass base. Only difference: an accent-tinted BOTTOM BAND
       overlay (bottom 50%), rendered via ::after so the border/background
       machinery stays untouched. No ring, no full-fill, no thick outline. */
    .cn-btn--active {
      color: var(--cn-accent);
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
        0 0 0 1px color-mix(in srgb, var(--cn-accent) 55%, transparent),
        0 0 6px color-mix(in srgb, var(--cn-accent) 35%, transparent),
        inset 0 1px 0 rgba(255, 255, 255, 0.28),
        inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    }
    .cn-btn--active ha-icon {
      color: var(--cn-accent);
    }

    .cn-row--ir-power {
      display: flex;
      gap: 10px;
      align-items: stretch;
    }
    .cn-btn--ir-power-flex {
      flex: 3;
      width: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .cn-btn--ir-power-flex__lbl {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .cn-btn--ir-mode-flex {
      flex: 1;
      width: auto;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
    }
    .cn-btn--ir-mode-flex__lbl {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .cn-btn--mode-square {
      width: 64px;
      flex-shrink: 0;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
    }
    .cn-btn--mode-square__lbl {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    /* Power + temp row */
    .cn-row--power {
      display: flex;
      align-items: stretch;
      gap: 10px;
    }
    .cn-btn--power {
      width: 64px;
      flex-shrink: 0;
      border-radius: 16px;
      height: 64px;
    }
    .cn-btn--power.cn-btn--active {
      --cn-accent: #34d399;
    }

    /* One-shot buttons never highlight as "active" */
    .cn-btn--chip.cn-btn--active,
    .cn-btn--apply.cn-btn--active {
      background:
        linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.00) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.18) 100%) border-box;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.32),
        0 2px 4px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.12);
    }
    .cn-btn--chip.cn-btn--active,
    .cn-btn--apply.cn-btn--active {
      color: var(--cn-text);
    }
    .cn-btn--chip.cn-btn--active ha-icon,
    .cn-btn--apply.cn-btn--active ha-icon {
      color: inherit;
    }


    .cn-tempctl {
      flex: 1;
      display: grid;
      grid-template-columns: 52px 1fr 52px;
      align-items: center;
      gap: 6px;
      background:
        linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.14) 100%) border-box;
      border: 1px solid transparent;
      border-radius: 16px;
      padding: 6px;
      box-shadow:
        0 6px 16px rgba(0,0,0,0.24),
        inset 0 1px 0 rgba(255,255,255,0.18);
    }


    .cn-tempctl--wide { width: 100%; justify-content: center; }
    .cn-tempctl--hint {
      grid-template-columns: 1fr;
      padding: 14px;
      font-size: 13px;
      color: var(--cn-text-dim);
      text-align: center;
      font-weight: 600;
    }
    .cn-btn--step {
      height: 48px;
      font-size: 22px;
      font-weight: 700;
      color: var(--cn-text);
    }
    .cn-tempctl__val {
      text-align: center;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
      color: var(--cn-text);
    }
    .cn-tempctl__val small { font-size: 13px; color: var(--cn-text-dim); margin-left: 2px; font-weight: 600; }
    .cn-tempctl__unit {
      font-size: 14px;
      color: var(--cn-text-dim);
      margin-left: 3px;
      font-weight: 600;
      vertical-align: super;
      line-height: 0;
    }

    /* ---- Sections ---- */
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
    .cn-section__right {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-transform: none;
      letter-spacing: 0;
    }
    .cn-section__hint {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: -0.01em;
      text-transform: none;
      color: var(--vc, var(--cn-text-muted));
      font-variant-numeric: tabular-nums;
    }

    /* ---- Segmented control ---- */
    .cn-seg {
      display: flex;
      gap: 6px;
      border-radius: 14px;
    }
    .cn-btn--seg {
      flex: 1;
      min-height: 40px;
      border-radius: 10px;
      font-size: 13px;
    }

    /* ---- Extras grid ---- */
    .cn-extras {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .cn-btn--extra {
      justify-content: flex-start;
      gap: 8px;
      min-height: 44px;
      padding: 0 12px;
      border-radius: 12px;
      font-size: 13px;
    }
    .cn-btn--extra ha-icon { color: var(--cn-text-dim); flex-shrink: 0; }
    .cn-btn--extra.cn-btn--active ha-icon { color: var(--cn-accent); }
    .cn-extra__label { flex: 1; text-align: left; letter-spacing: -0.01em; }
    .cn-extra__pill {
      width: 24px; height: 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.10);
      position: relative;
      transition: background 0.18s;
      flex-shrink: 0;
    }
    .cn-extra__dot {
      position: absolute;
      top: 2px; left: 2px;
      width: 10px; height: 10px;
      border-radius: 50%;
      background: rgba(255,255,255,0.55);
      transition: transform 0.18s, background 0.18s;
    }
    .cn-btn--extra.cn-btn--active .cn-extra__pill {
      background: color-mix(in srgb, var(--cn-accent) 45%, transparent);
    }
    .cn-btn--extra.cn-btn--active .cn-extra__dot {
      transform: translateX(10px);
      background: #fff;
    }

    /* ---- Slider — 44px pill. Accent fill + glass sheen. NO center label. */
    .cn-slider {
      padding: 6px 0;
      touch-action: none;
      box-sizing: border-box;
      width: 100%;
    }
    .cn-slider--disabled { opacity: 0.4; pointer-events: none; }
    .cn-slider__track {
      position: relative;
      height: 44px;
      border-radius: 22px;
      /* Glass base — same padding-box/border-box trick as .cn-btn */
      background:
        linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.20) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 55%, rgba(255,255,255,0.14) 100%) border-box;
      border: 1px solid transparent;
      box-shadow:
        inset 0 2px 4px rgba(0,0,0,0.34),
        inset 0 -1px 0 rgba(255,255,255,0.04),
        0 2px 6px rgba(0,0,0,0.20);
      cursor: pointer;
      overflow: hidden;
      transition: box-shadow 0.2s ease;
    }
    .cn-slider--drag .cn-slider__track {
      box-shadow:
        inset 0 2px 4px rgba(0,0,0,0.40),
        inset 0 0 0 1px color-mix(in srgb, var(--accent) 32%, transparent),
        0 2px 8px rgba(0,0,0,0.28);
    }
    .cn-slider__fill {
      position: absolute;
      inset: 0 auto 0 0;
      width: var(--pct, 0%);
      min-width: 0;
      border-radius: 22px 0 0 22px;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--accent) 62%, rgba(0,0,0,0.15)) 0%,
        color-mix(in srgb, var(--accent) 72%, rgba(255,255,255,0.05)) 60%,
        color-mix(in srgb, var(--accent) 68%, rgba(255,255,255,0.15)) 100%);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.15),
        inset 0 -1px 0 rgba(0,0,0,0.12);
      transition: width 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .cn-slider--drag .cn-slider__fill { transition: none; }
    /* Glass sheen — 145deg white gradient overlaid across whole pill so the
       accent still reads under it but gains a glossy shine. Sits ABOVE the
       fill but BELOW any pointer targets. */
    .cn-slider__sheen {
      position: absolute;
      inset: 0;
      border-radius: 22px;
      pointer-events: none;
      background: linear-gradient(
        180deg,
        rgba(255,255,255,0.32) 0%,
        rgba(255,255,255,0.10) 45%,
        rgba(255,255,255,0.00) 55%,
        rgba(0,0,0,0.15) 100%
      );
    }
    /* Top rim specular reflection */
    .cn-slider__sheen::before {
      content: '';
      position: absolute;
      inset: 2px 8px auto 8px;
      height: 40%;
      border-radius: 22px 22px 40% 40% / 22px 22px 100% 100%;
      background: linear-gradient(
        to bottom,
        rgba(255,255,255,0.28) 0%,
        rgba(255,255,255,0.00) 100%
      );
      pointer-events: none;
    }

    /* ---- Timer rows ---- */
    .cn-timer-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .cn-timer-row__head {
      display: flex;
      justify-content: flex-start;
      align-items: baseline;
      padding: 0 4px;
    }
    .cn-timer-row__label {
      display: inline-flex;
      align-items: baseline;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--cn-text-dim);
      letter-spacing: -0.01em;
    }
    .cn-timer-row__label-sep {
      color: var(--cn-text-muted);
      font-weight: 500;
    }
    .cn-timer-row__label-val {
      font-weight: 700;
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      color: var(--vc, var(--cn-accent));
      letter-spacing: -0.01em;
    }

    /* Timer row body = slider + 설정 chip button */
    .cn-timer-row__body {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      box-sizing: border-box;
    }
    .cn-timer-row__body .cn-slider { flex: 1 1 auto; min-width: 0; }
    .cn-timer-row__body .cn-btn--apply {
      flex: 0 0 auto;
      min-width: 56px;
      margin-right: 0;
    }
    /* Neutralize outer shadow overflow so chip's visual right edge sits flush
       with the segmented-button rows above. */
    .cn-timer-row__body .cn-btn--apply {
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.12);
    }

    /* ---- Chip buttons (설정, 예약 취소) — inherit glass from .cn-btn ---- */
    .cn-btn--chip {
      height: 32px;
      padding: 0 12px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: -0.01em;
      gap: 4px;
      flex-shrink: 0;
    }
    .cn-btn--apply {
      align-self: center;
      min-width: 56px;
    }
    /* Danger-tinted chip (예약 취소) — still same glass, only text/accent
       is tinted red-ish. Border/background/sheen inherited unchanged. */
    .cn-btn--chip-danger {
      color: #fca5a5;
      --cn-accent: #f87171;
    }
    .cn-btn--chip-danger:hover:not(:disabled) { color: #fecaca; }
    .cn-btn--chip-danger ha-icon { color: currentColor; }

    @media (max-width: 480px) {
      .cn-modal { border-radius: 22px; max-height: 92vh; }
    }
  `;
}

/**
 * Open a themed IR-remote modal, mounted at document.body.
 * Returns a handle with a close() method.
 */
export function openRemoteModal(opts: {
  hass: HomeAssistant;
  kind: RemoteKind;
  entity: string;
  deviceName?: string;
}): { close: () => void } {
  const el = document.createElement('cardnews-remote-modal') as CardnewsRemoteModal;
  el.hass = opts.hass;
  el.kind = opts.kind;
  el.entity = opts.entity;
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
    'cardnews-remote-modal': CardnewsRemoteModal;
  }
}
