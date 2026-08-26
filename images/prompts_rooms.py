# Room-specific images. 9 rooms × 5 TOD = 45 images
ROOMS = {
  'livingroom': 'modern Korean apartment living room, gray sofa, wooden floor, minimalist Scandinavian decor, floor-to-ceiling window, ceiling downlights',
  'bedroom':    'modern Korean apartment bedroom, king-size bed with neutral linens, warm nightstand lamp, blackout curtain, minimalist',
  'kitchen':    'modern Korean apartment kitchen, sleek white cabinets, marble countertop, pendant lights above island, minimalist',
  'smallroom':  'modern Korean home office, wooden desk with monitor, ergonomic chair, wall-mounted shelves, warm task light, minimalist',
  'bathroom':   'modern Korean apartment bathroom, white tiles, freestanding vanity, backlit mirror, minimalist',
  'powderroom': 'modern Korean powder room with vanity dresser, backlit mirror, warm accent lights, minimalist',
  'balcony':    'modern Korean apartment balcony, wooden deck floor, few potted plants, floor lamp, minimalist',
  'entrance':   'modern Korean apartment entrance foyer, digital door lock, shoe cabinet, warm sconce lighting, minimalist',
  'dressroom':  'modern Korean walk-in dressing room, wardrobe with warm lighting, mirror, minimalist',
}
TOD = {
  'dawn':      'pre-dawn twilight, soft cool blue-purple tones, gentle first light through windows',
  'morning':   'bright morning sunlight, warm golden natural light streaming in, fresh atmosphere',
  'afternoon': 'clear afternoon daylight, soft neutral tones, calm mood',
  'evening':   'golden hour sunset, warm orange amber glow, cinematic',
  'night':     'nighttime, dark ambient interior lighting, moody, warm accent lights only',
}
COMMON_SUFFIX = ', cinematic 3D render, photorealistic, no people, no visible text, no logos, muted refined color palette, 16:9 aspect ratio, high-end interior photography style'

def all_prompts():
    for room, base in ROOMS.items():
        for tod, mood in TOD.items():
            yield (f'hero-{room}-{tod}', f'{base}, {mood}{COMMON_SUFFIX}')
