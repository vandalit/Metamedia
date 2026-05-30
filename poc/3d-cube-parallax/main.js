import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js";

// ── show JS errors on screen (mobile has no devtools) ─────────────────────
window.addEventListener("error", (e) => {
  const el = document.getElementById("err");
  el.style.display = "block";
  el.textContent += (e.message || e) + "\n";
});
window.addEventListener("unhandledrejection", (e) => {
  const el = document.getElementById("err");
  el.style.display = "block";
  el.textContent += String(e.reason) + "\n";
});

// ── renderer ──────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ── scene ─────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08080f);

// ── camera ────────────────────────────────────────────────────────────────
// Sits at EYE_Z, always looks along -Z (rotation never changes).
// Each frame: position shifts by eye offset, projection matrix is rebuilt.
// NEVER call camera.updateProjectionMatrix() — it would overwrite our matrix.
const EYE_Z   = 5;
const VFOV_R  = 55 * Math.PI / 180;
const camera  = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 0, EYE_Z);
// camera.rotation stays (0,0,0) — default, looks along -Z

// ── state ─────────────────────────────────────────────────────────────────
const raw      = { x: 0, y: 0 };
const smoothed = { x: 0, y: 0 };
const MAX_EYE  = 1.8;  // world units — bigger = more dramatic parallax

// ── off-axis projection ───────────────────────────────────────────────────
// Virtual screen at z=0. Eye at (eyeX, eyeY, EYE_Z).
// Frustum edges keep the screen boundary fixed in world space,
// so the scene appears to be "behind" the physical display.
function applyOffAxis() {
  const aspect = window.innerWidth / window.innerHeight;
  const near = camera.near, far = camera.far;

  // Screen half-extents at z=0, derived from desired vertical FOV
  const halfH = EYE_Z * Math.tan(VFOV_R / 2);
  const halfW = halfH * aspect;

  const eyeX = smoothed.x * MAX_EYE;
  const eyeY = smoothed.y * MAX_EYE;

  camera.position.set(eyeX, eyeY, EYE_Z);
  // No lookAt — rotation stays (0,0,0)

  const l = near * (-halfW - eyeX) / EYE_Z;
  const r = near * ( halfW - eyeX) / EYE_Z;
  const t = near * ( halfH - eyeY) / EYE_Z;
  const b = near * (-halfH - eyeY) / EYE_Z;

  camera.projectionMatrix.makePerspective(l, r, t, b, near, far);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

// ── scene: room ───────────────────────────────────────────────────────────
// Individual planes with FrontSide so normals are unambiguous.
// Camera at z=5 sees: back wall, side walls, floor, ceiling. No front wall.
function buildRoom() {
  const mat = new THREE.MeshLambertMaterial({ color: 0x0f0f22 });

  const planes = [
    // back wall
    { geo: [6, 4],  pos: [0, 0, -2],  rot: [0, 0, 0] },
    // left wall
    { geo: [8, 4],  pos: [-3, 0, -1], rot: [0,  Math.PI/2, 0] },
    // right wall
    { geo: [8, 4],  pos: [ 3, 0, -1], rot: [0, -Math.PI/2, 0] },
    // floor
    { geo: [6, 8],  pos: [0, -2, -1], rot: [-Math.PI/2, 0, 0] },
    // ceiling
    { geo: [6, 8],  pos: [0,  2, -1], rot: [ Math.PI/2, 0, 0] },
  ];

  for (const p of planes) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(...p.geo), mat);
    m.position.set(...p.pos);
    m.rotation.set(...p.rot);
    scene.add(m);
  }

  // floor grid
  const grid = new THREE.GridHelper(6, 10, 0x1a2255, 0x0d1133);
  grid.position.set(0, -1.99, -1);
  scene.add(grid);

  // back wall grid
  const backGrid = new THREE.GridHelper(6, 10, 0x1a2255, 0x0d1133);
  backGrid.rotation.x = Math.PI / 2;
  backGrid.position.set(0, 0, -1.99);
  scene.add(backGrid);

  // room edge lines (depth cue)
  const corners = [
    // back-bottom-left to back-bottom-right
    [-3,-2,-2], [3,-2,-2],
    // back-top-left to back-top-right
    [-3,2,-2],  [3,2,-2],
    // left column
    [-3,-2,-2], [-3,2,-2],
    // right column
    [3,-2,-2],  [3,2,-2],
    // floor edges going forward
    [-3,-2,-2], [-3,-2, 3],
    [3,-2,-2],  [3,-2, 3],
    // ceiling edges going forward
    [-3,2,-2],  [-3,2, 3],
    [3,2,-2],   [3,2, 3],
  ];
  const pts = corners.map(c => new THREE.Vector3(...c));
  const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
  scene.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x223388 })));
}

