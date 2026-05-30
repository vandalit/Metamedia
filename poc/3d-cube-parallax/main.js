import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js";

// ─── Renderer ────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ─── Scene ────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07070f);
scene.fog = new THREE.Fog(0x07070f, 7, 16);

// ─── Camera ───────────────────────────────────────────────────────────────────
// Camera sits at EYE_Z, rotation stays (0,0,0) — looks along -Z always.
// Each frame: position shifts by eye offset, projection matrix rebuilt asymmetrically.
// We never call lookAt or updateProjectionMatrix after the first frame.
const EYE_Z = 5;
const VFOV  = 55 * Math.PI / 180;
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 0, EYE_Z);

// ─── Input state ──────────────────────────────────────────────────────────────
const raw      = { x: 0, y: 0 };
const smoothed = { x: 0, y: 0 };
const MAX_EYE  = 1.1;   // world units, max eye displacement from center

// ─── Gyroscope state ──────────────────────────────────────────────────────────
const gyro = {
  active:    false,
  gamma:     0,
  beta:      90,   // phones held upright ≈ 90°
  baseGamma: 0,
  baseBeta:  90,
};
const GYRO_DEG = 22; // degrees = full parallax swing

// ─── Off-axis projection ──────────────────────────────────────────────────────
// The virtual screen lives at z=0. Eye is at (eyeX, eyeY, EYE_Z).
// Frustum is computed so that the screen edges stay fixed regardless of eye position —
// this is what creates the "window into a 3D world" illusion.
function applyOffAxis() {
  const aspect = window.innerWidth / window.innerHeight;
  const near   = camera.near;
  const far    = camera.far;

  const halfH = EYE_Z * Math.tan(VFOV / 2);
  const halfW = halfH * aspect;

  const eyeX = smoothed.x * MAX_EYE;
  const eyeY = smoothed.y * MAX_EYE;

  camera.position.set(eyeX, eyeY, EYE_Z);

  // Screen edges relative to eye → frustum bounds at near plane
  const l = near * (-halfW - eyeX) / EYE_Z;
  const r = near * ( halfW - eyeX) / EYE_Z;
  const t = near * ( halfH - eyeY) / EYE_Z;
  const b = near * (-halfH - eyeY) / EYE_Z;

  camera.projectionMatrix.makePerspective(l, r, t, b, near, far);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

// ─── Scene builders ───────────────────────────────────────────────────────────
function buildRoom() {
  const wallMat = new THREE.MeshLambertMaterial({ color: 0x111122, side: THREE.BackSide });
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), wallMat));

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(4, 4, 4)),
    new THREE.LineBasicMaterial({ color: 0x2233aa })
  );
  scene.add(edges);

  const floorGrid = new THREE.GridHelper(4, 8, 0x1a2266, 0x111133);
  floorGrid.position.y = -2;
  scene.add(floorGrid);

  const backGrid = new THREE.GridHelper(4, 8, 0x1a2266, 0x111133);
  backGrid.rotation.x = Math.PI / 2;
  backGrid.position.z = -2;
  scene.add(backGrid);
}

function wireGroup(geo, solidColor, wireColor, opacity = 0.4) {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    color: solidColor, transparent: true, opacity, shininess: 120,
  })));
  group.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: wireColor })
  ));
  return group;
}

function buildObjects() {
  // CENTER — z = 0 (mid-room)
  const cube = wireGroup(new THREE.BoxGeometry(0.8, 0.8, 0.8), 0x2244cc, 0x6699ff);
  scene.add(cube);

  // CLOSE — z = +1.5 (towards camera) → shifts the MOST with parallax
  const near = wireGroup(new THREE.OctahedronGeometry(0.22), 0xcc4422, 0xff8866);
  near.position.set(0.5, 0.3, 1.5);
  scene.add(near);

  // FAR — z = -1.5 (towards back wall) → shifts the LEAST
  const far = wireGroup(new THREE.TetrahedronGeometry(0.22), 0x22bb55, 0x66ff99, 0.5);
  far.position.set(-0.5, -0.2, -1.5);
  scene.add(far);

  return { cube, near, far };
}

