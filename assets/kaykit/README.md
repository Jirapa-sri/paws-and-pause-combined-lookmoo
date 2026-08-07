# KayKit assets (free)

Rendered 2D sprites from:
- [KayKit Furniture Bits 1.0 FREE](https://kaylousberg.itch.io/kaykit-furniture-bits)
- [KayKit Forest Nature Pack 1.0 FREE](https://kaylousberg.itch.io/kaykit-forest-nature-pack)

## Layout

- `sprites/furniture/` — home furniture PNGs used in-game
- `sprites/nature/` — trees, bushes, rocks, grass used on the island
- `furniture/` / `nature/` — source GLTF (optional; for re-rendering)
- `manifest.json` — sprite map

## Re-render sprites

From repo root (needs Google Chrome):

```bash
npm install --no-save puppeteer-core three@0.160.0
node scripts/render_kaykit.mjs
```
