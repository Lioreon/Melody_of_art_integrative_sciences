# Fuentes de audio de instrumentos

Melody Motion usa una capa de audio compartida por **Instrumento** y **Pentagrama**. El timbre elegido se conserva al cambiar entre ambos módulos durante la sesión.

## Capas de sonido

1. **Sintetizador interno** — generado con Web Audio API y disponible sin descargar muestras externas.
2. **Timbres muestreados** — cargados bajo demanda desde repositorios públicos fijados a commits concretos.

## Fuente A — tonejs-instruments

Repositorio:

- `nbrosowsky/tonejs-instruments`
- commit fijado: `622c2f1c32c8cfce4158ddc3eb26e518ddef37e5`

Usado actualmente para:

- piano;
- guitarra nylon;
- violín con arco.

Licencias declaradas por el repositorio original:

- código: MIT;
- muestras: Creative Commons Attribution 3.0 (CC BY 3.0).

Según `sample-source-info.txt` del proyecto fuente:

- **piano** — Versilian Studios / VSO2;
- **violín con arco** — Versilian Studios / VSO2;
- **guitarra nylon** — multisample procedente de Freesound e identificado por el repositorio fuente.

## Fuente B — Sonatina Symphonic Orchestra

Repositorio:

- `peastman/sso`
- commit fijado: `32bbdb169aef636b8216029a2e056424ba7c2abb`

Usado actualmente para:

- **Violín · pizzicato**.

La articulación se toma del instrumento SFZ **Solo Violin 1 Pizzicato**, utilizando la capa de muestras `violin_pizz_non_vib_*.wav`.

El repositorio declara Sonatina Symphonic Orchestra bajo **Creative Commons Sampling Plus 1.0**. El proyecto fuente documenta explícitamente articulaciones pizzicato para violines solistas y define pizzicato como ejecución de la cuerda pulsada con los dedos.

Melody Motion no redistribuye el banco completo. El navegador solicita únicamente una muestra de anclaje cuando hace falta y transpone notas intermedias mediante `playbackRate`.

## Arquitectura

```text
evento musical (Instrumento o Pentagrama)
      ↓
frecuencia objetivo
      ↓
timbre / articulación elegida
      ↓
┌─────────────────────────┐
│ sintetizador interno    │
│ o                       │
│ muestra más cercana     │
└─────────────────────────┘
      ↓
transposición por playbackRate
      ↓
Web Audio
```

Para el registro corporal actual **Sol3–Si5**, se usan conjuntos dispersos de muestras de anclaje. Esto reduce el tráfico de red y evita descargar bancos orquestales completos en teléfonos o equipos con pocos recursos.

## Diferencia entre arco y pizzicato

En la interfaz ambos aparecen como voces separadas:

- **Violín · arco** — sonido sostenido de violín proveniente de tonejs-instruments.
- **Violín · pizzicato** — articulación pulsada proveniente de Sonatina Symphonic Orchestra.

No se presentan como equivalentes acústicos. Son dos articulaciones con envolventes y ataques distintos.

## Resiliencia

Si una muestra no puede descargarse, decodificarse o reproducirse, Melody Motion vuelve automáticamente al sintetizador interno. La función pedagógica no depende de que un repositorio externo esté disponible.

## Privacidad y red

La cámara continúa procesándose localmente. Elegir un timbre muestreado genera solicitudes HTTPS al alojamiento público de las muestras. No se envían imágenes de cámara como parte de esas solicitudes.

## Créditos

- Tonejs-Instruments — Nicholaus P. Brosowsky y proveedores de muestras documentados en el repositorio fuente.
- Sonatina Symphonic Orchestra — Mattias Westlund / desarrollo mantenido en `peastman/sso` y fuentes acreditadas por ese proyecto.

Si en el futuro Melody Motion incorpora copias locales de estas muestras en lugar de cargarlas remotamente, deberán conservarse las atribuciones y condiciones correspondientes de cada fuente.
