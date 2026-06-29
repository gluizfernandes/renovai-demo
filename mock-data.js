/* ============================================================
   RenovAI 2.0, demo estática. DADOS 100% FICTÍCIOS E MOCKADOS.
   Nenhuma conexão com Databricks, Azure ou APIs externas.
   Nomes de médicos, CRMs, setores e números são inventados.
   ============================================================ */

/* Perfis e usuários de demonstração.
   No produto real o perfil viria do login corporativo. */
const USUARIOS = {
  propagandista: {
    nome: "George Fernandes",
    email: "3fplgeorge@ache.com.br",
    perfil: "propagandista",
    perfilLabel: "Propagandista",
    setor: "010101010151",
    setorNome: "Porto Alegre, RS"
  },
  gestor: {
    nome: "Patrícia Gomes",
    email: "patricia.gomes@ache.com.br",
    perfil: "gestor",
    perfilLabel: "Gestor / GD",
    time: "Regional Sul"
  }
};

/* Corte de elegibilidade: ranking de 1 a 350 está dentro do corte.
   Os pontos são o valor real do ranking (sem teto) e caem conforme a
   posição piora. A regra oficial ainda será confirmada com o cliente. */
const RANKING_CORTE = 350;

/* Códigos de especialidade, como vêm na base. */
const ESPECIALIDADES = {
  GEN: "Generalista", CLG: "Clínica Geral", PSQ: "Psiquiatria", PED: "Pediatria",
  OFT: "Oftalmologia", ORT: "Ortopedia", GOB: "Ginecologia/Obstetrícia",
  NEU: "Neurologia", PNE: "Pneumologia", DRM: "Dermatologia", CIR: "Cirurgia", GAS: "Gastroenterologia"
};

/* Propagandista responsável por setor (visível só para o gestor). */
const RESPONSAVEIS = {
  "010101010151": "Ricardo Alves",
  "010101010251": "Marina Lopes",
  "010101010751": "Bruno Tavares"
};
const SETORES_NOME = {
  "010101010151": "Porto Alegre, RS",
  "010101010251": "Porto Alegre Centro, RS",
  "010101010751": "Ijuí e região, RS"
};

/* Recomendações no formato da base real (fictícias).
   Entrada = ranking dentro do corte e fora do painel.
   Revisão = no painel e fora do corte (ranking pior). */
