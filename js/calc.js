// ============================================================
// MeuGestHVAC — calc.js v4
// Motor central de cálculo
// REGRA: Mão de obra / hora técnica = RECEITA, não custo
// CUSTO = apenas materiais, peças, gás, nitrogênio
// ============================================================

function roundMoney(v) { return Math.round((parseFloat(v)||0)*100)/100; }

function calcDiscount(subtotal, pct, fixedVal) {
  if (fixedVal > 0) return roundMoney(fixedVal);
  return roundMoney((subtotal||0) * (pct||0) / 100);
}

// ---- INSTALAÇÃO ----
// materials: [{qty, unit_cost, margin_pct}]
// labor_value: valor cobrado de MO (receita, não custo)
function calcInstallation(data) {
  const cfg = data.cfg || {};
  const mats = data.materials || [];

  let matCost = 0, matSell = 0;
  mats.forEach(m => {
    const cost = roundMoney((m.qty||1) * (m.unit_cost||0));
    const mg   = m.margin_pct != null ? m.margin_pct : (cfg.material_margin||30);
    matCost += cost;
    matSell += roundMoney(cost * (1 + mg/100));
  });

  const labor    = roundMoney(data.labor_value || 0);
  const subtotal = roundMoney(matSell + labor);
  const disc     = calcDiscount(subtotal, data.discount_pct, data.discount_val);
  const final    = roundMoney(Math.max(0, subtotal - disc));

  // Custo real = só materiais (MO é receita)
  const cost   = roundMoney(matCost);
  const profit = roundMoney(final - cost);

  return {
    matCost, matSell, labor,
    subtotal, disc, final, cost, profit,
    margin_pct: final > 0 ? roundMoney(profit/final*100) : 0
  };
}

// ---- PREVENTIVA ----
// equipments: [{ac_type, quantity, base_price, difficulty}]
// labor_value: valor cobrado de MO (REMOVIDO — não tem MO em preventiva)
function calcPreventive(data) {
  const cfg  = data.cfg || {};
  const eqs  = data.equipments || [];
  const MULT = {
    easy:   cfg.mult_easy   != null ? cfg.mult_easy   : 1.0,
    medium: cfg.mult_medium != null ? cfg.mult_medium : 1.3,
    hard:   cfg.mult_hard   != null ? cfg.mult_hard   : 1.7,
  };
  const BASE = {
    hi_wall:   cfg.hiwall_base   || 250,
    piso_teto: cfg.pisoteto_base || 380,
    cassete:   cfg.cassete_base  || 450,
  };

  let eqSubtotal = 0;
  eqs.forEach(e => {
    const base     = e.base_price || BASE[e.ac_type] || BASE[e.type] || 250;
    const mult     = MULT[e.difficulty] || 1.3;
    const qty      = e.quantity || e.qty || 1;  // suporta ambos os nomes
    eqSubtotal += roundMoney(base * mult * qty);
  });

  const subtotal = roundMoney(eqSubtotal);
  const disc     = calcDiscount(subtotal, data.discount_pct, data.discount_val);
  const final    = roundMoney(Math.max(0, subtotal - disc));

  // Preventiva: sem custo de material — lucro = total cobrado
  return {
    eqSubtotal, subtotal, disc, final,
    cost: 0, profit: final,
    margin_pct: 100
  };
}

// ---- CORRETIVA ----
// labor_hours × hourly_rate = RECEITA (não custo)
function calcCorrective(data) {
  const cfg   = data.cfg || {};
  const parts = data.parts || [];
  const gas   = data.gas   || {};
  const n2    = data.nitrogen || {};

  // Peças — custo real
  let partsCost = 0, partsSell = 0;
  parts.forEach(p => {
    const cost = roundMoney((p.qty||p.quantity||1) * (p.unit_cost||0));
    const mg   = p.margin_pct != null ? p.margin_pct : (cfg.parts_margin||30);
    partsCost += cost;
    partsSell += roundMoney(cost * (1 + mg/100));
  });

  // Gás — custo real
  const gasCost = gas.has ? roundMoney((gas.kg||0) * (gas.cost_kg||0)) : 0;
  const gasSell = gas.has ? roundMoney(gasCost * (1 + (cfg.gas_margin||25)/100)) : 0;

  // Nitrogênio — custo real
  const n2Cost  = n2.has ? roundMoney(n2.cost||0) : 0;
  const n2Sell  = n2.has ? roundMoney(n2Cost * (1 + (cfg.gas_margin||25)/100)) : 0;

  // Hora técnica — RECEITA (não custo)
  const labor   = roundMoney((data.labor_hours||0) * (cfg.hourly_rate||150));

  // Taxa de visita — receita
  const visit   = data.has_visit ? roundMoney(cfg.visit_fee||80) : 0;

  const subtotalBase = roundMoney(partsSell + gasSell + n2Sell + labor + visit);
  const urgPct       = data.has_urgency ? (cfg.urgency_surcharge||50) : 0;
  const urgValue     = roundMoney(subtotalBase * urgPct / 100);
  const subtotal     = roundMoney(subtotalBase + urgValue);

  // Piso mínimo
  const minFee   = cfg.min_corrective_fee || 250;
  const preDisc  = Math.max(subtotal, minFee);
  const disc     = calcDiscount(preDisc, data.discount_pct, data.discount_val);
  const final    = roundMoney(Math.max(0, preDisc - disc));

  // Custo real = apenas materiais/peças/gás (NÃO labor/visit)
  const cost   = roundMoney(partsCost + gasCost + n2Cost);
  const profit = roundMoney(final - cost);

  return {
    partsCost, partsSell,
    gasCost, gasSell,
    n2Cost, n2Sell,
    labor, visit, urgValue,
    subtotal, disc, final, cost, profit,
    margin_pct: final > 0 ? roundMoney(profit/final*100) : 0
  };
}

// ---- PRÓXIMO NÚMERO DE ORÇAMENTO (progressivo) ----
// Usa tabela quote_sequences para garantir que nunca reutiliza
async function nextQuoteSequence(sb, userId, year) {
  // Tenta incrementar atomicamente
  const { data, error } = await sb.rpc('increment_quote_sequence', {
    p_user_id: userId,
    p_year: year
  });

  if (!error && data) return data;

  // Fallback: query direta
  const { data: existing } = await sb.from('quote_sequences')
    .select('last_sequence')
    .eq('user_id', userId)
    .eq('year', year)
    .single();

  const next = Math.max((existing?.last_sequence || 99) + 1, 100);

  await sb.from('quote_sequences').upsert([{
    user_id: userId,
    year,
    last_sequence: next
  }]);

  return next;
}
