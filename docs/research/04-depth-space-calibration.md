# Profundidad & Calibración del Espacio

**Fecha:** 2026-05-30

> Este es el problema más difícil del proyecto. La mayor "pesadilla de calibración" que enfrentaremos.

---

## El Problema Central

Queremos saber:
1. **¿Dónde está el usuario respecto a la pantalla?** (distancia + ángulo)
2. **¿Qué espacio tiene la cámara disponible sobre/frente a la pantalla?** (volumen de interacción)
3. **¿Cuáles son las dimensiones físicas del dispositivo?** (para saber el tamaño de la "ventana")

Una cámara monocular (la mayoría de dispositivos) no puede medir distancia absoluta directamente. Hay que inferirla.

---

## Estrategias para Estimar Distancia Usuario-Pantalla

### Estrategia A: Tamaño de cara conocido + focal length (RECOMENDADA para Fase 2)

```
d = (ancho_cara_real * f) / ancho_cara_px
```

Donde:
- `ancho_cara_real` ≈ 0.15m (distancia inter-pupilar ~6.3cm, pero mejor usar 15cm oreja-oreja)
- `f` = focal length en píxeles
- `ancho_cara_px` = distancia entre landmarks 234 y 454 (orejas) en píxeles

**El problema:** `f` es desconocido. Opciones:
- Estimación desde resolución de cámara (muy imprecisa)
- Paso de calibración: "siéntate a 60cm, presiona este botón" → calcular `f` retrospectivamente
- MediaDevices API puede dar `focusDistance` en algunos navegadores (Chrome, Chrome for Android)

### Estrategia B: Landmark Z de FaceLandmarker

El Z del FaceLandmarker es relativo pero consistente. Se puede:
- Calibrar una curva de mapeo Z → distancia real con el paso de calibración guiado
- Suficiente para parallax si no necesitamos métrica exacta

### Estrategia C: Depth map monocular

**Modelos disponibles:**
| Modelo | Ventaja | Desventaja |
|--------|---------|-----------|
| Depth Anything V2 | SOTA, 62M imágenes | Pesado para browser, requiere ONNX export |
| MiDaS (Intel) | Sólido, bien probado | También requiere ONNX, más viejo |
| MediaPipe Depth Anything | En browser nativo, 2025 | Aún experimental |
| `@tensorflow-models/depth-estimation` | Fácil de instalar | Optimizado para portrait, menos general |

**Limitación clave:** Todos dan **profundidad relativa**, no métrica absoluta. Sin referencia de escala, no se puede saber si el usuario está a 50cm o 2m.

**Combinación ganadora:**
```
FaceLandmarker (posición 3D cara) + Depth map (contexto del entorno) 
→ correlacionar para entender el espacio completo
```

---

## Determinando el Ángulo de la Cámara

El ángulo de la cámara respecto al plano de la pantalla varía enormemente:
- **Laptop:** cámara en borde superior, apunta ~15° hacia abajo
- **Tablet en horizontal:** cámara lateral o superior
- **Celular en vertical:** cámara superior, apunta más pronunciadamente hacia abajo
- **Celular en horizontal:** cámara en un lado

**Estimación del ángulo:**
1. Si tenemos la posición 3D de la cara, el pitch (inclinación vertical) de la cabeza nos da una pista del ángulo de la cámara (si el usuario está mirando la pantalla, su cara está aproximadamente perpendicular a ella)
2. MediaPipe FaceLandmarker entrega la transformación facial completa (pitch, yaw, roll)
3. Si la cara tiene 0° de pitch, el usuario mira directo → podemos inferir el ángulo de la cámara = 90° - ángulo_pantalla

---

## Volumen de Interacción

El "volumen de interacción" es el espacio 3D que la cámara puede ver Y que está frente a la pantalla.

```
  Cámara (en borde superior de pantalla)
      |
      | ángulo de apertura (~70° horizontal)
      |
  [  PANTALLA  ]
      |
  Espacio frente al usuario
  (zona de interacción con manos)
```

**Para determinar este volumen:**
1. FOV de la cámara (generalmente ~70° horizontal para cámaras de laptop/celular)
2. Posición estimada de la cámara en el dispositivo (edge detection del dispositivo en el frame)
3. Distancia usuario-pantalla estimada

**Cálculo del frustum de interacción:**
```javascript
const fovH = 70 * Math.PI / 180;  // FOV horizontal típico
const d = estimatedUserDistance;    // metros
const interactionWidth = 2 * d * Math.tan(fovH / 2);
const interactionHeight = interactionWidth / aspectRatio;
```

---

