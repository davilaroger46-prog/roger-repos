const PREFIX = "orthostudy:";

export function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function set(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {}
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

export function loadSavedCases() {
  return get("cases", []);
}

export function saveCases(cases) {
  set("cases", cases);
}
