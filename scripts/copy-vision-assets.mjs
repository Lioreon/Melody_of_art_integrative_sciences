import { mkdir, readdir, copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const source = dirname(require.resolve('@mediapipe/hands'));
const target = new URL('../public/mediapipe/hands/', import.meta.url);
await mkdir(target, { recursive: true });
for (const name of await readdir(source)) {
  if (/\.(wasm|data|binarypb|tflite|js)$/.test(name)) {
    await copyFile(join(source, name), new URL(name, target));
  }
}
console.log('Recursos de visión disponibles desde el propio proyecto.');
