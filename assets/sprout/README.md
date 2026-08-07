# Sprout Lands — FREE Basic pack only

Paws & Pause uses **only** the free [Sprout Lands Basic pack](https://cupnooble.itch.io/sprout-lands-asset-pack) by **Cup Nooble**.

Do **not** add the Premium pack here. `SPRITE_PACK.pack` is locked to `"basic"`.

## License (Free Basic)

From Cup Nooble’s `read_me_art.txt`:

- OK to modify and use in **non-commercial** projects
- **No** redistribution / resale of the pack (even modified)
- **No** commercial use (buy Premium or contact Cup Nooble for that)
- Please credit Cup Nooble / Sprout Lands

## What’s included here

```
assets/sprout/
  read_me_art.txt
  Tilesets/   Grass, Water, Hills, Wooden House, Fences, Tilled Dirt
  Objects/    Basic Grass Biom, Plants, Paths, Furniture, Chicken House, …
```

These match the free Basic pack layout. Premium-only sheets are not used.

## Enable / disable

In `game_demo.html`:

```js
const SPRITE_PACK = {
  enabled: true,   // set false to use procedural fallback art only
  pack: "basic",   // must stay "basic"
  base: "assets/sprout/",
  tile: 16,
  …
};
```

## Credit

Sprites © Cup Nooble — [Sprout Lands Asset Pack](https://cupnooble.itch.io/sprout-lands-asset-pack) (Basic / free).