const RECOMENDACOES = [
  // Setor do propagandista logado, pendentes, aparecem para ele
  { id: "REC-0001", idMedico: "700112045", medico: "Carlos Eduardo Martins", ufcrm: "RS0091245",
    especialidade: "GEN", cidade: "Porto Alegre, RS", setor: "010101010151",
    tipo: "Entrada", status: "Pendente", ranking: 62, pontos: 63028.40,
    motivo: "Médico com forte prescrição no setor e ainda fora do seu painel.",
    acao: "Avaliar a inclusão do médico no seu painel." },
  { id: "REC-0002", idMedico: "700093318", medico: "Fernanda Ribeiro Alencar", ufcrm: "RS0088310",
    especialidade: "CLG", cidade: "Porto Alegre, RS", setor: "010101010151",
    tipo: "Entrada", status: "Pendente", ranking: 28, pontos: 78540.10,
    motivo: "Médico muito bem posicionado no ranking do setor, ausente do seu painel.",
    acao: "Avaliar a inclusão do médico no seu painel." },
  { id: "REC-0003", idMedico: "700087221", medico: "Marcelo Schneider Pinto", ufcrm: "RS0076420",
    especialidade: "PSQ", cidade: "Porto Alegre, RS", setor: "010101010151",
    tipo: "Entrada", status: "Pendente", ranking: 194, pontos: 11839.00,
    motivo: "Boa posição no ranking do setor, sem presença no seu painel atual.",
    acao: "Avaliar a inclusão do médico no seu painel." },
  { id: "REC-0004", idMedico: "700076540", medico: "Vanessa Ribeiro Lima", ufcrm: "RS0065118",
    especialidade: "GEN", cidade: "Porto Alegre, RS", setor: "010101010151",
    tipo: "Revisão", status: "Pendente", ranking: 587, pontos: 634.08,
    motivo: "Médico no seu painel com baixa prescrição recente no setor.",
    acao: "Avaliar a permanência do médico no seu painel." },
  { id: "REC-0005", idMedico: "700065913", medico: "Rodrigo Almeida Costa", ufcrm: "RS0054937",
    especialidade: "CLG", cidade: "Porto Alegre, RS", setor: "010101010151",
    tipo: "Revisão", status: "Pendente", ranking: 1764, pontos: 132.17,
    motivo: "Médico no seu painel bem abaixo do corte do setor.",
    acao: "Avaliar a permanência do médico no seu painel." },
  { id: "REC-0006", idMedico: "700054402", medico: "Juliana Castro Moreira", ufcrm: "RS0043820",
    especialidade: "PED", cidade: "Camaquã, RS", setor: "010101010151",
    tipo: "Revisão", status: "Pendente", ranking: 2138, pontos: 90.91,
    motivo: "Médico no seu painel com prescrição em queda no setor.",
    acao: "Avaliar a permanência do médico no seu painel." },

  // Setor do propagandista, status não pendentes: só o gestor enxerga
  { id: "REC-0007", idMedico: "700048877", medico: "André Luiz Barros", ufcrm: "RS0039511",
    especialidade: "GEN", cidade: "Porto Alegre, RS", setor: "010101010151",
    tipo: "Entrada", status: "Aplicada", ranking: 140, pontos: 14210.00,
    motivo: "Sugestão já refletida no painel.",
    acao: "Nenhuma ação adicional." },
  { id: "REC-0008", idMedico: "700033190", medico: "Camila Souza Lemos", ufcrm: "RS0028744",
    especialidade: "PED", cidade: "Porto Alegre, RS", setor: "010101010151",
    tipo: "Revisão", status: "Descartada", ranking: 3872, pontos: 5.58,
    motivo: "Sugestão desconsiderada no ciclo vigente.",
    acao: "Pode reaparecer no próximo ciclo.",
    motivoDescarte: "Vou aguardar o próximo ciclo para decidir" },

  // Outros setores: só o gestor enxerga
  { id: "REC-0009", idMedico: "700101884", medico: "Thiago Henrique Dias", ufcrm: "RS0097002",
    especialidade: "CLG", cidade: "Ijuí, RS", setor: "010101010751",
    tipo: "Entrada", status: "Pendente", ranking: 12, pontos: 103338.19,
    motivo: "Topo do ranking do setor, ausente do painel.",
    acao: "Avaliar inclusão no painel." },
  { id: "REC-0010", idMedico: "700090256", medico: "Letícia Carvalho Nunes", ufcrm: "RS0081263",
    especialidade: "CLG", cidade: "Ijuí, RS", setor: "010101010751",
    tipo: "Entrada", status: "Pendente", ranking: 197, pontos: 492.05,
    motivo: "Dentro do corte do setor, fora do painel.",
    acao: "Avaliar inclusão no painel." },
  { id: "REC-0011", idMedico: "700079631", medico: "Gustavo Pereira Rocha", ufcrm: "RS0072590",
    especialidade: "PNE", cidade: "Porto Alegre, RS", setor: "010101010751",
    tipo: "Revisão", status: "Pendente", ranking: 508, pontos: 64.78,
    motivo: "No painel com baixa prescrição recente.",
    acao: "Avaliar permanência no painel." },
  { id: "REC-0012", idMedico: "700068007", medico: "Renata Oliveira Mendes", ufcrm: "RS0061477",
    especialidade: "PSQ", cidade: "Porto Alegre, RS", setor: "010101010251",
    tipo: "Entrada", status: "Pendente", ranking: 401, pontos: 138.50,
    motivo: "Próximo ao limite do corte do setor, fora do painel.",
    acao: "Avaliar inclusão no painel." },
  { id: "REC-0013", idMedico: "700057742", medico: "Felipe Andrade Santos", ufcrm: "RS0050884",
    especialidade: "OFT", cidade: "Porto Alegre, RS", setor: "010101010251",
    tipo: "Entrada", status: "Pendente", ranking: 53, pontos: 41255.55,
    motivo: "Forte prescrição no setor, ausente do painel.",
    acao: "Avaliar inclusão no painel." },
  { id: "REC-0014", idMedico: "700045528", medico: "Mariana Cardoso Pinto", ufcrm: "RS0049156",
    especialidade: "ORT", cidade: "Porto Alegre, RS", setor: "010101010251",
    tipo: "Revisão", status: "Pendente", ranking: 645, pontos: 41.87,
    motivo: "No painel com prescrição em queda no setor.",
    acao: "Avaliar permanência no painel." }
];

/* Motivos para desconsiderar uma sugestão (linguagem de negócio).
   Servem de justificativa do propagandista no ciclo vigente. */
