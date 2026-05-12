import { useCallback, useState } from "react";
import { updateCase, autocorrectCase, restoreCaseVersion } from "../services/api";

function setByPath(obj, path, value) {
  const copy = structuredClone(obj);
  const keys = path.split(".");
  let cursor = copy;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cursor[keys[i]]) cursor[keys[i]] = {};
    cursor = cursor[keys[i]];
  }
  cursor[keys[keys.length - 1]] = value;
  return copy;
}

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export default function useCaseEditor({ caso, setCaso, activeCaseId, refreshCases, showToast }) {
  const [editing, setEditing] = useState(false);
  const [versionPreview, setVersionPreview] = useState(null);
  const [editorLoading, setEditorLoading] = useState(false);

  const startEdit = useCallback(() => setEditing(true), []);
  const cancelEdit = useCallback(() => setEditing(false), []);

  const saveEdit = useCallback(async (draft) => {
    if (!activeCaseId) {
      showToast("Este caso ainda não possui ID no banco.", "error");
      return;
    }
    setEditorLoading(true);
    try {
      const updated = await updateCase(activeCaseId, draft);
      setCaso(updated);
      setEditing(false);
      await refreshCases();
      showToast("Caso salvo com sucesso.");
      return updated;
    } finally {
      setEditorLoading(false);
    }
  }, [activeCaseId, setCaso, refreshCases, showToast]);

  const autoCorrect = useCallback(async (draft) => {
    setEditorLoading(true);
    try {
      const corrected = await autocorrectCase(draft);
      showToast("Autocorreção aplicada.");
      return corrected;
    } finally {
      setEditorLoading(false);
    }
  }, [showToast]);

  const restoreVersion = useCallback(async (versionId) => {
    if (!activeCaseId) return;
    setEditorLoading(true);
    try {
      const updated = await restoreCaseVersion(activeCaseId, versionId);
      setCaso(updated);
      setVersionPreview(null);
      await refreshCases();
      showToast("Versão restaurada.");
    } finally {
      setEditorLoading(false);
    }
  }, [activeCaseId, setCaso, refreshCases, showToast]);

  const restoreField = useCallback(async (path) => {
    const merged = setByPath(caso, path, getByPath(versionPreview, path));
    await saveEdit(merged);
  }, [caso, versionPreview, saveEdit]);

  const restoreBlock = useCallback(async (path) => {
    const merged = setByPath(caso, path, getByPath(versionPreview, path));
    await saveEdit(merged);
  }, [caso, versionPreview, saveEdit]);

  return {
    editing,
    setEditing,
    versionPreview,
    setVersionPreview,
    editorLoading,
    startEdit,
    cancelEdit,
    saveEdit,
    autoCorrect,
    restoreVersion,
    restoreField,
    restoreBlock,
  };
}
