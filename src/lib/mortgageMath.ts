export type MonthlyBreakdown = {
  principalAndInterest: number;
  propertyTax: number;
  insurance: number;
  hoa: number;
  total: number;
  loanAmount: number;
};

export type AmortizationRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type YearlyPaydown = {
  year: number;
  principal: number;
  interest: number;
};

export function computeMonthlyPayment(
  homePrice: number,
  downPayment: number,
  interestRateApr: number,
  termYears: number,
  propertyTaxAnnual: number,
  insuranceAnnual: number,
  hoaMonthly: number
): MonthlyBreakdown {
  const loanAmount = Math.max(0, homePrice - downPayment);
  const n = Math.max(1, Math.round(termYears * 12));
  const monthlyRate = interestRateApr / 100 / 12;

  let principalAndInterest = 0;
  if (loanAmount > 0) {
    if (monthlyRate <= 0) {
      principalAndInterest = loanAmount / n;
    } else {
      const factor = (1 + monthlyRate) ** n;
      principalAndInterest = (loanAmount * (monthlyRate * factor)) / (factor - 1);
    }
  }

  const propertyTax = propertyTaxAnnual / 12;
  const insurance = insuranceAnnual / 12;
  const hoa = hoaMonthly;
  const total = principalAndInterest + propertyTax + insurance + hoa;

  return {
    principalAndInterest,
    propertyTax,
    insurance,
    hoa,
    total,
    loanAmount,
  };
}

function monthlyPiPayment(loanAmount: number, monthlyRate: number, n: number): number {
  if (loanAmount <= 0 || n <= 0) return 0;
  if (monthlyRate <= 0) return loanAmount / n;
  const factor = (1 + monthlyRate) ** n;
  return (loanAmount * (monthlyRate * factor)) / (factor - 1);
}

export function buildAmortizationSchedule(
  loanAmount: number,
  interestRateApr: number,
  termYears: number
): AmortizationRow[] {
  const n = Math.max(1, Math.round(termYears * 12));
  const monthlyRate = interestRateApr / 100 / 12;
  const payment = monthlyPiPayment(loanAmount, monthlyRate, n);
  const rows: AmortizationRow[] = [];
  let balance = loanAmount;

  for (let month = 1; month <= n; month++) {
    const interest = monthlyRate <= 0 ? 0 : balance * monthlyRate;
    let principal = payment - interest;
    if (month === n) {
      principal = balance;
    }
    principal = Math.max(0, Math.min(principal, balance));
    balance = Math.max(0, balance - principal);
    rows.push({
      month,
      payment: principal + interest,
      principal,
      interest,
      balance,
    });
  }

  return rows;
}

export function aggregateYearlyPaydown(rows: AmortizationRow[]): YearlyPaydown[] {
  const byYear = new Map<number, { principal: number; interest: number }>();
  for (const row of rows) {
    const year = Math.ceil(row.month / 12);
    const cur = byYear.get(year) ?? { principal: 0, interest: 0 };
    cur.principal += row.principal;
    cur.interest += row.interest;
    byYear.set(year, cur);
  }
  return [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, v]) => ({ year, principal: v.principal, interest: v.interest }));
}

export function scheduleTotals(rows: AmortizationRow[]): {
  totalInterest: number;
  totalPrincipal: number;
} {
  let totalInterest = 0;
  let totalPrincipal = 0;
  for (const row of rows) {
    totalInterest += row.interest;
    totalPrincipal += row.principal;
  }
  return { totalInterest, totalPrincipal };
}
