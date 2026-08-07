/**
 * Shared Animal Crossing–style drawing helpers for building modules.
 * Uses ctx from api when drawing — helpers close over api.ctx via bindHelpers().
 */
(function () {
  const B = window.PawsBuildings;
  if (!B) throw new Error("Load registry.js before shared.js");

  let ctx = null;
  let roundRect = null;

  function bind(api) {
    ctx = api.ctx;
    roundRect = api.roundRect;
  }

/* ---------- Animal Crossing–style buildings ---------- */
function acShadow(rx, ry){
  ctx.fillStyle = "rgba(58,44,34,0.16)";
  ctx.beginPath(); ctx.ellipse(0, ry || 62, rx || 70, 13, 0, 0, Math.PI*2); ctx.fill();
}
function acWoodWall(x, y, w, h, color, vertical){
  ctx.fillStyle = color;
  roundRect(x, y, w, h, 5); ctx.fill();
  ctx.strokeStyle = "rgba(58,44,34,0.12)";
  ctx.lineWidth = 1;
  if(vertical){
    for(let i = 1; i < 8; i++){
      const px = x + (w * i) / 8;
      ctx.beginPath(); ctx.moveTo(px, y + 3); ctx.lineTo(px, y + h - 3); ctx.stroke();
    }
  } else {
    for(let i = 1; i < 6; i++){
      const py = y + (h * i) / 6;
      ctx.beginPath(); ctx.moveTo(x + 3, py); ctx.lineTo(x + w - 3, py); ctx.stroke();
    }
  }
}
function acBrickWall(x, y, w, h, color){
  ctx.fillStyle = color;
  roundRect(x, y, w, h, 5); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1;
  for(let row = 0; row < 5; row++){
    const py = y + 8 + row * 10;
    const off = (row % 2) * 8;
    for(let col = 0; col < 7; col++){
      const px = x + 6 + off + col * 16;
      if(px + 12 < x + w - 4) ctx.strokeRect(px, py, 12, 7);
    }
  }
}
function acStoneWall(x, y, w, h, color){
  ctx.fillStyle = color;
  roundRect(x, y, w, h, 6); ctx.fill();
  ctx.strokeStyle = "rgba(58,44,34,0.14)";
  ctx.lineWidth = 1.2;
  [[10,12,28,18],[42,10,34,20],[20,34,40,16],[8,36,18,14],[55,36,22,14]].forEach(([ox,oy,bw,bh]) => {
    roundRect(x + ox, y + oy, bw, bh, 3); ctx.stroke();
  });
}
function acGableRoof(halfW, peakY, eaveY, color, trim){
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-halfW - 8, eaveY);
  ctx.lineTo(0, peakY);
  ctx.lineTo(halfW + 8, eaveY);
  ctx.lineTo(halfW, eaveY + 6);
  ctx.lineTo(0, peakY + 10);
  ctx.lineTo(-halfW, eaveY + 6);
  ctx.closePath(); ctx.fill();
  if(trim){
    ctx.fillStyle = trim;
    ctx.beginPath();
    ctx.moveTo(-halfW - 8, eaveY);
    ctx.lineTo(0, peakY);
    ctx.lineTo(halfW + 8, eaveY);
    ctx.lineTo(halfW + 4, eaveY + 3);
    ctx.lineTo(0, peakY + 5);
    ctx.lineTo(-halfW - 4, eaveY + 3);
    ctx.closePath(); ctx.fill();
  }
}
function acBlueMetalRoof(halfW, topY, botY){
  // Nook's Cranny–style bright blue corrugated roof
  ctx.fillStyle = "#4A9FE0";
  ctx.beginPath();
  ctx.moveTo(-halfW - 6, botY);
  ctx.lineTo(-halfW + 4, topY);
  ctx.lineTo(halfW - 4, topY);
  ctx.lineTo(halfW + 6, botY);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1.5;
  for(let i = -5; i <= 5; i++){
    const t = (i + 5) / 10;
    const x0 = -halfW + 8 + t * (halfW * 2 - 16);
    ctx.beginPath(); ctx.moveTo(x0, topY + 2); ctx.lineTo(x0 + 4, botY - 2); ctx.stroke();
  }
  ctx.fillStyle = "#3A7FB8";
  ctx.fillRect(-halfW - 6, botY - 2, halfW * 2 + 12, 5);
}
function acDoor(x, y, w, h, color, knob){
  ctx.fillStyle = color || "#8C5A3B";
  roundRect(x, y, w, h, 4); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  roundRect(x + 3, y + 3, w - 6, h * 0.28, 3); ctx.fill();
  ctx.fillStyle = knob || "#E8A33D";
  ctx.beginPath(); ctx.arc(x + w - 7, y + h * 0.55, 2.5, 0, Math.PI * 2); ctx.fill();
}
function acWindow(x, y, w, h, frame){
  ctx.fillStyle = frame || "#F5F0E4";
  roundRect(x - 2, y - 2, w + 4, h + 4, 3); ctx.fill();
  ctx.fillStyle = "#B8E4F5";
  roundRect(x, y, w, h, 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x + w/2, y); ctx.lineTo(x + w/2, y + h);
  ctx.moveTo(x, y + h/2); ctx.lineTo(x + w, y + h/2); ctx.stroke();
}
function acRoofSign(text, y, bg, fg){
  ctx.fillStyle = bg || "#FBF0DE";
  roundRect(-42, y, 84, 18, 4); ctx.fill();
  ctx.strokeStyle = "rgba(58,44,34,0.2)"; ctx.lineWidth = 1.5;
  roundRect(-42, y, 84, 18, 4); ctx.stroke();
  ctx.fillStyle = fg || "#C0483E";
  ctx.font = "700 10px ui-rounded, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, y + 9);
}
function acAwning(x, y, w, h, color){
  ctx.fillStyle = color;
  roundRect(x, y, w, h, 3); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  for(let i = 0; i < 5; i++) ctx.fillRect(x + 4 + i * (w/5), y + 2, w/10, h - 4);
}
function acRopeFence(y){
  ctx.strokeStyle = "#C9A574"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-58, y); ctx.quadraticCurveTo(0, y - 6, 58, y); ctx.stroke();
  ctx.fillStyle = "#A9784F";
  for(const px of [-55, -28, 0, 28, 55]){
    ctx.fillRect(px - 2.5, y - 2, 5, 14);
  }
}

function drawCottage(cx, cy, scale, roofColor, wallColor){
  // Player home — warm wood + soft gable (AC house vibe)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  acShadow(66, 62);
  acWoodWall(-52, -2, 104, 58, wallColor || "#F5E6C8", true);
  acGableRoof(56, -52, -2, roofColor || "#D96B5A", "#E8897A");
  acDoor(-12, 22, 24, 32, "#8C5A3B");
  acWindow(-40, 8, 18, 16);
  acWindow(22, 8, 18, 16);
  // flower boxes
  ctx.fillStyle = "#6B8E4E";
  roundRect(-42, 24, 22, 6, 2); ctx.fill();
  roundRect(20, 24, 22, 6, 2); ctx.fill();
  ctx.fillStyle = "#E3998A";
  ctx.beginPath(); ctx.arc(-34, 22, 3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(28, 22, 3, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

  B.shared = {
    bind,
    acShadow, acWoodWall, acBrickWall, acStoneWall, acGableRoof, acBlueMetalRoof,
    acDoor, acWindow, acRoofSign, acAwning, acRopeFence, drawCottage,
  };
})();
