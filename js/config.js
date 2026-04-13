// ============================================================
// HVAC ERP — config.js
// Supabase client + utilitários compartilhados
// ============================================================

const SUPABASE_URL = 'https://ygzpguycmdpiijkyxzzj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnenBndXljbWRwaWlqa3l4enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5Mzk3MzksImV4cCI6MjA5MTUxNTczOX0.vflppi3nB5ligWFDD4sjemh1Td6UH2jR7rUU9TlIW_E';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---- NAVEGAÇÃO ----
function nav(page) { window.location.href = page; }

// ---- TOAST ----
function toast(msg, type = '', ms = 2800) {
  document.querySelectorAll('.toast').forEach(e => e.remove());
  const t = document.createElement('div');
  t.className = `toast ${type === 'ok' ? 'tok' : type === 'err' ? 'terr' : type === 'warn' ? 'twarn' : ''}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// ---- FORMATAÇÃO ----
function fmt(v) {
  return 'R$ ' + parseFloat(v || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });
}

function fdate(s) {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('pt-BR'); } catch { return s; }
}

function fdatetime(s) {
  if (!s) return '—';
  try { return new Date(s).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return s; }
}

function initials(n) {
  return (n || '').split(' ').slice(0, 2).map(x => x[0] || '').join('').toUpperCase() || '?';
}

// ---- LABELS ----
function sLabel(s) {
  return { draft: 'Rascunho', pending: 'Pendente', to_send: 'A Enviar', sent: 'Enviado', approved: 'Aprovado', scheduled: 'Agendado', finished: 'Concluído', rejected: 'Recusado' }[s] || s;
}

function sBadgeClass(s) {
  return 'badge b' + (s || 'draft');
}

function stLabel(t) {
  return { installation: 'Instalação', preventive: 'Preventiva', corrective: 'Corretiva' }[t] || t;
}

function dfLabel(d) {
  return { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }[d] || d;
}

function pmLabel(p) {
  return { pix: 'PIX', cash: 'Dinheiro', debit: 'Débito', credit: 'Crédito', bank_slip: 'Boleto', transfer: 'Transferência' }[p] || p;
}

// ---- HELPERS ----
function val(id) {
  const el = document.getElementById(id);
  const v = el?.value?.trim();
  return v || null;
}

function numVal(id) {
  return parseFloat(document.getElementById(id)?.value) || 0;
}

function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="alert alert-err">${msg}</div>`;
}

function clearErr(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
}

function setBtnLoading(id, loading, label = 'Salvar') {
  const el = document.getElementById(id);
  if (!el) return;
  el.disabled = loading;
  el.textContent = loading ? 'Aguarde...' : label;
}

// ---- LOADING SCREEN ----
function showLoading() {
  document.getElementById('app').innerHTML = `
    <div class="loading">
      <div class="spin"></div>
      <p>Carregando...</p>
    </div>`;
}

// ---- BOTTOM NAV ----
function renderNav(active) {
  const items = [
    { id: 'home',       ico: '🏠', lbl: 'Início',     href: 'home.html' },
    { id: 'clientes',   ico: '👥', lbl: 'Clientes',   href: 'clientes.html' },
    { id: 'orcamentos', ico: '📋', lbl: 'Orçamentos', href: 'orcamentos.html' },
    { id: 'config',     ico: '⚙️', lbl: 'Mais',       href: 'configuracoes.html' },
  ];
  return `<nav class="bnav">${items.map(i => `
    <button class="ni ${active === i.id ? 'on' : ''}" onclick="nav('${i.href}')">
      <span class="ni-ico">${i.ico}</span>
      <span class="ni-lbl">${i.lbl}</span>
    </button>`).join('')}</nav>`;
}
