import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js";

// --- Scene setup ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.Fog(0x0a0a0f, 8, 18);

// Camera — positioned to look into the room from the "screen" side
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// --- Room: 4x4x4 units ---
const ROOM = 4;

function buildRoom() {
  const mat = new THREE.MeshLambertMaterial({
    color: 0x1a1a2e,
    side: THREE.BackSide,
  });

  const wallGeo = new THREE.BoxGeometry(ROOM, ROOM, ROOM);
  const room = new THREE.Mesh(wallGeo, mat);
  scene.add(room);

  // Grid on floor for depth cue
  const grid = new THREE.GridHelper(ROOM, 8, 0x333355, 0x222233);
  grid.position.y = -ROOM / 2;
  scene.add(grid);

  // Grid on back wall for depth cue
  const backGrid = new THREE.GridHelper(ROOM, 8, 0x333355, 0x222233);
  backGrid.rotation.x = Math.PI / 2;
  backGrid.position.z = -ROOM / 2;
  scene.add(backGrid);
}

// --- Cube ---
function buildCube() {
  const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);

  // Wireframe outline
  const wireGeo = new THREE.EdgesGeometry(geo);
  const wireMat = new THREE.LineBasicMaterial({ color: 0x6699ff, linewidth: 1.5 });
  const wireframe = new THREE.LineSegments(wireGeo, wireMat);

  // Solid faces (semi-transparent)
  const faceMat = new THREE.MeshPhongMaterial({
    color: 0x2244aa,
    transparent: true,
    opacity: 0.35,
    shininess: 80,
  });
  const cube = new THREE.Mesh(geo, faceMat);
  cube.castShadow = true;
  cube.receiveShadow = true;

  const group = new THREE.Group();
  group.add(cube);
  group.add(wireframe);
  group.position.set(0, 0, 0);
  scene.add(group);

  return group;
}

// --- Lighting ---
function buildLights() {
  const ambient = new THREE.AmbientLight(0x334466, 1.2);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0x8899ff, 2.0);
  key.position.set(2, 3, 2);
  key.castShadow = true;
  scene.add(key);

  const fill = new THREE.PointLight(0x4466cc, 1.5, 8);
  fill.position.set(-2, 1, 1);
  scene.add(fill);

  // Subtle glow at cube position
  const glow = new THREE.PointLight(0x2255ff, 1.0, 3);
  glow.position.set(0, 0, 0);
  scene.add(glow);
}

// --- Off-axis parallax ---
// This simulates what FaceLandmarker will provide in Phase 2.
// headX, headY are normalized [-1, 1] representing head offset from center.
const headPos = { x: 0, y: 0 };
const smoothed = { x: 0, y: 0 };
const SMOOTH = 0.08;    // LERP factor — lower = smoother but laggier
const PARALLAX_SCALE = 0.6; // How much the frustum shifts per unit of head movement

function applyOffAxisProjection(hx, hy) {
  const W = window.innerWidth;
  const H = window.innerHeight;

  // Shift the viewport offset based on head position.
  // Moving head right → we see more of the left side → offsetX is negative.
  const offsetX = -hx * W * PARALLAX_SCALE;
  const offsetY = hy * H * PARALLAX_SCALE;

  camera.setViewOffset(W, H, offsetX, offsetY, W, H);

  document.getElementById("ox").textContent = hx.toFixed(2);
  document.getElementById("oy").textContent = hy.toFixed(2);
}

// Mouse simulates head tracking for Phase 1
document.addEventListener("mousemove", (e) => {
  headPos.x = (e.clientX / window.innerWidth - 0.5) * 2;
  headPos.y = -(e.clientY / window.innerHeight - 0.5) * 2;
});

// Touch support (mobile)
document.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  headPos.x = (t.clientX / window.innerWidth - 0.5) * 2;
  headPos.y = -(t.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

// --- Resize handling ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Build scene ---
buildRoom();
const cubeGroup = buildCube();
buildLights();

// --- Animation loop ---
let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.005;

  // Gentle cube rotation to show it's 3D
  cubeGroup.rotation.y = t * 0.4;
  cubeGroup.rotation.x = Math.sin(t * 0.3) * 0.15;

  // Smooth head position (simulates filter on real tracking)
  smoothed.x += (headPos.x - smoothed.x) * SMOOTH;
  smoothed.y += (headPos.y - smoothed.y) * SMOOTH;

  applyOffAxisProjection(smoothed.x, smoothed.y);

  renderer.render(scene, camera);
}

animate();
