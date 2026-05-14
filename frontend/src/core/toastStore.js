const DURATION = 4000;

let listeners = [];
let toasts = [];

function notify() {
  listeners.forEach((fn) => fn([...toasts]));
}

export function showToast(message, type = "success") {
  const id = Date.now() + Math.random();
  toasts = [...toasts, { id, message, type }];
  notify();

  setTimeout(() => dismissToast(id), DURATION);
}

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function subscribeToasts(fn) {
  listeners.push(fn);
  fn([...toasts]);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
