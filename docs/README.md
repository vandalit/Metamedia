# Metamedia — Proyecto 3D Parallax + Spatial Interaction

**Sesión de trabajo:** 2026-05-30  
**Estado:** POC en progreso

## Visión General

Crear una experiencia web inmersiva donde el usuario interactúa con objetos 3D renderizados en Three.js usando:
- Efecto parallax vía seguimiento de cabeza con cámara del dispositivo
- Reconocimiento de gestos para interacción directa
- Comprensión del espacio físico frente a la pantalla
- Estimación de distancia y profundidad con cámara monocular

---

## Índice de Documentación

| Documento | Descripción |
|-----------|-------------|
| [Hoja de Ruta](./roadmap.md) | Plan de desarrollo por fases con hitos |
| [Stack Tecnológico](./research/01-tech-stack.md) | Librerías, paquetes npm y repos de referencia |
| [Head Tracking & Parallax](./research/02-head-tracking-parallax.md) | Técnica de frustum asimétrico, MediaPipe FaceLandmarker |
| [Reconocimiento de Gestos](./research/03-gesture-recognition.md) | MediaPipe HandLandmarker, clasificación de gestos |
| [Profundidad & Calibración del Espacio](./research/04-depth-space-calibration.md) | Estimación monocular, vector usuario-pantalla, desafíos de calibración |

---

## Estructura del Proyecto

```
Metamedia/
├── docs/                          # Documentación de sesiones
│   ├── README.md                  # Este archivo
│   ├── roadmap.md                 # Hoja de ruta
│   └── research/                  # Investigación técnica
│       ├── 01-tech-stack.md
│       ├── 02-head-tracking-parallax.md
│       ├── 03-gesture-recognition.md
│       └── 04-depth-space-calibration.md
└── poc/
    └── 3d-cube-parallax/          # POC Fase 1: Cubo Three.js + parallax
        ├── index.html
        └── main.js
```

---

## Sesiones

- **2026-05-30** — Investigación inicial, hoja de ruta, POC Fase 1 (cubo en habitación 4×4)
