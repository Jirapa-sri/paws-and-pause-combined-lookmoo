/**
 * shelter building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "shelter",
    info: {label:"Puppy Shelter",   wall:"#D4C0D0", floor:"#E5D8C8", accent:"#8A5A8C", activity:"Visit puppies",blurb:"Soft beds and hopeful eyes." },
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
        acWoodWall(-52, 0, 104, 54, "#F1E3EC", true);
        acGableRoof(56, -46, 0, "#8A5A8C", "#A878B0");
        acDoor(-12, 22, 24, 30, "#6E5C49");
        acWindow(-40, 8, 16, 16);
        acWindow(24, 8, 16, 16);
        // heart
        ctx.fillStyle = "#D9705C";
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.bezierCurveTo(-10, -40, -18, -28, 0, -16);
        ctx.bezierCurveTo(18, -28, 10, -40, 0, -28);
        ctx.fill();
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

      drawBuildingShelf(HOUSE.x + 50, HOUSE.y + 100, 70, 80, ["#E3998A","#CFE1D2","#D98F2B","#D9A5C0"]);
      [[80,310],[230,310],[520,310],[670,310]].forEach(([x,y], i) => {
        ctx.fillStyle = ["#E3998A","#6FA79B","#F1EDE4","#D9705C"][i];
        roundRect(HOUSE.x+x, HOUSE.y+y, 85, 50, 18); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        roundRect(HOUSE.x+x+12, HOUSE.y+y+12, 60, 28, 12); ctx.fill();
        // sleepy puppy
        const bob = Math.sin(t/600 + i)*2;
        ctx.fillStyle = ["#C9A574","#E8C49A","#A9784F","#D9B08C"][i];
        ctx.beginPath(); ctx.ellipse(HOUSE.x+x+42, HOUSE.y+y+28+bob, 16, 10, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(HOUSE.x+x+28, HOUSE.y+y+22+bob, 7, 0, Math.PI*2); ctx.fill();
      });
      drawBuildingPlant(HOUSE.x + 400, HOUSE.y + 200);
      // shelter volunteer behind counter
      drawBuildingPatron(cx + 40, cy - 28, "#F0C08A", "#8A5A8C", "#6B4423", Math.sin(t/520)*1);
      drawNpcNameTag(cx + 40, cy - 52, "Nova");
      // visitors
      drawBuildingPatron(HOUSE.x + 380, HOUSE.y + 390, "#D9A066", "#CFE1D2", "#3A2417", Math.sin(t/470)*1.2);
      drawNpcNameTag(HOUSE.x + 380, HOUSE.y + 366, "Mara");
      drawBuildingPatron(HOUSE.x + 160, HOUSE.y + 250, "#F7D9B6", "#E3998A", "#B5651D", Math.sin(t/490)*1.3);
      drawNpcNameTag(HOUSE.x + 160, HOUSE.y + 226, "Pip");
      drawBuildingPatron(HOUSE.x + HOUSE.w - 160, HOUSE.y + 260, "#B87A4B", "#5A7FB0", "#111111", Math.sin(t/440)*1.2);
      drawNpcNameTag(HOUSE.x + HOUSE.w - 160, HOUSE.y + 236, "Theo");
    },
  });
})();
