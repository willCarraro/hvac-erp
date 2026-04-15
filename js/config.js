const SUPABASE_URL='https://ygzpguycmdpiijkyxzzj.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnenBndXljbWRwaWlqa3l4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5Mzk3MzksImV4cCI6MjA5MTUxNTczOX0.vflppi3nB5ligWFDD4sjemh1Td6UH2jR7rUU9TlIW_E';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
function nav(page){window.location.href=page;}
function toast(msg,type='',ms=2800){document.querySelectorAll('.toast').forEach(e=>e.remove());const t=document.createElement('div');t.className=`toast ${type==='ok'?'tok':type==='err'?'terr':type==='warn'?'twarn':''}`;t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),ms);}
function fmt(v){return'R$ '+parseFloat(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fdate(s){if(!s)return'—';try{return new Date(s+(s.length===10?'T12:00':'')).toLocaleDateString('pt-BR');}catch{return s;}}
function fdatetime(s){if(!s)return'—';try{return new Date(s).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});}catch{return s;}}
function initials(n){return(n||'').split(' ').slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'?';}
function sLabel(s){return{draft:'Rascunho',pending:'Pendente',to_send:'A Enviar',sent:'Enviado',approved:'Aprovado',scheduled:'Agendado',finished:'Concluído',rejected:'Reprovado'}[s]||s;}
function sBadgeClass(s){return'badge b'+(s||'draft');}
function stLabel(t){return{installation:'Instalação',preventive:'Preventiva',corrective:'Corretiva'}[t]||t;}
function dfLabel(d){return{easy:'Fácil',medium:'Médio',hard:'Difícil'}[d]||d;}
function pmLabel(p){return{pix:'PIX',cash:'Dinheiro',debit:'Débito',credit:'Crédito',bank_slip:'Boleto',transfer:'Transferência'}[p]||p;}
function val(id){const el=document.getElementById(id);const v=el?.value?.trim();return v||null;}
function numVal(id){return parseFloat(document.getElementById(id)?.value)||0;}
function setEl(id,text){const el=document.getElementById(id);if(el)el.textContent=text;}
function showErr(id,msg){const el=document.getElementById(id);if(el)el.innerHTML=`<div class="alert alert-err">${msg}</div>`;}
function clearErr(id){const el=document.getElementById(id);if(el)el.innerHTML='';}
function setBtnLoading(id,loading,label='Salvar'){const el=document.getElementById(id);if(!el)return;el.disabled=loading;el.textContent=loading?'Aguarde...':label;}

function renderNav(active){
  const items=[
    {id:'home',ico:'🏠',lbl:'Início',href:'home.html'},
    {id:'clientes',ico:'👥',lbl:'Clientes',href:'clientes.html'},
    {id:'orcamentos',ico:'📋',lbl:'Orçamentos',href:'orcamentos.html'},
    {id:'agenda',ico:'📅',lbl:'Agenda',href:'agenda.html'},
    {id:'financeiro',ico:'💰',lbl:'Financeiro',href:'financeiro.html'},
  ];
  const styleId='mais-style';
  if(!document.getElementById(styleId)){
    const s=document.createElement('style');s.id=styleId;
    s.textContent=`.mais-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:300;opacity:0;transition:opacity .2s;pointer-events:none;}.mais-overlay.show{opacity:1;pointer-events:all;}.mais-sheet{position:fixed;bottom:0;left:50%;transform:translateX(-50%) translateY(100%);width:100%;max-width:430px;background:#1A2535;border-radius:18px 18px 0 0;border-top:1px solid #2D3F55;z-index:301;padding:8px 0 calc(var(--nav-h,64px)+8px);transition:transform .25s cubic-bezier(.32,1,.64,1);}.mais-sheet.show{transform:translateX(-50%) translateY(0);}.mais-handle{width:36px;height:4px;background:#2D3F55;border-radius:2px;margin:8px auto 16px;}.mais-title{font-size:11px;font-weight:700;color:#8FA3B1;text-transform:uppercase;letter-spacing:1px;padding:0 20px 10px;}.mais-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 14px;}.mais-item{background:#243044;border:1px solid #2D3F55;border-radius:12px;padding:14px 8px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;}.mais-item:active{border-color:#00BFFF;}.mico{font-size:22px;}.mlbl{font-size:11px;font-weight:600;color:#E8EDF2;text-align:center;}.mais-divider{height:1px;background:#2D3F55;margin:14px 14px 10px;}.mais-row{display:flex;align-items:center;gap:12px;padding:12px 20px;cursor:pointer;}.mais-row:active{background:rgba(255,255,255,.04);}.mais-row-ico{font-size:20px;width:32px;text-align:center;}.mais-row-lbl{font-size:14px;font-weight:600;color:#E8EDF2;}.mais-row-sub{font-size:11px;color:#8FA3B1;margin-top:1px;}`;
    document.head.appendChild(s);
  }
  return`
  <nav class="bnav">
    ${items.map(i=>`<button class="ni ${active===i.id?'on':''}" onclick="nav('${i.href}')"><span class="ni-ico">${i.ico}</span><span class="ni-lbl">${i.lbl}</span></button>`).join('')}
    <button class="ni ${['notificacoes','relatorios','configuracoes','logs'].includes(active)?'on':''}" onclick="openMais()"><span class="ni-ico">☰</span><span class="ni-lbl">Mais</span></button>
  </nav>
  <div class="mais-overlay" id="maisOverlay" onclick="closeMais()"></div>
  <div class="mais-sheet" id="maisSheet">
    <div class="mais-handle"></div>
    <div class="mais-title">Menu</div>
    <div class="mais-grid">
      <div class="mais-item" onclick="closeMais();nav('notificacoes.html')"><span class="mico">🔔</span><span class="mlbl">Notificações</span></div>
      <div class="mais-item" onclick="closeMais();nav('relatorios.html')"><span class="mico">📊</span><span class="mlbl">Relatórios</span></div>
      <div class="mais-item" onclick="closeMais();nav('configuracoes.html')"><span class="mico">⚙️</span><span class="mlbl">Configurações</span></div>
    </div>
    <div class="mais-divider"></div>
    <div class="mais-row" onclick="closeMais();nav('orcamento-novo.html')"><span class="mais-row-ico">⚡</span><div><div class="mais-row-lbl">Novo orçamento</div><div class="mais-row-sub">Instalação, preventiva ou corretiva</div></div></div>
    <div class="mais-row" onclick="closeMais();nav('cliente-novo.html')"><span class="mais-row-ico">➕</span><div><div class="mais-row-lbl">Novo cliente</div><div class="mais-row-sub">Cadastrar cliente</div></div></div>
    <div class="mais-divider"></div>
    <div class="mais-row" onclick="closeMais();nav('logs.html')"><span class="mais-row-ico">📋</span><div><div class="mais-row-lbl">Logs do sistema</div><div class="mais-row-sub">Orçamentos excluídos e histórico</div></div></div>
    <div class="mais-divider"></div>
    <div class="mais-row" onclick="closeMais();if(confirm('Sair da conta?'))signOut()"><span class="mais-row-ico">🚪</span><div><div class="mais-row-lbl" style="color:#E74C3C;">Sair da conta</div></div></div>
  </div>`;
}
function openMais(){document.getElementById('maisOverlay')?.classList.add('show');document.getElementById('maisSheet')?.classList.add('show');}
function closeMais(){document.getElementById('maisOverlay')?.classList.remove('show');document.getElementById('maisSheet')?.classList.remove('show');}
