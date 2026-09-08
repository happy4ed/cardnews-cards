import { html, nothing, type TemplateResult } from 'lit';
import type { ListItem } from '../base/types.js';
import {
  CardNewsEditorBase,
  BADGE_SECTION,
  type FormSchemaItem,
  type ValueChangedEvent,
} from './editor-common.js';
import { HERO_ACTION_SCHEMA, HERO_ACTION_LABELS } from './action-schema.js';
import './cardnews-list-editor.js';
import './cardnews-objects-editor.js';

/** Config shape mirrors the one declared inside cardnews-camera-hero.ts. */
interface CameraHeroConfig {
  type: string;
  camera_entity: string;
  title?: string;
  subtitle?: string;
  list?: ListItem[];
  poll_interval?: number;
  hero_height?: string;
  hero_actions?: Array<Record<string, unknown>>;
}

const FORM_SCHEMA: FormSchemaItem[] = [
  { name: 'camera_entity', selector: { entity: { filter: [{ domain: 'camera' }] } }, required: true },
  {
    type: 'grid',
    schema: [
      { name: 'title', selector: { text: {} } },
      { name: 'subtitle', selector: { text: {} } },
    ],
  },
  BADGE_SECTION,
  {
    type: 'expandable',
    name: '',
    title: '표시 옵션',
    icon: 'mdi:image-size-select-large',
    schema: [
      {
        type: 'grid',
        schema: [
          { name: 'hero_height', selector: { text: {} } },
          { name: 'poll_interval', selector: { number: { mode: 'box', min: 250, max: 60000, step: 250 } } },
        ],
      },
    ],
  },
];

const FORM_KEYS = [
  'camera_entity',
  'title',
  'subtitle',
  'category',
  'category_icon',
  'status_text',
  'status_color',
  'status_entity',
  'hero_height',
  'poll_interval',
];

export class CardNewsCameraHeroEditor extends CardNewsEditorBase<CameraHeroConfig> {
  protected override get labels(): Record<string, string> {
    return {
      camera_entity: '카메라 entity (필수)',
      hero_height: 'Hero 높이 (예: 360px)',
      poll_interval: '스냅샷 갱신 주기 (ms, 기본 2000)',
    };
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
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
            <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
            <span>Hero 액션 칩</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${this._config.hero_actions ?? []}
            .schema=${HERO_ACTION_SCHEMA}
            .labels=${HERO_ACTION_LABELS}
            .titleKeys=${['label', 'entity']}
            .addLabel=${'액션 추가'}
            .emptyLabel=${'액션 칩이 없습니다.'}
            @items-changed=${this._actionsChanged}
          ></cardnews-objects-editor>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:format-list-bulleted"></ha-icon>
            <span>리스트 행</span>
          </div>
          <cardnews-list-editor
            .hass=${this.hass}
            .rows=${this._config.list ?? []}
            @rows-changed=${this._listChanged}
          ></cardnews-list-editor>
        </div>
      </div>
    `;
  }

  private _actionsChanged = (ev: ValueChangedEvent<Array<Record<string, unknown>>>): void => {
    ev.stopPropagation();
    const items = ev.detail.value;
    this._patch('hero_actions', items.length ? items : undefined);
  };

  private _listChanged = (ev: ValueChangedEvent<ListItem[]>): void => {
    ev.stopPropagation();
    const rows = ev.detail.value;
    this._patch('list', rows.length ? rows : undefined);
  };
}

if (!customElements.get('cardnews-camera-hero-editor')) {
  customElements.define('cardnews-camera-hero-editor', CardNewsCameraHeroEditor);
}
