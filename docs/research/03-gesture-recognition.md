# Reconocimiento de Gestos

**Fecha:** 2026-05-30

---

## Opciones Disponibles

### En Browser (JavaScript)

**MediaPipe HandLandmarker** (`@mediapipe/tasks-vision`) — RECOMENDADO
- Mismo paquete que FaceLandmarker → menos overhead
- 21 landmarks 3D por mano (ambas manos simultáneamente)
- Handedness detection (izquierda/derecha)
- Gestos pre-entrenados incluidos: thumb_up, pointing_up, victory, iloveyou, open_palm, closed_fist, ok
- `complexity` 0 o 1 (tradeoff velocidad/precisión)

**`@tensorflow-models/hand-pose-detection`**
- TensorFlow.js wrapper
- Alternativa viable, ligeramente más vieja
- Usa MediaPipe Hands como backend

---

## 21 Landmarks de la Mano

```
WRIST (0)
THUMB_CMC (1), THUMB_MCP (2), THUMB_IP (3), THUMB_TIP (4)
INDEX_FINGER_MCP (5), INDEX_FINGER_PIP (6), INDEX_FINGER_DIP (7), INDEX_FINGER_TIP (8)
MIDDLE_FINGER_MCP (9), MIDDLE_FINGER_PIP (10), MIDDLE_FINGER_DIP (11), MIDDLE_FINGER_TIP (12)
RING_FINGER_MCP (13), RING_FINGER_PIP (14), RING_FINGER_DIP (15), RING_FINGER_TIP (16)
PINKY_MCP (17), PINKY_PIP (18), PINKY_DIP (19), PINKY_TIP (20)
```

Cada landmark: `{x, y, z}` — x, y normalizados [0,1], z relativo.

---

## Configuración Básica

```javascript
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
  baseOptions: {
    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
    delegate: "GPU"
  },
  runningMode: "VIDEO",
  numHands: 1,        // 1-2
  minHandDetectionConfidence: 0.5,
  minHandPresenceConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

---

## Gestos Personalizados vs Pre-entrenados

Los 21 landmarks permiten calcular gestos custom:

```javascript
function isPointing(landmarks) {
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  
  const indexExtended = indexTip.y < indexPip.y;
  const middleCurled = middleTip.y > middlePip.y;
  
  return indexExtended && middleCurled;
}

function isPinch(landmarks, threshold = 0.05) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const dx = thumbTip.x - indexTip.x;
  const dy = thumbTip.y - indexTip.y;
  return Math.sqrt(dx*dx + dy*dy) < threshold;
}
```

---

## Gestos Planeados para el Proyecto

| Gesto | Trigger | Acción |
|-------|---------|--------|
| Palma abierta | HandLandmarker built-in | Seleccionar / hover |
| Puño cerrado | HandLandmarker built-in | Agarrar objeto |
| Punto con índice | Custom (landmark 8 extendido) | Señalar en espacio 3D |
| Pinch (pulgar + índice) | Custom (distancia < threshold) | Escalar objeto |
| Swipe (velocidad de muñeca) | Custom (delta de wrist en tiempo) | Lanzar / descartar |

---

## Python como Alternativa (Gestos Complejos)

Para gestos más complejos (reconocimiento de sign language, secuencias temporales):

**Stack Python:**
- `mediapipe` + `opencv-python` — pipeline de landmarks
- `numpy` / `scikit-learn` — clasificadores simples (SVM, KNN)
- `tensorflow` / `pytorch` — redes LSTM para gestos temporales

**Integración con browser:**
- Backend Python con WebSocket → envía estado de gesto al frontend
- Latencia adicional por red (~5-20ms local)
- Ventaja: modelos más pesados en servidor, no en browser

**¿Cuándo usar Python?**
- Gestos con secuencias temporales (e.g., dibujar una figura en el aire)
- Clasificación de ASL (American Sign Language)
- Cuando los 21 landmarks no son suficientes para el gesto deseado

---

## Gotchas

| Problema | Solución |
|----------|----------|
| 21 landmarks insuficientes para gestos finos | Entrenar clasificador custom con datos propios |
| Oclusión rompe tracking | Suavizado temporal, interpolación |
| Confusión izquierda/derecha en manos cruzadas | Usar handedness confidence, ignorar detecciones < 80% |
| Latencia primer frame | Warmup dummy inference |
| Manos fuera del frame | Detectar ausencia y notificar al usuario |

---

## Referencias

- [MediaPipe HandLandmarker docs](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker)
- [TF.js Hand Pose Detection](https://blog.tensorflow.org/2021/11/3D-handpose.html)
- [Hand Landmarks Reference](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
