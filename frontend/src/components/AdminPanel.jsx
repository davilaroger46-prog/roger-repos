import { useState, useEffect } from "react";
import { T } from "../constants/theme";
import { getAdminStats, listAdminUsers, updateUserRole } from "../services/api";
import { showToast } from "../core/toastStore";

const ROLES = ["doctor", "reviewer", "admin"];

const ROLE_COLORS = {
  doctor:   { bg: `${T.blue}18`,   border: `${T.blue}40`,   text: T.blue },
  reviewer: { bg: `${T.cyan}18`,   border: `${T.cyan}40`,   text: T.cyan },
  admin:    { bg: `${T.red}18`,    border: `${T.red}40`,    text: "#f87171" },
};
const T_red = "#ef4444";

export default function AdminPanel({ currentUser }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => showToast("Erro ao carregar stats", "error"))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoadingUsers(true);
    listAdminUsers({ page, q, role: roleFilter })
      .then((data) => {
        setUsers(data.items);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch(() => showToast("Erro ao carregar usuários", "error"))
      .finally(() => setLoadingUsers(false));
  }, [page, q, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u)));
      if (stats) {
        setStats((s) => {
          const old = users.find((u) => u.id === userId)?.role;
          const by_role = { ...s.by_role };
          if (old) by_role[old] = Math.max(0, (by_role[old] || 0) - 1);
          by_role[newRole] = (by_role[newRole] || 0) + 1;
          return { ...s, by_role };
        });
      }
      showToast("Role atualizada", "success");
    } catch (e) {
      showToast(e.message || "Erro ao atualizar role", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 4px" }}>
      <h2 style={{ fontFamily: "Georgia,serif", fontSize: 22, marginBottom: 4 }}>
        Painel Admin
      </h2>
      <p style={{ color: T.muted, fontSize: 12, marginBottom: 24 }}>
        Visão geral da plataforma e gerenciamento de usuários
      </p>

      {/* Stats cards */}
      {loadingStats ? (
        <div style={{ color: T.muted, fontSize: 12, marginBottom: 24 }}>Carregando stats...</div>
      ) : stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 28 }}>
          <StatCard label="Usuários" value={stats.total_users} color={T.blue} />
          <StatCard label="Casos" value={stats.total_cases} color={T.cyan} />
          {Object.entries(stats.by_status || {}).map(([s, n]) => (
            <StatCard key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} value={n} color={T.muted} />
          ))}
          {Object.entries(stats.by_role || {}).map(([r, n]) => (
            <StatCard key={r} label={`Role: ${r}`} value={n} color={ROLE_COLORS[r]?.text || T.text} />
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Buscar por nome ou email..."
          style={{
            flex: 1, minWidth: 200, background: T.s2, border: `1px solid ${T.border}`,
            borderRadius: 10, padding: "8px 12px", color: T.text, fontSize: 12, outline: "none",
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          style={{
            background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10,
            padding: "8px 12px", color: T.text, fontSize: 12, cursor: "pointer",
          }}
        >
          <option value="">Todos os roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Users table */}
      <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1.4fr 100px 80px 110px",
          padding: "10px 16px", borderBottom: `1px solid ${T.b2}`,
          fontSize: 10, fontWeight: 900, color: T.muted, textTransform: "uppercase", letterSpacing: ".1em",
        }}>
          <span>Nome</span><span>Email</span><span>Casos</span><span>Role</span><span>Alterar role</span>
        </div>

        {loadingUsers ? (
          <div style={{ padding: 24, color: T.muted, fontSize: 12, textAlign: "center" }}>
            Carregando usuários...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: 24, color: T.muted, fontSize: 12, textAlign: "center" }}>
            Nenhum usuário encontrado
          </div>
        ) : users.map((u) => {
          const rc = ROLE_COLORS[u.role] || ROLE_COLORS.doctor;
          const isSelf = u.id === currentUser?.id;
          return (
            <div
              key={u.id}
              style={{
                display: "grid", gridTemplateColumns: "1fr 1.4fr 100px 80px 110px",
                padding: "12px 16px", borderBottom: `1px solid ${T.b2}`,
                alignItems: "center", fontSize: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: T.text }}>{u.name}</div>
                <div style={{ color: T.muted, fontSize: 10 }}>id #{u.id}</div>
              </div>
              <div style={{ color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {u.email}
              </div>
              <div style={{ color: T.text, fontWeight: 700 }}>{u.case_count}</div>
              <div>
                <span style={{
                  padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 900,
                  background: rc.bg, border: `1px solid ${rc.border}`, color: rc.text,
                }}>
                  {u.role}
                </span>
              </div>
              <div>
                {isSelf ? (
                  <span style={{ color: T.muted, fontSize: 10 }}>você</span>
                ) : (
                  <select
                    value={u.role}
                    disabled={updatingId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    style={{
                      background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8,
                      padding: "5px 8px", color: T.text, fontSize: 11, cursor: "pointer",
                      opacity: updatingId === u.id ? 0.5 : 1,
                    }}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, alignItems: "center" }}>
          <PagBtn disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Anterior</PagBtn>
          <span style={{ fontSize: 12, color: T.muted }}>
            {page} / {pages} — {total} usuários
          </span>
          <PagBtn disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Próxima ›</PagBtn>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12,
      padding: "14px 16px",
    }}>
      <div style={{ fontSize: 10, color: T.muted, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color, fontVariantNumeric: "tabular-nums" }}>
        {value ?? "—"}
      </div>
    </div>
  );
}

function PagBtn({ children, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "7px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
        background: disabled ? T.s1 : T.s2, color: disabled ? T.muted : T.text,
        fontSize: 12, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}
