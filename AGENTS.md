# Melody Motion

Lee README.md y docs/DECISIONES.md antes de cambiar la arquitectura.
Mantén el procesamiento de cámara y audio en el navegador. Evita añadir servicios de IA sin una necesidad explícita.
No interpretes distanceCm como centímetros físicos: es una escala virtual heredada.
Conserva los módulos existentes y la separación entre seguimiento, reglas musicales y presentación.
Libera cámara, bucles y nodos de audio al cambiar de modo o desmontar componentes. Evita solicitudes paralelas de cámara.
Usa pnpm y su lockfile. Verifica cambios funcionales con pnpm test y pnpm build.
No afirmes mejoras cuantitativas de precisión, RAM o latencia sin medición comparativa.
