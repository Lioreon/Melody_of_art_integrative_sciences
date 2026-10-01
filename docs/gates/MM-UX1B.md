# MM-UX1B — Adaptive Camera Dock

Estado: PASS de implementación y smoke automatizado. La validación física de cámara/dispositivos queda pendiente.

## Baseline y alcance

- Repositorio canónico: `Lioreon/Melody_of_art_integrative_sciences`.
- Baseline `main`: `aa624a53337fa2fc4323f13daa59918fdcc482f8`.
- Tree baseline: `15c7735112741ab7888e7b24f4d39fe7254436bf`.
- Rama local: `ux/mm-ux1b-adaptive-camera-dock`.
- La rama histórica de floating tests no se usó como base.

El contrato detallado mencionado en el handoff no estaba disponible en la conversación, documentación ni issues consultados. Ante la instrucción de completar el trabajo, se adoptaron las siguientes decisiones locales; no se presentan como copia de aquel contrato.

## Comportamiento adoptado

- Menos de 768 px: `expanded` inicialmente, en la posición original de CameraStage.
- `floating` cuando el panel original pasa completamente por encima del viewport. Si el foco está dentro del panel, no se ocultan sus controles automáticamente.
- Al volver al panel original, se restaura `expanded`, salvo minimización explícita.
- `minimized` por elección del usuario; oculta la presentación, no detiene seguimiento. Se conserva hasta restaurar o pasar a tablet/escritorio.
- Ampliar/restaurar vuelve al panel original y conserva foco en el control de restauración.
- Desde 768 px, presentación expandida y comportamiento de layout/sticky heredado.
- En móvil horizontal de hasta 480 px de alto, el flotante se reduce a 192 px de ancho.
- Safe areas, targets de 44×44 px y foco visible. No se agregan animaciones al dock.
- El panel flotante muestra la cámara y resumen musical/tracking; sliders y diagnóstico permanecen en el panel expandido. Sus elementos permanecen montados.
- El foco externo que intersecta el flotante provoca minimización y desplazamiento al control enfocado. El dock minimizado también protege el foco externo.
- Se reserva altura del panel para evitar saltos de scroll; espacio inferior permite llevar controles finales por encima del dock.
- Ranking conserva su comportamiento previo de ocultación de cámara.

## Invariantes

Una instancia de `CameraView`, un canvas y el mismo video/MediaStream durante transiciones del dock. No se agregan keys, portales, montajes alternativos ni callbacks de tracking. La transición explícita a simulación conserva su lifecycle previo, que sí detiene cámara.

Sin cambios de MediaPipe, tracking, mappings, evaluación, calibración, audio ni reglas pedagógicas. Sin nuevas dependencias, hooks, lockfile, package.json o AGENTS.md.

## Archivos

- `src/components/CameraDock.tsx`: presentación, observadores y foco.
- `src/App.tsx`: wrapper estable en el punto existente de montaje.
- `src/components/CameraView.tsx`: clases de presentación y resumen compacto de datos existentes.
- `src/index.css`: estados responsive/safe areas.
- `scripts/smoke-camera-dock.mjs`: integración browser/lifecycle reproducible.
- Este informe.

## Validación

Checks ejecutados secuencialmente: `pnpm test` (68/68), `pnpm lint`, `pnpm build`, `git diff --check`, `git status --short`.

Smoke Chromium mediante agent-browser, con preferencia de movimiento reducido:

| Viewport | Presentación | Resultado |
| --- | --- | --- |
| 320×568 | expanded/floating/minimized/restored | PASS |
| 390×844 | expanded/floating/minimized/restored | PASS |
| 640×960 | expanded/floating/minimized/restored | PASS |
| 767×800 | expanded/floating/minimized/restored | PASS |
| 667×375 | móvil horizontal, flotante compacto | PASS |
| 768×1024 | tablet, expanded | PASS |
| 1024×768 | tablet horizontal, expanded | PASS |
| 1440×900 | escritorio, expanded | PASS |

Se comprobaron overflow horizontal, límites del dock, tamaño táctil, foco al minimizar/restaurar y protección de foco externo. Un MediaStream sintético local ejercitó el backend existente de marcadores de color: una sola petición de cámara, ninguna detención por transiciones, identidad de video/canvas/stream y actualizaciones de canvas durante minimización. Cambiar módulo conserva lifecycle; detener explícitamente cámara cierra el stream. Los cuatro módulos se comprobaron también en simulación móvil.

Repetir con `pnpm dev` activo y `node scripts/smoke-camera-dock.mjs`. El script invoca agent-browser mediante npx fuera de las dependencias del proyecto; opcionalmente `MM_BROWSER_BIN` acepta una ruta al CLI ya disponible. `MM_SMOKE_URL` permite otra URL local.

## Límites y checkpoint

No se afirma validación con cámara física, inferencia MediaPipe real, Safari/iOS, Android real, notch físico ni rendimiento comparativo. El smoke emplea marcadores de color y stream sintético, no valida precisión de manos.

Graphify no estaba instalado y no existía graphify-out/graph.json; no se generó un índice nuevo.

Checkpoint local de esta rama, sin merge, push ni despliegue. El SHA/tree del checkpoint se reporta en el handoff y en el gate MM-UX-S0 que deriva de él. Este documento debe regresar al bridge/roadmap cuando se apruebe integración; no se altera el estado de producción.
