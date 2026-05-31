# Criterios Ópticos — Sistema de Parallax Off-Axis

**Fecha:** 2026-05-31  
**Contexto:** POC de parallax 3D controlado por head tracking (cámara) o giroscopio sobre pantalla de dispositivo móvil.

---

## El modelo óptico

### Ilusión de "ventana al mundo 3D"

El sistema simula que la pantalla es un **vidrio fijo** a través del cual se ve un espacio 3D. Al mover la cabeza, el espectador ve el espacio desde un ángulo distinto — exactamente como una ventana real.

La clave matemática: en proyección perspectiva off-axis, **z=0 en el espacio de mundo siempre llena exactamente el viewport**, sin importar la posición del ojo. Los objetos en z≠0 se desplazan aparentemente en pantalla.

```
EYE (x=eyeX, y=eyeY, z=EYE_Z)
        │
        │  frustum off-axis (asimétrico)
        │
════════╪════════  pantalla = z=0 = viewport exacto
   [obj z<0]       objetos lejanos → se mueven con el ojo
   [obj z>0]       objetos cercanos → se mueven opuesto al ojo
```

---

## Valores actuales del sistema

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| `EYE_Z` | 5 | Posición Z del ojo (world units) |
| `VFOV_R` | 55° | Campo de visión vertical |
| `DEPTH_NEAR` | +3.0 | Límite frontal de la habitación |
| `DEPTH_FAR` | -2.5 | Pared trasera (z = -2.5) |
| `HEAD_YAW_RANGE` | 22° | Giro de cabeza = parallax máximo |
| `HEAD_PITCH_RANGE` | 18° | Inclinación = parallax vertical máximo |
| `LERP` | 0.12 | Suavizado de entrada (por frame) |

### Dimensiones derivadas de viewport (portrait mobile, aspect ≈ 0.46)

| Variable | Cálculo | Valor aprox. |
|----------|---------|--------------|
| `halfH` | EYE_Z × tan(VFOV/2) | ≈ 2.60 wu |
| `halfW` | halfH × aspect | ≈ 1.20 wu |
| `maxEye` | min(halfW × 0.5, 1.5) | ≈ 0.60 wu |

---

## Análisis del desplazamiento aparente

Para un punto en (0, 0, z) con ojo en (eyeX, 0, EYE_Z):

```
desplazamiento_en_pantalla(z) = eyeX × (−z) / (EYE_Z − z)
```

Tabla con maxEye = 0.60 (movimiento completo, 22° de giro):

| Objeto | z | Shift (wu) | % screen half-width |
|--------|---|-----------|---------------------|
| vClose | +2.5 | −0.60 | **−50%** |
| close  | +1.0 | −0.15 | −12.5% |
| center | 0    | 0     | 0% (fijo) |
| far    | −1.5 | +0.14 | +11.5% |
| vFar   | −1.9 | +0.17 | +13.7% |

Con movimiento natural de 5° (no 22°) — raw.x ≈ 0.23:

| Objeto | Shift real aprox. (px en pantalla 400px wide) |
|--------|-----------------------------------------------|
| vClose | ~23px |
| close  | ~6px |
| center | 0px |
| far    | ~5px |
| vFar   | ~6px |

**Conclusión**: el efecto matemáticamente existe y es correcto. La percepción débil se debe a que el rango de mapping (22°) es conservador para movimiento natural frente a un teléfono.

---

## Flujo de inputs activos

```
processFrame() →  cam.lastYaw, cam.lastPitch (degrees)
              →  raw.x = clamp(−yaw / HEAD_YAW_RANGE, −1, 1)
              →  raw.y = clamp(pitch / HEAD_PITCH_RANGE, −1, 1)

animate() →  smoothed.x += (raw.x − smoothed.x) × LERP

applyOffAxis() →  maxEye = min(halfW × 0.5, 1.5)
               →  eyeX = smoothed.x × maxEye
               →  frustum recalculado con ojo en (eyeX, eyeY, EYE_Z)
```

---

## Auditoría: puntos de mejora identificados

