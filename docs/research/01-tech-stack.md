# Stack Tecnológico

**Fecha:** 2026-05-30

---

## Paquetes NPM Principales

```json
{
  "rendering":         "three",
  "faceLandmarking":   "@mediapipe/tasks-vision",
  "handTracking":      "@mediapipe/tasks-vision",
  "depthEstimation":   "@tensorflow-models/depth-estimation",
  "depthEstAlt":       "onnxruntime-web (para exportar MiDaS/DPT/Depth Anything V2)",
  "smoothing":         "one-euro-filter (npm) o implementación propia Kalman/LERP",
  "inference":         "onnxruntime-web"
}
```

---

## Repos de Referencia

| Proyecto | URL | Stack | Utilidad |
|----------|-----|-------|----------|
| off-axis-demo | github.com/MindDock/off-axis-demo | Three.js + MediaPipe FaceMesh | Demo de parallax off-axis en producción |
| desktop-vr | github.com/jasondecamp/desktop-vr | Three.js + FaceMesh + One-Euro filter | Pipeline completo con suavizado |
| parallax-effect | github.com/munrocket/parallax-effect | Face tracking + 3D parallax | Efecto parallax inmersivo |
| monocular_depth_demo | github.com/timmh/monocular_depth_estimation_demo | MiDaS + TensorFlow.js | Depth estimation en browser |
| jeelizFaceFilter | github.com/jeeliz/jeelizFaceFilter | WebGL + Three.js | AR filters con face tracking |
| Depth-Anything-V2 | github.com/DepthAnything/Depth-Anything-V2 | PyTorch | Modelo SOTA depth monocular (exportable a ONNX) |
| MiDaS | github.com/isl-org/MiDaS | PyTorch/ONNX | Depth monocular (Intel) |

---

## Librerías Evaluadas y Decisiones

### Face Tracking
| Librería | Estado | Decisión |
|----------|--------|----------|
| **MediaPipe FaceLandmarker** (`@mediapipe/tasks-vision`) | Activo, Google 2025 | ✅ **Usar** — 468 landmarks 3D, head pose, mantenido |
| face-api.js | Estado incierto | ❌ Evitar — supersedido por MediaPipe |
| jeelizFaceFilter | Activo | ⚠️ Alternativa si se necesita WebGL nativo |
| clmtrackr | Maduro/aging | ❌ No recomendado para proyectos nuevos |
| tracking.js | Maduro/aging | ❌ Demasiado básico |

### Hand Tracking
| Librería | Estado | Decisión |
|----------|--------|----------|
| **MediaPipe HandLandmarker** (`@mediapipe/tasks-vision`) | Activo, Google 2025 | ✅ **Usar** — mismo paquete que face, 21 landmarks 3D por mano |
| `@tensorflow-models/hand-pose-detection` | Activo | ⚠️ Alternativa viable |
| HandTrack.js | Sin resultados 2025 | ❌ Posiblemente abandonado |

### Depth Estimation
| Librería | Estado | Decisión |
|----------|--------|----------|
| `@tensorflow-models/depth-estimation` | Activo | ✅ Usar para depth relativo, optimizado para portrait |
| MediaPipe Depth Anything | Activo 2025 | ✅ Alternativa más nueva, 62M imágenes de training |
| MiDaS via ONNX.js | Activo | ⚠️ Más setup, mejor calidad absolute depth |
| Depth Anything V2 via ONNX | Activo | ✅ SOTA, requiere exportar modelo |

### 3D Rendering
- **Three.js** — decisión obvia para web 3D interactivo
- Técnica: `camera.setViewOffset()` para frustum asimétrico (más limpio que manipular matrices directamente)

---

## Compatibilidad de Navegadores

| Componente | Chrome | Firefox | Safari | Mobile |
|------------|--------|---------|--------|--------|
| MediaPipe FaceLandmarker | ✅ | ⚠️ Issues reportados | ❓ Sin data 2025 | ✅ |
| MediaPipe HandLandmarker | ✅ | ⚠️ | ❓ | ✅ |
| TF.js depth estimation | ✅ | ✅ | ✅ | ⚠️ Lento |
| Three.js off-axis | ✅ | ✅ | ✅ | ⚠️ Perf |
| ONNX.js + WebGPU | ✅ | Firefox 131+ | Safari 18+ | ⚠️ Limitado |
| WebAssembly (WASM) | ✅ | ✅ | ✅ | ✅ |

---

## Consideraciones de Rendimiento

- **Cold start (primera inferencia):** 500ms–3.5s por compilación WASM/WebGPU
- **Inferencia continua:** 50–350ms según modelo y backend
- **WebGPU:** ~5× más lento que GPU nativa → usar donde esté disponible
- **WASM:** ~15-17× más lento que CPU nativa → fallback
- **Estrategia:** warmup con inferencia dummy al iniciar para ocultar latencia inicial
- **En móvil:** desactivar depth map si el rendimiento es insuficiente
