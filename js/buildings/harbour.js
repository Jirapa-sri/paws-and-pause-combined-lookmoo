/**
 * harbour building module — continuous pier hall, market stalls + port slip
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "harbour",
    info: {
      label: "Sea Harbour",
      wall: "#C9B89A",
      floor: "#D4B896",
      accent: "#3E7C74",
      activity: "Harbour board",
      blurb: "Market stalls on land — walk the wooden deck out to the boat.",
    },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      const roundRect = api.roundRect;

      ctx.save();
      ctx.translate(cx, cy);

      ctx.fillStyle = "#4F8FA6";
      ctx.beginPath(); ctx.ellipse(6, 46, 72, 22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#7EB8C8";
      ctx.beginPath(); ctx.ellipse(8, 44, 56, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(4, 40, 34, 5, 0, 0.2, Math.PI - 0.2); ctx.stroke();

      S.acShadow(86, 58);

      ctx.fillStyle = "#8C5A3B";
      roundRect(-58, 8, 116, 28, 5); ctx.fill();
      ctx.fillStyle = "#C4895A";
      roundRect(-54, 11, 108, 22, 4); ctx.fill();
      ctx.strokeStyle = "rgba(58,44,34,0.28)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(-50 + i * 18, 12);
        ctx.lineTo(-50 + i * 18, 32);
        ctx.stroke();
      }

      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 ? "#3E7C74" : "#FBF0DE";
        roundRect(-56 + i * 12, -22, 12, 14, 2); ctx.fill();
      }
      ctx.fillStyle = "#C9A574";
      roundRect(-52, -10, 52, 22, 3); ctx.fill();
      ctx.fillStyle = "#7EB8C8";
      ctx.beginPath(); ctx.ellipse(-36, 2, 6, 2.5, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#E8A33D";
      ctx.beginPath(); ctx.ellipse(-24, 3, 6, 2.5, 0.1, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#6E4530";
      ctx.beginPath();
      ctx.moveTo(18, 28);
      ctx.quadraticCurveTo(34, 40, 52, 30);
      ctx.lineTo(46, 22);
      ctx.lineTo(24, 22);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#FBF0DE";
      ctx.beginPath();
      ctx.moveTo(34, 10); ctx.lineTo(46, 24); ctx.lineTo(34, 24);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#3E7C74";
      roundRect(30, 16, 10, 8, 2); ctx.fill();

      ctx.fillStyle = "#6E5C49";
      ctx.fillRect(54, -18, 4, 34);
      ctx.fillStyle = "#D9705C";
      roundRect(50, -26, 12, 10, 2); ctx.fill();
      ctx.fillStyle = "rgba(242,193,78,0.4)";
      ctx.beginPath(); ctx.arc(56, -20, 10, 0, Math.PI * 2); ctx.fill();

      ctx.restore();
    },

    drawInterior(ctx, api, t, cx, cy) {
      const roundRect = api.roundRect;
      const HOUSE = api.HOUSE;
      const drawBuildingPatron = api.drawBuildingPatron;
      const drawNpcNameTag = api.drawNpcNameTag;

      const left = HOUSE.x + HOUSE.wall;
      const top = HOUSE.y + HOUSE.wall + 40;
      const right = HOUSE.x + HOUSE.w - HOUSE.wall;
      const bottom = HOUSE.y + HOUSE.h - HOUSE.wall;
      // Continuous pier floor; water only along the right slip
      const waterX = HOUSE.x + HOUSE.w * 0.70;

      // full pier deck (market → boarding edge, no divider wall)
      ctx.fillStyle = "#E2D0B0";
      ctx.fillRect(left, top, waterX - left, bottom - top);
      ctx.fillStyle = "#D4B896";
      ctx.fillRect(left, top, waterX - left, 8);

      // boardwalk planks across whole pier
      ctx.strokeStyle = "rgba(58,44,34,0.11)";
      ctx.lineWidth = 1.4;
      for (let y = top + 12; y < bottom; y += 18) {
        ctx.beginPath();
        ctx.moveTo(left + 4, y);
        ctx.lineTo(waterX - 4, y);
        ctx.stroke();
      }
      // lengthwise seams
      ctx.strokeStyle = "rgba(58,44,34,0.08)";
      for (let x = left + 40; x < waterX - 10; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, top + 6);
        ctx.lineTo(x, bottom - 4);
        ctx.stroke();
      }

      // water slip (right) — not walkable (blocked by solids)
      const waterG = ctx.createLinearGradient(waterX, top, right, bottom);
      waterG.addColorStop(0, "#8FC9D8");
      waterG.addColorStop(0.45, "#5A9EB0");
      waterG.addColorStop(1, "#2F6B66");
      ctx.fillStyle = waterG;
      ctx.fillRect(waterX, top - 2, right - waterX + 2, bottom - top + 4);

      // soft foam at pier edge (visual only — no wall)
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(waterX, top + 4);
      for (let y = top + 4; y < bottom - 4; y += 14) {
        ctx.lineTo(waterX + Math.sin(t / 480 + y / 35) * 2.5, y);
      }
      ctx.stroke();

      // caustics in water
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const yy = top + 40 + i * 55 + Math.sin(t / 700 + i) * 4;
        ctx.beginPath();
        ctx.moveTo(waterX + 12, yy);
        for (let x = waterX + 12; x < right - 8; x += 20) {
          ctx.lineTo(x, yy + Math.sin(x / 28 + t / 450 + i) * 3);
        }
        ctx.stroke();
      }

      // ---------- MARKET STALLS (back wall, on pier) ----------
      const stalls = [
        { title: "Catch", accent: "#3E7C74", fish: ["#7EB8C8", "#E8A33D", "#6B8E6B"] },
        { title: "Bait & Ice", accent: "#5A7FB0", fish: ["#CFE7F2", "#B8C4D9", "#8C7A66"] },
        { title: "Dock Orders", accent: "#D98F2B", fish: ["#D9705C", "#F2C14E", "#E3998A"] },
      ];
      const stallW = 150;
      const stallGap = 18;
      const stallStart = left + 36;
      const stallY = top + 18;

      stalls.forEach((stall, i) => {
        const sx = stallStart + i * (stallW + stallGap);
        // awning
        for (let a = 0; a < 6; a++) {
          ctx.fillStyle = a % 2 ? stall.accent : "#FBF0DE";
          roundRect(sx + a * (stallW / 6), stallY, stallW / 6 + 1, 16, 2); ctx.fill();
        }
        // counter
        ctx.fillStyle = "#C9A574";
        roundRect(sx + 4, stallY + 14, stallW - 8, 70, 7); ctx.fill();
        ctx.fillStyle = "#8C5A3B";
        roundRect(sx + 10, stallY + 48, stallW - 20, 28, 5); ctx.fill();
        // goods
        stall.fish.forEach((col, fi) => {
          const fx = sx + 28 + fi * 36;
          const fy = stallY + 58;
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.beginPath(); ctx.ellipse(fx, fy + 4, 11, 4.5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.ellipse(fx, fy, 10, 4, -0.25, 0, Math.PI * 2); ctx.fill();
        });
        // sign
        ctx.fillStyle = stall.accent;
        roundRect(sx + 28, stallY - 14, stallW - 56, 18, 5); ctx.fill();
        ctx.fillStyle = "#FBF0DE";
        ctx.font = "700 10px Nunito, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(stall.title, sx + stallW / 2, stallY - 2);
      });

      // chalkboard between stalls & pier
      ctx.fillStyle = "#2A4038";
      roundRect(left + 28, top + 120, 72, 58, 7); ctx.fill();
      ctx.fillStyle = "#FBF0DE";
      ctx.font = "700 9px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BOARD", left + 64, top + 138);
      ctx.font = "600 8px Nunito, sans-serif";
      ctx.fillText("Bass ▲", left + 64, top + 152);
      ctx.fillText("Koi ·", left + 64, top + 164);

      // market interact hint (on pier, in front of stalls)
      const marketPulse = 0.12 + Math.sin(t / 500) * 0.06;
      ctx.fillStyle = `rgba(62,124,116,${marketPulse})`;
      roundRect(stallStart + 40, stallY + 96, 360, 28, 10); ctx.fill();
      ctx.fillStyle = "rgba(58,44,34,0.5)";
      ctx.font = "700 11px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Talk to stallkeepers · sell catch · buy dog food", stallStart + 220, stallY + 114);

      // crates / barrels on market pier
      [[left + 40, bottom - 100], [left + 78, bottom - 92], [waterX - 120, bottom - 110]].forEach(([bx, by], i) => {
        ctx.fillStyle = i === 2 ? "#A9784F" : "#8C5A3B";
        roundRect(bx, by, 26, 20, 3); ctx.fill();
        ctx.strokeStyle = "rgba(251,240,222,0.28)";
        ctx.strokeRect(bx + 3, by + 3, 20, 14);
      });
      // rope coil near deck mouth
      ctx.strokeStyle = "#D9C4A0";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(waterX - 56, bottom - 70, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(waterX - 56, bottom - 70, 6, 0, Math.PI * 2); ctx.stroke();

      // ---------- WOODEN FINGER DECK (market → boat) ----------
      const deckTop = top + (bottom - top) * 0.34;
      const deckH = 96;
      const deckStart = waterX - 18;
      const deckEnd = waterX + 118;
      const deckMidY = deckTop + deckH / 2;
      const bob = Math.sin(t / 650) * 3;

      // soft shadow under deck on water
      ctx.fillStyle = "rgba(20,40,50,0.22)";
      roundRect(deckStart + 8, deckTop + 10, deckEnd - deckStart, deckH + 6, 8); ctx.fill();

      // deck body — warm planks jutting into the slip
      ctx.fillStyle = "#8C5A3B";
      roundRect(deckStart, deckTop, deckEnd - deckStart + 6, deckH, 8); ctx.fill();
      ctx.fillStyle = "#C4895A";
      roundRect(deckStart + 4, deckTop + 5, deckEnd - deckStart - 2, deckH - 10, 6); ctx.fill();
      // plank seams
      ctx.strokeStyle = "rgba(58,44,34,0.28)";
      ctx.lineWidth = 1.6;
      for (let x = deckStart + 22; x < deckEnd; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, deckTop + 8);
        ctx.lineTo(x, deckTop + deckH - 8);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(251,240,222,0.22)";
      ctx.lineWidth = 1.2;
      for (let y = deckTop + 22; y < deckTop + deckH - 10; y += 18) {
        ctx.beginPath();
        ctx.moveTo(deckStart + 10, y);
        ctx.lineTo(deckEnd - 4, y);
        ctx.stroke();
      }

      // rail posts along both sides of the deck
      for (let i = 0; i < 6; i++) {
        const px = deckStart + 16 + i * 20;
        [[deckTop + 4], [deckTop + deckH - 14]].forEach(([py]) => {
          ctx.fillStyle = "#6E5C49";
          roundRect(px - 3, py, 6, 12, 2); ctx.fill();
        });
      }
      // top rails
      ctx.strokeStyle = "#6E5C49";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(deckStart + 12, deckTop + 6);
      ctx.lineTo(deckEnd - 8, deckTop + 6);
      ctx.moveTo(deckStart + 12, deckTop + deckH - 6);
      ctx.lineTo(deckEnd - 8, deckTop + deckH - 6);
      ctx.stroke();

      // pier pilings along market edge (not blocking the deck mouth)
      for (let i = 0; i < 4; i++) {
        const ppy = top + 40 + i * 90;
        if (ppy > deckTop - 8 && ppy < deckTop + deckH + 8) continue;
        const ppx = waterX + 6;
        ctx.fillStyle = "rgba(20,40,50,0.2)";
        ctx.beginPath(); ctx.ellipse(ppx, ppy + 10, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#6E5C49";
        roundRect(ppx - 4, ppy - 14, 8, 20, 2); ctx.fill();
      }

      // boat moored at deck tip
      const boatX = deckEnd + 36;
      const boatY = deckMidY;
      ctx.save();
      ctx.translate(boatX, boatY + bob);
      ctx.rotate(-0.06);
      ctx.fillStyle = "rgba(20,40,50,0.22)";
      ctx.beginPath(); ctx.ellipse(0, 14, 34, 9, 0, 0, Math.PI * 2); ctx.fill();
      const hull = ctx.createLinearGradient(0, -12, 0, 16);
      hull.addColorStop(0, "#C4895A");
      hull.addColorStop(1, "#6E4530");
      ctx.fillStyle = hull;
      ctx.beginPath();
      ctx.moveTo(36, 0);
      ctx.quadraticCurveTo(20, 16, 0, 18);
      ctx.quadraticCurveTo(-20, 16, -32, 2);
      ctx.lineTo(-24, -9);
      ctx.lineTo(22, -9);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#E2D0B0";
      roundRect(-16, -11, 34, 11, 3); ctx.fill();
      ctx.fillStyle = "#3E7C74";
      roundRect(-7, -22, 16, 11, 3); ctx.fill();
      ctx.fillStyle = "#B8E4F5";
      roundRect(-3, -19, 5, 5, 1); ctx.fill();
      roundRect(3, -19, 5, 5, 1); ctx.fill();
      ctx.fillStyle = "#6E5C49";
      ctx.fillRect(-1, -44, 3, 26);
      ctx.fillStyle = "#FBF0DE";
      ctx.beginPath();
      ctx.moveTo(2, -42); ctx.lineTo(20, -20); ctx.lineTo(2, -14);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#D9705C";
      ctx.beginPath();
      ctx.moveTo(2, -44); ctx.lineTo(11, -40); ctx.lineTo(2, -36);
      ctx.closePath(); ctx.fill();
      ctx.restore();

      // short gangplank / mooring from deck tip to boat
      ctx.fillStyle = "#A9784F";
      roundRect(deckEnd - 2, deckMidY - 10, 28, 20, 3); ctx.fill();
      ctx.strokeStyle = "#D9C4A0";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(deckEnd + 4, deckMidY - 16);
      ctx.quadraticCurveTo(deckEnd + 18, deckMidY - 4, boatX - 20, boatY + bob);
      ctx.stroke();

      // channel buoy in water
      const by = top + 70 + Math.sin(t / 480) * 3;
      ctx.fillStyle = "#FBF0DE";
      ctx.beginPath(); ctx.arc(right - 36, by, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#D9705C";
      ctx.beginPath(); ctx.arc(right - 36, by, 7, Math.PI, 0); ctx.fill();

      // DECK sign on market side
      ctx.fillStyle = "#D98F2B";
      roundRect(waterX - 118, top + 10, 96, 22, 6); ctx.fill();
      ctx.fillStyle = "#FBF0DE";
      ctx.font = "800 12px Fraunces, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("BOAT DECK", waterX - 70, top + 25);

      // boarding pad at tip of wooden deck
      const portPulse = 0.14 + Math.sin(t / 480 + 1) * 0.07;
      ctx.fillStyle = `rgba(217,143,43,${portPulse})`;
      roundRect(deckEnd - 88, deckMidY - 18, 82, 36, 12); ctx.fill();
      ctx.fillStyle = "rgba(58,44,34,0.55)";
      ctx.font = "700 11px Nunito, sans-serif";
      ctx.fillText("Board boat", deckEnd - 47, deckMidY + 5);

      // seagull over water
      ctx.strokeStyle = "rgba(251,240,222,0.85)";
      ctx.lineWidth = 1.8;
      const gx = waterX + 50 + Math.sin(t / 1100) * 30;
      const gy = top + 24 + Math.cos(t / 900) * 5;
      const flap = Math.sin(t / 200) * 4;
      ctx.beginPath();
      ctx.moveTo(gx - 8, gy + flap);
      ctx.quadraticCurveTo(gx, gy - 4, gx + 8, gy + flap);
      ctx.stroke();

      // ---------- STAFF + VISITORS ----------
      if (typeof drawBuildingPatron === "function") {
        const staff = [
          { x: stallStart + 75, y: stallY + 42, skin: "#D9A066", outfit: "#3E7C74", hair: "#3A2417", name: "Reef" },
          { x: stallStart + 75 + stallW + stallGap, y: stallY + 42, skin: "#F0C08A", outfit: "#5A7FB0", hair: "#6B4423", name: "Nori" },
          { x: stallStart + 75 + 2 * (stallW + stallGap), y: stallY + 42, skin: "#F7D9B6", outfit: "#D98F2B", hair: "#B5651D", name: "Pearl" },
        ];
        staff.forEach((s, i) => {
          drawBuildingPatron(s.x, s.y, s.skin, s.outfit, s.hair, Math.sin(t / 520 + i) * 1.1);
          if (typeof drawNpcNameTag === "function") drawNpcNameTag(s.x, s.y - 24, s.name);
        });

        // dockhand on the wooden deck
        drawBuildingPatron(
          deckStart + 48,
          deckMidY + 8,
          "#B87A4B",
          "#6E5C49",
          "#111111",
          Math.sin(t / 480 + 2) * 1.2
        );
        if (typeof drawNpcNameTag === "function") {
          drawNpcNameTag(deckStart + 48, deckMidY - 16, "Jules");
        }

        const walk = Math.sin(t / 1800) * 40;
        drawBuildingPatron(
          left + 200 + walk,
          bottom - 90,
          "#F7D9B6",
          "#C45A7A",
          "#3A2417",
          Math.sin(t / 450) * 1.3
        );
        if (typeof drawNpcNameTag === "function") {
          drawNpcNameTag(left + 200 + walk, bottom - 114, "Kai");
        }
        drawBuildingPatron(
          left + 340 - walk * 0.6,
          bottom - 130,
          "#D9A066",
          "#8A6BAE",
          "#6B4423",
          Math.sin(t / 500 + 1.4) * 1.2
        );
        if (typeof drawNpcNameTag === "function") {
          drawNpcNameTag(left + 340 - walk * 0.6, bottom - 154, "Mira");
        }
      }
    },
  });
})();
