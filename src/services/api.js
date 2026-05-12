import { apiClient, setToken, clearToken, getToken } from "../core/apiClient";

export { setToken, getToken };

export function logoutUser() {
  clearToken();
}

export async function getMe() {
  return apiClient("/auth/me");
}

export async function registerUser({ name, email, password }) {
  return apiClient("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser({ email, password }) {
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function generateCase({ tema, nivel, regiao }) {
  return apiClient("/ai/generate-case", {
    method: "POST",
    body: JSON.stringify({ tema, nivel, regiao }),
  });
}

export async function autocorrectCase(caseJson) {
  return apiClient("/ai/autocorrect-case", {
    method: "POST",
    body: JSON.stringify(caseJson),
  });
}

export async function listCases(filters = {}) {
  const params = new URLSearchParams(filters);
  return apiClient(`/cases/?${params.toString()}`);
}

export async function getCase(caseId) {
  return apiClient(`/cases/${caseId}`);
}

export async function updateCase(caseId, caseJson) {
  return apiClient(`/cases/${caseId}`, {
    method: "PUT",
    body: JSON.stringify(caseJson),
  });
}

export async function deleteCase(caseId) {
  return apiClient(`/cases/${caseId}`, {
    method: "DELETE",
  });
}

export async function listCaseVersions(caseId) {
  return apiClient(`/cases/${caseId}/versions`);
}

export async function getCaseVersion(caseId, versionId) {
  return apiClient(`/cases/${caseId}/versions/${versionId}`);
}

export async function restoreCaseVersion(caseId, versionId) {
  return apiClient(`/cases/${caseId}/versions/${versionId}/restore`, {
    method: "POST",
  });
}

export async function submitCaseReview(caseId) {
  return apiClient(`/cases/${caseId}/submit-review`, {
    method: "POST",
  });
}

export async function reviewCase(caseId, { status, notes }) {
  return apiClient(`/cases/${caseId}/review`, {
    method: "POST",
    body: JSON.stringify({ status, notes }),
  });
}

export async function downloadCasePdf(caseId) {
  const response = await apiClient(`/cases/${caseId}/pdf`);

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
