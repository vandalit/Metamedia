# Hoja de Ruta — Metamedia Spatial Parallax

**Inicio:** 2026-05-30  
**Objetivo final:** Experiencia web donde el espacio físico frente a la pantalla es una zona de interacción 3D percibida con profundidad real.

---

## Fase 1 — POC Núcleo 3D (ACTIVA)

**Objetivo:** Validar la base técnica antes de añadir visión computacional.

| # | Tarea | Estado |
|---|-------|--------|
| 1.1 | Escena Three.js: cubo en habitación 4×4 | ✅ Completo |
| 1.2 | Iluminación básica (ambient + directional) | ✅ Completo |
| 1.3 | Control de cámara con mouse (simulación parallax) | ✅ Completo |
| 1.4 | Proyección off-axis (frustum asimétrico) | ⬜ Pendiente |
| 1.5 | Suavizado de movimiento (LERP / One-Euro filter) | ⬜ Pendiente |

**Entregable:** Demo funcional en navegador, cubo con efecto de ventana 3D al mover el mouse.

---

## Fase 2 — Head Tracking con Cámara

**Objetivo:** Reemplazar el mouse por posición real de la cabeza del usuario.

| # | Tarea | Estado |
|---|-------|--------|
| 2.1 | Integrar `@mediapipe/tasks-vision` (FaceLandmarker) | ⬜ |
| 2.2 | Extraer coordenadas XYZ de la cabeza (pose 3D) | ⬜ |
| 2.3 | Mapear espacio de cámara → espacio de frustum | ⬜ |
| 2.4 | Aplicar suavizado (One-Euro filter) | ⬜ |
| 2.5 | Calibración interactiva (ajuste de escala/sensibilidad) | ⬜ |
| 2.6 | Test en móvil (cámara frontal) | ⬜ |

**Entregable:** Parallax real: el cubo se mueve según dónde está la cabeza del usuario.

---

## Fase 3 — Reconocimiento de Gestos

**Objetivo:** El usuario puede interactuar con el cubo usando sus manos.

| # | Tarea | Estado |
|---|-------|--------|
| 3.1 | Integrar MediaPipe HandLandmarker | ⬜ |
| 3.2 | Detectar mano en el espacio de la cámara | ⬜ |
| 3.3 | Mapear posición de mano → espacio 3D escena | ⬜ |
| 3.4 | Gestos básicos: punto, puño, palma abierta | ⬜ |
| 3.5 | Interacción: "agarrar" y mover el cubo | ⬜ |
| 3.6 | Explorar alternativa Python + WebSocket para gestos complejos | ⬜ |

**Entregable:** El usuario puede señalar, rotar o desplazar el cubo con gestos.

---

## Fase 4 — Comprensión del Espacio Físico

**Objetivo:** Determinar las dimensiones del dispositivo y el espacio frente a la pantalla.

> Esta es la fase más compleja y experimental del proyecto.

| # | Tarea | Estado |
|---|-------|--------|
| 4.1 | Estimar distancia usuario-pantalla con FaceLandmarker Z + calibración | ⬜ |
| 4.2 | Calcular vector de vista (pantalla → usuario) | ⬜ |
| 4.3 | Determinar ángulo de cámara respecto al plano de pantalla | ⬜ |
| 4.4 | Estimar "volumen de interacción" visible por la cámara | ⬜ |
| 4.5 | Depth map monocular (MediaPipe Depth Anything / MiDaS) | ⬜ |
| 4.6 | Correlacionar depth map con posición de manos | ⬜ |
| 4.7 | Inferir tamaño físico del dispositivo (paso de calibración guiado) | ⬜ |
| 4.8 | Mostrar wireframe del "volumen de interacción" en la escena 3D | ⬜ |

**Entregable:** El sistema sabe dónde está la pantalla en el mundo físico, qué espacio tiene disponible, y puede proyectar eso como zona de interacción en la escena 3D.

---

## Fase 5 — Integración y Pulido

**Objetivo:** Unir todo, optimizar, hacer la experiencia cohesiva.

| # | Tarea | Estado |
|---|-------|--------|
| 5.1 | Pipeline unificado: face + hands + depth | ⬜ |
| 5.2 | Manejo de rendimiento (WebGPU vs WASM fallback) | ⬜ |
| 5.3 | UI de onboarding y calibración para usuario final | ⬜ |
| 5.4 | Degradación elegante (sin cámara, sin WebGPU) | ⬜ |
| 5.5 | Test cross-browser (Chrome, Firefox, Safari, móvil) | ⬜ |

---

## Desafíos Conocidos

### Calibración del espacio (Fase 4)
- La cámara monocular no entrega distancia métrica absoluta, solo relativa
- Necesitamos un **paso de calibración interactivo**: pedir al usuario que se siente a ~60cm y presione un botón
- El ángulo de la cámara varía mucho entre dispositivos (laptop vs tablet vs celular)
- En laptops, la cámara apunta levemente hacia abajo; en celulares puede estar en cualquier orientación
- La zona "sobre la pantalla" solo es visible si el ángulo de la cámara lo permite — esto hay que detectarlo

### Distancia usuario-pantalla
- FaceLandmarker da Z relativo, no métrico
- Estrategia: usar tamaño conocido de la cara (~18cm entre orejas) + focal length estimado para inferir distancia real
- Requiere conocer o aproximar los parámetros intrínsecos de la cámara (focal length)

### Rendimiento
- Pipeline completo (face + hands + depth) puede ser pesado en móvil
- Planear degradación: en móvil con poco poder, desactivar depth map y usar solo face tracking

---

## Referencias Clave

- [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker)
- [Three.js PerspectiveCamera — setViewOffset](https://threejs.org/docs/#api/en/cameras/PerspectiveCamera.setViewOffset)
- [MindDock Off-Axis Demo (GitHub)](https://github.com/MindDock/off-axis-demo)
- [Johnny Lee WiiMote Head Tracking](http://johnnylee.net/projects/wii/)
- [Depth Anything V2](https://github.com/DepthAnything/Depth-Anything-V2)
- [MiDaS (Intel)](https://github.com/isl-org/MiDaS)
