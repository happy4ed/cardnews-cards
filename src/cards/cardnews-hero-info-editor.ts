import { LitElement, html, css, nothing, type CSSResultGroup, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant, CardNewsHeroInfoConfig, ListItem, CalendarEventsRow } from '../base/types.js';

/**
 * cardnews-hero-info-editor — Home Assistant UI editor for the
 * `custom:cardnews-hero-info` card.
 *
 * v0.12 (first pass) covers:
 *   - Top-level scalars via ha-form (title, subtitle, category, hero_image,
 *     status_text/color).
 *   - Calendar row entities: if the card's `list` contains a
 *     `calendar_events` row, its `entities` become a native HA
 *     multi-entity picker (`domain: calendar`) at the top of the form.
 *   - Other list items and advanced fields (hero_actions, glow_entities,
 *     templates, list customizations beyond calendar entities) remain
 *     YAML-editable through HA's built-in YAML view — this editor writes
 *     back a full config object, preserving anything it doesn't touch.
 */

interface ValueChangedEvent<T = unknown> extends CustomEvent {
  detail: { value: T };
}

type FormSchemaItem =
  | { name: string; selector: Record<string, unknown>; required?: boolean }
  | { type: 'grid'; name?: string; schema: FormSchemaItem[] }
  | { type: 'expandable'; name: string; title?: string; icon?: string; schema: FormSchemaItem[] };

const STATUS_COLORS = ['green', 'gray', 'blue', 'red', 'amber'];

// Static form schema for the top-level scalars we expose.
const FORM_SCHEMA: FormSchemaItem[] = [
  {
    type: 'grid',
    schema: [
      { name: 'title', selector: { text: {} } },
      { name: 'subtitle', selector: { text: {} } },
    ],
  },
  {
    type: 'expandable',
    name: '',
    title: '템플릿 (Jinja2)',
    icon: 'mdi:code-json',
    schema: [
      { name: 'title_template', selector: { template: {} } },
      { name: 'subtitle_template', selector: { template: {} } },
      { name: 'status_text_template', selector: { template: {} } },
      { name: 'status_template', selector: { template: {} } },
    ],
  },
  {
    type: 'expandable',
    name: '',
    title: '상단 배지 / 상태 칩',
    icon: 'mdi:label-outline',
    schema: [
      {
        type: 'grid',
        schema: [
          { name: 'category', selector: { text: {} } },
          { name: 'category_icon', selector: { icon: {} } },
        ],
      },
      {
        type: 'grid',
        schema: [
          { name: 'status_text', selector: { text: {} } },
          {
            name: 'status_color',
            selector: {
              select: {
                mode: 'dropdown',
                options: STATUS_COLORS.map((c) => ({ value: c, label: c })),
              },
            },
          },
        ],
      },
    ],
  },
  {
    type: 'expandable',
    name: '',
    title: 'Hero 이미지',
    icon: 'mdi:image-outline',
    schema: [
      { name: 'hero_image', selector: { text: {} } },
      { name: 'hero_image_entity', selector: { entity: {} } },
      { name: 'room', selector: { text: {} } },
    ],
  },
];

/** Human-friendly labels for ha-form fields. */
const LABELS: Record<string, string> = {
  title: '제목',
  subtitle: '부제',
  title_template: '제목 (템플릿)',
  subtitle_template: '부제 (템플릿)',
  status_text_template: '상태 텍스트 (템플릿)',
  status_template: '상태 색 (템플릿)',
  category: '카테고리 배지 텍스트',
  category_icon: '카테고리 아이콘',
  status_text: '상태 칩 텍스트',
  status_color: '상태 색',
  hero_image: 'Hero 이미지 경로 (예: /local/cardnews/heroes/... 또는 base name)',
  hero_image_entity: 'Hero 이미지 entity (image.* / camera.*)',
  room: 'Room 키 (자동 hero 해상용, 예: livingroom)',
};

function findCalendarRowIndex(list: ListItem[] | undefined): number {
  if (!list) return -1;
  return list.findIndex((r) => r && (r as CalendarEventsRow).type === 'calendar_events');
}

