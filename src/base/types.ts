// Shared types for CardNews cards.

// Minimal HomeAssistant surface we depend on. Kept intentionally narrow so we
// don't need to pull in the full `home-assistant-js-websocket` types.
export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & {
    friendly_name?: string;
    entity_picture?: string;
    unit_of_measurement?: string;
    icon?: string;
    device_class?: string;
  };
  last_changed?: string;
  last_updated?: string;
}

export interface HassConnection {
  subscribeMessage: <T = unknown>(
    callback: (msg: T) => void,
    subscribeMessage: Record<string, unknown>,
  ) => Promise<() => Promise<void>>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  themes?: { darkMode?: boolean };
  connection?: HassConnection;
  callService: (
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ) => Promise<unknown>;
  callWS?: <T = unknown>(msg: Record<string, unknown>) => Promise<T>;
  formatEntityState?: (stateObj: HassEntity) => string;
}

export type StatusColor = 'green' | 'gray' | 'blue' | 'red' | 'amber';
export type HeroTheme = 'dark' | 'light';


export interface HeroAction {
  entity: string;
  entities?: string[];
  labels?: string[];
  icon?: string;
  label?: string;
  action_type?: 'toggle' | 'remote_modal' | 'service' | 'light_modal' | 'tv_remote';
  // For remote_modal: 'ac' | 'fan'. For tv_remote: the remote.* entity id
  // (e.g. 'remote.shield_android_tv') that Android TV Remote 2 uses.
  remote?: 'ac' | 'fan' | string;
  // tv_remote only — media_player.* for source/power display
  tv_entity?: string;
  // tv_remote only — media_player.* for volume (soundbar/AVR). If absent, tv_entity is used.
  volume_entity?: string;
  // tv_remote only — app launcher chips.
  apps?: Array<{ label: string; icon?: string; package?: string; url?: string; logo?: string }>;
  hdmi_select?: string;
  hdmi_power?: string;
  hdmi_prev?: string;
  hdmi_next?: string;
  // v0.12 — service action (used with action_type: 'service')
  service?: string; // e.g. 'vacuum.start' or 'vacuum.return_to_base'
  service_data?: Record<string, unknown>;
  // Optional toggle behavior: if the entity's state ∈ active_states, call
  // toggle_service instead of service.
  toggle_service?: string;
  toggle_service_data?: Record<string, unknown>;
  active_states?: string[];
  // v0.12 — when this action is 'active' (for service actions) color the icon cyan
  spin_when_active?: boolean;
}


export interface HeroImageByState {
  entity: string;
  map: Record<string, string>;
  default?: string;
}

export interface HeroConfig {
  category?: string;
  category_icon?: string;
  title?: string;
  subtitle?: string;
  // v0.9 — dynamic title/subtitle via mini-jinja templates
  title_template?: string;
  subtitle_template?: string;
  hero_image?: string;
  hero_image_by_state?: HeroImageByState;
  hero_image_entity?: string;
  room?: string;
  status_entity?: string;
  status_text?: string;
  status_color?: StatusColor;
  // v0.11 — dynamic status via template. status_template returns a StatusColor keyword.
  status_template?: string;
  status_text_template?: string;
  size?: 'md' | 'lg';
  hero_theme?: HeroTheme;
  // v0.8 — light glow overlay
  glow_entities?: string[];
  glow_position?: string;
  glow_color?: string;
  // v0.10 — top-right action chips over the hero image
  hero_actions?: HeroAction[];
}

// --- Row types (v0.4) --------------------------------------------------

export type ListRowType = 'value' | 'switch' | 'slider' | 'bar' | 'select' | 'balls' | 'forecast' | 'light' | 'calendar_events' | 'volume' | 'header';

export interface BaseRow {
  type?: ListRowType;
  icon?: string;
  icon_color?: string; // hex or 'auto'
  label?: string;
  entity?: string;
  // v0.14 — opt-out of auto-hide when entity state is empty/unavailable
  always_show?: boolean;
}

