# 12 tabs x 5 time-of-day = 60 images
TABS = {
    'summary':    'modern smart home dashboard aerial view, minimalist interior overview',
    'energy':     'electrical energy flow abstract visualization, plug outlets and glowing power lines, minimalist',
    'climate':    'air conditioning ceiling cassette in modern Korean apartment, cool air visualization',
    'lighting':   'modern Korean living room with warm ambient ceiling lights, all lights on, cozy',
    'airquality': 'modern Korean apartment interior with air purifier running, clean transparent air visualization',
    'media':      'modern living room with large OLED TV and soundbar, cinematic setup',
    'security':   'modern Korean apartment entrance with digital door lock and security camera',
    'appliance':  'modern Korean kitchen with refrigerator, washing machine, dishwasher, minimalist',
    'server':     'server rack with network switches and blinking indicator lights, minimalist data center',
    'life':       'modern bus stop in Seoul at intersection, minimalist urban',
    'lotto':      'stack of Korean lottery balls in numbered spheres, minimalist studio',
    'calendar':   'modern calendar interface on desk, minimalist workspace',
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
    for tab, base in TABS.items():
        for tod, mood in TOD.items():
            yield (f'hero-{tab}-{tod}', f'{base}, {mood}{COMMON_SUFFIX}')


if __name__ == '__main__':
    prompts = list(all_prompts())
    print(f'total: {len(prompts)}')
    for name, p in prompts[:3]:
        print(f'\n[{name}]\n{p}')
