import './cards/cardnews-hero-info';
import './cards/cardnews-room';
import './cards/cardnews-reload-btn';
import './cards/cardnews-nav-tabs';
import './cards/cardnews-camera-hero';
import './cards/cardnews-sensor-panel';
import './cards/cardnews-remote-modal';
import './cards/cardnews-tv-remote-modal';
import './cards/cardnews-light-modal';
import './cards/cardnews-event-modal';

interface CustomCardEntry {
  type: string;
  name: string;
  description?: string;
  preview?: boolean;
  documentationURL?: string;
}
interface WindowWithCards extends Window {
  customCards?: CustomCardEntry[];
}
const w = window as WindowWithCards;
w.customCards = w.customCards ?? [];

function registerCard(entry: CustomCardEntry): void {
  if (!w.customCards) return;
  if (w.customCards.some((c) => c.type === entry.type)) return;
  w.customCards.push(entry);
}

registerCard({
  type: 'cardnews-hero-info',
  name: 'CardNews: Hero Info',
  description: 'Card-news style tile with hero image, category chip, status pill and info list',
  preview: true,
});
registerCard({
  type: 'cardnews-room',
  name: 'CardNews: Room',
  description: 'Room card-news tile with temp, humidity, and switch rows',
  preview: true,
});
registerCard({
  type: 'cardnews-reload-btn',
  name: 'CardNews: Reload Button',
  description: 'Refresh dashboard with cache-bust',
  preview: true,
});
registerCard({
  type: 'cardnews-nav-tabs',
  name: 'CardNews: Nav Tabs',
  description: 'Icon-only top navigation tab bar with underline for active view',
  preview: true,
});
registerCard({
  type: 'cardnews-camera-hero',
  name: 'CardNews: Camera Hero',
  description: 'Camera card with live stream as the hero + chips and info list',
  preview: true,
});
registerCard({
  type: 'cardnews-sensor-panel',
  name: 'CardNews: Sensor Panel',
  description: 'Hero + 2x2 metric grid + 24h sparkline + list — for air quality / climate dashboards',
  preview: true,
});

const version = '0.13.0';
console.info(
  `%c CARDNEWS %c v${version} `,
  'color:#fff;background:#1a1a1a;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:600',
  'color:#1a1a1a;background:#f5f5f5;padding:2px 6px;border-radius:0 4px 4px 0',
);

// Visual editors — imported eagerly so HA's card picker finds them even
// before a dynamic import resolves.
import './editors/cardnews-hero-info-editor.js';
import './editors/cardnews-room-editor.js';
import './editors/cardnews-camera-hero-editor.js';
import './editors/cardnews-sensor-panel-editor.js';
import './editors/cardnews-nav-tabs-editor.js';
import './editors/cardnews-reload-btn-editor.js';
