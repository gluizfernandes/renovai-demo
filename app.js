/* ============================================================
   RenovAI 2.0, demo estática. Lógica de interface.
   Sem Databricks, sem Azure, sem APIs externas. Tudo local.
   ============================================================ */

/* ---------- Pontos (valor real do ranking, sem teto) ----------
   Exibidos no formato brasileiro, ex.: 63.028,40 pts. */
const fmtPts = (pontos) =>
  Number(pontos).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " pts";
const dentroDoCorte = (r) => r.ranking <= RANKING_CORTE;
const espLabel = (cod) => (ESPECIALIDADES[cod] ? cod + " · " + ESPECIALIDADES[cod] : cod);

/* ---------- Estado ---------- */
const state = {
  usuario: null,
  recs: JSON.parse(JSON.stringify(RECOMENDACOES)), // cópia mutável (desconsiderar)
  filtroTipo: ""
};

/* ---------- Navegação por perfil ---------- */
const NAV = {
  propagandista: [
    { id: "home", label: "Início" },
    { id: "prescricao", label: "Prescrição" },
    { id: "recomendacoes", label: "Recomendações" },
    { id: "comunicados", label: "Comunicados" }
  ],
  gestor: [
    { id: "gestor", label: "Jornada do Gestor / GD" }
  ]
};

const $ = (id) => document.getElementById(id);

/* ---------- Login ---------- */
$("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const perfil = $("login-perfil").value;
  state.usuario = USUARIOS[perfil];
  $("view-login").hidden = true;
  $("app").hidden = false;
  $("topbar-perfil").textContent = state.usuario.perfilLabel;
  $("topbar-user").textContent = state.usuario.nome;
  montarSidebar();
  if (perfil === "gestor") {
    renderGestor();
    irPara("gestor");
  } else {
    renderHome();
    irPara("home");
  }
});

$("login-perfil").addEventListener("change", (e) => {
  $("login-email").value = USUARIOS[e.target.value].email;
});

$("btn-sair").addEventListener("click", () => {
  state.usuario = null;
  state.recs = JSON.parse(JSON.stringify(RECOMENDACOES));
  state.filtroTipo = "";
  $("app").hidden = true;
  $("view-login").hidden = false;
});

/* ---------- Sidebar e roteamento ---------- */
function montarSidebar() {
  const nav = $("sidebar-nav");
  nav.innerHTML = "";
  NAV[state.usuario.perfil].forEach(item => {
    const b = document.createElement("button");
    b.className = "nav-item";
    b.textContent = item.label;
    b.dataset.view = item.id;
    b.addEventListener("click", () => irPara(item.id));
    nav.appendChild(b);
  });
}

function irPara(viewId) {
  document.querySelectorAll(".view").forEach(v => v.hidden = true);
  const target = $("view-" + viewId);
  if (target) target.hidden = false;
  document.querySelectorAll(".nav-item").forEach(n =>
    n.classList.toggle("active", n.dataset.view === viewId));
  // render contextual
  if (viewId === "prescricao") renderPrescricao();
  if (viewId === "recomendacoes") renderRecomendacoes();
  if (viewId === "comunicados") renderComunicados();
  $("content").scrollTop = 0;
}

/* ---------- Home propagandista ---------- */
function renderHome() {
  $("home-nome").textContent = state.usuario.nome.split(" ")[0];
  document.querySelectorAll(".entrega-card").forEach(card =>
    card.onclick = () => irPara(card.dataset.go));
}

