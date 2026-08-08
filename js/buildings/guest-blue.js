/**
 * Theo's Home (guestBlue)
 * Cozy residential house — sea glass, books, shore light (not a shop).
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "guestBlue",
    info: {
      label: "Theo's Home",
      wall: "#DCE6F2",
      floor: "#EAF0F7",
      accent: "#4A7DBF",
      activity: "Visit Theo",
      blurb: "Salt air, sea glass jars, and quiet reading light.",
    },
    drawIcon(ctx, api, cx, cy) {
      if (typeof api.drawGuestBlueIcon === "function") {
        api.drawGuestBlueIcon(cx, cy);
        return;
      }
      const S = B.shared;
      S.bind(api);
      S.drawCottage(cx, cy, 0.9, "#4A7DBF", "#E8F0F8");
    },
    drawInterior(ctx, api, t, cx, cy) {
      if (typeof api.drawGuestCottageInterior === "function") {
        api.drawGuestCottageInterior(t, cx, cy, "guestBlue");
      }
    },
  });
})();
