/**
 * store building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "store",
    info: {label:"Willow Goods",    wall:"#D9C199", floor:"#EDE0C8", accent:"#C07840", activity:"Browse shop",  blurb:"Shelves of decor and room pieces." },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      const roundRect = api.roundRect;
      const FarmAtlas = api.FarmAtlas;
      // Local aliases used by extracted AC icon code
      const acShadow = S.acShadow, acWoodWall = S.acWoodWall, acBrickWall = S.acBrickWall,
        acStoneWall = S.acStoneWall, acGableRoof = S.acGableRoof, acBlueMetalRoof = S.acBlueMetalRoof,
        acDoor = S.acDoor, acWindow = S.acWindow, acRoofSign = S.acRoofSign,
        acAwning = S.acAwning, acRopeFence = S.acRopeFence;
        // Nook's Cranny–inspired shop
        ctx.save();
        ctx.translate(cx, cy);
        acShadow(72, 62);
        acWoodWall(-55, 0, 110, 56, "#E8D4B0", true);
        acBlueMetalRoof(58, -36, 2);
        acRoofSign("GOODS", -28, "#FBF0DE", "#C0483E");
        // leaf badge
        ctx.fillStyle = "#C0483E";
        ctx.beginPath();
        ctx.moveTo(0, -48); ctx.bezierCurveTo(-8, -56, -12, -44, 0, -38); ctx.bezierCurveTo(12, -44, 8, -56, 0, -48);
        ctx.fill();
        acDoor(-12, 24, 24, 30, "#A9784F");
        acWindow(-42, 10, 18, 16, "#F5F0E4");
        acWindow(24, 10, 18, 16, "#F5F0E4");
        acRopeFence(54);
        // drop-off crate
        ctx.fillStyle = "#C4895A";
        roundRect(-50, 40, 16, 12, 2); ctx.fill();
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
        // wall art
        ctx.fillStyle = "#F3DBAA";
        roundRect(HOUSE.x + 200, HOUSE.y + 95, 55, 40, 5); ctx.fill();
        ctx.fillStyle = "#8FC1D6";
        roundRect(HOUSE.x + 208, HOUSE.y + 101, 39, 28, 3); ctx.fill();
        ctx.fillStyle = "#6B8E6B";
        ctx.beginPath(); ctx.ellipse(HOUSE.x + 227, HOUSE.y + 122, 12, 5, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#F3DBAA";
        roundRect(HOUSE.x + HOUSE.w - 255, HOUSE.y + 95, 55, 40, 5); ctx.fill();
        ctx.fillStyle = "#B9D98C";
        roundRect(HOUSE.x + HOUSE.w - 247, HOUSE.y + 101, 39, 28, 3); ctx.fill();
        ctx.fillStyle = "#D98F2B";
        ctx.beginPath(); ctx.arc(HOUSE.x + HOUSE.w - 220, HOUSE.y + 112, 6, 0, Math.PI*2); ctx.fill();

        // OPEN sign
        ctx.fillStyle = "#D9705C";
        roundRect(cx - 28, HOUSE.y + 88, 56, 18, 5); ctx.fill();
        ctx.fillStyle = "#FFF7EA";
        ctx.font = "700 10px ui-rounded, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("OPEN", cx, HOUSE.y + 101);

        // packed shelves
        if(typeof drawStoreGoodsShelf === "function"){
          drawStoreGoodsShelf(HOUSE.x + 48, HOUSE.y + 95);
          drawStoreGoodsShelf(HOUSE.x + HOUSE.w - 128, HOUSE.y + 95);
        }
        if(typeof drawBuildingShelf === "function"){
          drawBuildingShelf(HOUSE.x + 145, HOUSE.y + 100, 55, 70, ["#D9705C","#3E7C74","#D98F2B","#5A7FB0"]);
          drawBuildingShelf(HOUSE.x + HOUSE.w - 200, HOUSE.y + 100, 55, 70, ["#E3998A","#8A6BAE","#6B8E6B","#D98F2B"]);
        }

        // display tables
        if(typeof drawStoreDisplayTable === "function"){
          drawStoreDisplayTable(HOUSE.x + 55, HOUSE.y + 290, "plants");
          drawStoreDisplayTable(HOUSE.x + HOUSE.w - 155, HOUSE.y + 290, "lamps");
          drawStoreDisplayTable(HOUSE.x + 280, HOUSE.y + 310, "pillows");
          drawStoreDisplayTable(HOUSE.x + 460, HOUSE.y + 310, "plants");
        }

        // flower baskets
        ctx.fillStyle = "#8C5A3B";
        roundRect(HOUSE.x + 200, HOUSE.y + 390, 36, 22, 8); ctx.fill();
        ["#E3998A","#D98F2B","#D9A5C0"].forEach((c,i) => {
          ctx.fillStyle = c;
          ctx.beginPath(); ctx.arc(HOUSE.x + 210 + i*10, HOUSE.y + 388, 5, 0, Math.PI*2); ctx.fill();
        });
        ctx.fillStyle = "#8C5A3B";
        roundRect(HOUSE.x + HOUSE.w - 240, HOUSE.y + 390, 36, 22, 8); ctx.fill();
        ["#6B8E6B","#CFE1D2","#D9705C"].forEach((c,i) => {
          ctx.fillStyle = c;
          ctx.beginPath(); ctx.arc(HOUSE.x + HOUSE.w - 230 + i*10, HOUSE.y + 388, 5, 0, Math.PI*2); ctx.fill();
        });

        // plants
        drawBuildingPlant(HOUSE.x + 175, HOUSE.y + 200);
        drawBuildingPlant(HOUSE.x + HOUSE.w - 175, HOUSE.y + 200);
        drawBuildingPlant(HOUSE.x + 360, HOUSE.y + 200);
        drawBuildingPlant(HOUSE.x + 520, HOUSE.y + 200);

        // hanging pots
        [[HOUSE.x+155, HOUSE.y+78],[HOUSE.x+HOUSE.w/2, HOUSE.y+78],[HOUSE.x+HOUSE.w-155, HOUSE.y+78]].forEach(([hx,hy], i) => {
          ctx.strokeStyle = "#6E5C49"; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(hx, hy-8); ctx.lineTo(hx, hy+4); ctx.stroke();
          ctx.fillStyle = "#B5654A";
          roundRect(hx-8, hy+2, 16, 10, 3); ctx.fill();
          ctx.fillStyle = ["#6B8E6B","#6B8E6B","#3E7C74"][i];
          ctx.beginPath(); ctx.arc(hx, hy, 7, 0, Math.PI*2); ctx.fill();
        });

        // cash register
        ctx.fillStyle = "#5A4030";
        roundRect(cx + 45, cy - 8, 28, 18, 3); ctx.fill();
        ctx.fillStyle = "#D98F2B";
        roundRect(cx + 49, cy - 4, 20, 6, 2); ctx.fill();

        // NPCs
        drawBuildingPatron(cx - 35, cy - 30, "#D9A066", "#C07840", "#3A2417", Math.sin(t/550)*1.2);
        drawNpcNameTag(cx - 35, cy - 54, "Willow");

        drawBuildingPatron(HOUSE.x + 160, HOUSE.y + 250, "#F7D9B6", "#5A7FB0", "#B5651D", Math.sin(t/480)*1.5);
        drawNpcNameTag(HOUSE.x + 160, HOUSE.y + 226, "Pip");

        drawBuildingPatron(HOUSE.x + 330, HOUSE.y + 360, "#F0C08A", "#8A6BAE", "#6B4423", Math.sin(t/420+1.2)*1.5);
        drawNpcNameTag(HOUSE.x + 330, HOUSE.y + 336, "Theo");

        drawBuildingPatron(HOUSE.x + HOUSE.w - 100, HOUSE.y + 270, "#B87A4B", "#D9705C", "#111111", Math.sin(t/500+2)*1.4);
        drawNpcNameTag(HOUSE.x + HOUSE.w - 100, HOUSE.y + 246, "Sam");

        for(let i=0;i<4;i++){
          const sx = HOUSE.x + 180 + i*140 + Math.sin(t/400+i)*6;
          const sy = HOUSE.y + 210 + Math.cos(t/350+i)*4;
          ctx.fillStyle = `rgba(255,255,255,${0.25+Math.sin(t/300+i)*0.2})`;
          ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI*2); ctx.fill();
        }
    },
  });
})();
