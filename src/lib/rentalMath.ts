import type { MonthlyBreakdown } from "./mortgageMath";
import type { AppPersisted } from "../storage/mortgageState";

export type RentalLineItem = { id: string; label: string; amount: number };

export type RentalPieSlice = { id: string; label: string; amount: number };

export type RentalAnalysis = {
  grossScheduledIncomeMonthly: number;
  vacancyLossMonthly: number;
  effectiveGrossIncomeMonthly: number;
  operatingExpenseLines: RentalLineItem[];
  noiMonthly: number;
  noiAnnual: number;
  capRate: number;
  principalAndInterestMonthly: number;
  cashFlowMonthly: number;
  cashFlowAnnual: number;
  initialCashInvested: number;
  cashOnCash: number;
  /** Where monthly EGI goes: debt service, OpEx line items, remainder = cash flow */
  composition: RentalPieSlice[];
};

/**
 * Pro-forma rental analysis. NOI excludes P&I. Cash flow = EGI − operating expenses − P&I.
 * Management % is applied to gross scheduled income (rent + other). Maintenance & CapEx %
 * are applied to base monthly rent only (typical “% of rent” reserve).
 */
export function computeRentalAnalysis(
  s: AppPersisted,
  mortgage: MonthlyBreakdown
): RentalAnalysis {
  const purchasePrice = Math.max(0, s.homePrice);
  const rent = Math.max(0, s.monthlyRent);
  const other = Math.max(0, s.otherMonthlyIncome);
  const vacancyPct = clamp(s.vacancyRatePercent, 0, 100);
  const gsi = rent + other;
  const vacancyLoss = gsi * (vacancyPct / 100);
  const egi = gsi - vacancyLoss;

  const mgmt = gsi * (clamp(s.propertyMgmtPercent, 0, 100) / 100);
  const maint = rent * (clamp(s.maintenancePercent, 0, 100) / 100);
  const capex = rent * (clamp(s.capexPercent, 0, 100) / 100);
  const propertyTax = mortgage.propertyTax;
  const insurance = mortgage.insurance;
  const hoa = mortgage.hoa;

  const operatingExpenseLines: RentalLineItem[] = [
    { id: "mgmt", label: "Property management", amount: mgmt },
    { id: "maint", label: "Maintenance & repairs", amount: maint },
    { id: "capex", label: "CapEx reserve", amount: capex },
    { id: "tax", label: "Property taxes", amount: propertyTax },
    { id: "ins", label: "Insurance", amount: insurance },
    { id: "hoa", label: "HOA", amount: hoa },
  ];

  const totalOpex = operatingExpenseLines.reduce((a, b) => a + b.amount, 0);
  const noiMonthly = egi - totalOpex;
  const noiAnnual = noiMonthly * 12;
  const capRate = purchasePrice > 0 ? noiAnnual / purchasePrice : 0;

  const pi = mortgage.principalAndInterest;
  const cashFlowMonthly = noiMonthly - pi;
  const cashFlowAnnual = cashFlowMonthly * 12;

  const initialCashInvested =
    Math.max(0, s.downPayment) + Math.max(0, s.closingCosts) + Math.max(0, s.miscInitialCash);
  const cashOnCash =
    initialCashInvested > 0 ? cashFlowAnnual / initialCashInvested : 0;

  /** Monthly debt service + operating costs (visual “where money goes” before cash flow). */
  const composition: RentalPieSlice[] = [
    { id: "pi", label: "Principal & interest", amount: pi },
    ...operatingExpenseLines.map((l) => ({ id: l.id, label: l.label, amount: l.amount })),
  ].filter((x) => x.amount > 0.0001);

  return {
    grossScheduledIncomeMonthly: gsi,
    vacancyLossMonthly: vacancyLoss,
    effectiveGrossIncomeMonthly: egi,
    operatingExpenseLines,
    noiMonthly,
    noiAnnual,
    capRate,
    principalAndInterestMonthly: pi,
    cashFlowMonthly,
    cashFlowAnnual,
    initialCashInvested,
    cashOnCash,
    composition,
  };
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
