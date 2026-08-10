/**
 * lake building module — lakeside pier cabin + tackle loft interior
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "lake",
    info: {
      label: "Lakeside Pier",
      wall: "#A8C4B8",
      floor: "#C9B48A",
      accent: "#3E7C74",
      activity: "Go fishing",
      blurb: "Cast a line - sell your catch at Sea Harbour.",
    },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      const roundRect = api.roundRect;
      const acShadow = S.acShadow, acWoodWall = S.acWoodWall, acGableRoof = S.acGableRoof,
        acDoor = S.acDoor, acWindow = S.acWindow, acRoofSign = S.acRoofSign;

      ctx.save();
      ctx.translate(cx, cy);

      ctx.fillStyle = "#5A9AAD";
      ctx.beginPath(); ctx.ellipse(8, 48, 62, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#7EB8C8";
      ctx.beginPath(); ctx.ellipse(10, 46, 48, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(4, 42, 28, 5, 0, 0.2, Math.PI - 0.2); ctx.stroke();

      acShadow(78, 58);

      ctx.fillStyle = "#A9784F";
      roundRect(18, 28, 48, 16, 3); ctx.fill();
      ctx.fillStyle = "#C4895A";
      roundRect(20, 30, 44, 12, 2); ctx.fill();
      ctx.strokeStyle = "rgba(58,44,34,0.28)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(22 + i * 10, 30);
        ctx.lineTo(22 + i * 10, 42);
        ctx.stroke();
      }
      [[22, 44], [58, 44]].forEach(([px, py]) => {
        ctx.fillStyle = "#6E5C49";
        roundRect(px - 3, py - 6, 6, 12, 2); ctx.fill();
      });

      acWoodWall(-52, 0, 78, 50, "#E2D0B0", true);
      acGableRoof(44, -42, 0, "#3E7C74", "#6FA79B");
      acDoor(-18, 18, 22, 30, "#6E5C49");
      acWindow(-42, 10, 16, 15);
      acWindow(8, 10, 16, 15);
      acRoofSign("FISH", -18, "#FBF0DE", "#3E7C74");

      ctx.fillStyle = "#C4895A";
      ctx.fillRect(-6, -8, 3, 10);
      ctx.fillStyle = "#F2C14E";
      roundRect(-10, 0, 11, 10, 2); ctx.fill();
      ctx.fillStyle = "rgba(242,193,78,0.35)";
      ctx.beginPath(); ctx.arc(-4.5, 5, 10, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = "#5A7A4A";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      [[-58, 40], [-50, 44], [64, 38], [72, 42]].forEach(([rx, ry], i) => {
        ctx.beginPath();
        ctx.moveTo(rx, ry + 10);
        ctx.quadraticCurveTo(rx + (i % 2 ? 4 : -4), ry - 6, rx + (i % 2 ? 2 : -2), ry - 16);
        ctx.stroke();
      });

      ctx.fillStyle = "#E8A33D";
      ctx.beginPath();
      ctx.moveTo(40, 50);
      ctx.lineTo(48, 48);
      ctx.lineTo(40, 46);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    },

    drawInterior(ctx, api, t, cx, cy) {
      const roundRect = api.roundRect;
      const HOUSE = api.HOUSE;
      const drawBuildingPatron = api.drawBuildingPatron;
      const drawNpcNameTag = api.drawNpcNameTag;
      const drawBuildingPlant = api.drawBuildingPlant;
      const drawBuildingTable = api.drawBuildingTable;
      const drawBuildingChair = api.drawBuildingChair;
      const drawBuildingShelf = api.drawBuildingShelf;

      const left = HOUSE.x + HOUSE.wall;
      const top = HOUSE.y + HOUSE.wall + 36;
      const right = HOUSE.x + HOUSE.w - HOUSE.wall;
      const bottom = HOUSE.y + HOUSE.h - HOUSE.wall;

      // cabin wood floor (warm)
      ctx.fillStyle = "#D4B896";
      ctx.fillRect(left, top, right - left, bottom - top);
      ctx.strokeStyle = "rgba(58,44,34,0.08)";
      ctx.lineWidth = 1.2;
      for (let y = top + 10; y < bottom; y += 16) {
        ctx.beginPath(); ctx.moveTo(left + 2, y); ctx.lineTo(right - 2, y); ctx.stroke();
      }

      // ---------- panoramic lake window ----------
      const wx = left + 24, wy = top + 8, ww = right - left - 48, wh = 118;
      ctx.fillStyle = "#5A736C";
      roundRect(wx - 8, wy - 8, ww + 16, wh + 22, 12); ctx.fill();

      const sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
      sky.addColorStop(0, "#C9E8F0");
      sky.addColorStop(0.42, "#7EB8C8");
      sky.addColorStop(0.55, "#5A9EB0");
      sky.addColorStop(1, "#2F6B66");
      ctx.fillStyle = sky;
      roundRect(wx, wy, ww, wh, 8); ctx.fill();

      // sun + clouds
      ctx.fillStyle = "rgba(242,193,78,0.55)";
      ctx.beginPath(); ctx.arc(wx + ww - 70, wy + 28, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath(); ctx.ellipse(wx + 90, wy + 26, 34, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(wx + 220, wy + 22, 28, 10, 0, 0, Math.PI * 2); ctx.fill();

      // distant hills
      ctx.fillStyle = "rgba(90,122,74,0.45)";
      ctx.beginPath();
      ctx.moveTo(wx, wy + wh);
      ctx.lineTo(wx, wy + 70);
      ctx.quadraticCurveTo(wx + 120, wy + 40, wx + 240, wy + 68);
      ctx.quadraticCurveTo(wx + 400, wy + 38, wx + ww, wy + 62);
      ctx.lineTo(wx + ww, wy + wh);
      ctx.closePath(); ctx.fill();

      // water shimmer bands
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const yy = wy + 72 + i * 10 + Math.sin(t / 700 + i) * 2;
        ctx.beginPath();
        ctx.moveTo(wx + 12, yy);
        for (let x = wx + 12; x < wx + ww - 12; x += 18) {
          ctx.lineTo(x, yy + Math.sin(x / 26 + t / 500 + i) * 2.2);
        }
        ctx.stroke();
      }

      // outer pier in the view
      ctx.fillStyle = "#8C5A3B";
      roundRect(wx + ww * 0.35, wy + 78, 120, 16, 3); ctx.fill();
      ctx.fillStyle = "#C4895A";
      roundRect(wx + ww * 0.35 + 3, wy + 81, 114, 10, 2); ctx.fill();
      // canoe bobbing
      const canoeX = wx + ww * 0.55 + Math.sin(t / 900) * 10;
      ctx.fillStyle = "#6E4530";
      ctx.beginPath();
      ctx.ellipse(canoeX, wy + 98 + Math.sin(t / 650) * 2, 22, 6, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // swimming fish in window
      for (let i = 0; i < 3; i++) {
        const fx = wx + 60 + ((t / 18 + i * 140) % (ww - 80));
        const fy = wy + 88 + Math.sin(t / 400 + i) * 6;
        const cols = ["#E8A33D", "#CFE7F2", "#6B8E6B"];
        ctx.fillStyle = cols[i];
        ctx.beginPath(); ctx.ellipse(fx, fy, 8, 3.2, 0.15, 0, Math.PI * 2); ctx.fill();
      }

      // reeds
      ctx.strokeStyle = "rgba(90,122,74,0.7)";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      for (let i = 0; i < 10; i++) {
        const rx = wx + 30 + i * ((ww - 60) / 9);
        const sway = Math.sin(t / 600 + i) * 4;
        ctx.beginPath();
        ctx.moveTo(rx, wy + wh - 4);
        ctx.quadraticCurveTo(rx + sway, wy + wh - 28, rx + sway * 0.4, wy + wh - 46 - (i % 3) * 4);
        ctx.stroke();
      }

      // mullions
      ctx.strokeStyle = "rgba(251,240,222,0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(wx + ww / 3, wy); ctx.lineTo(wx + ww / 3, wy + wh);
      ctx.moveTo(wx + (ww * 2) / 3, wy); ctx.lineTo(wx + (ww * 2) / 3, wy + wh);
      ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2);
      ctx.stroke();

      // sill
      ctx.fillStyle = "#C9B48A";
      roundRect(wx - 4, wy + wh - 2, ww + 8, 14, 3); ctx.fill();
      drawBuildingPlant(wx + 24, wy + wh + 28);
      drawBuildingPlant(wx + ww - 24, wy + wh + 28);

      // hanging lanterns over sill
      [[wx + ww * 0.2, wy - 2], [wx + ww * 0.8, wy - 2]].forEach(([lx, ly], i) => {
        ctx.strokeStyle = "#8C5A3B";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + 18); ctx.stroke();
        ctx.fillStyle = "#F2C14E";
        roundRect(lx - 8, ly + 16, 16, 14, 3); ctx.fill();
        const glow = 0.14 + Math.sin(t / 380 + i) * 0.05;
        ctx.fillStyle = `rgba(242,193,78,${glow})`;
        ctx.beginPath(); ctx.arc(lx, ly + 36, 26, 0, Math.PI * 2); ctx.fill();
      });

      // Layout zones (keep center aisle open for the door):
      // LEFT: bait + lounge + barrels | CENTER: weather board + Finn | RIGHT: trophies + rods

      // ---------- left: bait counter ----------
      ctx.fillStyle = "#8C5A3B";
      roundRect(left + 18, top + 150, 150, 88, 10); ctx.fill();
      ctx.fillStyle = "#C4895A";
      roundRect(left + 24, top + 156, 138, 24, 6); ctx.fill();
      ["#3E7C74", "#D98F2B", "#6B8E6B", "#5A7FB0"].forEach((col, i) => {
        const jx = left + 42 + i * 30;
        ctx.fillStyle = col;
        roundRect(jx, top + 188, 18, 28, 4); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        roundRect(jx + 3, top + 192, 8, 10, 2); ctx.fill();
      });
      ctx.fillStyle = "#FBF0DE";
      ctx.font = "800 11px Fraunces, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("BAIT BAR", left + 93, top + 172);

      // ---------- center-back: weather board ----------
      ctx.fillStyle = "#2A4038";
      roundRect(left + 290, top + 150, 130, 78, 8); ctx.fill();
      ctx.fillStyle = "#FBF0DE";
      ctx.font = "700 10px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TODAY", left + 355, top + 170);
      ctx.font = "600 9px Nunito, sans-serif";
      ctx.fillText("Soft rain", left + 355, top + 188);
      ctx.fillText("Bass biting", left + 355, top + 204);
      ctx.fillText("Sell at Harbour", left + 355, top + 220);

      // ---------- right: trophies + shelf + rods ----------
      [[right - 300, top + 150, "#E8A33D"], [right - 300, top + 210, "#7EB8C8"]].forEach(([px, py, col], i) => {
        ctx.fillStyle = "#8C5A3B";
        roundRect(px, py, 100, 48, 6); ctx.fill();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(px + 50, py + 26, 30, 11, -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#FBF0DE";
        ctx.font = "700 8px Nunito, sans-serif";
        ctx.fillText(i ? "LAKE BASS" : "GOLDEN", px + 50, py + 14);
      });

      drawBuildingShelf(right - 90, top + 150, 70, 100, ["#3E7C74", "#E8A33D", "#CFE7F2", "#D9705C"]);

      ctx.fillStyle = "#8C5A3B";
      roundRect(right - 170, top + 160, 12, 130, 3); ctx.fill();
      ctx.strokeStyle = "#6E5C49";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      for (let i = 0; i < 6; i++) {
        const x0 = right - 185 + i * 12;
        ctx.beginPath();
        ctx.moveTo(x0, top + 168);
        ctx.lineTo(x0 + 48, top + 278);
        ctx.stroke();
        ctx.fillStyle = ["#D9705C", "#3E7C74", "#D98F2B"][i % 3];
        ctx.beginPath(); ctx.arc(x0 + 48, top + 278, 3.5, 0, Math.PI * 2); ctx.fill();
      }

      // ---------- left lounge (below bait, clear of center aisle) ----------
      ctx.fillStyle = "rgba(62,124,116,0.22)";
      roundRect(left + 24, top + 270, 200, 95, 16); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      roundRect(left + 34, top + 280, 180, 75, 12); ctx.fill();

      drawBuildingTable(left + 50, top + 285, 150, 48);
      drawBuildingChair(left + 40, top + 332);
      drawBuildingChair(left + 155, top + 332);

      ctx.fillStyle = "#CFE7F2";
      roundRect(left + 70, top + 292, 90, 36, 4); ctx.fill();
      ctx.strokeStyle = "#3E7C74";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(left + 115, top + 310, 26, 11, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#3E7C74";
      ctx.font = "700 8px Nunito, sans-serif";
      ctx.fillText("WILLOW LAKE", left + 115, top + 304);

      // fishbowl beside lounge
      ctx.fillStyle = "rgba(126,184,200,0.55)";
      roundRect(left + 240, top + 290, 64, 50, 12); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 2;
      roundRect(left + 240, top + 290, 64, 50, 12); ctx.stroke();
      ctx.fillStyle = "#E8A33D";
      ctx.beginPath();
      ctx.ellipse(left + 265 + Math.sin(t / 500) * 8, top + 314, 9, 3.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6B8E4E";
      ctx.beginPath(); ctx.ellipse(left + 272, top + 328, 11, 3.5, 0, 0, Math.PI * 2); ctx.fill();

      // barrels bottom-left (out of door lane)
      [[left + 48, bottom - 90], [left + 108, bottom - 84]].forEach(([bx, by], i) => {
        ctx.fillStyle = i ? "#8C5A3B" : "#A9784F";
        ctx.beginPath(); ctx.ellipse(bx, by + 26, 24, 10, 0, 0, Math.PI * 2); ctx.fill();
        roundRect(bx - 24, by - 6, 48, 34, 6); ctx.fill();
        ctx.fillStyle = "#6E5C49";
        ctx.beginPath(); ctx.ellipse(bx, by - 6, 24, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#FBF0DE";
        ctx.font = "700 9px Nunito, sans-serif";
        ctx.fillText(i ? "WORMS" : "SHINY", bx, by + 12);
      });

      // cast hint near Finn
      const pulse = 0.12 + Math.sin(t / 450) * 0.05;
      ctx.fillStyle = `rgba(62,124,116,${pulse})`;
      roundRect(cx - 100, cy + 36, 200, 24, 10); ctx.fill();
      ctx.fillStyle = "rgba(58,44,34,0.55)";
      ctx.font = "700 11px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Ask Finn · head out to cast", cx, cy + 52);

      // people
      if (typeof drawBuildingPatron === "function") {
        drawBuildingPatron(cx + 10, cy - 8, "#DCE6F2", "#3E7C74", "#4A3728", Math.sin(t / 520) * 1);
        if (typeof drawNpcNameTag === "function") drawNpcNameTag(cx + 10, cy - 32, "Finn");

        drawBuildingPatron(left + 200, top + 175, "#F0C08A", "#C4895A", "#6B4423", Math.sin(t / 480) * 1.1);
        if (typeof drawNpcNameTag === "function") drawNpcNameTag(left + 200, top + 151, "Ivy");

        drawBuildingPatron(left + 360, bottom - 78, "#F7D9B6", "#5A7FB0", "#3A2417", Math.sin(t / 450) * 1.2);
        if (typeof drawNpcNameTag === "function") drawNpcNameTag(left + 360, bottom - 102, "Theo");

        drawBuildingPatron(right - 220, bottom - 95, "#D9A066", "#8A6BAE", "#B5651D", Math.sin(t / 500 + 1) * 1.1);
        if (typeof drawNpcNameTag === "function") drawNpcNameTag(right - 220, bottom - 119, "Sora");
      }
    },
  });
})();
