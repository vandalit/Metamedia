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
const EYE_Z  = 5;
const VFOV_R = 55 * Math.PI / 180;
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 0, EYE_Z);

// ── input state ───────────────────────────────────────────────────────────
const raw      = { x: 0, y: 0 };
const smoothed = { x: 0, y: 0 };
const MAX_EYE  = 1.8;

// ── gyro state ────────────────────────────────────────────────────────────
const gyro = {
  active:        false,
  source:        null,    // 'deviceorientation' | 'generic-sensor'
  gamma:         null,    // degrees (debug display)
  beta:          null,
  baseGamma:     0,
  baseBeta:      90,
  receivedEvent: false,   // true once first valid sensor event arrives
};
const GYRO_RANGE    = 25; // degrees = full parallax swing
const SIN_HALF_GYRO = Math.sin(GYRO_RANGE * Math.PI / 360); // for generic sensor normalization
let   gyroListening = false;

// ── off-axis projection ───────────────────────────────────────────────────
// Virtual screen at z=0. Frustum bounds keep screen edges fixed in world
// space regardless of eye position → "window into a 3D world" illusion.
function applyOffAxis() {
  const aspect = window.innerWidth / window.innerHeight;
  const near = camera.near, far = camera.far;
  const halfH = EYE_Z * Math.tan(VFOV_R / 2);
  const halfW = halfH * aspect;
  const eyeX = smoothed.x * MAX_EYE;
  const eyeY = smoothed.y * MAX_EYE;
  camera.position.set(eyeX, eyeY, EYE_Z);
  const l = near * (-halfW - eyeX) / EYE_Z;
  const r = near * ( halfW - eyeX) / EYE_Z;
  const t = near * ( halfH - eyeY) / EYE_Z;
  const b = near * (-halfH - eyeY) / EYE_Z;
  camera.projectionMatrix.makePerspective(l, r, t, b, near, far);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

// ── scene: room (individual planes, unambiguous normals) ──────────────────
function buildRoom() {
  const mat = new THREE.MeshLambertMaterial({ color: 0x0f0f22 });
  const planes = [
    { size:[6,4],  pos:[0,0,-2],  rot:[0,0,0] },              // back wall
    { size:[8,4],  pos:[-3,0,-1], rot:[0, Math.PI/2,0] },     // left wall
    { size:[8,4],  pos:[ 3,0,-1], rot:[0,-Math.PI/2,0] },     // right wall
    { size:[6,8],  pos:[0,-2,-1], rot:[-Math.PI/2,0,0] },     // floor
    { size:[6,8],  pos:[0, 2,-1], rot:[ Math.PI/2,0,0] },     // ceiling
  ];
  for (const p of planes) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(...p.size), mat);
    m.position.set(...p.pos); m.rotation.set(...p.rot);
    scene.add(m);
  }
  const grid = new THREE.GridHelper(6, 10, 0x1a2255, 0x0d1133);
  grid.position.set(0, -1.99, -1); scene.add(grid);
  const backGrid = new THREE.GridHelper(6, 10, 0x1a2255, 0x0d1133);
  backGrid.rotation.x = Math.PI / 2; backGrid.position.set(0, 0, -1.99);
  scene.add(backGrid);

  // room edge lines for depth cue
  const pts = [
    [-3,-2,-2],[3,-2,-2],  [-3,2,-2],[3,2,-2],
    [-3,-2,-2],[-3,2,-2],  [3,-2,-2],[3,2,-2],
    [-3,-2,-2],[-3,-2,3],  [3,-2,-2],[3,-2,3],
    [-3,2,-2], [-3,2,3],   [3,2,-2], [3,2,3],
  ].map(c => new THREE.Vector3(...c));
  scene.add(new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0x223388 })
  ));
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
  // 5 objects at distinct Z depths — differential parallax shift makes depth obvious
  const vClose = wireObj(new THREE.OctahedronGeometry(0.28), 0xdd3300, 0xff6644);
  vClose.position.set(-0.5, 0.2, 2.5); scene.add(vClose);         // z=+2.5 → moves most

  const close = wireObj(new THREE.BoxGeometry(0.5,0.5,0.5), 0x8833cc, 0xbb66ff);
  close.position.set(0.6, -0.3, 1.0); scene.add(close);           // z=+1.0

  const center = wireObj(new THREE.BoxGeometry(0.9,0.9,0.9), 0x2244cc, 0x5577ff);
  scene.add(center);                                                // z=0 → never moves

  const far = wireObj(new THREE.TetrahedronGeometry(0.28), 0x22aa55, 0x55ff88);
  far.position.set(-0.4, 0.3, -1.5); scene.add(far);              // z=-1.5

  const vFar = wireObj(new THREE.IcosahedronGeometry(0.18), 0x55aaff, 0x88ccff);
  vFar.position.set(0.3, -0.2, -1.9); scene.add(vFar);            // z=-1.9 → moves least

  return { vClose, close, center, far, vFar };
}

function buildLights() {
  scene.add(new THREE.AmbientLight(0x334466, 2.5));
  const key = new THREE.DirectionalLight(0x8899ff, 3);
  key.position.set(2, 4, 5); scene.add(key);
  scene.add(Object.assign(new THREE.PointLight(0x4455cc, 2, 10), {position:{x:-3,y:2,z:3}}));
}

// ── input: touch (absolute — where finger is = eye direction) ─────────────
document.addEventListener("touchmove", (e) => {
  if (gyro.active) return;
  e.preventDefault();
  chip("c-input", "touch", "ok");
  raw.x =  (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
  raw.y = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
}, { passive: false });

document.addEventListener("touchend", () => {
  if (!gyro.active) { raw.x = 0; raw.y = 0; }
}, { passive: true });

// ── input: mouse ──────────────────────────────────────────────────────────
document.addEventListener("mousemove", (e) => {
  if (gyro.active) return;
  chip("c-input", "mouse", "ok");
  raw.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
  raw.y = -(e.clientY / window.innerHeight - 0.5) * 2;
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
    title: "🦁 Brave bloqueó los sensores",
    steps: [
      "Toca el ícono del León en la barra de direcciones",
      'Busca "Bloquear sensores" y desactívalo para este sitio',
      "Alternativa: Ajustes → Config. del sitio → Sensores → Permitir",
      "Recarga la página y presiona Reintentar",
    ],
  },
  "ios-denied": {
    title: "Permiso denegado — iOS",
    steps: [
      "Abre Configuración del iPhone / iPad",
      "Busca el navegador que estás usando (Safari, Chrome…)",
      'Activa "Movimiento y orientación"',
      "Vuelve aquí y presiona Reintentar",
    ],
  },
  "generic": {
    title: "Sensores no disponibles",
    steps: [
      "Tu navegador o configuración bloquea los sensores de movimiento",
      "Prueba abriendo esta página en Chrome para Android",
      "También puedes usar el control táctil — toca y arrastra",
    ],
  },
};

function showHelp(type) {
  const h = HELP[type] || HELP["generic"];
  document.getElementById("help-title").textContent = h.title;
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
  dbgTxt.textContent = `x:${smoothed.x.toFixed(2)}  y:${smoothed.y.toFixed(2)}  γ:${g}  β:${b}`;
}

// ── resize ────────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
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
  updateDebug();
  renderer.render(scene, camera);
}

animate();
