/**
 * cinema building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "cinema",
    info: {label:"Island Cinema", wall:"#4A3428", floor:"#6E1824", accent:"#E8C57A", activity:"Buy tickets", blurb:"Cozy home theater — wood walls, red carpet, soft seats." },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      const roundRect = api.roundRect;
      const FarmAtlas = api.FarmAtlas;
      // Local aliases used by extracted AC icon code
      const acShadow = S.acShadow, acWoodWall = S.acWoodWall, acBrickWall = S.acBrickWall,
        acStoneWall = S.acStoneWall, acGableRoof = S.acGableRoof, acBlueMetalRoof = S.acBlueMetalRoof,
        acDoor = S.acDoor, acWindow = S.acWindow, acRoofSign = S.acRoofSign,
        acAwning = S.acAwning, acRopeFence = S.acRopeFence;
        // Museum–inspired stone hall
        ctx.save();
        ctx.translate(cx, cy);
        acShadow(78, 64);
        acStoneWall(-62, 0, 124, 58, "#D8C4A0");
        // teal paneled roof
        ctx.fillStyle = "#5BB5A8";
        ctx.beginPath();
        ctx.moveTo(-70, 2); ctx.lineTo(-58, -36); ctx.lineTo(58, -36); ctx.lineTo(70, 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#4A9A90";
        for(let i = 0; i < 6; i++) ctx.fillRect(-52 + i * 18, -34, 14, 32);
        // pediment emblem
        ctx.fillStyle = "#C4895A";
        ctx.beginPath(); ctx.arc(0, -18, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#FBF0DE";
        ctx.font = "700 9px ui-rounded, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("✦", 0, -14);
        // pillars + recessed door
        ctx.fillStyle = "#E8DCC4";
        roundRect(-40, 10, 14, 46, 3); ctx.fill();
        roundRect(26, 10, 14, 46, 3); ctx.fill();
        ctx.fillStyle = "#3A2C22";
        roundRect(-18, 18, 36, 38, 4); ctx.fill();
        ctx.fillStyle = "#C0483E";
        ctx.fillRect(-14, 48, 28, 6);
        // lanterns
        ctx.fillStyle = "#3E6B4A";
        roundRect(-48, 16, 8, 10, 2); ctx.fill();
        roundRect(40, 16, 8, 10, 2); ctx.fill();
        ctx.restore();
    },

    drawInterior(ctx, api, t, cx, cy) {
      const roundRect = api.roundRect;
      const HOUSE = api.HOUSE;
      const FarmAtlas = api.FarmAtlas;
      const state = api.state;
      const CROP_TYPES = api.CROP_TYPES;
      const ensureFarm = api.ensureFarm;
      const cropSpriteTile = api.cropSpriteTile;
      const drawBuildingPatron = api.drawBuildingPatron;
      const drawNpcNameTag = api.drawNpcNameTag;
      const drawStoreGoodsShelf = api.drawStoreGoodsShelf;
      const drawStoreDisplayTable = api.drawStoreDisplayTable;
      const drawBuildingShelf = api.drawBuildingShelf;
      const drawBuildingPlant = api.drawBuildingPlant;
      const drawBuildingTable = api.drawBuildingTable;
      const drawBuildingChair = api.drawBuildingChair;
      const drawGuestCottageInterior = api.drawGuestCottageInterior;

      // Ticket seller Nora near concessions
      drawBuildingPatron(cx - 260, cy + 40, "#F0C08A", "#C0483E", "#3A2417", Math.sin(t/520)*1.2);
      drawNpcNameTag(cx - 260, cy + 16, "Nora · Tickets");
      // Soft neon ticket glow
      ctx.fillStyle = "rgba(232,197,122,0.85)";
      roundRect(cx - 320, cy - 20, 100, 22, 6); ctx.fill();
      ctx.fillStyle = "#3A2A1E";
      ctx.font = "700 11px ui-rounded, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TICKETS", cx - 270, cy - 5);
    },
  });
})();
