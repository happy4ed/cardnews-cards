import { LitElement, html, css, nothing, type CSSResultGroup, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant, ListItem, ListRowType } from '../base/types.js';
import type { FormSchemaItem, ValueChangedEvent } from './editor-common.js';

/**
 * cardnews-list-editor — reusable row editor for the `list:` array shared by
 * hero-info / room / camera-hero / sensor-panel.
 *
 * Emits `rows-changed` with `detail.value` = the new ListItem[].
 *
 * Each row renders a type-specific ha-form. Keys the per-type schema doesn't
 * know about are preserved verbatim, so a row hand-tuned in YAML keeps its
 * extras after being touched here.
 */

type AnyRow = Record<string, unknown>;

const ROW_TYPES: Array<{ value: ListRowType; label: string }> = [
  { value: 'value', label: '값 (value)' },
  { value: 'switch', label: '스위치 (switch)' },
  { value: 'slider', label: '슬라이더 (slider)' },
  { value: 'bar', label: '막대 그래프 (bar)' },
  { value: 'select', label: '드롭다운 (select)' },
  { value: 'light', label: '조명 (light)' },
  { value: 'volume', label: '볼륨 (volume)' },
  { value: 'forecast', label: '날씨 예보 (forecast)' },
  { value: 'balls', label: '로또 번호 (balls)' },
  { value: 'calendar_events', label: '캘린더 일정 (calendar_events)' },
  { value: 'header', label: '구분 헤더 (header)' },
];

const COMMON_HEAD: FormSchemaItem[] = [
  {
    type: 'grid',
    schema: [
      { name: 'label', selector: { text: {} } },
      { name: 'icon', selector: { icon: {} } },
    ],
  },
];

/** Per-type schema appended after the common head. */
function schemaForType(type: ListRowType): FormSchemaItem[] {
  switch (type) {
    case 'switch':
      return [
        { name: 'entity', selector: { entity: { filter: [{ domain: 'switch' }, { domain: 'light' }, { domain: 'fan' }, { domain: 'input_boolean' }] } }, required: true },
        { name: 'light_entities', selector: { entity: { multiple: true, filter: [{ domain: 'light' }] } } },
      ];
    case 'slider':
      return [
        { name: 'entity', selector: { entity: {} }, required: true },
        {
          type: 'grid',
          schema: [
            { name: 'min', selector: { number: { mode: 'box', step: 'any' } } },
            { name: 'max', selector: { number: { mode: 'box', step: 'any' } } },
            { name: 'step', selector: { number: { mode: 'box', step: 'any' } } },
            { name: 'unit', selector: { text: {} } },
          ],
        },
        { name: 'service', selector: { text: {} } },
      ];
    case 'bar':
      return [
        { name: 'entity', selector: { entity: {} } },
        {
          type: 'grid',
          schema: [
            { name: 'max', selector: { number: { mode: 'box', step: 'any' } } },
            { name: 'unit', selector: { text: {} } },
            { name: 'color', selector: { text: {} } },
          ],
        },
      ];
    case 'select':
      return [{ name: 'entity', selector: { entity: { filter: [{ domain: 'input_select' }, { domain: 'select' }] } }, required: true }];
    case 'light':
      return [
        { name: 'entity', selector: { entity: { filter: [{ domain: 'light' }] } } },
        { name: 'entities', selector: { entity: { multiple: true, filter: [{ domain: 'light' }] } } },
        { name: 'force_color_button', selector: { boolean: {} } },
      ];
    case 'volume':
      return [
        { name: 'entity', selector: { entity: { filter: [{ domain: 'media_player' }] } }, required: true },
        { name: 'mute', selector: { boolean: {} } },
      ];
    case 'forecast':
      return [
        { name: 'entity', selector: { entity: { filter: [{ domain: 'weather' }] } }, required: true },
        { name: 'days', selector: { number: { mode: 'box', min: 1, max: 10 } } },
      ];
    case 'balls':
      return [{ name: 'entity', selector: { entity: { filter: [{ domain: 'sensor' }] } }, required: true }];
    case 'calendar_events':
      return [
        { name: 'entities', selector: { entity: { multiple: true, filter: [{ domain: 'calendar' }] } }, required: true },
        {
          type: 'grid',
          schema: [
            { name: 'days_before', selector: { number: { mode: 'box', min: 0, max: 60 } } },
            { name: 'days_after', selector: { number: { mode: 'box', min: 0, max: 60 } } },
            { name: 'visible_rows', selector: { number: { mode: 'box', min: 1, max: 20 } } },
            { name: 'max', selector: { number: { mode: 'box', min: 1, max: 200 } } },
          ],
        },
        {
          type: 'grid',
          schema: [
            { name: 'group_by_day', selector: { boolean: {} } },
            { name: 'show_description', selector: { boolean: {} } },
          ],
        },
      ];
    case 'header':
      return [{ name: 'text', selector: { text: {} } }];
    case 'value':
    default:
      return [
        { name: 'entity', selector: { entity: {} } },
        {
          type: 'grid',
          schema: [
            { name: 'unit', selector: { text: {} } },
            { name: 'value', selector: { text: {} } },
          ],
        },
      ];
  }
}

