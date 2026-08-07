/**
 * Render KayKit GLTF models to transparent 2D PNGs (¾ top-down game view).
 * Uses local Chrome + three.js via puppeteer-core.
 */
import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_FURN = path.join(ROOT, "assets/kaykit/sprites/furniture");
const OUT_NAT = path.join(ROOT, "assets/kaykit/sprites/nature");

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const FURNITURE = {
  bed: "bed_single_A.gltf",
  cabinet: "cabinet_medium_decorated.gltf",
  wardrobe: "cabinet_medium.gltf",
  table: "table_medium.gltf",
  plant: "cactus_medium_A.gltf",
  rug: "rug_rectangle_stripes_A.gltf",
  chair: "chair_A.gltf",
  bookshelf: "shelf_B_large_decorated.gltf",
  floorlamp: "lamp_standing.gltf",
  nightstand: "cabinet_small_decorated.gltf",
  sofa: "couch_pillows.gltf",
  painting: "pictureframe_medium.gltf",
  mirror: "pictureframe_standing_A.gltf",
  desk: "table_medium_long.gltf",
  diydesk: "table_low.gltf",
  armchair: "armchair_pillows.gltf",
  toybox: "cabinet_small.gltf",
  dogbed: "pillow_A.gltf",
};

const NATURE = {
  tree1: "Tree_1_A_Color1.gltf",
  tree2: "Tree_2_A_Color1.gltf",
  tree3: "Tree_3_A_Color1.gltf",
  tree4: "Tree_4_A_Color1.gltf",
  bush1: "Bush_1_A_Color1.gltf",
  bush2: "Bush_2_A_Color1.gltf",
  bush3: "Bush_3_A_Color1.gltf",
  rock1: "Rock_1_A_Color1.gltf",
  rock2: "Rock_2_A_Color1.gltf",
  rock3: "Rock_3_A_Color1.gltf",
  grass1: "Grass_1_C_Color1.gltf",
  grass2: "Grass_2_C_Color1.gltf",
};

function startServer(root) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      if (urlPath === "/") urlPath = "/index.html";
      const filePath = path.join(root, urlPath.replace(/^\//, ""));
      if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const types = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".gltf": "model/gltf+json",
        ".bin": "application/octet-stream",
      };
      res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

const PAGE_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><style>
html,body{margin:0;background:transparent;overflow:hidden}
canvas{display:block}
</style></head><body>
<script type="importmap">
{
  "imports": {
    "three": "/node_modules/three/build/three.module.js",
    "three/addons/": "/node_modules/three/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const SIZE = 256;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setSize(SIZE, SIZE);
renderer.setPixelRatio(1);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
const hemi = new THREE.HemisphereLight(0xfff5e8, 0x6b8e6b, 1.15);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 1.05);
key.position.set(2.2, 4.5, 2.8);
scene.add(key);
const fill = new THREE.DirectionalLight(0xb8d4ff, 0.35);
fill.position.set(-2, 1.5, -1);
scene.add(fill);

const loader = new GLTFLoader();
let current = null;

function fitCamera(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);

  // ¾ / isometric-ish game angle
  const dist = Math.max(size.x, size.y, size.z) * 1.55 + 0.2;
  camera.position.set(dist * 0.85, dist * 1.05, dist * 0.95);
  camera.lookAt(0, size.y * 0.05, 0);
  const half = Math.max(size.x, size.z, size.y * 0.85) * 0.72;
  camera.left = -half;
  camera.right = half;
  camera.top = half;
  camera.bottom = -half;
  camera.near = 0.01;
  camera.far = dist * 6;
  camera.updateProjectionMatrix();
}

window.renderModel = async function(url) {
  if (current) {
    scene.remove(current);
    current.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        mats.forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
    current = null;
  }
  const gltf = await loader.loadAsync(url);
  current = gltf.scene;
  current.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = false;
      c.receiveShadow = false;
      if (c.material) {
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        mats.forEach((m) => {
          if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
          m.side = THREE.DoubleSide;
        });
      }
    }
  });
  scene.add(current);
  fitCamera(current);
  renderer.render(scene, camera);
  // second pass after textures settle
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL("image/png");
};

window.__ready = true;
</script></body></html>`;

async function main() {
  fs.mkdirSync(OUT_FURN, { recursive: true });
  fs.mkdirSync(OUT_NAT, { recursive: true });
  fs.writeFileSync(path.join(ROOT, "scripts/_kaykit_render.html"), PAGE_HTML);

  const { server, port } = await startServer(ROOT);
  const base = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox"],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  await page.goto(`${base}/scripts/_kaykit_render.html`, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => window.__ready === true);

  async function renderBatch(map, folder, outDir) {
    for (const [id, file] of Object.entries(map)) {
      const url = `${base}/assets/kaykit/${folder}/${file}`;
      process.stdout.write(`Rendering ${id}... `);
      try {
        const dataUrl = await page.evaluate(async (u) => window.renderModel(u), url);
        const b64 = dataUrl.split(",")[1];
        const out = path.join(outDir, `${id}.png`);
        fs.writeFileSync(out, Buffer.from(b64, "base64"));
        console.log("ok", out.replace(ROOT + "/", ""));
      } catch (err) {
        console.log("FAIL", err.message || err);
      }
    }
  }

  await renderBatch(FURNITURE, "furniture", OUT_FURN);
  await renderBatch(NATURE, "nature", OUT_NAT);

  await browser.close();
  server.close();

  // write manifest
  const manifest = {
    furniture: Object.fromEntries(Object.keys(FURNITURE).map((k) => [k, `sprites/furniture/${k}.png`])),
    nature: Object.fromEntries(Object.keys(NATURE).map((k) => [k, `sprites/nature/${k}.png`])),
  };
  fs.writeFileSync(path.join(ROOT, "assets/kaykit/manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("Done. Manifest written.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
