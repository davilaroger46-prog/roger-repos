const API_URL = "http://localhost:8000";

export async function generateCase({ tema, nivel, regiao }) {
  const response = await fetch(`${API_URL}/ai/generate-case`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tema, nivel, regiao }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || `Erro HTTP ${response.status}`);
  }

  return response.json();
}

export async function listCases() {
  const response = await fetch(`${API_URL}/cases/`);

  if (!response.ok) {
    throw new Error("Erro ao listar casos");
  }

  return response.json();
}

export async function getCase(caseId) {
  const response = await fetch(`${API_URL}/cases/${caseId}`);

  if (!response.ok) {
    throw new Error("Erro ao carregar caso");
  }

  return response.json();
}

export async function updateCase(caseId, casoJson) {
  const response = await fetch(`${API_URL}/cases/${caseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(casoJson),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Erro ao salvar caso");
  }

  return response.json();
}

export async function deleteCase(caseId) {
  const response = await fetch(`${API_URL}/cases/${caseId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erro ao deletar caso");
  }

  return response.json();
}
