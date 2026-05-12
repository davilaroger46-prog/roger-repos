import { useState, useEffect } from "react";
import { subscribeToasts } from "../core/toastStore";

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToasts(setToasts);
  }, []);

  return toasts;
}
