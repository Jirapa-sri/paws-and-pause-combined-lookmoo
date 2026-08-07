/**
 * home building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "home",
    info: { label:"Home", wall:"#E8D4B0", floor:"#E8D9C0", accent:"#B5654A", activity:"Rest", blurb:"Your cozy room." },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      S.drawCottage(cx, cy, 1, "#C45A4A", "#F3E2C4");
    },

  });
})();
