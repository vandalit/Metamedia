import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js";

// ── errors on screen (mobile has no devtools) ─────────────────────────────
window.addEventListener("error", (e) => showErr(e.message));
window.addEventListener("unhandledrejection", (e) => showErr(String(e.reason)));
function showErr(msg) {
  const el = document.getElementById("err");
  el.style.display = "block";
  el.textContent += msg + "\n";
}

// ── renderer ──────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ── scene ─────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08080f);

// ── camera ────────────────────────────────────────────────────────────────
// Sits at EYE_Z, always looks along -Z (rotation stays 0,0,0).
// Each frame: position shifts by eye offset, projection matrix rebuilt.
// Never call camera.updateProjectionMatrix() — it would overwrite our matrix.
const EYE_Z      = 5;
const VFOV_R     = 55 * Math.PI / 180;
const DEPTH_NEAR =  3.0;  // front room cap  (z = +3, in front of screen plane)
const DEPTH_FAR  = -2.5;  // back wall       (z = -2.5)
const DEPTH_SPAN = DEPTH_NEAR - DEPTH_FAR;
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 0, EYE_Z);

// ── input state ───────────────────────────────────────────────────────────
const raw      = { x: 0, y: 0 };
const smoothed = { x: 0, y: 0 };

// ── gyro state ────────────────────────────────────────────────────────────
const gyro = {
  active:        false,
  source:        null,    // 'deviceorientation' | 'generic-sensor'
  sensor:        null,    // RelativeOrientationSensor instance (stored to stop() on deactivate)
  gamma:         null,    // degrees (debug display)
  beta:          null,
  baseGamma:     0,
  baseBeta:      90,
  receivedEvent: false,   // true once first valid sensor event arrives
};
const GYRO_RANGE    = 25; // degrees = full parallax swing
const SIN_HALF_GYRO = Math.sin(GYRO_RANGE * Math.PI / 360); // for generic sensor normalization
let   gyroListening = false;

// ── viewport-derived room dimensions ─────────────────────────────────────────
// Off-axis math ensures z=0 fills the viewport exactly → room opening = screen.
// Recomputed on resize; used by buildRoom() and applyOffAxis().
function computeViewport() {
  const aspect = window.innerWidth / window.innerHeight;
  const halfH  = EYE_Z * Math.tan(VFOV_R / 2);
  const halfW  = halfH * aspect;
  return { halfW, halfH, W: halfW * 2, H: halfH * 2 };
}
let VP        = computeViewport();
let roomGroup = null; // stored for dispose + rebuild on resize

