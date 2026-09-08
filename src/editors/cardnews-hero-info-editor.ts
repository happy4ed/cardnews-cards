import { html, nothing, type TemplateResult } from 'lit';
import type { CardNewsHeroInfoConfig, ListItem } from '../base/types.js';
import {
  CardNewsEditorBase,
  BADGE_SECTION,
  HERO_IMAGE_SECTION,
  TEMPLATE_SECTION,
  GLOW_SECTION,
  type FormSchemaItem,
  type ValueChangedEvent,
} from './editor-common.js';
import { HERO_ACTION_SCHEMA, HERO_ACTION_LABELS } from './action-schema.js';
import './cardnews-list-editor.js';
import './cardnews-objects-editor.js';

/**
 * cardnews-hero-info-editor — visual editor for `custom:cardnews-hero-info`.
 *
 * v0.13: the list rows (including calendar rows) and hero action chips are now
 * fully editable here; v0.12 only exposed top-level scalars plus a calendar
 * entity picker. `hero_image_by_state` remains YAML-only — it is a state→image
 * map with no sensible generic form — and is preserved untouched.
 */

const FORM_SCHEMA: FormSchemaItem[] = [
  {
    type: 'grid',
    schema: [
      { name: 'title', selector: { text: {} } },
      { name: 'subtitle', selector: { text: {} } },
    ],
  },
  TEMPLATE_SECTION,
  BADGE_SECTION,
  HERO_IMAGE_SECTION,
  GLOW_SECTION,
];

const FORM_KEYS = [
  'title',
  'subtitle',
  'title_template',
  'subtitle_template',
  'status_text_template',
  'status_template',
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

export class CardNewsHeroInfoEditor extends CardNewsEditorBase<CardNewsHeroInfoConfig> {
  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const cfg = this._config as CardNewsHeroInfoConfig & {
      hero_actions?: Array<Record<string, unknown>>;
      hero_image_by_state?: unknown;
    };

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
            <ha-icon icon="mdi:format-list-bulleted"></ha-icon>
            <span>리스트 행</span>
          </div>
          <cardnews-list-editor
            .hass=${this.hass}
            .rows=${cfg.list ?? []}
            @rows-changed=${this._listChanged}
          ></cardnews-list-editor>
          <div class="section-hint">
            캘린더 일정도 여기서 <b>calendar_events</b> 행으로 편집합니다 — 표시할 캘린더,
            앞뒤 며칠, 보이는 줄 수까지 전부.
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
            <span>Hero 액션 칩</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${cfg.hero_actions ?? []}
            .schema=${HERO_ACTION_SCHEMA}
            .labels=${HERO_ACTION_LABELS}
            .titleKeys=${['label', 'entity']}
            .addLabel=${'액션 추가'}
            .emptyLabel=${'액션 칩이 없습니다.'}
            @items-changed=${this._actionsChanged}
          ></cardnews-objects-editor>
          <div class="section-hint">Hero 이미지 우측 상단에 뜨는 버튼입니다.</div>
        </div>

        <div class="hint">
          ${cfg.hero_image_by_state
            ? html`이 카드는 <b>hero_image_by_state</b> (상태별 이미지 맵)를 쓰고 있습니다. 그 항목은
                <b>⋮ → Edit in YAML</b> 에서만 수정하세요 — 여기서 편집해도 지워지지 않습니다.<br />`
            : nothing}
          여기 없는 옵션은 YAML로 수정해도 안전합니다. 이 편집기는 알 수 없는 필드를 건드리지 않습니다.
        </div>
      </div>
    `;
  }

  private _listChanged = (ev: ValueChangedEvent<ListItem[]>): void => {
    ev.stopPropagation();
    const rows = ev.detail.value;
    this._patch('list', rows.length ? rows : undefined);
  };

  private _actionsChanged = (ev: ValueChangedEvent<Array<Record<string, unknown>>>): void => {
    ev.stopPropagation();
    const items = ev.detail.value;
    this._patch('hero_actions', items.length ? items : undefined);
  };
}

if (!customElements.get('cardnews-hero-info-editor')) {
  customElements.define('cardnews-hero-info-editor', CardNewsHeroInfoEditor);
}
