# Hoja de Ruta — Metamedia Spatial Parallax

**Inicio:** 2026-05-30  
**Última revisión:** 2026-05-31  
**Objetivo final:** Experiencia web donde el espacio físico frente a la pantalla es una zona de interacción 3D percibida con profundidad real.

---

## Fase 1 — POC Núcleo 3D ✅ COMPLETA

**Objetivo:** Validar la base técnica antes de añadir visión computacional.

| # | Tarea | Estado | Notas |
|---|-------|--------|-------|
| 1.1 | Escena Three.js con objetos en habitación | ✅ Superado | Habitación viewport-derived (±halfW, ±halfH); 5 objetos con geometría variada |
| 1.2 | Iluminación básica | ✅ Completo | Ambient + directional + point fill |
| 1.3 | Control de posición del ojo | ✅ Superado | Mouse + touch + giroscopio (3-layer) + face tracking — no es "simulación", es input de prioridad más baja permanente |
| 1.4 | Proyección off-axis (frustum asimétrico) | ✅ Completo | `applyOffAxis()` con `makePerspective()` asimétrico. z=0 siempre llena exactamente el viewport. **Nunca llamar `updateProjectionMatrix()`**. |
| 1.5 | Suavizado de movimiento | ✅ Implementado | LERP adaptativo por fuente: LERP_CAM=0.50, LERP_GYRO=0.12, LERP_TOUCH=0.15. One-Euro filter queda como mejora futura. |

**Entregable alcanzado:** Demo funcional con efecto de ventana 3D, múltiples inputs, parallax correcto.

---

## Fase 2 — Head Tracking con Cámara 🔄 EN VALIDACIÓN

**Objetivo:** Reemplazar el mouse por posición real de la cabeza del usuario.

| # | Tarea | Estado | Notas |
|---|-------|--------|-------|
| 2.1 | Integrar `@mediapipe/tasks-vision` (FaceLandmarker) | ✅ Completo | Lazy-load, GPU delegate, VIDEO mode; se descarga una vez por sesión |
| 2.2 | Extraer pose 3D de la cabeza | ✅ Completo | `facialTransformationMatrixes` → yaw/pitch via ZYX Euler. Fallback: posición de nariz (landmark 1) |
| 2.3 | Mapear tracking → frustum | ✅ Completo | yaw/pitch → raw.x/y normalizado [-1,1] → eyeX/Y en world units en `applyOffAxis()`. El roadmap original sugería transformación de espacio 3D — el enfoque angular es más correcto y directo. |
| 2.4 | Suavizado | ✅ Completo | LERP adaptativo; processFrame dispara en `video.currentTime` (no en timer de 33ms) |
| 2.5 | Calibración interactiva | ✅ Completo | `calibrateCamera()` captura pose actual como baseline yaw/pitch. Botón en panel y en bottom bar. |
| 2.6 | Test en móvil (cámara frontal) | 🔄 En curso | Validación subjetiva del efecto en dispositivo real |

**Pendiente inmediato (post-testeo):**
- Ajustar `HEAD_YAW_RANGE` y `maxEye` según feedback de percepción real
- Medir FPS + lag en dispositivo (debug overlay lo muestra ahora en tiempo real)
- Evaluar si la percepción de profundidad mejora con los ajustes de 2026-05-31: YAW 22°→14°, maxEye 50%→65%, cubo central z=0→z=+0.4

**Entregable:** Parallax real — la escena responde a dónde está la cabeza del usuario. ✅ Técnicamente funcional, validación perceptual en curso.

---

## Fase 3 — Reconocimiento de Gestos ⬜ PENDIENTE

**Objetivo:** El usuario puede interactuar con el cubo usando sus manos.

| # | Tarea | Estado |
|---|-------|--------|
| 3.1 | Integrar MediaPipe HandLandmarker | ⬜ |
| 3.2 | Detectar mano en el espacio de la cámara | ⬜ |
| 3.3 | Mapear posición de mano → espacio 3D escena | ⬜ |
| 3.4 | Gestos básicos: punto, puño, palma abierta | ⬜ |
| 3.5 | Interacción: "agarrar" y mover objetos | ⬜ |
| 3.6 | Explorar alternativa Python + WebSocket para gestos complejos | ⬜ |

**Prerrequisito:** Validar que la ilusión óptica de Fase 2 funciona satisfactoriamente.

---

## Fase 4 — Comprensión del Espacio Físico ⬜ PENDIENTE

**Objetivo:** Determinar las dimensiones del dispositivo y el espacio frente a la pantalla.

> Esta es la fase más compleja y experimental del proyecto.

