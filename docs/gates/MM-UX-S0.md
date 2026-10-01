# MM-UX-S0 — UI/UX Pro Max Audit

Estado: PASS de instalación local, integridad y auditoría. Las recomendaciones quedan pendientes de adjudicación por Rory + Arielowsky. No se implementaron cambios de UI durante este gate.

## Identidad reproducible

| Elemento | Valor |
| --- | --- |
| Repositorio Melody Motion | `Lioreon/Melody_of_art_integrative_sciences` |
| Baseline canónica | `aa624a53337fa2fc4323f13daa59918fdcc482f8` |
| Tree canónico | `15c7735112741ab7888e7b24f4d39fe7254436bf` |
| MM-UX1B cerrado | `de3d83151a798516a01e2020bdcbb888c9c50385` |
| Tree MM-UX1B | `41e690720e62c410bfaa9b66b6301ab804fccdc3` |
| Rama de auditoría | `audit/mm-ux-s0-ui-ux-pro-max`, derivada del checkpoint MM-UX1B |
| Fuente de la skill | `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` |
| Pin verificado | `09170eec67eefd46a7ae85de61b40c194020f997` |
| Tree de la fuente | `630b6a7c16a7a579038386ac861e6f9d62491df1` |
| Instalación | `.agents/skills/ui-ux-pro-max/` |
| Licencia | MIT, incluida en `LICENSE` |

La instalación se hizo por copia acotada, sin ejecutar uipro ni instalar globalmente. El instalador upstream puede copiar otras skills hermanas; se excluyó esa expansión. SKILL.md se generó con las plantillas Codex del pin y una sección local explícita de alcance. Los datasets, scripts, referencias, licencia y plantillas de procedencia se copiaron sin modificación.

`SOURCE.json` registra fuente, commit, tree, origen de cada archivo y SHA-256. Se verificaron los 52 archivos instalados: hashes correctos, igualdad byte a byte de cada copia con su fuente, ausencia de enlaces simbólicos y de archivos inesperados. El manifiesto no incluye su propio hash.

La sección local limita la capacidad a READ / SEARCH / RECOMMEND; UI solo con autorización de la tarea activa. Preserva marfil, jade, azul, oro restringido, identidad Matiaví, CameraStage y pedagogía. No concede permisos para hooks, dependencias, tracking, mappings, configuración global, merges o despliegue.

## Método y evidencia

Stack detectado en package.json: React 19.0.1 + Tailwind 4.1.14 + Vite. Python 3.12 disponible; el buscador utiliza biblioteca estándar y datasets locales. No se ejecutaron `--design-system`, `--persist`, `--force`, instalaciones de Python ni servicios externos durante las búsquedas.

Se ejecutaron 21 consultas; 14 búsquedas con resultados revisados se conservaron en `MM-UX-S0-evidence.json`. Los resultados irrelevantes se excluyeron de la evidencia persistida. Las recomendaciones del dataset React están marcadas 19.2.x y las de Tailwind 4.3: se usan solo principios compatibles con las versiones actuales del proyecto, sin upgrade.