const MOTIVOS_DESCONSIDERAR = [
  "Já avaliei e o médico não tem perfil para o meu painel",
  "Médico já é trabalhado por outro canal ou colega",
  "Vou aguardar o próximo ciclo para decidir",
  "Dados do médico parecem desatualizados",
  "Não atende ao meu planejamento atual do setor",
  "Outro motivo"
];

/* Chat Genie simulado: perguntas rápidas e respostas fictícias.
   Apenas simulação visual do Genie do Databricks. */
const PRESCRICAO_SUGESTOES = [
  "Quais médicos mais prescrevem no meu setor?",
  "Como está a Cardiologia neste ciclo?",
  "Quais médicos caíram de prescrição?",
  "Quem entrou no top 10 do setor?"
];

const PRESCRICAO_RESPOSTAS = [
  { chave: ["mais prescrevem", "top", "maiores"],
    resposta: "No seu setor, os médicos com maior prescrição no ciclo atual são Dr. João Silva (Cardiologia), Dra. Ana Souza (Endocrinologia) e Dra. Beatriz Rocha (Ginecologia). Os três aparecem bem posicionados no ranking do setor." },
  { chave: ["cardiologia", "cardio"],
    resposta: "A Cardiologia segue como a especialidade de maior volume de prescrição no seu setor neste ciclo, puxada por Dr. João Silva e Dr. Felipe Castro. O movimento é estável em relação ao ciclo anterior." },
  { chave: ["caíram", "cairam", "queda", "diminu"],
    resposta: "Entre os médicos do seu painel, Dr. Marcos Lima e Dr. Felipe Castro apresentaram queda de prescrição nos últimos ciclos. Ambos aparecem como sugestão de revisão do painel." },
  { chave: ["top 10", "entrou", "novos"],
    resposta: "Dr. João Silva e Dra. Ana Souza ganharam posições e hoje figuram entre os mais bem posicionados do seu setor. Nenhum deles está no seu painel atual, por isso surgem como sugestão de entrada." }
];
const PRESCRICAO_RESPOSTA_PADRAO =
  "Com base nas prescrições do seu setor neste ciclo, identifiquei movimentos relevantes no ranking. Você pode detalhar a pergunta por especialidade, período ou médico que eu refino a resposta.";

/* Comunicados: materiais da Aché enviados ao propagandista.
   Previews simulados, sem arquivos reais. */
const COMUNICADOS = [
  {
    id: "COM-01", titulo: "Lançamento da Linha RenovAché 2026", tipo: "PowerPoint",
    data: "24/06/2026", status: "Novo",
    descricao: "Apresentação oficial da nova linha e principais mensagens de abordagem.",
    slides: [
      { tema: "magenta", titulo: "RenovAché 2026", sub: "Mais vida para você" },
      { tema: "claro", titulo: "Principais mensagens", sub: "3 pilares de abordagem ao médico" },
      { tema: "magenta", titulo: "Materiais de apoio", sub: "Guias, estudos e amostras" }
    ]
  },
  {
    id: "COM-02", titulo: "Copa do Aché, Campanha de Engajamento", tipo: "Slide",
    data: "20/06/2026", status: "Novo",
    descricao: "Campanha interna de engajamento do time de campo neste ciclo.",
    slides: [
      { tema: "esporte", titulo: "COPA DO ACHÉ", sub: "Campanha de engajamento do ciclo" },
      { tema: "claro", titulo: "Como participar", sub: "Metas por setor e premiação simbólica" }
    ]
  },
  {
    id: "COM-03", titulo: "Guia de Abordagem ao Cardiologista", tipo: "PDF",
    data: "12/06/2026", status: "Visualizado",
    descricao: "Roteiro consultivo para a visita ao cardiologista.",
    slides: [
      { tema: "claro", titulo: "Abordagem ao Cardiologista", sub: "Roteiro consultivo" },
      { tema: "magenta", titulo: "Perguntas-chave", sub: "Como conduzir a conversa" }
    ]
  },
  {
    id: "COM-04", titulo: "Resultados do Ciclo 05", tipo: "PowerPoint",
    data: "03/06/2026", status: "Visualizado",
    descricao: "Consolidado de resultados e destaques do ciclo anterior.",
    slides: [
      { tema: "magenta", titulo: "Ciclo 05", sub: "Resultados consolidados" },
      { tema: "claro", titulo: "Destaques", sub: "Setores e especialidades em alta" }
    ]
  }
];
