# Melody Motion

Lee README.md y docs/DECISIONES.md antes de cambiar la arquitectura.
Mantén el procesamiento de cámara y audio en el navegador. Evita añadir servicios de IA sin una necesidad explícita.
No interpretes distanceCm como centímetros físicos: es una escala virtual heredada.
Conserva los módulos existentes y la separación entre seguimiento, reglas musicales y presentación.
Libera cámara, bucles y nodos de audio al cambiar de modo o desmontar componentes. Evita solicitudes paralelas de cámara.
Usa pnpm y su lockfile. Verifica cambios funcionales con pnpm test y pnpm build.
No afirmes mejoras cuantitativas de precisión, RAM o latencia sin medición comparativa.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
