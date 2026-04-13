import { Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useMemo } from "react";
import { AmortizationTableCard } from "../components/AmortizationTableCard";
import { MortgageInputsFields } from "../components/MortgageInputsFields";
import { PaydownBarChart } from "../components/PaydownBarChart";
import {
  aggregateYearlyPaydown,
  buildAmortizationSchedule,
  computeMonthlyPayment,
  scheduleTotals,
  type AmortizationRow,
  type YearlyPaydown,
} from "../lib/mortgageMath";
import type { AppPersisted } from "../storage/mortgageState";

const money = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const moneyDec = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export type MortgageTabProps = {
  state: AppPersisted;
  patch: (partial: Partial<AppPersisted>) => void;
};

export function MortgageTab({ state, patch }: MortgageTabProps) {
  const breakdown = useMemo(
    () =>
      computeMonthlyPayment(
        state.homePrice,
        state.downPayment,
        state.interestRateApr,
        state.termYears,
        state.propertyTaxAnnual,
        state.insuranceAnnual,
        state.hoaMonthly
      ),
    [
      state.downPayment,
      state.downPaymentPercent,
      state.homePrice,
      state.hoaMonthly,
      state.insuranceAnnual,
      state.interestRateApr,
      state.propertyTaxAnnual,
      state.propertyTaxPercent,
      state.termYears,
    ]
  );

  const schedule: AmortizationRow[] = useMemo(
    () =>
      buildAmortizationSchedule(
        breakdown.loanAmount,
        state.interestRateApr,
        state.termYears
      ),
    [breakdown.loanAmount, state.interestRateApr, state.termYears]
  );

  const yearly: YearlyPaydown[] = useMemo(() => aggregateYearlyPaydown(schedule), [schedule]);
  const { totalInterest: lifeInterest, totalPrincipal: lifePrincipal } = useMemo(
    () => scheduleTotals(schedule),
    [schedule]
  );

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
        Same scenario as <strong>Rental</strong> — loan <strong>term</strong> (15 yr vs 30 yr, etc.), rate, and price
        here are the same fields as Rental&apos;s <strong>Financing</strong> accordion. Monthly <strong>P&amp;I</strong>{" "}
        below is what Rental subtracts for cash flow.
      </Typography>
      <Box>
        <Typography variant="overline" color="text.secondary">
          Estimated monthly payment
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 600, letterSpacing: "-0.03em", fontSize: "1.65rem" }}>
          {moneyDec.format(breakdown.total)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.4 }}>
          Principal &amp; interest {moneyDec.format(breakdown.principalAndInterest)} · Taxes{" "}
          {moneyDec.format(breakdown.propertyTax)} · Insurance {moneyDec.format(breakdown.insurance)}
          {breakdown.hoa > 0 ? ` · HOA ${moneyDec.format(breakdown.hoa)}` : ""}
        </Typography>
      </Box>

      <MortgageInputsFields state={state} patch={patch} />

      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
            Loan summary
          </Typography>
          <Stack spacing={0.5}>
            <Row label="Loan amount" value={money.format(breakdown.loanAmount)} />
            <Row
              label="Down payment"
              value={`${money.format(state.downPayment)} (${state.downPaymentPercent.toFixed(1)}%)`}
            />
            {breakdown.loanAmount > 0 ? (
              <>
                <Row label="Loan term" value={`${state.termYears} years`} />
                <Row label="Principal &amp; interest (mo)" value={moneyDec.format(breakdown.principalAndInterest)} />
                <Row label="Total interest (P&amp;I life)" value={money.format(lifeInterest)} />
                <Row label="Total principal paid" value={money.format(lifePrincipal)} />
              </>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      {breakdown.loanAmount > 0 ? (
        <Card>
          <CardContent>
            <PaydownBarChart yearly={yearly} />
          </CardContent>
        </Card>
      ) : null}

      {breakdown.loanAmount > 0 ? (
        <AmortizationTableCard
          rows={schedule}
          totalInterest={lifeInterest}
          totalPrincipal={lifePrincipal}
        />
      ) : null}
    </Stack>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}
