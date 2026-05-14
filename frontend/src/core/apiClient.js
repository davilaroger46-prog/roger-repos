const API_URL = "http://localhost:8000";

export function getToken()        { return localStorage.getItem("orthostudy_token"); }
export function setToken(token)   { localStorage.setItem("orthostudy_token", token); }
export function clearToken()      { localStorage.removeItem("orthostudy_token"); }

function getRefreshToken()              { return localStorage.getItem("orthostudy_refresh"); }
function setRefreshToken(token)         { localStorage.setItem("orthostudy_refresh", token); }
function clearRefreshToken()            { localStorage.removeItem("orthostudy_refresh"); }

export function storeTokens({ access_token, refresh_token }) {
  setToken(access_token);
  if (refresh_token) setRefreshToken(refresh_token);
}

export function clearTokens() {
  clearToken();
  clearRefreshToken();
}

let _refreshing = false;
let _refreshQueue = [];

async function tryRefresh() {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!res.ok) return false;

  const data = await res.json();
  storeTokens(data);
  return true;
}

export async function apiClient(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    if (_refreshing) {
      return new Promise((resolve, reject) => {
        _refreshQueue.push({ resolve, reject, path, options });
      });
    }

    _refreshing = true;
    const refreshed = await tryRefresh().catch(() => false);
    _refreshing = false;

    if (refreshed) {
      const queued = _refreshQueue.splice(0);
      queued.forEach(({ resolve, reject, path: p, options: o }) =>
        apiClient(p, o).then(resolve).catch(reject)
      );
      return apiClient(path, options);
    }

    clearTokens();
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
  if (contentType?.includes("application/json")) return response.json();
  return response;
}
