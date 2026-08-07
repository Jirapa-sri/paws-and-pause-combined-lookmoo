/**
 * lake building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "lake",
    info: { label:"Lakeside Pier", wall:"#A8C4B8", floor:"#C9B48A", accent:"#3E7C74", activity:"Pier desk", blurb:"Boards creak over quiet water." },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      const roundRect = api.roundRect;
      api.ctx.save();
      api.ctx.translate(cx, cy);
      S.acShadow(70, 58);
      S.acWoodWall(-50, 8, 100, 40, "#C9B48A", true);
      api.ctx.fillStyle = "#3E7C74";
      roundRect(-40, -8, 80, 24, 8); api.ctx.fill();
      api.ctx.fillStyle = "rgba(255,255,255,0.35)";
      api.ctx.beginPath(); api.ctx.ellipse(0, 2, 28, 6, 0, 0, Math.PI*2); api.ctx.fill();
      api.ctx.restore();
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

      // Gentle water and distant wind chimes
      noiseBurst(0.8,0.012);
      beep(440,0.8,"sine",0.012,0.25);
      beep(659.25,0.7,"sine",0.01,1.15);
      beep(587.33,0.7,"sine",0.01,2.1);
    },
  });
})();
