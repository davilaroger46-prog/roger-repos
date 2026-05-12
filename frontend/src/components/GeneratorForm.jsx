import { EXEMPLOS } from "../constants/examples";
import { NIVEL_OPTIONS } from "../constants/prompt";

export default function GeneratorForm({ tema, onTemaChange, nivel, onNivelChange }) {
  return (
    <>
      <div className="card">
        <div className="risk-label" style={{ marginBottom: 8 }}>Tema do caso</div>
        <textarea
          value={tema}
          onChange={(e) => onTemaChange(e.target.value)}
          placeholder="Ex: Fratura do olécrano em adulto jovem atleta"
          rows={3}
          style={{
            width: "100%", background: "transparent", border: "none",
            color: "var(--text)", fontSize: 14, outline: "none",
            resize: "none", lineHeight: 1.6,
          }}
        />
      </div>

      <div className="card">
        <div className="risk-label" style={{ marginBottom: 8 }}>Nível de dificuldade</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {NIVEL_OPTIONS.map(({ val, label }) => (
            <button
              key={val}
              onClick={() => onNivelChange(val)}
              style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                border: "1px solid var(--border)", cursor: "pointer",
                background: nivel === val ? "var(--primary)" : "transparent",
                color: nivel === val ? "#fff" : "var(--muted)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="risk-label" style={{ marginBottom: 8 }}>Exemplos rápidos</div>
        {EXEMPLOS.map((e) => (
          <div
            key={e}
            className="list-item"
            style={{ cursor: "pointer", fontSize: 13, padding: "8px 0" }}
            onClick={() => onTemaChange(e)}
          >
            {e}
          </div>
        ))}
      </div>
    </>
  );
}
