// ============================================================
// HVAC ERP — calc.js
// Motor de cálculo puro — sem acesso ao banco
// Baseado nas regras do DOMAIN_MAP e ARCHITECTURE
// ============================================================

function calcItem(item, cfg) {
  if (!cfg) return { cost: 0, price: 0, profit: 0, labor: 0, matP: 0, gasP: 0, parP: 0 };

  // Multiplicador de dificuldade
  const mult = {
    easy:   cfg.mult_easy   || 1.0,
    medium: cfg.mult_medium || 1.3,
    hard:   cfg.mult_hard   || 1.7,
  }[item.difficulty] || cfg.mult_medium || 1.3;

  // Adicional urgência
  const urg = item.is_urgent ? (1 + (cfg.urgency_surcharge || 50) / 100) : 1;

  // Custo bruto
  const laborCost = (item.labor_hours || 0) * (cfg.hourly_rate || 150);
  const matCost   = item.material_cost || 0;
  const gasCost   = item.gas_cost || 0;
  const parCost   = item.parts_cost || 0;

  // Preços com margem
  const laborP = laborCost;
  const matP   = matCost * (1 + (cfg.material_margin || 30) / 100);
  const gasP   = gasCost * (1 + (cfg.gas_margin || 25) / 100);
  const parP   = parCost * (1 + (cfg.parts_margin || 30) / 100);

  // Subtotal antes de multiplicadores
  const subtotal = (laborP + matP + gasP + parP) * mult * urg;

  // Preço final — corretiva tem piso mínimo
  const minFee = item.service_type === 'corrective' ? (cfg.min_corrective_fee || 250) : 0;
  const price  = Math.max(subtotal, minFee);

  // Custo real (sem margens)
  const cost = laborCost + matCost + gasCost + parCost;

  return {
    cost,
    price,
    profit: price - cost,
    labor:  laborP,
    matP,
    gasP,
    parP,
  };
}

function calcQuote(items, cfg, discount = 0) {
  const totals = items.reduce((acc, item) => {
    const r = calcItem(item, cfg);
    acc.cost   += r.cost;
    acc.price  += r.price;
    acc.labor  += r.labor;
    acc.matP   += r.matP;
    acc.gasP   += r.gasP;
    acc.parP   += r.parP;
    return acc;
  }, { cost: 0, price: 0, labor: 0, matP: 0, gasP: 0, parP: 0 });

  const finalPrice  = Math.max(0, totals.price - discount);
  const profit      = finalPrice - totals.cost;

  return { ...totals, discount, finalPrice, profit };
}
