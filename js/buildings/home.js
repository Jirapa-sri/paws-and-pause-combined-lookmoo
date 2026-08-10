/**
 * home building module
 * Edit icon / colors / interior here without touching other buildings.
 */
(function () {
  const B = window.PawsBuildings;
  B.register({
    id: "home",
    info: { label:"Home", wall:"#E8D4B0", floor:"#E8D9C0", accent:"#B5654A", activity:"Rest", blurb:"Your cozy room." },
    drawIcon(ctx, api, cx, cy) {
      const S = B.shared; S.bind(api);
      const state = api.state || {};
      const dogs = Array.isArray(state.dogs) ? state.dogs : [];
      const playerName = String(state.playerName || "").trim();
      const roofByWallpaper = {
        sunny:"#C45A4A", sage:"#5A8A62", blush:"#C45A7A",
        sky:"#5A7FB0", lilac:"#8A6BAE",
      };
      const wallpaper = state.equipped && state.equipped.wallpaper;
      const roof = roofByWallpaper[wallpaper] || "#C45A4A";

      S.drawCottage(cx, cy, 1, roof, "#F3E2C4");

      ctx.save();
      ctx.translate(cx, cy);
      // A personal name board makes this cottage feel like the player's home.
      ctx.fillStyle = "#8C5A3B";
      api.roundRect(25, 35, 34, 17, 3); ctx.fill();
      ctx.fillStyle = "#FBF0DE";
      ctx.font = "700 6px ui-rounded, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const signText = playerName ? playerName.slice(0, 8).toUpperCase() : "HOME";
      ctx.fillText(signText, 42, 43.5);
      ctx.fillStyle = "#A9784F";
      ctx.fillRect(39.5, 52, 5, 10);

      // Once a puppy joins the family, its bowl and pawprints appear outside.
      if(dogs.length){
        ctx.fillStyle = "#D9705C";
        ctx.beginPath(); ctx.ellipse(-42, 55, 10, 4, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#F3DBAA";
        ctx.beginPath(); ctx.ellipse(-42, 53.5, 6, 2.2, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "rgba(107,68,35,0.48)";
        [[-25,55],[-15,48]].forEach(([x,y]) => {
          ctx.beginPath(); ctx.ellipse(x, y, 2.3, 1.8, 0, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(x-2.2, y-2.2, 0.9, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(x, y-2.8, 0.9, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(x+2.2, y-2.2, 0.9, 0, Math.PI*2); ctx.fill();
        });
      }
      ctx.restore();
    },

  });
})();