// ── off-axis projection ───────────────────────────────────────────────────
// Virtual screen at z=0. Frustum bounds keep screen edges fixed in world
// space regardless of eye position → "window into a 3D world" illusion.
function applyOffAxis() {
  const aspect = window.innerWidth / window.innerHeight;
  const near = camera.near, far = camera.far;
  const halfH = EYE_Z * Math.tan(VFOV_R / 2);
  const halfW  = halfH * aspect;
  const maxEye = Math.min(halfW * 0.65, 1.5); // 65% of half-room width (was 50%), hard cap at 1.5
  const eyeX   = smoothed.x * maxEye;
  const eyeY   = smoothed.y * maxEye;
  camera.position.set(eyeX, eyeY, EYE_Z);
  const l = near * (-halfW - eyeX) / EYE_Z;
  const r = near * ( halfW - eyeX) / EYE_Z;
  const t = near * ( halfH - eyeY) / EYE_Z;
  const b = near * (-halfH - eyeY) / EYE_Z;
  camera.projectionMatrix.makePerspective(l, r, t, b, near, far);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

// ── room: rectangular grid (XZ plane; rotate for vertical walls) ─────────
function makeRectGrid(W, D, divW, divD, color, opacity) {
  const pts = [];
  for (let i = 0; i <= divW; i++) {
    const x = (i / divW) * W - W / 2;
    pts.push(new THREE.Vector3(x, 0, -D / 2), new THREE.Vector3(x, 0, D / 2));
  }
  for (let j = 0; j <= divD; j++) {
    const z = (j / divD) * D - D / 2;
    pts.push(new THREE.Vector3(-W / 2, 0, z), new THREE.Vector3(W / 2, 0, z));
  }
  return new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
}

// ── scene: room walls sized to viewport at z=0 ───────────────────────────
// Wall placement: ±halfW (sides), ±halfH (floor/ceiling), DEPTH_FAR (back).
// Grid division count = 1 cell per world unit for a legible coordinate system.
function buildRoom() {
  if (roomGroup) {
    scene.remove(roomGroup);
    roomGroup.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
  }
  roomGroup = new THREE.Group();

  const { halfW, halfH, W, H } = VP;
  const midZ    = (DEPTH_NEAR + DEPTH_FAR) / 2;
  const wallMat = new THREE.MeshLambertMaterial({ color: 0x080818 });

  const walls = [
    { size: [W,          H          ], pos: [0,      0,      DEPTH_FAR], rot: [0,           0, 0] }, // back
    { size: [DEPTH_SPAN, H          ], pos: [-halfW, 0,      midZ     ], rot: [0,  Math.PI/2, 0] }, // left
    { size: [DEPTH_SPAN, H          ], pos: [+halfW, 0,      midZ     ], rot: [0, -Math.PI/2, 0] }, // right
    { size: [W,          DEPTH_SPAN ], pos: [0,      -halfH, midZ     ], rot: [-Math.PI/2,   0, 0] }, // floor
    { size: [W,          DEPTH_SPAN ], pos: [0,      +halfH, midZ     ], rot: [+Math.PI/2,   0, 0] }, // ceiling
  ];
  for (const w of walls) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(...w.size), wallMat.clone());
    m.position.set(...w.pos); m.rotation.set(...w.rot);
    roomGroup.add(m);
  }

  // Grid: 1 cell per world unit
  const divW = Math.max(2, Math.round(W));
  const divH = Math.max(2, Math.round(H));
  const divD = Math.max(3, Math.round(DEPTH_SPAN));

  const floorGrid = makeRectGrid(W, DEPTH_SPAN, divW, divD, 0x1a2255, 0.35);
  floorGrid.position.set(0, -halfH + 0.005, midZ);
  roomGroup.add(floorGrid);

  const backWallGrid = makeRectGrid(W, H, divW, divH, 0x1a2255, 0.2);
  backWallGrid.rotation.x = Math.PI / 2; // rotate XZ → XY plane
  backWallGrid.position.set(0, 0, DEPTH_FAR + 0.005);
  roomGroup.add(backWallGrid);

  // Structural edges (4 corner depth lines + back wall perimeter)
  const edgePts = [
    [-halfW, -halfH, DEPTH_FAR], [-halfW, -halfH, DEPTH_NEAR],
    [+halfW, -halfH, DEPTH_FAR], [+halfW, -halfH, DEPTH_NEAR],
    [-halfW, +halfH, DEPTH_FAR], [-halfW, +halfH, DEPTH_NEAR],
    [+halfW, +halfH, DEPTH_FAR], [+halfW, +halfH, DEPTH_NEAR],
    [-halfW, -halfH, DEPTH_FAR], [+halfW, -halfH, DEPTH_FAR],
    [-halfW, +halfH, DEPTH_FAR], [+halfW, +halfH, DEPTH_FAR],
    [-halfW, -halfH, DEPTH_FAR], [-halfW, +halfH, DEPTH_FAR],
    [+halfW, -halfH, DEPTH_FAR], [+halfW, +halfH, DEPTH_FAR],
  ].map(c => new THREE.Vector3(...c));
  roomGroup.add(new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(edgePts),
    new THREE.LineBasicMaterial({ color: 0x223388, transparent: true, opacity: 0.5 })
  ));

  // Screen-plane rectangle (z=0) — the virtual window / "glass" boundary
  const screenPts = [
    [-halfW, -halfH, 0], [+halfW, -halfH, 0],
    [+halfW, -halfH, 0], [+halfW, +halfH, 0],
    [+halfW, +halfH, 0], [-halfW, +halfH, 0],
    [-halfW, +halfH, 0], [-halfW, -halfH, 0],
  ].map(c => new THREE.Vector3(...c));
  roomGroup.add(new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(screenPts),
    new THREE.LineBasicMaterial({ color: 0x3355aa, transparent: true, opacity: 0.45 })
  ));

  // Depth spine — z-axis at x=0, y=0 (main depth reference)
  roomGroup.add(new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, DEPTH_FAR),
      new THREE.Vector3(0, 0, DEPTH_NEAR),
    ]),
    new THREE.LineBasicMaterial({ color: 0x334499, transparent: true, opacity: 0.3 })
  ));

  scene.add(roomGroup);
}

function wireObj(geo, faceColor, wireColor) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    color: faceColor, transparent: true, opacity: 0.45, shininess: 150,
  })));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: wireColor })));
  return g;
}

function buildObjects() {
  // Positions expressed as fractions of half-room dimensions so they
  // stay proportional across portrait/landscape/any device viewport.
  const { halfW, halfH } = VP;
  const s = halfH * 0.1; // size unit = 10% of half-height

  const vClose = wireObj(new THREE.OctahedronGeometry(s * 0.85), 0xdd3300, 0xff6644);
  vClose.position.set(-halfW * 0.4,  halfH * 0.10,  2.5); scene.add(vClose); // z=+2.5 → moves most

  const close = wireObj(new THREE.BoxGeometry(s, s, s), 0x8833cc, 0xbb66ff);
  close.position.set( halfW * 0.4, -halfH * 0.15,  1.0); scene.add(close);   // z=+1.0

  const center = wireObj(new THREE.BoxGeometry(s * 2.2, s * 2.2, s * 2.2), 0x2244cc, 0x5577ff);
  center.position.set(0, 0, 0.4); scene.add(center);                          // z=+0.4 → slight foreground parallax

  const far = wireObj(new THREE.TetrahedronGeometry(s * 0.85), 0x22aa55, 0x55ff88);
  far.position.set(-halfW * 0.3,  halfH * 0.20, -1.5); scene.add(far);       // z=-1.5

  const vFar = wireObj(new THREE.IcosahedronGeometry(s * 0.6), 0x55aaff, 0x88ccff);
  vFar.position.set( halfW * 0.25, -halfH * 0.10, -1.9); scene.add(vFar);    // z=-1.9 → moves least

  return { vClose, close, center, far, vFar };
}

