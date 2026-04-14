// ============================================================
// MeuGestHVAC — calc.js v3
// Motor único de cálculo — NENHUMA página calcula direto no HTML
// ============================================================

// ---- UTILITÁRIOS ----
function roundMoney(v) { return Math.round((v||0)*100)/100; }

function calcDiscount(total, pct, fixedVal) {
  if(fixedVal > 0) return roundMoney(fixedVal);
  return roundMoney(total * (pct||0) / 100);
}

// ---- INSTALAÇÃO ----
// data = { materials:[{qty,unit_cost,margin_pct}], labor_value, discount_pct, discount_val }
function calcInstallation(data) {
  const cfg = data.cfg || {};
  const mats = data.materials || [];

  let matCost  = 0, matSell = 0;
  mats.forEach(m => {
    const cost = roundMoney((m.qty||1) * (m.unit_cost||0));
    const mg   = (m.margin_pct != null ? m.margin_pct : (cfg.material_margin||30));
    const sell = roundMoney(cost * (1 + mg/100));
    matCost += cost;
    matSell += sell;
  });

  const labor    = roundMoney(data.labor_value || 0);
  const subtotal = roundMoney(matSell + labor);
  const disc     = calcDiscount(subtotal, data.discount_pct, data.discount_val);
  const final    = roundMoney(Math.max(0, subtotal - disc));
  const cost     = roundMoney(matCost);
  const profit   = roundMoney(final - cost);

  return { matCost, matSell, labor, subtotal, disc, final, cost, profit,
           margin_pct: final > 0 ? roundMoney(profit/final*100) : 0 };
}

// ---- PREVENTIVA ----
// data = { equipments:[{ac_type,quantity,base_price,difficulty}], labor_value, discount_pct, discount_val, cfg }
function calcPreventive(data) {
  const cfg  = data.cfg || {};
  const eqs  = data.equipments || [];
  const MULT = { easy: cfg.mult_easy||1.0, medium: cfg.mult_medium||1.3, hard: cfg.mult_hard||1.7 };

  let eqSubtotal = 0;
  eqs.forEach(e => {
    const base  = e.base_price || { hi_wall: cfg.hiwall_base||250, piso_teto: cfg.pisoteto_base||380, cassete: cfg.cassete_base||450 }[e.ac_type] || 250;
    const mult  = MULT[e.difficulty] || 1.3;
    eqSubtotal += roundMoney(base * mult * (e.quantity||1));
  });

  const labor    = roundMoney(data.labor_value || 0);
  const subtotal = roundMoney(eqSubtotal + labor);
  const disc     = calcDiscount(subtotal, data.discount_pct, data.discount_val);
  const final    = roundMoney(Math.max(0, subtotal - disc));
  const profit   = roundMoney(final); // preventiva: custo interno = 0 por padrão

  return { eqSubtotal, labor, subtotal, disc, final, cost: 0, profit,
           margin_pct: final > 0 ? 100 : 0 };
}

// ---- CORRETIVA ----
// data = { parts:[{qty,unit_cost,margin_pct}], gas:{has,type,kg,cost_kg}, nitrogen:{has,m3,cost},
//          labor_hours, has_urgency, cfg }
function calcCorrective(data) {
  const cfg  = data.cfg || {};
  const parts = data.parts || [];
  const gas   = data.gas || {};
  const n2    = data.nitrogen || {};

  // Peças
  let partsCost = 0, partsSell = 0;
  parts.forEach(p => {
    const cost = roundMoney((p.qty||1) * (p.unit_cost||0));
    const mg   = (p.margin_pct != null ? p.margin_pct : (cfg.parts_margin||30));
    partsCost += cost;
    partsSell += roundMoney(cost * (1 + mg/100));
  });

  // Gás
  const gasCost  = gas.has ? roundMoney((gas.kg||0) * (gas.cost_kg||0)) : 0;
  const gasSell  = gas.has ? roundMoney(gasCost * (1 + (cfg.gas_margin||25)/100)) : 0;

  // Nitrogênio
  const n2Cost   = n2.has ? roundMoney(n2.cost||0) : 0;
  const n2Sell   = n2.has ? roundMoney(n2Cost * (1 + (cfg.gas_margin||25)/100)) : 0;

  // Hora técnica
  const labor    = roundMoney((data.labor_hours||0) * (cfg.hourly_rate||150));

  // Taxa de visita
  const visit    = roundMoney(data.has_visit ? (cfg.visit_fee||80) : 0);

  // Urgência
  const urgPct   = data.has_urgency ? (cfg.urgency_surcharge||50) : 0;

  const subtotalBase = roundMoney(partsSell + gasSell + n2Sell + labor + visit);
  const urgValue     = roundMoney(subtotalBase * urgPct / 100);
  const subtotal     = roundMoney(subtotalBase + urgValue);

  // Piso mínimo corretiva
  const minFee   = cfg.min_corrective_fee || 250;
  const preDisc  = Math.max(subtotal, minFee);

  const disc     = calcDiscount(preDisc, data.discount_pct, data.discount_val);
  const final    = roundMoney(Math.max(0, preDisc - disc));
  const cost     = roundMoney(partsCost + gasCost + n2Cost + labor + visit);
  const profit   = roundMoney(final - cost);

  return { partsCost, partsSell, gasCost, gasSell, n2Cost, n2Sell,
           labor, visit, urgValue, subtotal, disc, final, cost, profit,
           margin_pct: final > 0 ? roundMoney(profit/final*100) : 0 };
}

// ---- DADOS PADRÃO DE ORÇAMENTO (para salvar no banco) ----
function buildQuotePayload(type, result, extra = {}) {
  return {
    ...extra,
    total_cost:       result.cost,
    total_price:      result.final,
    estimated_profit: result.profit,
    discount:         result.disc,
    params_snapshot:  extra.cfg || {},
  };
}
