import { getToken, logoutUser } from "../services/api";
import { parseApiError } from "./errors";
import { showToast } from "./toastStore";

const API_URL = "http://localhost:8000";

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const { json, ...rest } = options;

  const headers = {
    ...authHeaders(),
    ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : options.body,
  });

  if (response.status === 401) {
    logoutUser();
    showToast("Sessão expirada. Faça login novamente.", "error");
    window.location.reload();
    return;
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response;
}

export const apiClient = {
  get: (path, options) => request(path, { method: "GET", ...options }),
  post: (path, json, options) => request(path, { method: "POST", json, ...options }),
  put: (path, json, options) => request(path, { method: "PUT", json, ...options }),
  delete: (path, options) => request(path, { method: "DELETE", ...options }),
  blob: async (path, options) => {
    const res = await request(path, { method: "GET", ...options });
    return res.blob();
  },
};
