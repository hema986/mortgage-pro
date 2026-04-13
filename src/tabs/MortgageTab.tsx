import ExpandMore from "@mui/icons-material/ExpandMore";
import { Stack, Typography } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import { alpha } from "@mui/material/styles";
import { useMemo } from "react";
import { AccordionSummaryMetric } from "../components/AccordionSummaryMetric";
import { MortgageBuyerCashPanel } from "../components/MortgageBuyerCashPanel";
import { MortgageLoanSummaryCard } from "../components/MortgageLoanSummaryCard";
import { MortgageInputsFields } from "../components/MortgageInputsFields";
import { MortgageAffordabilityDtiPanel } from "../components/MortgageAffordabilityDtiPanel";
import { MortgageLoanCompareCards } from "../components/MortgageLoanCompareCards";
import { MortgageRefiBreakevenCard } from "../components/MortgageRefiBreakevenCard";
import { MortgagePaymentBreakdown } from "../components/MortgagePaymentBreakdown";
import { PaydownYearlyMergedCompare } from "../components/PaydownYearlyMergedCompare";
import { PaydownYearlyColorLegend } from "../components/PaydownYearlyDetailTable";
import {
  aggregateYearlyPaydownDetailed,
  buildAmortizationSchedule,
  buildAmortizationScheduleWithExtraPrincipal,
  computeMonthlyPayment,
  scheduleTotals,
  type AmortizationRow,
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

const mortgageAccordionSx = {
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  "&:before": { display: "none" },
} as const;

const mortgageAccordionSummarySx = {
  px: 1.25,
  minHeight: 52,
  alignItems: "flex-start",
  "& .MuiAccordionSummary-content": { my: 0.65, width: "100%", maxWidth: "calc(100% - 36px)" },
} as const;

export type MortgageTabProps = {
  state: AppPersisted;
  patch: (partial: Partial<AppPersisted>) => void;
};

export function MortgageTab({ state, patch }: MortgageTabProps) {
  /** Coerce in case storage/sync delivered a string — `> 0` must be reliable for prepay schedule. */
  const extraPrincipalMonthly = Math.max(0, Math.round(Number(state.extraPrincipalMonthly) || 0));

  const breakdown = useMemo(
    () =>
      computeMonthlyPayment(
        state.homePrice,
        state.downPayment,
        state.interestRateApr,
        state.termYears,
        state.propertyTaxAnnual,
        state.insuranceAnnual,
        state.hoaMonthly,
        state.pmiMonthly
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
      state.pmiMonthly,
    ]
  );

  const baselineSchedule: AmortizationRow[] = useMemo(
    () => buildAmortizationSchedule(breakdown.loanAmount, state.interestRateApr, state.termYears),
    [breakdown.loanAmount, state.interestRateApr, state.termYears]
  );

  const baselineSchedule15: AmortizationRow[] = useMemo(
    () => buildAmortizationSchedule(breakdown.loanAmount, state.interestRateApr, 15),
    [breakdown.loanAmount, state.interestRateApr]
  );

  const schedule15: AmortizationRow[] = useMemo(() => {
    if (breakdown.loanAmount <= 0) return [];
    if (extraPrincipalMonthly > 0) {
      return buildAmortizationScheduleWithExtraPrincipal(
        breakdown.loanAmount,
        state.interestRateApr,
        15,
        extraPrincipalMonthly
      );
    }
    return baselineSchedule15;
  }, [baselineSchedule15, breakdown.loanAmount, extraPrincipalMonthly, state.interestRateApr]);

  const yearlyDetailed15 = useMemo(
    () => aggregateYearlyPaydownDetailed(schedule15, breakdown.loanAmount),
    [schedule15, breakdown.loanAmount]
  );
  const { totalInterest: lifeInterest15, totalPrincipal: lifePrincipal15 } = useMemo(
    () => scheduleTotals(schedule15),
    [schedule15]
  );

  const schedule: AmortizationRow[] = useMemo(() => {
    if (extraPrincipalMonthly > 0) {
      return buildAmortizationScheduleWithExtraPrincipal(
        breakdown.loanAmount,
        state.interestRateApr,
        state.termYears,
        extraPrincipalMonthly
      );
    }
    return baselineSchedule;
  }, [
    baselineSchedule,
    breakdown.loanAmount,
    extraPrincipalMonthly,
    state.interestRateApr,
    state.termYears,
  ]);

  const baselineTotals = useMemo(() => scheduleTotals(baselineSchedule), [baselineSchedule]);

  const yearlyDetailed = useMemo(
    () => aggregateYearlyPaydownDetailed(schedule, breakdown.loanAmount),
    [schedule, breakdown.loanAmount]
  );
  const { totalInterest: lifeInterest, totalPrincipal: lifePrincipal } = useMemo(
    () => scheduleTotals(schedule),
    [schedule]
  );

  const prepaySummary = useMemo(() => {
    if (extraPrincipalMonthly <= 0 || breakdown.loanAmount <= 0) return null;
    const pt = scheduleTotals(schedule);
    const interestSaved = baselineTotals.totalInterest - pt.totalInterest;
    const monthsSaved = baselineSchedule.length - schedule.length;
    const payoffMo = schedule.length;
    return {
      interestSaved,
      monthsSaved,
      payoffMo,
      baselineInterest: baselineTotals.totalInterest,
    };
  }, [
    baselineSchedule.length,
    baselineTotals.totalInterest,
    breakdown.loanAmount,
    schedule,
    extraPrincipalMonthly,
  ]);

  const ltvPct =
    state.homePrice > 0 ? (breakdown.loanAmount / state.homePrice) * 100 : 0;
  const cashToClose = state.downPayment + state.closingCosts + state.miscInitialCash;

  return (
    <Stack spacing={1.25}>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35, display: "block", mb: -0.25 }}>
        <strong>Estimated</strong> payment (not an offer). Edit loan &amp; cash inputs first; payment summary and detail
        follow. Affordability &amp; DTI is at the bottom of this tab.
      </Typography>

      <MortgageInputsFields state={state} patch={patch} compactGrid inputSize="small" />

      <MortgageBuyerCashPanel
        state={state}
        patch={patch}
        loanAmount={breakdown.loanAmount}
        cashToClose={cashToClose}
      />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.1, sm: 1.35 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          background: (t) =>
            t.palette.mode === "light"
              ? `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.07)} 0%, ${alpha(t.palette.background.paper, 1)} 48%, ${alpha(t.palette.secondary.main, 0.06)} 100%)`
              : `linear-gradient(145deg, ${alpha(t.palette.primary.main, 0.14)} 0%, ${alpha(t.palette.background.paper, 1)} 45%, ${alpha(t.palette.secondary.main, 0.1)} 100%)`,
          boxShadow: (t) =>
            t.palette.mode === "light"
              ? `0 8px 28px ${alpha(t.palette.primary.dark, 0.08)}`
              : `0 8px 28px rgba(0,0,0,0.35)`,
        }}
      >
        <Grid container spacing={1.5} alignItems="flex-start">
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.2 }}>
              Estimated payment
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.04em",
                fontSize: { xs: "1.65rem", sm: "1.95rem" },
                lineHeight: 1.1,
                mt: 0.15,
              }}
            >
              {moneyDec.format(breakdown.total)}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 500, ml: 0.5 }}>
                /mo
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.65, lineHeight: 1.4, fontSize: "0.8125rem" }}>
              {state.interestRateApr}% · {state.termYears}-yr · {money.format(breakdown.loanAmount)} loan · LTV{" "}
              {ltvPct.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, lineHeight: 1.35 }}>
              Cash to close: <strong>{money.format(cashToClose)}</strong> (down + closing + misc — closing modeled below).
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.65, fontSize: "0.8rem" }}>
              Payment breakdown
            </Typography>
            <MortgagePaymentBreakdown breakdown={breakdown} />
          </Grid>
        </Grid>
      </Paper>

      <MortgageLoanSummaryCard
        state={state}
        breakdown={breakdown}
        cashToClose={cashToClose}
        ltvPct={ltvPct}
        lifeInterest={lifeInterest}
        lifePrincipal={lifePrincipal}
        extraPrincipalMonthly={extraPrincipalMonthly}
        prepaySummary={prepaySummary}
      />

      <Accordion
        defaultExpanded={false}
        disableGutters
        elevation={0}
        sx={mortgageAccordionSx}
      >
        <AccordionSummary expandIcon={<ExpandMore />} sx={mortgageAccordionSummarySx}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ sm: "flex-end" }}
            justifyContent="space-between"
            sx={{ width: "100%", gap: 1 }}
          >
            <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Compare loan length
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
                Monthly split, life interest, 15−30 deltas
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.25} sx={{ flexShrink: 0 }}>
              <AccordionSummaryMetric label="Loan" value={money.format(breakdown.loanAmount)} />
              <AccordionSummaryMetric label="P&I /mo" value={moneyDec.format(breakdown.principalAndInterest)} />
              <AccordionSummaryMetric label="Payment /mo" value={moneyDec.format(breakdown.total)} />
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1.25, pt: 0, pb: 1.25 }}>
          <MortgageLoanCompareCards state={state} />
        </AccordionDetails>
      </Accordion>

      {breakdown.loanAmount > 0 ? (
        <Accordion defaultExpanded={false} disableGutters elevation={0} sx={mortgageAccordionSx}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={mortgageAccordionSummarySx}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "flex-end" }}
              justifyContent="space-between"
              sx={{ width: "100%", gap: 1 }}
            >
              <Stack spacing={0.15} sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Year-by-year (15-yr vs loan term)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                  One table; 15-yr columns “—” after payoff
                </Typography>
              </Stack>
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.25} sx={{ flexShrink: 0 }}>
                <AccordionSummaryMetric label="Life int (15-yr)" value={money.format(lifeInterest15)} />
                <AccordionSummaryMetric
                  label={`Life int (${state.termYears}-yr)`}
                  value={money.format(lifeInterest)}
                />
              </Stack>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1.25, pt: 0, pb: 1.25 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, lineHeight: 1.4 }}>
              Same loan amount, APR, and extra principal (if any). Loan year = 12 payment months from closing.
            </Typography>
            <PaydownYearlyColorLegend />
            <PaydownYearlyMergedCompare
              rows15={yearlyDetailed15}
              rowsTerm={yearlyDetailed}
              termYearsLabel={state.termYears}
              lifePrincipal15={lifePrincipal15}
              lifeInterest15={lifeInterest15}
              lifePrincipalTerm={lifePrincipal}
              lifeInterestTerm={lifeInterest}
            />
          </AccordionDetails>
        </Accordion>
      ) : null}

      {breakdown.loanAmount > 0 ? (
        <Accordion defaultExpanded={false} disableGutters elevation={0} sx={mortgageAccordionSx}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={mortgageAccordionSummarySx}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "flex-end" }}
              justifyContent="space-between"
              sx={{ width: "100%", gap: 1 }}
            >
              <Stack spacing={0.15} sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Refi breakeven
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                  New rate vs costs · months to recover
                </Typography>
              </Stack>
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.25} sx={{ flexShrink: 0 }}>
                <AccordionSummaryMetric label="Loan balance" value={money.format(breakdown.loanAmount)} />
                <AccordionSummaryMetric label="P&I now" value={moneyDec.format(breakdown.principalAndInterest)} />
                <AccordionSummaryMetric label="Note %" value={`${state.interestRateApr}%`} />
              </Stack>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1.25, pt: 0, pb: 1.25 }}>
            <MortgageRefiBreakevenCard
              scenarioLoanAmount={breakdown.loanAmount}
              scenarioPrincipalAndInterest={breakdown.principalAndInterest}
              scenarioAprPercent={state.interestRateApr}
              defaultRefiClosingCosts={state.closingCosts}
              schedule={schedule}
            />
          </AccordionDetails>
        </Accordion>
      ) : null}

      <MortgageAffordabilityDtiPanel
        state={state}
        patch={patch}
        currentHousingPaymentMonthly={breakdown.total}
      />

      <Alert severity="info" variant="outlined" sx={{ borderRadius: 2, py: 0.75, "& .MuiAlert-message": { py: 0 } }}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: "block" }}>
          <strong>Scope:</strong> Single-scenario calculator — no listings, maps, or live rates. Numbers stay in your
          browser until export or reset.
        </Typography>
      </Alert>
    </Stack>
  );
}