function buildLights() {
  scene.add(new THREE.AmbientLight(0x334466, 2.5));
  const key = new THREE.DirectionalLight(0x8899ff, 3);
  key.position.set(2, 4, 5); scene.add(key);
  const fill = new THREE.PointLight(0x4455cc, 2, 10);
  fill.position.set(-3, 2, 3);
  scene.add(fill);
}

// ── input: touch (absolute — where finger is = eye direction) ─────────────
document.addEventListener("touchmove", (e) => {
  if (gyro.active || (cam.active && cam.tracking)) return;
  e.preventDefault();
  chip("c-input", "touch", "ok");
  raw.x =  (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
  raw.y = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
}, { passive: false });

document.addEventListener("touchend", () => {
  if (!gyro.active && !(cam.active && cam.tracking)) { raw.x = 0; raw.y = 0; }
}, { passive: true });

// ── input: mouse ──────────────────────────────────────────────────────────
document.addEventListener("mousemove", (e) => {
  if (gyro.active || (cam.active && cam.tracking)) return;
  chip("c-input", "mouse", "ok");
  raw.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
  raw.y = -(e.clientY / window.innerHeight - 0.5) * 2;
});

document.addEventListener("mouseleave", () => {
  if (!gyro.active && !(cam.active && cam.tracking)) { raw.x = 0; raw.y = 0; }
});

// ── gyro: DeviceOrientationEvent handler ──────────────────────────────────
function onOrientation(e) {
  if (e.gamma === null || e.gamma === undefined) return;
  if (gyro.source === "generic-sensor") return; // generic sensor takes priority

  gyro.gamma = e.gamma;
  gyro.beta  = e.beta ?? 90;
  gyro.receivedEvent = true;

  if (!gyro.active) {
    // Probe: sensor is available, update chip before user activates
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

// ── gyro: Generic Sensor API (Chrome/Edge — may prompt in some browsers) ──
async function genericSensorPath() {
  if (!("RelativeOrientationSensor" in window)) return false;

  try {
    // Pre-check: if permissions are explicitly denied, skip immediately
    if ("permissions" in navigator) {
      const checks = await Promise.all([
        navigator.permissions.query({ name: "gyroscope" }).catch(() => null),
        navigator.permissions.query({ name: "accelerometer" }).catch(() => null),
      ]);
      if (checks.some(c => c?.state === "denied")) return false;
    }

    const sensor = new RelativeOrientationSensor({ frequency: 60, referenceFrame: "screen" });
    gyro.sensor = sensor;

    sensor.addEventListener("reading", () => {
      if (!gyro.active) return;
      const [qx, qy] = sensor.quaternion;
      // qy ≈ sin(gamma/2) for left-right tilt, qx ≈ sin(beta/2) for forward-back
      raw.x = clamp( qy / SIN_HALF_GYRO, -1, 1);
      raw.y = clamp(-qx / SIN_HALF_GYRO, -1, 1);
      gyro.gamma = +(qy * 2 * 180 / Math.PI).toFixed(1); // approx degrees
      gyro.beta  = +(90 - qx * 2 * 180 / Math.PI).toFixed(1);
      gyro.receivedEvent = true;
    });

    sensor.addEventListener("error", (e) => {
      if (e.error?.name === "SecurityError") showHelp("brave");
    });

    await sensor.start(); // may trigger permission dialog in Chrome/Edge
    gyro.source = "generic-sensor";
    gyro.active = true;
    setGyroActive();
    return true;

  } catch (e) {
    if (e.name === "SecurityError" || e.name === "NotAllowedError") return false;
    if (e.name === "NotSupportedError" || e instanceof ReferenceError) return false;
    return false;
  }
}

// ── gyro: activation — 3-layer strategy ──────────────────────────────────
async function activateGyro() {
  if (gyro.active) { deactivateGyro(); return; }
  const btn = document.getElementById("btn-gyro");
  btn.disabled = true;
  chip("c-gyro", "gyro: conectando…", "");

  // LAYER 1: iOS — all browsers use WebKit, requestPermission() works everywhere on iOS
  if (typeof DeviceOrientationEvent?.requestPermission === "function") {
    try {
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm === "granted") {
        startListening();
        gyro.source = "deviceorientation";
        gyro.active = true;
        gyro.baseGamma = gyro.gamma ?? 0;
        gyro.baseBeta  = gyro.beta  ?? 90;
        setGyroActive();
      } else {
        showHelp("ios-denied");
      }
    } catch { showHelp("generic"); }
    btn.disabled = false;
    return;
  }

  // LAYER 2: Generic Sensor API (Chrome/Edge Android — different code path from Shields)
  const usedGeneric = await genericSensorPath();
  if (usedGeneric) { btn.disabled = false; return; }

  // LAYER 3: DeviceOrientationEvent direct (Chrome/Firefox Android auto-grant)
  startListening();
  gyro.source = "deviceorientation";
  gyro.active = true;

  // Wait 2.5s to confirm events are arriving
  setTimeout(async () => {
    btn.disabled = false;
    if (!gyro.receivedEvent) {
      gyro.active = false;
      gyro.source = null;
      const brave = await detectBrave();
      showHelp(brave ? "brave" : "generic");
    } else {
      gyro.baseGamma = gyro.gamma ?? 0;
      gyro.baseBeta  = gyro.beta  ?? 90;
      setGyroActive();
    }
  }, 2500);
}

function setGyroActive() {
  chip("c-input", "gyro", "ok");
  chip("c-gyro",  "gyro: activo", "ok");
  const btn = document.getElementById("btn-gyro");
  btn.textContent = "Gyro ON";
  btn.classList.add("ok");
  document.getElementById("btn-cal").disabled = false;
}

function deactivateGyro() {
  gyro.active = false;
  if (gyro.source === "generic-sensor") { gyro.sensor?.stop(); gyro.sensor = null; }
  gyro.source = null;
  raw.x = 0; raw.y = 0;
  chip("c-gyro",  "gyro: off", "");
  if (!cam.active) chip("c-input", "input: —", "dim");
  const btn = document.getElementById("btn-gyro");
  btn.textContent = gyro.receivedEvent ? "Usar giroscopio" : "Giroscopio";
  btn.classList.remove("ok");
  document.getElementById("btn-cal").disabled = true;
}

function calibrate() {
  gyro.baseGamma = gyro.gamma ?? 0;
  gyro.baseBeta  = gyro.beta  ?? 90;
  raw.x = 0; raw.y = 0; smoothed.x = 0; smoothed.y = 0;
}

// ── Brave detection ───────────────────────────────────────────────────────
// Brave doesn't include "Brave" in UA — this is the only reliable detection.
async function detectBrave() {
  try { return !!(navigator.brave && await navigator.brave.isBrave()); }
  catch { return false; }
}

// ── help overlay ──────────────────────────────────────────────────────────
const HELP = {
  "brave": {
    title: '<i class="fas fa-shield-halved"></i> Brave bloqueó los sensores',
    steps: [
      "Toca el ícono del León en la barra de direcciones",
      'Busca "Bloquear sensores" y desactívalo para este sitio',
      "Alternativa: Ajustes → Config. del sitio → Sensores → Permitir",
      "Recarga la página y presiona Reintentar",
    ],
  },
  "ios-denied": {
    title: '<i class="fas fa-mobile-screen-button"></i> Permiso denegado — iOS',
    steps: [
      "Abre Configuración del iPhone / iPad",
      "Busca el navegador que estás usando (Safari, Chrome…)",
      'Activa "Movimiento y orientación"',
      "Vuelve aquí y presiona Reintentar",
    ],
  },
  "generic": {
    title: '<i class="fas fa-circle-exclamation"></i> Sensores no disponibles',
    steps: [
      "Tu navegador o configuración bloquea los sensores de movimiento",
      "Prueba abriendo esta página en Chrome para Android",
      "También puedes usar el control táctil — toca y arrastra",
    ],
  },
};

function showHelp(type) {
  const h = HELP[type] || HELP["generic"];
  document.getElementById("help-title").innerHTML = h.title;
  const stepsEl = document.getElementById("help-steps");
  stepsEl.innerHTML = h.steps.map((s, i) => `
    <div class="help-step">
      <div class="step-num">${i + 1}</div>
      <div class="step-text">${s}</div>
    </div>`).join("");
  document.getElementById("help-overlay").classList.add("show");
  chip("c-gyro", `gyro: ${type}`, "bad");
}

document.getElementById("help-retry").addEventListener("click", () => {
  document.getElementById("help-overlay").classList.remove("show");
  chip("c-gyro", "gyro: detectando…", "");
  document.getElementById("btn-gyro").disabled = false;
  activateGyro();
});

document.getElementById("help-touch").addEventListener("click", () => {
  document.getElementById("help-overlay").classList.remove("show");
  chip("c-gyro", "gyro: off", "");
  chip("c-input", "touch", "ok");
});

// ── camera module ─────────────────────────────────────────────────────────
// MediaPipe FaceLandmarker — runs fully in browser via WebAssembly.
// No native app needed. Lazy-loaded only when user opens the panel.

const MEDIAPIPE_VERSION = "0.10.14";
const WASM_PATH  = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_PATH = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const HEAD_YAW_RANGE   = 14; // degrees yaw  = full parallax (was 22 — natural movement is 3-8°)
const HEAD_PITCH_RANGE = 12; // degrees pitch = full parallax (was 18)

const cam = {
  panelOpen:  false,
  loading:    false,    // MediaPipe download in progress (guard against concurrent calls)
  active:     false,    // camera stream running
  tracking:   false,    // face currently detected
  video:      null,     // <video> element
  canvas:     null,     // overlay <canvas>
  ctx:        null,     // 2D context
  stream:     null,     // MediaStream
  landmarker: null,     // FaceLandmarker instance
  lastProcess:   0,
  lastVideoTime: 0,     // last video.currentTime processed (avoids re-processing same frame)
  detectMs:      0,     // performance.now() when last detection completed (latency probe)
  calibYaw:   0,        // baseline yaw for calibration
  calibPitch: 0,
  lastYaw:    0,        // last computed yaw (degrees, stored for diagram)
  lastPitch:  0,        // last computed pitch (degrees, stored for diagram)
};

// Panel drag + toggle — pointer capture lets drag work on touch and mouse.
// Movement > 5px = drag (repositions panel); smaller = click (toggle open/closed).
{
  const panel  = document.getElementById("cam-panel");
  const header = document.getElementById("cam-header");
  let drag = null; // { startX, startY, startLeft, startTop, moved }

  header.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, #cam-st")) return;
    const rect = panel.getBoundingClientRect();
    panel.style.right = "auto";
    panel.style.left  = rect.left + "px";
    panel.style.top   = rect.top  + "px";
    drag = { startX: e.clientX, startY: e.clientY,
             startLeft: rect.left, startTop: rect.top, moved: false };
    header.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  header.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
    if (!drag.moved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) drag.moved = true;
    if (drag.moved) {
      header.style.cursor = "grabbing";
      const maxX = window.innerWidth  - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;
      panel.style.left = Math.max(0, Math.min(maxX, drag.startLeft + dx)) + "px";
      panel.style.top  = Math.max(0, Math.min(maxY, drag.startTop  + dy)) + "px";
    }
  });

  const endDrag = () => {
    if (!drag) return;
    header.style.cursor = "";
    if (!drag.moved) {
      cam.panelOpen = !cam.panelOpen;
      panel.classList.toggle("open", cam.panelOpen);
      if (cam.panelOpen && !cam.landmarker) initMediaPipe();
    }
    drag = null;
  };
  header.addEventListener("pointerup",     endDrag);
  header.addEventListener("pointercancel", endDrag);
}

