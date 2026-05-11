export function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export function setPath(obj, path, value) {
  const keys = path.split(".");
  const result = structuredClone(obj);
  let cursor = result;

  for (let i = 0; i < keys.length - 1; i++) {
    if (cursor[keys[i]] === undefined || cursor[keys[i]] === null) {
      cursor[keys[i]] = {};
    }
    cursor = cursor[keys[i]];
  }

  cursor[keys[keys.length - 1]] = value;
  return result;
}
