import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === "ERR_NETWORK") {
      err.message =
        "Backend offline. Rode: cd backend && uvicorn main:app --reload";
    }
    if (err.response) {
      console.error("API ERROR:", err.response.data);
    }
    return Promise.reject(err);
  }
);

// ── Casos ──────────────────────────────────────────────────────────
export async function getCases(params = {}) {
  const res = await client.get("/cases", { params });
  return res.data;
}

export async function getCase(id) {
  const res = await client.get(`/cases/${id}`);
  return res.data;
}

export async function createCase(payload) {
  const res = await client.post("/cases", payload);
  return res.data;
}

export async function updateCase(id, payload) {
  const res = await client.put(`/cases/${id}`, payload);
  return res.data;
}

export async function deleteCase(id) {
  const res = await client.delete(`/cases/${id}`);
  return res.data;
}

// ── Motor AO ───────────────────────────────────────────────────────
export async function runAoDecision(payload) {
  const res = await client.post("/decision/ao", payload);
  return res.data;
}

// ── Flashcards ─────────────────────────────────────────────────────
export async function getFlashcards(caseId) {
  const res = await client.get(`/cases/${caseId}/flashcards`);
  return res.data;
}

// ── Geração IA ─────────────────────────────────────────────────────
export async function generateCase(payload) {
  const res = await client.post("/generate", payload, { timeout: 90000 });
  return res.data;
}

// ── Progresso ──────────────────────────────────────────────────────
export async function getProgress() {
  const res = await client.get("/progress");
  return res.data;
}

export async function updateProgress(payload) {
  const res = await client.post("/progress", payload);
  return res.data;
}
