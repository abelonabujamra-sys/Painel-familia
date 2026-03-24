import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════
   DADOS REAIS — FLUXO DE CAIXA ESPÓLIO 2026
   Fonte: FLUXO_CAIXA_ESPÓLIO_2026.xlsx + extratos Itaú/BTG
   ═══════════════════════════════════════════════ */

const CATEGORIES = [
  { key: "gasto_fixo", label: "Gasto Fixo", color: "#3B82C4" },
  { key: "gasto_variavel", label: "Gasto Variável", color: "#E6A817" },
  { key: "dist_lucros", label: "Distrib. Lucros", color: "#D4A528" },
  { key: "inventario", label: "Inventário", color: "#00B8B8" },
  { key: "amah", label: "AMAH / HSB", color: "#5BA08A" },
  { key: "braven", label: "Braven", color: "#D46B5C" },
  { key: "chacara", label: "Chácara", color: "#C27BA0" },
  { key: "acordo", label: "Acordo Separação", color: "#45818E" },
  { key: "outros", label: "Outros", color: "#8A7DC4" },
  { key: "aplicacao", label: "Aplicação Financeira", color: "#6B8E6B" },
];

const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const fmt = (v) => v == null || isNaN(v) ? "R$ 0,00" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Investimentos (saldo líquido) — atualizado manualmente com extratos
const INV = {
  "2025-12": { itau: 7968210.93, btg: 4069207.93, dt: "31/12/2025" },
  "2026-01": { itau: 8465011.89, btg: 4129613.88, dt: "31/01/2026" },
  "2026-02": { itau: 8508025.01, btg: 4151756.32, dt: "28/02/2026" },
};
const gInv = (m, y) => INV[`${y}-${String(m + 1).padStart(2, "0")}`] || null;

