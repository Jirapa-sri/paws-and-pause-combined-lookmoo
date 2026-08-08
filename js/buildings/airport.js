/**
 * airport building module
 * Map icon + Willow Airlines terminal (Dodo-style layout, human clerk).
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "airport",
    info: {
      label: "Willow Airlines",
      wall: "#E8EEF4",
      floor: "#F4F7FA",
      accent: "#4AA3D9",
      activity: "Talk to Sky",
      blurb: "Gates, boarding pass smiles, and island hop dreams.",
    },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared;
      S.bind(api);
      const roundRect = api.roundRect;
      ctx.save();
      ctx.translate(cx, cy);
      S.acShadow(78, 58);
      // terminal building
      S.acWoodWall(-58, 4, 116, 48, "#F5F8FC", false);
      S.acBlueMetalRoof(62, -34, 2);
      // control tower
      ctx.fillStyle = "#D9E6F0";
      roundRect(28, -28, 22, 36, 4);
      ctx.fill();
      ctx.fillStyle = "#4AA3D9";
      roundRect(26, -38, 26, 14, 4);
      ctx.fill();
      // airplane badge
      ctx.fillStyle = "#C4895A";
      ctx.beginPath();
      ctx.arc(0, -42, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FBF0DE";
      ctx.beginPath();
      ctx.moveTo(-8, -42);
      ctx.lineTo(10, -42);
      ctx.lineTo(4, -48);
      ctx.lineTo(10, -42);
      ctx.lineTo(4, -36);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#FBF0DE";
      ctx.beginPath();
      ctx.ellipse(0, -42, 9, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      S.acDoor(-12, 20, 24, 30, "#5A7FB0");
      S.acWindow(-42, 12, 18, 16, "#CFE7F2");
      S.acWindow(18, 12, 16, 14, "#CFE7F2");
      // pier lip under terminal
      ctx.fillStyle = "#E8D5A8";
      roundRect(-50, 48, 100, 12, 4);
      ctx.fill();
      ctx.restore();
    },
    drawInterior(ctx, api, t, cx, cy) {
      if (typeof api.drawAirportInterior === "function") {
        api.drawAirportInterior(t, cx, cy);
      }
    },
  });
})();
