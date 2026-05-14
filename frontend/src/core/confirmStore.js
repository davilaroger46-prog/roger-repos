let _resolve = null;
let _listeners = [];
let _state = null;

function notify() {
  _listeners.forEach((fn) => fn(_state));
}

export function subscribeConfirm(fn) {
  _listeners.push(fn);
  fn(_state);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

export function confirmAction(message, options = {}) {
  return new Promise((resolve) => {
    _resolve = resolve;
    _state = {
      message,
      confirmLabel: options.confirmLabel || "Confirmar",
      cancelLabel: options.cancelLabel || "Cancelar",
      danger: options.danger ?? false,
      title: options.title || null,
    };
    notify();
  });
}

export function resolveConfirm(result) {
  _state = null;
  notify();
  if (_resolve) {
    _resolve(result);
    _resolve = null;
  }
}
