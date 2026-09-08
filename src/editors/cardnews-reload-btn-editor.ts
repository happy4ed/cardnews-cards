import { html, nothing, type TemplateResult } from 'lit';
import { CardNewsEditorBase, type FormSchemaItem } from './editor-common.js';

/** Config shape mirrors the one declared inside cardnews-reload-btn.ts. */
interface ReloadBtnConfig {
  type: string;
  icon?: string;
  label?: string;
}

const FORM_SCHEMA: FormSchemaItem[] = [
  {
    type: 'grid',
    schema: [
      { name: 'label', selector: { text: {} } },
      { name: 'icon', selector: { icon: {} } },
    ],
  },
];

const FORM_KEYS = ['label', 'icon'];

export class CardNewsReloadBtnEditor extends CardNewsEditorBase<ReloadBtnConfig> {
  protected override get labels(): Record<string, string> {
    return {
      label: '버튼 텍스트',
      icon: '아이콘 (기본 mdi:refresh)',
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
        <div class="hint">누르면 캐시를 무시하고 대시보드를 새로고침합니다.</div>
      </div>
    `;
  }
}

if (!customElements.get('cardnews-reload-btn-editor')) {
  customElements.define('cardnews-reload-btn-editor', CardNewsReloadBtnEditor);
}
