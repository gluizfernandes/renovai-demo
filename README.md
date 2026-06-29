# Painel Médico RenovAI 2.0, Demo estática

Demo visual do Portal RenovAI que simula a entrega final para o usuário final. Refatorada para identificar o perfil no login e direcionar cada usuário para a sua jornada. Serve para apresentação e validação conceitual, não para produção.

## O que é e o que não é

A demo é:
- HTML, CSS e JavaScript puro, sem frameworks externos obrigatórios.
- 100% estática: abre direto no navegador, sem servidor e sem build.
- Dados totalmente fictícios e mockados, em `mock-data.js`.

A demo não faz:
- Não acessa o Databricks.
- Não conecta com Azure.
- Não chama APIs externas nem faz qualquer requisição de rede.
- Não usa dados reais nem credenciais.
- Não expõe nomes de tabelas técnicas na interface.

A faixa "Ambiente simulado, dados fictícios, sem conexão com Databricks, Azure ou APIs externas" fica fixa no topo.

## Identidade visual

A demo segue a identidade do Figma da Grazi (Painel Médico RenovAI 2.0): magenta Aché, fundo branco, login em duas colunas e app com sidebar magenta. Todas as cores e fontes estão centralizadas em variáveis CSS no topo do `style.css`, no bloco `:root`. Para deixar 100% fiel ao Figma, basta colar ali os tokens exatos (hex e fontes) exportados pela Grazi.

Observação: o Figma mostra o primeiro item do menu como "Minha carteira". Nesta demo ele foi nomeado "Prescrição", seguindo a especificação funcional das três entregas (Prescrição, Recomendações, Comunicados). É só renomear o rótulo em `app.js` (objeto `NAV`) se o nome do Figma for o oficial.

## Como abrir

1. Abra a pasta `10_demo_entrega_final_html/`.
2. Dê duplo clique em `index.html`.
3. Na tela de login, escolha o perfil em "Perfil de acesso (demonstração)" e clique em Login.

Opcional, servir por HTTP local:

```bash
cd 10_demo_entrega_final_html
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Fluxo de login e perfis

1. O usuário acessa o Portal e faz login.
2. O sistema identifica o perfil (nesta demo, via seletor de perfil).
3. Direcionamento:
   - Propagandista: vai para a Home com as três entregas (Prescrição, Recomendações, Comunicados).
   - Gestor / GD: entra direto na Jornada do Gestor / GD.

As duas jornadas são separadas e não se misturam.

## Entregas do Propagandista

1. Prescrição: simulação visual do Chat Genie do Databricks. Campo de pergunta livre, sugestões rápidas e respostas fictícias em linguagem natural. Não é um dashboard próprio.
2. Recomendações: o propagandista vê apenas sugestões do seu setor e apenas com status Pendente. Não exibe responsável, não exibe outros setores e não exibe status internos (aplicada, descartada, expirada). Cada card traz médico, CRM/UFCRM, especialidade, setor, tipo (entrada ou revisão), status pendente, ranking, pontuação, motivo em linguagem de negócio e ação sugerida, com botões Ver detalhes e Desconsiderar. A recomendação não altera o painel automaticamente.
3. Comunicados: materiais da Aché (PowerPoint, Slide, PDF) com título, tipo, data, descrição, status (novo ou visualizado) e botões Visualizar e Baixar. Visualizar abre uma prévia simulada do material.

## Jornada do Gestor / GD

- Acessada automaticamente quando o login identifica o perfil de gestor.
- Visão gerencial consolidada: indicadores, recomendações por setor e time.
- Usa as mesmas regras de ranking e pontuação das recomendações.
- Mostra informações coerentes para gestor, incluindo responsável e status por setor.
- Separada da Home do Propagandista.

## Regra de ranking e pontuação

A demo reflete o formato dos dados reais (exemplo recebido do cliente):

- Setor em código numérico longo (ex.: `010101010151`).
- UFCRM no formato `RS0055013`, mais ID do médico e cidade.
- Especialidade em código (GEN, PSQ, CLG, PED, OFT, ORT, GOB, NEU, PNE, DRM, CIR).
- Pontos são o valor real do ranking, altos e sem teto (ex.: 63.028,40), e caem conforme a posição piora.

Corte de elegibilidade: ranking de 1 a 350 está dentro do corte. Médicos bem posicionados e fora do painel viram sugestão de entrada; médicos no painel e fora do corte (ranking pior) viram sugestão de revisão.

A regra oficial de corte e de cálculo ainda precisa ser confirmada com o cliente. Na interface o propagandista vê apenas ranking e pontuação, sem fórmula técnica.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Estrutura: login, app shell, e as views home, prescrição, recomendações, comunicados e gestor |
| `style.css` | Identidade visual Aché, tokens em `:root`, layout responsivo |
| `app.js` | Login por perfil, roteamento, regra de pontuação, chat, filtros, modal e toast |
| `mock-data.js` | Dados fictícios: usuários, recomendações, respostas do chat e comunicados |
| `README_DEMO.md` | Este documento |

## Objetivo e perguntas que ajuda a responder

Objetivo: mostrar que o Portal RenovAI identifica o perfil no login e entrega a jornada certa. Propagandista escolhe entre Prescrição via Chat Genie, Recomendações pendentes do seu setor e Comunicados da Aché. Gestor entra direto na visão gerencial.

A demo ajuda a responder:
- Como cada perfil é direcionado após o login?
- Como o propagandista vê apenas as recomendações pendentes do seu setor, sem responsável e sem status internos?
- Como ranking e pontuação aparecem para o propagandista, sem expor a fórmula?
- Como ficaria a experiência de prescrição como um chat (Genie), e não como dashboard?
- Como o gestor consolida recomendações por setor com as mesmas regras?
- Onde a linguagem precisa ser consultiva, deixando claro que o Portal não altera o painel automaticamente?

## Importante

Todos os nomes de médicos, CRMs, setores, rankings e pontuações são ilustrativos. A regra de corte e a regra de pontuação são exemplos de simulação e seguem dependentes de confirmação do cliente. Nada aqui representa dado real do Aché.
