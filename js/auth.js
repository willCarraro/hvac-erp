// ============================================================
// HVAC ERP — auth.js
// Proteção de páginas — redireciona para login se não autenticado
// Inclua este script em TODAS as páginas protegidas
// ============================================================

let currentUser  = null;
let userProfile  = null;
let financeConfig = null;

async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { window.location.href = 'index.html'; return false; }
  currentUser = session.user;
  await Promise.all([loadProfile(), loadFinanceConfig()]);
  return true;
}

async function loadProfile() {
  const { data } = await sb.from('users').select('*').eq('id', currentUser.id).single();
  userProfile = data;
}

async function loadFinanceConfig() {
  const { data } = await sb.from('finance_config').select('*').single();
  financeConfig = data;
}

async function signOut() {
  await sb.auth.signOut();
  window.location.href = 'index.html';
}

function firstName() {
  return userProfile?.full_name?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Usuário';
}
