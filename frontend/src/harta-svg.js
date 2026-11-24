// Desenul hărților SVG (schiță, mockup): proiecția, curbele traseelor și cadrul.
// Comune hărții unui tir (TirTraseu) și hărții flotei (HartaFlotei).

// [lat, lon] -> [x, y] pe hartă (1° latitudine = 100 de unități)
export function proiectie([lat, lon]) {
  return [lon * 69, (56 - lat) * 100];
}

// Curbă netedă prin toate punctele: câte o curbă Bézier pentru fiecare tronson
export function tronsoaneCurbe(p) {
  return p.slice(0, -1).map((p1, i) => {
    const p0 = p[i - 1] ?? p1;
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return [p1, c1, c2, p2];
  });
}

// Prima parte a unei curbe Bézier, tăiată la t (algoritmul de Casteljau)
export function taieCurba([a, b, c, d], t) {
  const mij = (p, q) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const ab = mij(a, b), bc = mij(b, c), cd = mij(c, d);
  const abc = mij(ab, bc), bcd = mij(bc, cd);
  return [a, ab, abc, mij(abc, bcd)];
}

export function caleSvg(curbe) {
  if (curbe.length === 0) return "";
  const pt = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  return `M${pt(curbe[0][0])}` + curbe.map(([, c1, c2, p]) => ` C${pt(c1)} ${pt(c2)} ${pt(p)}`).join("");
}

// Cadrul hărții: tot traseul, cu margine, în formatul cerut (lățime / înălțime)
export function cadru(puncte, format) {
  const xs = puncte.map((p) => p[0]);
  const ys = puncte.map((p) => p[1]);
  let x = Math.min(...xs), y = Math.min(...ys);
  let w = Math.max(...xs) - x, h = Math.max(...ys) - y;
  const margine = Math.max(w, h) * 0.16 + 40;
  x -= margine; y -= margine; w += 2 * margine; h += 2 * margine;
  if (w / h < format) { x -= (h * format - w) / 2; w = h * format; }
  else { y -= (w / format - h) / 2; h = w / format; }
  return { x, y, w, h };
}
