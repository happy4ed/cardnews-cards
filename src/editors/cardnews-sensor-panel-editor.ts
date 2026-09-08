import { html, nothing, type TemplateResult } from 'lit';
import type { ListItem } from '../base/types.js';
import type { CardNewsSensorPanelConfig } from '../cards/cardnews-sensor-panel.js';
import {
  CardNewsEditorBase,
  BADGE_SECTION,
  HERO_IMAGE_SECTION,
  TEMPLATE_SECTION,
  type FormSchemaItem,
  type ValueChangedEvent,
} from './editor-common.js';
import { HERO_ACTION_SCHEMA, HERO_ACTION_LABELS } from './action-schema.js';
import './cardnews-list-editor.js';
import './cardnews-objects-editor.js';

/**
 * cardnews-sensor-panel-editor — visual editor for `custom:cardnews-sensor-panel`.
 *
 * Covers the three arrays that make this card what it is (`metrics`,
 * `chart_entities`, `list`) plus the discomfort-index pair, which is stored as
 * a positional [temp, humidity] tuple and so gets two dedicated pickers rather
 * than a raw list field.
 */

const FORM_SCHEMA: FormSchemaItem[] = [
  {
    type: 'grid',
    schema: [
      { name: 'title', selector: { text: {} } },
      { name: 'subtitle', selector: { text: {} } },
    ],
  },
  { name: 'chart_hours', selector: { number: { mode: 'box', min: 1, max: 720 } } },
  TEMPLATE_SECTION,
  BADGE_SECTION,
  HERO_IMAGE_SECTION,
];

const FORM_KEYS = [
  'title',
  'subtitle',
  'chart_hours',
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
];

const METRIC_SCHEMA: FormSchemaItem[] = [
  { name: 'entity', selector: { entity: {} }, required: true },
  {
    type: 'grid',
    schema: [
      { name: 'label', selector: { text: {} }, required: true },
      { name: 'unit', selector: { text: {} } },
      { name: 'accent', selector: { text: {} } },
    ],
  },
];

const METRIC_LABELS: Record<string, string> = {
  entity: 'Entity',
  label: '이름 (필수)',
  unit: '단위 (비우면 entity 단위)',
  accent: '강조 색 (hex)',
};

const SERIES_SCHEMA: FormSchemaItem[] = [
  { name: 'entity', selector: { entity: {} }, required: true },
  {
    type: 'grid',
    schema: [
      { name: 'label', selector: { text: {} } },
      { name: 'color', selector: { text: {} } },
    ],
  },
];

const SERIES_LABELS: Record<string, string> = {
  entity: 'Entity',
  label: '범례 이름',
  color: '선 색 (hex)',
};

const DI_SCHEMA: FormSchemaItem[] = [
  {
    type: 'grid',
    schema: [
      { name: 'di_temp', selector: { entity: { filter: [{ domain: 'sensor' }] } } },
      { name: 'di_humidity', selector: { entity: { filter: [{ domain: 'sensor' }] } } },
    ],
  },
];

const DI_LABELS: Record<string, string> = {
  di_temp: '불쾌지수 — 온도 센서',
  di_humidity: '불쾌지수 — 습도 센서',
};

export class CardNewsSensorPanelEditor extends CardNewsEditorBase<CardNewsSensorPanelConfig> {
  protected override get labels(): Record<string, string> {
    return {
      chart_hours: '차트 기간 (시간, 기본 24)',
      ...DI_LABELS,
    };
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const di = this._config.discomfort_index_from ?? [];
    const diData = {
      di_temp: di[0] ?? '',
      di_humidity: di[1] ?? '',
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
            <ha-icon icon="mdi:view-grid-outline"></ha-icon>
            <span>메트릭 (상단 숫자 타일)</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${(this._config.metrics ?? []) as unknown as Array<Record<string, unknown>>}
            .schema=${METRIC_SCHEMA}
            .labels=${METRIC_LABELS}
            .titleKeys=${['label', 'entity']}
            .addLabel=${'메트릭 추가'}
            .emptyLabel=${'메트릭이 없습니다.'}
            @items-changed=${this._metricsChanged}
          ></cardnews-objects-editor>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:chart-line"></ha-icon>
            <span>차트 계열</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${(this._config.chart_entities ?? []) as unknown as Array<Record<string, unknown>>}
            .schema=${SERIES_SCHEMA}
            .labels=${SERIES_LABELS}
            .titleKeys=${['label', 'entity']}
            .addLabel=${'계열 추가'}
            .emptyLabel=${'차트 계열이 없습니다.'}
            @items-changed=${this._seriesChanged}
          ></cardnews-objects-editor>
          <div class="section-hint">
            계열이 2개면 좌/우 이중 축으로 그려집니다 (좌: 첫 계열, 우: 둘째 계열).
            임계값 반응 색(reactive_thresholds)은 YAML에서만 수정합니다 — 여기서 건드리지 않습니다.
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:thermometer-water"></ha-icon>
            <span>불쾌지수 부제</span>
          </div>
          <ha-form
            .hass=${this.hass}
            .data=${diData}
            .schema=${DI_SCHEMA}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._diChanged}
          ></ha-form>
          <div class="section-hint">둘 다 지정하면 부제가 불쾌지수 문구로 자동 대체됩니다. 하나라도 비우면 해제됩니다.</div>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
            <span>Hero 액션 칩</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${(this._config.hero_actions ?? []) as unknown as Array<Record<string, unknown>>}
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

  private _metricsChanged = (ev: ValueChangedEvent<Array<Record<string, unknown>>>): void => {
    ev.stopPropagation();
    const items = ev.detail.value;
    this._patch('metrics', items.length ? items : undefined);
  };

  private _seriesChanged = (ev: ValueChangedEvent<Array<Record<string, unknown>>>): void => {
    ev.stopPropagation();
    const items = ev.detail.value;
    this._patch('chart_entities', items.length ? items : undefined);
  };

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

  private _diChanged = (ev: ValueChangedEvent<Record<string, unknown>>): void => {
    ev.stopPropagation();
    const v = ev.detail.value;
    const temp = typeof v.di_temp === 'string' ? v.di_temp : '';
    const humid = typeof v.di_humidity === 'string' ? v.di_humidity : '';
    this._patch('discomfort_index_from', temp && humid ? [temp, humid] : undefined);
  };
}

if (!customElements.get('cardnews-sensor-panel-editor')) {
  customElements.define('cardnews-sensor-panel-editor', CardNewsSensorPanelEditor);
}
