export const STORAGE_KEY = "mortgage-pro:v1";
export const SYNC_CHANNEL = "mortgage-pro-sync";

/** v1: mortgage only. v2: mortgage + rental pro-forma fields. */
export const SCHEMA_VERSION = 2 as const;
export const SCHEMA_VERSION_LEGACY = 1 as const;

export type AppPersisted = {
  v: typeof SCHEMA_VERSION;
  homePrice: number;
  downPayment: number;
  /** 0–100; kept in sync when purchase price changes (same % → new dollar amount). */
  downPaymentPercent: number;
  interestRateApr: number;
  termYears: number;
  propertyTaxAnnual: number;
  /** Annual property tax as % of purchase price (0–100); synced with `propertyTaxAnnual`. */
  propertyTaxPercent: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  monthlyRent: number;
  otherMonthlyIncome: number;
  vacancyRatePercent: number;
  closingCosts: number;
  /** One-time cash at closing not in lender fees (repairs, moving, escrow top-up, etc.). Counts toward cash-on-cash denominator. */
  miscInitialCash: number;
  propertyMgmtPercent: number;
  maintenancePercent: number;
  capexPercent: number;
};

/** @deprecated Use AppPersisted */
export type MortgagePersisted = AppPersisted;

export const defaultAppState = (): AppPersisted => ({
  v: SCHEMA_VERSION,
  homePrice: 450_000,
  downPayment: 90_000,
  downPaymentPercent: 20,
  interestRateApr: 6.5,
  termYears: 30,
  propertyTaxAnnual: 5_400,
  propertyTaxPercent: 1.2,
  insuranceAnnual: 1_200,
  hoaMonthly: 0,
  monthlyRent: 2_800,
  otherMonthlyIncome: 0,
  vacancyRatePercent: 5,
  closingCosts: 8_000,
  miscInitialCash: 0,
  propertyMgmtPercent: 10,
  maintenancePercent: 8,
  capexPercent: 5,
});

export const defaultMortgageState = defaultAppState;

function num(x: unknown, fallback: number): number {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : fallback;
}

type MortgageCore = Pick<
  AppPersisted,
  | "homePrice"
  | "downPayment"
  | "interestRateApr"
  | "termYears"
  | "propertyTaxAnnual"
  | "insuranceAnnual"
  | "hoaMonthly"
>;

function clampPct(p: number): number {
  if (!Number.isFinite(p)) return 0;
  return Math.min(100, Math.max(0, p));
}

function parseV1Mortgage(data: Record<string, unknown>): MortgageCore {
  const base = defaultAppState();
  return {
    homePrice: num(data.homePrice, base.homePrice),
    downPayment: num(data.downPayment, base.downPayment),
    interestRateApr: num(data.interestRateApr, base.interestRateApr),
    termYears: num(data.termYears, base.termYears),
    propertyTaxAnnual: num(data.propertyTaxAnnual, base.propertyTaxAnnual),
    insuranceAnnual: num(data.insuranceAnnual, base.insuranceAnnual),
    hoaMonthly: num(data.hoaMonthly, base.hoaMonthly),
  };
}

/** Derive dollar down + percent from stored JSON (prefers `downPaymentPercent` when present). */
function normalizeDownPayment(
  m: MortgageCore,
  data: Record<string, unknown>,
  base: AppPersisted
): Pick<AppPersisted, "downPayment" | "downPaymentPercent"> {
  const hp = m.homePrice;
  if (hp <= 0) {
    return {
      downPayment: Math.max(0, m.downPayment),
      downPaymentPercent: clampPct(num(data.downPaymentPercent, base.downPaymentPercent)),
    };
  }
  if (data.downPaymentPercent !== undefined && data.downPaymentPercent !== null) {
    const pct = clampPct(num(data.downPaymentPercent, base.downPaymentPercent));
    return { downPaymentPercent: pct, downPayment: Math.round((hp * pct) / 100) };
  }
  const pct = clampPct((m.downPayment / hp) * 100);
  return { downPaymentPercent: pct, downPayment: Math.round((hp * pct) / 100) };
}

