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

const INV = {
  "2025-12": { itau: 7968210.93, btg: 4069207.93, dt: "31/12/2025" },
  "2026-01": { itau: 8465011.89, btg: 4129613.88, dt: "31/01/2026" },
  "2026-02": { itau: 8508025.01, btg: 4151756.32, dt: "28/02/2026" },
};
const gInv = (m, y) => INV[`${y}-${String(m + 1).padStart(2, "0")}`] || null;

const FLOW = {
  0: {
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
  1: {
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
  2: {
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

// Inventário histórico (fixo)
const INV_HIST = { 2024: 734305.78, 2025: 5974332.25 };

// 2026: inventário (ITCMD/custas) + outros (advogados) — atualizado conforme meses fecham
const TOTAL_INVENTARIO_2026 = Object.values(FLOW).reduce((s, m) => s + (m.catSaidas.inventario || 0) + (m.catSaidas.outros || 0), 0);

const TOTAL_INVENTARIO_GERAL = INV_HIST[2024] + INV_HIST[2025] + TOTAL_INVENTARIO_2026;

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
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@400;500;600;700&display=swap');

:root {
  --bg: #F3F2EF;
  --card: #FFFFFF;
  --card2: #FAFAF8;
  --brd: #E5E2DC;
  --brd2: #EDEBE6;
  --t1: #18181B;
  --t2: #52504B;
  --t3: #9B9690;
  --acc: #1E4D3A;
  --accM: #2C6B52;
  --accL: #E4EFE9;
  --accH: #163829;
  --red: #B03A2E;
  --redL: #FAE9E7;
  --grn: #1E6B42;
  --grnL: #E4F0E9;
  --amb: #A0621A;
  --ambL: #FDF3E3;
  --tel: #0E7490;
  --telL: #E0F5FA;
  --fd: 'Playfair Display', Georgia, serif;
  --fb: 'DM Sans', -apple-system, sans-serif;
  --sh: 0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03);
  --shm: 0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
  --r: 12px;
  --rl: 16px;
}

* { margin:0; padding:0; box-sizing:border-box; }

.dash {
  font-family: var(--fb);
  color: var(--t1);
  background: var(--bg);
  min-height: 100vh;
  padding-bottom: 80px;
}

/* ── Header ── */
.hdr {
  background: linear-gradient(160deg, #142D22 0%, #1E4D3A 45%, #2C6B52 100%);
  padding: 32px 36px 28px;
  color: #fff;
  position: relative;
  overflow: hidden;
}
.hdr::before {
  content: '';
  position: absolute;
  top: -80px; right: -60px;
  width: 340px; height: 340px;
  background: radial-gradient(circle, rgba(255,255,255,.05) 0%, transparent 65%);
  border-radius: 50%;
}
.hdr::after {
  content: '';
  position: absolute;
  bottom: -40px; left: 30%;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,.03) 0%, transparent 65%);
  border-radius: 50%;
}
.hdr-t {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}
.hdr-logo {
  display: flex;
  align-items: center;
  gap: 14px;
}
.hdr-icon {
  width: 42px; height: 42px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.hdr h1 {
  font-family: var(--fd);
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -.2px;
}
.hdr-s {
  font-size: 12.5px;
  opacity: .55;
  font-weight: 400;
  margin-top: 3px;
  letter-spacing: .1px;
}
.bdg {
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 20px;
  padding: 5px 13px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .5px;
  text-transform: uppercase;
}
.mnv {
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
  z-index: 1;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 10px;
  overflow: hidden;
  width: fit-content;
}
.mnv button {
  background: transparent;
  border: none;
  color: rgba(255,255,255,.8);
  width: 38px; height: 38px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: .15s;
}
.mnv button:hover { background: rgba(255,255,255,.12); color: #fff; }
.mlb {
  font-family: var(--fd);
  font-size: 15px;
  font-weight: 500;
  min-width: 170px;
  text-align: center;
  padding: 0 4px;
  border-left: 1px solid rgba(255,255,255,.1);
  border-right: 1px solid rgba(255,255,255,.1);
  line-height: 38px;
}

/* ── Tabs ── */
.tabs-wrap {
  background: var(--card);
  border-bottom: 1px solid var(--brd);
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  position: sticky;
  top: 0;
  z-index: 10;
}
.tabs {
  display: flex;
  gap: 0;
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 20px;
  overflow-x: auto;
}
.tab {
  padding: 14px 18px;
  border: none;
  background: none;
  border-bottom: 2px solid transparent;
  font-family: var(--fb);
  font-size: 13px;
  font-weight: 500;
  color: var(--t3);
  cursor: pointer;
  transition: .15s;
  white-space: nowrap;
  margin-bottom: -1px;
}
.tab:hover { color: var(--t2); }
.tab.on { color: var(--acc); border-bottom-color: var(--acc); font-weight: 600; }

/* ── Layout ── */
.ctn { max-width: 1140px; margin: 0 auto; padding: 0 20px; }
.sec { margin-top: 28px; }
.sec-hd {
  font-family: var(--fd);
  font-size: 16px;
  font-weight: 600;
  color: var(--t1);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.sec-ic {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

/* ── Summary cards (top row) ── */
.sg { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-top: 24px; }

.sc {
  background: var(--card);
  border: 1px solid var(--brd);
  border-radius: var(--rl);
  padding: 20px 22px;
  box-shadow: var(--sh);
  transition: .2s;
  position: relative;
  overflow: hidden;
}
.sc::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--brd2);
  border-radius: var(--rl) var(--rl) 0 0;
}
.sc.c-grn::before { background: var(--grn); }
.sc.c-red::before { background: var(--red); }
.sc.c-acc::before { background: var(--acc); }
.sc.c-amb::before { background: var(--amb); }
.sc.c-tel::before { background: var(--tel); }

.sc:hover { box-shadow: var(--shm); transform: translateY(-1px); }
.sc .lb {
  font-size: 11px;
  font-weight: 600;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: .7px;
  margin-bottom: 10px;
}
.sc .vl {
  font-family: var(--fd);
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -.3px;
  line-height: 1.1;
}
.sc .sub {
  font-size: 11px;
  color: var(--t3);
  margin-top: 7px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.pos { color: var(--grn); }
.neg { color: var(--red); }
.pill-grn { background: var(--grnL); color: var(--grn); }
.pill-red { background: var(--redL); color: var(--red); }
.pill-acc { background: var(--accL); color: var(--acc); }

/* ── Inventory highlight card ── */
.inv-card {
  background: linear-gradient(135deg, #0F2D22 0%, #1E4D3A 100%);
  border-radius: var(--rl);
  padding: 22px 24px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(30,77,58,.25);
  margin-top: 14px;
}
.inv-card .inv-left {}
.inv-card .inv-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .6px;
  text-transform: uppercase;
  opacity: .6;
  margin-bottom: 8px;
}
.inv-card .inv-val {
  font-family: var(--fd);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -.5px;
}
.inv-card .inv-sub {
  font-size: 12px;
  opacity: .5;
  margin-top: 6px;
}
.inv-card .inv-right {
  text-align: right;
  flex-shrink: 0;
}
.inv-card .inv-months {
  display: flex;
  gap: 10px;
}
.inv-month {
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px;
  padding: 10px 14px;
  text-align: center;
}
.inv-month .im-label { font-size: 10px; opacity: .55; font-weight: 500; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 5px; }
.inv-month .im-val { font-family: var(--fd); font-size: 15px; font-weight: 600; }

/* ── Invest section ── */
.ig { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
.ic2 {
  background: var(--card);
  border: 1px solid var(--brd);
  border-radius: var(--rl);
  padding: 22px;
  box-shadow: var(--sh);
}
.ic2.tot {
  background: linear-gradient(135deg, #1A2F26, #2C5F4A);
  border: none;
  color: #fff;
  box-shadow: 0 4px 16px rgba(28,64,46,.3);
}
.ic2 .al {
  font-size: 11px;
  font-weight: 600;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 12px;
}
.ic2.tot .al { color: rgba(255,255,255,.55); }
.ic2 .av { font-family: var(--fd); font-size: 24px; font-weight: 700; }
.ic2 .ad { font-size: 11px; color: var(--t3); margin-top: 6px; }
.ic2.tot .ad { color: rgba(255,255,255,.45); }

/* ── Donut + categories ── */
.cg {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  background: var(--card);
  border: 1px solid var(--brd);
  border-radius: var(--rl);
  padding: 26px;
  box-shadow: var(--sh);
}
.dc { display: flex; align-items: center; justify-content: center; }
.cl { display: flex; flex-direction: column; gap: 2px; }
.ci {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  transition: .15s;
}
.ci:hover { background: var(--card2); }
.cd { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.cn { flex: 1; font-size: 13px; color: var(--t2); }
.cv { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.cp { font-size: 11px; color: var(--t3); width: 40px; text-align: right; font-variant-numeric: tabular-nums; }

/* ── Mov. Investimento ── */
.mov-grid {
  display: grid;
  gap: 14px;
}

/* ── Revenue cards ── */
.rc {
  background: var(--card);
  border: 1px solid var(--brd);
  border-radius: var(--rl);
  padding: 22px;
  box-shadow: var(--sh);
}
.rgt {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .6px;
  color: var(--t3);
  margin: 20px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--brd2);
}
.rgt:first-child { margin-top: 0; }
.ri {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px solid var(--brd2);
  gap: 12px;
}
.ri:last-child { border-bottom: none; }
.rd { font-size: 13px; color: var(--t2); flex: 1; }
.rv { font-size: 13.5px; font-weight: 700; color: var(--grn); font-variant-numeric: tabular-nums; min-width: 110px; text-align: right; }

/* ── Table ── */
.tc {
  background: var(--card);
  border: 1px solid var(--brd);
  border-radius: var(--rl);
  box-shadow: var(--sh);
  overflow: hidden;
}
.tt {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--brd2);
  flex-wrap: wrap;
  background: var(--card2);
}
.si {
  flex: 1;
  min-width: 180px;
  padding: 8px 12px;
  border: 1px solid var(--brd);
  border-radius: 8px;
  font-family: var(--fb);
  font-size: 13px;
  background: var(--card);
  color: var(--t1);
  outline: none;
}
.si:focus { border-color: var(--acc); box-shadow: 0 0 0 3px var(--accL); }
.fb {
  padding: 7px 14px;
  border: 1px solid var(--brd);
  border-radius: 8px;
  font-family: var(--fb);
  font-size: 12px;
  font-weight: 500;
  background: var(--card);
  color: var(--t2);
  cursor: pointer;
  transition: .15s;
}
.fb:hover { border-color: var(--acc); color: var(--acc); }
.fb.on { background: var(--acc); color: #fff; border-color: var(--acc); }
.tw { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th {
  text-align: left;
  padding: 11px 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--t3);
  border-bottom: 1px solid var(--brd);
  background: var(--card2);
  white-space: nowrap;
}
td {
  padding: 12px 20px;
  font-size: 13px;
  border-bottom: 1px solid var(--brd2);
  color: var(--t2);
}
tr:last-child td { border-bottom: none; }
tr:hover td { background: rgba(44,95,74,.02); }
.tdv { font-weight: 700; font-variant-numeric: tabular-nums; }
.tb { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .3px; }
.te { background: var(--grnL); color: var(--grn); }
.ts { background: var(--redL); color: var(--red); }

/* ── Patrimony ── */
.hc {
  background: var(--card);
  border: 1px solid var(--brd);
  border-radius: var(--rl);
  padding: 26px;
  box-shadow: var(--sh);
}
.ps { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
.pc {
  padding: 16px 18px;
  border-radius: 12px;
  background: var(--card);
  border: 1px solid var(--brd);
  box-shadow: var(--sh);
}
.pc .pl { font-size: 11px; font-weight: 600; color: var(--t3); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }
.pc .pv { font-family: var(--fd); font-size: 18px; font-weight: 700; }
.pc .pb { font-size: 11px; color: var(--t3); margin-top: 4px; }
.pc.hi { background: linear-gradient(135deg, #1A2F26, #2C5F4A); border: none; color: #fff; box-shadow: 0 4px 16px rgba(28,64,46,.25); }
.pc.hi .pl { color: rgba(255,255,255,.55); }
.pc.hi .pb { color: rgba(255,255,255,.45); }
.lc { position: relative; width: 100%; height: 280px; }
.lc svg { width: 100%; height: 100%; }
.empty { text-align: center; padding: 48px; color: var(--t3); font-style: italic; font-size: 14px; }

/* ── Cat cards (despesas) ── */
.cat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 20px; }
.cat-card {
  background: var(--card);
  border: 1px solid var(--brd);
  border-left: 4px solid transparent;
  border-radius: var(--rl);
  padding: 18px 20px;
  box-shadow: var(--sh);
  transition: .2s;
}
.cat-card:hover { box-shadow: var(--shm); transform: translateY(-1px); }
.cat-card .lb { font-size: 11px; font-weight: 600; color: var(--t3); text-transform: uppercase; letter-spacing: .6px; margin-bottom: 10px; }
.cat-card .vl { font-family: var(--fd); font-size: 20px; font-weight: 700; color: var(--red); }
.cat-card .pct { font-size: 12px; color: var(--t3); margin-top: 5px; font-weight: 500; }

/* ── Receitas summary ── */
.rec-sg { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 20px; }

@media(max-width:900px) {
  .sg, .ps { grid-template-columns: repeat(2,1fr); }
  .ig { grid-template-columns: 1fr; }
  .cg { grid-template-columns: 1fr; }
  .cat-grid { grid-template-columns: repeat(2,1fr); }
  .rec-sg { grid-template-columns: repeat(2,1fr); }
  .inv-card { flex-direction: column; }
  .inv-card .inv-right { text-align: left; }
}
@media(max-width:600px) {
  .sg, .ps { grid-template-columns: 1fr 1fr; gap: 10px; }
  .cat-grid { grid-template-columns: 1fr 1fr; }
  .ctn { padding: 0 14px; }
  .hdr { padding: 22px 18px 20px; }
  .hdr h1 { font-size: 18px; }
  .mlb { font-size: 14px; min-width: 140px; }
  .inv-months { flex-direction: column !important; }
}
`;

/* ═══════════════════════════════════════════════
   PIE CHART (despesas)
   ═══════════════════════════════════════════════ */
function PieChart({ data, size = 320 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  const cx = size / 2, cy = size / 2, r = size * 0.42;
  let cum = -90;
  const slices = data.filter(d => d.value > 0).map(d => {
    const angle = (d.value / total) * 360;
    const sa = cum, ea = cum + angle;
    const sr = (sa * Math.PI) / 180, er = (ea * Math.PI) / 180;
    const x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr);
    const x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er);
    const mid = (sa + ea) / 2;
    const mr = (mid * Math.PI) / 180;
    const lx = cx + r * 0.65 * Math.cos(mr), ly = cy + r * 0.65 * Math.sin(mr);
    cum += angle;
    return { ...d, x1, y1, x2, y2, lx, ly, angle, pct: ((d.value / total) * 100).toFixed(1) };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i}
          d={`M ${cx} ${cy} L ${s.x1} ${s.y1} A ${r} ${r} 0 ${s.angle > 180 ? 1 : 0} 1 ${s.x2} ${s.y2} Z`}
          fill={s.color} stroke="#fff" strokeWidth="2" />
      ))}
      {slices.filter(s => s.angle > 18).map((s, i) => (
        <text key={i} x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
          fill="#fff" fontSize="11" fontWeight="700" fontFamily="DM Sans">{s.pct}%</text>
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   DONUT CHART
   ═══════════════════════════════════════════════ */
function Donut({ data, size = 176 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  const cx = size / 2, cy = size / 2, r = size * 0.355, sw = size * 0.16;
  let cum = -90;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r + sw / 2 + 2} fill="none" stroke="#F3F2EF" strokeWidth={sw + 4} />
      {data.filter(d => d.value > 0).map((d, i) => {
        const angle = Math.max((d.value / total) * 360 - 1.5, 0.5);
        const sa = cum + 0.75;
        const sr = (sa * Math.PI) / 180;
        const er = ((sa + angle) * Math.PI) / 180;
        cum += (d.value / total) * 360;
        const x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr);
        const x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er);
        return (
          <path key={i}
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2}`}
            fill="none" stroke={d.color} strokeWidth={sw} strokeLinecap="round" />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#9B9690" fontSize="10" fontFamily="DM Sans" fontWeight="600" letterSpacing=".5">TOTAL</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#18181B" fontSize="13" fontWeight="700" fontFamily="Playfair Display">{fmt(total)}</text>
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
          <div className="hdr-logo">
            <div className="hdr-icon">🏛️</div>
            <div>
              <h1>Painel Financeiro — Espólio</h1>
              <div className="hdr-s">Gestão patrimonial e fluxo de caixa · 2026</div>
            </div>
          </div>
          <div className="bdg">Acesso Familiar</div>
        </div>
        <div className="mnv">
          <button onClick={prev}>‹</button>
          <div className="mlb">{MONTHS_PT[month]} {year}</div>
          <button onClick={next}>›</button>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-wrap">
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.k} className={`tab ${tab === t.k ? "on" : ""}`} onClick={() => setTab(t.k)}>
              {t.l}
            </button>
          ))}
        </div>
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

          // Inventário: mês atual e acumulado
          const invMes = fl.catSaidas.inventario || 0;

          return <>
            {/* Cards topo */}
            <div className="sg">
              <div className="sc c-grn">
                <div className="lb">Receitas do Mês</div>
                <div className="vl pos">{fmt(recOperacional)}</div>
                <div className="sub">
                  <span className="pill pill-grn">aluguéis, Jamra, Dataprom</span>
                </div>
              </div>
              <div className="sc c-red">
                <div className="lb">Despesas do Mês</div>
                <div className="vl neg">{fmt(despOperacional)}</div>
                <div className="sub">
                  <span className="pill pill-red">gastos operacionais</span>
                </div>
              </div>
              <div className={`sc ${saldoOperacional >= 0 ? "c-grn" : "c-red"}`}>
                <div className="lb">Resultado Operacional</div>
                <div className={`vl ${saldoOperacional >= 0 ? "pos" : "neg"}`}>{fmt(saldoOperacional)}</div>
                <div className="sub">
                  <span className={`pill ${saldoOperacional >= 0 ? "pill-grn" : "pill-red"}`}>
                    {saldoOperacional >= 0 ? "▲ superávit" : "▼ déficit"}
                  </span>
                </div>
              </div>
              <div className="sc c-acc">
                <div className="lb">Saldo em Conta</div>
                <div className="vl">{fmt(fl.saldoFim)}</div>
                <div className="sub" style={{ color: "var(--t3)" }}>CC 15078-2 · Itaú</div>
              </div>
            </div>

            {/* Movimentações de Investimento */}
            {(resgate > 0 || aplicacao > 0) && (
              <div className="sec">
                <div className="sec-hd">
                  <span className="sec-ic" style={{ background: "#E4EFE9", color: "#1E4D3A" }}>🔄</span>
                  Movimentações de Investimento no Mês
                </div>
                <div className="mov-grid" style={{ gridTemplateColumns: resgate > 0 && aplicacao > 0 ? "1fr 1fr 1fr" : "1fr 1fr" }}>
                  {resgate > 0 && (
                    <div className="sc c-grn">
                      <div className="lb">Resgate p/ Conta</div>
                      <div className="vl pos" style={{ fontSize: 18 }}>{fmt(resgate)}</div>
                      <div className="sub">Investimento → Conta Corrente</div>
                    </div>
                  )}
                  {aplicacao > 0 && (
                    <div className="sc" style={{ borderTop: "3px solid #6B8E6B" }}>
                      <div className="lb">Aplicado no Mês</div>
                      <div className="vl" style={{ fontSize: 18, color: "#6B8E6B" }}>{fmt(aplicacao)}</div>
                      <div className="sub">Conta Corrente → Investimento</div>
                    </div>
                  )}
                  {resgate > 0 && aplicacao > 0 && (
                    <div className={`sc ${resgate - aplicacao >= 0 ? "c-grn" : "c-red"}`}>
                      <div className="lb">Saldo Mov. Investimento</div>
                      <div className={`vl ${resgate - aplicacao >= 0 ? "pos" : "neg"}`} style={{ fontSize: 18 }}>{fmt(resgate - aplicacao)}</div>
                      <div className="sub">{resgate - aplicacao >= 0 ? "Mais resgate que aplicação" : "Mais aplicação que resgate"}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Investimentos */}
            <div className="sec">
              <div className="sec-hd">
                <span className="sec-ic" style={{ background: "var(--accL)", color: "var(--acc)" }}>💰</span>
                Carteiras de Investimento
              </div>
              <div className="ig">
                <div className="ic2 tot">
                  <div className="al">Consolidado Total</div>
                  <div className="av">{fmt(totalInv)}</div>
                  <div className="ad">{inv ? `Saldo líquido · ${inv.dt}` : "Dados não disponíveis"}</div>
                </div>
                {inv ? (
                  <>
                    <div className="ic2">
                      <div className="al">CC 15078-2 · Itaú</div>
                      <div className="av" style={{ fontSize: 20 }}>{fmt(inv.itau)}</div>
                      <div className="ad">Saldo líquido de investimentos</div>
                    </div>
                    <div className="ic2">
                      <div className="al">CC 08688424 · BTG</div>
                      <div className="av" style={{ fontSize: 20 }}>{fmt(inv.btg)}</div>
                      <div className="ad">Saldo líquido de investimentos</div>
                    </div>
                  </>
                ) : (
                  <div className="ic2" style={{ gridColumn: "span 2" }}>
                    <div className="empty">Dados de investimento não disponíveis para este mês</div>
                  </div>
                )}
              </div>
            </div>

            {/* Categorias de despesa */}
            <div className="sec">
              <div className="sec-hd">
                <span className="sec-ic" style={{ background: "var(--redL)", color: "var(--red)" }}>📊</span>
                Despesas por Categoria (excl. aplicações)
              </div>
              {catData.length > 0 ? (
                <div className="rc">
                  <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 32, alignItems: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <PieChart data={catData} size={280} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {catData.map((c, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, transition: ".15s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <div style={{ width: 12, height: 12, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                          <div style={{ flex: 1, fontSize: 13, color: "var(--t2)", fontFamily: "var(--fb)" }}>{c.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", fontFamily: "var(--fb)" }}>{fmt(c.value)}</div>
                          <div style={{ fontSize: 12, color: "var(--t3)", width: 42, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{((c.value / saidasReal) * 100).toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : <div className="rc"><div className="empty">Nenhuma despesa registrada neste mês</div></div>}
            </div>

            {/* Inventário Acumulado — último */}
            <div className="sec">
              <div className="inv-card">
                <div className="inv-left">
                  <div className="inv-label">⚖️ &nbsp;Inventário — Total Acumulado (2024–2026)</div>
                  <div className="inv-val">{fmt(TOTAL_INVENTARIO_GERAL)}</div>
                  <div className="inv-sub">ITCMD, Funrejus, custas e honorários advocatícios</div>
                </div>
                <div className="inv-right">
                  <div className="inv-months">
                    <div className="inv-month">
                      <div className="im-label">2024</div>
                      <div className="im-val">{fmt(INV_HIST[2024])}</div>
                    </div>
                    <div className="inv-month">
                      <div className="im-label">2025</div>
                      <div className="im-val">{fmt(INV_HIST[2025])}</div>
                    </div>
                    <div className="inv-month" style={{ background: "rgba(255,255,255,.15)", borderColor: "rgba(255,255,255,.25)" }}>
                      <div className="im-label">2026 ●</div>
                      <div className="im-val">{fmt(TOTAL_INVENTARIO_2026)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>;
        })()}

        {/* ═══ DESPESAS ═══ */}
        {tab === "despesas" && fl && (
          <div className="sec" style={{ marginTop: 24 }}>
            <div className="sec-hd">
              <span className="sec-ic" style={{ background: "var(--redL)", color: "var(--red)" }}>📋</span>
              Despesas — {MONTHS_PT[month]} {year}
            </div>
            {/* Total de despesas operacionais */}
            <div className="sc c-red" style={{ marginBottom: 20 }}>
              <div className="lb">Total de Despesas do Mês (excl. aplicação financeira)</div>
              <div className="vl neg" style={{ fontSize: 26 }}>{fmt(saidasReal)}</div>
            </div>

            <div className="cat-grid">
              {CATEGORIES.map((c, i) => {
                const value = fl.catSaidas[c.key] || 0;
                const base = c.key === "aplicacao" ? fl.saidasTotal : saidasReal;
                const pct = base > 0 ? ((value / base) * 100).toFixed(1) : "0.0";
                const valColor = c.key === "aplicacao" ? "#6B8E6B" : value > 0 ? "var(--red)" : "var(--t3)";
                return (
                  <div key={i} className="cat-card" style={{ borderLeftColor: c.color }}>
                    <div className="lb">{c.label}</div>
                    <div className="vl" style={{ color: valColor }}>{fmt(value)}</div>
                    <div className="pct">{pct}%</div>
                  </div>
                );
              })}
            </div>

            {/* Gráfico pizza */}
            {catData.length > 0 && (
              <div className="rc" style={{ marginTop: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 32, alignItems: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <PieChart data={catData} size={300} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {catData.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, transition: ".15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--card2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 13, color: "var(--t2)", fontFamily: "var(--fb)" }}>{c.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", fontFamily: "var(--fb)" }}>{fmt(c.value)}</div>
                        <div style={{ fontSize: 12, color: "var(--t3)", width: 42, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{((c.value / saidasReal) * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ RECEITAS ═══ */}
        {tab === "receitas" && fl && (() => {
          const EXCLUIR = ["Investimento", "Extorno", "Rendimento", "Diversos"];
          const recFiltradas = fl.receitas.filter(r => !EXCLUIR.includes(r.g));
          const totalRec = recFiltradas.reduce((s, r) => s + r.v, 0);
          // Agrupa por categoria mantendo ordem de aparição
          const grupos = [];
          const seen = {};
          recFiltradas.forEach(r => {
            if (!seen[r.g]) { seen[r.g] = true; grupos.push(r.g); }
          });
          return (
            <div className="sec" style={{ marginTop: 24 }}>
              <div className="sec-hd">
                <span className="sec-ic" style={{ background: "var(--grnL)", color: "var(--grn)" }}>📈</span>
                Receitas — {MONTHS_PT[month]} {year}
              </div>

              {/* Card total */}
              <div className="sc c-grn" style={{ marginBottom: 20 }}>
                <div className="lb">Total de Receitas do Mês</div>
                <div className="vl pos" style={{ fontSize: 26 }}>{fmt(totalRec)}</div>
              </div>

              {/* Cards por categoria */}
              <div className="rec-sg" style={{ marginBottom: 20 }}>
                {grupos.map((g, i) => {
                  const items = recFiltradas.filter(r => r.g === g);
                  const sub = items.reduce((s, r) => s + r.v, 0);
                  const pct = totalRec > 0 ? ((sub / totalRec) * 100).toFixed(1) : "0.0";
                  return (
                    <div className="sc c-grn" key={i}>
                      <div className="lb">{g}</div>
                      <div className="vl pos" style={{ fontSize: 18 }}>{fmt(sub)}</div>
                      <div className="pct" style={{ fontSize: 12, color: "var(--t3)", marginTop: 5, fontWeight: 500 }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>

              {/* Detalhamento por categoria */}
              <div className="rc">
                {grupos.map((g, gi) => {
                  const items = recFiltradas.filter(r => r.g === g);
                  const sub = items.reduce((s, r) => s + r.v, 0);
                  return (
                    <div key={gi}>
                      <div className="rgt" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{g}</span>
                        <span style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--grn)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(sub)}</span>
                      </div>
                      {items.map((r, i) => (
                        <div className="ri" key={i}>
                          <div className="rd" style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--t2)" }}>{r.d}</div>
                          <div className="rv" style={{ fontFamily: "var(--fb)", fontSize: 13, fontWeight: 700, color: "var(--grn)", fontVariantNumeric: "tabular-nums", minWidth: 110, textAlign: "right" }}>{fmt(r.v)}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ═══ MOVIMENTAÇÕES ═══ */}
        {tab === "movimentacoes" && fl && (
          <div className="sec" style={{ marginTop: 24 }}>
            <div className="sec-hd">
              <span className="sec-ic" style={{ background: "#FDF3E3", color: "#A0621A" }}>📄</span>
              Movimentações — {MONTHS_PT[month]} {year}
            </div>
            <div className="tc">
              <div className="tt">
                <input className="si" placeholder="Buscar por descrição..." value={search} onChange={e => setSearch(e.target.value)} />
                <button className={`fb ${tf === "all" ? "on" : ""}`} onClick={() => setTf("all")}>Todos</button>
                <button className={`fb ${tf === "e" ? "on" : ""}`} onClick={() => setTf("e")}>Entradas</button>
                <button className={`fb ${tf === "s" ? "on" : ""}`} onClick={() => setTf("s")}>Saídas</button>
              </div>
              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Descrição</th>
                      <th>Categoria</th>
                      <th style={{ textAlign: "right" }}>Valor</th>
                    </tr>
                  </thead>
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
                            <td>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: cat?.color || "#ccc" }} />
                                {cat?.label || r.c}
                              </span>
                            </td>
                            <td className="tdv neg" style={{ textAlign: "right" }}>− {fmt(r.v)}</td>
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
          const pL = 70, pR = 30, pT = 44, pB = 44, W = 700, H = 280;
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
            <div className="sec" style={{ marginTop: 24 }}>
              <div className="sec-hd">
                <span className="sec-ic" style={{ background: "var(--accL)", color: "var(--acc)" }}>📈</span>
                Evolução Patrimonial — 2026
              </div>
              <div className="ps">
                <div className="pc hi">
                  <div className="pl">Patrimônio Atual</div>
                  <div className="pv">{fmt(last)}</div>
                  <div className="pb">Mar/2026</div>
                </div>
                <div className="pc">
                  <div className="pl">Patrimônio Inicial</div>
                  <div className="pv">{fmt(first)}</div>
                  <div className="pb">Dez/2025</div>
                </div>
                <div className="pc">
                  <div className="pl">Variação R$</div>
                  <div className={`pv ${diff >= 0 ? "pos" : "neg"}`}>{diff >= 0 ? "+" : ""}{fmt(diff)}</div>
                  <div className="pb">Acumulado no período</div>
                </div>
                <div className="pc">
                  <div className="pl">Variação %</div>
                  <div className={`pv ${diff >= 0 ? "pos" : "neg"}`}>{diff >= 0 ? "+" : ""}{pct}%</div>
                  <div className="pb">Desde dez/2025</div>
                </div>
              </div>
              <div className="hc">
                <div className="lc">
                  <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
                    {yL.map((yl, i) => (
                      <g key={i}>
                        <line x1={pL} y1={yl.y} x2={W - pR} y2={yl.y} stroke="#E5E2DC" strokeWidth="1" strokeDasharray={i === 0 ? "0" : "4,3"} />
                        <text x={pL - 10} y={yl.y + 4} textAnchor="end" fill="#9B9690" fontSize="9.5" fontFamily="DM Sans">{(yl.val / 1000000).toFixed(1)}M</text>
                      </g>
                    ))}
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2C5F4A" stopOpacity=".18" />
                        <stop offset="100%" stopColor="#2C5F4A" stopOpacity=".01" />
                      </linearGradient>
                    </defs>
                    <path d={area} fill="url(#ag)" />
                    <path d={line} fill="none" stroke="#2C5F4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="5.5" fill="#2C5F4A" stroke="#fff" strokeWidth="2.5" />
                        <text x={p.x} y={p.y - 15} textAnchor="middle" fill="#18181B" fontSize="10" fontWeight="600" fontFamily="DM Sans">{fmt(p.val)}</text>
                        <text x={p.x} y={pT + cH + 20} textAnchor="middle" fill="#9B9690" fontSize="10" fontFamily="DM Sans">{p.month}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
              <div className="tc" style={{ marginTop: 16 }}>
                <div style={{ padding: "18px 20px 4px" }}>
                  <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 600, color: "var(--t1)" }}>Composição da Variação por Mês</div>
                  <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 3 }}>Rendimentos vs. aportes e resgates da conta corrente</div>
                </div>
                <div className="tw">
                  <table>
                    <thead>
                      <tr>
                        <th>Mês</th>
                        <th style={{ textAlign: "right" }}>Aportes (CC → Invest.)</th>
                        <th style={{ textAlign: "right" }}>Resgates (Invest. → CC)</th>
                        <th style={{ textAlign: "right" }}>Rendimento</th>
                        <th style={{ textAlign: "right" }}>Saldo Invest.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { m: "Dez/25", ap: "—", res: "—", rend: "—", saldo: fmt(12037418.86) },
                        { m: "Jan/26", ap: fmt(430000), res: fmt(25195.01), rend: fmt(104149.97 + 60405.95), saldo: fmt(12594625.77), apN: 430000, resN: 25195.01, rendN: 164555.92 },
                        { m: "Fev/26", ap: fmt(1120000), res: fmt(1139781.33), rend: fmt(66196.30 + 22142.44), saldo: fmt(12659781.33), apN: 1120000, resN: 1139781.33, rendN: 88338.74 },
                        { m: "Mar/26", ap: "—", res: "—", rend: "Mês não fechou", saldo: fmt(12659781.33) + " *" },
                      ].map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, color: "var(--t1)" }}>{r.m}</td>
                          <td style={{ textAlign: "right", color: "var(--red)", fontWeight: r.apN ? 600 : undefined }}>{r.ap}</td>
                          <td style={{ textAlign: "right", color: "var(--grn)", fontWeight: r.resN ? 600 : undefined }}>{r.res}</td>
                          <td style={{ textAlign: "right", color: "var(--grn)", fontWeight: r.rendN ? 600 : undefined }}>{r.rend}</td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "var(--t1)" }}>{r.saldo}</td>
                        </tr>
                      ))}
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
