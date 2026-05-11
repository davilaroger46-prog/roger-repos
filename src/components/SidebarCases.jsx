import { useMemo, useState } from "react";
import { T, NIV_C } from "../constants/theme";
import Tag from "./Tag";

export default function SidebarCases({
  cases = [],
  activeCaseId,
  onLoadCase,
  onDeleteCase,
}) {
  const [search, setSearch] = useState("");
  const [nivel, setNivel] = useState("");
  const [regiao, setRegiao] = useState("");

  const regioes = useMemo(() => {
    return [...new Set(cases.map((c) => c.regiao).filter(Boolean))].sort();
  }, [cases]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const text = `${c.titulo || ""} ${c.regiao || ""} ${c.ao_codigo || ""}`.toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
      const matchNivel = nivel ? c.nivel === nivel : true;
      const matchRegiao = regiao ? c.regiao === regiao : true;

      return matchSearch && matchNivel && matchRegiao;
    });
  }, [cases, search, nivel, regiao]);

  if (!cases.length) return null;

  return (
    <aside
      style={{
        width: 300,
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        background: T.s1,
        borderRight: `1px solid ${T.border}`,
        padding: "18px 12px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: T.muted,
          textTransform: "uppercase",
          letterSpacing: ".12em",
          marginBottom: 14,
        }}
      >
        💾 Casos Salvos · {filteredCases.length}/{cases.length}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar caso, AO/OTA..."
        style={inputStyle}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        <select value={nivel} onChange={(e) => setNivel(e.target.value)} style={selectStyle}>
          <option value="">Nível</option>
          <option value="basico">Básico</option>
          <option value="intermediario">Intermediário</option>
          <option value="avancado">Avançado</option>
        </select>

        <select value={regiao} onChange={(e) => setRegiao(e.target.value)} style={selectStyle}>
          <option value="">Região</option>
          {regioes.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {(search || nivel || regiao) && (
        <button
          onClick={() => {
            setSearch("");
            setNivel("");
            setRegiao("");
          }}
          style={{
            width: "100%",
            marginBottom: 12,
            background: T.s2,
            border: `1px solid ${T.border}`,
            color: T.muted,
            borderRadius: 8,
            padding: "7px 10px",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          Limpar filtros
        </button>
      )}

      {filteredCases.map((c) => (
        <div
          key={c.id}
          onClick={() => onLoadCase(c.id)}
          style={{
            background: activeCaseId === c.id ? `${T.blue}12` : T.s2,
            border: `1px solid ${
              activeCaseId === c.id ? T.blue + "55" : T.border
            }`,
            borderRadius: 12,
            padding: 12,
            cursor: "pointer",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: T.muted,
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              #{c.id}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCase(c.id);
              }}
              style={{
                background: "none",
                border: "none",
                color: T.muted,
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: T.text,
              lineHeight: 1.35,
              marginBottom: 8,
            }}
          >
            {c.titulo}
          </div>

          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {c.regiao && <Tag c={T.blue} sm>{c.regiao}</Tag>}
            {c.nivel && <Tag c={NIV_C[c.nivel] || T.blue} sm>{c.nivel}</Tag>}
            {c.ao_codigo && <Tag c={T.purple} sm>{c.ao_codigo}</Tag>}
          </div>
        </div>
      ))}

      {!filteredCases.length && (
        <div
          style={{
            marginTop: 20,
            color: T.muted,
            fontSize: 12,
            lineHeight: 1.7,
            textAlign: "center",
          }}
        >
          Nenhum caso encontrado com esses filtros.
        </div>
      )}
    </aside>
  );
}

const inputStyle = {
  width: "100%",
  background: T.s2,
  border: `1px solid ${T.border}`,
  borderRadius: 9,
  padding: "9px 10px",
  color: T.text,
  fontSize: 12,
  outline: "none",
  marginBottom: 8,
};

const selectStyle = {
  width: "100%",
  background: T.s2,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  padding: "8px 9px",
  color: T.muted,
  fontSize: 11,
  outline: "none",
};