// Lazy-load MediaPipe — only downloads WASM + model when panel is opened
async function initMediaPipe() {
  if (cam.loading || cam.landmarker) return;
  cam.loading = true;
  setCamSt("cargando…", "");
  camStats("descargando modelo (~3 MB)…");
  try {
    const { FaceLandmarker, FilesetResolver } = await import(
      `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/vision_bundle.mjs`
    );
    const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
    cam.landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_PATH, delegate: "GPU" },
      outputFacialTransformationMatrixes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    });
    document.getElementById("cam-loading").style.display = "none";
    setCamSt("listo", "");
    camStats("presiona Activar para iniciar");
    document.getElementById("btn-cam-on").disabled = false;
  } catch (e) {
    setCamSt("error", "bad");
    camStats("error al cargar MediaPipe");
    showErr("MediaPipe: " + e.message);
  } finally {
    cam.loading = false;
  }
}

async function activateCamera() {
  if (cam.active) { stopCamera(); return; }
  setCamSt("permiso…", "");
  try {
    cam.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
  } catch (e) {
    setCamSt("denegado", "bad");
    camStats("permiso de cámara denegado");
    return;
  }

  cam.video  = document.getElementById("camv");
  cam.canvas = document.getElementById("camc");
  cam.ctx    = cam.canvas.getContext("2d");
  cam.canvas.width  = 176;
  cam.canvas.height = 132;

  cam.video.srcObject = cam.stream;
  await cam.video.play();

  cam.active = true;
  setCamSt("activo", "ok");
  chip("c-cam", "cam: on", "ok");
  document.getElementById("btn-cam-on").textContent = "Detener";
  document.getElementById("btn-cam-cal").disabled = false;
  const barBtnOn = document.getElementById("btn-cam-bar");
  barBtnOn.textContent = "Cam ON";
  barBtnOn.classList.add("ok");
  camStats("detectando cara…");
}

