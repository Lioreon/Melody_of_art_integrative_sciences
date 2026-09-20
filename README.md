# Melody of Art · Conductor Vision

Instrumento educativo: apertura horizontal → figura musical; altura promedio → nota de Do mayor (Do4–Do5).
Aplicación React + TypeScript + Vite. La cámara, el seguimiento y el audio se procesan en el navegador.
No requiere una clave de Gemini ni un servidor de IA. Esta copia procede del ZIP entregado; el original no se modificó.

## Abrir en esta computadora

Ejecuta `iniciar-local.cmd` y abre http://127.0.0.1:3000. Mantén abierta esa ventana mientras usas la app.
Si el puerto está ocupado, Vite indicará otro puerto: usa la dirección que aparezca.
También puedes abrir esta carpeta en VS Code y usar su terminal.

## Instalar en otra computadora

Requisitos: Node.js 24 y pnpm 11.19.0. Con Node instalado, `npm install --global pnpm@11.19.0` instala el gestor.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Para comprobar y producir una versión publicable:

```sh
pnpm test
pnpm build
pnpm preview
```

`dist/` contiene la web publicable. No se debe abrir index.html con doble clic: usa el servidor local.
La instalación inicial necesita conexión. Después, el seguimiento no depende de un CDN: sus modelos y archivos WASM se copian desde la dependencia instalada a `public/mediapipe/hands` al iniciar o compilar.
Esto no convierte por sí solo la web publicada en una PWA disponible sin conexión.

## Probar el instrumento

1. La aplicación empieza en **Virtual**, sin solicitar cámara. Mueve la apertura para cambiar la figura.
2. Abre **Opciones de orientación y calibración** para cambiar la altura simulada.
3. Pulsa **Tocar nota** o la barra espaciadora. Los controles de formulario conservan sus propias teclas.
4. En **Tempo y rango cómodo**, ajusta el tempo o guarda las posiciones extremas. La calibración es por sesión.
5. En **Fuente de video**, elige la cámara predeterminada o una cámara específica y pulsa **Activar cámara**. Permite el acceso en el navegador para ver los nombres completos. **Actualizar lista** vuelve a consultar las fuentes; la lista también se actualiza al conectar o retirar dispositivos. Al cambiar la selección con la cámara activa, la fuente anterior se cierra y se abre la elegida. Puedes detenerla con **Detener cámara**. Se admiten cámaras físicas y virtuales expuestas como entradas de video por el navegador; archivos de video y direcciones de cámaras IP no están implementados.
6. En **Seguimiento y colores**, elige manos libres o pelotas. Para pelotas, usa dos colores saturados claramente distintos y ajusta los selectores y la tolerancia. Es selección manual de color; aún no hay cuentagotas.

La separación es una escala relativa de 0 a 125 unidades, proporcional al ancho de la imagen; no mide centímetros reales ni profundidad.
Los módulos heredados conservan algunos textos y nombres internos `distanceCm`, que corresponden a esa misma escala virtual. Mantén estable la distancia del cuerpo a la cámara.
La vista Instrumento no emite nuevas notas si falta un punto. Una nota ya iniciada termina su duración programada.
Las pelotas se distinguen por color, aunque se crucen; las manos libres se ordenan por posición horizontal, no por identidad anatómica.

## Cambios de esta adaptación

- Vista Instrumento y detector de colores conectados a la aplicación; se conservan los tres módulos originales.
- Apertura horizontal independiente de la altura, rango cómodo y selección con histéresis.
- Una solicitud de cámara por inicio, parada de pistas y bucles, y protección frente a inicios que terminan después de cancelar.
- Máximo de 30 detecciones/s, sin repetir el mismo fotograma y con pausa de procesamiento mientras la pestaña está oculta.
- Pelotas: detección por tono/saturación, componente conectado mayor, buffers reutilizables y suavizado temporal.
- Liberación de nodos de audio al terminar y carga diferida de las gráficas de métricas.
- Temporizadores de ejercicios basados en tiempo transcurrido y bloqueo de evaluación sin ambos puntos.
- Dependencias innecesarias eliminadas, versiones resueltas en `pnpm-lock.yaml`, comprobación automática y Dependabot preparados.

## Repositorio de GitHub

Repositorio oficial: `Lioreon/Melody_of_art_integrative_sciences`.
La rama de producción es `main`.
Sube código, tests, documentos y `pnpm-lock.yaml`; no subas `node_modules`, `dist`, archivos de entorno privados ni vídeos de cámara.
`.github/workflows/check.yml` ejecuta tests y compilación; Dependabot propone revisiones de dependencias.
`docs/DECISIONES.md` conserva el contexto del proyecto. GitHub conserva esa memoria documental y el historial; no aporta RAM al navegador.

## Cloudflare Pages

El proyecto genera una web estática compatible con Pages. Cada cambio aceptado en `main` puede activar una nueva publicación automática mediante la integración de GitHub.

- Repositorio: `Lioreon/Melody_of_art_integrative_sciences`.
- Rama de producción: `main`.
- Nombre del proyecto: `melody-of-art-integrative-sciences`.
- Directorio raíz: `/`.
- Variables de compilación de Pages: `NODE_VERSION=24` y `PNPM_VERSION=11.19.0`.
- Comando de compilación: `pnpm build`.
- Directorio de salida: `dist`.
- No se requieren variables de Gemini ni permisos de micrófono.
- La versión de pnpm debe indicarse expresamente: Pages no la deduce del formato del lockfile.

Si el nombre está disponible, Pages asignará `melody-of-art-integrative-sciences.pages.dev`.
La cámara necesita HTTPS o localhost, y autorización del visitante. En un iframe puede requerir además permiso del sitio que la contiene.
Cloudflare sirve los archivos; el análisis de la cámara seguirá usando el equipo de cada visitante.
La guía general de Cloudflare favorece Workers para nuevos proyectos, pero se conserva Pages porque aquí se ha solicitado específicamente pages.dev.

Documentación: https://developers.cloudflare.com/pages/configuration/build-configuration/

## Verificación y próximos pasos

Se incluyen pruebas de mapeo, histéresis, geometría, temporización, separación de colores y ciclo de vida de cámara.
La cámara simulada en los tests comprueba liberación y cancelación; no demuestra precisión con manos reales.
La vista local se comprobó con los controles virtuales y reproducción activada desde la interfaz. Falta evaluación auditiva y de precisión en tu equipo.
Durante esta sesión, el navegador integrado informó `NotAllowedError: Permission denied by system`; la aplicación volvió al simulador. Abre la dirección local en un navegador con acceso a la cámara y revisa sus permisos y los de Windows antes de ensayar el seguimiento real.

Antes de publicar: ensayar manos y pelotas con iluminación real, medir latencia y uso de memoria durante una sesión larga, revisar accesibilidad y unificar los textos heredados de unidades.
Las métricas del módulo orquestal son de prototipo: no constituyen mediciones validadas de reacción, sincronización o estabilidad.
La migración a MediaPipe Tasks/Web Worker queda como siguiente fase, después de obtener una medición base. No se ha implementado en esta adaptación.
