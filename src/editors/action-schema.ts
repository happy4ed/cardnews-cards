import type { FormSchemaItem } from './editor-common.js';

/**
 * Form schema + labels for one `hero_actions` entry — the chips drawn over the
 * hero image. Shared by hero-info / sensor-panel / camera-hero editors.
 *
 * Only the common fields get a form control; the modal-specific extras
 * (apps[], hdmi_*, service_data, active_states, toggle_service*) stay
 * YAML-only and are preserved untouched by the objects editor.
 */
export const HERO_ACTION_SCHEMA: FormSchemaItem[] = [
  { name: 'entity', selector: { entity: {} }, required: true },
  {
    type: 'grid',
    schema: [
      { name: 'icon', selector: { icon: {} } },
      { name: 'active_icon', selector: { icon: {} } },
    ],
  },
  {
    type: 'grid',
    schema: [
      { name: 'label', selector: { text: {} } },
      {
        name: 'action_type',
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              { value: 'toggle', label: 'toggle (켜기/끄기)' },
              { value: 'service', label: 'service (서비스 호출)' },
              { value: 'light_modal', label: 'light_modal (조명 모달)' },
              { value: 'remote_modal', label: 'remote_modal (에어컨/선풍기/보일러 리모컨)' },
              { value: 'tv_remote', label: 'tv_remote (TV 리모컨)' },
            ],
          },
        },
      },
    ],
  },
  {
    type: 'expandable',
    name: '',
    title: 'service / remote 옵션',
    icon: 'mdi:tune',
    schema: [
      { name: 'service', selector: { text: {} } },
      { name: 'toggle_service', selector: { text: {} } },
      { name: 'remote', selector: { text: {} } },
      { name: 'tv_entity', selector: { entity: { filter: [{ domain: 'media_player' }] } } },
      { name: 'volume_entity', selector: { entity: { filter: [{ domain: 'media_player' }] } } },
      { name: 'spin_when_active', selector: { boolean: {} } },
    ],
  },
];

export const HERO_ACTION_LABELS: Record<string, string> = {
  entity: 'Entity',
  icon: '아이콘',
  active_icon: '켜짐 아이콘',
  label: '라벨',
  action_type: '동작 방식',
  service: '서비스 (예: vacuum.start)',
  toggle_service: '반대 동작 서비스',
  remote: "리모컨 종류 ('ac' / 'fan' / 'boiler' / remote.* entity)",
  tv_entity: 'TV media_player',
  volume_entity: '볼륨 media_player',
  spin_when_active: '동작 중 아이콘 강조',
};