Comando desde la raíz del repo:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 .agents/skills/ui-ux-pro-max/scripts/search.py "focus not obscured" --domain ux --json
PYTHONDONTWRITEBYTECODE=1 python3 .agents/skills/ui-ux-pro-max/scripts/search.py "ref effect cleanup camera" --stack react --json
```

### Consultas y adjudicación de relevancia

| Consulta | Dominio/stack | Resultado aplicable o límite |
| --- | --- | --- |
| education mobile learning accessible | product | Educational App; contexto pedagógico |
| music learning gesture interaction | product | Music Instrument Learning y Language Learning App; excluir Music Streaming |
| mobile floating video accessibility | ux | Resultado principal Auto-Play Video no describe CameraStage; reintento focus not obscured encontró criterios concretos de foco |
| touch target compact controls | ux | Touch Target Size/Spacing/Friendly; adaptar unidades y mantener objetivo de proyecto ≥44 CSS px |
| safe area floating controls | web | Safe Area Insets es nativo; adaptar principio, no código React Native |
| safe area inset | html-tailwind | Cero resultados; implementación CSS env() se contrasta con quick-reference.md, no se presenta como match web |
| focus not obscured | ux | Minimum AA, Enhanced AAA y Focus Appearance AAA; no confundir niveles |
| progress feedback learning | ux | Progress Indicators; excluir feedback de IA y haptics |
| reduced motion responsive interaction | ux | Reduced Motion, Excessive Motion, Motion Sensitivity |
| focus keyboard accessibility | react | Foco, HTML semántico y labels |
| ref effect cleanup camera | react | Cleanup y dependencias de efectos; conservar refs actuales |
| mobile responsive overflow | html-tailwind | Mobile-first, mismo contenido por breakpoint y sizing responsive |
| semantic color tokens | ux | Resultados de contraste/color-only no cubren tokens; reintento semantic theme tokens en html-tailwind sí encontró reglas de tokens |
| contrast text readability | ux | Contraste y legibilidad |
| progressive disclosure | ux | Heading Line Balance fuera de tema; reintento secondary controls disclosure también fuera de tema; usar fallback explícito quick-reference.md §8 |
| education learning | color | Teal/amber para LMS e indigo/progreso para idiomas; referencias semánticas, no reemplazo de paleta |
| music instrument learning | product | Contexto de práctica musical; excluir DAW y streaming |
| web target size | ux | Target Size Minimum: 24 CSS px con excepciones WCAG 2.2 AA; 44 px es una decisión adicional del proyecto |

## ADOPTAR

Adoptar como criterios de revisión y futuros gates; esta lista no significa que se hayan implementado durante S0.

| Criterio | Evidencia Melody Motion | Acción propuesta |
| --- | --- | --- |
| Contraste ≥4.5:1 para texto normal; 3:1 para texto grande | `--ui-text` sobre surface: 13.42:1 claro, 12.22:1 oscuro; muted 4.60:1 / 7.44:1 | Formalizar verificación por rol y tema, incluyendo estados |
| Foco visible y no oculto | Dock usa buttons semánticos, labels, outline, retorno de foco y protección al intersectar controles; smoke PASS | Extender recorrido de teclado a módulos y diálogos; no afirmar conformidad global |
| ≥44×44 CSS px como objetivo de MM | Dos controles del dock: 44×44 medidos en Chromium móvil | Revisar controles heredados y controles secundarios, no solo el dock |
| Sin acciones exclusivas de hover | Dock accesible por click/tap/teclado | Mantener controles explícitos para cambios de presentación |
| Responsive desde móvil, sin overflow horizontal | Ocho viewports y cuatro módulos en smoke; PASS | Mantener script reproducible y sumar dispositivos reales |
| Safe areas y separación de overlays | Dock usa env(safe-area-inset-*); reserva altura y espacio inferior | Validar Safari/iOS, notch y barras del navegador en dispositivo |
| Reduced motion | Dock no añade animaciones; smoke con prefers-reduced-motion reduce | Mantener fallback legible y evitar animación ornamental durante actividad |
| Progreso contextual | Calibración ya tiene pasos; módulos aportan META/TÚ y estados | Revisar que la incertidumbre de tracking siga separada del resultado del estudiante |

## ADAPTAR

1. **Color semántico conservando identidad.** Mantener tokens existentes. Separar gold decorativo de gold usado como texto. En `WorkspaceHeader.tsx`, “Área de aprendizaje” es texto de 10 px en `--ui-gold` sobre `--ui-surface`: **2.46:1** en tema claro. El jade sobre esa superficie mide **3.26:1**, útil para algunas funciones no textuales pero insuficiente para texto normal. No oscurecer toda la marca sin adjudicación: proponer pares por rol (on-accent, emphasis-text, progress) y comprobarlos.
2. **Densidad táctil y spacing.** Los controles nuevos tienen targets de 44 px, pero el gap de toolbar es 2 px frente a la recomendación de 8 px. “Ajustes de cámara” expandido mide **29.33 px de alto** en 390×844. Cumplir el objetivo MM de 44 px y aumentar separación donde resulte útil. Estos hallazgos no equivalen por sí solos a fallo WCAG AA: el mínimo web del dataset es 24 CSS px con excepciones.
3. **Progressive disclosure.** Conservar Ajustes rápidos, diagnóstico bajo demanda y presentación compacta del dock. El buscador no encontró un match verificado tras el reintento; esta recomendación procede del quick reference §8. Añadir revisión futura de `aria-expanded`/`aria-controls` en disclosures personalizados y de sus tamaños táctiles.
4. **Aprendizaje y progreso.** Tomar claridad de progreso y respuestas explícitas de Educational App/Language Learning/Music Instrument Learning. No importar dashboards, banderas nacionales, nuevas recompensas ni puntuación sin decisión pedagógica.
5. **Tipografía por función.** Texto principal y objetivos deben tener prioridad; el overlay contiene tamaños de 9–11 px y el flotante conserva un resumen compacto. Revisar zoom/text scaling, contraste compuesto y lectura en sesión antes de imponer 16 px a todos los datos técnicos.
6. **React y Tailwind.** Aplicar cleanup, dependencias correctas y DOM estable. Los observadores se desconectan; los listeners se eliminan. No introducir `forwardRef`, refactors, upgrades ni reescribir todos los tokens como @theme por recomendación de versiones diferentes.

### Contraste de pares opacos de tokens

Cálculo WCAG con luminancia relativa sRGB; no representa una auditoría exhaustiva de composición con transparencias, imágenes o canvas.

| Texto/token contra ui-surface | Claro | Oscuro |
| --- | --- | --- |
| ui-text | 13.42:1 | 12.22:1 |
| ui-text-muted | 4.60:1 | 7.44:1 |
| ui-blue | 5.22:1 | 7.77:1 |
| ui-forest | 5.53:1 | 6.13:1 |
| ui-jade | 3.26:1 | 7.72:1 |
| ui-gold | 2.46:1 | 7.03:1 |

## NO APLICA

- React Native SafeAreaView, Dynamic Type nativo, unidades pt/dp o patrones de navegación de iOS como implementación literal del proyecto web.
- Autenticación, pagos, e-commerce, funnels de conversión y landing comercial.
- Dashboards educativos/administrativos y analítica remota.
- Formularios largos/autosave como requisito de Camera Dock.
- GSAP, parallax, animación de marketing, haptics y cambio de familia de iconos. Lucide ya existe y basta para el dock.
- `Music Streaming`, DAW/beat-maker, artwork de álbum y recomendaciones de reproductor de entretenimiento.

## CONFLICTA CON MELODY MOTION

- La regla genérica de Auto-Play Video recomienda parar al salir de pantalla. Es apropiada para video promocional; **no** para el MediaStream/tracking local de CameraStage, que debe continuar en floating/minimized. Activar o detener cámara sigue siendo explícito.
- Reemplazar marfil/jade/azul/oro por red/brown, OLED oscuro, Claymorphism o un sistema generado por --design-system. La categoría musical educativa del dataset también propone estéticas que no constituyen autoridad sobre la identidad MM.
- Hacer animaciones obligatorias por la regla “state changes should animate smoothly”. Dock conserva cambios inmediatos y reduced-motion; continuidad del tracking y densidad pedagógica prevalecen.
- Convertir recomendaciones de figuras/iconos en nuevos mappings gestuales o reemplazar símbolos de notación musical por iconos decorativos.
- Convertir pérdida de tracking en fallo, sanción o progreso negativo del estudiante.
- Agregar servicios, dependencias, backend, telemetría, hooks, instalación global o auto-merge para satisfacer una recomendación externa.

## Verificación de alcance y cierre

La comparación con `de3d831` confirma cero cambios en `src/`, package.json, pnpm-lock.yaml, AGENTS.md, `.codex/`, CI y despliegue durante S0. Los únicos archivos nuevos pertenecen a la skill local y a este informe/evidencia. No se crearon hooks ni un design-system/MASTER.md.

MM-UX1B pasó 68 tests, lint, build, diff-check y smoke antes de abrir esta rama; S0 no cambia código ejecutado por la app. Su validación se centró en integridad, búsqueda funcional, fuentes y alcance; no se repitió la suite sin cambios de producto.

Inventario completo: `.agents/skills/ui-ux-pro-max/SOURCE.json`. Evidencia de recomendaciones verificadas, versiones y mediciones: `docs/gates/MM-UX-S0-evidence.json`.

La propuesta para una futura adjudicación es priorizar contraste de texto dorado, targets heredados, spacing del dock y revisión de disclosures, conservando los estados/instancia de MM-UX1B. Nada de ello se implementó en S0. La validación con cámara física, MediaPipe real, Safari/iOS y Android real permanece pendiente.

Checkpoint local, Git limpio al cerrar; sin push, merge a main ni despliegue. Estos informes deben enlazarse desde bridge/roadmap cuando se apruebe su integración; no se declara un cambio de estado en producción.

### Aviso heredado de whitespace

`git diff --cached --check` detectó 46 líneas con whitespace final en el archivo exacto upstream `scripts/design_system.py`. La comparación AST de una posible normalización detectó cambios en textos generados; no se aplicó. Se conserva el archivo byte a byte y su hash del pin. El check acotado a todos los otros archivos nuevos (`git diff --cached --check -- . ":(exclude).agents/skills/ui-ux-pro-max/scripts/design_system.py"`) pasó. Este aviso es una limitación documentada de S0, no un fallo de MM-UX1B, cuyo diff-check completo pasó antes del checkpoint.
