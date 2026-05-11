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

export async function updateCase(caseId, caseJson) {
  const response = await fetch(`${API_URL}/cases/${caseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(caseJson),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Erro ao atualizar caso");
  }

  return response.json();
}

export async function autocorrectCase(caseJson) {
  const response = await fetch(`${API_URL}/ai/autocorrect-case`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(caseJson),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Erro ao autocorrigir caso");
  }

  return response.json();
}

export async function listCaseVersions(caseId) {
  const response = await fetch(`${API_URL}/cases/${caseId}/versions`);

  if (!response.ok) {
    throw new Error("Erro ao listar versões");
  }

  return response.json();
}

export async function getCaseVersion(caseId, versionId) {
  const response = await fetch(`${API_URL}/cases/${caseId}/versions/${versionId}`);

  if (!response.ok) {
    throw new Error("Erro ao carregar versão");
  }

  return response.json();
}

export async function restoreCaseVersion(caseId, versionId) {
  const response = await fetch(
    `${API_URL}/cases/${caseId}/versions/${versionId}/restore`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Erro ao restaurar versão");
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
