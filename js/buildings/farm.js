/**
 * farm building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "farm",
    info: {label:"Sunny Farm",    wall:"#E8F0D8", floor:"#C4A574", accent:"#6B8E4E", activity:"Tend crops",  blurb:"Plant, water, and harvest under the sun." },
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
        acShadow(74, 62);
        // red barn — AC farm building
        acWoodWall(-55, 2, 110, 54, "#C0483E", true);
        acGableRoof(60, -44, 2, "#5A4030", "#6E5C49");
        // loft window
        acWindow(-10, -18, 20, 14, "#F5F0E4");
        // big barn doors
        ctx.fillStyle = "#8C5A3B";
        roundRect(-22, 18, 44, 36, 3); ctx.fill();
        ctx.strokeStyle = "rgba(251,240,222,0.35)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, 52); ctx.stroke();
        // crop plots beside
        if(FarmAtlas.has("crops")){
          FarmAtlas.drawSoil(ctx, -58, 40, 1.8, false);
          FarmAtlas.drawCropTile(ctx, 2, 7, -58, 34, 1.8);
          FarmAtlas.drawSoil(ctx, 36, 42, 1.8, true);
          FarmAtlas.drawCropTile(ctx, 2, 6, 36, 36, 1.8);
        } else {
          ctx.fillStyle = "#6B8E4E";
          for(let i = 0; i < 3; i++){
            ctx.beginPath(); ctx.ellipse(-40 + i * 18, 48, 7, 9, 0, 0, Math.PI*2); ctx.fill();
          }
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
      const performance = api.performance || window.performance;
        ensureFarm();
        // barn backdrop
        if(FarmAtlas.has("barns")){
          FarmAtlas.drawBarn(ctx, HOUSE.x + 55, HOUSE.y + 70, 0, 1.15);
          FarmAtlas.drawBarn(ctx, HOUSE.x + HOUSE.w - 160, HOUSE.y + 75, 2, 1.05);
        }
        // well
        const wellFrame = Math.floor(t / 280) % 4;
        if(FarmAtlas.has("well")){
          FarmAtlas.drawWell(ctx, HOUSE.x + HOUSE.w/2 - 20, HOUSE.y + 95, wellFrame, 2.4);
        }
        // fence strip
        if(FarmAtlas.has("fence")){
          const img = FarmAtlas.images.fence;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, 48, 32, HOUSE.x + 130, HOUSE.y + 175, 96, 48);
          ctx.drawImage(img, 48, 0, 48, 32, HOUSE.x + HOUSE.w - 230, HOUSE.y + 175, 96, 48);
        }
        // 6 plots from farm state
        const plots = state.farm.plots || [];
        for(let r=0;r<2;r++) for(let c=0;c<3;c++){
          const i = r*3 + c;
          const p = plots[i] || { crop:null, stage:0, watered:false };
          const px = HOUSE.x + 150 + c * 170;
          const py = HOUSE.y + 230 + r * 85;
          if(FarmAtlas.has("crops")){
            FarmAtlas.drawSoil(ctx, px, py, 4, !!p.watered);
            if(p.crop && p.stage > 0){
              const crop = CROP_TYPES[p.crop];
              const tile = crop ? cropSpriteTile(crop, p.stage) : null;
              if(tile) FarmAtlas.drawCropTile(ctx, tile[0], tile[1], px + 4, py - 8, 4);
            }
            if(p.watered){
              ctx.fillStyle = "rgba(120,180,220,0.18)";
              roundRect(px, py, 64, 64, 6); ctx.fill();
            }
          } else {
            ctx.fillStyle = "#8B6914";
            roundRect(px, py, 70, 50, 8); ctx.fill();
            ctx.fillStyle = "#6B8E4E";
            ctx.beginPath(); ctx.ellipse(px+35, py+22, 14, 16, 0, 0, Math.PI*2); ctx.fill();
          }
        }
        // animals
        if(FarmAtlas.has("chicken")){
          const bob = Math.sin(t/400)*3;
          FarmAtlas.drawChicken(ctx, HOUSE.x + 95, HOUSE.y + 360 + bob, Math.floor(t/200)%4, 1.8);
          FarmAtlas.drawChicken(ctx, HOUSE.x + HOUSE.w - 140, HOUSE.y + 370 - bob, Math.floor(t/220+2)%4, 1.7);
        }
        if(FarmAtlas.has("cow")){
          const img = FarmAtlas.images.cow;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, 32, 32, HOUSE.x + 220, HOUSE.y + 100, 56, 56);
        }
        // farmer NPC
        drawBuildingPatron(cx + 40, cy - 28, "#D9A066", "#6B8E4E", "#3A2417", Math.sin(t/520)*1.1);
        drawNpcNameTag(cx + 40, cy - 52, "Fern");
        // tool rack hint
        if(FarmAtlas.has("tools")){
          FarmAtlas.drawToolIcon(ctx, "hoe", HOUSE.x + 70, HOUSE.y + 120, 2.2);
          FarmAtlas.drawToolIcon(ctx, "can", HOUSE.x + 110, HOUSE.y + 120, 2.2);
        }
    },
  });
})();