function stopCamera() {
  cam.stream?.getTracks().forEach(t => t.stop());
  if (cam.video) cam.video.srcObject = null;
  cam.active   = false;
  cam.tracking = false;
  cam.ctx?.clearRect(0, 0, 176, 132);
  setCamSt("off", "");
  chip("c-cam", "cam: off", "dim");
  if (gyro.active) chip("c-input", "gyro", "ok");
  else chip("c-input", "input: —", "dim");
  document.getElementById("btn-cam-on").textContent = "Activar";
  document.getElementById("btn-cam-cal").disabled = true;
  const barBtnOff = document.getElementById("btn-cam-bar");
  barBtnOff.textContent = "Cámara";
  barBtnOff.classList.remove("ok");
  camStats("—");
}

// Called every frame when camera is active (~30fps cap)
function processFrame() {
  if (!cam.video || cam.video.readyState < 2 || !cam.landmarker) return;

  const now = performance.now();
  const results = cam.landmarker.detectForVideo(cam.video, now);
  cam.detectMs = performance.now(); // timestamp detection completion for lag probe
  cam.ctx.clearRect(0, 0, 176, 132);

  if (!results.faceLandmarks?.length) {
    cam.tracking = false;
    camStats("sin cara detectada");
    if (gyro.active) chip("c-input", "gyro", "ok");
    else chip("c-input", "input: —", "dim");
    return;
  }

  const landmarks = results.faceLandmarks[0];
  drawLandmarks(landmarks);

  // Head pose via facial transformation matrix (yaw/pitch without calibration step)
  const mData = results.facialTransformationMatrixes?.[0]?.data;
  if (mData) {
    // Column-major 4×4: m[8]=R02, m[9]=R12, m[10]=R22 → ZYX euler
    const rawYaw   = Math.atan2(mData[8], mData[10]) * 180 / Math.PI;
    const rawPitch = Math.asin(-Math.max(-1, Math.min(1, mData[9]))) * 180 / Math.PI;

    const yaw   = rawYaw   - cam.calibYaw;
    const pitch = rawPitch - cam.calibPitch;

    cam.lastYaw   = yaw;   // stored for diagram panel
    cam.lastPitch = pitch;

    // Camera overrides gyro/touch when tracking
    raw.x = clamp(-yaw   / HEAD_YAW_RANGE,   -1, 1);
    raw.y = clamp( pitch / HEAD_PITCH_RANGE,  -1, 1);

    cam.tracking = true;
    camStats(`yaw:${yaw.toFixed(1)}° pitch:${pitch.toFixed(1)}°`);
    chip("c-input", "face", "ok");
  } else {
    // Fallback: nose tip relative position
    const nose = landmarks[1];
    raw.x = clamp(-(nose.x - 0.5) / 0.15, -1, 1);
    raw.y = clamp(-(nose.y - 0.5) / 0.12, -1, 1);
    cam.tracking = true;
    camStats(`nose x:${nose.x.toFixed(2)} y:${nose.y.toFixed(2)}`);
  }
}

