import { nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { HeroCardBase } from '../base/HeroCardBase.js';
import type { CardNewsHeroInfoConfig } from '../base/types.js';

/**
 * cardnews-hero-info — generic card-news style tile.
 * Hero image + category chip + status pill + title/subtitle,
 * then a list of rows below (value / switch / slider).
 *
 * hero_image config accepts:
 *   - Full URL / absolute path (`/local/…`, `http…`) — used as-is.
 *   - Base name (e.g. `hero-livingroom`) — auto-resolved to
 *     `/local/cardnews/heroes/{base}-{tod}.png` where tod is the
 *     current time-of-day bucket (dawn/morning/afternoon/evening/night).
 *     Cross-fades over 800ms when the bucket changes.
 */
export class CardNewsHeroInfo extends HeroCardBase {
  declare _config: CardNewsHeroInfoConfig;
  @state() private _hasConfig = false;

  public override setConfig(config: unknown): void {
    super.setConfig(config);
    const cfg = config as Partial<CardNewsHeroInfoConfig> | null;
    if (!cfg || typeof cfg !== 'object') {
      this._configError = 'Invalid config';
      return;
    }
    if (!cfg.title && !cfg.title_template) {
      this._configError = 'cardnews-hero-info: `title` or `title_template` is required';
      return;
    }
    this._config = {
      type: 'custom:cardnews-hero-info',
      ...cfg,
    } as CardNewsHeroInfoConfig;
    this._hasConfig = true;
  }

  public static getStubConfig(): Partial<CardNewsHeroInfoConfig> {
    return {
      category: 'LIVING · CLIMATE',
      category_icon: 'mdi:home',
      title: '거실',
      subtitle: '25.2° · 48%',
      status_text: 'AC ON',
      status_color: 'green',
      list: [
        { icon: 'mdi:thermometer', label: '현재 온도', entity: 'sensor.living_temp' },
        { type: 'switch', icon: 'mdi:lightbulb-outline', label: '천장 조명', entity: 'light.ceiling' },
        { type: 'slider', icon: 'mdi:brightness-6', label: '밝기', entity: 'light.ceiling' },
      ],
    };
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this._hasConfig || !this._config) return nothing;
    const cfg = this._config;
    const hero = this.renderHero(cfg);
    const list = this.renderList(cfg.list);
    return this.renderCard(hero, list);
  }
}

if (!customElements.get('cardnews-hero-info')) {
  customElements.define('cardnews-hero-info', CardNewsHeroInfo);
}
