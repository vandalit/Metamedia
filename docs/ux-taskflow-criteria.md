# Criterios UX — Task Flows del POC

**Fecha:** 2026-05-30  
**Contexto:** Interfaz de depuración para el POC de parallax 3D. Los principios aquí documentados aplican a cualquier interfaz que gestione múltiples fuentes de input concurrentes con prioridad variable.

---

## Principio central: todo lo que se activa debe poder desactivarse

Cualquier función que el usuario active mediante un botón debe poder desactivarse con el mismo control. El botón refleja el estado actual, no una acción futura ambigua.

| Estado | Texto del botón | Clase visual |
|--------|----------------|--------------|
| inactivo | "Giroscopio" / "Cámara" | neutro |
| activo | "Gyro ON" / "Cam ON" | `.ok` (verde) |

Si el botón muestra estado activo y el usuario hace clic, se desactiva. No hay flujos de solo-activar.

---

## Stack de prioridad de inputs

Los inputs tienen prioridad jerárquica. El input de mayor prioridad disponible toma control de `raw.x / raw.y`. Los inputs de menor prioridad están bloqueados mientras uno superior esté activo.

```
Cámara (face tracking)   — prioridad 1 (más alta)
Giroscopio               — prioridad 2
Mouse / Touch            — prioridad 3 (siempre disponible, sin permisos)
```

**Reglas de bloqueo:**
- Mouse y touch comprueban `gyro.active || (cam.active && cam.tracking)` antes de escribir `raw`
- Cuando la cámara pierde la cara (`cam.tracking = false`), mouse/touch retoman inmediatamente
- Cuando el giroscopio se desactiva, mouse/touch retoman inmediatamente

**Fallback encadenado:** si la cámara está activa pero no detecta cara, el giroscopio (si está activo) sigue controlando el parallax. La cámara solo toma control cuando hay tracking efectivo.

---

## Chip de input activo (`c-input`)

El chip en la barra superior siempre refleja quién está escribiendo en `raw` en este momento.

| Situación | Chip |
|-----------|------|
| Ningún input activo | `input: —` (dim) |
| Mouse moviéndose | `mouse` (ok) |
| Touch activo | `touch` (ok) |
| Giroscopio activo | `gyro` (ok) |
| Face tracking activo | `face` (ok) |
| Face tracking perdido (cámara activa pero sin cara) | retrocede al input anterior |

El chip se actualiza en cada evento de input y en cada transición de estado (activar, desactivar, perder tracking).

---

## Patrones de transición de estado

### Activar giroscopio
1. Botón disabled durante el proceso de permiso (evita doble-click)
2. 3 capas de activación (iOS → Generic Sensor → DeviceOrientation)
3. En éxito: botón → "Gyro ON" + clase ok; `btn-cal` habilitado
4. En falla: help overlay contextual (Brave / iOS-denied / genérico)

### Desactivar giroscopio
1. Click en "Gyro ON" llama `deactivateGyro()`
2. Detiene el sensor (`sensor.stop()` si Generic Sensor)
3. `raw` se resetea a 0, smoothed converge a centro en los siguientes frames
4. Chip de input retrocede a "input: —" (a menos que cámara esté activa)
5. `btn-cal` vuelve a disabled

### Activar cámara (flujo completo, desde bottom bar)
1. `quickCam()` abre el panel si está cerrado
2. Descarga MediaPipe si no está cargado (~3 MB, una sola vez por sesión)
3. Solicita permiso de cámara (`getUserMedia`)
4. En éxito: chip `cam: on`, botón bottom bar → "Cam ON" + ok, botón panel → "Detener"
5. `processFrame()` empieza a correr a ~30fps dentro del loop de animación

### Detener cámara
1. Click en "Cam ON" (bottom bar) o "Detener" (panel) llama `stopCamera()`
2. Detiene los tracks del stream
3. Resetea chip de input al fallback correcto (gyro si activo, sino "input: —")
4. Ambos botones (panel y bottom bar) vuelven a estado inactivo

---

## Reset de posición

| Evento | Comportamiento |
|--------|---------------|
| `touchend` | `raw` → 0 si no hay gyro ni face tracking |
| `mouseleave` | `raw` → 0 si no hay gyro ni face tracking |
| Desactivar gyro | `raw` → 0 inmediato |
| Desactivar cámara | sin reset de `raw` (puede quedar en última posición; el usuario puede mover mouse) |
| Calibrar gyro | `raw` y `smoothed` → 0 |
| Calibrar cámara | `calibYaw/calibPitch` capturan pose actual; `raw` → 0 |

El LERP (0.12) suaviza la convergencia a 0 automáticamente en los frames siguientes. No se hace reset brusco excepto en calibración.

---

## Bottom bar vs panel de cámara

**Bottom bar** — acciones de flujo principal. Máximo 3 botones, sin estado complejo visible. El usuario no necesita abrir ningún panel para activar una fuente de input.

**Panel de cámara** — vista de depuración. Muestra el video, landmarks, stats de yaw/pitch. Solo relevante durante desarrollo. Se puede arrastrar para no obstruir la escena.

**Principio:** una acción del bottom bar nunca requiere que el panel esté abierto. `quickCam()` abre el panel y activa la cámara en un solo gesto si el usuario parte desde el botón inferior.

---

## Criterio para botones disabled

Un botón está disabled solo cuando su acción **no puede ejecutarse en ese momento** (no como placeholder o feature futura):

- `btn-cal` (calibrar gyro): disabled hasta que gyro esté activo
- `btn-cam-cal` (calibrar cámara): disabled hasta que cámara esté activa
- `btn-cam-on` (activar/detener en panel): disabled hasta que MediaPipe esté cargado

Botones de features futuras no existen en la UI hasta estar implementados.

---

## Guards de input — resumen de condiciones

```javascript
// touch y mouse solo escriben raw si no hay input de mayor prioridad activo
const higherPriorityActive = gyro.active || (cam.active && cam.tracking);

// cada listener de lower-priority:
if (higherPriorityActive) return;
```

La condición `cam.active && cam.tracking` distingue entre "cámara encendida" y "cara siendo detectada en este momento". Sin cara → fallback habilitado.
