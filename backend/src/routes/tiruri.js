import { Router } from "express";
import { parseId, valideazaTir } from "../validation.js";

const router = Router();

// Etapa 9: datele stau în memorie și se pierd la repornire (Etapa 10 le mută în MariaDB)
let tiruri = [
  { id: 1, name: "B 101 FLT · Volvo FH16", arrived: false, trailerType: "refrigerated", category: "EU", driver: "Ion Popescu", destination: "Berlin" },
  { id: 2, name: "B 202 FLT · Scania R450", arrived: true, trailerType: "curtainsider", category: "Domestic", driver: "Maria Ionescu", destination: "Cluj-Napoca" },
  { id: 3, name: "CJ 303 FLT · DAF XF", arrived: false, trailerType: "tanker", category: "Non-EU", driver: "Andrei Georgescu", destination: "Istanbul" },
  { id: 4, name: "BV 404 FLT · Mercedes Actros", arrived: false, trailerType: "curtainsider", category: "EU", driver: "Elena Dumitrescu", destination: "Viena" },
  { id: 5, name: "TM 505 FLT · MAN TGX", arrived: true, trailerType: "refrigerated", category: "Domestic", driver: "Mihai Stan", destination: "Constanța" },
];
let nextId = 6;

// Validează :id și găsește tirul, sau răspunde cu 400 / 404
function gasesteIndex(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Id invalid" });
    return -1;
  }
  const index = tiruri.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Tirul nu există" });
  }
  return index;
}

// GET /tiruri
router.get("/", (req, res) => {
  res.json(tiruri);
});

// GET /tiruri/:id
router.get("/:id", (req, res) => {
  const index = gasesteIndex(req, res);
  if (index === -1) return;
  res.json(tiruri[index]);
});

// POST /tiruri
router.post("/", (req, res) => {
  const { erori, date } = valideazaTir(req.body ?? {});
  if (erori.length > 0) {
    return res.status(400).json({ error: erori.join("; ") });
  }
  const tir = { id: nextId++, ...date };
  tiruri.push(tir);
  res.status(201).json(tir);
});

// PATCH /tiruri/:id (modificare parțială)
router.patch("/:id", (req, res) => {
  const index = gasesteIndex(req, res);
  if (index === -1) return;
  const { erori, date } = valideazaTir(req.body ?? {}, { partial: true });
  if (erori.length > 0) {
    return res.status(400).json({ error: erori.join("; ") });
  }
  tiruri[index] = { ...tiruri[index], ...date };
  res.json(tiruri[index]);
});

// DELETE /tiruri/:id
router.delete("/:id", (req, res) => {
  const index = gasesteIndex(req, res);
  if (index === -1) return;
  tiruri.splice(index, 1);
  res.status(204).end();
});

export default router;
