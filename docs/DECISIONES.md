# Decisiones y memoria del proyecto

## Baseline vigente

- Baseline técnico validado: `7eff8ee` — Phase 2.
- Rama de producción: `main`.
- Despliegue: GitHub → Cloudflare Pages.
- URL pública: https://melody-of-art-integrative-sciences.pages.dev

## Arquitectura de interacción

- Objetivo: instrumento educativo visual y minimalista controlado con dos manos o dos pelotas.
- Mapeo base: apertura horizontal → duración/figura; altura promedio → nota.
- Procesamiento local en navegador. GitHub conserva código, dependencias y decisiones; Pages distribuye archivos.
- No se necesita un modelo generativo para interpretar cada fotograma.
- Escala de apertura virtual: ancho relativo de imagen multiplicado por 125. No presentar como medición física.
- Detector de manos heredado @mediapipe/hands, recursos locales y modelo ligero. Modernizar solo después de comparar calidad y latencia.
- Detector de pelotas sin OpenCV: HSV y mayor componente conectado, análisis 160×120 y hasta 30 Hz.
- La cámara no guarda ni envía imágenes en esta versión. Configuración y calibración viven en memoria durante la sesión.
- Sesiones, cuentas, almacenamiento persistente y sincronización entre dispositivos no están implementados.

## Regla arquitectónica

Mantener separadas las capas:

`Tracking → Interpretación → Dominio musical → Evaluación pedagógica → UI`

La pérdida de tracking es incertidumbre perceptiva y no debe penalizarse como error del aprendiz.

`GestureState` pertenece a percepción corporal. `OPEN_HAND`, `CLOSED_FIST` y `UNKNOWN` no equivalen directamente a acciones musicales.

## Arquitectura pedagógica

Principio metodológico:

`Posición + Símbolo + Sonido + Tiempo`

Los cuatro módulos se entienden como dominios sucesivos:

- **Instrumento** — exploración corporal.
- **Ritmo** — asociación de apertura, figura, duración y secuencia.
- **Pentagrama** — representación y orientación tonal.
- **Compás** — integración temporal.

Progresión de asistencia:

`Explorar → Reconocer → Asociar → Secuenciar → Transferir`

Dynamic Score debe reducir ayudas por módulo y por relación aprendida, no por una puntuación global.

## Phase 2

El commit `7eff8ee` consolidó:
- `GestureState`;
- clasificación de gesto integrada al tracking;
- Ritmo Nivel 0 — Explorar;
- Ritmo Nivel 1 — Una figura;
- Ritmo Nivel 2 — Secuencia;
- feedback direccional;
- mantenimiento temporal;
- pausa por pérdida de tracking;
- reinicio de secuencia;
- tests asociados.

## Dirección posterior a Phase 2

- Audio transversal: evento pedagógico → intención sonora → motor de audio → timbre/articulación. Violín con arco y violín pizzicato se modelan como voces distintas.
- Instrumento: respuesta sonora inmediata y rango tonal configurable.
- Ritmo: aleatoriedad controlada y dificultad por relaciones musicales. La progresión usa vocabularios Inicial (Negra/Blanca), Intermedio (+ Corchea) y Amplio (+ Redonda); las secuencias se generan de forma reproducible y evitan repeticiones inmediatas.
- Pentagrama: objetivo frente a estado actual, ayudas decrecientes y rango ampliado. El modo **Guiado** muestra META fija + TÚ móvil; el modo **Desafío** conserva una única meta visible.
- El audio de Ritmo representa duración mediante un tono neutro activado por el usuario; no introduce altura como objetivo pedagógico del módulo.
- Compás: Nivel 1 = acordeón corporal con patrón 4/4, playhead, anticipación y pausa temporal ante pérdida de tracking. Nivel 2 = dirección experimental existente con partitura, cues y métricas.
- Cámara: estados diferenciados para calibración, aprendizaje e interpretación.

## Investigación y población objetivo

Melody Motion está orientado principalmente a población infanto-juvenil. Las hipótesis sobre memoria asociativa, plasticidad, aprendizaje o transferencia requieren evaluación experimental; no deben presentarse como resultados demostrados.

La interfaz debe priorizar:
- actividad antes que consumo;
- sesiones finitas;
- feedback significativo;
- progresión por capas;
- transferencia fuera de pantalla;
- baja extracción de atención;
- privacidad infantil por diseño.

## Memoria del proyecto

La memoria se conserva en tres capas:

1. Git — commits, ramas, tests y código.
2. Documentación — decisiones, historia, manual y roadmap.
3. Artefactos visuales — slides y diseños objetivo usados como referencia para implementación.

No conservar código obsoleto en `main` únicamente por valor histórico.

## Próximos experimentos técnicos

- calibración por muestreo real del color;
- tiempo de estabilización al recuperar seguimiento;
- detección de fotogramas estancados;
- Worker para visión;
- métricas de latencia verificables;
- evaluación de un rango tonal configurable;
- arquitectura de audio reutilizable.



## Compás v1 — regla temporal

En Compás v1 el tiempo pedagógico depende de tracking válido:

- con ambas manos presentes, el playhead avanza según BPM;
- si se pierde una o ambas manos, el playhead se congela;
- al recuperar seguimiento, la frase continúa desde el mismo punto;
- la pérdida de tracking no registra error ni penalización.

La primera capa integra únicamente `X = apertura → figura/duración` y `T = momento`. El eje `Y = altura → nota` queda para una etapa posterior.