### 1. HEAD_YAW_RANGE demasiado conservador
**Problema:** 22° es el ángulo de un giro notable de cabeza. Frente a un teléfono, el movimiento natural es 3–8°.  
**Efecto:** con 5°, raw.x ≈ 0.23 → desplazamiento de vClose ≈ 23px en pantalla 400px.  
**Mejora:** reducir a 12–15° → mismo movimiento físico produce 45–80% más parallax.

### 2. maxEye al 50% de halfW
**Problema:** `min(halfW × 0.5, 1.5)` = 0.60wu en portrait. El ojo solo se desplaza la mitad del espacio disponible.  
**Mejora:** subir a 0.65–0.75 × halfW → más recorrido de eye position → más diferencial de parallax entre objetos cercanos y lejanos.

### 3. LERP introduce lag perceptible
**Valor actual:** 0.12 → a 60fps, 50% del target se alcanza en ~8 frames (~130ms).  
**Para giroscopio:** está bien, suaviza el ruido del sensor.  
**Para cámara:** el face tracking ya tiene su propio lag. El LERP adicional puede hacer la respuesta demasiado lenta.  
**Mejora:** LERP diferenciado: 0.12 para gyro, 0.18–0.20 para face tracking.

### 4. EYE_Z no calibrado
**Problema:** EYE_Z=5 world units es una constante arbitraria. No corresponde a ninguna distancia física real (cm/pulgadas) al dispositivo.  
**Efecto:** el usuario real puede estar a 20cm o 60cm de la pantalla. La escala del parallax cambia.  
**Mejora futura:** calibración de distancia física. Una opción: usar el tamaño facial detectado en los landmarks para estimar distancia relativa (cuando el rostro se acerca, los landmarks se expanden → proxy de distancia).

### 5. Cubo central en z=0 nunca se mueve
**Problema:** el objeto más visible (center cube, z=0) es el de cero parallax. Si el usuario lo fija, el efecto es invisible.  
**Mejora:** desplazarlo a z=±0.3 o reemplazarlo por algo que no esté exactamente en el plano del vidrio.

### 6. Objetos z<0 se mueven "con" el ojo
**Comportamiento correcto:** en parallax off-axis, objetos detrás del plano se mueven en la misma dirección del ojo (lag de profundidad), objetos delante se mueven en dirección opuesta.  
**Posible confusión:** para usuarios sin referencia óptica previa, la dirección del movimiento de objetos lejanos puede parecer "incorrecta". No es un bug — es física de ventana.

### 7. Sin detección de distancia real
No existe ninguna variable que estime la distancia física entre usuario y pantalla. Todo el sistema trabaja en world units, no en centímetros. El diagrama SPACE por tanto no puede mostrar "70cm" — solo puede mostrar relaciones relativas en world units.

---

## Variables disponibles para debug / diagrama

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `smoothed.x / .y` | float [-1,1] | Posición suavizada del ojo, normalizada |
| `raw.x / .y` | float [-1,1] | Posición instantánea, sin suavizar |
| `cam.lastYaw` | degrees | Ángulo yaw de la cabeza (cámara) |
| `cam.lastPitch` | degrees | Ángulo pitch de la cabeza (cámara) |
| `cam.tracking` | bool | Cara detectada en este frame |
| `gyro.gamma / .beta` | degrees | Ángulo del giroscopio |
| `VP.halfW / .halfH` | world units | Semi-dimensiones de la habitación |
| `DEPTH_NEAR / FAR` | world units | Límites de profundidad |
| `EYE_Z` | world units | Posición Z del ojo |

**No disponible (no calculado):** distancia física real (cm), tamaño físico de pantalla (pulgadas), latencia de red, framerate de face tracking.

---

## Estado del POC

La tecnología cubre el flujo completo. Lo que falta es **calibración**:
- Ajustar HEAD_YAW_RANGE al comportamiento real de movimiento de cabeza frente a pantalla
- Determinar la relación entre EYE_Z (5wu) y distancia física real (tipicamente 25–45cm para móvil)
- Evaluar si LERP diferenciado por fuente de input mejora la respuesta subjetiva

Estos ajustes se harán con referencia a las matemáticas del diagrama SPACE y al feedback de prueba en dispositivo real.
