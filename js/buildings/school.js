/**
 * school building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "school",
    info: {label:"Willow School",   wall:"#D5C9B0", floor:"#E8DCC4", accent:"#5A7FB0", activity:"Study desk",   blurb:"Quiet desks, chalk dust, and soft focus." },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      const roundRect = api.roundRect;
      const FarmAtlas = api.FarmAtlas;
      // Local aliases used by extracted AC icon code
      const acShadow = S.acShadow, acWoodWall = S.acWoodWall, acBrickWall = S.acBrickWall,
        acStoneWall = S.acStoneWall, acGableRoof = S.acGableRoof, acBlueMetalRoof = S.acBlueMetalRoof,
        acDoor = S.acDoor, acWindow = S.acWindow, acRoofSign = S.acRoofSign,
        acAwning = S.acAwning, acRopeFence = S.acRopeFence;
        // Resident Services–inspired town hall / school
        ctx.save();
        ctx.translate(cx, cy);
        acShadow(76, 64);
        acBrickWall(-58, 0, 116, 56, "#E0A878");
        acGableRoof(64, -42, 0, "#6B4A8C", "#8A6BAE");
        // clock tower
        ctx.fillStyle = "#E0A878";
        roundRect(-14, -58, 28, 28, 4); ctx.fill();
        ctx.fillStyle = "#6B4A8C";
        ctx.beginPath();
        ctx.moveTo(-18, -56); ctx.lineTo(0, -74); ctx.lineTo(18, -56); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#FBF0DE";
        ctx.beginPath(); ctx.arc(0, -44, 8, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#3A2C22"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(0, -44); ctx.lineTo(0, -50); ctx.moveTo(0, -44); ctx.lineTo(5, -42); ctx.stroke();
        // columned entrance
        ctx.fillStyle = "#F5F0E4";
        ctx.fillRect(-28, 18, 8, 36);
        ctx.fillRect(20, 18, 8, 36);
        acDoor(-12, 22, 24, 32, "#5A4030");
        acWindow(-48, 12, 14, 18);
        acWindow(34, 12, 14, 18);
        // flag
        ctx.strokeStyle = "#8C5A3B"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(50, -10); ctx.lineTo(50, 40); ctx.stroke();
        ctx.fillStyle = "#6B8E4E";
        ctx.beginPath(); ctx.moveTo(50, -8); ctx.lineTo(68, -2); ctx.lineTo(50, 4); ctx.closePath(); ctx.fill();
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

      // chalkboard
      ctx.fillStyle = "#3A5A48";
      roundRect(HOUSE.x + 210, HOUSE.y + 95, 400, 90, 8); ctx.fill();
      ctx.fillStyle = "#FBF0DE";
      ctx.font = "600 14px ui-rounded, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Focus · Kindness · Curiosity", cx, HOUSE.y + 148);
      // bookshelves
      drawBuildingShelf(HOUSE.x + 50, HOUSE.y + 95, 80, 90, ["#5A7FB0","#D9705C","#D98F2B","#6B8E6B"]);
      drawBuildingShelf(HOUSE.x + HOUSE.w - 130, HOUSE.y + 95, 80, 90, ["#8A6BAE","#3E7C74","#E3998A","#D98F2B"]);
      // student desks
      [[70,300],[230,300],[510,300],[670,300]].forEach(([x,y]) => {
        drawBuildingTable(HOUSE.x+x, HOUSE.y+y, 80, 42);
        drawBuildingChair(HOUSE.x+x+20, HOUSE.y+y+40);
      });
      drawBuildingPlant(HOUSE.x + 170, HOUSE.y + 210);
      drawBuildingPlant(HOUSE.x + HOUSE.w - 170, HOUSE.y + 210);
      // teacher
      drawBuildingPatron(cx - 20, cy - 28, "#D9A066", "#5A7FB0", "#3A2417", Math.sin(t/520)*1);
      drawNpcNameTag(cx - 20, cy - 52, "Ms. Wren");
      // students
      drawBuildingPatron(HOUSE.x + 110, HOUSE.y + 360, "#F0C08A", "#CFE1D2", "#6B4423", Math.sin(t/480)*1.2);
      drawNpcNameTag(HOUSE.x + 110, HOUSE.y + 336, "Pip");
      drawBuildingPatron(HOUSE.x + 560, HOUSE.y + 355, "#F7D9B6", "#8A6BAE", "#B5651D", Math.sin(t/450)*1.3);
      drawNpcNameTag(HOUSE.x + 560, HOUSE.y + 331, "Mara");
    },
  });
})();