// ── scene: objects at different depths ───────────────────────────────────
// Parallax is only visible when objects are at DIFFERENT Z depths.
// The eye shifting makes closer objects move MORE, farther objects move LESS.
function wireObj(geo, faceColor, wireColor) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    color: faceColor, transparent: true, opacity: 0.45, shininess: 150,
  })));
  g.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: wireColor })
  ));
  return g;
}

function buildObjects() {
  // VERY CLOSE  z = +2.5  (2.5 units from camera at z=5) — moves most
  const vClose = wireObj(new THREE.OctahedronGeometry(0.28), 0xdd3300, 0xff6644);
  vClose.position.set(-0.5, 0.2, 2.5);
  scene.add(vClose);

  // CLOSE  z = +1.0
  const close = wireObj(new THREE.BoxGeometry(0.5, 0.5, 0.5), 0x8833cc, 0xbb66ff);
  close.position.set(0.6, -0.3, 1.0);
  scene.add(close);

  // CENTER  z = 0  (the "virtual screen" plane — doesn't move at all)
  const center = wireObj(new THREE.BoxGeometry(0.9, 0.9, 0.9), 0x2244cc, 0x5577ff);
  scene.add(center);

  // FAR  z = -1.5
  const far = wireObj(new THREE.TetrahedronGeometry(0.28), 0x22aa55, 0x55ff88);
  far.position.set(-0.4, 0.3, -1.5);
  scene.add(far);

  // VERY FAR  z = -1.9 (near back wall)
  const vFar = wireObj(new THREE.IcosahedronGeometry(0.18), 0x55aaff, 0x88ccff);
  vFar.position.set(0.3, -0.2, -1.9);
  scene.add(vFar);

  return { vClose, close, center, far, vFar };
}

function buildLights() {
  scene.add(new THREE.AmbientLight(0x334466, 2.5));
  const key = new THREE.DirectionalLight(0x8899ff, 3);
  key.position.set(2, 4, 5);
  scene.add(key);
  const fill = new THREE.PointLight(0x4455cc, 2, 10);
  fill.position.set(-3, 2, 3);
  scene.add(fill);
}