function buildLights() {
  scene.add(new THREE.AmbientLight(0x223355, 2.0));
  const key = new THREE.DirectionalLight(0x7788ff, 2.5);
  key.position.set(2, 3, 4);
  key.castShadow = true;
  scene.add(key);
  const fill = new THREE.PointLight(0x4455cc, 2.0, 8);
  fill.position.set(-2, 1, 2);
  scene.add(fill);
}

// ─── Mouse ────────────────────────────────────────────────────────────────────
document.addEventListener("mousemove", (e) => {
  if (gyro.active) return;
  setChip("s-input", "mouse", "on");
  raw.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
  raw.y = -(e.clientY / window.innerHeight - 0.5) * 2;
});

// ─── Touch (drag) ─────────────────────────────────────────────────────────────
let touch0 = null;
document.addEventListener("touchstart", (e) => {
  if (gyro.active) return;
  touch0 = { cx: e.touches[0].clientX, cy: e.touches[0].clientY, rx: raw.x, ry: raw.y };
}, { passive: true });

document.addEventListener("touchmove", (e) => {
  if (gyro.active || !touch0) return;
  e.preventDefault();
  setChip("s-input", "touch", "on");
  const dx =  (e.touches[0].clientX - touch0.cx) / window.innerWidth  * 3;
  const dy = -(e.touches[0].clientY - touch0.cy) / window.innerHeight * 3;
  raw.x = Math.max(-1, Math.min(1, touch0.rx + dx));
  raw.y = Math.max(-1, Math.min(1, touch0.ry + dy));
}, { passive: false });

document.addEventListener("touchend", () => { touch0 = null; }, { passive: true });

// ─── Gyroscope ────────────────────────────────────────────────────────────────
function onOrientation(e) {
  if (!gyro.active || e.gamma === null) return;
  gyro.gamma = e.gamma;
  gyro.beta  = e.beta ?? 90;
  raw.x =  clamp((gyro.gamma - gyro.baseGamma) / GYRO_DEG, -1, 1);
  raw.y =  clamp(-(gyro.beta  - gyro.baseBeta)  / GYRO_DEG, -1, 1);
}

async function activateGyro() {
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    // iOS 13+ requires a user-gesture-triggered permission call
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res !== "granted") { setChip("s-gyro", "gyro: denied", "warn"); return; }
    } catch { setChip("s-gyro", "gyro: error", "warn"); return; }
  }

  window.addEventListener("deviceorientation", onOrientation);
  gyro.active = true;
  setChip("s-input", "gyro", "on");
  setChip("s-gyro", "gyro: on", "on");
  document.getElementById("btn-gyro").textContent = "Gyro ON";
  document.getElementById("btn-gyro").classList.add("active");
  document.getElementById("btn-cal").disabled = false;
  document.getElementById("hint").textContent =
    "Inclina el dispositivo · Calibra si el centro está desfasado";
}

function calibrate() {
  gyro.baseGamma = gyro.gamma;
  gyro.baseBeta  = gyro.beta;
  raw.x = 0; raw.y = 0;
  smoothed.x = 0; smoothed.y = 0;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function setChip(id, text, state) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = "chip " + state;
}

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

document.getElementById("btn-gyro").addEventListener("click", activateGyro);
document.getElementById("btn-cal").addEventListener("click", calibrate);

// ─── Resize ───────────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  // applyOffAxis() will rebuild the projection matrix next frame
});

// ─── Build ────────────────────────────────────────────────────────────────────
buildRoom();
buildLights();
const objs = buildObjects();

// ─── Loop ─────────────────────────────────────────────────────────────────────
let t = 0;
const LERP = 0.1;

function animate() {
  requestAnimationFrame(animate);
  t += 0.005;

  objs.cube.rotation.y = t * 0.35;
  objs.cube.rotation.x = Math.sin(t * 0.25) * 0.12;
  objs.near.rotation.y = t * 0.8;
  objs.near.rotation.z = t * 0.5;
  objs.far.rotation.x  = t * 0.4;
  objs.far.rotation.y  = t * 0.3;

  smoothed.x += (raw.x - smoothed.x) * LERP;
  smoothed.y += (raw.y - smoothed.y) * LERP;

  applyOffAxis();
  renderer.render(scene, camera);
}

animate();