// Fluxo de caixa mensal — extraído da planilha
const FLOW = {
  0: { // JANEIRO
    saldoAnt: 312717.21, entradas: 332221.08, saidasTotal: 637443.39, saldoFim: 7494.90,
    recResumo: { alugueis: 3471.43, hidrel: 3740, jamra: 220000, dataprom: 80000, invest: 25000, rend: 9.65 },
    receitas: [
      { d: "Tecnologia Bancaria", v: 924.46, g: "Aluguel" },
      { d: "Valim Dias Salas 108-109", v: 381.20, g: "Aluguel" },
      { d: "Valim Dias Salas 101-104", v: 860.41, g: "Aluguel" },
      { d: "Clínica Dr Gilson Clazer", v: 453.90, g: "Aluguel" },
      { d: "GIMAFE Administradora", v: 170.41, g: "Aluguel" },
      { d: "Clínica Franco Montei (Osni)", v: 540.00, g: "Aluguel" },
      { d: "Imóvel Marechal Floriano (CLASSIC)", v: 141.05, g: "Aluguel" },
      { d: "Hidrelétrica Germania do Verde", v: 3740.00, g: "Hidrelétrica" },
      { d: "Aluguel Jamra", v: 220000.00, g: "Mabu" },
      { d: "Distrib Lucros Dataprom", v: 80000.00, g: "Dataprom" },
      { d: "Investimentos (CDB)", v: 25000.00, g: "Investimento" },
      { d: "Rendimento Aplicação Aut Mais", v: 9.65, g: "Rendimento" },
    ],
    catSaidas: { acordo: 25000, gasto_fixo: 21224.35, gasto_variavel: 30947.97, dist_lucros: 98000, chacara: 6166.26, braven: 2766.81, amah: 3519, outros: 16000, inventario: 3820, aplicacao: 430000 },
    despesas: [
      { d: "Silvana Belon — parcela 21/48", v: 25000, c: "acordo" },
      { d: "Distrib Lucros — 6 herdeiros", v: 78000, c: "dist_lucros" },
      { d: "Compl Distrib Lucros Dataprom JMF", v: 20000, c: "dist_lucros" },
      { d: "Cond. Porto Vitória", v: 4748.46, c: "gasto_fixo" },
      { d: "ZRH Residência NF 159", v: 516.24, c: "gasto_fixo" },
      { d: "Salários residência (Sol + Antônia + Alexandre)", v: 6565.87, c: "gasto_fixo" },
      { d: "Adiantamento Salário Alexandre", v: 1500, c: "gasto_fixo" },
      { d: "FGTS (DAE) Residência", v: 5797.63, c: "gasto_fixo" },
      { d: "Enfinity — Luz residência", v: 704.68, c: "gasto_fixo" },
      { d: "VTs Sol + Maria Antônia", v: 648, c: "gasto_fixo" },
      { d: "Internet + Telecom residência", v: 268.16, c: "gasto_fixo" },
      { d: "Seguros (cartão + vida)", v: 61.81, c: "gasto_fixo" },
      { d: "Clube Curitibano", v: 412.50, c: "gasto_fixo" },
      { d: "Cartão Black 6277 Alexandre", v: 14485.43, c: "gasto_variavel" },
      { d: "Cartão Personalite (cancelado)", v: 2037.24, c: "gasto_variavel" },
      { d: "Reemb Cartão Alexandre", v: 1842.15, c: "gasto_variavel" },
      { d: "Augusto — Gestão Administrativa", v: 3000, c: "gasto_variavel" },
      { d: "Michele Abujamra 23/24", v: 2000, c: "gasto_variavel" },
      { d: "Férias Alexandre — 20 dias", v: 3370.38, c: "gasto_variavel" },
      { d: "Adto Salário Sol + Antônia", v: 2400, c: "gasto_variavel" },
      { d: "Sttc Eventos e Turismo", v: 1200, c: "gasto_variavel" },
      { d: "Reemb IPVA Kwid Braven", v: 432.77, c: "gasto_variavel" },
      { d: "RSHOP Pastéis", v: 180, c: "gasto_variavel" },
      { d: "Salários Chácara (Sueli + Nereu)", v: 2590.36, c: "chacara" },
      { d: "Adto Salário Sueli + Nereu", v: 2000, c: "chacara" },
      { d: "Copel + Internet Chácara", v: 320, c: "chacara" },
      { d: "Sueli — Produtos Adicionais", v: 565.90, c: "chacara" },
      { d: "Reemb bomba poço Pedra Branca", v: 690, c: "chacara" },
      { d: "Cond Neo sala 712", v: 978.81, c: "braven" },
      { d: "Reemb Braven Maria Irene NF 77", v: 1788, c: "braven" },
      { d: "Aporte HSB (2 parcelas)", v: 3519, c: "amah" },
      { d: "Diego Campos — Espólio AMA 20/20", v: 8000, c: "outros" },
      { d: "Maran Gehlen — Espólio AMA 20/20", v: 8000, c: "outros" },
      { d: "ITCMD + Custas inventário", v: 3820, c: "inventario" },
      { d: "Aplicação CDB, Renda Fixa", v: 430000, c: "aplicacao" },
    ],
  },
  1: { // FEVEREIRO
    saldoAnt: 7494.90, entradas: 1551469.33, saidasTotal: 1550949.78, saldoFim: 8014.45,
    recResumo: { alugueis: 4693.84, hidrel: 3740, jamra: 250000, dataprom: 160000, invest: 1130000, rend: 1.48 },
    receitas: [
      { d: "Tecban Serviços Integrados", v: 1197.50, g: "Aluguel" },
      { d: "Tecnologia Bancaria", v: 924.46, g: "Aluguel" },
      { d: "Valim Dias Salas 108-109", v: 380.97, g: "Aluguel" },
      { d: "Valim Dias Salas 101-104", v: 859.94, g: "Aluguel" },
      { d: "Clínica Dr Gilson Clazer", v: 453.90, g: "Aluguel" },
      { d: "GIMAFE Administradora", v: 177.83, g: "Aluguel" },
      { d: "Clínica Franco Montei (Osni)", v: 540.00, g: "Aluguel" },
      { d: "Imóvel Marechal Floriano (CLASSIC)", v: 159.24, g: "Aluguel" },
      { d: "Hidrelétrica Germania do Verde", v: 3740.00, g: "Hidrelétrica" },
      { d: "Aluguel Jamra", v: 250000.00, g: "Mabu" },
      { d: "Distrib Lucros Dataprom (2x)", v: 160000.00, g: "Dataprom" },
      { d: "Investimentos (CDB + Fundos)", v: 1130000, g: "Investimento" },
      { d: "Extorno pix Antônia", v: 3000, g: "Extorno" },
      { d: "Rendimento Aplicação", v: 1.48, g: "Rendimento" },
      { d: "Diversos", v: 34.01, g: "Diversos" },
    ],
    catSaidas: { acordo: 25000, gasto_fixo: 21120.43, gasto_variavel: 18922.01, dist_lucros: 160000.02, chacara: 6388.44, braven: 1984.78, amah: 1759.50, outros: 10000, inventario: 181778.34, aplicacao: 1120000 },
    despesas: [
      { d: "Silvana Belon — parcela 22/48", v: 25000, c: "acordo" },
      { d: "Distrib Lucros — 6 herdeiros (2 meses)", v: 160000.02, c: "dist_lucros" },
      { d: "Cond. Porto Vitória", v: 4978.01, c: "gasto_fixo" },
      { d: "ZRH Residência NF 218", v: 344.16, c: "gasto_fixo" },
      { d: "Salários residência (Sol + Antônia + Alexandre)", v: 4172.48, c: "gasto_fixo" },
      { d: "Adiantamento Salário Alexandre", v: 1500, c: "gasto_fixo" },
      { d: "FGTS (DAE) Residência", v: 3691.23, c: "gasto_fixo" },
      { d: "Enfinity — Luz residência", v: 498.08, c: "gasto_fixo" },
      { d: "VTs Sol + Maria Antônia", v: 792, c: "gasto_fixo" },
      { d: "Internet + Telecom residência", v: 268.16, c: "gasto_fixo" },
      { d: "Seguros", v: 61.81, c: "gasto_fixo" },
      { d: "Clube Curitibano", v: 412.50, c: "gasto_fixo" },
      { d: "Augusto — Gestão Administrativa", v: 3000, c: "gasto_fixo" },
      { d: "Michele Abujamra 24/24", v: 2000, c: "gasto_fixo" },
      { d: "Adto Salário Sol + Antônia", v: 2400, c: "gasto_variavel" },
      { d: "Cartão Black 6277 Alexandre", v: 11246.12, c: "gasto_variavel" },
      { d: "Reemb Cartão + Seguro Alexandre", v: 806.55, c: "gasto_variavel" },
      { d: "Cartão Personalite (cancelado)", v: 1869.34, c: "gasto_variavel" },
      { d: "Empréstimo para Antônia", v: 3000, c: "gasto_variavel" },
      { d: "Salários Chácara (Sueli + Nereu)", v: 2593.46, c: "chacara" },
      { d: "Adto Salário Sueli + Nereu", v: 2000, c: "chacara" },
      { d: "Copel + Internet Chácara", v: 429.98, c: "chacara" },
      { d: "Sueli — Produtos + veneno", v: 1365, c: "chacara" },
      { d: "Cond Neo 712 + Irene + Reemb Braven", v: 1984.78, c: "braven" },
      { d: "Aporte HSB Zaidowicz", v: 1759.50, c: "amah" },
      { d: "Maran Gehlen NF 330 — Inventário 1/10", v: 10000, c: "outros" },
      { d: "ITCMD Sobrepartilha BTG (6 herdeiros) + Custas", v: 181778.34, c: "inventario" },
      { d: "Aplicação CDB + Fundos Investimento", v: 1120000, c: "aplicacao" },
    ],
  },
  2: { // MARÇO
    saldoAnt: 8014.45, entradas: 357930.76, saidasTotal: 164833.64, saldoFim: 201111.57,
    recResumo: { alugueis: 4190.76, hidrel: 3740, jamra: 250000, dataprom: 100000, invest: 0, rend: 0 },
    receitas: [
      { d: "Tecban Serviços Integrados", v: 1197.50, g: "Aluguel" },
      { d: "Tecnologia Bancaria", v: 924.46, g: "Aluguel" },
      { d: "Valim Dias Salas 108-109", v: 381.94, g: "Aluguel" },
      { d: "Valim Dias Salas 101-104", v: 381.94, g: "Aluguel" },
      { d: "Clínica Dr Gilson Clazer", v: 453.90, g: "Aluguel" },
      { d: "GIMAFE Administradora", v: 177.83, g: "Aluguel" },
      { d: "Clínica Franco Montei (Osni)", v: 540.00, g: "Aluguel" },
      { d: "Imóvel Marechal Floriano (CLASSIC)", v: 133.19, g: "Aluguel" },
      { d: "Hidrelétrica Germania do Verde", v: 3740.00, g: "Hidrelétrica" },
      { d: "Aluguel Jamra", v: 250000.00, g: "Mabu" },
      { d: "Distrib Lucros Dataprom", v: 100000.00, g: "Dataprom" },
    ],
    catSaidas: { acordo: 25000, gasto_fixo: 14979.09, gasto_variavel: 20585.67, dist_lucros: 100000.02, chacara: 3294.76, braven: 958.10, amah: 16, outros: 0, inventario: 0, aplicacao: 0 },
    despesas: [
      { d: "Silvana Belon — parcela 23/48", v: 25000, c: "acordo" },
      { d: "Distrib Lucros — 6 herdeiros", v: 100000.02, c: "dist_lucros" },
      { d: "Cond. Porto Vitória", v: 4449.30, c: "gasto_fixo" },
      { d: "ZRH Residência", v: 344.16, c: "gasto_fixo" },
      { d: "Salários residência (Sol + Alexandre)", v: 6436.71, c: "gasto_fixo" },
      { d: "VTs Regina Pereira Rios", v: 252, c: "gasto_fixo" },
      { d: "Seguro Vida Alexandre", v: 35.75, c: "gasto_fixo" },
      { d: "Terra Provedor internet", v: 48.67, c: "gasto_fixo" },
      { d: "Clube Curitibano", v: 412.50, c: "gasto_fixo" },
      { d: "Augusto — Gestão Administrativa", v: 3000, c: "gasto_fixo" },
      { d: "Cartão Black 6277 Alexandre", v: 15225.94, c: "gasto_variavel" },
      { d: "Reemb Cartão Alexandre", v: 1739.34, c: "gasto_variavel" },
      { d: "Cartão Personalite", v: 249.80, c: "gasto_variavel" },
      { d: "Adto Salário", v: 600, c: "gasto_variavel" },
      { d: "Oclecidio Dias Junior", v: 1500, c: "gasto_variavel" },
      { d: "Regina Pereira Rios — acerto", v: 975, c: "gasto_variavel" },
      { d: "Rescisão Sol", v: 295.59, c: "gasto_variavel" },
      { d: "Salários Chácara (Sueli + Nereu)", v: 3044.96, c: "chacara" },
      { d: "Internet Chácara", v: 249.80, c: "chacara" },
      { d: "Cond Neo sala 712", v: 958.10, c: "braven" },
      { d: "Aporte HSB", v: 16, c: "amah" },
    ],
  },
};

