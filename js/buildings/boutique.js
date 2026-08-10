/**
 * boutique building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "boutique",
    info: {label:"Willow Boutique", wall:"#E8D0DC", floor:"#F3E6EA", accent:"#C45A7A", activity:"Try outfits",  blurb:"Mirrors, racks, and a fresh look." },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      const roundRect = api.roundRect;
      const FarmAtlas = api.FarmAtlas;
      // Local aliases used by extracted AC icon code
      const acShadow = S.acShadow, acWoodWall = S.acWoodWall, acBrickWall = S.acBrickWall,
        acStoneWall = S.acStoneWall, acGableRoof = S.acGableRoof, acBlueMetalRoof = S.acBlueMetalRoof,
        acDoor = S.acDoor, acWindow = S.acWindow, acRoofSign = S.acRoofSign,
        acAwning = S.acAwning, acRopeFence = S.acRopeFence;
        // Able Sisters–inspired
        ctx.save();
        ctx.translate(cx, cy);
        acShadow(68, 60);
        acWoodWall(-54, 0, 108, 54, "#C45A5A", false);
        acGableRoof(58, -48, 0, "#3E6B4A", "#5A8A62");
        // side bay gable
        ctx.fillStyle = "#3E6B4A";
        ctx.beginPath();
        ctx.moveTo(-54, 0); ctx.lineTo(-34, -28); ctx.lineTo(-14, 0); ctx.closePath(); ctx.fill();
        acAwning(-28, -10, 56, 12, "#5A8A62");
        ctx.fillStyle = "#FBF0DE";
        ctx.font = "700 8px ui-rounded, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("WILLOW", 0, -2);
        // white door with oval glass
        ctx.fillStyle = "#F5F0E4";
        roundRect(-11, 20, 22, 32, 4); ctx.fill();
        ctx.fillStyle = "#B8E4F5";
        ctx.beginPath(); ctx.ellipse(0, 30, 6, 7, 0, 0, Math.PI*2); ctx.fill();
        // bay display window
        acWindow(-46, 10, 22, 28, "#F5F0E4");
        ctx.fillStyle = "#F0C08A";
        ctx.beginPath(); ctx.arc(-35, 22, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#5A7FB0";
        roundRect(-40, 26, 10, 12, 2); ctx.fill();
        // lamp
        ctx.fillStyle = "#2A2A2A";
        ctx.fillRect(40, 8, 3, 14);
        ctx.fillStyle = "#F0D080";
        ctx.beginPath(); ctx.arc(41.5, 6, 4, 0, Math.PI*2); ctx.fill();
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
        [[HOUSE.x + 70, HOUSE.y + 100],[HOUSE.x + HOUSE.w - 130, HOUSE.y + 100]].forEach(([mx,my], i) => {
          ctx.fillStyle = "#A9784F";
          roundRect(mx, my, 60, 90, 8); ctx.fill();
          ctx.fillStyle = "#CFE7F2";
          roundRect(mx+6, my+8, 48, 72, 5); ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.sin(t/500 + i)*0.1})`;
          roundRect(mx+10, my+14, 20, 40, 4); ctx.fill();
        });

        ctx.fillStyle = "#6E5C49";
        ctx.fillRect(HOUSE.x + 160, HOUSE.y + 110, 3, 70);
        ctx.fillRect(HOUSE.x + 320, HOUSE.y + 110, 3, 70);
        ctx.fillRect(HOUSE.x + HOUSE.w - 323, HOUSE.y + 110, 3, 70);
        ctx.fillRect(HOUSE.x + HOUSE.w - 163, HOUSE.y + 110, 3, 70);
        ctx.strokeStyle = "#8C5A3B"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(HOUSE.x + 160, HOUSE.y + 112); ctx.lineTo(HOUSE.x + 323, HOUSE.y + 112); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(HOUSE.x + HOUSE.w - 323, HOUSE.y + 112); ctx.lineTo(HOUSE.x + HOUSE.w - 160, HOUSE.y + 112); ctx.stroke();
        ["#D9705C","#5A7FB0","#8A6BAE","#D98F2B","#3E7C74","#E8A0BF"].forEach((c,i) => {
          const left = i < 3;
          const bx = left ? HOUSE.x + 180 + i*45 : HOUSE.x + HOUSE.w - 300 + (i-3)*45;
          ctx.fillStyle = c;
          roundRect(bx, HOUSE.y + 118, 22, 36, 6); ctx.fill();
        });

        [[HOUSE.x + 70, HOUSE.y + 310],[HOUSE.x + HOUSE.w - 160, HOUSE.y + 310],[HOUSE.x + 280, HOUSE.y + 320],[HOUSE.x + 460, HOUSE.y + 320]].forEach(([tx,ty], i) => {
          ctx.fillStyle = "#C4895A";
          roundRect(tx, ty, 90, 42, 8); ctx.fill();
          ctx.fillStyle = ["#CFE1D2","#F3DBAA","#E3998A","#8FC1D6"][i];
          roundRect(tx+18, ty+8, 54, 18, 5); ctx.fill();
        });

        drawBuildingPlant(HOUSE.x + 220, HOUSE.y + 210);
        drawBuildingPlant(HOUSE.x + HOUSE.w - 220, HOUSE.y + 210);

        // Walk-up poster for the daily Style Photo Hunt.
        // Keep the challenge poster in its own right-wall nook, clear of racks.
        const posterX = HOUSE.x + HOUSE.w - 145, posterY = HOUSE.y + 190;
        ctx.fillStyle = "#FBF0DE";
        roundRect(posterX, posterY, 72, 92, 7); ctx.fill();
        ctx.strokeStyle = "#C45A7A"; ctx.lineWidth = 3;
        roundRect(posterX, posterY, 72, 92, 7); ctx.stroke();
        ctx.fillStyle = "#C45A7A";
        ctx.font = "700 9px ui-rounded, sans-serif"; ctx.textAlign = "center";
        ctx.fillText("STYLE", posterX + 36, posterY + 17);
        ctx.fillText("CHALLENGE", posterX + 36, posterY + 29);
        ctx.fillStyle = "#8A6BAE";
        ctx.beginPath(); ctx.moveTo(posterX+20,posterY+72); ctx.lineTo(posterX+36,posterY+40); ctx.lineTo(posterX+52,posterY+72); ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.sin(t/300)*0.25})`;
        ctx.beginPath(); ctx.arc(posterX+57, posterY+42, 3, 0, Math.PI*2); ctx.fill();

        // Willow's signature fitting platform and two seasonal mannequins.
        ctx.fillStyle = "rgba(196,90,122,0.16)";
        ctx.beginPath(); ctx.ellipse(cx, cy + 62, 86, 30, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "rgba(196,90,122,0.42)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy + 62, 72, 23, 0, 0, Math.PI*2); ctx.stroke();

        const child = (state && state.child) || {};
        [[cx-105, cy+20, child.outfit || "#D9705C"],[cx+105, cy+20, "#8A6BAE"]].forEach(([mx,my,color], i) => {
          ctx.fillStyle = "#C4895A";
          ctx.fillRect(mx-2, my+28, 4, 35);
          ctx.beginPath(); ctx.arc(mx, my, 7, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(mx-18, my+16); ctx.lineTo(mx+18, my+16);
          ctx.lineTo(mx+(i ? 24 : 20), my+48); ctx.lineTo(mx-(i ? 24 : 20), my+48);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.38)";
          ctx.beginPath(); ctx.arc(mx+10, my+23, 2.2, 0, Math.PI*2); ctx.fill();
        });

        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(t/360)*0.18})`;
        [[cx-67,cy+22],[cx+65,cy+5],[cx+8,cy+43]].forEach(([sx,sy]) => {
          ctx.beginPath();
          ctx.moveTo(sx,sy-5); ctx.lineTo(sx+1.5,sy-1.5); ctx.lineTo(sx+5,sy);
          ctx.lineTo(sx+1.5,sy+1.5); ctx.lineTo(sx,sy+5); ctx.lineTo(sx-1.5,sy+1.5);
          ctx.lineTo(sx-5,sy); ctx.lineTo(sx-1.5,sy-1.5); ctx.closePath(); ctx.fill();
        });

        drawBuildingPatron(cx - 25, cy - 28, "#F0C08A", "#C45A7A", "#6B4423", Math.sin(t/540)*1.1);
        drawNpcNameTag(cx - 25, cy - 52, "Lila");
        drawBuildingPatron(HOUSE.x + 150, HOUSE.y + 250, "#D9A066", "#5A7FB0", "#3A2417", Math.sin(t/470)*1.3);
        drawNpcNameTag(HOUSE.x + 150, HOUSE.y + 226, "Mara");
        drawBuildingPatron(HOUSE.x + HOUSE.w - 170, HOUSE.y + 360, "#F7D9B6", "#8A6BAE", "#B5651D", Math.sin(t/450)*1.2);
        drawNpcNameTag(HOUSE.x + HOUSE.w - 170, HOUSE.y + 336, "Pip");
    },
  });
})();
