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

// ── mutable config (driven by #cfg-panel sliders) ────────────────────────
const cfg = {
  maxEyeFactor: 0.65,  // fraction of halfW the eye can travel laterally
  vfovDeg:      55,    // vertical FOV in degrees; changes rebuild room geometry
  lerpCam:      0.50,  // camera-input smoothing (higher = faster response)
  microSmooth:  false, // velocity-adaptive jitter attenuation
};

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
  const halfH  = EYE_Z * Math.tan(cfg.vfovDeg * Math.PI / 180 / 2);
  const halfW  = halfH * aspect;
  return { halfW, halfH, W: halfW * 2, H: halfH * 2 };
}
let VP        = computeViewport();
let roomGroup = null; // stored for dispose + rebuild on resize

// ── scene management ──────────────────────────────────────────────────────
// sceneGroup holds all scene-specific objects; clearScene() disposes them.
// Room geometry and the camera config survive scene switches.
const sceneGroup = new THREE.Group();
scene.add(sceneGroup);
let sceneLights    = [];
let sceneAnimFn    = null;
let sceneTextures  = []; // textures to dispose on scene switch (materials.dispose() skips textures)
let sceneDiagObjs  = []; // objects shown in SPACE diagram — set by each activateScene*
let activeSceneIdx = 0;

function clearScene() {
  sceneGroup.traverse(child => {
    child.geometry?.dispose();
    if (child.material) {
      (Array.isArray(child.material) ? child.material : [child.material])
        .forEach(m => m.dispose());
    }
  });
  sceneGroup.clear();
  sceneLights.forEach(l => scene.remove(l));
  sceneLights = [];
  sceneTextures.forEach(t => t.dispose());
  sceneTextures = [];
  sceneAnimFn = null;
}

