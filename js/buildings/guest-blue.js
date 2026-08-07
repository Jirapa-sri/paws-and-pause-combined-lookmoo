/**
 * guestBlue building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "guestBlue",
    info: { label:"Blue Cottage", wall:"#C8D8EC", floor:"#E4ECF5", accent:"#4A7DBF", activity:"Visit Theo", blurb:"Sea glass jars and quiet reading." },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      S.drawCottage(cx, cy, 0.82, "#4A7DBF", "#E4ECF5");
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

      api.drawGuestCottageInterior(t, cx, cy, "guestBlue");
    },
  });
})();
