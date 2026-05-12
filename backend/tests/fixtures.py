def valid_clinical_case():
    return {
        "meta": {
            "id": "001",
            "titulo": "Fratura do rádio distal AO 23-C2",
            "slug": "fratura-radio-distal-ao-23-c2",
            "especialidade": "ortopedia",
            "regiao": "Punho",
            "subespecialidade": "Trauma",
            "nivel": "avancado",
            "tags": ["radio distal", "trauma", "ao ota"],
            "versao": "2.0",
        },
        "paciente": {
            "sexo": "Feminino",
            "idade": 68,
            "atividade": "Aposentada ativa",
            "lado": "Direito",
            "demanda_funcional": "moderada",
            "comorbidades": ["osteoporose"],
        },
        "historia": {
            "queixa_principal": "Dor e deformidade no punho após queda.",
            "inicio": "agudo",
            "tempo_evolucao": "2 horas",
            "mecanismo_lesao": "Queda da própria altura com apoio da mão espalmada.",
            "descricao": "Paciente sofreu queda da própria altura com trauma axial sobre o punho direito. Evoluiu com dor, edema e deformidade. Nega ferida aberta. Sem déficit neurológico evidente.",
        },
        "classificacao": {
            "primaria": "Fratura intra-articular do rádio distal",
            "ao_ota": {
                "codigo": "23-C2",
                "osso": "Rádio",
                "segmento": "Distal",
                "tipo": "C",
                "grupo": "C2",
                "descricao": "Fratura articular completa multifragmentar parcial.",
                "gravidade": "alta",
                "confianca": "alta",
            },
            "secundarias": [
                {
                    "nome": "Frykman",
                    "grau": "VIII",
                    "descricao": "Comprometimento radiocárpico e radioulnar distal.",
                }
            ],
        },
        "exame_fisico": {
            "inspecao": ["edema", "deformidade em dorso de garfo", "equimose", "limitação funcional"],
            "palpacao": ["dor radial distal", "dor na DRUJ", "crepitação", "sensibilidade preservada"],
            "movimento": "ROM limitado por dor; dedos móveis.",
            "testes": [
                {
                    "nome": "Avaliação neurovascular",
                    "sensibilidade": "alta",
                    "especificidade": "alta",
                    "positivo": "Perfusão preservada e sem déficit motor.",
                }
            ],
            "red_flags": ["síndrome compartimental", "lesão vascular", "fratura exposta"],
        },
        "imagem": {
            "rx": {
                "indicado": True,
                "achados": ["encurtamento radial", "cominuição metafisária", "incongruência articular", "desvio dorsal"],
            },
            "tc": {
                "indicado": True,
                "quando": "Planejamento cirúrgico intra-articular.",
            },
            "rm": {
                "indicado": False,
                "achados": [],
            },
        },
        "diagnostico": {
            "principal": "Fratura intra-articular completa do rádio distal AO/OTA 23-C2.",
            "diferenciais": ["fratura do escafoide", "luxação perilunar", "entorse radiocárpica"],
            "confirmacao": "combinado",
        },
        "decisao_clinica": {
            "input": {
                "ao_tipo": "C",
                "desvio_mm": 3,
                "instabilidade": True,
                "cominuicao": True,
                "demanda_funcional": "moderada",
                "deficit_extensor": False,
                "incongruencia_articular": True,
                "osso_osteoporotico": True,
            },
            "regras": [
                {"if": "incongruência articular > 2 mm", "then": "indicar cirurgia", "prioridade": "alta", "justificativa": "Risco de artrose pós-traumática."},
                {"if": "fratura AO tipo C", "then": "avaliar fixação interna", "prioridade": "alta", "justificativa": "Fratura articular completa instável."},
                {"if": "osso osteoporótico", "then": "preferir placa bloqueada", "prioridade": "media", "justificativa": "Melhor estabilidade angular."},
                {"if": "sem déficit neurovascular", "then": "programar cirurgia", "prioridade": "media", "justificativa": "Sem emergência vascular."},
            ],
            "output": {
                "conduta": "cirurgico",
                "tecnica_preferida": "Redução aberta e fixação interna com placa volar bloqueada.",
                "nivel_urgencia": "moderada",
                "explicacao": "A fratura intra-articular instável em paciente osteoporótica favorece tratamento cirúrgico para restaurar congruência articular e alinhamento.",
            },
        },
        "tratamento": {
            "conservador": {
                "indicado": False,
                "criterios": ["fratura sem desvio", "paciente baixa demanda"],
                "protocolo": ["imobilização", "controle radiográfico"],
                "medicamentos": [
                    {"nome": "Dipirona", "dose": "1000 mg", "via": "VO", "intervalo": "6/6h", "duracao": "3 dias"}
                ],
            },
            "cirurgico": {
                "indicado": True,
                "criterios": ["desvio articular", "instabilidade", "cominuição"],
                "tecnicas": [
                    {"nome": "Placa volar bloqueada", "quando_usar": "Fratura instável do rádio distal.", "vantagens": ["estabilidade angular"], "desvantagens": ["risco tendíneo"]},
                    {"nome": "Fixador externo", "quando_usar": "Lesões graves de partes moles.", "vantagens": ["controle temporário"], "desvantagens": ["rigidez"]},
                    {"nome": "Fios de Kirschner", "quando_usar": "Fraturas selecionadas.", "vantagens": ["baixo custo"], "desvantagens": ["menor estabilidade"]},
                ],
            },
        },
        "cirurgia": {
            "indicacoes": ["incongruência articular", "instabilidade", "desvio dorsal"],
            "posicionamento": "Decúbito dorsal com mesa de mão.",
            "anestesia": ["bloqueio plexo braquial", "sedação"],
            "passo_a_passo": [
                {"ordem": 1, "titulo": "Via volar", "descricao": "Acesso pela via de Henry.", "ponto_critico": "Proteger artéria radial."},
                {"ordem": 2, "titulo": "Exposição", "descricao": "Afastar FCR e pronador quadrado.", "ponto_critico": "Evitar lesão tendínea."},
                {"ordem": 3, "titulo": "Redução", "descricao": "Restaurar altura, inclinação e congruência.", "ponto_critico": "Controlar superfície articular."},
                {"ordem": 4, "titulo": "Placa", "descricao": "Posicionar placa volar.", "ponto_critico": "Evitar posição distal excessiva."},
                {"ordem": 5, "titulo": "Fixação", "descricao": "Parafusos bloqueados distais.", "ponto_critico": "Checar penetração articular."},
                {"ordem": 6, "titulo": "Fechamento", "descricao": "Reparo do pronador e sutura.", "ponto_critico": "Avaliar mobilidade dos tendões."},
            ],
            "materiais": [
                {"tipo": "implante", "nome": "Placa volar bloqueada para rádio distal"},
                {"tipo": "instrumental", "nome": "Intensificador de imagem"},
            ],
        },
        "pos_operatorio": {
            "imediato": ["elevação do membro", "controle de dor", "mobilização dos dedos"],
            "prescricao": [{"nome": "Dipirona", "dose": "1000 mg 6/6h", "duracao": "3 dias"}],
            "restricoes": ["não apoiar carga", "evitar esforço"],
        },
        "reabilitacao": [
            {"fase": "Fase 1", "periodo": "0-2 semanas", "objetivo": "controle de edema", "exercicios": ["mobilização dos dedos"], "restricoes": ["sem carga"]},
            {"fase": "Fase 2", "periodo": "2-6 semanas", "objetivo": "ganho de ROM", "exercicios": ["flexoextensão ativa"], "restricoes": ["sem carga pesada"]},
            {"fase": "Fase 3", "periodo": "6-12 semanas", "objetivo": "fortalecimento", "exercicios": ["preensão leve"], "restricoes": ["evitar impacto"]},
            {"fase": "Fase 4", "periodo": ">12 semanas", "objetivo": "retorno funcional", "exercicios": ["fortalecimento progressivo"], "restricoes": ["conforme dor"]},
        ],
        "complicacoes": {
            "precoces": ["infecção superficial 1-2%", "dor persistente", "rigidez"],
            "tardias": ["artrose pós-traumática", "ruptura tendínea", "síndrome dolorosa complexa regional"],
            "prevencao": ["redução anatômica", "mobilização precoce", "controle radiográfico"],
        },
        "evidencia": {
            "nivel_I": ["Revisões sistemáticas sobre fixação volar em fraturas instáveis."],
            "nivel_II": ["Ensaios clínicos comparando tratamento conservador e cirúrgico."],
            "nivel_III": [],
            "nivel_IV": [],
            "nivel_V": [],
            "recentes": ["Artigos recentes 2020-2024 sobre rádio distal em idosos."],
        },
        "flashcards": [
            {"pergunta": f"Pergunta {i}", "resposta": f"Resposta completa {i}"}
            for i in range(1, 9)
        ],
        "output_app": {
            "diagnostico": "Fratura do rádio distal AO 23-C2",
            "conduta": "Cirúrgica",
            "tecnica": "Placa volar bloqueada",
            "riscos": ["rigidez", "infecção", "lesão tendínea"],
            "resumo": "Fratura intra-articular instável do rádio distal com indicação cirúrgica.",
        },
    }
