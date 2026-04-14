// ============================================================
// MeuGestHVAC — auth.js (FIX REDIRECT AUTH)
// ============================================================

const BASE_URL = "https://willcarraro.github.io/hvac-erp";

let currentUser   = null;
let userProfile   = null;
let financeConfig = null;
let userCompany   = null;


// ============================================================
// AUTH CHECK
// ============================================================
async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();

  if (!session) {
    window.location.href = `${BASE_URL}/index.html`;
    return false;
  }

  currentUser = session.user;

  await Promise.all([
    loadProfile(),
    loadFinanceConfig(),
    loadCompany()
  ]);

  return true;
}


// ============================================================
// PROFILE
// ============================================================
async function loadProfile() {
  const { data, error } = await sb
    .from('users')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  if (error) {
    console.error("Erro loadProfile:", error);
    return;
  }

  userProfile = data;
}


// ============================================================
// FINANCE CONFIG
// ============================================================
async function loadFinanceConfig() {
  const { data, error } = await sb
    .from('user_finance_config')
    .select('*')
    .eq('user_id', currentUser.id)
    .single();

  if (data) {
    financeConfig = data;
    return;
  }

  if (!error) {
    await sb.from('user_finance_config').insert([
      { user_id: currentUser.id }
    ]);
  }

  const { data: d2 } = await sb
    .from('user_finance_config')
    .select('*')
    .eq('user_id', currentUser.id)
    .single();

  financeConfig = d2;
}


// ============================================================
// COMPANY
// ============================================================
async function loadCompany() {
  const { data, error } = await sb
    .from('user_company')
    .select('*')
    .eq('user_id', currentUser.id)
    .single();

  if (error) {
    console.error("Erro loadCompany:", error);
    return;
  }

  userCompany = data;
}


// ============================================================
// SIGN OUT
// ============================================================
async function signOut() {
  await sb.auth.signOut();
  window.location.href = `${BASE_URL}/index.html`;
}


// ============================================================
// FIRST NAME UTILITY
// ============================================================
function firstName() {
  return userProfile?.full_name?.split(' ')[0]
    || currentUser?.email?.split('@')[0]
    || 'Usuário';
}


// ============================================================
// AUTH STATE LISTENER (BLOQUEIO DE SESSÃO FORA DO APP)
// ============================================================
sb.auth.onAuthStateChange((event, session) => {
  if (!session) {
    window.location.href = `${BASE_URL}/index.html`;
  }
});
