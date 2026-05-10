# OrthoStudy v2.0

Plataforma de educação médica e suporte à decisão clínica para ortopedia, com casos clínicos gerados por IA (Claude), motor de decisão AO/OTA e sistema de flashcards.

---

## Stack

| Camada    | Tecnologia                              |
|-----------|-----------------------------------------|
| Backend   | FastAPI + aiosqlite + Python 3.11+      |
| IA        | Claude claude-sonnet-4-6 (Anthropic API)   |
| Frontend  | React 18 + Vite 5                       |
| Banco     | SQLite (via aiosqlite)                  |

---

## Setup — Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure a chave da API Anthropic
cp .env.example .env
# Edite .env e adicione: ANTHROPIC_API_KEY=sk-ant-...

# Inicia o servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Para carregar os casos clínicos existentes no banco:

```bash
cd backend
python seed.py           # insere/atualiza casos
python seed.py --reset   # apaga tudo e reinsere
```

---

## Setup — Frontend

```bash
# Na raiz do projeto
npm install
npm run dev
# Acesse: http://localhost:5173
```

---

## Estrutura

```
roger-repos/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS
│   │   ├── database.py          # SQLite async
│   │   ├── models.py            # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── cases.py         # CRUD de casos
│   │   │   ├── decision.py      # Motor AO/OTA
│   │   │   ├── generate.py      # Geração com IA
│   │   │   └── progress.py      # Progresso do estudante
│   │   └── services/
│   │       ├── ao_engine.py     # Lógica AO/OTA v2.0
│   │       └── case_generator.py# Integração Claude API
│   ├── data/cases/              # JSONs dos casos clínicos
│   ├── requirements.txt
│   └── seed.py
├── src/
│   ├── pages/                   # Telas React
│   ├── components/              # Componentes reutilizáveis
│   ├── hooks/                   # useClinicalDecision
│   ├── api/client.js            # Axios + funções de API
│   └── App.jsx
├── css/style.css
├── index.html
├── vite.config.js
└── preview.html                 # Demo offline (abrir no browser)
```

---

## API Endpoints

| Método | Rota                    | Descrição                          |
|--------|-------------------------|------------------------------------|
| GET    | /cases                  | Lista casos (filtros: q, regiao, nivel) |
| GET    | /cases/{id}             | Detalhe completo do caso           |
| POST   | /cases                  | Criar caso manualmente             |
| PUT    | /cases/{id}             | Atualizar caso (deep merge)        |
| DELETE | /cases/{id}             | Remover caso                       |
| GET    | /cases/{id}/flashcards  | Flashcards do caso                 |
| POST   | /decision/ao            | Motor de decisão AO/OTA            |
| POST   | /generate               | Gerar caso com IA (Claude)         |
| GET    | /progress               | Progresso do estudante             |
| POST   | /progress               | Atualizar progresso                |

Documentação interativa: http://localhost:8000/docs

---

## Formato JSON dos Casos (v2.0)

Cada caso tem 15 seções:

1. `meta` — id, título, região, nível, tags
2. `apresentacao` — queixa, história, exame físico, testes especiais
3. `imagens` — radiografias, laudos
4. `decisao_clinica` — input AO/OTA, output do motor de decisão
5. `diagnostico` — diagnóstico principal, diferenciais, classificações
6. `planejamento_cirurgico` — via de acesso, passos, pontos críticos
7. `tecnica_cirurgica` — passo a passo detalhado
8. `implantes` — implantes usados, tamanhos, especificações
9. `complicacoes` — intraop, pós-op imediato, tardias
10. `reabilitacao` — fases, progressão
11. `resultados` — escalas funcionais, follow-up
12. `evidencias` — artigos de referência com nível de evidência
13. `perguntas_frequentes` — FAQ do caso
14. `flashcards` — 8 cards com pergunta/resposta/explicação
15. `output_app` — resumo curto, pontos de aprendizado

---

## Adicionar Casos Clínicos

1. Crie um arquivo JSON em `backend/data/cases/XXX.json` seguindo o schema v2.0
2. Execute `python seed.py` para carregar no banco
3. O caso aparece automaticamente na lista do app

Ou use a tela **✨ Gerar** no app para gerar um novo caso com IA.
