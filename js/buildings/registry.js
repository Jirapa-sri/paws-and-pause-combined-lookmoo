/**
 * Building registry — teammates register one module per building.
 * Loaded before game_demo.html main logic.
 */
(function (global) {
  const PawsBuildings = {
    map: Object.create(null),
    shared: {},
    register(mod) {
      if (!mod || !mod.id) throw new Error("Building module needs an id");
      this.map[mod.id] = mod;
      return mod;
    },
    get(id) {
      return this.map[id] || null;
    },
    all() {
      return Object.values(this.map);
    },
    buildInfo() {
      const info = {};
      this.all().forEach((m) => {
        if (m.info) info[m.id] = Object.assign({}, m.info);
      });
      return info;
    },
    drawIcon(id, ctx, api, cx, cy) {
      const m = this.get(id);
      if (m && typeof m.drawIcon === "function") {
        try {
          m.drawIcon(ctx, api, cx, cy);
          return true;
        } catch (err) {
          console.warn("[PawsBuildings] drawIcon failed:", id, err);
          return false;
        }
      }
      return false;
    },
    drawInterior(id, ctx, api, t, cx, cy) {
      const m = this.get(id);
      if (m && typeof m.drawInterior === "function") {
        try {
          m.drawInterior(ctx, api, t, cx, cy);
          return true;
        } catch (err) {
          console.warn("[PawsBuildings] drawInterior failed:", id, err);
          return false;
        }
      }
      return false;
    },
  };
  global.PawsBuildings = PawsBuildings;
})(typeof window !== "undefined" ? window : globalThis);