/* ---------- Prescrição (Chat Genie simulado) ---------- */
let chatIniciado = false;
function renderPrescricao() {
  const sug = $("chat-suggestions");
  sug.innerHTML = "";
  PRESCRICAO_SUGESTOES.forEach(s => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = s.label;
    chip.onclick = () => enviarPergunta(s.pergunta);
    sug.appendChild(chip);
  });
  if (!chatIniciado) {
    addMsg("bot", "Olá! Este é o Genie Space <strong>RenovAI, Prescrições Médicas POC</strong>. Pergunte em linguagem natural sobre prescrições, especialidades ou linhas comerciais, ou use uma sugestão acima. Simulação visual, respostas fictícias.");
    chatIniciado = true;
  }
}
function addMsg(quem, html) {
  const win = $("chat-window");
  const b = document.createElement("div");
  b.className = "msg msg-" + quem;
  b.innerHTML = `<div class="msg-bubble">${html}</div>`;
  win.appendChild(b);
  win.scrollTop = win.scrollHeight;
}
function responder(pergunta) {
  const p = pergunta.toLowerCase();
  if (PRESCRICAO_FORA_ESCOPO_PALAVRAS.some(w => p.includes(w))) {
    return { texto: PRESCRICAO_FORA_ESCOPO };
  }
  return PRESCRICAO_RESPOSTAS.find(r => r.chave.some(c => p.includes(c))) || { texto: PRESCRICAO_RESPOSTA_PADRAO };
}
function respostaHTML(ans) {
  let html = `<div>${ans.texto}</div>`;
  if (ans.tabela) {
    const th = ans.tabela.colunas.map(c => `<th>${c}</th>`).join("");
    const tr = ans.tabela.linhas.map(l => `<tr>${l.map(c => `<td>${c}</td>`).join("")}</tr>`).join("");
    html += `<table class="genie-table"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
  }
  if (ans.sql) {
    const sql = ans.sql.replace(/</g, "&lt;");
    html += `<details class="genie-sql"><summary>Ver SQL gerado</summary><pre>${sql}</pre></details>`;
  }
  return html;
}
function enviarPergunta(texto) {
  if (!texto.trim()) return;
  addMsg("user", texto);
  setTimeout(() => addMsg("bot", respostaHTML(responder(texto))), 450);
}
$("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const t = $("chat-text").value;
  $("chat-text").value = "";
  enviarPergunta(t);
});

/* ---------- Recomendações do propagandista ---------- */
$("rec-filtro-tipo").addEventListener("click", (e) => {
  const btn = e.target.closest(".seg-btn");
  if (!btn) return;
  state.filtroTipo = btn.dataset.tipo;
  document.querySelectorAll("#rec-filtro-tipo .seg-btn")
    .forEach(b => b.classList.toggle("active", b === btn));
  renderRecomendacoes();
});

function recomendacoesDoPropagandista() {
  // SOMENTE setor do usuário e SOMENTE status Pendente
  return state.recs.filter(r =>
    r.setor === state.usuario.setor &&
    r.status === "Pendente" &&
    (state.filtroTipo === "" || r.tipo === state.filtroTipo));
}

function renderRecomendacoes() {
  $("rec-setor-sub").textContent =
    "Sugestões pendentes do " + state.usuario.setorNome + ". O Portal não altera o painel automaticamente.";
  const grid = $("rec-grid");
  const lista = recomendacoesDoPropagandista();
  $("rec-count").textContent = lista.length + " sugestão(ões) pendente(s)";
  grid.innerHTML = "";
  if (lista.length === 0) {
    grid.innerHTML = `<div class="empty">Nenhuma sugestão pendente para este filtro.</div>`;
    return;
  }
  lista.forEach(r => grid.appendChild(cardRecomendacao(r)));
}

function cardRecomendacao(r) {
  const el = document.createElement("article");
  el.className = "rec-card tipo-" + r.tipo;
  el.innerHTML = `
    <div class="rec-top">
      <div>
        <h3 class="rec-medico">${r.medico}</h3>
        <p class="rec-sub">${r.ufcrm} · ${espLabel(r.especialidade)}</p>
        <p class="rec-sub">${r.cidade}</p>
      </div>
      <span class="tag tag-${r.tipo}">${r.tipo}</span>
    </div>
    <div class="rec-tags">
      <span class="pill pill-pend">Pendente</span>
      <span class="pill pill-setor">Setor ${r.setor}</span>
    </div>
    <div class="rec-score-row">
      <div class="rs-block"><span>Ranking</span><strong>${r.ranking}</strong></div>
      <div class="rs-block rs-pts"><span>Pontuação</span><strong>${fmtPts(r.pontos)}</strong></div>
    </div>
    <p class="rec-motivo">${r.motivo}</p>
    <p class="rec-acao"><strong>Ação sugerida:</strong> ${r.acao}</p>
    <div class="rec-actions">
      <button class="btn-outline" data-act="detalhe">Ver detalhes</button>
      <button class="btn-ghost-red" data-act="descartar">Desconsiderar</button>
    </div>`;
  el.querySelector('[data-act="detalhe"]').onclick = () => abrirDetalheRec(r);
  el.querySelector('[data-act="descartar"]').onclick = () => abrirDesconsiderar(r);
  return el;
}

function abrirDetalheRec(r) {
  $("modal-content").innerHTML = `
    <h2>${r.medico}</h2>
    <p class="modal-sub">${r.ufcrm} · ID ${r.idMedico} · ${espLabel(r.especialidade)}</p>
    <p class="modal-sub" style="margin-top:-10px;">Setor ${r.setor} · ${r.cidade}</p>
    <div class="modal-tags">
      <span class="tag tag-${r.tipo}">${r.tipo}</span>
      <span class="pill pill-pend">Pendente</span>
    </div>
    <div class="modal-score">
      <div><span>Ranking no setor</span><strong>${r.ranking}</strong></div>
      <div><span>Pontuação</span><strong>${fmtPts(r.pontos)}</strong></div>
    </div>
    <div class="mblock"><h4>Motivo da sugestão</h4><p>${r.motivo}</p></div>
    <div class="mblock"><h4>Ação sugerida</h4><p>${r.acao}</p></div>
    <div class="mblock"><h4>Importante</h4><p>Esta é uma sugestão consultiva. A inclusão ou a permanência do médico continua sendo decidida e ajustada por você no painel. O Portal não altera o painel automaticamente.</p></div>
    <div class="modal-foot">
      <button class="btn-ghost-red" id="modal-descartar">Desconsiderar sugestão</button>
    </div>`;
  $("modal-descartar").onclick = () => abrirDesconsiderar(r);
  abrirModal();
}

/* Passo de justificativa antes de desconsiderar */
function abrirDesconsiderar(r) {
  const opcoes = MOTIVOS_DESCONSIDERAR.map(m => `
    <label class="just-opt">
      <input type="radio" name="just-motivo" value="${m}" />
      <span>${m}</span>
    </label>`).join("");
  $("modal-content").innerHTML = `
    <h2>Desconsiderar sugestão</h2>
    <p class="modal-sub">${r.medico} · ${r.ufcrm} · ${r.especialidade}</p>
    <div class="mblock" style="border-top:none;padding-top:0;margin-top:0;">
      <h4>Por que deseja desconsiderar?</h4>
      <p style="font-size:0.84rem;color:var(--muted);margin-bottom:4px;">A sugestão sai da sua lista neste ciclo. Pode reaparecer no próximo se o médico continuar elegível.</p>
      <div class="just-list">${opcoes}</div>
      <textarea id="just-outro" class="just-text" placeholder="Descreva o motivo" hidden></textarea>
    </div>
    <div class="modal-foot">
      <button class="btn-ghost" id="just-cancel">Cancelar</button>
      <button class="btn-outline" id="just-confirm">Confirmar</button>
    </div>`;

  const txt = $("just-outro");
  document.querySelectorAll('input[name="just-motivo"]').forEach(radio => {
    radio.addEventListener("change", () => {
      const outro = radio.value === "Outro motivo";
      txt.hidden = !outro;
      if (outro) txt.focus();
    });
  });
  $("just-cancel").onclick = fecharModal;
  $("just-confirm").onclick = () => {
    const sel = document.querySelector('input[name="just-motivo"]:checked');
    if (!sel) { showToast("Selecione um motivo para continuar."); return; }
    let motivo = sel.value;
    if (motivo === "Outro motivo") {
      motivo = txt.value.trim();
      if (!motivo) { showToast("Descreva o motivo."); txt.focus(); return; }
    }
    confirmarDesconsideracao(r, motivo);
  };
  abrirModal();
}

function confirmarDesconsideracao(r, motivo) {
  const idx = state.recs.findIndex(x => x.id === r.id);
  if (idx >= 0) {
    state.recs[idx].status = "Descartada";
    state.recs[idx].motivoDescarte = motivo;
  }
  fecharModal();
  renderRecomendacoes();
  showToast("Sugestão desconsiderada: " + motivo);
}

/* ---------- Comunicados ---------- */
function renderComunicados() {
  const grid = $("com-grid");
  grid.innerHTML = "";
  COMUNICADOS.forEach(c => {
    const el = document.createElement("article");
    el.className = "com-card";
    el.innerHTML = `
      <div class="com-thumb tema-${c.slides[0].tema}">
        <span class="com-thumb-tipo">${c.tipo}</span>
        <span class="com-thumb-title">${c.slides[0].titulo}</span>
      </div>
      <div class="com-body">
        <div class="com-head">
          <h3>${c.titulo}</h3>
          <span class="com-status status-${c.status === "Novo" ? "novo" : "visto"}">${c.status}</span>
        </div>
        <p class="com-meta">${c.tipo} · ${c.data}</p>
        <p class="com-desc">${c.descricao}</p>
        <div class="com-actions">
          <button class="btn-outline" data-act="ver">Visualizar</button>
          <button class="btn-ghost" data-act="baixar">Baixar</button>
        </div>
      </div>`;
    el.querySelector('[data-act="ver"]').onclick = () => abrirPreviewComunicado(c);
    el.querySelector('[data-act="baixar"]').onclick = () => showToast("Download simulado de " + c.tipo + ".");
    grid.appendChild(el);
  });
}

let previewIdx = 0;
function abrirPreviewComunicado(c) {
  previewIdx = 0;
  c.status = "Visualizado";
  const render = () => {
    const s = c.slides[previewIdx];
    $("modal-content").innerHTML = `
      <h2>${c.titulo}</h2>
      <p class="modal-sub">${c.tipo} · ${c.data} · prévia simulada</p>
      <div class="slide tema-${s.tema}">
        <div class="slide-inner">
          <h3>${s.titulo}</h3>
          <p>${s.sub}</p>
        </div>
        <span class="slide-badge">Aché · RenovAI</span>
      </div>
      <div class="slide-nav">
        <button class="slide-arrow" id="slide-prev" ${previewIdx === 0 ? "disabled" : ""}>&#8249;</button>
        <span class="slide-count">${previewIdx + 1} / ${c.slides.length}</span>
        <button class="slide-arrow slide-arrow-on" id="slide-next" ${previewIdx === c.slides.length - 1 ? "disabled" : ""}>&#8250;</button>
      </div>`;
    const prev = $("slide-prev"), next = $("slide-next");
    if (prev) prev.onclick = () => { if (previewIdx > 0) { previewIdx--; render(); } };
    if (next) next.onclick = () => { if (previewIdx < c.slides.length - 1) { previewIdx++; render(); } };
  };
  render();
  abrirModal();
  if (state.usuario.perfil === "propagandista") renderComunicados();
}

/* ---------- Jornada do Gestor / GD ---------- */
function renderGestor() {
  const todas = state.recs;
  const pendentes = todas.filter(r => r.status === "Pendente");
  const dentroCorte = todas.filter(r => r.ranking <= RANKING_CORTE).length;
  const entrada = pendentes.filter(r => r.tipo === "Entrada").length;
  const revisao = pendentes.filter(r => r.tipo === "Revisão").length;
  const setores = new Set(todas.map(r => r.setor)).size;

  $("gestor-kpis").innerHTML = `
    ${kpi("Recomendações pendentes", pendentes.length)}
    ${kpi("Dentro do corte (ranking ≤ 350)", dentroCorte)}
    ${kpi("Sugestões de entrada", entrada)}
    ${kpi("Sugestões de revisão", revisao)}
    ${kpi("Setores cobertos", setores)}`;

  // filtro de setor
  const sel = $("gestor-setor");
  sel.innerHTML = `<option value="">Todos os setores</option>`;
  [...new Set(todas.map(r => r.setor))].sort().forEach(s => {
    const o = document.createElement("option");
    o.value = s;
    o.textContent = s + " · " + SETORES_NOME[s];
    sel.appendChild(o);
  });
  sel.onchange = renderGestorTabela;
  renderGestorTabela();
}
function kpi(label, valor) {
  return `<div class="kpi"><span class="kpi-label">${label}</span><span class="kpi-value">${valor}</span></div>`;
}
function renderGestorTabela() {
  const filtro = $("gestor-setor").value;
  const lista = state.recs
    .filter(r => filtro === "" || r.setor === filtro)
    .sort((a, b) => a.setor.localeCompare(b.setor) || a.ranking - b.ranking);
  const tb = $("gestor-tbody");
  tb.innerHTML = "";
  lista.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.setor}<br><small>${SETORES_NOME[r.setor] || ""}</small></td>
      <td>${RESPONSAVEIS[r.setor] || "—"}</td>
      <td>${r.medico}<br><small>${r.ufcrm} · ID ${r.idMedico}</small></td>
      <td>${r.especialidade}</td>
      <td>${r.cidade}</td>
      <td><span class="tag tag-${r.tipo}">${r.tipo}</span></td>
      <td><span class="st st-${r.status.toLowerCase()}">${r.status}</span></td>
      <td>${r.ranking}${dentroDoCorte(r) ? "" : ' <small class="fora">fora do corte</small>'}</td>
      <td><strong>${fmtPts(r.pontos)}</strong></td>
      <td>${r.status === "Descartada" ? (r.motivoDescarte ? `<span class="just-cell">${r.motivoDescarte}</span>` : "<small>sem motivo informado</small>") : "<small>—</small>"}</td>`;
    tb.appendChild(tr);
  });
}

/* ---------- Modal e toast ---------- */
function abrirModal() { $("modal").hidden = false; document.body.style.overflow = "hidden"; }
function fecharModal() { $("modal").hidden = true; document.body.style.overflow = ""; }
$("modal-close").onclick = fecharModal;
$("modal").addEventListener("click", (e) => { if (e.target === $("modal")) fecharModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("modal").hidden) fecharModal(); });

let toastTimer = null;
function showToast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.hidden = false;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.hidden = true, 300); }, 2600);
}
