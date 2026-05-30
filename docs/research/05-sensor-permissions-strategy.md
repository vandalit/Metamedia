# Estrategia de Permisos de Sensores — Cross-Browser

**Fecha:** 2026-05-30  
**Contexto:** Acceso a giroscopio/acelerómetro para parallax sin cabeza (head-tracking alternativo)

---

## El problema raíz

Los sensores de movimiento tienen un modelo de permisos fragmentado. A diferencia de la cámara (`getUserMedia`) o la ubicación (`geolocation`), no existe un estándar único de solicitud de permisos para sensores en todos los browsers.

```
getUserMedia() → Estándar W3C → Dialog nativo en TODOS los browsers ✅
DeviceOrientationEvent → Sin estándar de permisos → Cada browser decide ⚠️
GenericSensor API → Estándar W3C nuevo → Parcialmente implementado ⚠️
```

---

## Mapa de compatibilidad

| Browser | Plataforma | Mecanismo | Resultado |
|---------|-----------|-----------|-----------|
| **Safari** | iOS 13+ | `DeviceOrientationEvent.requestPermission()` | ✅ Dialog nativo |
| **Chrome** | iOS | WebKit obligatorio → misma API que Safari | ✅ Dialog nativo |
| **Firefox** | iOS | WebKit obligatorio → misma API que Safari | ✅ Dialog nativo |
| **Brave** | iOS | WebKit obligatorio → misma API que Safari | ✅ Dialog nativo |
| **Chrome** | Android | Auto-grant, sin dialog | ✅ Automático |
| **Firefox** | Android | Auto-grant, sin dialog | ✅ Automático |
| **Samsung Internet** | Android | Auto-grant | ✅ Automático |
| **Brave** | Android (Shields off) | Auto-grant | ✅ Automático |
| **Brave** | Android (Shields on) | Bloqueo pre-permisos | ❌ Sin bypass JS |
| Chrome/Firefox | Desktop | Sin hardware gyro | — N/A |

**Cobertura real alcanzable:** ~95%+ de dispositivos móviles.  
El único gap real es Brave Android con Shields activados.

---

## APIs disponibles

### 1. `DeviceOrientationEvent` (legacy, amplio soporte)
```javascript
// Datos: alpha, beta, gamma (grados)
window.addEventListener('deviceorientation', (e) => {
  e.gamma; // left-right tilt: -90 a +90
  e.beta;  // forward-back tilt: -180 a +180
});
```
- iOS: requiere `DeviceOrientationEvent.requestPermission()` desde iOS 13
- Android Chrome/Firefox: auto-grant sin dialog
- Brave Android: bloqueado por Shields (sin dialog, sin eventos)

### 2. Generic Sensor API (moderno, permisos explícitos)
```javascript
const sensor = new RelativeOrientationSensor({ frequency: 60, referenceFrame: 'screen' });
sensor.start(); // puede triggear dialog en algunos browsers/versiones
sensor.quaternion; // [x, y, z, w]
```
- Chrome/Edge 69+: soportado, auto-grant en Android
- Firefox: eliminó soporte (dropped 2019)
- Safari: no soportado
- Brave Shields on: `SecurityError` al hacer `start()` — sin dialog
- **Ventaja:** Orientación relativa al arranque → sin necesidad de calibración manual

### 3. `DeviceOrientationEvent.requestPermission()` (iOS exclusivo)
```javascript
if (typeof DeviceOrientationEvent.requestPermission === 'function') {
  const perm = await DeviceOrientationEvent.requestPermission();
  // 'granted' | 'denied'
}
```
- Solo existe en WebKit (Safari + todos los browsers iOS por mandato de Apple)
- Muestra dialog nativo del OS
- Funciona en Safari, Chrome iOS, Firefox iOS, Brave iOS

### 4. Permissions API (estado de permisos)
```javascript
const state = await navigator.permissions.query({ name: 'gyroscope' });
// state.state: 'granted' | 'denied' | 'prompt'
```
- Chrome Android: funciona, detecta estado antes de intentar
- Brave Shields on: puede lanzar excepción o retornar 'denied'
- Útil como pre-check para evitar intentos fallidos

---

## Estrategia en capas

