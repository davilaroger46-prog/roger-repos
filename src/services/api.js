export { getToken, setToken, clearToken as logoutUser } from "../core/apiClient";
import { apiClient } from "../core/apiClient";

const API_URL = "http://localhost:8000";

export async function registerUser({ name, email, password }) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Erro ao cadastrar");
  }

  return response.json();
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Erro ao fazer login");
  }

  return response.json();
}

export async function generateCase({ tema, nivel, regiao }) {
  const response = await fetch(`${API_URL}/ai/generate-case`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ tema, nivel, regiao }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || `Erro HTTP ${response.status}`);
  }

  return response.json();
}

export async function listCases(filters = {}) {
  const params = new URLSearchParams();

  if (filters.q) params.append("q", filters.q);
  if (filters.regiao) params.append("regiao", filters.regiao);
  if (filters.nivel) params.append("nivel", filters.nivel);
  if (filters.conduta) params.append("conduta", filters.conduta);
  if (filters.page) params.append("page", filters.page);
  if (filters.page_size) params.append("page_size", filters.page_size);
  if (filters.sort_by) params.append("sort_by", filters.sort_by);
  if (filters.sort_dir) params.append("sort_dir", filters.sort_dir);

  const response = await fetch(`${API_URL}/cases/?${params.toString()}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Erro ao listar casos");
  }

  return response.json();
}

export async function getCase(caseId) {
  const response = await fetch(`${API_URL}/cases/${caseId}`, {
    headers: authHeaders(),
  });

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
      ...authHeaders(),
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
      ...authHeaders(),
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
  const response = await fetch(`${API_URL}/cases/${caseId}/versions`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Erro ao listar versões");
  }

  return response.json();
}

export async function getCaseVersion(caseId, versionId) {
  const response = await fetch(`${API_URL}/cases/${caseId}/versions/${versionId}`, {
    headers: authHeaders(),
  });

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
      headers: authHeaders(),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Erro ao restaurar versão");
  }

  return response.json();
}

export async function downloadCasePdf(caseId) {
  const response = await fetch(`${API_URL}/cases/${caseId}/pdf`, {
    headers: {
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao baixar PDF");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `orthostudy-case-${caseId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export async function deleteCase(caseId) {
  const response = await fetch(`${API_URL}/cases/${caseId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Erro ao deletar caso");
  }

  return response.json();
}
