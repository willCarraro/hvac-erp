// ============================================================
// MeuGestHVAC — auth.js
// ============================================================
let currentUser   = null;
let userProfile   = null;
let financeConfig = null;
let userCompany   = null;

async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { window.location.href = 'index.html'; return false; }
  currentUser = session.user;
  await Promise.all([loadProfile(), loadFinanceConfig(), loadCompany()]);
  return true;
}
async function loadProfile() {
  const { data } = await sb.from('users').select('*').eq('id', currentUser.id).single();
  userProfile = data;
}
async function loadFinanceConfig() {
  const { data } = await sb.from('user_finance_config').select('*').eq('user_id', currentUser.id).single();
  if (data) { financeConfig = data; return; }
  // Se não existe ainda, cria
  await sb.from('user_finance_config').insert([{ user_id: currentUser.id }]);
  const { data: d2 } = await sb.from('user_finance_config').select('*').eq('user_id', currentUser.id).single();
  financeConfig = d2;
}
async function loadCompany() {
  const { data } = await sb.from('user_company').select('*').eq('user_id', currentUser.id).single();
  userCompany = data;
}
async function signOut() {
  await sb.auth.signOut();
  window.location.href = 'index.html';
}
function firstName() {
  return userProfile?.full_name?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Usuário';
}
