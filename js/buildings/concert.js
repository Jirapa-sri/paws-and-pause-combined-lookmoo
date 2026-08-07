/**
 * concert building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "concert",
    info: {label:"Concert Festival",wall:"#2A1840", floor:"#3A2550", accent:"#E8A33D", activity:"Join the show", blurb:"Lisa hosts under the festival lights." },
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
        acShadow(80, 62);
        acWoodWall(-60, 4, 120, 50, "#F0D0E0", false);
        acGableRoof(66, -40, 4, "#C45A8C", "#E080B0");
        acAwning(-36, -8, 72, 14, "#E8A33D");
        ctx.fillStyle = "#FBF0DE";
        ctx.font = "700 9px ui-rounded, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("LIVE", 0, 0);
        acDoor(-12, 22, 24, 30, "#5A4030");
        acWindow(-46, 12, 16, 16);
        acWindow(30, 12, 16, 16);
        // spotlights as cute lamps
        ctx.fillStyle = "rgba(255,220,120,0.45)";
        ctx.beginPath(); ctx.moveTo(-30, -36); ctx.lineTo(-18, 8); ctx.lineTo(-42, 8); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(30, -36); ctx.lineTo(18, 8); ctx.lineTo(42, 8); ctx.closePath(); ctx.fill();
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
        // stage platform
        ctx.fillStyle = "#1A0F2E";
        roundRect(HOUSE.x + 120, HOUSE.y + 95, HOUSE.w - 240, 78, 10); ctx.fill();
        ctx.fillStyle = "#2A1840";
        roundRect(HOUSE.x + 130, HOUSE.y + 102, HOUSE.w - 260, 58, 8); ctx.fill();
        // stage lights
        [[HOUSE.x+160, HOUSE.y+88],[HOUSE.x+HOUSE.w/2, HOUSE.y+82],[HOUSE.x+HOUSE.w-160, HOUSE.y+88]].forEach(([lx,ly], i) => {
          const pulse = 0.25 + Math.sin(t/220 + i)*0.2;
          ctx.fillStyle = `rgba(255,200,80,${pulse})`;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx - 40, ly + 70);
          ctx.lineTo(lx + 40, ly + 70);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#E8A33D";
          ctx.beginPath(); ctx.arc(lx, ly, 6, 0, Math.PI*2); ctx.fill();
        });
        // banner
        ctx.fillStyle = "#C45A8C";
        roundRect(cx - 90, HOUSE.y + 88, 180, 22, 6); ctx.fill();
        ctx.fillStyle = "#FBF0DE";
        ctx.font = "700 12px ui-rounded, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("★ LISA LIVE ★", cx, HOUSE.y + 103);

        // speakers
        [[HOUSE.x+90, HOUSE.y+110],[HOUSE.x+HOUSE.w-130, HOUSE.y+110]].forEach(([sx,sy]) => {
          ctx.fillStyle = "#1A1220";
          roundRect(sx, sy, 40, 55, 6); ctx.fill();
          ctx.fillStyle = "#3A2559";
          ctx.beginPath(); ctx.arc(sx+20, sy+18, 10, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(sx+20, sy+40, 7, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = `rgba(232,163,61,${0.3+Math.sin(t/150)*0.25})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(sx+20, sy+18, 12, 0, Math.PI*2); ctx.stroke();
        });

        // Lisa on stage as host
        drawLisaHost(cx, HOUSE.y + 145, t, 1.35);
        drawNpcNameTag(cx, HOUSE.y + 108, "Lisa · Host");

        // festival stalls / merch
        ctx.fillStyle = "#C45A8C";
        roundRect(HOUSE.x + 70, HOUSE.y + 310, 90, 50, 8); ctx.fill();
        ctx.fillStyle = "#E8A33D";
        roundRect(HOUSE.x + 78, HOUSE.y + 300, 74, 16, 4); ctx.fill();
        ctx.fillStyle = "#2A1840";
        ctx.font = "700 9px ui-rounded, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("MERCH", HOUSE.x + 115, HOUSE.y + 312);

        ctx.fillStyle = "#5A7FB0";
        roundRect(HOUSE.x + HOUSE.w - 160, HOUSE.y + 310, 90, 50, 8); ctx.fill();
        ctx.fillStyle = "#E8A33D";
        roundRect(HOUSE.x + HOUSE.w - 152, HOUSE.y + 300, 74, 16, 4); ctx.fill();
        ctx.fillStyle = "#2A1840";
        ctx.fillText("SNACKS", HOUSE.x + HOUSE.w - 115, HOUSE.y + 312);

        // floating sparkles / confetti
        for(let i=0;i<10;i++){
          const sx = HOUSE.x + 140 + ((t/30 + i*70) % (HOUSE.w - 280));
          const sy = HOUSE.y + 180 + Math.sin(t/400 + i)*40 + (i%3)*20;
          ctx.fillStyle = ["#E8A33D","#C45A8C","#FBF0DE","#8FD1E0"][i%4];
          ctx.beginPath(); ctx.arc(sx, sy, 2.5, 0, Math.PI*2); ctx.fill();
        }

        // box office clerk
        drawBuildingPatron(cx + 40, cy - 28, "#D9A066", "#C45A8C", "#3A2417", Math.sin(t/520)*1);
        drawNpcNameTag(cx + 40, cy - 52, "Nova");

        // cheering crowd
        drawBuildingPatron(HOUSE.x + 200, HOUSE.y + 380, "#F0C08A", "#E8A33D", "#111111", Math.sin(t/320)*2.2);
        drawNpcNameTag(HOUSE.x + 200, HOUSE.y + 356, "Pip");
        drawBuildingPatron(HOUSE.x + 340, HOUSE.y + 390, "#F7D9B6", "#C45A8C", "#B5651D", Math.sin(t/300+1)*2.4);
        drawNpcNameTag(HOUSE.x + 340, HOUSE.y + 366, "Mara");
        drawBuildingPatron(HOUSE.x + 480, HOUSE.y + 375, "#D9A066", "#5A7FB0", "#6B4423", Math.sin(t/340+2)*2);
        drawNpcNameTag(HOUSE.x + 480, HOUSE.y + 351, "Theo");
        drawBuildingPatron(HOUSE.x + 620, HOUSE.y + 385, "#B87A4B", "#FBF0DE", "#111111", Math.sin(t/310+0.5)*2.3);
        drawNpcNameTag(HOUSE.x + 620, HOUSE.y + 361, "Sam");
    },
  });
})();
