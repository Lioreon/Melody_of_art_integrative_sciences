# Historia de Melody Motion

Este documento conserva la evolución técnica, visual y pedagógica de **Melody Motion** sin convertir la rama `main` en un archivo histórico. Git conserva los estados del software; esta cronología conserva el sentido de las decisiones.

## Línea de tiempo verificable

| Hito | Commit | Descripción |
|---|---|---|
| Inicio del repositorio | `6e51cd7` | Primera versión de Melody of Art. |
| Identidad Melody Motion | `490517d` | Transición de identidad visual hacia Melody Motion. |
| Versión 0.2.0 | `d987bba` | Consolidación de la versión 0.2.0. |
| Reorganización de interfaz | `2076c22` | Fase 1: reorganización de la interfaz y jerarquía visual. |
| Graphify + Codex | `588f0c7` | Integración de Graphify por proyecto y contexto para agentes. |
| Phase 2 validada | `7eff8ee` | Bucle pedagógico de Ritmo + estados de gesto integrados. |
| Tracking v2 + gramática gestual | `07f9c73` | Persistencia de 21 landmarks, geometría inicial de mano y reglas experimentales de silencio / alteraciones. |
| UI institucional responsive | `2f15ed8` | Shell adaptable para teléfono, tableta y escritorio con destino pedagógico y firma autoral visibles. |
| Manual técnico-científico 2026 | `307a3ce` | Registro formal de la edición `MM-MAN-2026-02` y su trazabilidad documental. |

## Evolución conceptual

### 0. Origen
La primera hipótesis fue directa: usar la posición y la apertura de dos manos como una interfaz musical. El prototipo permitió observar dos relaciones corporales separables:

- **altura vertical** → altura musical / nota;
- **separación horizontal** → figura / duración.

### 1. Fase de interfaz
La aplicación pasó de un prototipo funcional a una experiencia pedagógica con cuatro dominios visibles:

- Instrumento;
- Ritmo;
- Pentagrama;
- Compás.

La prioridad dejó de ser “mostrar todas las variables” y pasó a ser organizar cada módulo alrededor de una pregunta musical.

### 2. Phase 2 — Ritmo como ciclo de aprendizaje
En `7eff8ee` Ritmo dejó de ser únicamente práctica libre y pasó a una progresión explícita:

`Explorar → Una figura → Secuencia`

Se incorporaron estados de aprendizaje, feedback direccional, mantenimiento temporal, secuencia y reinicio. La pérdida de tracking se trata como **incertidumbre perceptiva**, no como error del estudiante.

### 3. Del tracking al significado
Se consolidó una separación arquitectónica:

`Tracking → Interpretación → Dominio musical → Evaluación pedagógica → UI`

`OPEN_HAND`, `CLOSED_FIST` y `UNKNOWN` pertenecen a la percepción corporal. No equivalen por sí mismos a una acción musical.

### 4. Giro multimodal
Las pruebas físicas llevaron a ampliar el principio original:

`Posición + Símbolo + Sonido + Tiempo`

La respuesta auditiva pasa a considerarse una capacidad transversal. El objetivo ya no es solamente detectar una postura, sino construir asociaciones entre cuerpo, espacio, símbolo, duración y sonido.

### 5. Pentagrama guiado
La experiencia actual de Pentagrama se interpreta como una modalidad relativamente avanzada. La visión objetivo incorpora una progresión:

`Explorar → Guiado → Ayuda reducida → Lectura`

El usuario debería poder comparar **nota objetivo** y **nota actual**, con feedback independiente para altura y separación.

### 6. Compás como integración temporal
Compás deja de concebirse únicamente como una pantalla de métricas. La hipótesis pedagógica actual es el **acordeón corporal**:

- las manos se abren y cierran siguiendo figuras y pulsos;
- la canción funciona como escenario temporal;
- el alumno anticipa la siguiente figura;
- posteriormente se integra altura, melodía y lectura.

### 7. Interfaces de desarrollo asociativo
Melody Motion se entiende como primer laboratorio de una pregunta más amplia: cómo diseñar interfaces digitales que activen cuerpo, percepción, memoria asociativa y transferencia, especialmente en población infanto-juvenil.

La hipótesis de diseño no afirma efectos clínicos ni cognitivos demostrados. Su evaluación requiere investigación posterior.



### 8. Formalización editorial e identidad institucional

#### Carrusel narrativo institucional
La primera fase demostrativa del encabezado evolucionó hacia una composición centrada que prioriza la **Escuela de Música Matiaví · Salinas** como destino pedagógico y mantiene **Melody Motion** como subtítulo de la herramienta. Para evitar saturar el encabezado con todas las referencias a la vez, se añadió un carrusel narrativo compacto que alterna cinco aspectos:

1. proyecto educativo;
2. Melody Motion y sus cuatro áreas;
3. autoría y desarrollo;
4. territorio;
5. mensaje pedagógico.

La rotación automática se detiene cuando el usuario interactúa con el carrusel y respeta la preferencia del sistema `prefers-reduced-motion`. Los indicadores permiten navegación manual.

La interfaz alcanzó además una **primera fase demostrativa pública**: la jerarquía de presentación se consolidó como *Melody of Art → Melody Motion → proyecto pedagógico para Escuela de Música Matiaví · Salinas → diseño y desarrollo A. Owsky*. La misma relación se conserva en el pie de página para dar cierre institucional sin desplazar la experiencia pedagógica.

El 24 de septiembre de 2026 se consolidaron dos líneas complementarias de presentación.

La primera fue un conjunto de **láminas experimentales responsive** para visualizar cómo Instrumento, Ritmo, Pentagrama y Compás podían compartir un lenguaje de interfaz más coherente en teléfono, tableta y escritorio. Estas láminas se conservaron como contrato visual, no como evidencia automática de funciones desplegadas.

La segunda fue el **Manual técnico-científico de Melody Motion**, código `MM-MAN-2026-02`. Esta edición adoptó una presentación más cercana a un paper técnico y a un manual institucional: portada sobria, resumen, secciones numeradas, descripción funcional, arquitectura pedagógica y QR de acceso a la herramienta en desarrollo.

A partir de esta formalización, la interfaz pública incorpora de manera discreta tres referencias:

- **Melody of Art · Melody Motion** como identidad del sistema;
- **A. Owsky · Ciencias Integrativas · Bolívar · Ecuador** como firma de diseño y desarrollo;
- **Escuela de Música Matiaví · Salinas** como contexto pedagógico de destino.

La incorporación visual de estas referencias no altera la jerarquía principal: el aprendizaje y la interacción corporal siguen ocupando el centro de la experiencia.

## Memoria del proyecto

La memoria se conserva en tres capas:

1. **Git** — código, commits, ramas y tests.
2. **Documentación** — decisiones, arquitectura pedagógica, manuales y roadmap.
3. **Artefactos visuales** — slides y visiones de estado futuro que sirven como referencia para implementación posterior.

## Regla de continuidad

Las nuevas fases deben nacer desde un baseline validado, en ramas o worktrees separados. Las visiones futuras no deben confundirse con funcionalidades ya implementadas.
