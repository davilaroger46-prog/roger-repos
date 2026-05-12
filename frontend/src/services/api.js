import { apiClient, setToken, clearToken, getToken } from "../core/apiClient";
import { API_ROUTES } from "../constants/apiRoutes";

export { setToken, getToken };

export function logoutUser() {
  clearToken();
}

export async function getMe() {
  return apiClient(API_ROUTES.auth.me);
}

export async function registerUser({ name, email, password }) {
  return apiClient(API_ROUTES.auth.register, {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser({ email, password }) {
  return apiClient(API_ROUTES.auth.login, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function generateCase({ tema, nivel, regiao }) {
  return apiClient(API_ROUTES.ai.generateCase, {
    method: "POST",
    body: JSON.stringify({ tema, nivel, regiao }),
  });
}

export async function autocorrectCase(caseJson) {
  return apiClient(API_ROUTES.ai.autocorrectCase, {
    method: "POST",
    body: JSON.stringify(caseJson),
  });
}

export async function listCases(filters = {}) {
  const clean = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v != null)
  );
  const params = new URLSearchParams(clean);
  return apiClient(`${API_ROUTES.cases.list}?${params.toString()}`);
}

export async function getCase(caseId) {
  return apiClient(API_ROUTES.cases.detail(caseId));
}

export async function updateCase(caseId, caseJson) {
  return apiClient(API_ROUTES.cases.detail(caseId), {
    method: "PUT",
    body: JSON.stringify(caseJson),
  });
}

export async function deleteCase(caseId) {
  return apiClient(API_ROUTES.cases.detail(caseId), {
    method: "DELETE",
  });
}

export async function listCaseVersions(caseId) {
  return apiClient(API_ROUTES.cases.versions(caseId));
}

export async function getCaseVersion(caseId, versionId) {
  return apiClient(API_ROUTES.cases.versionDetail(caseId, versionId));
}

export async function restoreCaseVersion(caseId, versionId) {
  return apiClient(API_ROUTES.cases.restoreVersion(caseId, versionId), {
    method: "POST",
  });
}

export async function submitCaseReview(caseId) {
  return apiClient(API_ROUTES.cases.submitReview(caseId), {
    method: "POST",
  });
}

export async function reviewCase(caseId, { status, notes }) {
  return apiClient(API_ROUTES.cases.review(caseId), {
    method: "POST",
    body: JSON.stringify({ status, notes }),
  });
}

export async function downloadCasePdf(caseId) {
  const response = await apiClient(API_ROUTES.cases.pdf(caseId));

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