function drawLandmarks(lm) {
  const ctx = cam.ctx;
  const W = 176, H = 132;
  // Sparse dots (every 25th landmark)
  ctx.fillStyle = "rgba(80,200,140,0.55)";
  for (let i = 0; i < lm.length; i += 25) {
    ctx.beginPath();
    ctx.arc(lm[i].x * W, lm[i].y * H, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Highlighted nose tip
  ctx.fillStyle = "#ff4466";
  ctx.beginPath();
  ctx.arc(lm[1].x * W, lm[1].y * H, 4, 0, Math.PI * 2);
  ctx.fill();
}

function calibrateCamera() {
  if (!cam.landmarker || !cam.video || cam.video.readyState < 2) return;
  const results = cam.landmarker.detectForVideo(cam.video, performance.now());
  if (!results.facialTransformationMatrixes?.length) return;
  const mData = results.facialTransformationMatrixes[0].data;
  cam.calibYaw   = Math.atan2(mData[8], mData[10]) * 180 / Math.PI;
  cam.calibPitch = Math.asin(-Math.max(-1, Math.min(1, mData[9]))) * 180 / Math.PI;
  raw.x = 0; raw.y = 0; smoothed.x = 0; smoothed.y = 0;
}

function setCamSt(text, cls) {
  const el = document.getElementById("cam-st");
  el.textContent = text;
  el.className   = cls;
}
function camStats(text) {
  document.getElementById("cam-stats").textContent = text;
}

document.getElementById("btn-cam-on").addEventListener("click", activateCamera);
document.getElementById("btn-cam-on").disabled = true; // enabled after MediaPipe loads
document.getElementById("btn-cam-cal").addEventListener("click", calibrateCamera);

// Bottom-bar quick-activate: opens panel + loads model + starts camera in one tap
async function quickCam() {
  if (cam.active) { stopCamera(); return; }
  if (!cam.panelOpen) {
    cam.panelOpen = true;
    document.getElementById("cam-panel").classList.add("open");
  }
  if (!cam.landmarker && !cam.loading) await initMediaPipe();
  if (cam.landmarker) activateCamera();
}
document.getElementById("btn-cam-bar").addEventListener("click", quickCam);

// ── diagram / spatial panel ──────────────────────────────────────────────
// Top-down (X-Z) view of the virtual space. Only values actually computed
// by the system are displayed — no invented distances or estimates.

const diag = { panelOpen: false };
const DIAG_W = 244, DIAG_H = 194;

{
  const panel  = document.getElementById("diag-panel");
  const header = document.getElementById("diag-header");
  let drag = null;

  header.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, #diag-st")) return;
    const rect = panel.getBoundingClientRect();
    panel.style.left = rect.left + "px";
    panel.style.top  = rect.top  + "px";
    drag = { startX: e.clientX, startY: e.clientY,
             startLeft: rect.left, startTop: rect.top, moved: false };
    header.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  header.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
    if (!drag.moved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) drag.moved = true;
    if (drag.moved) {
      header.style.cursor = "grabbing";
      const maxX = window.innerWidth  - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;
      panel.style.left = Math.max(0, Math.min(maxX, drag.startLeft + dx)) + "px";
      panel.style.top  = Math.max(0, Math.min(maxY, drag.startTop  + dy)) + "px";
    }
  });

  const endDiagDrag = () => {
    if (!drag) return;
    header.style.cursor = "";
    if (!drag.moved) {
      diag.panelOpen = !diag.panelOpen;
      panel.classList.toggle("open", diag.panelOpen);
      document.getElementById("diag-st").textContent = diag.panelOpen ? "live" : "off";
      document.getElementById("diag-st").className   = diag.panelOpen ? "live" : "";
    }
    drag = null;
  };
  header.addEventListener("pointerup",     endDiagDrag);
  header.addEventListener("pointercancel", endDiagDrag);
}

