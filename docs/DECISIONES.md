# Decisiones y memoria del proyecto

## Baseline vigente

- Baseline histórico validado: `7eff8ee` — Phase 2.
- Baseline público actual: `c4d9d5a` — primera matriz demostrativa consolidada.
- Rama de producción: `main`.
- Despliegue: GitHub → Cloudflare Pages.
- URL pública: https://melody-of-art-integrative-sciences.pages.dev

## Arquitectura de interacción

- Objetivo: instrumento educativo visual y minimalista controlado con dos manos o dos **marcadores de color**.
- Mapeo base: apertura horizontal → duración/figura; altura promedio → nota.
- Procesamiento local en navegador. GitHub conserva código, dependencias y decisiones; Pages distribuye archivos.
- No se necesita un modelo generativo para interpretar cada fotograma.
- Escala de apertura virtual: ancho relativo de imagen multiplicado por 125. No presentar como medición física.
- Detector de manos heredado @mediapipe/hands, recursos locales y modelo ligero. Modernizar solo después de comparar calidad y latencia.
- Detector de marcadores de color sin OpenCV: HSV y mayor componente conectado, análisis 160×120 y hasta 30 Hz. El identificador interno histórico `colored_balls` se conserva temporalmente para evitar una migración innecesaria en el mismo incremento.
- La cámara no guarda ni envía imágenes en esta versión. La calibración corporal sigue siendo de sesión.
- No existen cuentas, backend de usuario, sincronización entre dispositivos ni persistencia de Ranking.
- Sí existe persistencia local limitada mediante `localStorage` para el timbre seleccionado y la opción **Respuesta sonora al mover las manos**; estas preferencias permanecen en el mismo navegador hasta que el usuario las cambie o borre los datos del sitio.

## Regla arquitectónica

Mantener separadas las capas:

`Tracking → Interpretación → Dominio musical → Evaluación pedagógica → UI`

La pérdida de tracking es incertidumbre perceptiva y no debe penalizarse como error del aprendiz.

`GestureState` pertenece a percepción corporal. En la primera versión demostrativa pública, OPEN/CLOSED se conserva como **reconocimiento de la forma de la mano y diagnóstico de tracking**, sin asignar automáticamente silencio, sostenido o bemol a los módulos musicales.

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

## Modo juego y puntuación de aprendizaje

La primera fase demostrativa incorpora un **modo juego opcional** únicamente en Ritmo y Pentagrama.

Reglas:

- la práctica normal sigue funcionando sin puntos;
- Ritmo otorga puntos al completar una mantención válida de la figura;
- Pentagrama otorga puntos al mantener simultáneamente nota + figura durante la duración objetivo;
- la puntuación es explícita y determinista, no adaptativa ni opaca;
- no hay vidas, castigos, rachas obligatorias ni pérdida de puntos;
- Tracking perdido nunca se convierte en error del estudiante;
- Ranking se desbloquea al alcanzar **300 puntos** de juego;
- el Ranking inicial es **local a la sesión** y ordena áreas de aprendizaje, no estudiantes;
- no existen todavía cuentas, ranking en nube ni comparación entre menores.

Puntuación inicial:

- Ritmo · Una figura: 25 pts;
- Ritmo · Secuencia: 30 pts por paso + 60 pts al cerrar la secuencia;
- Pentagrama: 30 pts por nota + 100 pts al completar la obra.

Esta capa se entiende como una estructura de motivación visible y acotada. Si posteriormente se plantea un ranking entre estudiantes, requerirá consentimiento, identidad, persistencia y una decisión pedagógica específica.

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

## Tracking v2 — T0/T1

- El callback heredado de MediaPipe ya entrega 21 landmarks; ahora se persisten los 21 en cada `PalmData`.
- Se conservan handedness y confidence cuando están disponibles.
- Para compatibilidad, los dos slots principales siguen ordenados por X; la identidad anatómica estable queda para T5.
- La apertura musical base continúa usando centro de palma ↔ centro de palma. Los fingertips no redefinen automáticamente figura/duración.
- T0 añade métricas locales de sesión: FPS, intervalo medio, tiempo de inferencia, jitter aproximado, frames con 0/1/2 puntos y recuperaciones.
- El overlay de 21 landmarks es técnico y opcional; no forma parte de la tarea pedagógica.
- No se almacena video ni se envían frames para producir estas métricas.
- MediaPipe Tasks HandLandmarker sigue como candidato T4; no se añade aún.
- Colaboración A/B por marcadores permanece como investigación futura y no aparece como capacidad implementada.

Ver [TRACKING_V2_SPEC.md](./TRACKING_V2_SPEC.md).

## Gramática bimanual — investigación futura

Se conserva como hipótesis experimental, **fuera de la primera versión demostrativa pública**:

- ambas manos abiertas → sonido natural;
- ambos puños cerrados → posible silencio equivalente;
- estados asimétricos → posibles alteraciones.

Estas relaciones necesitan validación pedagógica y una identidad estable de manos antes de volver a conectarse con Instrumento, Ritmo, Pentagrama o Compás.

La versión pública mantiene:
- centro de palma ↔ centro de palma para posición/apertura;
- OPEN/CLOSED como estado perceptivo y visual;
- módulos musicales sobre el baseline previamente validado.

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
