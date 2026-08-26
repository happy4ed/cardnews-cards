# Base descriptors (kept for backwards-compat with any callers).
APPLIANCES = {
    'appliance-washer-samsung-bespoke-combo':
        'Samsung Bespoke AI combo washer and dryer unit in a modern Korean laundry utility room, glossy panels, integrated cabinetry, muted white and beige tones, soft ambient light',
    'appliance-fridge-samsung-bespoke':
        'Samsung Bespoke 4-door refrigerator in a modern Korean kitchen, glossy pastel colored panels, minimalist cabinetry, ambient warm lighting, close hero shot',
    'appliance-oven-samsung-bespoke':
        'Samsung Bespoke oven and microwave combo built into modern Korean kitchen cabinetry, warm cinematic light, sleek dark glass front, minimalist styling',
    'appliance-humidifier-deerma-jsq2g':
        'Deerma JSQ2G humidifier on a wooden bedside table in a cozy Korean bedroom, gentle mist rising, ambient warm lamp light, soft bedding blurred in background',
}

# State-based variants (v0.13). Each key becomes hero-{key}-{tod}.png.
APPLIANCE_STATES = {
    'appliance-washer-samsung-bespoke-combo-running':
        'Samsung Bespoke AI combo washer and dryer mid-cycle in a modern Korean laundry utility room, drum spinning visible through the round glass door, water and suds splashing inside, control panel LEDs glowing softly, glossy white panel finish, integrated cabinetry, muted refined color palette, soft ambient light',
    'appliance-washer-samsung-bespoke-combo-idle':
        'Samsung Bespoke AI combo washer and dryer turned off in a modern Korean laundry utility room, glass door closed, dry empty drum, dark LED panel in standby, quiet still atmosphere, glossy white panel finish, integrated cabinetry, muted refined color palette',
    'appliance-fridge-samsung-bespoke-open':
        'Samsung Bespoke 4-door refrigerator with all four doors open in a modern Korean kitchen, revealing organized interior shelves neatly stocked with fresh produce, glass jars, bottles, and containers, interior LED lighting casting a soft cool glow, glossy pastel colored exterior panels, minimalist cabinetry, close hero shot',
    'appliance-fridge-samsung-bespoke-closed':
        'Samsung Bespoke 4-door refrigerator with all doors fully closed in a modern Korean kitchen, glossy pastel colored panels reflecting ambient warm light, minimalist cabinetry, clean uncluttered look, close hero shot',
    'appliance-oven-samsung-bespoke-cooking':
        'Samsung Bespoke oven and microwave combo built into modern Korean kitchen cabinetry, oven door closed with warm amber interior glow visible through the dark glass, food such as a roasting dish baking inside, small timer LED illuminated on the control panel, sleek dark glass front, minimalist styling, warm cinematic light',
    'appliance-oven-samsung-bespoke-idle':
        'Samsung Bespoke oven and microwave combo built into modern Korean kitchen cabinetry, oven turned off with empty dark interior, no interior light, sleek dark glass front, dormant control panel, minimalist styling, soft cool ambient light',
    'appliance-humidifier-deerma-jsq2g-misting':
        'Deerma JSQ2G humidifier on a wooden bedside table in a cozy Korean bedroom, emitting a visible soft mist plume rising upward, ambient warm bedside lamp light catching the vapor, indicator light glowing gently, soft bedding blurred in background',
    'appliance-humidifier-deerma-jsq2g-idle':
        'Deerma JSQ2G humidifier switched off on a wooden bedside table in a cozy Korean bedroom, no mist, dry nozzle, indicator light off, calm still ambient warm lamp light, soft bedding blurred in background',
}

TOD = {
    'afternoon': 'clear afternoon daylight, soft neutral tones, calm mood',
}
COMMON_SUFFIX = ', cinematic 3D render, photorealistic, no people, no visible text, no logos, muted refined color palette, 16:9 aspect ratio, high-end interior photography style'


def all_prompts():
    # Legacy base variants (kept — existing PNGs already present so idempotent skip).
    for name, base in APPLIANCES.items():
        for tod, mood in TOD.items():
            yield (f'hero-{name}-{tod}', f'{base}, {mood}{COMMON_SUFFIX}')
    # State-based variants (v0.13).
    for name, base in APPLIANCE_STATES.items():
        for tod, mood in TOD.items():
            yield (f'hero-{name}-{tod}', f'{base}, {mood}{COMMON_SUFFIX}')
