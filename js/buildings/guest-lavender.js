/**
 * guestLavender building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "guestLavender",
    info: { label:"Lavender Cottage", wall:"#D8C8E0", floor:"#EDE4F0", accent:"#8A6BAE", activity:"Visit Mara", blurb:"Lavender sachets and soft quilts." },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      S.drawCottage(cx, cy, 0.88, "#8A6BAE", "#EDE4F2");
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

      api.drawGuestCottageInterior(t, cx, cy, "guestLavender");
    },
  });
})();
