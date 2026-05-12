import { useState } from "react";
import { T, NIV_C, COND_C, COND_I, URG_C } from "../constants/theme";
import Tag from "./Tag";
import ReviewBadge from "./ReviewBadge";

export default function CasePreview({ caso }) {
  const [tab, setTab] = useState("resumo");

  if (!caso) return null;

  const dc = caso.decisao_clinica?.output;

  const tabs = [
    ["resumo",       "📋 Resumo"],
    ["exame",        "🔍 Exame"],
    ["tratamento",   "💊 Tratamento"],
    ["cirurgia",     "🔬 Cirurgia"],
    ["reabilitacao", "🏃 Reab"],
    ["flashcards",   `🃏 Flashcards (${caso.flashcards?.length || 0})`],
    ["json",         "{ } JSON"],
  ];

  return (
    <section
      style={{
        background: T.s1,
        border: `1px solid ${T.b2}`,
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px 22px 0",
          borderBottom: `1px solid ${T.border}`,
          background: `linear-gradient(135deg,${T.blue}0c,transparent 65%)`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                color: T.cyan,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: ".12em",
                marginBottom: 6,
              }}
            >
              {caso.meta?.regiao} · {caso.meta?.subespecialidade}
            </div>

            <h2
              style={{
                fontSize: 22,
                fontFamily: "Georgia, serif",
                lineHeight: 1.25,
                marginBottom: 6,
              }}
            >
              {caso.meta?.titulo}
            </h2>

            <div style={{ color: T.muted, fontSize: 12 }}>
              {caso.paciente?.sexo}, {caso.paciente?.idade} anos ·{" "}
              {caso.paciente?.atividade}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Tag c={T.blue}>{caso.classificacao?.ao_ota?.codigo}</Tag>
            <Tag c={NIV_C[caso.meta?.nivel] || T.blue}>{caso.meta?.nivel}</Tag>
            <Tag c={COND_C[dc?.conduta] || T.blue}>
              {COND_I[dc?.conduta]} {dc?.conduta}
            </Tag>
            {caso._db?.review_status && (
              <ReviewBadge status={caso._db.review_status} />
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, overflowX: "auto", marginTop: 18 }}>
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "9px 12px",
                fontSize: 11,
                fontWeight: 800,
                whiteSpace: "nowrap",
                color: tab === id ? T.blue : T.muted,
                borderBottom: `2px solid ${tab === id ? T.blue : "transparent"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {tab === "resumo" && (
          <div style={{ display: "grid", gap: 12 }}>
            <Card title="Resumo Executivo">
              {caso.output_app?.resumo || caso.historia?.descricao}
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              <Metric label="Conduta"   value={dc?.conduta}                              color={COND_C[dc?.conduta]} />
              <Metric label="Urgência"  value={dc?.nivel_urgencia}                       color={URG_C[dc?.nivel_urgencia]} />
              <Metric label="Gravidade" value={caso.classificacao?.ao_ota?.gravidade}    color={URG_C[caso.classificacao?.ao_ota?.gravidade]} />
            </div>

            <Card title="Diagnóstico">
              <strong>{caso.diagnostico?.principal}</strong>
              <br />
              Confirmação: {caso.diagnostico?.confirmacao}
            </Card>

            <Card title="Decisão Clínica">
              <strong>{dc?.tecnica_preferida}</strong>
              <p style={{ marginTop: 8 }}>{dc?.explicacao}</p>
            </Card>

            <Card title="Classificação">
              <strong>{caso.classificacao?.ao_ota?.codigo}</strong> —{" "}
              {caso.classificacao?.ao_ota?.descricao}
            </Card>
          </div>
        )}

        {tab === "exame" && (
          <div style={{ display: "grid", gap: 12 }}>
            <ListCard title="🚨 Red Flags" items={caso.exame_fisico?.red_flags} color={T.red} />
            <ListCard title="Inspeção"     items={caso.exame_fisico?.inspecao} />
            <ListCard title="Palpação"     items={caso.exame_fisico?.palpacao} />

            <Card title="Movimento">
              {caso.exame_fisico?.movimento}
            </Card>

            <Card title="Testes Especiais">
              {caso.exame_fisico?.testes?.map((t, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <strong>{t.nome}</strong>
                  <div style={{ color: T.muted, fontSize: 12 }}>
                    Sensibilidade: {t.sensibilidade} · Especificidade: {t.especificidade}
                  </div>
                  <div>{t.positivo}</div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {tab === "tratamento" && (
          <div style={{ display: "grid", gap: 12 }}>
            <ListCard title="Critérios Conservadores" items={caso.tratamento?.conservador?.criterios} />
            <ListCard title="Protocolo Conservador"   items={caso.tratamento?.conservador?.protocolo} />

            <Card title="Medicamentos">
              {caso.tratamento?.conservador?.medicamentos?.map((m, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <strong>{m.nome}</strong> — {m.dose}, {m.via}, {m.intervalo}, {m.duracao}
                </div>
              ))}
            </Card>

            <Card title="Técnicas Cirúrgicas">
              {caso.tratamento?.cirurgico?.tecnicas?.map((t, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <strong>{t.nome}</strong>
                  <div style={{ color: T.muted }}>{t.quando_usar}</div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {tab === "cirurgia" && (
          <div style={{ display: "grid", gap: 12 }}>
            <Card title="Passo a Passo">
              {caso.cirurgia?.passo_a_passo?.map((p) => (
                <div key={p.ordem} style={{ marginBottom: 16 }}>
                  <strong>{p.ordem}. {p.titulo}</strong>
                  <p>{p.descricao}</p>
                  <div style={{ color: T.red, fontSize: 12 }}>⚠️ {p.ponto_critico}</div>
                </div>
              ))}
            </Card>

            <ListCard title="Indicações" items={caso.cirurgia?.indicacoes} />
            <ListCard title="Materiais"  items={caso.cirurgia?.materiais?.map((m) => `${m.tipo}: ${m.nome}`)} />
          </div>
        )}

        {tab === "reabilitacao" && (
          <div style={{ display: "grid", gap: 12 }}>
            {caso.reabilitacao?.map((f, i) => (
              <Card key={i} title={`${f.fase} — ${f.periodo}`}>
                <strong>Objetivo:</strong> {f.objetivo}
                <br />
                <strong>Exercícios:</strong> {f.exercicios?.join(", ")}
                <br />
                <strong>Restrições:</strong> {f.restricoes?.join(", ")}
              </Card>
            ))}
          </div>
        )}

        {tab === "flashcards" && (
          <div style={{ display: "grid", gap: 10 }}>
            {caso.flashcards?.map((f, i) => (
              <Card key={i} title={`Flashcard ${i + 1}`}>
                <strong>Q:</strong> {f.pergunta}
                <br /><br />
                <strong>A:</strong> {f.resposta}
              </Card>
            ))}
          </div>
        )}

        {tab === "json" && (
          <pre
            style={{
              background: T.s3,
              borderRadius: 12,
              padding: 16,
              overflow: "auto",
              maxHeight: 520,
              fontSize: 11,
              color: "#a5f3fc",
            }}
          >
            {JSON.stringify(caso, null, 2)}
          </pre>
        )}
      </div>
    </section>
  );
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: T.s2,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 14,
        color: T.text,
        fontSize: 13,
        lineHeight: 1.8,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: T.muted,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function ListCard({ title, items = [], color = T.blue }) {
  return (
    <Card title={title}>
      {items?.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
          <span style={{ color }}>›</span>
          <span>{item}</span>
        </div>
      ))}
    </Card>
  );
}

function Metric({ label, value, color = T.blue }) {
  return (
    <div
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: 10,
        padding: "10px 12px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: T.muted,
          fontWeight: 800,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ color, fontSize: 13, fontWeight: 900, textTransform: "uppercase" }}>
        {value || "—"}
      </div>
    </div>
  );
}