// ── input: touch (absolute position — where finger is = eye direction) ───
document.addEventListener("touchmove", (e) => {
  if (gyro.active) return;
  e.preventDefault();
  chip("c-input", "touch", "ok");
  raw.x =  (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
  raw.y = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
}, { passive: false });

document.addEventListener("touchend", () => {
  if (gyro.active) return;
  // glide back to center on lift
  raw.x = 0; raw.y = 0;
}, { passive: true });

// ── input: mouse ──────────────────────────────────────────────────────────
document.addEventListener("mousemove", (e) => {
  if (gyro.active) return;
  chip("c-input", "mouse", "ok");
  raw.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
  raw.y = -(e.clientY / window.innerHeight - 0.5) * 2;
});

// ── input: gyroscope ──────────────────────────────────────────────────────
const gyro = {
  active: false, gamma: null, beta: null,
  baseGamma: 0, baseBeta: 90,
};
const GYRO_RANGE = 25; // degrees = full parallax range
let gyroListening = false;

function onOrientation(e) {
  if (e.gamma === null || e.gamma === undefined) return;
  gyro.gamma = e.gamma;
  gyro.beta  = e.beta ?? 90;

  if (!gyro.active) {
    // Probe: just record that the sensor is available
    chip("c-gyro", "gyro: disponible", "ok");
    document.getElementById("btn-gyro").textContent = "Usar giroscopio";
    return;
  }

  raw.x = clamp((gyro.gamma - gyro.baseGamma) / GYRO_RANGE, -1, 1);
  raw.y = clamp(-(gyro.beta - gyro.baseBeta)  / GYRO_RANGE, -1, 1);
}

function startListening() {
  if (gyroListening) return;
  gyroListening = true;
  window.addEventListener("deviceorientation", onOrientation);
}

async function activateGyro() {
  // iOS 13+ needs explicit permission from a user gesture
  if (typeof DeviceOrientationEvent?.requestPermission === "function") {
    let perm;
    try { perm = await DeviceOrientationEvent.requestPermission(); }
    catch (err) { chip("c-gyro", "gyro: error", "bad"); return; }
    if (perm !== "granted") { chip("c-gyro", "gyro: denegado", "bad"); return; }
  }

  startListening();
  gyro.active = true;
  gyro.baseGamma = gyro.gamma ?? 0;
  gyro.baseBeta  = gyro.beta  ?? 90;

  chip("c-input", "gyro", "ok");
  chip("c-gyro",  "gyro: activo", "ok");
  document.getElementById("btn-gyro").textContent = "Gyro ON";
  document.getElementById("btn-gyro").classList.add("ok");
  document.getElementById("btn-cal").disabled = false;
}

function calibrate() {
  gyro.baseGamma = gyro.gamma ?? 0;
  gyro.baseBeta  = gyro.beta  ?? 90;
  raw.x = 0; raw.y = 0; smoothed.x = 0; smoothed.y = 0;
}

// ── UI helpers ────────────────────────────────────────────────────────────
function chip(id, text, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = "chip " + (cls || "");
}

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

// update XY dot indicator and text values every frame
const xyDot  = document.getElementById("xy-dot");
const dbgTxt = document.getElementById("dbg-vals");
function updateDebugUI() {
  // dot: 0% = top-left, 50% = center, 100% = bottom-right
  const px = (smoothed.x * 0.5 + 0.5) * 100;
  const py = (-smoothed.y * 0.5 + 0.5) * 100;
  xyDot.style.left = px + "%";
  xyDot.style.top  = py + "%";

  const gStr = gyro.gamma !== null ? gyro.gamma.toFixed(1) + "°" : "—";
  const bStr = gyro.beta  !== null ? gyro.beta.toFixed(1)  + "°" : "—";
  dbgTxt.textContent =
    `x:${smoothed.x.toFixed(2)}  y:${smoothed.y.toFixed(2)}  γ:${gStr}  β:${bStr}`;
}

document.getElementById("btn-gyro").addEventListener("click", activateGyro);
document.getElementById("btn-cal").addEventListener("click", calibrate);

// ── resize ────────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  // applyOffAxis rebuilds the projection matrix next frame — no updateProjectionMatrix()
});

// ── probe gyro on load (no permission needed on Android) ─────────────────
// This detects availability before the user taps the button.
// On iOS, events won't fire here (needs requestPermission first) — that's expected.
startListening();
setTimeout(() => {
  if (gyro.gamma === null) {
    chip("c-gyro", "gyro: no detectado", "bad");
  }
}, 3000);

// ── build ─────────────────────────────────────────────────────────────────
buildRoom();
buildLights();
const objs = buildObjects();

// initial off-axis call so the scene isn't black for one frame
applyOffAxis();

// ── loop ──────────────────────────────────────────────────────────────────
let t = 0;
const LERP = 0.12;

function animate() {
  requestAnimationFrame(animate);
  t += 0.004;

  objs.center.rotation.y = t * 0.35;
  objs.center.rotation.x = Math.sin(t * 0.22) * 0.1;
  objs.vClose.rotation.y = t * 0.9;
  objs.vClose.rotation.z = t * 0.5;
  objs.close.rotation.x  = t * 0.6;
  objs.far.rotation.y    = t * 0.4;
  objs.vFar.rotation.x   = t * 0.3;

  smoothed.x += (raw.x - smoothed.x) * LERP;
  smoothed.y += (raw.y - smoothed.y) * LERP;

  applyOffAxis();
  updateDebugUI();
  renderer.render(scene, camera);
}

animate();
