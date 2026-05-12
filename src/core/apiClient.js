const API_URL = "http://localhost:8000";

export function getToken() {
  return localStorage.getItem("orthostudy_token");
}

export function setToken(token) {
  localStorage.setItem("orthostudy_token", token);
}

export function clearToken() {
  localStorage.removeItem("orthostudy_token");
}

export async function apiClient(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new Event("orthostudy:unauthorized"));
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    const message =
      error?.detail?.message ||
      error?.detail ||
      `Erro HTTP ${response.status}`;

    const err = new Error(message);
    err.status = response.status;
    err.code = error?.detail?.code;
    err.details = error?.detail?.details;

    throw err;
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response;
}
