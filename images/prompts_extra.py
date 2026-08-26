EXTRA = {
  'vacuum': 'Dreame robot vacuum on a wooden floor in a modern Korean living room, minimalist design, ambient lighting, no people',
  'summary-lighting': 'artful arrangement of warm smart bulbs glowing softly, minimalist studio product photography style',
  'summary-airquality': 'transparent flowing air visualization with light particles in a modern Korean home, subtle cool blue tones',
  'summary-doorlock': 'modern digital door lock on wooden door of Korean apartment entrance, close-up hero shot, warm accent lighting',
}
TOD = {
  'dawn':'pre-dawn twilight, soft cool blue-purple tones, gentle first light through windows',
  'morning':'bright morning sunlight, warm golden natural light streaming in, fresh atmosphere',
  'afternoon':'clear afternoon daylight, soft neutral tones, calm mood',
  'evening':'golden hour sunset, warm orange amber glow, cinematic',
  'night':'nighttime, dark ambient interior lighting, moody, warm accent lights only',
}
COMMON_SUFFIX = ', cinematic 3D render, photorealistic, no people, no visible text, no logos, muted refined color palette, 16:9 aspect ratio, high-end interior photography style'

def all_prompts():
    for name, base in EXTRA.items():
        for tod, mood in TOD.items():
            yield (f'hero-{name}-{tod}', f'{base}, {mood}{COMMON_SUFFIX}')