## Inferir Dimensiones Físicas del Dispositivo

Este es el paso más ambicioso. Opciones:

### Opción A: Calibración guiada
- Pedir al usuario que ponga un objeto de tamaño conocido frente a la cámara (ej: una tarjeta de crédito)
- Calcular escala a partir de las dimensiones conocidas del objeto

### Opción B: User-Agent / APIs del sistema
- `screen.width`, `screen.height` → dimensiones en píxeles
- `window.devicePixelRatio` → densidad de píxeles
- Si conocemos el DPI del dispositivo, podemos calcular el tamaño físico de la pantalla
- Algunos navegadores exponen `screen.densityDpi` (Android) o podemos estimarlo

### Opción C: Inferencia por tamaño de cara
- Si el usuario está a distancia conocida (calibrada), y vemos cuántos píxeles ocupa la pantalla en el frame de cámara, podemos inferir su tamaño físico

### Opción D: Base de datos de dispositivos
- Detectar dispositivo por User-Agent y buscar en una base de datos de dimensiones de pantalla (frágil pero rápido)

---

## Plan de Calibración Interactiva (Fase 4)

```
PASO 1: Posicionar usuario
  "Siéntate cómodamente frente a la pantalla"
  "Asegúrate de que tu cara sea visible en la cámara"
  → Esperar que FaceLandmarker detecte cara con confianza > 0.8

PASO 2: Distancia de referencia
  "Ahora siéntate aproximadamente a un brazo de distancia (~60cm)"
  → Usuario presiona botón cuando esté listo
  → Capturar landmarks, calcular ancho de cara en px
  → Calcular focal length retrospectivo
  → Guardar como referencia de distancia 60cm

PASO 3: Verificación
  → Pedir al usuario que se mueva hacia adelante/atrás
  → Mostrar estimación de distancia en tiempo real
  → Usuario confirma que parece correcto

PASO 4: Calibración del ángulo de cámara (futuro)
  → Analizar pitch/yaw de cara cuando usuario mira directamente la pantalla
  → Inferir ángulo de cámara respecto al plano de pantalla
```

---

## Depth Map en Browser: Consideraciones Prácticas

**Setup con `@tensorflow-models/depth-estimation`:**
```javascript
import * as depthEstimation from "@tensorflow-models/depth-estimation";
import "@tensorflow/tfjs-backend-webgl";

const model = depthEstimation.SupportedModels.ARPortraitDepth;
const estimator = await depthEstimation.createEstimator(model);

const depthMap = await estimator.estimateDepth(videoElement, {
  minDepth: 0,
  maxDepth: 1
});
```

**Setup con MediaPipe Depth (más nuevo):**
- `@mediapipe/tasks-vision` → `ImageSegmenter` en modo depth
- Más reciente, potencialmente mejor calidad

---

## Estrategia Monocular vs Estereoscópica

| | Monocular (nuestra situación) | Estéreo |
|--|-------------------------------|---------|
| Hardware | Cámara frontal simple ✅ | Cámara dual (iPhone Pro, Kinect) |
| Distancia absoluta | No directamente | Sí, triangulación |
| Distancia relativa | Sí (depth map) | Sí |
| A distancias cortas (<50cm) | Impreciso | Excelente |
| A distancias largas (>2m) | Mejor | Degrada |
| Complejidad impl. | Alta (calibración) | Media (algoritmo claro) |

**Para nuestro caso de uso** (usuario a 40-100cm de pantalla):
- Monocular será impreciso en Z absoluto
- Suficiente para parallax relativo (no necesitamos Z exacto, solo proporcional)
- Para interacción con manos: el depth map + posición de landmarks da suficiente info

---

## Algoritmos de Interés para Profundidad

1. **Stereo block matching** — si tuviéramos dos cámaras
2. **Structure from Motion (SfM)** — requiere movimiento de cámara
3. **MonoDepth / Depth Anything** — red neuronal monocular, depth relativo
4. **SLAM simplificado** — tracking + mapeo simultáneo, muy pesado para browser
5. **Estimación desde face landmarks** — nuestro approach principal, práctico

---

## Referencias

- [Depth Anything V2](https://github.com/DepthAnything/Depth-Anything-V2)
- [MiDaS](https://github.com/isl-org/MiDaS)
- [TF.js Depth Estimation](https://www.npmjs.com/package/@tensorflow-models/depth-estimation)
- [MediaPipe Depth](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter)
- [Camera Calibration (OpenCV docs)](https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html)
- [Focal length estimation from face](https://learnopencv.com/head-pose-estimation-using-opencv-and-dlib/)
