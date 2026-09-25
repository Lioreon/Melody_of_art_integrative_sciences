# Melody Motion — Codex Context Bridge v0.1

Este documento es la capa de transferencia entre las conversaciones de investigación/diseño y el trabajo de ingeniería dentro de Codex. Su objetivo es **reducir reconstrucción de contexto**, no duplicar toda la historia del proyecto.

> Regla de frescura: el commit indicado aquí es un punto de referencia, no una verdad eterna. Antes de trabajar, comprobar `git log -1 --oneline`, `git status` y los issues relevantes.

## 1. Identidad del proyecto

- Proyecto: **Melody of Art · Melody Motion**
- Destino pedagógico: **Escuela de Música Matiaví · Salinas**
- Diseño y desarrollo: **A. Owsky · Ciencias Integrativas · Bolívar · Ecuador**
- Repositorio: `Lioreon/Melody_of_art_integrative_sciences`
- Producción: `main` → Cloudflare Pages
- URL permanente: https://melody-of-art-integrative-sciences.pages.dev/
- Baseline al crear este bridge: `d9ac4d1` — refinamiento de jerarquía informacional de CameraStage.

## 2. Qué problema resuelve Melody Motion

Melody Motion investiga una interfaz pedagógica musical basada en movimiento corporal:

- altura vertical de las manos → nota/registro;
- apertura horizontal → figura/duración;
- tiempo de ejecución → integración rítmica.

Principio metodológico:

`Posición + Símbolo + Sonido + Tiempo`

Progresión pedagógica:

`Explorar → Reconocer → Asociar → Secuenciar → Transferir`

## 3. Arquitectura que no debe colapsarse

```
Tracking
  ↓
Interpretación corporal
  ↓
Dominio musical
  ↓
Evaluación pedagógica
  ↓
Interfaz
```

Consecuencias prácticas:

- no conviertas un nuevo dato de tracking directamente en una regla musical;
- no dupliques evaluación dentro de CameraStage;
- no mezcles métricas técnicas con feedback principal del estudiante;
- tracking perdido congela/pausa cuando corresponde; no penaliza;
- raw tracking y estado musical calibrado son representaciones distintas.

## 4. Estado funcional que Codex debe asumir

### Módulos

1. **Instrumento** — exploración cuerpo ↔ nota ↔ figura ↔ sonido.
2. **Ritmo** — explorar, una figura, secuencia variable.
3. **Pentagrama** — Guiado META/TÚ y Desafío.
4. **Compás** — acordeón corporal + dirección experimental.
5. **Ranking** — capa opcional local de juego, no ranking entre estudiantes.

### CameraStage v2

Implementado:
- cámara persistente en laptop/escritorio;
- espejo musical pedagógico;
- eje grave/agudo;
- nota y figura actuales;
- META/TÚ cuando el módulo aporta objetivo;
- landmarks completos como vista técnica opcional;
- estado de tracking compacto;
- apertura como medidor en cámara real y slider solo en simulación;
- diagnóstico técnico bajo demanda.

### Calibración corporal

La calibración es:
- opcional;
- local al navegador;
- persistente en el dispositivo mediante `localStorage`;
- de cuatro puntos: apertura mínima/máxima cómoda + altura grave/aguda cómoda;
- reversible/restablecible;
- sin video ni imágenes almacenados.

El tracking crudo no se modifica. Se deriva un `musicalPalmState` normalizado para los módulos.

### Audio

En un navegador sin preferencia previa:
- timbre inicial: **Violín · pizzicato**;
- respuesta sonora al movimiento: **activada**.

Las elecciones explícitas posteriores del usuario se respetan y persisten localmente.

### Tracking

- MediaPipe Hands heredado sigue activo;
- se conservan 21 landmarks por mano;
- handedness/confidence cuando existen;
- geometría derivada OPEN/CLOSED permanece perceptiva/técnica;
- OPEN/CLOSED no significa automáticamente silencio/alteración.

## 5. Fuente de verdad por tipo de pregunta

No leas todo. Usa esta tabla como router.

