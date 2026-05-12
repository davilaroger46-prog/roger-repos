export function setByPath(obj, path, value) {
  const copy = JSON.parse(JSON.stringify(obj));
  const keys = path.split(".");
  let cursor = copy;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!cursor[keys[i]]) cursor[keys[i]] = {};
    cursor = cursor[keys[i]];
  }

  cursor[keys[keys.length - 1]] = value;

  return copy;
}

export function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}
