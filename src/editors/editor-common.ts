import { LitElement, css, type CSSResultGroup } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant, StatusColor } from '../base/types.js';

/**
 * Shared plumbing for every CardNews visual editor.
 *
 * Design rules (kept consistent across all cards):
 *   - The editor never drops keys it doesn't understand. It spreads the
 *     existing config and only patches what the form touched, so hand-written
 *     YAML (hero_actions, templates, exotic rows) survives a round-trip
 *     through the UI editor.
 *   - Clearing a text field deletes the key rather than storing '', which is
 *     the HA convention and keeps the YAML view tidy.
 */

export interface ValueChangedEvent<T = unknown> extends CustomEvent {
  detail: { value: T };
}

export type FormSchemaItem =
  | { name: string; selector: Record<string, unknown>; required?: boolean }
  | { type: 'grid'; name?: string; schema: FormSchemaItem[] }
  | { type: 'expandable'; name: string; title?: string; icon?: string; schema: FormSchemaItem[] };

export const STATUS_COLORS: StatusColor[] = ['green', 'gray', 'blue', 'red', 'amber'];

export const statusColorSelector = {
  select: {
    mode: 'dropdown',
    options: STATUS_COLORS.map((c) => ({ value: c, label: c })),
  },
};

/** Labels shared by every hero-based card. Per-card maps extend this. */
export const HERO_LABELS: Record<string, string> = {
  title: '제목',
  subtitle: '부제',
  name: '이름',
  title_template: '제목 (템플릿)',
  subtitle_template: '부제 (템플릿)',
  status_text_template: '상태 텍스트 (템플릿)',
  status_template: '상태 색 (템플릿)',
  category: '카테고리 배지 텍스트',
  category_icon: '카테고리 아이콘',
  status_text: '상태 칩 텍스트',
  status_entity: '상태 판정 entity',
  status_color: '상태 색',
  hero_image: 'Hero 이미지 경로 (예: /local/cardnews/heroes/… 또는 base name)',
  hero_image_entity: 'Hero 이미지 entity (image.* / camera.*)',
  hero_theme: 'Hero 테마',
  room: 'Room 키 (자동 hero 해상용, 예: livingroom)',
  glow_entities: 'Glow 대상 조명',
  glow_position: 'Glow 위치 (예: 50% 60%)',
  glow_color: 'Glow 색 (hex)',
};

/** Hero template fields — identical on every hero-based card. */
export const TEMPLATE_SECTION: FormSchemaItem = {
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
};

/** Category badge + status chip — identical on every hero-based card. */
export const BADGE_SECTION: FormSchemaItem = {
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
        { name: 'status_color', selector: statusColorSelector },
      ],
    },
    { name: 'status_entity', selector: { entity: {} } },
  ],
};

/** Hero image block — identical on every hero-based card. */
export const HERO_IMAGE_SECTION: FormSchemaItem = {
  type: 'expandable',
  name: '',
  title: 'Hero 이미지',
  icon: 'mdi:image-outline',
  schema: [
    { name: 'hero_image', selector: { text: {} } },
    { name: 'hero_image_entity', selector: { entity: {} } },
    {
      type: 'grid',
      schema: [
        { name: 'room', selector: { text: {} } },
        {
          name: 'hero_theme',
          selector: {
            select: {
              mode: 'dropdown',
              options: [
                { value: 'dark', label: 'dark' },
                { value: 'light', label: 'light' },
              ],
            },
          },
        },
      ],
    },
  ],
};

/** Glow overlay block — used by hero-info / room / camera-hero. */
export const GLOW_SECTION: FormSchemaItem = {
  type: 'expandable',
  name: '',
  title: 'Glow 오버레이 (조명 켜짐 표시)',
  icon: 'mdi:lightbulb-on-outline',
  schema: [
    {
      name: 'glow_entities',
      selector: { entity: { multiple: true, filter: [{ domain: 'light' }, { domain: 'switch' }] } },
    },
    {
      type: 'grid',
      schema: [
        { name: 'glow_position', selector: { text: {} } },
        { name: 'glow_color', selector: { text: {} } },
      ],
    },
  ],
};

type AnyConfig = Record<string, unknown>;

/**
 * Base class: holds the config, emits config-changed, and implements the
 * "patch known keys, preserve everything else" merge that every editor needs.
 */
export abstract class CardNewsEditorBase<C extends { type: string }> extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() protected _config?: C;

  public setConfig(config: C): void {
    this._config = config;
  }

  /** Project only the keys ha-form knows about, so it can't render foreign keys. */
  protected _formData(keys: string[]): AnyConfig {
    const out: AnyConfig = {};
    if (!this._config) return out;
    const src = this._config as unknown as AnyConfig;
    for (const k of keys) {
      if (src[k] !== undefined) out[k] = src[k];
    }
    return out;
  }

  protected _computeLabel = (schema: { name: string; title?: string }): string => {
    if (schema.title) return schema.title;
    return this.labels[schema.name] ?? HERO_LABELS[schema.name] ?? schema.name;
  };

  /** Per-card label overrides. */
  protected get labels(): Record<string, string> {
    return {};
  }

  /** Generic ha-form handler: merge patch, dropping emptied fields. */
  protected _formChanged = (ev: ValueChangedEvent<AnyConfig>): void => {
    if (!this._config) return;
    ev.stopPropagation();
    const patch = ev.detail.value;
    const next = { ...(this._config as unknown as AnyConfig) };
    for (const [k, v] of Object.entries(patch)) {
      if (v === '' || v === undefined || v === null) delete next[k];
      else next[k] = v;
    }
    this._emitConfig(next as unknown as C);
  };

  /** Patch a single key (used by the bespoke sub-editors). */
  protected _patch(key: string, value: unknown): void {
    if (!this._config) return;
    const next = { ...(this._config as unknown as AnyConfig) };
    if (value === '' || value === undefined || value === null) delete next[key];
    else next[key] = value;
    this._emitConfig(next as unknown as C);
  }

  protected _emitConfig(config: C): void {
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
    .section-hint,
    .hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      line-height: 1.5;
    }
    .hint {
      padding: 4px 4px 0;
    }
    ha-form {
      display: block;
    }
  `;
}
