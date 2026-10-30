export type FilterDef = {
  id: string;
  name: string;
  swatch: string;
  brightness?: number;
  contrast?: number;
  saturate?: number;
  sepia?: number;
  grayscale?: number;
};

export const filters: FilterDef[] = [
  { id: "original", name: "Original", swatch: "#d9d9d9" },
  { id: "festive", name: "Festive Glow", swatch: "#ffb300", brightness: 1.06, contrast: 1.08, saturate: 1.35 },
  { id: "silk", name: "Silk Warm", swatch: "#e08a4a", brightness: 1.05, saturate: 1.15, sepia: 0.22 },
  { id: "pastel", name: "Soft Pastel", swatch: "#f6c1d0", brightness: 1.1, contrast: 0.88, saturate: 0.85 },
  { id: "vintage", name: "Vintage", swatch: "#a1887f", brightness: 1.04, contrast: 0.95, sepia: 0.55 },
  { id: "mono", name: "Classic B&W", swatch: "#555555", contrast: 1.15, grayscale: 1 },
];

// Live preview uses CSS filters; capture uses the equivalent colour matrix below
// (canvas ctx.filter is not supported in Safari). Both apply ops in the same order.
export function cssFilter(f: FilterDef): string {
  const parts: string[] = [];
  if (f.brightness !== undefined) parts.push(`brightness(${f.brightness})`);
  if (f.contrast !== undefined) parts.push(`contrast(${f.contrast})`);
  if (f.saturate !== undefined) parts.push(`saturate(${f.saturate})`);
  if (f.sepia !== undefined) parts.push(`sepia(${f.sepia})`);
  if (f.grayscale !== undefined) parts.push(`grayscale(${f.grayscale})`);
  return parts.length ? parts.join(" ") : "none";
}

type Mat = { m: number[]; o: number[] }; // 3x3 row-major + offset (0–255 scale)

function then(cur: Mat, m: number[], o: number[] = [0, 0, 0]): Mat {
  const rm = new Array<number>(9);
  const ro = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += m[i * 3 + k] * cur.m[k * 3 + j];
      rm[i * 3 + j] = s;
    }
    let so = o[i];
    for (let k = 0; k < 3; k++) so += m[i * 3 + k] * cur.o[k];
    ro[i] = so;
  }
  return { m: rm, o: ro };
}

function filterMatrix(f: FilterDef): Mat {
  let mat: Mat = { m: [1, 0, 0, 0, 1, 0, 0, 0, 1], o: [0, 0, 0] };
  if (f.brightness !== undefined) {
    const b = f.brightness;
    mat = then(mat, [b, 0, 0, 0, b, 0, 0, 0, b]);
  }
  if (f.contrast !== undefined) {
    const k = f.contrast;
    const off = 128 * (1 - k);
    mat = then(mat, [k, 0, 0, 0, k, 0, 0, 0, k], [off, off, off]);
  }
  if (f.saturate !== undefined) {
    const s = f.saturate;
    mat = then(mat, [
      0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
      0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
      0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
    ]);
  }
  if (f.sepia !== undefined) {
    const q = 1 - f.sepia;
    mat = then(mat, [
      0.393 + 0.607 * q, 0.769 - 0.769 * q, 0.189 - 0.189 * q,
      0.349 - 0.349 * q, 0.686 + 0.314 * q, 0.168 - 0.168 * q,
      0.272 - 0.272 * q, 0.534 - 0.534 * q, 0.131 + 0.869 * q,
    ]);
  }
  if (f.grayscale !== undefined) {
    const q = 1 - f.grayscale;
    mat = then(mat, [
      0.2126 + 0.7874 * q, 0.7152 - 0.7152 * q, 0.0722 - 0.0722 * q,
      0.2126 - 0.2126 * q, 0.7152 + 0.2848 * q, 0.0722 - 0.0722 * q,
      0.2126 - 0.2126 * q, 0.7152 - 0.7152 * q, 0.0722 + 0.9278 * q,
    ]);
  }
  return mat;
}

export function applyFilter(ctx: CanvasRenderingContext2D, w: number, h: number, f: FilterDef) {
  if (cssFilter(f) === "none") return;
  const { m, o } = filterMatrix(f);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    d[i] = m[0] * r + m[1] * g + m[2] * b + o[0];
    d[i + 1] = m[3] * r + m[4] * g + m[5] * b + o[1];
    d[i + 2] = m[6] * r + m[7] * g + m[8] * b + o[2];
  }
  ctx.putImageData(img, 0, 0);
}
