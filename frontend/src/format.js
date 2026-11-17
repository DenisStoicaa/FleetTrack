// Funcții mici de afișare, folosite de mai multe componente.

// "B 101 FLT · Volvo FH16" -> ["B 101 FLT", "Volvo FH16"]: numărul pe plăcuță, modelul în titlu.
// Un nume fără " · " (scris altfel în formular) rămâne întreg, fără model.
export function numarSiModel(name) {
  return name.includes(" · ") ? name.split(" · ") : [name, ""];
}

// "Ion Popescu" -> "IP", pentru avatarul șoferului
export function initiale(nume) {
  return nume
    .split(" ")
    .map((parte) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Culoarea avatarului, aleasă din id-ul tirului (același tir are mereu aceeași culoare)
export function nuanta(id) {
  return (Number(id) * 67 + 20) % 360;
}