// Evolução patrimonial: investimentos líquidos + saldo em conta
const PATRIM = [
  { month: "Dez/25", val: 12037418.86 + 312717.21 },
  { month: "Jan/26", val: 12594625.77 + 7494.90 },
  { month: "Fev/26", val: 12659781.33 + 8014.45 },
  { month: "Mar/26", val: 12659781.33 + 201111.57 },
];

/* ═══════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

:root {
  --bg: #F7F6F3; --card: #FFFFFF; --card2: #FAFAF8;
  --brd: #E8E5DF; --brd2: #F0EDE8;
  --t1: #1A1A1A; --t2: #6B6560; --t3: #9C9690;
  --acc: #2C5F4A; --accL: #E8F0EC; --accH: #234B3A;
  --red: #B84233; --redL: #FBEAE7;
  --grn: #2C7A50; --grnL: #E6F4EC;
  --fd: 'Playfair Display', Georgia, serif;
  --fb: 'DM Sans', -apple-system, sans-serif;
  --sh: 0 1px 3px rgba(0,0,0,0.04);
  --shm: 0 2px 8px rgba(0,0,0,0.06);
  --r: 10px; --rl: 14px;
}
* { margin:0; padding:0; box-sizing:border-box; }
.dash { font-family: var(--fb); color: var(--t1); background: var(--bg); min-height:100vh; padding-bottom:60px; }

/* Header */
.hdr { background: linear-gradient(135deg, #1A2F26 0%, #2C5F4A 60%, #3A7D62 100%); padding:28px 32px 24px; color:#fff; position:relative; overflow:hidden; }
.hdr::before { content:''; position:absolute; top:-50%; right:-10%; width:400px; height:400px; background:radial-gradient(circle,rgba(255,255,255,.04),transparent 70%); border-radius:50%; }
.hdr-t { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; position:relative; z-index:1; }
.hdr h1 { font-family:var(--fd); font-size:22px; font-weight:600; }
.hdr-s { font-size:13px; opacity:.65; font-weight:300; margin-top:2px; }
.bdg { background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.15); border-radius:20px; padding:6px 14px; font-size:12px; font-weight:500; }
.mnv { display:flex; align-items:center; gap:16px; position:relative; z-index:1; }
.mnv button { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); border-radius:8px; color:#fff; width:34px; height:34px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; transition:.2s; }
.mnv button:hover { background:rgba(255,255,255,.2); }
.mlb { font-family:var(--fd); font-size:17px; font-weight:500; min-width:160px; text-align:center; }

/* Layout */
.ctn { max-width:1120px; margin:0 auto; padding:0 20px; }
.tabs { display:flex; gap:2px; background:var(--card); border:1px solid var(--brd); border-radius:var(--r); padding:4px; margin:20px auto 0; max-width:1160px; overflow-x:auto; box-shadow:var(--sh); padding-left: 20px; padding-right: 20px; }
.tab { flex:1; padding:10px 12px; border:none; background:none; border-radius:7px; font-family:var(--fb); font-size:13px; font-weight:500; color:var(--t2); cursor:pointer; transition:.2s; white-space:nowrap; }
.tab:hover { color:var(--t1); background:var(--card2); }
.tab.on { background:var(--acc); color:#fff; box-shadow:0 1px 3px rgba(44,95,74,.3); }

/* Cards */
.sg { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:20px; }
.sc { background:var(--card); border:1px solid var(--brd); border-radius:var(--rl); padding:18px 20px; box-shadow:var(--sh); transition:.25s; }
.sc:hover { box-shadow:var(--shm); transform:translateY(-1px); }
.sc .lb { font-size:11.5px; font-weight:500; color:var(--t3); text-transform:uppercase; letter-spacing:.6px; margin-bottom:8px; }
.sc .vl { font-family:var(--fd); font-size:20px; font-weight:600; }
.sc .ch { font-size:11px; font-weight:500; margin-top:6px; display:inline-flex; padding:2px 8px; border-radius:12px; }
.pos { color:var(--grn); } .neg { color:var(--red); }
.pos .ch { background:var(--grnL); color:var(--grn); } .neg .ch { background:var(--redL); color:var(--red); }

/* Section */
.sec { margin-top:24px; }
.st { font-family:var(--fd); font-size:17px; font-weight:600; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
.st .ic { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:14px; }

/* Invest cards */
.ig { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }
.ic2 { background:var(--card); border:1px solid var(--brd); border-radius:var(--rl); padding:20px; box-shadow:var(--sh); }
.ic2.tot { background:linear-gradient(135deg,#1A2F26,#2C5F4A); border:none; color:#fff; }
.ic2 .al { font-size:12px; font-weight:500; color:var(--t3); text-transform:uppercase; letter-spacing:.5px; margin-bottom:10px; }
.ic2.tot .al { color:rgba(255,255,255,.6); }
.ic2 .av { font-family:var(--fd); font-size:22px; font-weight:700; }
.ic2 .ad { font-size:11px; color:var(--t3); margin-top:6px; }
.ic2.tot .ad { color:rgba(255,255,255,.5); }

/* Donut + categories */
.cg { display:grid; grid-template-columns:220px 1fr; gap:20px; background:var(--card); border:1px solid var(--brd); border-radius:var(--rl); padding:24px; box-shadow:var(--sh); }
.dc { display:flex; align-items:center; justify-content:center; }
.cl { display:flex; flex-direction:column; gap:6px; }
.ci { display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid var(--brd2); }
.ci:last-child { border-bottom:none; }
.cd { width:10px; height:10px; border-radius:3px; flex-shrink:0; }
.cn { flex:1; font-size:13px; color:var(--t2); }
.cv { font-size:13px; font-weight:600; font-variant-numeric:tabular-nums; }
.cp { font-size:11px; color:var(--t3); width:38px; text-align:right; font-variant-numeric:tabular-nums; }

/* Revenue */
.rc { background:var(--card); border:1px solid var(--brd); border-radius:var(--rl); padding:20px; box-shadow:var(--sh); }
.rgt { font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; color:var(--t3); margin:16px 0 10px; }
.rgt:first-child { margin-top:0; }
.ri { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--brd2); }
.ri:last-child { border-bottom:none; }
.rd { font-size:13px; color:var(--t2); flex:1; }
.rv { font-size:13px; font-weight:600; color:var(--grn); font-variant-numeric:tabular-nums; min-width:100px; text-align:right; }

/* Table */
.tc { background:var(--card); border:1px solid var(--brd); border-radius:var(--rl); box-shadow:var(--sh); overflow:hidden; }
.tt { display:flex; align-items:center; gap:10px; padding:14px 20px; border-bottom:1px solid var(--brd2); flex-wrap:wrap; }
.si { flex:1; min-width:180px; padding:8px 12px; border:1px solid var(--brd); border-radius:7px; font-family:var(--fb); font-size:13px; background:var(--bg); color:var(--t1); outline:none; }
.si:focus { border-color:var(--acc); }
.fb { padding:8px 14px; border:1px solid var(--brd); border-radius:7px; font-family:var(--fb); font-size:12px; font-weight:500; background:var(--bg); color:var(--t2); cursor:pointer; transition:.2s; }
.fb:hover { border-color:var(--acc); color:var(--acc); }
.fb.on { background:var(--acc); color:#fff; border-color:var(--acc); }
.tw { overflow-x:auto; }
table { width:100%; border-collapse:collapse; }
th { text-align:left; padding:10px 20px; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; color:var(--t3); border-bottom:1px solid var(--brd); background:var(--card2); white-space:nowrap; }
td { padding:11px 20px; font-size:13px; border-bottom:1px solid var(--brd2); color:var(--t2); }
tr:hover td { background:rgba(44,95,74,.02); }
.tdv { font-weight:600; font-variant-numeric:tabular-nums; }
.tb { display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; text-transform:uppercase; }
.te { background:var(--grnL); color:var(--grn); } .ts { background:var(--redL); color:var(--red); }

/* Patrimony */
.hc { background:var(--card); border:1px solid var(--brd); border-radius:var(--rl); padding:24px; box-shadow:var(--sh); }
.ps { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
.pc { padding:14px 16px; border-radius:10px; background:var(--card2); border:1px solid var(--brd2); }
.pc .pl { font-size:11px; font-weight:500; color:var(--t3); text-transform:uppercase; letter-spacing:.4px; margin-bottom:6px; }
.pc .pv { font-family:var(--fd); font-size:16px; font-weight:600; }
.pc .pb { font-size:11px; color:var(--t3); margin-top:3px; }
.pc.hi { background:linear-gradient(135deg,#1A2F26,#2C5F4A); border:none; color:#fff; }
.pc.hi .pl { color:rgba(255,255,255,.6); } .pc.hi .pb { color:rgba(255,255,255,.5); }
.lc { position:relative; width:100%; height:280px; }
.lc svg { width:100%; height:100%; }
.empty { text-align:center; padding:40px; color:var(--t3); font-style:italic; }

@media(max-width:768px) {
  .sg,.ps { grid-template-columns:repeat(2,1fr); }
  .ig { grid-template-columns:1fr; }
  .cg { grid-template-columns:1fr; }
  .ctn { padding:0 12px; }
  .hdr { padding:20px 16px 18px; }
  .hdr h1 { font-size:18px; }
  .mlb { font-size:15px; min-width:130px; }
}
@media(max-width:480px) { .sg,.ps { grid-template-columns:1fr 1fr; gap:10px; } }
`;

/* ═══════════════════════════════════════════════
   DONUT CHART
   ═══════════════════════════════════════════════ */
function Donut({ data, size = 180 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  const cx = size / 2, cy = size / 2, r = size * 0.36, sw = size * 0.15;
  let cum = -90;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.filter(d => d.value > 0).map((d, i) => {
        const angle = Math.max((d.value / total) * 360 - 1.5, 0.5);
        const sa = cum + 0.75;
        const sr = (sa * Math.PI) / 180;
        const er = ((sa + angle) * Math.PI) / 180;
        cum += (d.value / total) * 360;
        const x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr);
        const x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er);
        return (
          <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2}`}
            fill="none" stroke={d.color} strokeWidth={sw} strokeLinecap="round" />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#6B6560" fontSize="10" fontFamily="DM Sans">Total</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill="#1A1A1A" fontSize="14" fontWeight="700" fontFamily="Playfair Display">{fmt(total)}</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════ */
export default function Dashboard() {
  const [tab, setTab] = useState("resumo");
  const [month, setMonth] = useState(2);
  const [year, setYear] = useState(2026);
  const [search, setSearch] = useState("");
  const [tf, setTf] = useState("all");

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const fl = FLOW[month] || null;
  const inv = gInv(month, year);
  const totalInv = inv ? inv.itau + inv.btg : 0;

  const catData = useMemo(() => {
    if (!fl) return [];
    return CATEGORIES.map(c => ({ ...c, value: fl.catSaidas[c.key] || 0 }))
      .filter(c => c.value > 0 && c.key !== "aplicacao")
      .sort((a, b) => b.value - a.value);
  }, [fl]);

  const saidasReal = fl ? (fl.saidasTotal - (fl.catSaidas.aplicacao || 0)) : 0;

  const TABS = [
    { k: "resumo", l: "Resumo" },
    { k: "despesas", l: "Despesas" },
    { k: "receitas", l: "Receitas" },
    { k: "movimentacoes", l: "Movimentações" },
    { k: "patrimonio", l: "Evolução Patrimonial" },
  ];

  return (
    <div className="dash">
      <style>{CSS}</style>

      {/* HEADER */}
      <div className="hdr">
        <div className="hdr-t">
          <div>
            <h1>Painel Financeiro — Espólio</h1>
            <div className="hdr-s">Gestão patrimonial e fluxo de caixa</div>
          </div>
          <div className="bdg">ACESSO FAMILIAR</div>
        </div>
        <div className="mnv">
          <button onClick={prev}>‹</button>
          <div className="mlb">{MONTHS_PT[month]} {year}</div>
          <button onClick={next}>›</button>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.k} className={`tab ${tab === t.k ? "on" : ""}`} onClick={() => setTab(t.k)}>{t.l}</button>
        ))}
      </div>

      <div className="ctn">
        {!fl && (
          <div className="sec"><div className="rc"><div className="empty">Sem dados para {MONTHS_PT[month]} {year}</div></div></div>
        )}

        {/* ═══ RESUMO ═══ */}
        {tab === "resumo" && fl && (() => {
          const recOperacional = fl.entradas - (fl.recResumo.invest || 0) - (fl.recResumo.rend || 0);
          const resgate = fl.recResumo.invest || 0;
          const aplicacao = fl.catSaidas.aplicacao || 0;
          const despOperacional = fl.saidasTotal - aplicacao;
          const saldoOperacional = recOperacional - despOperacional;
          return <>
            {/* Fluxo Operacional */}
            <div className="sg">
              <div className="sc">
                <div className="lb">Receitas do Mês</div>
                <div className="vl pos">{fmt(recOperacional)}</div>
                <div className="pos"><span className="ch">▲ aluguéis, Jamra, Dataprom...</span></div>
              </div>
              <div className="sc">
                <div className="lb">Despesas do Mês</div>
                <div className="vl neg">{fmt(despOperacional)}</div>
                <div className="neg"><span className="ch">▼ gastos operacionais</span></div>
              </div>
              <div className="sc">
                <div className="lb">Resultado Operacional</div>
                <div className={`vl ${saldoOperacional >= 0 ? "pos" : "neg"}`}>{fmt(saldoOperacional)}</div>
                <div className={saldoOperacional >= 0 ? "pos" : "neg"}><span className="ch">{saldoOperacional >= 0 ? "▲ superávit" : "▼ déficit"}</span></div>
              </div>
              <div className="sc">
                <div className="lb">Saldo em Conta</div>
                <div className="vl">{fmt(fl.saldoFim)}</div>
                <div style={{ marginTop: 6 }}><span style={{ fontSize: 11, color: "var(--t3)" }}>CC 15078-2</span></div>
              </div>
            </div>

            {/* Movimentações de Investimento — destaque */}
            {(resgate > 0 || aplicacao > 0) && (
              <div className="sec">
                <div className="st"><span className="ic" style={{ background: "#E8F0EC", color: "#2C5F4A" }}>🔄</span>Movimentações de Investimento no Mês</div>
                <div style={{ display: "grid", gridTemplateColumns: resgate > 0 && aplicacao > 0 ? "1fr 1fr 1fr" : resgate > 0 || aplicacao > 0 ? "1fr 1fr" : "1fr", gap: 14 }}>
                  {resgate > 0 && (
                    <div className="sc" style={{ borderLeft: "4px solid #2C7A50", background: "#F5FAF7" }}>
                      <div className="lb">Resgate p/ Conta</div>
                      <div className="vl pos" style={{ fontSize: 18 }}>{fmt(resgate)}</div>
                      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>Saiu do investimento → entrou na CC</div>
                    </div>
                  )}
                  {aplicacao > 0 && (
                    <div className="sc" style={{ borderLeft: "4px solid #6B8E6B", background: "#F5F8F5" }}>
                      <div className="lb">Aplicado no Mês</div>
                      <div className="vl" style={{ fontSize: 18, color: "#6B8E6B" }}>{fmt(aplicacao)}</div>
                      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>Saiu da CC → foi p/ investimento</div>
                    </div>
                  )}
                  {resgate > 0 && aplicacao > 0 && (
                    <div className="sc" style={{ borderLeft: `4px solid ${resgate - aplicacao >= 0 ? "#2C7A50" : "#B84233"}` }}>
                      <div className="lb">Saldo Mov. Investimento</div>
                      <div className={`vl ${resgate - aplicacao >= 0 ? "pos" : "neg"}`} style={{ fontSize: 18 }}>{fmt(resgate - aplicacao)}</div>
                      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>{resgate - aplicacao >= 0 ? "Mais resgate que aplicação" : "Mais aplicação que resgate"}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Investimentos */}
            <div className="sec">
              <div className="st"><span className="ic" style={{ background: "var(--accL)", color: "var(--acc)" }}>💰</span>Investimentos</div>
              <div className="ig">
                <div className="ic2 tot">
                  <div className="al">Consolidado Total</div>
                  <div className="av">{fmt(totalInv)}</div>
                  <div className="ad">{inv ? `Saldo líquido em ${inv.dt}` : "Sem dados"}</div>
                </div>
                {inv && (
                  <>
                    <div className="ic2">
                      <div className="al">CC 15078-2 (Itaú)</div>
                      <div className="av" style={{ fontSize: 19 }}>{fmt(inv.itau)}</div>
                      <div className="ad">Saldo líquido</div>
                    </div>
                    <div className="ic2">
                      <div className="al">CC 08688424 (BTG)</div>
                      <div className="av" style={{ fontSize: 19 }}>{fmt(inv.btg)}</div>
                      <div className="ad">Saldo líquido</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Categorias */}
            <div className="sec">
              <div className="st"><span className="ic" style={{ background: "var(--redL)", color: "var(--red)" }}>📊</span>Despesas por Categoria (s/ aplicação)</div>
              {catData.length > 0 ? (
                <div className="cg">
                  <div className="dc"><Donut data={catData} /></div>
                  <div className="cl">
                    {catData.map((c, i) => (
                      <div className="ci" key={i}>
                        <div className="cd" style={{ background: c.color }} />
                        <div className="cn">{c.label}</div>
                        <div className="cv">{fmt(c.value)}</div>
                        <div className="cp">{((c.value / saidasReal) * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <div className="rc"><div className="empty">Nenhuma despesa neste mês</div></div>}
            </div>
          </>;
        })()}

        {/* ═══ DESPESAS ═══ */}
        {tab === "despesas" && fl && (
          <div className="sec" style={{ marginTop: 20 }}>
            <div className="st"><span className="ic" style={{ background: "var(--redL)", color: "var(--red)" }}>📋</span>Despesas — {MONTHS_PT[month]} {year}</div>
            
            {/* Cards por categoria */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
              {catData.map((c, i) => (
                <div key={i} className="sc" style={{ borderLeft: `4px solid ${c.color}` }}>
                  <div className="lb">{c.label}</div>
                  <div className="vl neg" style={{ fontSize: 18 }}>{fmt(c.value)}</div>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>{((c.value / saidasReal) * 100).toFixed(1)}% do total</div>
                </div>
              ))}
              {(fl.catSaidas.aplicacao || 0) > 0 && (
                <div className="sc" style={{ borderLeft: "4px solid #6B8E6B" }}>
                  <div className="lb">Aplicação Financeira</div>
                  <div className="vl" style={{ fontSize: 18, color: "#6B8E6B" }}>{fmt(fl.catSaidas.aplicacao)}</div>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>Movimentação p/ investimento</div>
                </div>
              )}
            </div>

            {/* Tabela detalhada */}
            <div className="tc"><div className="tw">
              <table>
                <thead><tr><th>Descrição</th><th>Categoria</th><th style={{ textAlign: "right" }}>Valor</th></tr></thead>
                <tbody>
                  {fl.despesas.filter(e => e.c !== "aplicacao").map((e, i) => {
                    const cat = CATEGORIES.find(c => c.key === e.c);
                    return (
                      <tr key={i}>
                        <td>{e.d}</td>
                        <td><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: cat?.color || "#ccc" }} />
                          {cat?.label || e.c}
                        </span></td>
                        <td className="tdv neg" style={{ textAlign: "right" }}>{fmt(e.v)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div></div>
          </div>
        )}

        {/* ═══ RECEITAS ═══ */}
        {tab === "receitas" && fl && (
          <div className="sec" style={{ marginTop: 20 }}>
            <div className="st"><span className="ic" style={{ background: "var(--grnL)", color: "var(--grn)" }}>📈</span>Receitas — {MONTHS_PT[month]} {year}</div>
            <div className="sg" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
              <div className="sc"><div className="lb">Aluguéis</div><div className="vl pos" style={{ fontSize: 17 }}>{fmt(fl.recResumo.alugueis)}</div></div>
              <div className="sc"><div className="lb">Jamra + Hidrelétrica</div><div className="vl pos" style={{ fontSize: 17 }}>{fmt(fl.recResumo.jamra + fl.recResumo.hidrel)}</div></div>
              <div className="sc"><div className="lb">Dataprom</div><div className="vl pos" style={{ fontSize: 17 }}>{fmt(fl.recResumo.dataprom)}</div></div>
            </div>
            <div className="rc">
              <div className="rgt">Aluguéis de Imóveis</div>
              {fl.receitas.filter(r => r.g === "Aluguel").map((r, i) => (
                <div className="ri" key={i}><div className="rd">{r.d}</div><div className="rv">{fmt(r.v)}</div></div>
              ))}
              <div className="rgt">Outras Receitas</div>
              {fl.receitas.filter(r => r.g !== "Aluguel").map((r, i) => (
                <div className="ri" key={i}><div className="rd">{r.d} <span style={{ fontSize: 11, color: "var(--t3)" }}>({r.g})</span></div><div className="rv">{fmt(r.v)}</div></div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ MOVIMENTAÇÕES ═══ */}
        {tab === "movimentacoes" && fl && (
          <div className="sec" style={{ marginTop: 20 }}>
            <div className="st"><span className="ic" style={{ background: "#FDF6E3", color: "#C49B1A" }}>📄</span>Movimentações — {MONTHS_PT[month]} {year}</div>
            <div className="tc">
              <div className="tt">
                <input className="si" placeholder="Buscar por descrição..." value={search} onChange={e => setSearch(e.target.value)} />
                <button className={`fb ${tf === "all" ? "on" : ""}`} onClick={() => setTf("all")}>Todos</button>
                <button className={`fb ${tf === "e" ? "on" : ""}`} onClick={() => setTf("e")}>Entradas</button>
                <button className={`fb ${tf === "s" ? "on" : ""}`} onClick={() => setTf("s")}>Saídas</button>
              </div>
              <div className="tw">
                <table>
                  <thead><tr><th>Tipo</th><th>Descrição</th><th>Categoria</th><th style={{ textAlign: "right" }}>Valor</th></tr></thead>
                  <tbody>
                    {tf !== "s" && fl.receitas
                      .filter(r => !search || r.d.toLowerCase().includes(search.toLowerCase()))
                      .map((r, i) => (
                        <tr key={`e${i}`}>
                          <td><span className="tb te">Entrada</span></td>
                          <td>{r.d}</td>
                          <td style={{ color: "var(--t3)" }}>{r.g}</td>
                          <td className="tdv pos" style={{ textAlign: "right" }}>{fmt(r.v)}</td>
                        </tr>
                      ))}
                    {tf !== "e" && fl.despesas
                      .filter(r => !search || r.d.toLowerCase().includes(search.toLowerCase()))
                      .map((r, i) => {
                        const cat = CATEGORIES.find(c => c.key === r.c);
                        return (
                          <tr key={`s${i}`}>
                            <td><span className="tb ts">Saída</span></td>
                            <td>{r.d}</td>
                            <td><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <span style={{ width: 8, height: 8, borderRadius: 2, background: cat?.color || "#ccc" }} />
                              {cat?.label || r.c}
                            </span></td>
                            <td className="tdv neg" style={{ textAlign: "right" }}>- {fmt(r.v)}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ EVOLUÇÃO PATRIMONIAL ═══ */}
        {tab === "patrimonio" && (() => {
          const data = PATRIM;
          const mn = Math.min(...data.map(d => d.val));
          const mx = Math.max(...data.map(d => d.val));
          const rng = mx - mn || 1;
          const pL = 60, pR = 30, pT = 40, pB = 40, W = 700, H = 280;
          const cW = W - pL - pR, cH = H - pT - pB;
          const pts = data.map((d, i) => ({
            x: pL + (i / (data.length - 1)) * cW,
            y: pT + cH - ((d.val - mn) / rng) * cH,
            ...d,
          }));
          const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
          const area = line + ` L ${pts[pts.length - 1].x} ${pT + cH} L ${pts[0].x} ${pT + cH} Z`;
          const first = data[0].val, last = data[data.length - 1].val;
          const diff = last - first, pct = ((diff / first) * 100).toFixed(2);
          const yN = 4;
          const yL = Array.from({ length: yN + 1 }, (_, i) => ({
            val: mn + (rng / yN) * i,
            y: pT + cH - (i / yN) * cH,
          }));

          return (
            <div className="sec" style={{ marginTop: 20 }}>
              <div className="st"><span className="ic" style={{ background: "var(--accL)", color: "var(--acc)" }}>📈</span>Evolução Patrimonial — 2026</div>
              <div className="ps">
                <div className="pc hi"><div className="pl">Patrimônio Atual</div><div className="pv">{fmt(last)}</div><div className="pb">Mar/2026</div></div>
                <div className="pc"><div className="pl">Patrimônio Inicial</div><div className="pv">{fmt(first)}</div><div className="pb">Dez/2025</div></div>
                <div className="pc"><div className="pl">Variação R$</div><div className={`pv ${diff >= 0 ? "pos" : "neg"}`}>{diff >= 0 ? "+" : ""}{fmt(diff)}</div><div className="pb">Acumulado</div></div>
                <div className="pc"><div className="pl">Variação %</div><div className={`pv ${diff >= 0 ? "pos" : "neg"}`}>{diff >= 0 ? "+" : ""}{pct}%</div><div className="pb">Desde dez/2025</div></div>
              </div>
              <div className="hc">
                <div className="lc">
                  <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
                    {yL.map((yl, i) => (
                      <g key={i}>
                        <line x1={pL} y1={yl.y} x2={W - pR} y2={yl.y} stroke="#E8E5DF" strokeWidth="1" strokeDasharray={i === 0 ? "0" : "4,3"} />
                        <text x={pL - 8} y={yl.y + 4} textAnchor="end" fill="#9C9690" fontSize="9" fontFamily="DM Sans">{(yl.val / 1000000).toFixed(1)}M</text>
                      </g>
                    ))}
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2C5F4A" stopOpacity=".15" />
                        <stop offset="100%" stopColor="#2C5F4A" stopOpacity=".01" />
                      </linearGradient>
                    </defs>
                    <path d={area} fill="url(#ag)" />
                    <path d={line} fill="none" stroke="#2C5F4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#2C5F4A" stroke="#fff" strokeWidth="2.5" />
                        <text x={p.x} y={p.y - 14} textAnchor="middle" fill="#1A1A1A" fontSize="10" fontWeight="600" fontFamily="DM Sans">{fmt(p.val)}</text>
                        <text x={p.x} y={pT + cH + 18} textAnchor="middle" fill="#9C9690" fontSize="10" fontFamily="DM Sans">{p.month}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
              <div className="tc" style={{ marginTop: 16 }}>
                <div style={{ padding: "16px 20px 0", fontFamily: "var(--fd)", fontSize: 15, fontWeight: 600 }}>Composição da Variação por Mês</div>
                <div style={{ padding: "4px 20px 8px", fontSize: 12, color: "var(--t3)" }}>O que é rendimento vs. o que veio/saiu da conta corrente</div>
                <div className="tw">
                  <table>
                    <thead><tr><th>Mês</th><th style={{ textAlign: "right" }}>Aportes (CC → Invest.)</th><th style={{ textAlign: "right" }}>Resgates (Invest. → CC)</th><th style={{ textAlign: "right" }}>Rendimento</th><th style={{ textAlign: "right" }}>Saldo Invest.</th></tr></thead>
                    <tbody>
                      {[
                        { m: "Dez/25", ap: "—", res: "—", rend: "—", saldo: fmt(12037418.86) },
                        { m: "Jan/26", ap: fmt(430000), res: fmt(25195.01), rend: fmt(104149.97 + 60405.95), saldo: fmt(12594625.77), apN: 430000, resN: 25195.01, rendN: 164555.92 },
                        { m: "Fev/26", ap: fmt(1120000), res: fmt(1139781.33), rend: fmt(66196.30 + 22142.44), saldo: fmt(12659781.33), apN: 1120000, resN: 1139781.33, rendN: 88338.74 },
                        { m: "Mar/26", ap: "—", res: "—", rend: "Mês não fechou", saldo: fmt(12659781.33) + " *" },
                      ].map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{r.m}</td>
                          <td className="tdv" style={{ textAlign: "right", color: r.apN ? "var(--red)" : "var(--t3)" }}>{r.ap}</td>
                          <td className="tdv" style={{ textAlign: "right", color: r.resN ? "var(--grn)" : "var(--t3)" }}>{r.res}</td>
                          <td className="tdv pos" style={{ textAlign: "right" }}>{r.rend}</td>
                          <td className="tdv" style={{ textAlign: "right" }}>{r.saldo}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: "2px solid var(--brd)" }}>
                        <td style={{ fontWeight: 600 }}>Acumulado</td>
                        <td className="tdv neg" style={{ textAlign: "right" }}>{fmt(1550000)}</td>
                        <td className="tdv pos" style={{ textAlign: "right" }}>{fmt(1164976.34)}</td>
                        <td className="tdv pos" style={{ textAlign: "right", fontWeight: 700 }}>{fmt(252894.66)}</td>
                        <td className="tdv" style={{ textAlign: "right" }}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: "8px 20px 16px", fontSize: 11, color: "var(--t3)" }}>
                  * Mar/26: extrato ainda não fechou — usando saldo de Fev/26. Rendimento Itaú inclui juros pós-fixados, multimercados e inflação. BTG inclui fundos Absolute e Empiricus.
                </div>
              </div>

              <div className="tc" style={{ marginTop: 16 }}>
                <div style={{ padding: "16px 20px 0", fontFamily: "var(--fd)", fontSize: 15, fontWeight: 600 }}>Evolução do Patrimônio Total</div>
                <div style={{ padding: "4px 20px 8px", fontSize: 12, color: "var(--t3)" }}>Investimentos (líquido) + saldo em conta corrente</div>
                <div className="tw">
                  <table>
                    <thead><tr><th>Mês</th><th style={{ textAlign: "right" }}>Patrimônio Total</th><th style={{ textAlign: "right" }}>Variação</th><th style={{ textAlign: "right" }}>%</th></tr></thead>
                    <tbody>
                      {data.map((d, i) => {
                        const p = i > 0 ? data[i - 1].val : d.val;
                        const v = d.val - p;
                        const vp = p > 0 ? ((v / p) * 100).toFixed(2) : "0";
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{d.month}</td>
                            <td className="tdv" style={{ textAlign: "right" }}>{fmt(d.val)}</td>
                            <td className={`tdv ${v >= 0 ? "pos" : "neg"}`} style={{ textAlign: "right" }}>
                              {i === 0 ? "—" : `${v >= 0 ? "+" : ""}${fmt(v)}`}
                            </td>
                            <td className={`tdv ${v >= 0 ? "pos" : "neg"}`} style={{ textAlign: "right" }}>
                              {i === 0 ? "—" : `${v >= 0 ? "+" : ""}${vp}%`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
