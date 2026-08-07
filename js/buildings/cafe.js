/**
 * cafe building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "cafe",
    info: {label:"Willow Café",     wall:"#D4B896", floor:"#E8D4B0", accent:"#C4785A", activity:"Cook orders",  blurb:"Espresso steam and pastry trays." },
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
        acShadow(68, 60);
        acWoodWall(-54, 0, 108, 54, "#F1E3C6", true);
        acGableRoof(58, -46, 0, "#D9705C", "#E3998A");
        // striped awning
        for(let i = 0; i < 7; i++){
          ctx.fillStyle = i % 2 ? "#D9705C" : "#FBF0DE";
          roundRect(-48 + i * 14, -8, 14, 12, 2); ctx.fill();
        }
        acDoor(-11, 22, 22, 30, "#8C5A3B");
        acWindow(-40, 8, 18, 16);
        acWindow(22, 8, 18, 16);
        // steam kettle tip
        ctx.fillStyle = "#8C5A3B";
        ctx.beginPath(); ctx.moveTo(-6, -40); ctx.lineTo(6, -40); ctx.lineTo(4, -28); ctx.lineTo(-4, -28); ctx.closePath(); ctx.fill();
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

      drawBuildingShelf(HOUSE.x + 50, HOUSE.y + 95, 60, 80, ["#D9705C","#D98F2B","#6B8E6B","#5A7FB0"]);
      drawBuildingShelf(HOUSE.x + HOUSE.w - 110, HOUSE.y + 95, 60, 80, ["#E3998A","#3E7C74","#D98F2B","#8A6BAE"]);
      [[70,300],[175,300],[605,300],[710,300]].forEach(([x,y]) => {
        drawBuildingTable(HOUSE.x+x, HOUSE.y+y, 60, 45);
        drawBuildingChair(HOUSE.x+x-8, HOUSE.y+y+38);
        drawBuildingChair(HOUSE.x+x+38, HOUSE.y+y+38);
      });
      drawBuildingPlant(HOUSE.x + 140, HOUSE.y + 200);
      drawBuildingPlant(HOUSE.x + HOUSE.w - 140, HOUSE.y + 200);
      // steam
      for(let i=0;i<3;i++){
        const sy = cy - 40 - ((t/40 + i*18) % 40);
        ctx.fillStyle = `rgba(255,255,255,${0.25 - i*0.05})`;
        ctx.beginPath(); ctx.ellipse(cx - 40 + i*20, sy, 5, 8, 0, 0, Math.PI*2); ctx.fill();
      }
      drawBuildingPatron(HOUSE.x + 95, HOUSE.y + 360, "#F0C08A", "#8A6BAE", "#3A2417", Math.sin(t/500)*1.5);
      drawNpcNameTag(HOUSE.x + 95, HOUSE.y + 336, "Theo");
      drawBuildingPatron(HOUSE.x + 640, HOUSE.y + 355, "#D9A066", "#5A7FB0", "#6B4423", Math.sin(t/450+1)*1.5);
      drawNpcNameTag(HOUSE.x + 640, HOUSE.y + 331, "Pip");
      drawBuildingPatron(HOUSE.x + 400, HOUSE.y + 380, "#F7D9B6", "#D98F2B", "#B5651D", Math.sin(t/470)*1.3);
      drawNpcNameTag(HOUSE.x + 400, HOUSE.y + 356, "Sam");
      // barista behind counter
      drawBuildingPatron(cx + 40, cy - 28, "#B87A4B", "#C4785A", "#111111", Math.sin(t/600)*1);
      drawNpcNameTag(cx + 40, cy - 52, "Mara");
    },
  });
})();
