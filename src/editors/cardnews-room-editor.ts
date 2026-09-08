import { html, nothing, type TemplateResult } from 'lit';
import type { CardNewsRoomConfig, ListItem } from '../base/types.js';
import {
  CardNewsEditorBase,
  BADGE_SECTION,
  HERO_IMAGE_SECTION,
  GLOW_SECTION,
  type FormSchemaItem,
  type ValueChangedEvent,
} from './editor-common.js';
import './cardnews-list-editor.js';
import './cardnews-objects-editor.js';

/**
 * cardnews-room-editor — visual editor for `custom:cardnews-room`.
 *
 * Room cards in this house are built almost entirely from `name` + `room` +
 * `switches` + `glow_entities`, so those get first-class UI. `list` rows and
 * everything else fall through to the shared sub-editors.
 */

const FORM_SCHEMA: FormSchemaItem[] = [
  { name: 'name', selector: { text: {} }, required: true },
  {
    type: 'grid',
    schema: [
      { name: 'temp_entity', selector: { entity: { filter: [{ domain: 'sensor' }] } } },
      { name: 'humidity_entity', selector: { entity: { filter: [{ domain: 'sensor' }] } } },
    ],
  },
  BADGE_SECTION,
  HERO_IMAGE_SECTION,
  GLOW_SECTION,
];

const FORM_KEYS = [
  'name',
  'temp_entity',
  'humidity_entity',
  'category',
  'category_icon',
  'status_text',
  'status_color',
  'status_entity',
  'hero_image',
  'hero_image_entity',
  'room',
  'hero_theme',
  'glow_entities',
  'glow_position',
  'glow_color',
];

const SWITCH_SCHEMA: FormSchemaItem[] = [
  {
    name: 'entity',
    selector: {
      entity: {
        filter: [{ domain: 'switch' }, { domain: 'light' }, { domain: 'fan' }, { domain: 'input_boolean' }],
      },
    },
    required: true,
  },
  {
    type: 'grid',
    schema: [
      { name: 'label', selector: { text: {} } },
      { name: 'icon', selector: { icon: {} } },
    ],
  },
];

const SWITCH_LABELS: Record<string, string> = {
  entity: 'Entity',
  label: '라벨 (비우면 friendly name)',
  icon: '아이콘 (비우면 도메인 기본값)',
};

export class CardNewsRoomEditor extends CardNewsEditorBase<CardNewsRoomConfig> {
  protected override get labels(): Record<string, string> {
    return {
      name: '방 이름 (필수)',
      temp_entity: '온도 센서',
      humidity_entity: '습도 센서',
    };
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const switches = this._config.switches ?? [];

    return html`
      <div class="root">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData(FORM_KEYS)}
          .schema=${FORM_SCHEMA}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._formChanged}
        ></ha-form>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:toggle-switch-outline"></ha-icon>
            <span>스위치 행</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${switches as unknown as Array<Record<string, unknown>>}
            .schema=${SWITCH_SCHEMA}
            .labels=${SWITCH_LABELS}
            .titleKeys=${['label', 'entity']}
            .addLabel=${'스위치 추가'}
            .emptyLabel=${'스위치가 없습니다.'}
            @items-changed=${this._switchesChanged}
          ></cardnews-objects-editor>
          <div class="section-hint">카드 하단에 켜기/끄기 행으로 표시됩니다.</div>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:format-list-bulleted"></ha-icon>
            <span>추가 리스트 행</span>
          </div>
          <cardnews-list-editor
            .hass=${this.hass}
            .rows=${this._config.list ?? []}
            @rows-changed=${this._listChanged}
          ></cardnews-list-editor>
          <div class="section-hint">스위치 행 다음에 붙는 자유 행입니다 (값·슬라이더·조명 등).</div>
        </div>

        <div class="hint">
          여기 없는 옵션은 <b>⋮ → Edit in YAML</b> 로 수정해도 안전합니다 — 이 편집기는 알 수
          없는 필드를 건드리지 않습니다.
        </div>
      </div>
    `;
  }

  private _switchesChanged = (ev: ValueChangedEvent<Array<Record<string, unknown>>>): void => {
    ev.stopPropagation();
    const items = ev.detail.value;
    this._patch('switches', items.length ? items : undefined);
  };

  private _listChanged = (ev: ValueChangedEvent<ListItem[]>): void => {
    ev.stopPropagation();
    const rows = ev.detail.value;
    this._patch('list', rows.length ? rows : undefined);
  };
}

if (!customElements.get('cardnews-room-editor')) {
  customElements.define('cardnews-room-editor', CardNewsRoomEditor);
}