| Si la tarea trata de… | Empieza por… |
| --- | --- |
| Estado general / ejecución | `README.md` |
| Decisión arquitectónica o pedagógica | `docs/DECISIONES.md` |
| Próximos incrementos | `docs/ROADMAP.md` + issues abiertos |
| Tracking, landmarks, backend | `docs/TRACKING_V2_SPEC.md` + issue #16 |
| CameraStage/calibración | issue #27 + componentes/servicios relevantes |
| UI/UX responsive | issue #19 |
| Audio/licencias | `docs/AUDIO_SOURCES.md` |
| Historia | `docs/HISTORIA.md` solo si la tarea realmente es histórica |
| Relaciones de código | Graphify antes de abrir archivos en masa |

Issues vivos de referencia:
- **#16** Tracking v2.
- **#19** UI/UX v1.
- **#27** CameraStage v2; M0–M4 implementados, M5 validación real pendiente.

## 6. Protocolo de contexto eficiente para Codex

Para una tarea normal:

```
1. git status + git log -1
2. leer AGENTS.md + este bridge
3. graphify query "<tarea>"
4. abrir 2–5 archivos directamente relevantes
5. formular hipótesis de cambio
6. editar el mínimo conjunto de archivos
7. prueba dirigida
8. pnpm test
9. pnpm build
10. graphify update .
11. handoff breve
```

Evitar:
- leer el repositorio completo antes de empezar;
- abrir `GRAPH_REPORT.md` por rutina;
- crear abstracciones “por si acaso”;
- ejecutar suites completas después de cada edición pequeña;
- instalar una librería para resolver algo que el stack actual ya cubre;
- reescribir documentación histórica para reflejar cada cambio menor.

## 7. Handoff ChatGPT ↔ Codex

### Cuando una decisión nace en conversación/investigación

Debe llegar al repo en uno de estos lugares:
- invariante corta → `AGENTS.md`;
- procedimiento repetible → skill;
- decisión estable → `docs/DECISIONES.md`;
- estado/prioridad → `docs/ROADMAP.md` o issue;
- contexto temporal de ingeniería → este bridge.

### Cuando Codex descubre algo

No lo dejes solo en el chat de Codex si afecta trabajo futuro. Devuélvelo mediante:
- test que capture el comportamiento;
- comentario/issue si queda pendiente;
- decisión documental si cambia arquitectura;
- actualización del bridge solo si modifica el contexto operativo.

## 8. Criterio de terminación

Una tarea no está terminada solo porque compile.

Para cambios de producto:
- comportamiento solicitado implementado;
- tracking/pedagogía no degradados de forma obvia;
- pruebas pertinentes;
- `pnpm test` y `pnpm build`;
- responsive afectado revisado cuando corresponda;
- sin afirmaciones de precisión/rendimiento no medidas;
- handoff con riesgos y siguiente validación.

## 9. Siguiente frontera de investigación

La prioridad no es sumar módulos. Es aumentar **evidencia y reproducibilidad**:

```
sesión real/simulada
      ↓
trayectoria temporal
      ↓
replay / fixtures
      ↓
misma pipeline
      ↓
métricas + regresión
```

Candidatos para Codex:
- Session Replay sin video;
- fixtures canónicos de movimiento;
- regresión visual/multiviewport;
- benchmark de jitter, latencia y estabilidad;
- exportación local JSON/CSV para análisis;
- descomposición de componentes grandes solo cuando el grafo/medición lo justifique.

Estas son líneas de trabajo propuestas, no capacidades ya implementadas.

## 10. Límites de seguridad y alcance

No realizar sin solicitud explícita:
- habilitar nuevos hooks;
- instalar plugins/skills/dependencias externas;
- añadir claves/API secrets;
- introducir backend o almacenamiento remoto;
- enviar imágenes de cámara;
- automatizar merges o despliegues;
- activar rankings entre estudiantes;
- convertir hipótesis pedagógicas en afirmaciones demostradas.

---

**Objetivo del bridge:** que una nueva sesión de Codex pueda empezar a producir trabajo útil en minutos, usando Graphify y documentación acotada, sin reconstruir toda la historia de Melody Motion.
