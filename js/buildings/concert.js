/**
 * concert building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "concert",
    info: {label:"Concert Festival",wall:"#1A0F28", floor:"#120818", accent:"#E8A33D", activity:"Cheer Lisa", blurb:"Front-row view — Lisa performs on stage." },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      const roundRect = api.roundRect;
      const FarmAtlas = api.FarmAtlas;
      // Local aliases used by extracted AC icon code
      const acShadow = S.acShadow, acWoodWall = S.acWoodWall, acBrickWall = S.acBrickWall,
        acStoneWall = S.acStoneWall, acGableRoof = S.acGableRoof, acBlueMetalRoof = S.acBlueMetalRoof,
        acDoor = S.acDoor, acWindow = S.acWindow, acRoofSign = S.acRoofSign,
        acAwning = S.acAwning, acRopeFence = S.acRopeFence;
        ctx.save();
        ctx.translate(cx, cy);
        acShadow(80, 62);
        acWoodWall(-60, 4, 120, 50, "#F0D0E0", false);
        acGableRoof(66, -40, 4, "#C45A8C", "#E080B0");
        acAwning(-36, -8, 72, 14, "#E8A33D");
        ctx.fillStyle = "#FBF0DE";
        ctx.font = "700 9px ui-rounded, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("LIVE", 0, 0);
        acDoor(-12, 22, 24, 30, "#5A4030");
        acWindow(-46, 12, 16, 16);
        acWindow(30, 12, 16, 16);
        // spotlights as cute lamps
        ctx.fillStyle = "rgba(255,220,120,0.45)";
        ctx.beginPath(); ctx.moveTo(-30, -36); ctx.lineTo(-18, 8); ctx.lineTo(-42, 8); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(30, -36); ctx.lineTo(18, 8); ctx.lineTo(42, 8); ctx.closePath(); ctx.fill();
        ctx.restore();
    },
    drawInterior(ctx, api, t, cx, cy) {
      if(typeof api.drawConcertInterior === "function"){
        api.drawConcertInterior(t, cx, cy);
      }
    },
  });
})();
