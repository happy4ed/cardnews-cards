"""Weather condition hero images (afternoon only; others copied)."""
COMMON_SUFFIX = ', cinematic 3D render, photorealistic, wide sky over a Korean cityscape landscape, no people, no visible text, no logos, 16:9 aspect ratio, dramatic atmospheric photography'
PROMPTS = {
    'hero-weather-sunny':          'brilliant clear blue sky with warm golden sunlight over a Korean city, bright cheerful day, few small distant clouds',
    'hero-weather-partlycloudy':   'partly cloudy sky with sun rays breaking through scattered fluffy white clouds over a Korean cityscape, pleasant warm mood',
    'hero-weather-cloudy':         'overcast grey sky with layered dense clouds over a Korean city, soft diffused ambient light, quiet muted mood',
    'hero-weather-rainy':          'heavy rain falling from dark grey stormy clouds over a Korean city, wet reflective streets visible below, moody atmospheric rain',
    'hero-weather-snowy':          'gentle snowfall from soft grey sky over a snow-dusted Korean city, cold peaceful winter scene, soft white ambience',
    'hero-weather-lightning-rainy':'dramatic thunderstorm with vivid lightning bolt striking down through torrential rain over a Korean cityscape, ominous dark clouds',
    'hero-weather-fog':            'thick soft fog blanketing a Korean city skyline, muted silhouettes of buildings barely visible, ethereal misty morning',
}
def all_prompts():
    for name, base in PROMPTS.items():
        yield (f'{name}-afternoon', base + COMMON_SUFFIX)
if __name__ == '__main__':
    for n, p in all_prompts(): print(n)
