"""New/off-state media hero prompts (afternoon only; others copied)."""
COMMON_SUFFIX = ', cinematic 3D render, photorealistic, no people, no visible text, no logos, muted refined color palette, 16:9 aspect ratio, high-end interior photography style'

PROMPTS = {
    # Shield device (puck) — replaces TV-centric shield image
    'hero-media-shield-device': 'close-up product shot of a small black NVIDIA Shield TV streaming device (cylindrical puck form factor) sitting on a modern wooden media console shelf, subtle green LED indicator glowing, soft ambient warm cinematic lighting, blurred TV entertainment setup in the background bokeh',
    'hero-media-shield-device-off': 'close-up product shot of a small black NVIDIA Shield TV streaming device (cylindrical puck form factor) sitting idle on a modern wooden media console shelf, LED off, dim moody twilight lighting, powered down aesthetic, blurred dark entertainment setup in the background',

    # Small room portable TV — replaces bedroom copy for 작은방 이동식 TV
    'hero-media-smallroom-tv': 'small portable movable TV on a rolling stand in a modern Korean small study room / hobby room, cozy plants and books on shelves in background, warm afternoon light, casual lifestyle',
    'hero-media-smallroom-tv-off': 'small portable movable TV on a rolling stand in a modern Korean small study room, screen completely dark and powered off, dim ambient lighting, quiet peaceful mood',

    # OFF variants for existing TVs
    'hero-media-samsung-tv-living-off': 'large wall-mounted Samsung QLED TV with a sleek soundbar underneath in a modern Korean living room, screen completely dark and powered off, dim warm ambient lighting, quiet cozy evening mood',
    'hero-media-google-tv-bedroom-off': 'wall-mounted television in a modern Korean bedroom, screen completely dark and powered off, soft dim indirect ambient lighting, restful sleepy mood',
}

def all_prompts():
    for name, base in PROMPTS.items():
        yield (f'{name}-afternoon', base + COMMON_SUFFIX)

if __name__ == '__main__':
    for n, p in all_prompts():
        print(n)
