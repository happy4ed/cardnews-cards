"""Unique per-card hero image prompts (afternoon TOD only; other TODs copied)."""
COMMON_SUFFIX = ', cinematic 3D render, photorealistic, no people, no visible text, no logos, muted refined color palette, 16:9 aspect ratio, high-end interior photography style'

PROMPTS = {
    # === hero-media (5) ===
    'hero-media-ma-hub': 'abstract audio waves radiating across multiple modern wireless speakers arranged in a Korean apartment, multi-room audio hub concept, glowing sound wave visualization',
    'hero-media-shield-tv-living': 'modern Korean living room with a large OLED TV on an entertainment console, small NVIDIA Shield streaming device visible on the shelf, warm cinematic ambient lighting',
    'hero-media-samsung-tv-living': 'large wall-mounted Samsung QLED TV with a sleek soundbar underneath in a modern Korean living room, subtle backlight glow, cinematic',
    'hero-media-google-tv-bedroom': 'wall-mounted television in a modern Korean bedroom with soft indirect lighting, Google TV interface aesthetic, cozy',
    'hero-media-speaker-nowplaying': 'high-end wireless smart speaker close-up on a wooden shelf, warm LED indicator glowing, ambient music vibe, soft bokeh background',

    # === hero-summary (3) ===
    'hero-summary-family': 'warm cozy modern Korean living room interior scene evoking family togetherness, soft afternoon light, plush sofa, indoor plants, comforting home atmosphere',
    'hero-summary-energy': 'sleek modern electric power meter on a wall with soft green glowing digital display, subtle abstract green energy tech ambience',
    'hero-summary-tier': 'abstract minimalist staircase of glowing tiered bars rising like an energy usage graph, cool blue and green gradient, futuristic clean geometry',

    # === hero-airquality (3) ===
    'hero-airquality-summary': 'soft subtle blue mist floating in a bright minimalist interior, clean fresh air ambience, ethereal calm',
    'hero-airquality-living': 'modern Korean living room with a visible tall cylindrical air purifier running, clean transparent air visualization, sunlit',
    'hero-airquality-bedroom': 'modern Korean bedroom with a compact air purifier beside the bed, soft indirect lighting, restful clean-air ambience',

    # === hero-life (3) ===
    'hero-life-bus': 'Korean city bus stop with digital arrival sign at dawn, empty street, soft pastel morning sky, urban minimalist',
    'hero-life-weather': 'wide sky over a Korean cityscape with dramatic clouds and sun breaking through, atmospheric weather scene, panoramic',
    'hero-life-schedule': 'open paper calendar planner on a wooden desk with pen and coffee mug, soft warm daylight, workspace mood',

    # === hero-calendar (3) ===
    'hero-calendar-week': 'weekly planner spread open on a modern desk with pen and small potted plant, soft daylight, minimalist workspace',
    'hero-calendar-finance': 'ceramic piggy bank beside a financial planner notebook and coins on a wooden surface, warm ambient light, personal finance concept',
    'hero-calendar-sports': 'dark ambient indoor basketball court with a single spotlit basketball on the polished wooden floor, dramatic moody lighting',

    # === hero-energy (2) ===
    'hero-energy-live': 'abstract real-time electrical energy flow visualization, glowing power lines and pulses moving through a modern circuit landscape, dynamic',
    'hero-energy-periods': 'stylized 3D bar graph of monthly energy consumption rising across a clean surface, soft green and blue gradient, data visualization concept',

    # === hero-appliance (2) ===
    'hero-appliance-live': 'modern Korean kitchen scene with subtle glowing power indicators on multiple appliances, abstract real-time power flow overlay, sleek',
    'hero-appliance-monthly': 'clean minimalist infographic style scene of home appliances arranged with soft rising bar graph in background, monthly usage concept',

    # === hero-lotto (2) ===
    'hero-lotto-latest': 'close-up of seven glossy numbered lottery balls in a row on a dark reflective surface, dramatic studio lighting, Korean 6/45 lotto aesthetic',
    'hero-lotto-auto': 'blank lottery ticket concept on a desk with abstract automated marking pattern, soft ambient studio light, minimalist',
}

def all_prompts():
    for name, base in PROMPTS.items():
        yield (f'{name}-afternoon', base + COMMON_SUFFIX)

if __name__ == '__main__':
    for n, p in all_prompts():
        print(n)
