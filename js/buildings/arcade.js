/**
 * arcade building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "arcade",
    info: {label:"Pixel Arcade",    wall:"#B8A8C8", floor:"#3A2C4A", accent:"#7B5EA7", activity:"Play games",   blurb:"Neon cabinets and coin chimes." },
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
        acWoodWall(-52, 0, 104, 54, "#D4C4E8", false);
        acBlueMetalRoof(56, -34, 2);
        ctx.fillStyle = "#4A2C6E";
        roundRect(-48, -28, 96, 16, 4); ctx.fill();
        ["#E8A33D","#D9705C","#6FA79B"].forEach((c,i) => {
          ctx.fillStyle = c;
          ctx.beginPath(); ctx.arc(-28 + i * 28, -20, 5, 0, Math.PI*2); ctx.fill();
        });
        acDoor(-12, 22, 24, 30, "#2A1840", "#E8A33D");
        acWindow(-42, 8, 18, 16);
        acWindow(24, 8, 18, 16);
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

      const cabs = [
        { x:80, c:"#D9705C" }, { x:200, c:"#5A7FB0" }, { x:560, c:"#D98F2B" }, { x:680, c:"#8A6BAE" }
      ];
      cabs.forEach((cab,i) => {
        const blink = 0.4 + Math.sin(t/250 + i)*0.35;
        ctx.fillStyle = cab.c;
        roundRect(HOUSE.x + cab.x, HOUSE.y + 280, 55, 85, 6); ctx.fill();
        ctx.fillStyle = `rgba(180,240,255,${blink})`;
        roundRect(HOUSE.x + cab.x + 8, HOUSE.y + 290, 39, 32, 4); ctx.fill();
        ctx.fillStyle = "#2A2118";
        roundRect(HOUSE.x + cab.x + 14, HOUSE.y + 330, 28, 8, 2); ctx.fill();
      });
      // snack + change machines
      ctx.fillStyle = "#A9784F";
      roundRect(HOUSE.x + 50, HOUSE.y + 100, 60, 70, 6); ctx.fill();
      roundRect(HOUSE.x + HOUSE.w - 110, HOUSE.y + 100, 60, 70, 6); ctx.fill();
      ctx.fillStyle = `rgba(255,200,80,${0.4+Math.sin(t/200)*0.3})`;
      ctx.fillRect(HOUSE.x + 60, HOUSE.y + 110, 40, 20);
      ctx.fillRect(HOUSE.x + HOUSE.w - 100, HOUSE.y + 110, 40, 20);
      // arcade owner behind counter
      drawBuildingPatron(cx - 30, cy - 28, "#8C5A34", "#4A2C6E", "#111111", Math.sin(t/500)*1);
      drawNpcNameTag(cx - 30, cy - 52, "Pixel");
      // players
      drawBuildingPatron(HOUSE.x + 110, HOUSE.y + 370, "#F7D9B6", "#7B5EA7", "#111111", Math.sin(t/350)*2);
      drawNpcNameTag(HOUSE.x + 110, HOUSE.y + 346, "Pip");
      drawBuildingPatron(HOUSE.x + 230, HOUSE.y + 365, "#D9A066", "#D9705C", "#6B4423", Math.sin(t/380)*2);
      drawNpcNameTag(HOUSE.x + 230, HOUSE.y + 341, "Theo");
      drawBuildingPatron(HOUSE.x + 600, HOUSE.y + 370, "#F0C08A", "#D98F2B", "#3A2417", Math.sin(t/410)*1.8);
      drawNpcNameTag(HOUSE.x + 600, HOUSE.y + 346, "Sam");
    },
  });
})();
