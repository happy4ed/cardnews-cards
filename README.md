# CardNews Cards

Home Assistant Lovelace card library in a modern **card-news** style — large
hero images with overlay labels, category chips, floating status pills, and a
clean info list below.

Ships multiple cards:

| Card | Type | Description |
|------|------|-------------|
| Hero Info | `custom:cardnews-hero-info` | Generic card-news tile driven entirely by config. Great for cars, appliances, one-off status modules. |
| Room | `custom:cardnews-room` | Room tile with temperature, humidity, and toggleable light/switch pills. |

## Install (HACS)

1. HACS → Frontend → three-dots → *Custom repositories*
2. Add this repo as **Lovelace**
3. Install *CardNews* and add the resource:
   `/hacsfiles/cardnews-cards/cardnews.js` (type: JavaScript Module)

## Manual install

Copy `dist/cardnews.js` into `<config>/www/cardnews/` and register:

```yaml
resources:
  - url: /local/cardnews/cardnews.js
    type: module
```

## Example configs

### Hero info

```yaml
type: custom:cardnews-hero-info
category: "MERCEDES-BENZ · GLB"
title: "Untracked Area"
subtitle: "차량 · 마지막 주행 요약"
hero_image: /local/cardnews/car-hero.jpg  # place under www/cardnews/
status_text: "PARKED"
status_color: green
list:
  - icon: mdi:map-marker
    label: 현재 주차 위치
    entity: sensor.car_location
  - icon: mdi:car
    label: 차량 상태
    entity: binary_sensor.parking
```

### Room

```yaml
type: custom:cardnews-room
name: Living Room
category: LIVING ROOM
hero_image: /local/cardnews/room-livingroom.jpg  # place under www/cardnews/
temp_entity: sensor.livingroom_temperature
humidity_entity: sensor.livingroom_humidity
switches:
  - entity: switch.livingroom_light_1
    label: Light 1
  - entity: switch.livingroom_light_2
    label: Light 2
```

## Development

```bash
npm install
npm run build     # → dist/cardnews.js
npm run dev       # watch mode
```

## Design tokens

All cards read a shared token set (radius, shadow, fonts, hero heights,
status colors). See `src/tokens.css` and the `:host` block in
`src/base/HeroCardBase.ts`. Cards inherit HA's `--card-background-color`
and text-color vars so they follow the active HA theme.

## Roadmap

- Phase 2: `cardnews-appliance`, `cardnews-media`, `cardnews-weather`
- Phase 2: image pack shipped alongside cards
- Phase 2: `tap_action` / `hold_action` full support with `hass-action` helpers
