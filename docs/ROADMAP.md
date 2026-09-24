# Roadmap de Melody Motion

Estado de referencia: **Phase 2 — commit `7eff8ee`**.

Este roadmap separa lo implementado de la experiencia objetivo. No constituye un compromiso de calendario.

## Baseline actual

### Implementado
- React 19 + TypeScript + Vite.
- MediaPipe Hands en navegador.
- Detector alternativo por colores.
- Módulos Instrumento, Ritmo, Pentagrama y Compás.
- `GestureState`: `OPEN_HAND`, `CLOSED_FIST`, `UNKNOWN`.
- Clasificación de gesto integrada al tracking real.
- Ritmo:
  - Nivel 0 — Explorar;
  - Nivel 1 — Una figura;
  - Nivel 2 — Secuencia `Negra → Blanca → Negra`;
  - feedback direccional;
  - mantenimiento temporal;
  - pausa ante pérdida de tracking;
  - reinicio de secuencia.
- Tests automáticos y despliegue por GitHub → Cloudflare Pages.

## Incrementos implementados después de Phase 2

- Registro tonal extendido **Sol3–Si5** con líneas adicionales.
- Timbres compartidos entre Instrumento y Pentagrama.
- Piano, guitarra nylon, violín con arco y **violín pizzicato** con carga bajo demanda y fallback al sintetizador.
- Pentagrama **Guiado · dos notas**: META fija + TÚ móvil.
- Pentagrama **Desafío · una meta**: conserva la modalidad de menor referencia visual.
- **Ritmo v2**:
  - Nivel 0 — Explorar;
  - Nivel 1 — objetivo de una figura con generación controlada;
  - Nivel 2 — secuencia variable;
  - vocabulario Inicial / Intermedio / Amplio;
  - secuencias reproducibles sin repetición inmediata;
  - botón para escuchar la duración de la figura con un tono neutro.
- **Compás v1 — Acordeón corporal**:
  - tres patrones simples en 4/4;
  - playhead temporal;
  - figura actual + figura siguiente;
  - apertura corporal como eje rítmico;
  - metrónomo estable;
  - congelación automática del tiempo ante pérdida de tracking;
  - la dirección experimental se conserva como Nivel 2.
- **Tracking v2 · T0/T1**:
  - diagnóstico local de FPS, intervalo de frame, inferencia, jitter aproximado, disponibilidad y recuperaciones;
  - persistencia de los 21 landmarks de cada mano;
  - handedness y confidence conservados cuando MediaPipe los entrega;
  - overlay opcional de esqueleto de 21 puntos para validación técnica;
  - sin cambiar todavía el backend `@mediapipe/hands`;
  - “Pelotas de colores” pasa conceptualmente a **Marcadores de color**.

## Fase 3 — aprendizaje musical multimodal

### 3.1 Audio transversal
Objetivo: separar acontecimiento pedagógico, intención sonora y tecnología de reproducción.

Arquitectura objetivo:

`Evento pedagógico → intención sonora → motor de audio → timbre / salida`

Debe permitir comenzar con síntesis Web Audio y evolucionar después hacia bancos de instrumentos o SoundFonts.

### 3.2 Instrumento
- sonido inmediato ligado a la nota interpretada;
- rango tonal configurable;
- separación corporal desacoplada de la altura;
- posterior selección de timbres.

### 3.3 Ritmo
Implementación inicial completada en Rhythm v2:
- vocabulario de figuras configurable;
- objetivo aleatorio controlado y reproducible;
- secuencias progresivas de 3 / 4 / 5 figuras según vocabulario;
- dificultad basada en relaciones musicales y reducción de ayudas, no en XP o vidas.

Siguiente etapa:
- patrones ligados a pulso estable;
- transferencia de estas secuencias hacia Compás.

### 3.4 Pentagrama guiado
Progresión objetivo:

1. Explorar — mostrar estado actual sin objetivo.
2. Guiado — objetivo frente a nota/figura actual. **Implementado inicialmente como META fija + TÚ móvil.**
3. Ayuda reducida — retirar referencias.
4. Lectura — notación convencional con asistencia mínima.

También se prevé ampliar el rango por encima y por debajo de una sola octava y soportar líneas adicionales.

### 3.5 Compás — acordeón corporal
Primera implementación completada en Compás v1:

- patrón sencillo seleccionable;
- pulso estable;
- apertura/cierre de manos como secuencia rítmica;
- playhead;
- anticipación de la figura siguiente;
- feedback sin penalizar incertidumbre de tracking;
- pausa temporal automática cuando se pierde seguimiento.

Siguiente etapa:
- incorporar canciones o frases musicales reales;
- registrar alineación temporal por segmento sin gamificación;
- integrar gradualmente el eje de altura.

Más adelante:

`Y = altura / nota`

`X = separación / duración`

`T = momento de ejecución`

## Dynamic Score

La asistencia debe poder reducirse por módulo y por relación aprendida:

`Asistido → Ayuda reducida → Lectura → Transferencia`

La tecnología actúa como andamio. El objetivo final es que parte del aprendizaje pueda ejecutarse fuera de la pantalla.

## Tracking v2

T0 y T1 se implementan antes de migrar de modelo:

- **T0 — baseline medible:** métricas locales de rendimiento y estabilidad.
- **T1 — 21 landmarks persistentes:** la mano deja de reducirse únicamente a centro, muñeca e MCPs.
- **T2 — geometría completa:** dedos, falanges, curl, dirección, span y estabilidad.
- **T3 — adaptador de backends.**
- **T4 — benchmark/migración a MediaPipe Tasks HandLandmarker.**
- **T5 — identidad estable de manos.**
- **T6 — gestos derivados por dedo**, sin significado musical automático.

Marcadores de color siguen una rama paralela C0–C4: renombrado, calibración desde cámara, confianza/bbox, identidad por color y benchmark frente a tracking.js/OpenCV.js.

La colaboración A/B queda documentada como investigación futura y no se expone todavía en la interfaz.

Especificación: [TRACKING_V2_SPEC.md](./TRACKING_V2_SPEC.md).

## Cámara y UX
Visión futura:
- calibración: cámara amplia;
- aprendizaje: cámara compacta;
- interpretación: cámara minimizable.

No rediseñar la arquitectura de cámara antes de validar necesidades pedagógicas concretas.

## Investigación pedagógica
Melody Motion está orientado principalmente a población infanto-juvenil, pero las afirmaciones sobre memoria, plasticidad o transferencia deben tratarse como hipótesis hasta contar con evaluación experimental.

Variables futuras de investigación:
- tiempo hasta adquisición;
- errores;
- retención;
- transferencia;
- necesidad de ayuda;
- diferencias entre condiciones visuales, auditivas y corporales.

## No implementar todavía sin una decisión explícita
- gamificación genérica;
- ranking de estudiantes;
- vidas / XP / streaks;
- gesto → sonido/silencio como equivalencia automática;
- dificultad adaptativa opaca;
- arquitectura genérica de aprendizaje antes de que al menos dos módulos requieran la misma abstracción;
- cambios grandes de MediaPipe/cámara sin medición base;
- colaboración multiusuario visible antes de diseñar identidad, consentimiento y validación pedagógica.
