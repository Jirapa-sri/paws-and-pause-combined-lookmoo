/**
 * stadium building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "stadium",
    info: {label:"Go-Kart Stadium", wall:"#D4A8A0", floor:"#C9B48A", accent:"#C0483E", activity:"Start a race", blurb:"Checkered flags and engine hum." },
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
        acShadow(88, 66);
        // chunky AC sports hall
        acBrickWall(-70, 4, 140, 50, "#E8A090");
        acGableRoof(74, -36, 4, "#C0483E", "#D9705C");
        // field oval on facade
        ctx.fillStyle = "#DCE9B8";
        ctx.beginPath(); ctx.ellipse(0, 28, 36, 16, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 28, 36, 16, 0, 0, Math.PI*2); ctx.stroke();
        acDoor(-12, 28, 24, 24, "#5A4030");
        // checkered pennants
        for(let i = 0; i < 6; i++){
          ctx.fillStyle = i % 2 ? "#fff" : "#C0483E";
          ctx.beginPath();
          ctx.moveTo(-48 + i * 16, -20);
          ctx.lineTo(-40 + i * 16, -20);
          ctx.lineTo(-44 + i * 16, -8);
          ctx.closePath(); ctx.fill();
        }
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

      // bleachers
      ctx.fillStyle = "#C0483E";
      for(let i=0;i<4;i++){
        roundRect(HOUSE.x + 70, HOUSE.y + 95 + i*16, 120, 12, 3); ctx.fill();
        roundRect(HOUSE.x + HOUSE.w - 190, HOUSE.y + 95 + i*16, 120, 12, 3); ctx.fill();
      }
      // karts
      ctx.fillStyle = "#4A4A4A";
      roundRect(HOUSE.x + 70, HOUSE.y + 310, 110, 50, 10); ctx.fill();
      roundRect(HOUSE.x + HOUSE.w - 180, HOUSE.y + 310, 110, 50, 10); ctx.fill();
      ctx.fillStyle = "#D9705C";
      roundRect(HOUSE.x + 85, HOUSE.y + 300, 50, 28, 6); ctx.fill();
      ctx.fillStyle = "#5A7FB0";
      roundRect(HOUSE.x + HOUSE.w - 155, HOUSE.y + 300, 50, 28, 6); ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(HOUSE.x + 95, HOUSE.y + 355, 8, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(HOUSE.x + 155, HOUSE.y + 355, 8, 0, Math.PI*2); ctx.fill();
      // checkered flags
      for(let i=0;i<4;i++) for(let j=0;j<3;j++){
        ctx.fillStyle = (i+j)%2 ? "#fff" : "#111";
        ctx.fillRect(HOUSE.x + 55 + i*8, HOUSE.y + 100 + j*8, 8, 8);
        ctx.fillRect(HOUSE.x + HOUSE.w - 95 + i*8, HOUSE.y + 100 + j*8, 8, 8);
      }
      // race clerk behind counter
      drawBuildingPatron(cx - 25, cy - 28, "#B87A4B", "#C0483E", "#111111", Math.sin(t/500)*1.1);
      drawNpcNameTag(cx - 25, cy - 52, "Rex");
      // racers / fans
      drawBuildingPatron(HOUSE.x + 130, HOUSE.y + 200, "#F0C08A", "#4A4A4A", "#3A2417", Math.sin(t/400)*1.5);
      drawNpcNameTag(HOUSE.x + 130, HOUSE.y + 176, "Pip");
      drawBuildingPatron(HOUSE.x + HOUSE.w - 130, HOUSE.y + 210, "#D9A066", "#5A7FB0", "#6B4423", Math.sin(t/430)*1.5);
      drawNpcNameTag(HOUSE.x + HOUSE.w - 130, HOUSE.y + 186, "Sam");
      drawBuildingPatron(HOUSE.x + 380, HOUSE.y + 380, "#F7D9B6", "#D9705C", "#B5651D", Math.sin(t/460)*1.3);
      drawNpcNameTag(HOUSE.x + 380, HOUSE.y + 356, "Theo");
    },
  });
})();
