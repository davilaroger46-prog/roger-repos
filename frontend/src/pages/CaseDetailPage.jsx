import { useState, useEffect } from "react";
import { getCase } from "../services/api";
import ClinicalDecisionPanel from "../components/ClinicalDecisionPanel";

const Section = ({ title, children }) => (
  <div className="card">
    <div className="decision-label" style={{ marginBottom: 10 }}>{title}</div>
    {children}
  </div>
);

const TABS = ["Visão Geral", "Cirurgia", "Reabilitação", "Evidências"];

export default function CaseDetailPage({ caso, onBack, onFlashcards }) {
  const casoId = caso.id || caso.meta?.id;
  const [data, setData] = useState(caso.flashcards ? caso : null);
  const [loading, setLoading] = useState(!caso.flashcards);
  const [activeTab, setActiveTab] = useState("Visão Geral");

  useEffect(() => {
    if (caso.flashcards) return;
    getCase(casoId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [casoId]);

  if (loading) return <p style={{ color: "var(--muted)", padding: 20 }}>Carregando caso...</p>;
  if (!data)   return <p style={{ color: "var(--red)", padding: 20 }}>Erro ao carregar caso.</p>;

  const { paciente, historia, classificacao, exame_fisico, imagem,
          diagnostico, tratamento, cirurgia, pos_operatorio,
          reabilitacao, complicacoes, evidencia, output_app } = data;

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 20, cursor: "pointer" }}>←</button>
        <span style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>{data.meta?.titulo}</span>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
            border: "1px solid var(--border)", cursor: "pointer", whiteSpace: "nowrap",
            background: activeTab === t ? "var(--primary)" : "transparent",
            color: activeTab === t ? "#fff" : "var(--muted)",
          }}>{t}</button>
        ))}
      </div>

      {/* ── ABA: VISÃO GERAL ── */}
      {activeTab === "Visão Geral" && (
        <>
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
              {paciente.atividade && <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>{paciente.atividade}</div>}
              {paciente.comorbidades?.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {paciente.comorbidades.map((c, i) => <span key={i} className="badge badge-amber">{c}</span>)}
                </div>
              )}
            </Section>
          )}

          {historia && (
            <Section title="História Clínica">
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{historia.descricao}</p>
              <div style={{ marginTop: 10, padding: "10px", background: "var(--panel-soft)", borderRadius: 10, fontSize: 13, color: "var(--muted)" }}>
                <strong>Mecanismo:</strong> {historia.mecanismo_lesao}
              </div>
            </Section>
          )}

          {classificacao?.ao_ota && (
            <Section title="Classificação AO/OTA">
              <div style={{ fontSize: 24, fontWeight: 900, color: "var(--primary)" }}>
                {classificacao.ao_ota.codigo}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                {classificacao.ao_ota.osso} — {classificacao.ao_ota.descricao}
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <span className={`badge ${classificacao.ao_ota.gravidade === "alta" ? "badge-red" : classificacao.ao_ota.gravidade === "moderada" ? "badge-amber" : "badge-green"}`}>
                  Gravidade: {classificacao.ao_ota.gravidade}
                </span>
                <span className="badge badge-blue">Confiança: {classificacao.ao_ota.confianca}</span>
              </div>
              {classificacao.secundarias?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div className="risk-label" style={{ marginBottom: 6 }}>Classificações Secundárias</div>
                  {classificacao.secundarias.map((s, i) => (
                    <div key={i} className="list-item">
                      <strong>{s.nome} {s.grau}</strong>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{s.descricao}</div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

          {exame_fisico && (
            <Section title="Exame Físico">
              {exame_fisico.red_flags?.length > 0 && (
                <div className="emergency-banner" style={{ marginBottom: 10 }}>
                  🚩 {exame_fisico.red_flags.join(" · ")}
                </div>
              )}
              {exame_fisico.inspecao?.length > 0 && (
                <>
                  <div className="risk-label" style={{ marginBottom: 4 }}>Inspeção</div>
                  {exame_fisico.inspecao.map((a, i) => <div key={i} className="list-item" style={{ fontSize: 13 }}>• {a}</div>)}
                </>
              )}
              {exame_fisico.palpacao?.length > 0 && (
                <>
                  <div className="risk-label" style={{ margin: "10px 0 4px" }}>Palpação</div>
                  {exame_fisico.palpacao.map((a, i) => <div key={i} className="list-item" style={{ fontSize: 13 }}>• {a}</div>)}
                </>
              )}
              {exame_fisico.movimento && (
                <>
                  <div className="risk-label" style={{ margin: "10px 0 4px" }}>Movimento</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>{exame_fisico.movimento}</div>
                </>
              )}
              {exame_fisico.testes?.length > 0 && (
                <>
                  <div className="risk-label" style={{ margin: "10px 0 6px" }}>Testes Especiais</div>
                  {exame_fisico.testes.map((t, i) => (
                    <div key={i} style={{ background: "var(--panel-soft)", borderRadius: 10, padding: 10, marginBottom: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{t.nome}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <span className="badge badge-green">Sens: {t.sensibilidade}</span>
                        <span className="badge badge-blue">Esp: {t.especificidade}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{t.positivo}</div>
                    </div>
                  ))}
                </>
              )}
            </Section>
          )}

          {diagnostico && (
            <Section title="Diagnóstico">
              <div style={{ fontWeight: 800, fontSize: 15 }}>{diagnostico.principal}</div>
              <span className="badge badge-blue" style={{ marginTop: 6 }}>Confirmação: {diagnostico.confirmacao}</span>
              {diagnostico.diferenciais?.length > 0 && (
                <>
                  <div className="risk-label" style={{ margin: "10px 0 4px" }}>Diagnósticos Diferenciais</div>
                  {diagnostico.diferenciais.map((d, i) => (
                    <div key={i} className="list-item" style={{ fontSize: 13, color: "var(--muted)" }}>⚖️ {d}</div>
                  ))}
                </>
              )}
            </Section>
          )}

          {imagem && (
            <Section title="Imagem">
              {imagem.rx?.indicado && (
                <div style={{ marginBottom: 10 }}>
                  <div className="risk-label" style={{ marginBottom: 4 }}>Radiografia</div>
                  {imagem.rx.achados?.map((a, i) => <div key={i} className="list-item" style={{ fontSize: 13 }}>• {a}</div>)}
                </div>
              )}
              {imagem.tc?.indicado && (
                <div style={{ marginBottom: 10 }}>
                  <div className="risk-label" style={{ marginBottom: 4 }}>Tomografia Computadorizada</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>{imagem.tc.quando}</div>
                </div>
              )}
              {imagem.rm?.indicado && (
                <div>
                  <div className="risk-label" style={{ marginBottom: 4 }}>Ressonância Magnética</div>
                  {imagem.rm.achados?.map((a, i) => <div key={i} className="list-item" style={{ fontSize: 13 }}>• {a}</div>)}
                </div>
              )}
            </Section>
          )}

          {complicacoes && (
            <Section title="Complicações">
              {complicacoes.precoces?.length > 0 && (
                <>
                  <div className="risk-label" style={{ marginBottom: 4 }}>Precoces</div>
                  {complicacoes.precoces.map((c, i) => <div key={i} className="list-item" style={{ fontSize: 13, color: "var(--amber)" }}>⚠️ {c}</div>)}
                </>
              )}
              {complicacoes.tardias?.length > 0 && (
                <>
                  <div className="risk-label" style={{ margin: "10px 0 4px" }}>Tardias</div>
                  {complicacoes.tardias.map((c, i) => <div key={i} className="list-item" style={{ fontSize: 13, color: "var(--muted)" }}>• {c}</div>)}
                </>
              )}
              {complicacoes.prevencao?.length > 0 && (
                <>
                  <div className="risk-label" style={{ margin: "10px 0 4px" }}>Prevenção</div>
                  {complicacoes.prevencao.map((c, i) => <div key={i} className="list-item" style={{ fontSize: 13, color: "var(--green)" }}>✓ {c}</div>)}
                </>
              )}
            </Section>
          )}
        </>
      )}

      {/* ── ABA: CIRURGIA ── */}
      {activeTab === "Cirurgia" && (
        <>
          {cirurgia ? (
            <>
              {cirurgia.indicacoes?.length > 0 && (
                <Section title="Indicações">
                  {cirurgia.indicacoes.map((ind, i) => <div key={i} className="list-item" style={{ fontSize: 13 }}>• {ind}</div>)}
                </Section>
              )}

              {cirurgia.posicionamento && (
                <Section title="Posicionamento">
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{cirurgia.posicionamento}</p>
                </Section>
              )}

              {cirurgia.anestesia?.length > 0 && (
                <Section title="Anestesia">
                  {cirurgia.anestesia.map((a, i) => <div key={i} className="list-item" style={{ fontSize: 13 }}>• {a}</div>)}
                </Section>
              )}

              {cirurgia.passo_a_passo?.length > 0 && (
                <Section title="Passo a Passo Cirúrgico">
                  {cirurgia.passo_a_passo.map((p) => (
                    <div key={p.ordem} style={{ marginBottom: 14, borderLeft: "3px solid var(--primary)", paddingLeft: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ background: "var(--primary)", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{p.ordem}</span>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>{p.titulo}</span>
                      </div>
                      <p style={{ margin: "0 0 6px", fontSize: 13, lineHeight: 1.6, color: "var(--text)" }}>{p.descricao}</p>
                      {p.ponto_critico && (
                        <div style={{ background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.3)", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "var(--amber)" }}>
                          ⚠️ {p.ponto_critico}
                        </div>
                      )}
                    </div>
                  ))}
                </Section>
              )}

              {cirurgia.materiais?.length > 0 && (
                <Section title="Materiais e Implantes">
                  {["implante", "instrumental"].map((tipo) => {
                    const items = cirurgia.materiais.filter((m) => m.tipo === tipo);
                    if (!items.length) return null;
                    return (
                      <div key={tipo} style={{ marginBottom: 10 }}>
                        <div className="risk-label" style={{ marginBottom: 4, textTransform: "capitalize" }}>{tipo}s</div>
                        {items.map((m, i) => <div key={i} className="list-item" style={{ fontSize: 13 }}>• {m.nome}</div>)}
                      </div>
                    );
                  })}
                </Section>
              )}

              {pos_operatorio && (
                <Section title="Pós-Operatório">
                  {pos_operatorio.imediato?.length > 0 && (
                    <>
                      <div className="risk-label" style={{ marginBottom: 4 }}>Cuidados Imediatos</div>
                      {pos_operatorio.imediato.map((p, i) => <div key={i} className="list-item" style={{ fontSize: 13 }}>• {p}</div>)}
                    </>
                  )}
                  {pos_operatorio.prescricao?.length > 0 && (
                    <>
                      <div className="risk-label" style={{ margin: "10px 0 4px" }}>Prescrição</div>
                      {pos_operatorio.prescricao.map((p, i) => (
                        <div key={i} style={{ background: "var(--panel-soft)", borderRadius: 8, padding: "8px 10px", marginBottom: 6, fontSize: 13 }}>
                          <strong>{p.nome}</strong> — {p.dose} · {p.duracao}
                        </div>
                      ))}
                    </>
                  )}
                  {pos_operatorio.restricoes?.length > 0 && (
                    <>
                      <div className="risk-label" style={{ margin: "10px 0 4px" }}>Restrições</div>
                      {pos_operatorio.restricoes.map((r, i) => <div key={i} className="list-item" style={{ fontSize: 13, color: "var(--red)" }}>✗ {r}</div>)}
                    </>
                  )}
                </Section>
              )}

              {tratamento?.cirurgico?.tecnicas?.length > 0 && (
                <Section title="Técnicas Alternativas">
                  {tratamento.cirurgico.tecnicas.map((t, i) => (
                    <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{t.nome}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0" }}>{t.quando_usar}</div>
                      <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                        <div style={{ flex: 1 }}>
                          <div className="risk-label" style={{ marginBottom: 2 }}>Vantagens</div>
                          {t.vantagens?.map((v, j) => <div key={j} style={{ fontSize: 11, color: "var(--green)" }}>+ {v}</div>)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="risk-label" style={{ marginBottom: 2 }}>Desvantagens</div>
                          {t.desvantagens?.map((d, j) => <div key={j} style={{ fontSize: 11, color: "var(--red)" }}>− {d}</div>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </Section>
              )}
            </>
          ) : (
            <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
              <p>Tratamento conservador indicado para este caso.</p>
              {tratamento?.conservador?.protocolo?.map((p, i) => (
                <div key={i} className="list-item" style={{ fontSize: 13, textAlign: "left" }}>• {p}</div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── ABA: REABILITAÇÃO ── */}
      {activeTab === "Reabilitação" && (
        <>
          {reabilitacao?.length > 0 ? reabilitacao.map((fase, i) => (
            <div key={i} className="card" style={{ borderLeft: `4px solid ${i === 0 ? "var(--green)" : i === 1 ? "var(--amber)" : "var(--primary)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 900, fontSize: 14 }}>{fase.fase}</span>
                <span className="badge badge-blue">{fase.periodo}</span>
              </div>
              {fase.objetivo && (
                <div style={{ marginTop: 8, fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>{fase.objetivo}</div>
              )}
              {fase.exercicios?.length > 0 && (
                <>
                  <div className="risk-label" style={{ margin: "10px 0 4px" }}>Exercícios</div>
                  {fase.exercicios.map((e, j) => <div key={j} className="list-item" style={{ fontSize: 13 }}>• {e}</div>)}
                </>
              )}
              {fase.restricoes?.length > 0 && (
                <>
                  <div className="risk-label" style={{ margin: "10px 0 4px" }}>Restrições</div>
                  {fase.restricoes.map((r, j) => <div key={j} className="list-item" style={{ fontSize: 13, color: "var(--red)" }}>✗ {r}</div>)}
                </>
              )}
            </div>
          )) : (
            <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
              <p>Protocolo de reabilitação não disponível para este caso.</p>
            </div>
          )}
        </>
      )}

      {/* ── ABA: EVIDÊNCIAS ── */}
      {activeTab === "Evidências" && (
        <>
          {evidencia ? (
            <>
              {[
                ["Nível I — ECR e Metanálises", evidencia.nivel_I, "var(--green)"],
                ["Nível II — Estudos Prospectivos", evidencia.nivel_II, "var(--primary)"],
                ["Nível III", evidencia.nivel_III, "var(--amber)"],
                ["Nível IV", evidencia.nivel_IV, "var(--muted)"],
                ["Nível V — Opinião de Especialistas", evidencia.nivel_V, "var(--muted)"],
                ["Publicações Recentes", evidencia.recentes, "var(--accent)"],
              ].map(([titulo, items, cor]) => {
                if (!items?.length) return null;
                return (
                  <Section key={titulo} title={titulo}>
                    {items.map((item, i) => (
                      <div key={i} className="list-item" style={{ fontSize: 13, lineHeight: 1.5, borderLeftColor: cor }}>
                        📄 {item}
                      </div>
                    ))}
                  </Section>
                );
              })}
            </>
          ) : (
            <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
              <p>Evidências não disponíveis para este caso.</p>
            </div>
          )}
        </>
      )}

      {/* Botão Flashcards — sempre visível */}
      <button
        onClick={() => onFlashcards(data)}
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
