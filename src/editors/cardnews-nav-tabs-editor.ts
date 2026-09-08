import { html, nothing, type TemplateResult } from 'lit';
import {
  CardNewsEditorBase,
  type FormSchemaItem,
  type ValueChangedEvent,
} from './editor-common.js';
import './cardnews-objects-editor.js';

/** Config shape mirrors the one declared inside cardnews-nav-tabs.ts. */
interface NavTab {
  icon: string;
  label?: string;
  path: string;
  id?: string;
}
interface NavTabsConfig {
  type: string;
  active?: string;
  tabs: NavTab[];
}

const TAB_SCHEMA: FormSchemaItem[] = [
  {
    type: 'grid',
    schema: [
      { name: 'icon', selector: { icon: {} }, required: true },
      { name: 'label', selector: { text: {} } },
    ],
  },
  { name: 'path', selector: { text: {} }, required: true },
  { name: 'id', selector: { text: {} } },
];

const TAB_LABELS: Record<string, string> = {
  icon: '아이콘 (필수)',
  label: '탭 이름',
  path: '이동 경로 (필수, 예: /cardnews-lab/summary)',
  id: '고정 id (선택 — active 매칭용)',
};

const FORM_SCHEMA: FormSchemaItem[] = [{ name: 'active', selector: { text: {} } }];

export class CardNewsNavTabsEditor extends CardNewsEditorBase<NavTabsConfig> {
  protected override get labels(): Record<string, string> {
    return { active: '강제 활성 탭 (비우면 현재 URL로 자동 판정)' };
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <div class="root">
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:tab"></ha-icon>
            <span>탭 목록</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${(this._config.tabs ?? []) as unknown as Array<Record<string, unknown>>}
            .schema=${TAB_SCHEMA}
            .labels=${TAB_LABELS}
            .titleKeys=${['label', 'path']}
            .defaults=${{ icon: 'mdi:view-dashboard', path: '/' }}
            .addLabel=${'탭 추가'}
            .emptyLabel=${'탭이 없습니다. 최소 1개는 필요합니다.'}
            @items-changed=${this._tabsChanged}
          ></cardnews-objects-editor>
          <div class="section-hint">아이콘과 경로는 필수입니다. 경로가 비면 카드가 설정 오류를 냅니다.</div>
        </div>

        <ha-form
          .hass=${this.hass}
          .data=${this._formData(['active'])}
          .schema=${FORM_SCHEMA}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._formChanged}
        ></ha-form>
      </div>
    `;
  }

  private _tabsChanged = (ev: ValueChangedEvent<Array<Record<string, unknown>>>): void => {
    ev.stopPropagation();
    this._patch('tabs', ev.detail.value);
  };
}

if (!customElements.get('cardnews-nav-tabs-editor')) {
  customElements.define('cardnews-nav-tabs-editor', CardNewsNavTabsEditor);
}
