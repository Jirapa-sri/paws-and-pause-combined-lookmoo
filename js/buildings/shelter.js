/**
 * shelter building module — kennel facade (map) + warm adoption hall interior
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "shelter",
    info: {
      label: "Puppy Shelter",
      wall: "#D4C0D0",
      floor: "#E5D8C8",
      accent: "#8A5A8C",
      activity: "Visit puppies",
      blurb: "Soft beds, hopeful eyes, and animals who need real homes.",
    },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      const roundRect = api.roundRect;
      const acShadow = S.acShadow, acWoodWall = S.acWoodWall, acGableRoof = S.acGableRoof,
        acDoor = S.acDoor, acWindow = S.acWindow, acRoofSign = S.acRoofSign, acAwning = S.acAwning;

      ctx.save();
      ctx.translate(cx, cy);
      acShadow(82, 62);

      // side kennel wing
      acWoodWall(-72, 18, 36, 36, "#E8D8E4", true);
      ctx.fillStyle = "#8A5A8C";
      ctx.beginPath();
      ctx.moveTo(-76, 18); ctx.lineTo(-54, -6); ctx.lineTo(-32, 18);
      ctx.closePath(); ctx.fill();
      // kennel gate bars
      ctx.fillStyle = "#B8A0B8";
      roundRect(-66, 28, 24, 22, 2); ctx.fill();
      ctx.strokeStyle = "#6E5C49";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-62 + i * 6, 30);
        ctx.lineTo(-62 + i * 6, 48);
        ctx.stroke();
      }
      // tiny puppy in wing
      ctx.fillStyle = "#C9A574";
      ctx.beginPath(); ctx.ellipse(-54, 42, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-58, 38, 4, 0, Math.PI * 2); ctx.fill();

      // main hall
      acWoodWall(-40, 0, 100, 54, "#F1E3EC", true);
      acGableRoof(58, -46, 0, "#8A5A8C", "#A878B0");
      acAwning(-28, -6, 56, 12, "#D9A5C0");
      acDoor(-8, 20, 24, 32, "#6E5C49");
      acWindow(-32, 10, 16, 16);
      acWindow(20, 10, 16, 16);
      acRoofSign("ADOPT", -20, "#FBF0DE", "#8A5A8C");

      // heart window ornament
      ctx.fillStyle = "#D9705C";
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.bezierCurveTo(-9, -40, -16, -30, 0, -20);
      ctx.bezierCurveTo(16, -30, 9, -40, 0, -30);
      ctx.fill();

      // flower boxes
      [[-34, 28], [22, 28]].forEach(([fx, fy]) => {
        ctx.fillStyle = "#8C5A3B";
        roundRect(fx, fy + 14, 20, 8, 2); ctx.fill();
        ctx.fillStyle = "#D9705C";
        ctx.beginPath(); ctx.arc(fx + 6, fy + 12, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#E8A33D";
        ctx.beginPath(); ctx.arc(fx + 14, fy + 11, 3, 0, Math.PI * 2); ctx.fill();
      });

      // paw path
      ctx.fillStyle = "rgba(138,90,140,0.35)";
      [[-8, 58], [6, 62], [20, 58]].forEach(([px, py]) => {
        ctx.beginPath(); ctx.ellipse(px, py, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px - 4, py - 4, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + 4, py - 4, 2, 0, Math.PI * 2); ctx.fill();
      });

      ctx.restore();
    },

    drawInterior(ctx, api, t, cx, cy) {
      const roundRect = api.roundRect;
      const HOUSE = api.HOUSE;
      const drawBuildingPatron = api.drawBuildingPatron;
      const drawNpcNameTag = api.drawNpcNameTag;
      const drawBuildingPlant = api.drawBuildingPlant;
      const drawBuildingShelf = api.drawBuildingShelf;

      // soft wallpaper stripe
      ctx.fillStyle = "rgba(217,165,192,0.2)";
      for (let i = 0; i < 10; i++) {
        roundRect(HOUSE.x + 40 + i * 72, HOUSE.y + 55, 28, 90, 4); ctx.fill();
      }

      // rescue poster board (back wall) — live Soi Dog spotlight
      const rescueList = (typeof api.rescueBoardDogs === "function" ? api.rescueBoardDogs() : null) || [];
      const boardDogs = rescueList.slice(0, 4);
      while (boardDogs.length < 4) {
        boardDogs.push({
          name: ["Mai", "Plai", "Bua", "Nara"][boardDogs.length],
          id: "hope",
          colour: null,
        });
      }
      const paletteFn = typeof api.coatPalette === "function" ? api.coatPalette : null;
      const seedFn = typeof api.rescueSeed === "function" ? api.rescueSeed : (d) => String(d.name || "").length;
      const breedIdFn = typeof api.rescueBreedId === "function" ? api.rescueBreedId : null;
      const cutoutFn = typeof api.getBreedCutout === "function" ? api.getBreedCutout : null;
      const photoFn = typeof api.getRescuePhoto === "function" ? api.getRescuePhoto : null;
      const breedImgs = api.breedImages || {};

      function drawRescuePortrait(dog, dx, dy, dw, dh, opts){
        const natural = !!(opts && opts.natural);
        // Real photos only on the Animals needing homes wall cards — not kennel bed sprites
        const usePhoto = !natural && !!(opts && opts.photo);
        const photo = (usePhoto && photoFn) ? photoFn(dog) : null;
        const breedId = breedIdFn ? breedIdFn(dog) : "mixed-rescue";
        const cut = cutoutFn ? cutoutFn(breedId) : null;

        if(!natural){
          ctx.fillStyle = "#F7EFE6";
          roundRect(dx, dy, dw, dh, 6); ctx.fill();
        }

        // Soft sit-shadow under the pup
        ctx.fillStyle = "rgba(58,44,34,0.15)";
        ctx.beginPath();
        ctx.ellipse(dx + dw * 0.5, dy + dh * (natural ? 0.9 : 0.86), dw * (natural ? 0.32 : 0.28), dh * 0.09, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wall-board cards may show the real Soi Dog photo
        if(photo && photo.complete && photo.naturalWidth){
          try{
            ctx.save();
            roundRect(dx, dy, dw, dh, 6);
            ctx.clip();
            const iw = photo.naturalWidth;
            const ih = photo.naturalHeight;
            const scale = Math.max(dw / iw, dh / ih);
            const tw = iw * scale, th = ih * scale;
            const ox = dx + (dw - tw) / 2;
            const oy = dy + (dh - th) * 0.25;
            ctx.drawImage(photo, ox, oy, tw, th);
            ctx.restore();
            return true;
          } catch(err){
            try{ ctx.restore(); } catch(e){}
          }
        }

        if(cut && (cut.width || cut.naturalWidth)){
          const iw = cut.naturalWidth || cut.width || dw;
          const ih = cut.naturalHeight || cut.height || dh;
          const scale = natural
            ? Math.min(dw / iw, dh / ih) * 0.9
            : Math.min(dw / iw, dh / ih) * 1.05;
          const tw = iw * scale, th = ih * scale;
          const ox = dx + (dw - tw) / 2;
          const oy = dy + dh - th * (natural ? 0.96 : 0.9);
          if(!natural){
            ctx.save();
            roundRect(dx, dy, dw, dh, 6);
            ctx.clip();
            ctx.drawImage(cut, ox, oy, tw, th);
            ctx.restore();
          } else {
            ctx.drawImage(cut, ox, oy, tw, th);
          }
          return true;
        }

        // Fallback silhouette (no white plate) while photos/cutouts load
        const seed = seedFn(dog);
        const cols = paletteFn ? paletteFn(dog.colour, seed) : ["#C9A574", "#E8C49A", "#A9784F"];
        ctx.fillStyle = cols[0];
        ctx.beginPath(); ctx.ellipse(dx + dw * 0.52, dy + dh * 0.64, dw * 0.26, dh * 0.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(dx + dw * 0.44, dy + dh * 0.44, dw * 0.17, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = cols[2] || cols[0];
        ctx.beginPath(); ctx.ellipse(dx + dw * 0.34, dy + dh * 0.32, dw * 0.08, dh * 0.12, -0.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(dx + dw * 0.52, dy + dh * 0.3, dw * 0.08, dh * 0.12, 0.35, 0, Math.PI * 2); ctx.fill();
        return false;
      }

      ctx.fillStyle = "#FBF0DE";
      roundRect(HOUSE.x + 220, HOUSE.y + 70, 360, 95, 10); ctx.fill();
      ctx.strokeStyle = "#8A5A8C";
      ctx.lineWidth = 3;
      roundRect(HOUSE.x + 220, HOUSE.y + 70, 360, 95, 10); ctx.stroke();
      ctx.fillStyle = "#8A5A8C";
      ctx.font = "700 13px ui-rounded, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ANIMALS NEEDING HOMES", HOUSE.x + 400, HOUSE.y + 92);

      boardDogs.forEach((dog, i) => {
        const px = HOUSE.x + 245 + i * 82;
        const py = HOUSE.y + 105;
        ctx.fillStyle = "#fff";
        roundRect(px, py, 70, 48, 5); ctx.fill();
        drawRescuePortrait(dog, px + 3, py + 3, 34, 42, { natural: false, photo: true });
        ctx.fillStyle = "#8A5A8C";
        ctx.font = "700 8px ui-rounded, sans-serif";
        const label = String(dog.name || "Pup").slice(0, 9);
        ctx.fillText(label, px + 52, py + 22);
        ctx.fillStyle = "#6E5C49";
        ctx.font = "500 7px ui-rounded, sans-serif";
        const sub = dog.age ? String(dog.age).slice(0, 10) : (dog.id ? `♥ ${dog.id}` : "♥ hope");
        ctx.fillText(sub, px + 52, py + 36);
      });

      // supply shelf
      drawBuildingShelf(HOUSE.x + 48, HOUSE.y + 95, 70, 85, ["#E3998A", "#CFE1D2", "#D98F2B", "#D9A5C0"]);
      drawBuildingShelf(HOUSE.x + HOUSE.w - 118, HOUSE.y + 95, 70, 85, ["#8A5A8C", "#F1EDE4", "#D9705C", "#6FA79B"]);

      // hanging paw mobile
      const sway = Math.sin(t / 700) * 6;
      ctx.strokeStyle = "rgba(58,44,34,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(HOUSE.x + 160, HOUSE.y + 60);
      ctx.lineTo(HOUSE.x + 160 + sway, HOUSE.y + 95);
      ctx.stroke();
      ctx.fillStyle = "#D9A5C0";
      ctx.beginPath();
      ctx.ellipse(HOUSE.x + 160 + sway, HOUSE.y + 102, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      [[-8, -6], [8, -6], [-4, -12], [4, -12]].forEach(([ox, oy]) => {
        ctx.beginPath();
        ctx.arc(HOUSE.x + 160 + sway + ox, HOUSE.y + 102 + oy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // kennel pens — stylized breed cutouts only (no real photos)
      const penBeds = ["#E3998A", "#6FA79B", "#F1EDE4", "#D9705C"];
      boardDogs.slice(0, 4).forEach((dog, i) => {
        const px = HOUSE.x + [70, 230, 510, 670][i];
        const py = HOUSE.y + 290;
        const bob = Math.sin(t / 550 + i * 1.3) * 1.8;
        // pen frame
        ctx.fillStyle = "#E8DCC8";
        roundRect(px - 8, py - 20, 110, 95, 10); ctx.fill();
        ctx.fillStyle = penBeds[i];
        roundRect(px, py + 8, 94, 52, 16); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        roundRect(px + 10, py + 16, 74, 28, 12); ctx.fill();
        // gate bars
        ctx.strokeStyle = "rgba(58,44,34,0.35)";
        ctx.lineWidth = 2;
        for (let b = 0; b < 5; b++) {
          ctx.beginPath();
          ctx.moveTo(px + 8 + b * 18, py - 16);
          ctx.lineTo(px + 8 + b * 18, py + 8);
          ctx.stroke();
        }
        // food bowl
        ctx.fillStyle = "#C4895A";
        ctx.beginPath(); ctx.ellipse(px + 78, py + 48, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#E8A33D";
        ctx.beginPath(); ctx.ellipse(px + 78, py + 46, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
        // toy ball
        ctx.fillStyle = i % 2 ? "#6B8E6B" : "#5A7FB0";
        ctx.beginPath(); ctx.arc(px + 18, py + 48, 5, 0, Math.PI * 2); ctx.fill();

        // sit inside the bed cushion — game art only
        drawRescuePortrait(dog, px + 22, py + 4 + bob, 52, 52, { natural: true, photo: false });

        ctx.fillStyle = "#8A5A8C";
        ctx.font = "700 9px ui-rounded, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(dog.name || "pup").slice(0, 10), px + 47, py - 6);
      });

      drawBuildingPlant(HOUSE.x + 400, HOUSE.y + 200);
      drawBuildingPlant(HOUSE.x + 160, HOUSE.y + 210);
      drawBuildingPlant(HOUSE.x + HOUSE.w - 170, HOUSE.y + 210);

      // Nova + visitors
      drawBuildingPatron(cx + 40, cy - 28, "#F0C08A", "#8A5A8C", "#6B4423", Math.sin(t / 520) * 1);
      drawNpcNameTag(cx + 40, cy - 52, "Nova");
      drawBuildingPatron(HOUSE.x + 380, HOUSE.y + 400, "#D9A066", "#CFE1D2", "#3A2417", Math.sin(t / 470) * 1.2);
      drawNpcNameTag(HOUSE.x + 380, HOUSE.y + 376, "Mara");
      drawBuildingPatron(HOUSE.x + 160, HOUSE.y + 250, "#F7D9B6", "#E3998A", "#B5651D", Math.sin(t / 490) * 1.3);
      drawNpcNameTag(HOUSE.x + 160, HOUSE.y + 226, "Pip");
    },
  });
})();