| # | Tarea | Estado | Notas |
|---|-------|--------|-------|
| 4.1 | Estimar distancia usuario-pantalla | ⬜ | Contexto documentado en `optical-criteria.md`. Estrategia: tamaño de cara (~18cm entre orejas) + focal length estimado → distancia métrica relativa |
| 4.2 | Calcular vector de vista (pantalla → usuario) | ⬜ | |
| 4.3 | Determinar ángulo de cámara respecto al plano de pantalla | ⬜ | |
| 4.4 | Estimar "volumen de interacción" visible por la cámara | ⬜ | |
| 4.5 | Depth map monocular (MediaPipe Depth Anything / MiDaS) | ⬜ | |
| 4.6 | Correlacionar depth map con posición de manos | ⬜ | |
| 4.7 | Inferir tamaño físico del dispositivo (calibración guiada) | ⬜ | |
| 4.8 | Mostrar wireframe del "volumen de interacción" en escena 3D | ⬜ | |

---

## Fase 5 — Integración y Pulido ⬜ PENDIENTE

**Objetivo:** Unir todo, optimizar, hacer la experiencia cohesiva.

| # | Tarea | Estado | Notas |
|---|-------|--------|-------|
| 5.1 | Pipeline unificado: face + hands + depth | ⬜ | |
| 5.2 | Manejo de rendimiento (WebGPU vs WASM fallback) | ⬜ | |
| 5.3 | UI de onboarding y calibración para usuario final | ⬜ | |
| 5.4 | Degradación elegante (sin cámara, sin WebGPU) | ⬜ Parcial | El fallback encadenado face > gyro > touch ya existe |
| 5.5 | Test cross-browser (Chrome, Firefox, Safari, móvil) | ⬜ | |

---

## Surgido durante implementación (no contemplado en roadmap original)

Funcionalidad entregada que el roadmap no anticipaba:

| Item | Descripción |
|------|-------------|
| Giroscopio 3-layer | iOS `requestPermission` → Generic Sensor API → DeviceOrientationEvent, con timeout y Brave detection |
| Input priority stack | face (prio 1) > gyro (prio 2) > touch/mouse (prio 3). Documentado en `ux-taskflow-criteria.md` |
| Panel SPACE | Diagrama top-down en tiempo real de la escena 3D — posición del ojo, objetos, zonas real/virtual |
| Panel CAM | Video + landmarks MediaPipe, drag+drop, colapso toggle, stats yaw/pitch |
| Debug overlay FPS + lag | `${fps}fps lag:${n}ms` — latencia de pipeline de cámara medible en tiempo real |
| `processFrame` on frame | Se dispara en `video.currentTime` (no en timer), latencia mínima |
| LERP adaptativo | Diferente constante de suavizado por fuente de input |
| Documentación técnica | `optical-criteria.md`, `ux-taskflow-criteria.md`, 5 docs de research |

---

## Evaluación técnica pendiente (antes de Fase 3)

| Item | Descripción |
|------|-------------|
| One-Euro filter | Sustituye LERP: elimina lag en movimiento rápido, suaviza en quieto. Implementación ~50 líneas. |
| Sensor fusion | Giroscopio (8-16ms, ruidoso) + cámara (66-100ms, absoluto) → filtro complementario. Target: latencia percibida <30ms |
| EYE_Z calibrado | Relacionar EYE_Z=5 world units con distancia física real (típicamente 25-45cm en móvil) |

---

## Desafíos Conocidos

### Calibración del espacio (Fase 4)
- La cámara monocular no entrega distancia métrica absoluta, solo relativa
- Necesitamos un **paso de calibración interactivo**: pedir al usuario que se siente a ~60cm y presione un botón
- El ángulo de la cámara varía mucho entre dispositivos (laptop vs tablet vs celular)
- En laptops, la cámara apunta levemente hacia abajo; en celulares puede estar en cualquier orientación

### Distancia usuario-pantalla
- FaceLandmarker da Z relativo, no métrico
- Estrategia: usar tamaño conocido de la cara (~18cm entre orejas) + focal length estimado para inferir distancia real
- Requiere conocer o aproximar los parámetros intrínsecos de la cámara

### Rendimiento
- Pipeline completo (face + hands + depth) puede ser pesado en móvil
- Planear degradación: en móvil con poco poder, desactivar depth map y usar solo face tracking

### Percepción de profundidad (problema activo, 2026-05-31)
- El efecto matemáticamente es correcto (`shift(z) = eyeX × (-z) / (EYE_Z - z)`)
- La latencia total del pipeline (cámara ~66ms + LERP anterior ~300ms = ~370ms) rompía la conexión cabeza→escena
- Ajustes aplicados: HEAD_YAW_RANGE 22°→14°, maxEye 50%→65%, LERP_CAM 0.12→0.50, cubo central z=0→z=+0.4
- Validación en curso — el debug overlay mostrará fps y lag en tiempo real

---

## Referencias Clave

- [MediaPipe Tasks Vision — FaceLandmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker)
- [Johnny Lee WiiMote Head Tracking (referencia histórica del concepto)](http://johnnylee.net/projects/wii/)
- [Depth Anything V2](https://github.com/DepthAnything/Depth-Anything-V2)
- [MiDaS (Intel)](https://github.com/isl-org/MiDaS)

> **Referencia retirada:** Three.js `setViewOffset` — no fue necesario. `makePerspective()` asimétrico es más correcto para off-axis y fue lo implementado.
