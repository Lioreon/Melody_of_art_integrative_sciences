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
Primera implementación propuesta:

- canción o patrón sencillo;
- pulso estable;
- apertura/cierre de manos como secuencia rítmica;
- playhead;
- anticipación de la figura siguiente;
- feedback sin penalizar incertidumbre de tracking.

Más adelante:

`Y = altura / nota`

`X = separación / duración`

`T = momento de ejecución`

## Dynamic Score

La asistencia debe poder reducirse por módulo y por relación aprendida:

`Asistido → Ayuda reducida → Lectura → Transferencia`

La tecnología actúa como andamio. El objetivo final es que parte del aprendizaje pueda ejecutarse fuera de la pantalla.

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
- cambios grandes de MediaPipe/cámara sin medición base.