export interface ValueRow extends BaseRow {
  type?: 'value';
  value?: string | number | null;
  value_template?: string; // reserved
  unit?: string;
}

export interface SwitchRow extends BaseRow {
  type: 'switch';
  light_entity?: string;
  light_entities?: string[];
  light_labels?: string[];
}

export interface SliderRow extends BaseRow {
  type: 'slider';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  service?: string; // override; default input_number.set_value / light.turn_on(brightness_pct)
}

export interface BarRow extends BaseRow {
  type: 'bar';
  value?: number;                 // explicit numeric value (overrides entity)
  max?: number;                   // max value for 100% (default: auto — largest visible)
  color?: string;                 // bar fill color
  unit?: string;                  // default: entity unit or ''
}

export interface SelectRow extends BaseRow {
  type: 'select';
  // input_select.* entity — options come from entity.attributes.options
}

export interface BallsRow extends BaseRow {
  type: 'balls';
  // sensor whose state is "N N N N N N + B" (Korean 6/45 lotto format)
}

export interface ForecastRow extends BaseRow {
  type: 'forecast';
  days?: number; // default 5
}


export interface LightRow extends BaseRow {
  type: 'light';
  // Multiple entities: modal applies to all; toggle row toggles group.
  entities?: string[];
  // Display labels per entity (for scope segment in modal). Fallback: friendly_name.
  labels?: string[];
  // Force show color-wheel chip even if supported_color_modes not advertised.
  force_color_button?: boolean;
}

export interface CalendarEventsRow extends BaseRow {
  type: 'calendar_events';
  entities: string[];
  /** Legacy: lookahead-only window. Prefer days_before + days_after. */
  days?: number;
  /** Days before today to include (default 3). */
  days_before?: number;
  /** Days after today to include (default 3). */
  days_after?: number;
  max?: number;    // safety cap on number of events rendered (default 40)
  group_by_day?: boolean; // default true — show day headers
  show_description?: boolean; // default true
  /** Number of event rows visible before scrolling (default 4). */
  visible_rows?: number;
}

export interface HeaderRow extends BaseRow {
  type: 'header';
  /** subheader text; falls back to label */
  text?: string;
}

export type ListItem = ValueRow | SwitchRow | SliderRow | BarRow | SelectRow | BallsRow | ForecastRow | LightRow | CalendarEventsRow | VolumeRow | HeaderRow;

export interface ActionConfig {
  action?: 'more-info' | 'toggle' | 'call-service' | 'none' | 'navigate' | 'url';
  entity?: string;
  service?: string;
  service_data?: Record<string, unknown>;
  navigation_path?: string;
  url_path?: string;
}

// Generic hero-info card config
export interface CardNewsHeroInfoConfig extends HeroConfig {
  type: string;
  list?: ListItem[];
  tap_action?: ActionConfig;
}

// Room card config
export interface CardNewsRoomConfig {
  type: string;
  name: string;
  category?: string;
  category_icon?: string;
  hero_image?: string;
  hero_image_by_state?: HeroImageByState;
  hero_image_entity?: string;
  room?: string;
  hero_theme?: HeroTheme;
  temp_entity?: string;
  humidity_entity?: string;
  status_entity?: string;
  status_text?: string;
  status_color?: StatusColor;
  // v0.8 — glow overlay when any of these entities are on
  glow_entities?: string[];
  glow_position?: string;
  glow_color?: string;
  // v0.4: new preferred way — arbitrary rows
  list?: ListItem[];
  // legacy — auto-converted to switch rows
  switches?: Array<{
    entity: string;
    label?: string;
    icon?: string;
  }>;
}

export interface VolumeRow extends BaseRow {
  type: 'volume';
  step_service?: string; // fallback per-domain
  mute?: boolean;         // show mute button (default true)
}
