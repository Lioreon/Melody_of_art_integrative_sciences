# Decisiones y memoria del proyecto

- Objetivo: instrumento educativo visual y minimalista controlado con dos manos o dos pelotas.
- Mapeo acordado: apertura horizontal → duración; altura promedio → nota. La nota se confirma con botón o espacio.
- Se preserva React/Vite y los ejercicios del prototipo. La primera pantalla es Instrumento.
- Procesamiento local en navegador. GitHub conserva código, dependencias y decisiones; Pages distribuye archivos.
- No se necesita un modelo generativo para interpretar cada fotograma.
- Escala de apertura virtual: ancho relativo de imagen multiplicado por 125. No presentar como medición física.
- Detector de manos heredado @mediapipe/hands, recursos locales y modelo ligero. Modernizar tras comparar calidad y latencia.
- Detector de pelotas sin añadir OpenCV: HSV y mayor componente conectado, análisis 160×120 y hasta 30 Hz. Un objeto mayor del mismo color puede producir una detección incorrecta: probar con fondo contrastante.
- La cámara no guarda ni envía imágenes en esta versión. Configuración y calibración viven en memoria durante la sesión.
- Sesiones, cuentas, almacenamiento persistente y sincronización entre dispositivos no están implementados.
- Próximos experimentos: calibración por muestreo real del color, tiempo de estabilización al recuperar seguimiento, detección de fotogramas estancados, Worker para visión y métricas de latencia verificables.
- Pendiente elegir repositorio/cuenta/rama y nombre de Pages antes de publicar.