export class CardNewsHeroInfoEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: CardNewsHeroInfoConfig;

  public setConfig(config: CardNewsHeroInfoConfig): void {
    this._config = config;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;

    const calIdx = findCalendarRowIndex(this._config.list);
    const calRow = calIdx >= 0 ? (this._config.list?.[calIdx] as CalendarEventsRow | undefined) : undefined;
    const calEntities = calRow?.entities ?? [];

    // Data object for ha-form. Only project the fields the schema knows about
    // so ha-form doesn't accidentally render foreign keys.
    const formData: Record<string, unknown> = {};
    const proj = [
      'title', 'subtitle',
      'title_template', 'subtitle_template', 'status_text_template', 'status_template',
      'category', 'category_icon', 'status_text', 'status_color',
      'hero_image', 'hero_image_entity', 'room',
    ];
    for (const k of proj) {
      const v = (this._config as unknown as Record<string, unknown>)[k];
      if (v !== undefined) formData[k] = v;
    }

    return html`
      <div class="root">
        ${calRow
          ? html`
              <div class="section">
                <div class="section-title">
                  <ha-icon icon="mdi:calendar-multiple"></ha-icon>
                  <span>표시할 캘린더</span>
                </div>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{ entity: { filter: [{ domain: 'calendar' }], multiple: true } }}
                  .value=${calEntities}
                  @value-changed=${this._calendarsChanged}
                ></ha-selector>
                <div class="section-hint">일정을 이 카드에 노출할 캘린더를 선택하세요. 순서는 저장 시 유지됩니다.</div>
              </div>
            `
          : nothing}

        <ha-form
          .hass=${this.hass}
          .data=${formData}
          .schema=${FORM_SCHEMA}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._formChanged}
        ></ha-form>

        <div class="hint">
          여기 없는 옵션 (list rows, hero_actions, glow_entities, action_type 등)
          은 우측 상단 <b>⋮ → Edit in YAML</b> 로 수정해도 안전합니다 — 이 편집기는
          알 수 없는 필드를 건드리지 않습니다.
        </div>
      </div>
    `;
  }

  private _computeLabel = (schema: { name: string; title?: string }) => {
    if (schema.title) return schema.title;
    return LABELS[schema.name] ?? schema.name;
  };

  private _formChanged = (ev: ValueChangedEvent<Record<string, unknown>>) => {
    if (!this._config) return;
    ev.stopPropagation();
    const patch = ev.detail.value;
    const next: CardNewsHeroInfoConfig = { ...this._config } as CardNewsHeroInfoConfig;
    // Copy known keys; delete when cleared to empty string so the config
    // stays clean (HA convention: empty string == "unset" for text fields
    // in ha-form).
    for (const [k, v] of Object.entries(patch)) {
      if (v === '' || v === undefined || v === null) {
        delete (next as unknown as Record<string, unknown>)[k];
      } else {
        (next as unknown as Record<string, unknown>)[k] = v;
      }
    }
    this._emitConfig(next);
  };

  private _calendarsChanged = (ev: ValueChangedEvent<string[] | string>) => {
    if (!this._config) return;
    ev.stopPropagation();
    const raw = ev.detail.value;
    const entities = Array.isArray(raw) ? raw : (raw ? [raw] : []);
    const list = [...(this._config.list ?? [])];
    const idx = findCalendarRowIndex(list);
    if (idx < 0) return;
    const row = { ...(list[idx] as CalendarEventsRow), entities };
    list[idx] = row;
    const next: CardNewsHeroInfoConfig = { ...this._config, list } as CardNewsHeroInfoConfig;
    this._emitConfig(next);
  };

  private _emitConfig(config: CardNewsHeroInfoConfig): void {
    this._config = config;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles: CSSResultGroup = css`
    :host {
      display: block;
    }
    .root {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 4px 4px;
    }
    .section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      border-radius: 10px;
      background: var(--card-background-color, transparent);
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .section-title ha-icon {
      --mdc-icon-size: 20px;
      color: var(--primary-color, #22d3ee);
    }
    .section-hint {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      padding: 4px 4px 0;
      line-height: 1.5;
    }
    ha-form {
      display: block;
    }
  `;
}

if (!customElements.get('cardnews-hero-info-editor')) {
  customElements.define('cardnews-hero-info-editor', CardNewsHeroInfoEditor);
}