const ADVANCED: FormSchemaItem = {
  type: 'expandable',
  name: '',
  title: '고급',
  icon: 'mdi:tune',
  schema: [
    {
      type: 'grid',
      schema: [
        { name: 'icon_color', selector: { text: {} } },
        { name: 'always_show', selector: { boolean: {} } },
      ],
    },
  ],
};

const LABELS: Record<string, string> = {
  label: '라벨',
  icon: '아이콘',
  entity: 'Entity',
  entities: 'Entity 목록',
  unit: '단위',
  value: '고정 값',
  min: '최소',
  max: '최대',
  step: '증감폭',
  service: '서비스 (선택)',
  color: '색 (hex)',
  days: '표시 일수',
  days_before: '이전 며칠',
  days_after: '이후 며칠',
  visible_rows: '보이는 줄 수',
  group_by_day: '날짜별 묶기',
  show_description: '설명 표시',
  text: '헤더 텍스트',
  mute: '음소거 버튼',
  light_entities: '연결 조명 (선택)',
  force_color_button: '색상 버튼 강제 표시',
  icon_color: '아이콘 색 (hex 또는 auto)',
  always_show: '값이 없어도 항상 표시',
};

/** Keys a given type's form owns — everything else on the row is preserved. */
function keysForType(type: ListRowType): string[] {
  const base = ['label', 'icon', 'icon_color', 'always_show'];
  const walk = (items: FormSchemaItem[], acc: string[]): string[] => {
    for (const it of items) {
      if ('schema' in it && Array.isArray(it.schema)) walk(it.schema, acc);
      else if ('name' in it && it.name) acc.push(it.name);
    }
    return acc;
  };
  return [...base, ...walk(schemaForType(type), [])];
}