```
Usuario toca botón "Giroscopio"
         │
         ▼
┌─────────────────────────────────────────┐
│ CAPA 1: ¿iOS? (requestPermission existe)│
│  → SÍ: dialog nativo iOS               │
│     ├─ granted → usar DeviceOrientation │ ✅
│     └─ denied  → instrucciones iOS      │ ⚠️
└─────────────────────────────────────────┘
         │ NO (Android / Desktop)
         ▼
┌─────────────────────────────────────────┐
│ CAPA 2: Generic Sensor API              │
│  → Verificar permissions.query          │
│  → Intentar new RelativeOrientationSensor│
│     ├─ éxito → usar Generic Sensor      │ ✅
│     └─ SecurityError → siguiente capa   │
└─────────────────────────────────────────┘
         │ fallo
         ▼
┌─────────────────────────────────────────┐
│ CAPA 3: DeviceOrientationEvent directo  │
│  → Activar listener                     │
│  → Esperar 2.5s de eventos              │
│     ├─ eventos recibidos → ✅           │
│     └─ sin eventos → detectar browser   │
│          ├─ Brave detectado             │
│          │   → instrucciones Brave      │ ⚠️
│          └─ otro browser               │
│              → instrucciones genéricas  │ ⚠️
└─────────────────────────────────────────┘
         │ todo falla
         ▼
┌─────────────────────────────────────────┐
│ FALLBACK: Touch absoluto                │
│  → Siempre disponible, sin permisos     │ ✅
└─────────────────────────────────────────┘
```

---

## Detección de Brave

Brave expone una API propia que permite detectarlo:

```javascript
async function isBrave() {
  try {
    return !!(navigator.brave && await navigator.brave.isBrave());
  } catch { return false; }
}
```

Brave NO incluye "Brave" en el User-Agent (dice ser Chrome), por eso este es el único método confiable.

---

## Conversión de quaternion (Generic Sensor → tilt)

`RelativeOrientationSensor` entrega un quaternion `[qx, qy, qz, qw]`.  
Para ángulos pequeños (< 45°, que es nuestro rango de uso):

```
qy ≈ sin(gamma/2) → tilt left-right
qx ≈ sin(beta/2)  → tilt forward-back

raw.x = clamp(qy / sin(GYRO_RANGE/2), -1, 1)
raw.y = clamp(-qx / sin(GYRO_RANGE/2), -1, 1)
```

Ventaja sobre `DeviceOrientationEvent`: la orientación es relativa al inicio del sensor → no requiere calibración manual.

---

## Instrucciones por browser (para mostrar al usuario)

### Brave Android (Shields on)
1. Toca el ícono **🦁 (León)** en la barra de direcciones
2. Busca **"Bloquear sensores"** → desactívalo
3. Alternativa: **Ajustes → Configuración del sitio → Sensores → Permitir**
4. Recarga la página

### iOS — permiso denegado
1. Abre **Configuración** del iPhone/iPad
2. Busca el browser (Safari, Chrome, etc.)
3. Activa **"Movimiento y orientación"**
4. Vuelve y presiona Reintentar

### Genérico
- Prueba en **Chrome para Android** (sin configuración extra)
- O usa el **control táctil** disponible siempre

---

## Estado del estándar W3C

La fragmentación actual es consecuencia de que el estándar evolucionó en dos ramas separadas que no se unificaron:
- `DeviceOrientationEvent`: estandarizado antes de que existiera un modelo de permisos
- Generic Sensor API: correcto modelo de permisos, pero adopción limitada

El grupo de trabajo del W3C ha estado trabajando en unificar esto desde 2021, pero sin resolución completa a 2026. Firefox incluso eliminó la Generic Sensor API por considerarla un vector de fingerprinting.

**Conclusión:** No hay bypass JS para Brave Android con Shields. La solución es UX (instrucciones contextuales) + degradación elegante a touch.

---

## Referencias

- [MDN DeviceOrientationEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent)
- [MDN Generic Sensor API](https://developer.mozilla.org/en-US/docs/Web/API/Sensor_APIs)
- [W3C Orientation Sensor](https://www.w3.org/TR/orientation-sensor/)
- [Brave Shields — Sensor blocking](https://brave.com/privacy-features/)
- [navigator.brave.isBrave()](https://github.com/brave/brave-browser/wiki/Brave-Specific-Extension-APIs)