type MortgageAfterDown = MortgageCore & Pick<AppPersisted, "downPayment" | "downPaymentPercent">;

/** Derive annual tax + % of value from JSON (prefers `propertyTaxPercent` when present). */
function normalizePropertyTax(
  m: MortgageAfterDown,
  data: Record<string, unknown>,
  base: AppPersisted
): Pick<AppPersisted, "propertyTaxAnnual" | "propertyTaxPercent"> {
  const hp = m.homePrice;
  const annualRaw = m.propertyTaxAnnual;
  if (hp <= 0) {
    return {
      propertyTaxAnnual: Math.max(0, annualRaw),
      propertyTaxPercent: clampPct(num(data.propertyTaxPercent, base.propertyTaxPercent)),
    };
  }
  if (data.propertyTaxPercent !== undefined && data.propertyTaxPercent !== null) {
    const pct = clampPct(num(data.propertyTaxPercent, base.propertyTaxPercent));
    return { propertyTaxPercent: pct, propertyTaxAnnual: Math.round((hp * pct) / 100) };
  }
  const pct = clampPct((annualRaw / hp) * 100);
  return { propertyTaxPercent: pct, propertyTaxAnnual: Math.round((hp * pct) / 100) };
}

type RentalOnly = Pick<
  AppPersisted,
  | "monthlyRent"
  | "otherMonthlyIncome"
  | "vacancyRatePercent"
  | "closingCosts"
  | "miscInitialCash"
  | "propertyMgmtPercent"
  | "maintenancePercent"
  | "capexPercent"
>;

function parseRentalFields(data: Record<string, unknown>, base: AppPersisted): RentalOnly {
  return {
    monthlyRent: num(data.monthlyRent, base.monthlyRent),
    otherMonthlyIncome: num(data.otherMonthlyIncome, base.otherMonthlyIncome),
    vacancyRatePercent: num(data.vacancyRatePercent, base.vacancyRatePercent),
    closingCosts: num(data.closingCosts, base.closingCosts),
    miscInitialCash: num(data.miscInitialCash, base.miscInitialCash),
    propertyMgmtPercent: num(data.propertyMgmtPercent, base.propertyMgmtPercent),
    maintenancePercent: num(data.maintenancePercent, base.maintenancePercent),
    capexPercent: num(data.capexPercent, base.capexPercent),
  };
}

export function parseMortgageState(raw: string | null): AppPersisted {
  if (!raw) return defaultAppState();
  try {
    const data = JSON.parse(raw) as Record<string, unknown> & { v?: unknown };
    const base = defaultAppState();

    if (data.v === SCHEMA_VERSION_LEGACY) {
      const m0 = parseV1Mortgage(data);
      const d = normalizeDownPayment(m0, data, base);
      const m1 = { ...m0, ...d };
      const t = normalizePropertyTax(m1, data, base);
      const m = { ...m1, ...t };
      return {
        ...base,
        ...m,
        ...parseRentalFields({}, base),
        v: SCHEMA_VERSION,
      };
    }

    if (data.v !== SCHEMA_VERSION) {
      return defaultAppState();
    }

    const m0 = parseV1Mortgage(data);
    const d = normalizeDownPayment(m0, data, base);
    const m1 = { ...m0, ...d };
    const t = normalizePropertyTax(m1, data, base);
    const m = { ...m1, ...t };
    const r = parseRentalFields(data, base);
    return {
      v: SCHEMA_VERSION,
      ...m,
      ...r,
    };
  } catch {
    return defaultAppState();
  }
}

export function serializeMortgageState(state: AppPersisted): string {
  return JSON.stringify({ ...state, v: SCHEMA_VERSION });
}

/** Import from a `.json` file; accepts legacy v1 or current v2. */
export function tryParseMortgageJson(raw: string): AppPersisted | null {
  try {
    const data = JSON.parse(raw) as { v?: unknown };
    if (data.v !== SCHEMA_VERSION && data.v !== SCHEMA_VERSION_LEGACY) return null;
    return parseMortgageState(JSON.stringify(data));
  } catch {
    return null;
  }
}