function drawDiagram() {
  const canvas = document.getElementById("diagc");
  const ctx    = canvas.getContext("2d");
  ctx.clearRect(0, 0, DIAG_W, DIAG_H);

  const { halfW } = VP;
  const maxEye = Math.min(halfW * 0.65, 1.5);
  const eyeX   = smoothed.x * maxEye; // actual current eye X in world units

  // Z-axis mapping: zMin (back wall) → bottom of canvas, EYE_Z → top
  const zMin   = DEPTH_FAR - 0.5;
  const zMax   = EYE_Z + 0.5;
  const zRange = zMax - zMin;
  // X-axis mapping: ±halfW with 30% margin
  const xHalf  = halfW * 1.3;
  const xRange = xHalf * 2;

  const wx = (x) => ((x + xHalf) / xRange) * DIAG_W;
  const wz = (z) => (1 - (z - zMin) / zRange) * DIAG_H;

  const screenY = wz(0);        // z=0 screen plane
  const backY   = wz(DEPTH_FAR);
  const eyeZY   = wz(EYE_Z);
  const wallL   = wx(-halfW);
  const wallR   = wx(+halfW);

  // Zone fills
  ctx.fillStyle = "rgba(175,182,210,0.055)";
  ctx.fillRect(0, 0, DIAG_W, screenY);           // real zone (above screen)
  ctx.fillStyle = "rgba(88,108,185,0.07)";
  ctx.fillRect(0, screenY, DIAG_W, DIAG_H);      // virtual zone (below screen)

  // Room wall bounds (dashed verticals)
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = "rgba(100,118,185,0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(wallL, 0); ctx.lineTo(wallL, DIAG_H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(wallR, 0); ctx.lineTo(wallR, DIAG_H); ctx.stroke();
  ctx.setLineDash([]);

  // Back wall
  ctx.strokeStyle = "rgba(100,118,185,0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(wallL, backY); ctx.lineTo(wallR, backY); ctx.stroke();

  // Screen line (z=0) — the virtual window
  ctx.strokeStyle = "rgba(215,220,240,0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, screenY); ctx.lineTo(DIAG_W, screenY); ctx.stroke();

  // Zone + depth labels
  ctx.font = "8px monospace";
  ctx.fillStyle = "rgba(145,158,205,0.45)";
  ctx.fillText("REAL", 4, screenY - 5);
  ctx.fillText("VIRTUAL", 4, screenY + 11);
  ctx.fillStyle = "rgba(165,175,215,0.35)";
  ctx.fillText("z=0", wallR + 3, screenY + 4);
  ctx.fillText(`z=${DEPTH_FAR}`, wallR + 3, backY + 4);
  ctx.fillText(`z=+${DEPTH_NEAR}`, wallR + 3, wz(DEPTH_NEAR) + 4);

  // Objects at their world (x, z) — colors match their wireframe in the scene
  const sceneObjs = [
    { x: -halfW * 0.4,  z: 2.5,  r: 4.5, color: "rgba(255,138,98,0.88)"  }, // vClose orange
    { x:  halfW * 0.4,  z: 1.0,  r: 3.5, color: "rgba(178,138,255,0.88)" }, // close purple
    { x:  0,            z: 0.4,  r: 5,   color: "rgba(128,158,255,0.88)" }, // center blue
    { x: -halfW * 0.3,  z: -1.5, r: 3.5, color: "rgba(118,218,158,0.88)" }, // far green
    { x:  halfW * 0.25, z: -1.9, r: 3,   color: "rgba(138,198,255,0.88)" }, // vFar sky
  ];
  for (const o of sceneObjs) {
    ctx.fillStyle = o.color;
    ctx.beginPath();
    ctx.arc(wx(o.x), wz(o.z), o.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eye / head circle — positioned at (eyeX, EYE_Z) in world
  const headX = wx(eyeX);
  const headY = eyeZY;
  const tracking = cam.active && cam.tracking;
  const noFace   = cam.active && !cam.tracking;
  const headOpacity = tracking ? 1 : (noFace ? 0.25 : 0.55);

  // Direction line from head toward screen center (z=0, x=0)
  ctx.strokeStyle = `rgba(195,208,255,${headOpacity * 0.4})`;
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.moveTo(headX, headY);
  ctx.lineTo(wx(0), screenY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Head circle fill + stroke
  ctx.fillStyle   = `rgba(195,200,220,${headOpacity * 0.13})`;
  ctx.strokeStyle = `rgba(195,200,225,${headOpacity * 0.52})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(headX, headY, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Yaw indicator inside head circle when tracking
  if (tracking && cam.lastYaw !== 0) {
    const yawRad = (-cam.lastYaw / HEAD_YAW_RANGE) * (Math.PI / 2.2);
    ctx.strokeStyle = "rgba(190,205,255,0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(headX, headY);
    ctx.lineTo(headX + Math.sin(yawRad) * 11, headY + Math.cos(yawRad) * 7);
    ctx.stroke();
  }

  // "no face" indicator
  if (noFace) {
    ctx.fillStyle = "rgba(255,160,100,0.55)";
    ctx.font = "8px monospace";
    ctx.fillText("sin cara", headX - 16, headY - 14);
  }

  // Eye X offset marker on screen line (where eye projects to z=0)
  const eyeProjX = wx(0); // at z=0 projection from eye hits screen center (off-axis keeps z=0 fixed)
  ctx.fillStyle = "rgba(195,208,255,0.6)";
  ctx.beginPath();
  ctx.arc(wx(eyeX * 0), screenY, 2.5, 0, Math.PI * 2); // eye position projected on screen = always center
  ctx.fill();

  // Stats
  const maxE = maxEye.toFixed(2);
  let statsStr = `eyeX:${eyeX.toFixed(2)}u  maxEye:${maxE}u  x:${smoothed.x.toFixed(2)}`;
  if (tracking) statsStr += `  yaw:${cam.lastYaw.toFixed(1)}°`;
  document.getElementById("diag-stats").textContent = statsStr;
}

// ── UI helpers ────────────────────────────────────────────────────────────
function chip(id, text, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = "chip" + (cls ? " " + cls : "");
}
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

document.getElementById("btn-gyro").addEventListener("click", activateGyro);
document.getElementById("btn-cal").addEventListener("click", calibrate);

// ── debug display (every frame) ───────────────────────────────────────────
const xyDot  = document.getElementById("xy-dot");
const dbgTxt = document.getElementById("dbg-vals");
function updateDebug() {
  xyDot.style.left = (smoothed.x * 0.5 + 0.5) * 100 + "%";
  xyDot.style.top  = (-smoothed.y * 0.5 + 0.5) * 100 + "%";
  const g = gyro.gamma !== null ? gyro.gamma.toFixed(1) + "°" : "—";
  const b = gyro.beta  !== null ? gyro.beta.toFixed(1)  + "°" : "—";
  // cam.detectMs > 0: lag = ms since last detection completed → measures pipeline age
  const lagPart = (cam.active && cam.detectMs > 0)
    ? `  lag:${Math.round(performance.now() - cam.detectMs)}ms`
    : "";
  dbgTxt.textContent = `x:${smoothed.x.toFixed(2)}  y:${smoothed.y.toFixed(2)}  γ:${g}  β:${b}  ${fps}fps${lagPart}`;
}

// ── resize ────────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  VP = computeViewport();
  buildRoom(); // room geometry must match new viewport dimensions
  // applyOffAxis() rebuilds projection matrix next frame — no updateProjectionMatrix()
});

// ── probe gyro on load (detects availability before button press) ─────────
// On iOS, DeviceOrientationEvent won't fire without requestPermission, so
// the probe will timeout and show "no detectado" — expected, iOS needs the button.
// On Android Chrome/Firefox, events arrive immediately.
startListening();
setTimeout(() => {
  if (gyro.gamma === null && !gyro.active) {
    chip("c-gyro", "gyro: no detectado", "bad");
  }
}, 3000);

// ── build scene ───────────────────────────────────────────────────────────
buildRoom();
buildLights();
const objs = buildObjects();
applyOffAxis(); // initial call so scene isn't blank for first frame

// ── loop ──────────────────────────────────────────────────────────────────
// Adaptive LERP: camera gets high value (fast response) because we now
// trigger processFrame on video frame boundaries, not a 33ms timer.
// Gyro is already filtered by the sensor; smooth more. Touch is in between.
const LERP_CAM   = 0.50; // ~3 frames to 90% — camera data is already 66-100ms old
const LERP_GYRO  = 0.12; // ~18 frames to 90% — gyro is noisy, smooth heavily
const LERP_TOUCH = 0.15; // ~12 frames to 90%

let t = 0;
let fps = 0, _fpsFrames = 0, _fpsLast = performance.now();

function animate() {
  requestAnimationFrame(animate);

  // FPS counter — averaged over 500ms windows
  _fpsFrames++;
  const _now = performance.now();
  if (_now - _fpsLast >= 500) {
    fps = Math.round(_fpsFrames * 1000 / (_now - _fpsLast));
    _fpsFrames = 0;
    _fpsLast = _now;
  }

  t += 0.004;

  objs.center.rotation.y = t * 0.35;
  objs.center.rotation.x = Math.sin(t * 0.22) * 0.1;
  objs.vClose.rotation.y = t * 0.9;
  objs.vClose.rotation.z = t * 0.5;
  objs.close.rotation.x  = t * 0.6;
  objs.far.rotation.y    = t * 0.4;
  objs.vFar.rotation.x   = t * 0.3;

  // Adaptive smoothing: camera needs faster response than gyro
  const lerp = (cam.active && cam.tracking) ? LERP_CAM
             : gyro.active                  ? LERP_GYRO
             :                                LERP_TOUCH;
  smoothed.x += (raw.x - smoothed.x) * lerp;
  smoothed.y += (raw.y - smoothed.y) * lerp;

  // Process camera on every NEW video frame (not on a fixed timer).
  // video.currentTime only advances when the browser decodes a new frame,
  // so this fires at the camera's actual framerate (typically 30fps) without
  // polling overhead or skipping fresh frames.
  if (cam.active && cam.video && cam.video.currentTime !== cam.lastVideoTime) {
    cam.lastVideoTime = cam.video.currentTime;
    processFrame();
  }

  if (diag.panelOpen) drawDiagram();

  applyOffAxis();
  updateDebug();
  renderer.render(scene, camera);
}

animate();
