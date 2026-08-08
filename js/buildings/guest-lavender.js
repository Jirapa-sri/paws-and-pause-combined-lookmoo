/**
 * Mara's Home (guestLavender)
 * Cozy residential house — tea, lavender, quilts (not a shop).
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "guestLavender",
    info: {
      label: "Mara's Home",
      wall: "#E8DCEC",
      floor: "#F4ECF6",
      accent: "#8A6BAE",
      activity: "Visit Mara",
      blurb: "Tea steam, lavender sachets, and a second cup waiting.",
    },
    drawIcon(ctx, api, cx, cy) {
      // Prefer the game's neighbor-home silhouette when available
      if (typeof api.drawGuestLavenderIcon === "function") {
        api.drawGuestLavenderIcon(cx, cy);
        return;
      }
      const S = B.shared;
      S.bind(api);
      S.drawCottage(cx, cy, 0.92, "#8A6BAE", "#F3EAF6");
    },
    drawInterior(ctx, api, t, cx, cy) {
      if (typeof api.drawGuestCottageInterior === "function") {
        api.drawGuestCottageInterior(t, cx, cy, "guestLavender");
      }
    },
  });
})();
