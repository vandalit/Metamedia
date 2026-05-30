# Head Tracking & Efecto Parallax

**Fecha:** 2026-05-30

---

## Concepto: "Window into a Virtual World"

La ilusión 3D funciona así:
- La pantalla actúa como una **ventana** hacia un espacio virtual
- La cámara virtual en Three.js se ajusta según dónde está la cabeza del usuario
- Si el usuario se mueve a la izquierda, la ventana muestra más del lado derecho de la escena
- El resultado: el objeto 3D parece tener volumen y profundidad real

Esto es lo que hizo Johnny Lee en 2007 con el WiiMote. Hoy se puede lograr con cualquier webcam.

---

## Técnica Core: Off-Axis Perspective Projection (Frustum Asimétrico)

En lugar de una cámara centrada (frustum simétrico), usamos una cámara descentrada cuyo frustum depende de la posición de la cabeza del usuario.

### En Three.js hay 3 formas de implementarlo:

**Opción A: `camera.setViewOffset()` (RECOMENDADA)**
```javascript
camera.setViewOffset(
  fullWidth,   // ancho total del "display virtual"
  fullHeight,  // alto total del "display virtual"
  offsetX,     // desplazamiento horizontal según posición de cabeza
  offsetY,     // desplazamiento vertical
  width,       // ancho del viewport actual
  height       // alto del viewport actual
);
```
Ventaja: Three.js maneja el math internamente. Más limpio.

**Opción B: `Matrix4.makePerspective()` (control total)**
```javascript
camera.projectionMatrix.makePerspective(left, right, top, bottom, near, far);
// donde left/right/top/bottom se calculan según posición de cabeza
```

**Opción C: `camera.filmOffset`** — solo desplazamiento horizontal, menos flexible.

---

## Pipeline Completo

```
Webcam
  ↓
MediaPipe FaceLandmarker
  → 468 landmarks 3D
  → Head pose matrix (Procrustes Analysis)
  → Posición del rostro en espacio de cámara (X, Y, Z relativo)
  ↓
Coordinate Mapper
  → Normalizar coordenadas de cámara → espacio de pantalla
  → Escalar Z relativo a profundidad estimada
  ↓
One-Euro Filter / LERP (suavizado)
  → Eliminar jitter del tracking
  ↓
Three.js: camera.setViewOffset()
  → Recalcular frustum cada frame
  ↓
Render
```

---

## MediaPipe FaceLandmarker

**Paquete:** `@mediapipe/tasks-vision`

### Lo que entrega:
- 468 landmarks con coordenadas (x, y, z) normalizadas
- `x`, `y`: coordenadas de pantalla normalizadas [0, 1]
- `z`: profundidad relativa (escala bajo proyección de perspectiva débil) — **NO es distancia métrica absoluta**
- Head pose: matriz de rotación 3D (pitch, yaw, roll) via Procrustes Analysis

### Landmarks clave para posición de cabeza:
- `1` — punta de la nariz
- `33`, `263` — esquinas externas de ojos
- `152` — mentón
- `10` — frente

### Configuración básica:
```javascript
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const filesetResolver = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);

const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
  baseOptions: {
    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    delegate: "GPU"
  },
  outputFaceBlendshapes: false,
  runningMode: "VIDEO",
  numFaces: 1
});
```

---

## Estimación de Distancia Usuario-Pantalla

El Z del FaceLandmarker es relativo, no métrico. Para estimar distancia real:

**Estrategia con tamaño de cara conocido:**
```
distancia_estimada = (ancho_cara_real_cm * focal_length_px) / ancho_cara_en_px
```
- `ancho_cara_real_cm` ≈ 15cm (distancia inter-pupilar promedio) o ~18cm (oreja a oreja)
- `focal_length_px` = focal length de la cámara en píxeles (necesita calibración o estimación)
- `ancho_cara_en_px` = distancia entre landmarks de orejas/ojos en píxeles

**El problema:** No sabemos el focal length de la cámara del usuario. Estrategias:
1. Usar un valor estimado típico (depende de resolución) y hacer que el usuario calibre
2. Usar la API MediaDevices para obtener constraints de la cámara (no siempre disponible)
3. Paso de calibración guiado: pedir al usuario que se siente a X distancia conocida

---

## Suavizado: One-Euro Filter

El jitter en el tracking genera movimiento de cámara nervioso. Solución: One-Euro filter.

```javascript
class OneEuroFilter {
  constructor(freq, mincutoff = 1.0, beta = 0.007, dcutoff = 1.0) {
    this.freq = freq;
    this.mincutoff = mincutoff;
    this.beta = beta;
    this.dcutoff = dcutoff;
    this.xfilt = new LowPassFilter(this.alpha(mincutoff));
    this.dxfilt = new LowPassFilter(this.alpha(dcutoff));
  }
  
  alpha(cutoff) {
    const te = 1.0 / this.freq;
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / te);
  }
  
  filter(x) {
    const dx = this.xfilt.hasLastRawValue()
      ? (x - this.xfilt.lastRawValue()) * this.freq
      : 0;
    const edx = this.dxfilt.filter(dx);
    const cutoff = this.mincutoff + this.beta * Math.abs(edx);
    return this.xfilt.filter(x, this.alpha(cutoff));
  }
}
```

Parámetros a tunear:
- `beta`: velocidad de respuesta (mayor = más rápido pero más jitter)
- `mincutoff`: suavizado en reposo (menor = más suave pero más lag)

---

## Gotchas Conocidos

| Problema | Solución |
|----------|----------|
| Jitter excesivo | One-Euro filter o LERP agresivo |
| Parallax invertido | Invertir signo del offset en setViewOffset |
| Z no métrico | Estrategia de tamaño de cara conocido + calibración |
| Latencia cold start | Warmup dummy inference al iniciar la app |
| Firefox camera issues | Detectar y advertir al usuario |
| Mala iluminación | Mostrar indicador de calidad del tracking |

---

## Referencias

- [MediaPipe FaceLandmarker docs](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker)
- [MindDock off-axis-demo](https://github.com/MindDock/off-axis-demo)
- [Johnny Lee original (2007)](http://johnnylee.net/projects/wii/)
- [Three.js setViewOffset docs](https://threejs.org/docs/#api/en/cameras/PerspectiveCamera.setViewOffset)
- [One-Euro Filter paper](https://gery.casiez.net/1euro/)
