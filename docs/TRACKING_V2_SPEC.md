# Tracking v2 — especificación de investigación e implementación

## Propósito

Melody Motion ya utiliza dos rutas de percepción:

1. **Manos libres** mediante `@mediapipe/hands`.
2. **Marcadores de color** mediante un detector propio en navegador.

El siguiente objetivo no es añadir gestos arbitrarios a la interfaz, sino enriquecer la capa perceptiva sin romper la arquitectura pedagógica existente.

La regla sigue siendo:

```text
percepción
   ↓
interpretación corporal
   ↓
dominio musical
   ↓
evaluación pedagógica
   ↓
UI
```

Los módulos musicales no deben depender directamente de MediaPipe, OpenCV, tracking.js ni de una implementación concreta de visión.

---

## Baseline técnico actual

### Manos libres

`src/services/handTracker.ts` recibe actualmente los **21 landmarks** producidos por MediaPipe Hands, pero Melody Motion solo conserva de cada mano:

- centro de palma aproximado;
- muñeca;
- MCP del índice;
- MCP del meñique;
- `GestureState` simplificado.

Los 21 landmarks completos existen durante el callback de MediaPipe y ya son utilizados temporalmente por `gestureClassifier.ts`, pero no forman parte del estado persistente entregado al resto de la aplicación.

La identificación de las dos manos se resuelve hoy por **orden espacial en X**, no por identidad anatómica estable.

### Marcadores de color

`src/services/colorDetection.ts` ya implementa:

- conversión RGB → HSV;
- comparación por tono;
- umbral mínimo de saturación y brillo;
- mayor componente conectado;
- dos identidades cromáticas distintas;
- buffers reutilizables.

`src/services/colorTracker.ts` añade suavizado temporal exponencial.

Por tanto, el modo de color no parte de cero. La mejora debe centrarse en calibración, confianza, geometría, robustez e identidad temporal, no simplemente sustituirlo por otra librería.

---

## Repositorios estudiados

### 1. google-ai-edge/mediapipe

Repositorio oficial: `google-ai-edge/mediapipe`.

El **HandLandmarker** de MediaPipe Tasks para web ofrece:

- landmarks normalizados;
- landmarks 3D de la mano;
- handedness;
- score/confianza;
- configuración de número de manos;
- umbrales separados de detección, presencia y tracking;
- API para vídeo.

**Candidato principal para Tracking v2.**

Ventaja principal: nos permite conservar una arquitectura oficial de MediaPipe y obtener información más rica que la capa `@mediapipe/hands` heredada.

Importante: los `worldLandmarks` describen geometría 3D de cada mano, pero no deben asumirse como una medición absoluta de la distancia física entre dos manos diferentes sin validación y calibración específica.

### 2. tensorflow/tfjs-models — hand-pose-detection

Repositorio oficial: `tensorflow/tfjs-models`.

Su paquete de hand pose detection expone:

- 21 keypoints;
- keypoints 3D;
- handedness;
- score;
- runtime MediaPipe o TFJS.

**Candidato de benchmark, no primera migración.**

Puede ser útil para comparar rendimiento y portabilidad, pero introducir TFJS como ruta principal aumentaría la superficie de dependencias si MediaPipe Tasks ya satisface el caso.

### 3. dwhite54/fingerpose

Repositorio: `dwhite54/fingerpose`.

Clasifica:

- curvatura de dedos;
- dirección de cada dedo;
- gestos configurables.

**Útil como referencia algorítmica**, no como tracker principal.

Su README documenta limitaciones históricas de una sola mano ligadas al modelo handpose que utiliza. Melody Motion no debería reemplazar su capa de percepción por esta librería. Podemos reutilizar ideas de cálculo de curl/direction sobre nuestros propios 21 landmarks.

### 4. eduardolundgren/tracking.js

Repositorio: `eduardolundgren/tracking.js`.

Ofrece tracking de color en navegador y una API ligera.

**Referencia histórica/benchmark para color**, no dependencia recomendada de primera línea.

Melody Motion ya tiene un detector HSV + componentes conectados más pequeño y adaptado a dos marcadores. Antes de añadir tracking.js conviene mejorar y medir nuestro detector.

### 5. OpenCV / OpenCV.js

Repositorio oficial: `opencv/opencv`.

OpenCV ofrece operaciones útiles para:

- HSV/Lab;
- erosión/dilatación;
- apertura/cierre morfológico;
- contornos;
- centroides;
- Kalman;
- optical flow.

**Candidato para benchmark avanzado**, no incorporación inmediata.

Agregar OpenCV.js puede aumentar de forma importante peso, memoria y complejidad. Para Melody Motion, que debe funcionar también en teléfonos y equipos modestos, debe justificarse con medidas de precisión/latencia.

---

# Secuencia de implementación propuesta

## T0 — Baseline medible

Antes de cambiar el tracker:

- registrar FPS de inferencia;
- tiempo medio por frame;
- jitter del centro de palma;
- porcentaje de frames con 0/1/2 manos;
- recuperaciones después de oclusión;
- intercambio de identidad al cruzar manos;
- uso aproximado de memoria;
- comportamiento en móvil y laptop.

No almacenar vídeo ni imágenes.

Salida esperada:

`TrackingDiagnostics` ampliado + pruebas puras de métricas.

**Razón:** no podemos afirmar que Tracking v2 mejora si no tenemos un punto de comparación.

---

## T1 — Conservar los 21 landmarks sin cambiar todavía de modelo

Primer incremento funcional.

Extender la estructura de mano para conservar:

```text
0  wrist
1  thumb_cmc
2  thumb_mcp
3  thumb_ip
4  thumb_tip
5  index_mcp
6  index_pip
7  index_dip
8  index_tip
9  middle_mcp
10 middle_pip
11 middle_dip
12 middle_tip
13 ring_mcp
14 ring_pip
15 ring_dip
16 ring_tip
17 pinky_mcp
18 pinky_pip
19 pinky_dip
20 pinky_tip
```

Modelo propuesto:

```ts
interface HandObservation {
  present: boolean
  landmarks: HandPoint[21]
  palmCenter: HandPoint
  wrist: HandPoint
  handedness?: 'Left' | 'Right'
  confidence?: number
  gestureState: GestureState
  bbox?: BoundingBox
}
```

Mantener temporalmente compatibilidad con `PalmData` para no reescribir Instrumento, Ritmo, Pentagrama y Compás en el mismo PR.

---

## T2 — Geometría completa de mano

A partir de los 21 landmarks calcular, como datos derivados:

- longitud estimada de cada dedo en coordenadas normalizadas;
- extensión/curl por dedo;
- dirección por dedo;
- apertura angular entre dedos;
- ancho de palma;
- alto de palma;
- span pulgar ↔ meñique;
- centroides de palma;
- posición de cada fingertip;
- distancias entre fingertips de una misma mano;
- velocidad y estabilidad temporal de puntos seleccionados.

Esto permite que Melody Motion deje de conocer únicamente un “punto palma”.

### Regla pedagógica importante

La separación musical base **no debe pasar automáticamente de centro-de-palma a fingertips**.

Si la distancia musical dependiera directamente de las puntas de los dedos, abrir o cerrar los dedos podría cambiar involuntariamente la figura musical.

Por ello:

- **centro de palma ↔ centro de palma** continúa siendo el eje X musical base;
- dedos y falanges enriquecen gestos, diagnóstico y futuros controles;
- cualquier nueva relación musical basada en dedos debe definirse explícitamente por módulo.

---

## T3 — Adaptador de percepción

Crear una interfaz estable antes de migrar de modelo:

```text
HandTrackingBackend
├── LegacyMediaPipeHandsBackend
└── MediaPipeTasksHandLandmarkerBackend
```

Salida común:

```text
HandFrame
├── hands[]
├── timestamp
├── confidence
└── backendDiagnostics
```

Los módulos no deben saber qué backend produjo el frame.

Esto permite A/B técnico y rollback.

---

## T4 — Migración experimental a MediaPipe Tasks HandLandmarker

Después de T0–T3:

- usar `google-ai-edge/mediapipe` / HandLandmarker;
- `numHands = 2`;
- conservar landmarks normalizados;
- conservar handedness;
- conservar score;
- evaluar world landmarks;
- mantener el backend anterior disponible durante benchmark.

Comparar:

- FPS;
- jitter;
- recuperación;
- identidad;
- consumo de memoria;
- precisión percibida en manos reales.

Solo promover Tasks como backend por defecto si supera o iguala el baseline sin deteriorar la experiencia en móvil.

---

## T5 — Identidad estable de manos

Hoy las manos se ordenan por X.

Tracking v2 debe intentar mantener:

```text
handId
handedness
previousPosition
confidence
```

La identidad temporal debe sobrevivir, en lo posible, a:

- cruce de manos;
- oclusión breve;
- reentrada.

La handedness del modelo puede ayudar, pero no debe ser la única señal. Se recomienda asociación temporal usando posición previa + handedness + confianza.

---

## T6 — Gestos y dedos como segunda capa

Con landmarks completos:

- mantener `OPEN_HAND / CLOSED_FIST / UNKNOWN`;
- derivar estados por dedo;
- crear utilidades de curl/direction;
- no convertir todavía cada gesto en acción musical.

Ejemplos futuros:

```text
index_extended
thumb_index_pinch
finger_count
palm_orientation
finger_spread
```

Estas propiedades pertenecen a interpretación corporal. Cada módulo decidirá después si alguna tiene significado pedagógico.

---

# Tracking por marcadores de color v2

## C0 — Renombrado conceptual

Nombre de interfaz:

**Marcadores de color**

No “Pelotas de colores”.

El identificador interno `colored_balls` puede mantenerse temporalmente por compatibilidad hasta un refactor controlado.

---

