import { nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { HeroCardBase } from '../base/HeroCardBase.js';
import type {
  CardNewsRoomConfig,
  HeroConfig,
  ListItem,
  SwitchRow,
  ValueRow,
} from '../base/types.js';

/**
 * cardnews-room — room-oriented tile.
 * v0.8: passes `room` and `glow_entities` through to HeroCardBase.
 */
export class CardNewsRoom extends HeroCardBase {
  declare _config: CardNewsRoomConfig;
  @state() private _hasConfig = false;

  public override setConfig(config: unknown): void {
    super.setConfig(config);
    const cfg = config as Partial<CardNewsRoomConfig> | null;
    if (!cfg || typeof cfg !== 'object') {
      this._configError = 'Invalid config';
      return;
    }
    if (!cfg.name) {
      this._configError = 'cardnews-room: `name` is required';
      return;
    }
    this._config = {
      type: 'custom:cardnews-room',
      ...cfg,
    } as CardNewsRoomConfig;
    this._hasConfig = true;
  }

  public static getStubConfig(): Partial<CardNewsRoomConfig> {
    return {
      name: '거실',
      category: 'LIVING ROOM',
      category_icon: 'mdi:sofa',
      switches: [],
    };
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this._hasConfig || !this._config) return nothing;
    const cfg = this._config;

    const tempState = cfg.temp_entity ? this._entityState(cfg.temp_entity, '') : '';
    const humState = cfg.humidity_entity ? this._entityState(cfg.humidity_entity, '') : '';
    const subtitleBits: string[] = [];
    if (tempState) subtitleBits.push(`${Math.round(Number(tempState) * 10) / 10}°`);
    if (humState) subtitleBits.push(`${Math.round(Number(humState))}%`);

    const heroCfg: HeroConfig = {
      category: cfg.category,
      category_icon: cfg.category_icon,
      title: cfg.name,
      subtitle: subtitleBits.join(' · ') || undefined,
      hero_image: cfg.hero_image,
      hero_image_entity: cfg.hero_image_entity,
      room: cfg.room,
      hero_theme: cfg.hero_theme,
      status_entity: cfg.status_entity,
      status_text: cfg.status_text,
      status_color: cfg.status_color,
      glow_entities: cfg.glow_entities,
      glow_position: cfg.glow_position,
      glow_color: cfg.glow_color,
    };

    const rows: ListItem[] = [];

    if (cfg.temp_entity) {
      rows.push({
        type: 'value',
        icon: 'mdi:thermometer',
        label: '온도',
        entity: cfg.temp_entity,
        unit: '°C',
      } as ValueRow);
    }
    if (cfg.humidity_entity) {
      rows.push({
        type: 'value',
        icon: 'mdi:water-percent',
        label: '습도',
        entity: cfg.humidity_entity,
        unit: '%',
      } as ValueRow);
    }

    if (cfg.list && cfg.list.length) {
      rows.push(...cfg.list);
    }

    if (cfg.switches && cfg.switches.length) {
      for (const sw of cfg.switches) {
        rows.push({
          type: 'switch',
          entity: sw.entity,
          label: sw.label,
          icon: sw.icon ?? this._defaultIconFor(sw.entity),
          light_entity: (sw as any).light_entity,
          light_entities: (sw as any).light_entities,
          light_labels: (sw as any).light_labels,
        } as SwitchRow);
      }
    }

    const hero = this.renderHero(heroCfg);
    const list = this.renderList(rows);
    return this.renderCard(hero, list);
  }

  private _defaultIconFor(entityId: string): string {
    const [domain] = entityId.split('.');
    if (domain === 'light') return 'mdi:lightbulb-outline';
    if (domain === 'switch') return 'mdi:toggle-switch-outline';
    if (domain === 'fan') return 'mdi:fan';
    return 'mdi:power';
  }
}

if (!customElements.get('cardnews-room')) {
  customElements.define('cardnews-room', CardNewsRoom);
}
