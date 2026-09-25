# Melody Motion — instrucciones para Codex

## Antes de una tarea no trivial

1. Lee `docs/CODEX_BRIDGE.md`.
2. Si existe `graphify-out/graph.json`, consulta primero Graphify para localizar el contexto mínimo necesario.
3. Lee solo la documentación específica indicada por el bridge; no cargues toda la carpeta `docs/` por defecto.
4. Comprueba `git status` y el commit actual antes de editar.

## Invariantes del producto

- Arquitectura: `Tracking → Interpretación corporal → Dominio musical → Evaluación pedagógica → UI`.
- La pérdida de tracking es incertidumbre perceptiva, no error del estudiante.
- Cámara, tracking y audio se procesan localmente en el navegador. No añadas backend, servicios de IA, telemetría remota ni almacenamiento de video sin decisión explícita.
- `distanceCm` es una escala virtual heredada, no centímetros físicos.
- La calibración corporal es local y opcional. Conserva el tracking crudo; deriva un segundo espacio musical calibrado.
- CameraStage debe priorizar información pedagógica. Landmarks y métricas técnicas permanecen secundarios/opcionales.
- No asignes automáticamente significado musical a OPEN/CLOSED, dedos o gestos nuevos sin validación pedagógica explícita.
- Conserva los cuatro dominios: Instrumento, Ritmo, Pentagrama y Compás. Ranking es una capa opcional de juego.

## Disciplina de cambios

- Prefiere el cambio mínimo que resuelva la tarea. No refactorices código no relacionado.
- No instales dependencias, habilites hooks, cambies secretos, modifiques CI/despliegue o introduzcas servicios externos salvo solicitud explícita.
- Usa `pnpm` y conserva `pnpm-lock.yaml`.
- Para cambios funcionales: prueba dirigida primero; antes de cerrar, ejecuta `pnpm test` y `pnpm build`.
- No afirmes mejoras cuantitativas de precisión, memoria, FPS o latencia sin benchmark comparativo.
- Después de modificar código, si Graphify está disponible, ejecuta `graphify update .`.

## Graphify

Cuando el usuario invoque `/graphify`, usa la skill instalada en `.codex/skills/graphify/`.
Para preguntas de arquitectura o relaciones entre archivos, prioriza:

```bash
graphify query "<pregunta>"
graphify path "<A>" "<B>"
graphify explain "<concepto>"
```

Lee `graphify-out/GRAPH_REPORT.md` completo solo para auditorías arquitectónicas amplias o cuando las consultas acotadas no sean suficientes.

## Cierre de tarea

Resume:
- qué cambió;
- por qué;
- pruebas ejecutadas;
- riesgos o validaciones pendientes;
- archivos/decisiones que deberían regresar al bridge, roadmap o bitácora.