## C1 — Calibración desde cámara

Añadir:

- cuentagotas / tap sobre la imagen;
- muestra de una pequeña región, no de un solo píxel;
- media/mediana HSV;
- tolerancia inicial derivada de dispersión local;
- vista previa del color capturado.

Objetivo: dejar de depender únicamente de un HEX elegido manualmente.

---

## C2 — Detector enriquecido sin nueva dependencia pesada

Antes de OpenCV.js:

- umbral HSV por H, S y V;
- área mínima y máxima;
- bounding box;
- circularidad/compactación opcional;
- confianza por porcentaje de píxeles válidos;
- rechazo de blobs pegados al borde si son ruido;
- morfología ligera implementada sobre la máscara si el benchmark lo justifica;
- tiempo de gracia de pérdida;
- suavizado configurable.

Salida propuesta:

```ts
interface MarkerObservation {
  id: 'markerA' | 'markerB'
  center: Point
  bbox: BoundingBox
  area: number
  confidence: number
  colorModel: HSVRange
  timestampMs: number
}
```

---

## C3 — Identidad de marcador

Una ventaja estructural del color es que:

```text
color A = identidad A
color B = identidad B
```

aunque ambos marcadores crucen sus posiciones.

Mantener esta propiedad explícita.

No ordenar marcadores solo por X.

---

## C4 — Benchmark de alternativas

Comparar nuestro detector contra:

- tracking.js como referencia ligera;
- OpenCV.js para morfología, contornos y filtros avanzados.

Criterios:

- precisión en iluminación variable;
- latencia;
- tamaño descargado;
- memoria;
- consumo de CPU;
- estabilidad en Android;
- complejidad de mantenimiento.

No añadir una dependencia si el detector propio alcanza resultados equivalentes con menor coste.

---

# Capa común de tracking

Objetivo final:

```text
CameraFrame
      ↓
┌─────────────────────────────┐
│ Perception backend          │
├─────────────────────────────┤
│ Hand Landmarker             │
│ Color Marker Tracker        │
└─────────────────────────────┘
      ↓
ObservationFrame
      ↓
BodyRelationState
      ↓
Musical mapping
```

`BodyRelationState` debe exponer únicamente relaciones que los módulos necesitan:

- centro A;
- centro B;
- separación;
- altura conjunta;
- ángulo;
- tracking válido;
- confianza;
- timestamp.

Los landmarks completos permanecen disponibles para funciones que realmente los necesiten.

---

# Línea futura registrada — interacción colaborativa

## Estado

**Investigación futura. No exponer todavía como función en la plataforma.**

La arquitectura de marcadores permite prospectivamente:

```text
participante A → marcador A
participante B → marcador B
             ↓
      relación compartida
             ↓
           música
```

Posibles estudios posteriores:

- distancia compartida;
- ritmo cooperativo;
- compás cooperativo;
- roles distribuidos;
- altura controlada por una persona y duración por otra;
- pequeños ensambles corporales.

Esta línea se documenta para no perder la hipótesis, pero:

- no debe aparecer todavía como selector de UI;
- no debe presentarse como capacidad implementada;
- no debe afectar el flujo individual actual;
- necesita diseño pedagógico, consentimiento y pruebas específicas antes de implementación.

---

# Orden recomendado de PRs

```text
T0  baseline y métricas
 ↓
T1  21 landmarks persistentes
 ↓
T2  geometría de mano
 ↓
T3  adaptador de backends
 ↓
T4  MediaPipe Tasks benchmark/migración
 ↓
T5  identidad estable
 ↓
T6  dedos/gestos derivados

en paralelo, después de T0:

C0  Marcadores de color
 ↓
C1  calibración desde cámara
 ↓
C2  blob + confianza + bbox
 ↓
C3  identidad estable
 ↓
C4  benchmark tracking.js / OpenCV.js
```

Después:

```text
Hand backend ──────┐
                   ├─→ BodyRelationState → módulos musicales
Color backend ─────┘
```

---

# Criterios de aceptación

Tracking v2 no se considera mejor únicamente por tener más landmarks.

Debe demostrar:

- igual o mejor fluidez en móvil;
- menor jitter o mejor estabilidad;
- recuperación más fiable;
- identidad más consistente;
- sin regresiones en Instrumento/Ritmo/Pentagrama/Compás;
- tracking perdido sigue siendo incertidumbre del sistema, no error del aprendiz;
- procesamiento local de cámara;
- ninguna grabación obligatoria de vídeo;
- benchmark documentado antes de eliminar el backend anterior.

---

# Decisión provisional

1. **No instalar todavía OpenCV.js, TFJS ni fingerpose.**
2. **Primero aprovechar mejor los 21 landmarks que MediaPipe ya entrega.**
3. Diseñar un adaptador antes de migrar a MediaPipe Tasks.
4. Mejorar el detector cromático propio antes de agregar una librería pesada.
5. Registrar colaboración A/B solamente como línea de investigación futura.
