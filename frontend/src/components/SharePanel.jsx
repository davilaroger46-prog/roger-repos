import { useState, useEffect } from "react";
import { T } from "../constants/theme";
import { shareCase, listCaseShares, removeCaseShare } from "../services/api";
import { showToast } from "../core/toastStore";

const PERM_COLORS = {
  view: { bg: `${T.cyan}18`, border: `${T.cyan}40`, text: T.cyan },
  edit: { bg: `${T.amber}18`, border: `${T.amber}40`, text: T.amber },
};

export default function SharePanel({ caseId, currentUser, caso }) {
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [sharing, setSharing] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const isOwner = caso?._db?.user_id === currentUser?.id;

  useEffect(() => {
    if (open && caseId && isOwner) {
      setLoading(true);
      listCaseShares(caseId)
        .then(setShares)
        .catch(() => showToast("Erro ao carregar compartilhamentos", "error"))
        .finally(() => setLoading(false));
    }
  }, [open, caseId, isOwner]);

  if (!caseId || !isOwner) return null;

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSharing(true);
    try {
      await shareCase(caseId, { email: email.trim(), permission });
      const updated = await listCaseShares(caseId);
      setShares(updated);
      setEmail("");
      showToast("Caso compartilhado com sucesso.", "success");
    } catch (err) {
      showToast(err.message || "Erro ao compartilhar", "error");
    } finally {
      setSharing(false);
    }
  };

  const handleRemove = async (shareId) => {
    setRemovingId(shareId);
    try {
      await removeCaseShare(caseId, shareId);
      setShares((prev) => prev.filter((s) => s.id !== shareId));
      showToast("Compartilhamento removido.");
    } catch (err) {
      showToast(err.message || "Erro ao remover", "error");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "none", border: "none", cursor: "pointer",
          color: T.muted, fontSize: 11, fontWeight: 800,
          padding: "6px 0",
          textTransform: "uppercase", letterSpacing: ".1em",
        }}
      >
        <span style={{
          display: "inline-block", transition: "transform .15s",
          transform: open ? "rotate(90deg)" : "none", fontSize: 10,
        }}>▶</span>
        Compartilhar Caso
        {shares.length > 0 && !open && (
          <span style={{
            background: `${T.blue}20`, border: `1px solid ${T.blue}40`,
            color: T.blue, borderRadius: 999, padding: "1px 7px", fontSize: 10,
          }}>
            {shares.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          background: T.s1, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: 16, marginTop: 6,
        }}>
          <form onSubmit={handleShare} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email do usuário..."
              required
              style={{
                flex: 1, minWidth: 180,
                background: T.s2, border: `1px solid ${T.border}`,
                borderRadius: 9, padding: "8px 12px",
                color: T.text, fontSize: 12, outline: "none",
              }}
            />
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              style={{
                background: T.s2, border: `1px solid ${T.border}`,
                borderRadius: 9, padding: "8px 10px",
                color: T.text, fontSize: 12, cursor: "pointer",
              }}
            >
              <option value="view">Visualizar</option>
              <option value="edit">Editar</option>
            </select>
            <button
              type="submit"
              disabled={sharing || !email.trim()}
              style={{
                padding: "8px 16px", borderRadius: 9,
                background: sharing ? T.s2 : `${T.blue}20`,
                border: `1px solid ${T.blue}40`,
                color: sharing ? T.muted : T.blue,
                fontSize: 12, fontWeight: 800, cursor: sharing ? "not-allowed" : "pointer",
              }}
            >
              {sharing ? "Enviando..." : "Compartilhar"}
            </button>
          </form>

          {loading ? (
            <div style={{ color: T.muted, fontSize: 12 }}>Carregando...</div>
          ) : shares.length === 0 ? (
            <div style={{ color: T.muted, fontSize: 12 }}>Nenhum compartilhamento ativo.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {shares.map((s) => {
                const pc = PERM_COLORS[s.permission] || PERM_COLORS.view;
                return (
                  <div
                    key={s.id}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 10, background: T.s2, border: `1px solid ${T.border}`,
                      borderRadius: 10, padding: "10px 12px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.shared_with_name}
                      </div>
                      <div style={{ fontSize: 10, color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.shared_with_email}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{
                        padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 900,
                        background: pc.bg, border: `1px solid ${pc.border}`, color: pc.text,
                      }}>
                        {s.permission === "view" ? "Visualizar" : "Editar"}
                      </span>
                      <button
                        onClick={() => handleRemove(s.id)}
                        disabled={removingId === s.id}
                        style={{
                          background: "none", border: "none",
                          color: removingId === s.id ? T.muted : T.red,
                          cursor: removingId === s.id ? "not-allowed" : "pointer",
                          fontSize: 16, lineHeight: 1, padding: "0 2px",
                        }}
                        title="Remover compartilhamento"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
