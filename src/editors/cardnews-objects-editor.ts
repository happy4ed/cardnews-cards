import { LitElement, html, css, nothing, type CSSResultGroup, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from '../base/types.js';
import type { FormSchemaItem, ValueChangedEvent } from './editor-common.js';

/**
 * cardnews-objects-editor — generic repeatable-object editor.
 *
 * Drives every "array of small objects" field in the card set: room
 * `switches`, sensor-panel `metrics` / `chart_entities`, hero `hero_actions`,
 * nav-tabs `tabs`. Give it a form schema and it renders an add/remove/reorder
 * list of ha-forms.
 *
 * Emits `items-changed` with `detail.value` = the new array. Keys outside the
 * supplied schema are preserved on each item.
 */

type AnyItem = Record<string, unknown>;

const ICON_UP = 'M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z';
const ICON_DOWN = 'M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z';
const ICON_DELETE =
  'M15,20H9V8H15M15.5,4H14L13,3H11L10,4H8.5V6H15.5V4Z M7,6V20A2,2 0 0,0 9,22H15A2,2 0 0,0 17,20V6H7Z';

export class CardNewsObjectsEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public items: AnyItem[] = [];
  @property({ attribute: false }) public schema: FormSchemaItem[] = [];
  @property({ attribute: false }) public labels: Record<string, string> = {};
  /** Keys tried in order to build each row's display title. */
  @property({ attribute: false }) public titleKeys: string[] = ['label', 'name', 'entity'];
  /** Seed object used when adding a new item. */
  @property({ attribute: false }) public defaults: AnyItem = {};
  @property() public addLabel = '항목 추가';
  @property() public emptyLabel = '항목이 없습니다.';

  @state() private _open: Record<number, boolean> = {};

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass) return nothing;
    const items = this.items ?? [];
    return html`
      <div class="items">
        ${items.map((item, i) => this._renderItem(item, i))}
        ${items.length === 0 ? html`<div class="empty">${this.emptyLabel}</div>` : nothing}
      </div>
      <ha-button @click=${this._add} class="add-btn">${this.addLabel}</ha-button>
    `;
  }

  private _renderItem(item: AnyItem, index: number): TemplateResult {
    const open = this._open[index] ?? false;
    let title = '';
    for (const k of this.titleKeys) {
      const v = item[k];
      if (typeof v === 'string' && v) {
        title = v;
        break;
      }
    }
    if (!title) title = `#${index + 1}`;

    return html`
      <div class="item">
        <div class="item-head">
          <ha-icon-button
            .path=${open ? ICON_UP : ICON_DOWN}
            .label=${open ? '접기' : '펼치기'}
            @click=${() => this._toggle(index)}
          ></ha-icon-button>
          <div class="item-title" @click=${() => this._toggle(index)}>${title}</div>
          <ha-icon-button .path=${ICON_DELETE} .label=${'삭제'} @click=${() => this._remove(index)}></ha-icon-button>
          <ha-icon-button
            .path=${ICON_UP}
            .label=${'위로'}
            .disabled=${index === 0}
            @click=${() => this._move(index, -1)}
          ></ha-icon-button>
          <ha-icon-button
            .path=${ICON_DOWN}
            .label=${'아래로'}
            .disabled=${index === (this.items?.length ?? 0) - 1}
            @click=${() => this._move(index, 1)}
          ></ha-icon-button>
        </div>
        ${open
          ? html`
              <div class="item-body">
                <ha-form
                  .hass=${this.hass}
                  .data=${item}
                  .schema=${this.schema}
                  .computeLabel=${this._computeLabel}
                  @value-changed=${(e: ValueChangedEvent<AnyItem>) => this._itemChanged(index, e)}
                ></ha-form>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _computeLabel = (schema: { name: string; title?: string }): string => {
    if (schema.title) return schema.title;
    return this.labels[schema.name] ?? schema.name;
  };

  private _toggle(index: number): void {
    this._open = { ...this._open, [index]: !(this._open[index] ?? false) };
  }

  private _itemChanged(index: number, ev: ValueChangedEvent<AnyItem>): void {
    ev.stopPropagation();
    const items = [...(this.items ?? [])];
    const current = { ...items[index] };
    for (const [k, v] of Object.entries(ev.detail.value)) {
      if (v === '' || v === undefined || v === null) delete current[k];
      else current[k] = v;
    }
    items[index] = current;
    this._emit(items);
  }

  private _add = (): void => {
    const items = [...(this.items ?? []), { ...this.defaults }];
    this._open = { ...this._open, [items.length - 1]: true };
    this._emit(items);
  };

  private _remove(index: number): void {
    const items = [...(this.items ?? [])];
    items.splice(index, 1);
    this._emit(items);
  }

  private _move(index: number, delta: number): void {
    const items = [...(this.items ?? [])];
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const [it] = items.splice(index, 1);
    items.splice(target, 0, it);
    this._emit(items);
  }

  private _emit(items: AnyItem[]): void {
    this.items = items;
    this.dispatchEvent(
      new CustomEvent('items-changed', { detail: { value: items }, bubbles: true, composed: true }),
    );
  }

  static styles: CSSResultGroup = css`
    :host {
      display: block;
    }
    .items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .item {
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      border-radius: 8px;
      overflow: hidden;
    }
    .item-head {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 2px 4px;
      background: var(--secondary-background-color, rgba(255, 255, 255, 0.04));
    }
    .item-title {
      flex: 1;
      cursor: pointer;
      font-size: 14px;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 8px 0;
    }
    .item-body {
      padding: 10px 12px 12px;
    }
    .empty {
      font-size: 12px;
      color: var(--secondary-text-color);
      padding: 8px 4px;
    }
    .add-btn {
      margin-top: 10px;
    }
    ha-icon-button {
      --mdc-icon-button-size: 34px;
      --mdc-icon-size: 18px;
      color: var(--secondary-text-color);
    }
  `;
}

if (!customElements.get('cardnews-objects-editor')) {
  customElements.define('cardnews-objects-editor', CardNewsObjectsEditor);
}
