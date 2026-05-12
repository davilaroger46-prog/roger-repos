import { T, NIV_C } from "../constants/theme";
import { EXEMPLOS } from "../constants/examples";
import LoadingProgress from "../components/LoadingProgress";

export default function GeneratePage({
  tema,
  setTema,
  nivel,
  setNivel,
  regiao,
  setRegiao,
  loading,
  stage,
  pct,
  textareaRef,
  onGenerate,
}) {
  return (
    <>
      <section
        style={{
          background: T.s1,
          border: `1px solid ${T.b2}`,
          borderRadius: 20,
          padding: 22,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: T.blue,
            textTransform: "uppercase",
            letterSpacing: ".1em",
            marginBottom: 12,
          }}
        >
          Tema do caso
        </div>

        <textarea
          ref={textareaRef}
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          disabled={loading}
          placeholder="Ex: Fratura do rádio distal AO 23-C2 em idosa osteoporótica..."
          rows={4}
          style={{
            width: "100%",
            background: T.s2,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "13px 16px",
            color: T.text,
            fontSize: 13,
            lineHeight: 1.65,
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <div style={smallLabel}>Nível</div>

            <div style={{ display: "flex", gap: 5 }}>
              {["basico", "intermediario", "avancado"].map((n) => (
                <button
                  key={n}
                  onClick={() => setNivel(n)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "capitalize",
                    border: `1px solid ${
                      nivel === n ? NIV_C[n] + "60" : T.border
                    }`,
                    background: nivel === n ? `${NIV_C[n]}12` : T.s2,
                    color: nivel === n ? NIV_C[n] : T.muted,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={smallLabel}>Região</div>

            <select
              value={regiao}
              onChange={(e) => setRegiao(e.target.value)}
              style={{
                width: "100%",
                background: T.s2,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "9px 10px",
                color: regiao ? T.text : T.muted,
                fontSize: 11,
                outline: "none",
              }}
            >
              <option value="">Qualquer região</option>
              {[
                "Joelho",
                "Ombro",
                "Quadril",
                "Tornozelo",
                "Cotovelo",
                "Punho",
                "Fêmur",
                "Tíbia",
                "Coluna",
                "Pé",
              ].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={loading || !tema.trim()}
          style={{
            width: "100%",
            padding: "13px 24px",
            borderRadius: 12,
            cursor: loading || !tema.trim() ? "not-allowed" : "pointer",
            background: loading ? T.s2 : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
            border: "none",
            color: loading ? T.muted : "#fff",
            fontWeight: 900,
            fontSize: 14,
            opacity: !tema.trim() ? 0.45 : 1,
          }}
        >
          {loading ? "Gerando..." : "⚡ Gerar Caso Clínico"}
        </button>
      </section>

      <section style={{ marginBottom: 22 }}>
        <div style={smallTitle}>Exemplos rápidos</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EXEMPLOS.map((ex) => (
            <button
              key={ex.label}
              onClick={() => {
                setTema(ex.tema);
                setTimeout(() => textareaRef.current?.focus(), 50);
              }}
              disabled={loading}
              style={{
                background: T.s1,
                border: `1px solid ${T.border}`,
                borderRadius: 9,
                padding: "8px 13px",
                cursor: "pointer",
                fontSize: 11,
                color: T.muted,
              }}
            >
              {ex.icon} {ex.label}
            </button>
          ))}
        </div>
      </section>

      {loading && <LoadingProgress stage={stage} pct={pct} />}
    </>
  );
}

const smallLabel = {
  fontSize: 10,
  color: T.muted,
  fontWeight: 800,
  textTransform: "uppercase",
  marginBottom: 6,
};

const smallTitle = {
  fontSize: 10,
  fontWeight: 800,
  color: T.muted,
  textTransform: "uppercase",
  letterSpacing: ".1em",
  marginBottom: 10,
};