// ── off-axis projection ───────────────────────────────────────────────────
// Virtual screen at z=0. Frustum bounds keep screen edges fixed in world
// space regardless of eye position → "window into a 3D world" illusion.
// eyeZ: optional dynamic eye distance; defaults to EYE_Z constant.
// When the user is closer, eyeZ shrinks → same head movement = more parallax.
function applyOffAxis(eyeZ) {
  eyeZ = eyeZ || EYE_Z;
  const aspect = window.innerWidth / window.innerHeight;
  const near = camera.near, far = camera.far;
  const halfH  = eyeZ * Math.tan(cfg.vfovDeg * Math.PI / 180 / 2);
  const halfW  = halfH * aspect;
  const maxEye = halfW * cfg.maxEyeFactor;
  const eyeX   = smoothed.x * maxEye;
  const eyeY   = smoothed.y * maxEye;
  camera.position.set(eyeX, eyeY, eyeZ);
  const l = near * (-halfW - eyeX) / eyeZ;
  const r = near * ( halfW - eyeX) / eyeZ;
  const t = near * ( halfH - eyeY) / eyeZ;
  const b = near * (-halfH - eyeY) / eyeZ;
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

function activateScene1() {
  clearScene();
  renderer.shadowMap.enabled = false;
  activeSceneIdx = 0;

  // Lights
  const amb = new THREE.AmbientLight(0x334466, 2.5);
  scene.add(amb); sceneLights.push(amb);
  const key = new THREE.DirectionalLight(0x8899ff, 3);
  key.position.set(2, 4, 5);
  scene.add(key); sceneLights.push(key);
  const fill = new THREE.PointLight(0x4455cc, 2, 10);
  fill.position.set(-3, 2, 3);
  scene.add(fill); sceneLights.push(fill);

  // Objects (fractions of half-room so they scale with any viewport)
  const { halfW, halfH } = VP;
  const s = halfH * 0.1;

  const vClose = wireObj(new THREE.OctahedronGeometry(s * 0.85), 0xdd3300, 0xff6644);
  vClose.position.set(-halfW * 0.4,  halfH * 0.10,  2.5); sceneGroup.add(vClose);

  const close = wireObj(new THREE.BoxGeometry(s, s, s), 0x8833cc, 0xbb66ff);
  close.position.set( halfW * 0.4, -halfH * 0.15,  1.0); sceneGroup.add(close);

  const center = wireObj(new THREE.BoxGeometry(s * 2.2, s * 2.2, s * 2.2), 0x2244cc, 0x5577ff);
  center.position.set(0, 0, 0.4); sceneGroup.add(center);

  const far = wireObj(new THREE.TetrahedronGeometry(s * 0.85), 0x22aa55, 0x55ff88);
  far.position.set(-halfW * 0.3,  halfH * 0.20, -1.5); sceneGroup.add(far);

  const vFar = wireObj(new THREE.IcosahedronGeometry(s * 0.6), 0x55aaff, 0x88ccff);
  vFar.position.set( halfW * 0.25, -halfH * 0.10, -1.9); sceneGroup.add(vFar);

  sceneAnimFn = (t) => {
    center.rotation.y = t * 0.35;
    center.rotation.x = Math.sin(t * 0.22) * 0.1;
    vClose.rotation.y = t * 0.9;
    vClose.rotation.z = t * 0.5;
    close.rotation.x  = t * 0.6;
    far.rotation.y    = t * 0.4;
    vFar.rotation.x   = t * 0.3;
  };

  const W = VP.halfW;
  sceneDiagObjs = [
    { x: -W * 0.4,  z: 2.5,  r: 4.5, color: "rgba(255,138,98,0.88)"  },
    { x:  W * 0.4,  z: 1.0,  r: 3.5, color: "rgba(178,138,255,0.88)" },
    { x:  0,        z: 0.4,  r: 5,   color: "rgba(128,158,255,0.88)" },
    { x: -W * 0.3,  z: -1.5, r: 3.5, color: "rgba(118,218,158,0.88)" },
    { x:  W * 0.25, z: -1.9, r: 3,   color: "rgba(138,198,255,0.88)" },
  ];

  updateScenePanel();
}

function activateScene2() {
  clearScene();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  activeSceneIdx = 1;

  const { halfW, halfH } = VP;
  const s = halfH * 0.1;

  // Key light with soft shadows
  const amb = new THREE.AmbientLight(0x18182a, 1.2);
  scene.add(amb); sceneLights.push(amb);

  const sun = new THREE.DirectionalLight(0xffeedd, 5);
  sun.position.set(3, 5, 4);
  sun.castShadow = true;
  sun.shadow.camera.near   = 0.5;
  sun.shadow.camera.far    = 16;
  sun.shadow.camera.left   = -5;
  sun.shadow.camera.right  =  5;
  sun.shadow.camera.top    =  5;
  sun.shadow.camera.bottom = -5;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.radius = 5;
  scene.add(sun); sceneLights.push(sun);

  const rim = new THREE.DirectionalLight(0x2244bb, 1.4);
  rim.position.set(-3, -1, -4);
  scene.add(rim); sceneLights.push(rim);

  const accent = new THREE.PointLight(0x6644ff, 1.8, 6);
  accent.position.set(-1.5, 0.5, 1.5);
  scene.add(accent); sceneLights.push(accent);

  function solidObj(geo, color, roughness = 0.45, metalness = 0.4) {
    const m = new THREE.Mesh(geo,
      new THREE.MeshStandardMaterial({ color, roughness, metalness }));
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  // z=+2.5 — sphere (most parallax)
  const vClose = solidObj(new THREE.SphereGeometry(s * 0.72, 32, 32), 0xff4422, 0.55, 0.2);
  vClose.position.set(-halfW * 0.4, halfH * 0.10, 2.5);
  sceneGroup.add(vClose);

  // z=+1.0 — hexagonal prism
  const close = solidObj(new THREE.CylinderGeometry(s * 0.42, s * 0.52, s * 1.4, 6), 0x9933cc, 0.35, 0.55);
  close.position.set(halfW * 0.4, -halfH * 0.15, 1.0);
  sceneGroup.add(close);

  // z=+0.4 — torus knot (center, most visible)
  const center = solidObj(new THREE.TorusKnotGeometry(s * 0.88, s * 0.22, 120, 16), 0x3366ff, 0.18, 0.85);
  center.position.set(0, 0, 0.4);
  sceneGroup.add(center);

  // z=-1.5 — icosahedron
  const far = solidObj(new THREE.IcosahedronGeometry(s * 0.78, 0), 0x22cc66, 0.65, 0.15);
  far.position.set(-halfW * 0.3, halfH * 0.20, -1.5);
  sceneGroup.add(far);

  // z=-1.9 — cone (least parallax)
  const vFar = solidObj(new THREE.ConeGeometry(s * 0.48, s * 1.2, 8), 0x66aaff, 0.50, 0.30);
  vFar.position.set(halfW * 0.25, -halfH * 0.10, -1.9);
  sceneGroup.add(vFar);

  // Shadow-receiving floor plane
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(halfW * 4, DEPTH_SPAN * 2.5),
    new THREE.MeshStandardMaterial({ color: 0x0b0b1c, roughness: 0.98, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -halfH * 0.92, (DEPTH_NEAR + DEPTH_FAR) / 2);
  floor.receiveShadow = true;
  sceneGroup.add(floor);

  sceneAnimFn = (t) => {
    center.rotation.y = t * 0.28;
    center.rotation.x = t * 0.12;
    vClose.rotation.y = t * 0.65;
    close.rotation.y  = t * 0.50;
    close.rotation.x  = t * 0.20;
    far.rotation.y    = t * 0.38;
    far.rotation.z    = t * 0.22;
    vFar.rotation.y   = t * 0.55;
  };

  const W2 = VP.halfW;
  sceneDiagObjs = [
    { x: -W2 * 0.4,  z: 2.5,  r: 4.5, color: "rgba(255,100,80,0.85)"  },
    { x:  W2 * 0.4,  z: 1.0,  r: 3.5, color: "rgba(160,80,220,0.85)"  },
    { x:  0,         z: 0.4,  r: 5,   color: "rgba(60,110,255,0.85)"  },
    { x: -W2 * 0.3,  z: -1.5, r: 3.5, color: "rgba(30,200,100,0.85)"  },
    { x:  W2 * 0.25, z: -1.9, r: 3,   color: "rgba(100,180,255,0.85)" },
  ];

  updateScenePanel();
}

function activateScene3() {
  clearScene();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  activeSceneIdx = 2;

  // Toon gradient: 3 hard tonal steps (NearestFilter = no interpolation)
  const gradData = new Uint8Array([82, 152, 228]);
  const gradMap  = new THREE.DataTexture(gradData, 3, 1, THREE.RedFormat);
  gradMap.minFilter = THREE.NearestFilter;
  gradMap.magFilter = THREE.NearestFilter;
  gradMap.needsUpdate = true;
  sceneTextures.push(gradMap);

  // Lights — overhead sun casts building shadows on ground (visible in drone view)
  const amb = new THREE.AmbientLight(0x0e1424, 2.8);
  scene.add(amb); sceneLights.push(amb);
  const sun = new THREE.DirectionalLight(0xfff4dd, 5.2);
  sun.position.set(3, 8, 2);
  sun.castShadow = true;
  sun.shadow.camera.near   = 0.1;
  sun.shadow.camera.far    = 30;
  sun.shadow.camera.left   = -8; sun.shadow.camera.right  = 8;
  sun.shadow.camera.top    =  8; sun.shadow.camera.bottom = -8;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.radius = 2;
  scene.add(sun); sceneLights.push(sun);

  // City group tilted for drone / bird's-eye view
  // rotation.x = -60° → local +Y (building height) projects into world -Z (depth);
  // local +Z (city depth) projects into world +Y (screen up).
  const cityGroup = new THREE.Group();
  cityGroup.rotation.x = -Math.PI / 3; // -60°
  sceneGroup.add(cityGroup);

  // Deterministic hash — same seed = same city every time
  const hash = (n) => Math.abs(Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1;

  // Grid parameters
  const COLS = 9, ROWS = 13;
  const BLOCK = 0.36, STREET = 0.10, AVENUE = 0.22, AVE_EVERY = 3;

  // Precompute centred axis positions with variable street/avenue gaps
  function axisPos(count) {
    const pos = []; let cur = 0;
    for (let i = 0; i < count; i++) {
      pos.push(cur + BLOCK / 2);
      cur += BLOCK;
      if (i < count - 1) cur += (i + 1) % AVE_EVERY === 0 ? AVENUE : STREET;
    }
    const total = cur;
    return { pos: pos.map(p => p - total / 2), total };
  }
  const ax = axisPos(COLS);
  const az = axisPos(ROWS);

  // Ground — dark asphalt, receives building shadows
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(ax.total + 0.5, az.total + 0.5),
    new THREE.MeshToonMaterial({ color: 0x0e0f1a, gradientMap: gradMap })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  cityGroup.add(ground);

  // Street grid overlay (slightly elevated XZ plane, thin lines via LineSegments)
  {
    const pts = [];
    for (const x of ax.pos) {
      pts.push(new THREE.Vector3(x - BLOCK / 2, 0.003, -az.total / 2));
      pts.push(new THREE.Vector3(x - BLOCK / 2, 0.003,  az.total / 2));
    }
    pts.push(new THREE.Vector3(ax.total / 2, 0.003, -az.total / 2));
    pts.push(new THREE.Vector3(ax.total / 2, 0.003,  az.total / 2));
    for (const z of az.pos) {
      pts.push(new THREE.Vector3(-ax.total / 2, 0.003, z - BLOCK / 2));
      pts.push(new THREE.Vector3( ax.total / 2, 0.003, z - BLOCK / 2));
    }
    pts.push(new THREE.Vector3(-ax.total / 2, 0.003,  az.total / 2));
    pts.push(new THREE.Vector3( ax.total / 2, 0.003,  az.total / 2));
    cityGroup.add(new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x1a1e2e, transparent: true, opacity: 0.7 })
    ));
  }

  // Building placement
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      // Normalised distance from city centre (0 = CBD, 1 = corner)
      const cx = (col / (COLS - 1)) * 2 - 1;
      const cz = (row / (ROWS - 1)) * 2 - 1;
      const dist = Math.min(Math.sqrt(cx * cx + cz * cz) / Math.SQRT2, 1);

      const h0 = hash(col * 31 + row * 17 + 5);
      const h1 = hash(col * 53 + row * 7  + 11);
      const h2 = hash(col * 97 + row * 23 + 3);

      // Occasional vacant lot or park — more frequent on outskirts
      if (h2 < (dist > 0.55 ? 0.18 : 0.04)) continue;

      // Height by zone — capped so building tops stay within camera far plane
      // (with -60° tilt, max h where world_z = h * sin(60°) ≤ 2.5 → h ≤ 2.89)
      let height;
      if (dist < 0.14)       height = 2.0 + h0 * 0.85;   // CBD skyscraper: 2.0–2.85
      else if (dist < 0.28)  height = 1.0 + h0 * 1.0;    // high-rise commercial: 1.0–2.0
      else if (dist < 0.45)  height = 0.5 + h0 * 0.7;    // mixed-use: 0.5–1.2
      else if (dist < 0.65)  height = 0.22 + h0 * 0.45;  // residential: 0.22–0.67
      else                   height = 0.12 + h0 * 0.25;  // low / outskirts: 0.12–0.37

      // Sporadic tall outlier in commercial ring (landmark buildings)
      if (dist > 0.22 && dist < 0.38 && h1 > 0.90) height = Math.min(height * 2.2, 2.8);

      // Colour by zone (HSL)
      let color, emissive;
      if (dist < 0.15) {
        color    = new THREE.Color().setHSL(0.60, 0.40, 0.35 + h0 * 0.15); // blue glass
        emissive = new THREE.Color().setHSL(0.62, 0.55, 0.04 + h1 * 0.05);
      } else if (dist < 0.30) {
        color    = new THREE.Color().setHSL(0.57, 0.25, 0.40 + h0 * 0.14);
        emissive = new THREE.Color().setHSL(0.60, 0.40, 0.03 + h1 * 0.04);
      } else if (dist < 0.50) {
        color    = new THREE.Color().setHSL(0.09, 0.22, 0.44 + h0 * 0.14); // warm concrete
        emissive = new THREE.Color().setHSL(0.10, 0.30, 0.02 + h1 * 0.03);
      } else {
        color    = new THREE.Color().setHSL(0.07, 0.15, 0.40 + h0 * 0.12); // beige/brick
        emissive = new THREE.Color().setHSL(0.08, 0.20, 0.01 + h1 * 0.02);
      }

      const bw  = BLOCK * 0.86;
      const geo = new THREE.BoxGeometry(bw, height, bw);
      const mat = new THREE.MeshToonMaterial({ color, gradientMap: gradMap, emissive, emissiveIntensity: 0.35 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(ax.pos[col], height / 2, az.pos[row]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Back-face ink outline (skip tiny residential — performance + readability)
      if (height > 0.28) {
        const outline = new THREE.Mesh(
          new THREE.BoxGeometry(bw, height, bw),
          new THREE.MeshBasicMaterial({ color: 0x03050c, side: THREE.BackSide })
        );
        outline.scale.setScalar(1.06);
        mesh.add(outline);
      }

      cityGroup.add(mesh);
    }
  }

  // Diagram representation: sample world-Z of building tops across the city
  // With -60° tilt: world_z = local_z * cos60 - local_y * sin60 = lz*0.5 - h*0.866
  const W3 = VP.halfW;
  sceneDiagObjs = [
    { x: -W3 * 0.55, z:  1.2, r: 2, color: "rgba(175,158,132,0.65)" }, // near, low
    { x:  W3 * 0.40, z:  0.9, r: 2, color: "rgba(175,158,132,0.65)" },
    { x: -W3 * 0.25, z:  0.3, r: 2.5, color: "rgba(130,155,185,0.72)" }, // mid commercial
    { x:  W3 * 0.50, z:  0.1, r: 2.5, color: "rgba(130,155,185,0.72)" },
    { x:  W3 * 0.15, z: -0.8, r: 3.5, color: "rgba(100,130,220,0.82)" }, // CBD tops
    { x: -W3 * 0.05, z: -1.4, r: 4,   color: "rgba(100,130,220,0.85)" },
    { x:  W3 * 0.10, z: -2.0, r: 3.5, color: "rgba(110,140,230,0.80)" },
    { x: -W3 * 0.30, z: -1.2, r: 2.5, color: "rgba(115,135,175,0.65)" }, // far residential
    { x:  W3 * 0.45, z: -0.9, r: 2,   color: "rgba(115,135,175,0.65)" },
  ];

  sceneAnimFn = null; // static — head movement IS the motion

  updateScenePanel();
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
// Face position range: how far from center (in normalized image coords) = full parallax.
// 0.25 = the face must travel 25% of image width to reach raw.x=±1.
const FACE_RANGE_X = 0.25;
const FACE_RANGE_Y = 0.20;

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
  // Calibration (set by calibrateCamera())
  calibX:      0,       // face centroid X offset from 0.5 at calibration
  calibY:      0,       // face centroid Y offset from 0.5 at calibration
  calibEyeDist: 0,      // inter-eye distance at calibration distance (depth reference)
  // Live face data
  faceDepth:   1,       // ratio calibEyeDist/eyeDist — >1 = farther than reference
  lastYaw:     0,       // last computed yaw (degrees, for diagram display)
  lastPitch:   0,
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

  // PRIMARY: eye centroid position in image — translational signal.
  // This is what the parallax window illusion requires: WHERE the eye is,
  // not WHICH WAY it is looking. Moving the head laterally without rotating
  // the face still shifts the eye centroid in the image.
  const leftEye  = landmarks[33];
  const rightEye = landmarks[263];
  const faceX    = (leftEye.x + rightEye.x) / 2;
  const faceY    = (leftEye.y + rightEye.y) / 2;
  const eyeDist  = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);

  // Depth estimation: inter-eye distance shrinks as user moves farther away.
  // faceDepth > 1 = farther than calibration reference → larger eyeZ → less parallax.
  if (cam.calibEyeDist > 0) {
    cam.faceDepth = cam.calibEyeDist / Math.max(eyeDist, 0.005);
  }

  // Position offset from calibration neutral (not from image center, from where user
  // was when they pressed Calibrate — corrects for camera-screen Y offset).
  raw.x = clamp(-(faceX - 0.5 - cam.calibX) / FACE_RANGE_X, -1, 1);
  raw.y = clamp(-(faceY - 0.5 - cam.calibY) / FACE_RANGE_Y, -1, 1);

  // Store rotation angles for diagram and debug display (secondary, informational)
  const mData = results.facialTransformationMatrixes?.[0]?.data;
  if (mData) {
    cam.lastYaw   = Math.atan2(mData[8], mData[10]) * 180 / Math.PI;
    cam.lastPitch = Math.asin(-Math.max(-1, Math.min(1, mData[9]))) * 180 / Math.PI;
  }

  cam.tracking = true;
  camStats(`x:${(faceX - 0.5).toFixed(3)}  y:${(faceY - 0.5).toFixed(3)}  d:${eyeDist.toFixed(3)}`);
  chip("c-input", "face", "ok");
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
  if (!results.faceLandmarks?.length) return;
  const landmarks = results.faceLandmarks[0];
  const leftEye  = landmarks[33];
  const rightEye = landmarks[263];
  // Capture face centroid as "neutral" position — corrects for camera-screen Y offset
  // and any positional bias from camera placement on device.
  cam.calibX     = (leftEye.x + rightEye.x) / 2 - 0.5;
  cam.calibY     = (leftEye.y + rightEye.y) / 2 - 0.5;
  cam.calibEyeDist = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
  cam.faceDepth  = 1; // reset depth ratio to reference
  raw.x = 0; raw.y = 0; smoothed.x = 0; smoothed.y = 0;
  camStats("calibrado — posición y distancia de referencia capturadas");
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
  const eyeX   = smoothed.x * maxEye;

  // ── Rotated 90°: Z runs HORIZONTAL, X runs VERTICAL ──────────────────────
  // Horizontal = depth (Z): left = user side (REAL), right = back wall (VIRTUAL)
  // Vertical   = lateral (X): center = 0, top/bottom = ±halfW
  // Screen (z=0) is a VERTICAL line — REAL zone left, VIRTUAL zone right
  const zMin   = DEPTH_FAR - 0.5;
  const zMax   = EYE_Z + 0.5;
  const zRange = zMax - zMin;
  const xHalf  = halfW * 1.3;
  const xRange = xHalf * 2;

  const wd = (z) => (1 - (z - zMin) / zRange) * DIAG_W; // world Z → canvas X
  const wl = (x) => ((x + xHalf) / xRange) * DIAG_H;    // world X → canvas Y

  const screenX = wd(0);
  const backX   = wd(DEPTH_FAR);
  const nearX   = wd(DEPTH_NEAR);
  const topY    = wl(-halfW);
  const botY    = wl(+halfW);
  const midY    = wl(0);

  const currentEyeZ = (cam.active && cam.calibEyeDist > 0)
    ? Math.min(EYE_Z * cam.faceDepth, EYE_Z * 2) : EYE_Z;
  const headCX = Math.max(3, wd(currentEyeZ));
  const headCY = wl(eyeX);

  // Zone fills
  ctx.fillStyle = "rgba(175,182,210,0.055)";
  ctx.fillRect(0, 0, screenX, DIAG_H);                  // REAL zone (left)
  ctx.fillStyle = "rgba(88,108,185,0.07)";
  ctx.fillRect(screenX, 0, DIAG_W - screenX, DIAG_H);   // VIRTUAL zone (right)

  // Room walls (dashed horizontal lines at ±halfW)
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = "rgba(100,118,185,0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, topY); ctx.lineTo(DIAG_W, topY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, botY); ctx.lineTo(DIAG_W, botY); ctx.stroke();
  ctx.setLineDash([]);

  // Back wall (vertical line at z=DEPTH_FAR)
  ctx.strokeStyle = "rgba(100,118,185,0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(backX, topY); ctx.lineTo(backX, botY); ctx.stroke();

  // Screen line — vertical, bright (z=0)
  ctx.strokeStyle = "rgba(215,220,240,0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(screenX, 0); ctx.lineTo(screenX, DIAG_H); ctx.stroke();

  // Labels
  ctx.font = "8px monospace";
  ctx.fillStyle = "rgba(145,158,205,0.45)";
  ctx.fillText("REAL",    4,           10);
  ctx.fillText("VIRTUAL", screenX + 3, 10);
  ctx.fillStyle = "rgba(165,175,215,0.32)";
  ctx.fillText("z=0",              screenX + 2,  DIAG_H - 3);
  ctx.fillText(`z=${DEPTH_FAR}`,   backX - 28,   DIAG_H - 3);
  ctx.fillText(`z=+${DEPTH_NEAR}`, nearX + 2,    DIAG_H - 3);

  // Scene objects — registered by each activateScene*
  for (const o of sceneDiagObjs) {
    ctx.fillStyle = o.color;
    ctx.beginPath();
    ctx.arc(wd(o.z), wl(o.x), o.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Head and gaze ray ─────────────────────────────────────────────────────
  const tracking    = cam.active && cam.tracking;
  const noFace      = cam.active && !cam.tracking;
  const headOpacity = tracking ? 1 : (noFace ? 0.25 : 0.55);

  // Gaze ray: eye → z=0 screen (at world x=0) → back wall
  const rayBackY = wl(eyeX * DEPTH_FAR / currentEyeZ);
  ctx.strokeStyle = `rgba(195,208,255,${headOpacity * 0.35})`;
  ctx.lineWidth   = 1;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.moveTo(headCX,  headCY);
  ctx.lineTo(screenX, midY);
  ctx.lineTo(backX,   rayBackY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Screen pierce dot
  ctx.fillStyle = `rgba(195,208,255,${headOpacity * 0.75})`;
  ctx.beginPath();
  ctx.arc(screenX, midY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Back wall hit dot
  ctx.fillStyle = `rgba(195,208,255,${headOpacity * 0.4})`;
  ctx.beginPath();
  ctx.arc(backX, rayBackY, 2, 0, Math.PI * 2);
  ctx.fill();

  // Head circle
  ctx.fillStyle   = `rgba(195,200,220,${headOpacity * 0.13})`;
  ctx.strokeStyle = `rgba(195,200,225,${headOpacity * 0.52})`;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.arc(headCX, headCY, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gaze direction indicator (yaw = left/right → vertical deflection in this view)
  if (tracking && cam.lastYaw !== 0) {
    const yawRad = (-cam.lastYaw / 30) * (Math.PI / 2.2);
    ctx.strokeStyle = "rgba(190,205,255,0.75)";
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(headCX, headCY);
    ctx.lineTo(headCX + Math.cos(yawRad) * 9, headCY + Math.sin(yawRad) * 7);
    ctx.stroke();
  }

  if (noFace) {
    ctx.fillStyle = "rgba(255,160,100,0.55)";
    ctx.font = "8px monospace";
    ctx.fillText("sin cara", headCX + 12, headCY + 4);
  }

  // Stats
  const maxE = maxEye.toFixed(2);
  let statsStr = `eyeX:${eyeX.toFixed(2)}u  maxEye:${maxE}u  x:${smoothed.x.toFixed(2)}`;
  if (cam.calibEyeDist > 0) statsStr += `  dZ:${cam.faceDepth.toFixed(2)}`;
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

// ── config panel ──────────────────────────────────────────────────────────
{
  const cfgPanel = document.getElementById("cfg-panel");

  document.getElementById("btn-cfg").addEventListener("click", (e) => {
    e.stopPropagation();
    cfgPanel.classList.toggle("open");
  });

  document.addEventListener("pointerdown", (e) => {
    if (cfgPanel.classList.contains("open") && !cfgPanel.contains(e.target)
        && e.target.id !== "btn-cfg") {
      cfgPanel.classList.remove("open");
    }
  });

  document.getElementById("sl-par").addEventListener("input", function() {
    cfg.maxEyeFactor = +this.value / 100;
    document.getElementById("sl-par-v").textContent = this.value + "%";
  });

  document.getElementById("sl-fov").addEventListener("input", function() {
    cfg.vfovDeg = +this.value;
    document.getElementById("sl-fov-v").textContent = this.value + "°";
    VP = computeViewport();
    buildRoom();
  });

  document.getElementById("sl-lerp").addEventListener("input", function() {
    cfg.lerpCam = +this.value / 100;
    document.getElementById("sl-lerp-v").textContent = cfg.lerpCam.toFixed(2);
  });

  const btnMicro = document.getElementById("btn-micro");
  btnMicro.addEventListener("click", () => {
    cfg.microSmooth = !cfg.microSmooth;
    btnMicro.textContent = cfg.microSmooth ? "ON" : "OFF";
    btnMicro.classList.toggle("on", cfg.microSmooth);
  });
}

// ── scene panel ───────────────────────────────────────────────────────────
function updateScenePanel() {
  const items = document.querySelectorAll(".scene-item");
  items.forEach((el, i) => el.classList.toggle("active", i === activeSceneIdx));
  document.getElementById("scene-num").textContent = activeSceneIdx + 1;
}

{
  const scenePanel = document.getElementById("scene-panel");

  document.getElementById("btn-scene").addEventListener("click", (e) => {
    e.stopPropagation();
    scenePanel.classList.toggle("open");
  });

  document.addEventListener("pointerdown", (e) => {
    if (scenePanel.classList.contains("open") && !scenePanel.contains(e.target)
        && e.target.id !== "btn-scene") {
      scenePanel.classList.remove("open");
    }
  });

  document.querySelectorAll(".scene-item").forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      if (idx === activeSceneIdx) return;
      [activateScene1, activateScene2, activateScene3][idx]?.();
      scenePanel.classList.remove("open");
    });
  });
}

// ── debug display (every frame) ───────────────────────────────────────────
const xyDot  = document.getElementById("xy-dot");
const dbgTxt = document.getElementById("dbg-vals");
function updateDebug() {
  xyDot.style.left = (smoothed.x * 0.5 + 0.5) * 100 + "%";
  xyDot.style.top  = (-smoothed.y * 0.5 + 0.5) * 100 + "%";
  const g = gyro.gamma !== null ? gyro.gamma.toFixed(1).padStart(6) + "°" : "     —°";
  const b = gyro.beta  !== null ? gyro.beta.toFixed(1).padStart(6)  + "°" : "     —°";
  const fpsStr = fps.toString().padStart(2) + "fps";
  const lagPart = (cam.active && cam.detectMs > 0)
    ? " lag:" + Math.round(performance.now() - cam.detectMs).toString().padStart(3) + "ms"
    : "           ";
  const depthPart = (cam.active && cam.calibEyeDist > 0)
    ? " dZ:" + cam.faceDepth.toFixed(2)
    : "";
  dbgTxt.textContent = `x:${smoothed.x.toFixed(2)} y:${smoothed.y.toFixed(2)} γ:${g} β:${b} ${fpsStr}${lagPart}${depthPart}`;
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
activateScene1();
applyOffAxis(); // initial call so scene isn't blank for first frame

// ── loop ──────────────────────────────────────────────────────────────────
// Adaptive LERP: camera gets high value (fast response) because we now
// trigger processFrame on video frame boundaries, not a 33ms timer.
// Gyro is already filtered by the sensor; smooth more. Touch is in between.
const LERP_GYRO  = 0.12; // ~18 frames to 90% — gyro is noisy, smooth heavily
const LERP_TOUCH = 0.15; // ~12 frames to 90%
// Camera LERP is mutable via cfg.lerpCam (default 0.50)

let t = 0;
let fps = 0, _fpsFrames = 0, _fpsLast = performance.now();
let blurCurrent = 0; // for viewport blur on tracking loss

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

  if (sceneAnimFn) sceneAnimFn(t);

  // Adaptive smoothing: camera LERP is user-tunable via cfg.lerpCam
  const lerp = (cam.active && cam.tracking) ? cfg.lerpCam
             : gyro.active                  ? LERP_GYRO
             :                                LERP_TOUCH;
  const dx = raw.x - smoothed.x;
  const dy = raw.y - smoothed.y;
  if (cfg.microSmooth) {
    // Velocity-adaptive: attenuate micro-jitter without slowing large movements
    const vel   = Math.hypot(dx, dy);
    const scale = Math.min(vel / 0.015, 1);
    smoothed.x += dx * lerp * scale;
    smoothed.y += dy * lerp * scale;
  } else {
    smoothed.x += dx * lerp;
    smoothed.y += dy * lerp;
  }

  // Process camera on every NEW video frame (not on a fixed timer).
  if (cam.active && cam.video && cam.video.currentTime !== cam.lastVideoTime) {
    cam.lastVideoTime = cam.video.currentTime;
    processFrame();
  }

  // Blur feedback: when camera is active but face is lost, the illusion breaks.
  // Gaussian blur signals this to the user and helps them re-enter the frame.
  // CSS filter is GPU-accelerated and needs no Three.js post-processing.
  const blurTarget = (cam.active && !cam.tracking) ? 1 : 0;
  blurCurrent += (blurTarget - blurCurrent) * 0.06; // ~50 frames to full blur
  if (blurCurrent > 0.015) {
    renderer.domElement.style.filter = `blur(${(blurCurrent * 12).toFixed(1)}px)`;
  } else if (renderer.domElement.style.filter) {
    renderer.domElement.style.filter = '';
  }

  if (diag.panelOpen) drawDiagram();

  // Dynamic eyeZ: when calibrated, scale based on face depth proxy.
  // Capped at 2× reference to avoid extreme frustum distortion.
  const dynamicEyeZ = (cam.active && cam.calibEyeDist > 0)
    ? Math.min(EYE_Z * cam.faceDepth, EYE_Z * 2)
    : EYE_Z;
  applyOffAxis(dynamicEyeZ);
  updateDebug();
  renderer.render(scene, camera);
}

animate();
