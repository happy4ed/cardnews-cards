import { LitElement, css, html, nothing, unsafeCSS, type CSSResultGroup, type TemplateResult } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';
import type { HomeAssistant } from '../base/types.js';

const PRETENDARD_HREF =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';
const FONT_IMPORT = unsafeCSS(`@import url('${PRETENDARD_HREF}');`);
const FONT_STACK = `'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif`;

export interface CalendarEventLike {
  entity_id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: string;
  end?: string;
  allDay?: boolean;
}

const KOR_DAY = ['일', '월', '화', '수', '목', '금', '토'];
const URL_RE = /(https?:\/\/[^\s<>"'`]+)/g;

function pad2(n: number): string { return String(n).padStart(2, '0'); }

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())} (${KOR_DAY[d.getDay()]})`;
}
function fmtTime(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatRange(startStr: string, endStr: string | undefined, allDay: boolean): string {
  if (!startStr) return '';
  const start = new Date(startStr);
  if (isNaN(start.getTime())) return startStr;
  const startDay = fmtDate(start);
  if (allDay || !/T\d/.test(startStr)) {
    if (!endStr) return `${startDay} · 하루종일`;
    const end = new Date(endStr);
    // HA all-day end is exclusive — subtract 1ms
    const endAdj = new Date(end.getTime() - 1);
    const endDay = fmtDate(endAdj);
    if (endDay === startDay) return `${startDay} · 하루종일`;
    return `${startDay} → ${endDay}`;
  }
  const startClock = fmtTime(start);
  if (!endStr) return `${startDay} · ${startClock}`;
  const end = new Date(endStr);
  const endDay = fmtDate(end);
  const endClock = fmtTime(end);
  if (endDay === startDay) return `${startDay} · ${startClock} — ${endClock}`;
  return `${startDay} ${startClock} → ${endDay} ${endClock}`;
}

/** Split a text into segments, converting URLs to anchor tags. */
function renderRichText(text: string): TemplateResult {
  const parts: Array<TemplateResult | string> = [];
  let lastIdx = 0;
  const matches = text.matchAll(URL_RE);
  for (const m of matches) {
    const idx = m.index ?? 0;
    if (idx > lastIdx) parts.push(text.slice(lastIdx, idx));
    const url = m[0];
    parts.push(html`<a href=${url} target="_blank" rel="noopener noreferrer">${url}</a>`);
    lastIdx = idx + url.length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return html`${parts}`;
}

@customElement('cardnews-event-modal')
export class CardnewsEventModal extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public event?: CalendarEventLike;
  @property({ type: String }) public entityId = '';
  @property({ type: String }) public calendarName = '';

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

  render(): TemplateResult {
    const ev = this.event;
    const title = ev?.summary || '(제목 없음)';
    const when = ev ? formatRange(ev.start, ev.end, !!ev.allDay) : '';
    const description = (ev?.description ?? '').trim();
    const location = (ev?.location ?? '').trim();

    return html`
      <div class="cn-modal__backdrop ${this._closing ? 'cn-modal__backdrop--closing' : ''}" @click=${this._onBackdrop}>
        <div class="cn-modal ${this._closing ? 'cn-modal--closing' : ''}" role="dialog" aria-modal="true" aria-label=${title}>
          <div class="cn-modal__head">
            <div class="cn-modal__title">
              <span class="cn-modal__title-txt">${title}</span>
            </div>
            <button class="cn-modal__close" @click=${() => this._close()} aria-label="닫기">
              <ha-icon .icon=${'mdi:close'} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
            </button>
          </div>
          <div class="cn-modal__body">
            ${when ? html`
              <div class="cn-ev-field">
                <div class="cn-ev-field__label">일시</div>
                <div class="cn-ev-field__value">${when}</div>
              </div>` : nothing}
            ${this.calendarName ? html`
              <div class="cn-ev-field">
                <div class="cn-ev-field__label">캘린더</div>
                <div class="cn-ev-field__value">${this.calendarName}</div>
              </div>` : nothing}
            ${location ? html`
              <div class="cn-ev-field">
                <div class="cn-ev-field__label">장소</div>
                <div class="cn-ev-field__value">${renderRichText(location)}</div>
              </div>` : nothing}
            ${description ? html`
              <div class="cn-ev-field">
                <div class="cn-ev-field__label">상세</div>
                <div class="cn-ev-field__value cn-ev-field__value--desc">${renderRichText(description)}</div>
              </div>` : nothing}
            ${!description && !location ? html`
              <div class="cn-ev-empty">추가 정보 없음</div>` : nothing}
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
      width: min(440px, 100%);
      max-height: min(84vh, 720px);
      overflow: hidden;
      border-radius: 22px;
      color: var(--cn-text);
      background: linear-gradient(180deg, rgba(30, 32, 40, 0.92) 0%, rgba(18, 20, 26, 0.94) 100%);
      border: 1px solid var(--cn-border-strong);
      box-shadow:
        0 40px 100px rgba(0,0,0,0.55),
        0 6px 20px rgba(0,0,0,0.35),
        inset 0 1px 0 rgba(255,255,255,0.08);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      animation: cn-scale-in 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
    }
    .cn-modal--closing { animation: cn-scale-out 180ms ease forwards; }
    .cn-modal__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 16px 18px 14px;
      border-bottom: 1px solid var(--cn-border);
    }
    .cn-modal__title {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex: 1;
    }
    .cn-modal__title-txt {
      font-weight: 700;
      font-size: 17px;
      letter-spacing: -0.01em;
      line-height: 1.3;
      color: var(--cn-text);
      overflow-wrap: anywhere;
    }
    .cn-modal__close {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 999px;
      border: 1px solid var(--cn-border);
      background: rgba(255,255,255,0.05);
      color: var(--cn-text);
      cursor: pointer;
      transition: background 120ms ease;
    }
    .cn-modal__close:hover { background: rgba(255,255,255,0.12); }
    .cn-modal__body {
      padding: 14px 18px 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .cn-ev-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .cn-ev-field__label {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--cn-text-muted);
    }
    .cn-ev-field__value {
      font-size: 13px;
      font-weight: 500;
      color: var(--cn-text);
      line-height: 1.45;
      overflow-wrap: anywhere;
    }
    .cn-ev-field__value--desc {
      white-space: pre-wrap;
      font-weight: 400;
      color: var(--cn-text-dim);
    }
    .cn-ev-field__value a {
      color: var(--cn-accent);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .cn-ev-empty {
      font-size: 13px;
      color: var(--cn-text-muted);
      text-align: center;
      padding: 12px 0;
    }
  `;
}

/** Open the calendar-event detail modal, mounted at document.body. */
export function openCalendarEventModal(opts: {
  hass: HomeAssistant;
  event: CalendarEventLike;
  entityId: string;
  calendarName?: string;
}): { el: CardnewsEventModal; close: () => void } {
  const el = document.createElement('cardnews-event-modal') as CardnewsEventModal;
  el.hass = opts.hass;
  el.event = opts.event;
  el.entityId = opts.entityId;
  el.calendarName = opts.calendarName ?? '';
  document.body.appendChild(el);
  return {
    el,
    close: () => {
      if (el.parentElement) el.parentElement.removeChild(el);
    },
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'cardnews-event-modal': CardnewsEventModal;
  }
}
