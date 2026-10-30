// Serves the MediaPipe WASM runtime from /mediapipe so face detection needs no CDN.
import { cpSync, mkdirSync } from "node:fs";

const from = "node_modules/@mediapipe/tasks-vision/wasm";
const to = "public/mediapipe";
mkdirSync(to, { recursive: true });
for (const name of ["vision_wasm_internal", "vision_wasm_nosimd_internal"]) {
  for (const ext of [".js", ".wasm"]) cpSync(`${from}/${name}${ext}`, `${to}/${name}${ext}`);
}