export class CardNewsListEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public rows: ListItem[] = [];
  /** Row types offered in the "add" dropdown. Defaults to all. */
  @property({ attribute: false }) public allowedTypes?: ListRowType[];
  @state() private _open: Record<number, boolean> = {};

  private get _types(): Array<{ value: ListRowType; label: string }> {
    if (!this.allowedTypes) return ROW_TYPES;
    const allow = new Set(this.allowedTypes);
    return ROW_TYPES.filter((t) => allow.has(t.value));
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass) return nothing;
    const rows = this.rows ?? [];
    return html`
      <div class="rows">
        ${rows.map((row, i) => this._renderRow(row as AnyRow, i))}
        ${rows.length === 0 ? html`<div class="empty">행이 없습니다. 아래에서 추가하세요.</div>` : nothing}
      </div>
      <div class="add">
        <ha-selector
          .hass=${this.hass}
          .selector=${{ select: { mode: 'dropdown', options: this._types } }}
          .value=${''}
          @value-changed=${this._addRow}
        ></ha-selector>
        <div class="section-hint">추가할 행 종류를 고르면 목록 끝에 붙습니다.</div>
      </div>
    `;
  }

  private _renderRow(row: AnyRow, index: number): TemplateResult {
    const type = (row.type as ListRowType) ?? 'value';
    const typeLabel = ROW_TYPES.find((t) => t.value === type)?.label ?? type;
    const title = (row.label as string) || (row.entity as string) || typeLabel;
    const open = this._open[index] ?? false;
    const schema: FormSchemaItem[] = [...COMMON_HEAD, ...schemaForType(type), ADVANCED];
    const data: AnyRow = {};
    for (const k of keysForType(type)) {
      if (row[k] !== undefined) data[k] = row[k];
    }

    return html`
      <div class="row">
        <div class="row-head">
          <ha-icon-button
            .path=${open ? 'M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z' : 'M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z'}
            .label=${open ? '접기' : '펼치기'}
            @click=${() => this._toggle(index)}
          ></ha-icon-button>
          <div class="row-title" @click=${() => this._toggle(index)}>
            <span class="row-name">${title}</span>
            <span class="row-type">${typeLabel}</span>
          </div>
          <ha-icon-button
            .path=${'M15,20H9V8H15M15.5,4H14L13,3H11L10,4H8.5V6H15.5V4Z M7,6V20A2,2 0 0,0 9,22H15A2,2 0 0,0 17,20V6H7Z'}
            .label=${'삭제'}
            @click=${() => this._remove(index)}
          ></ha-icon-button>
          <ha-icon-button
            .path=${'M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z'}
            .label=${'위로'}
            .disabled=${index === 0}
            @click=${() => this._move(index, -1)}
          ></ha-icon-button>
          <ha-icon-button
            .path=${'M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z'}
            .label=${'아래로'}
            .disabled=${index === (this.rows?.length ?? 0) - 1}
            @click=${() => this._move(index, 1)}
          ></ha-icon-button>
        </div>
        ${open
          ? html`
              <div class="row-body">
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{ select: { mode: 'dropdown', options: this._types } }}
                  .value=${type}
                  .label=${'행 종류'}
                  @value-changed=${(e: ValueChangedEvent<ListRowType>) => this._changeType(index, e)}
                ></ha-selector>
                <ha-form
                  .hass=${this.hass}
                  .data=${data}
                  .schema=${schema}
                  .computeLabel=${this._computeLabel}
                  @value-changed=${(e: ValueChangedEvent<AnyRow>) => this._rowChanged(index, e)}
                ></ha-form>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _computeLabel = (schema: { name: string; title?: string }): string => {
    if (schema.title) return schema.title;
    return LABELS[schema.name] ?? schema.name;
  };

  private _toggle(index: number): void {
    this._open = { ...this._open, [index]: !(this._open[index] ?? false) };
  }

  private _rowChanged(index: number, ev: ValueChangedEvent<AnyRow>): void {
    ev.stopPropagation();
    const rows = [...(this.rows ?? [])];
    const current = { ...(rows[index] as AnyRow) };
    for (const [k, v] of Object.entries(ev.detail.value)) {
      if (v === '' || v === undefined || v === null) delete current[k];
      else current[k] = v;
    }
    rows[index] = current as ListItem;
    this._emit(rows);
  }

  private _changeType(index: number, ev: ValueChangedEvent<ListRowType>): void {
    ev.stopPropagation();
    const type = ev.detail.value;
    if (!type) return;
    const rows = [...(this.rows ?? [])];
    const current = { ...(rows[index] as AnyRow) };
    if (current.type === type) return;
    current.type = type;
    rows[index] = current as ListItem;
    this._emit(rows);
  }

  private _addRow = (ev: ValueChangedEvent<ListRowType>): void => {
    ev.stopPropagation();
    const type = ev.detail.value;
    if (!type) return;
    const rows = [...(this.rows ?? [])];
    const fresh: AnyRow = { type };
    if (type === 'calendar_events') fresh.entities = [];
    rows.push(fresh as ListItem);
    this._open = { ...this._open, [rows.length - 1]: true };
    this._emit(rows);
  };

  private _remove(index: number): void {
    const rows = [...(this.rows ?? [])];
    rows.splice(index, 1);
    this._emit(rows);
  }

  private _move(index: number, delta: number): void {
    const rows = [...(this.rows ?? [])];
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const [item] = rows.splice(index, 1);
    rows.splice(target, 0, item);
    this._emit(rows);
  }

  private _emit(rows: ListItem[]): void {
    this.rows = rows;
    this.dispatchEvent(
      new CustomEvent('rows-changed', { detail: { value: rows }, bubbles: true, composed: true }),
    );
  }

  static styles: CSSResultGroup = css`
    :host {
      display: block;
    }
    .rows {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .row {
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      border-radius: 8px;
      overflow: hidden;
    }
    .row-head {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 2px 4px;
      background: var(--secondary-background-color, rgba(255, 255, 255, 0.04));
    }
    .row-title {
      flex: 1;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      min-width: 0;
      padding: 4px 0;
    }
    .row-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .row-type {
      font-size: 11px;
      color: var(--secondary-text-color);
    }
    .row-body {
      padding: 10px 12px 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .empty,
    .section-hint {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .empty {
      padding: 8px 4px;
    }
    .add {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    ha-icon-button {
      --mdc-icon-button-size: 34px;
      --mdc-icon-size: 18px;
      color: var(--secondary-text-color);
    }
  `;
}

if (!customElements.get('cardnews-list-editor')) {
  customElements.define('cardnews-list-editor', CardNewsListEditor);
}
