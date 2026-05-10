import { useState, useEffect } from "react";
import { getCase } from "../api/client";
import ClinicalDecisionPanel from "../components/ClinicalDecisionPanel";

const Section = ({ title, children }) => (
  <div className="card">
    <div className="decision-label" style={{ marginBottom: 10 }}>{title}</div>
    {children}
  </div>
);

export default function CaseDetailPage({ caso, onBack, onFlashcards }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCase(caso.id)
      .then(setData)
      .finally(() => setLoading(false));
  }, [caso.id]);

  if (loading) return <p style={{ color: "var(--muted)", padding: 20 }}>Carregando caso...</p>;
  if (!data)   return <p style={{ color: "var(--red)", padding: 20 }}>Erro ao carregar caso.</p>;

  const { paciente, historia, classificacao, exame_fisico, imagem, diagnostico, tratamento, complicacoes, output_app } = data;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 20, cursor: "pointer" }}
        >
          ←
        </button>
        <span style={{ fontWeight: 800, fontSize: 16 }}>{data.meta?.titulo}</span>
      </div>

      {output_app?.resumo && (
        <div className="card" style={{ borderLeft: "4px solid var(--primary)" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{output_app.resumo}</p>
        </div>
      )}

      <ClinicalDecisionPanel data={data} />

      {paciente && (
        <Section title="Paciente">
          <div className="risk-grid">
            {[
              ["Sexo",    paciente.sexo],
              ["Idade",   `${paciente.idade} anos`],
              ["Lado",    paciente.lado],
              ["Demanda", paciente.demanda_funcional],
            ].map(([label, value]) => (
              <div key={label} className="risk-box">
                <div className="risk-label">{label}</div>
                <div className="risk-value" style={{ fontSize: 13 }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>{paciente.atividade}</div>
        </Section>
      )}

      {historia && (
        <Section title="História Clínica">
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{historia.descricao}</p>
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
            Mecanismo: {historia.mecanismo_lesao}
          </div>
        </Section>
      )}

      {classificacao?.ao_ota && (
        <Section title="Classificação AO/OTA">
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)" }}>
            {classificacao.ao_ota.codigo}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {classificacao.ao_ota.osso} — {classificacao.ao_ota.descricao}
          </div>
          {classificacao.secundarias?.map((s, i) => (
            <div key={i} className="list-item">
              <strong>{s.nome} {s.grau}</strong> — {s.descricao}
            </div>
          ))}
        </Section>
      )}

      {exame_fisico?.red_flags?.length > 0 && (
        <div className="emergency-banner">
          🚩 Red Flags: {exame_fisico.red_flags.join(" · ")}
        </div>
      )}

      {diagnostico && (
        <Section title="Diagnóstico">
          <div style={{ fontWeight: 800, fontSize: 15 }}>{diagnostico.principal}</div>
          {diagnostico.diferenciais?.map((d, i) => (
            <div key={i} className="list-item" style={{ fontSize: 13, color: "var(--muted)" }}>⚖️ {d}</div>
          ))}
        </Section>
      )}

      {imagem && (
        <Section title="Imagem">
          {imagem.rx?.indicado && (
            <div style={{ marginBottom: 8 }}>
              <div className="risk-label">Radiografia</div>
              {imagem.rx.achados?.map((a, i) => (
                <div key={i} className="list-item" style={{ fontSize: 13 }}>• {a}</div>
              ))}
            </div>
          )}
          {imagem.tc?.indicado && (
            <div style={{ marginTop: 8 }}>
              <div className="risk-label">TC — {imagem.tc.quando}</div>
            </div>
          )}
        </Section>
      )}

      {tratamento?.conservador?.indicado && (
        <Section title="Tratamento Conservador">
          {tratamento.conservador.protocolo?.map((p, i) => (
            <div key={i} className="list-item" style={{ fontSize: 13 }}>• {p}</div>
          ))}
        </Section>
      )}

      {complicacoes && (
        <Section title="Complicações">
          <div className="risk-label" style={{ marginBottom: 4 }}>Precoces</div>
          {complicacoes.precoces?.map((c, i) => (
            <div key={i} className="list-item" style={{ fontSize: 13, color: "var(--amber)" }}>⚠️ {c}</div>
          ))}
          <div className="risk-label" style={{ margin: "10px 0 4px" }}>Tardias</div>
          {complicacoes.tardias?.map((c, i) => (
            <div key={i} className="list-item" style={{ fontSize: 13, color: "var(--muted)" }}>• {c}</div>
          ))}
        </Section>
      )}

      <button
        onClick={onFlashcards}
        style={{
          width: "100%", padding: "14px", borderRadius: 14, border: "none",
          background: "var(--primary)", color: "#fff", fontWeight: 800,
          fontSize: 15, cursor: "pointer", marginTop: 8, marginBottom: 20,
        }}
      >
        🃏 Estudar Flashcards ({data.flashcards?.length || 0})
      </button>
    </>
  );
}
