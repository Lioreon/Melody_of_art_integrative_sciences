# Fuentes de audio de instrumentos

Melody Motion puede usar dos capas de sonido compartidas por los módulos **Instrumento** y **Pentagrama**:

1. **Sintetizador interno** — generado con Web Audio API y disponible sin conexión externa.
2. **Timbres muestreados** — piano, guitarra nylon y violín, cargados bajo demanda desde un repositorio público fijado a un commit concreto.

## Repositorio de muestras

Repositorio original:

- `nbrosowsky/tonejs-instruments`
- commit fijado: `622c2f1c32c8cfce4158ddc3eb26e518ddef37e5`

Licencias declaradas por el repositorio original:

- código: MIT;
- muestras: Creative Commons Attribution 3.0 (CC BY 3.0).

Melody Motion no incorpora actualmente el banco completo dentro del repositorio. El navegador solicita únicamente las muestras necesarias cuando el usuario selecciona un timbre. La selección se conserva al cambiar entre Instrumento y Pentagrama durante la sesión.

## Procedencia declarada por el repositorio original

Según `sample-source-info.txt` del proyecto fuente:

- **piano** — Versilian Studios / VSO2;
- **violín** — Versilian Studios / VSO2;
- **guitarra nylon** — muestra multisample de Freesound identificada por el repositorio fuente.

La atribución completa y las condiciones de las fuentes originales deben conservarse si en el futuro las muestras se descargan y redistribuyen directamente desde Melody Motion.

## Arquitectura

```text
evento musical (Instrumento o Pentagrama)
      ↓
frecuencia objetivo
      ↓
timbre compartido
      ↓
┌─────────────────────┐
│ sintetizador local  │
│ o                   │
│ muestra más cercana │
└─────────────────────┘
      ↓
ajuste de afinación por playbackRate
      ↓
Web Audio
```

Las muestras son puntos de anclaje. Para notas intermedias, Melody Motion selecciona la muestra más cercana y ajusta su velocidad de reproducción a la frecuencia objetivo.

## Resiliencia

Si una muestra no puede descargarse, decodificarse o reproducirse, Melody Motion vuelve automáticamente al sintetizador interno. La función musical no depende de que el servicio externo esté disponible.

## Privacidad y red

La cámara continúa procesándose localmente. Elegir un timbre muestreado genera solicitudes HTTPS al alojamiento público de las muestras; no se envían imágenes de cámara como parte de esas solicitudes.

## Créditos

Tonejs-Instruments, Nicholaus P. Brosowsky y autores/proveedores de las muestras indicados en el repositorio original. Muestras utilizadas bajo CC BY 3.0.
