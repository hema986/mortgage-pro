import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import type { MonthlyBreakdown } from "../lib/mortgageMath";
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

export type PrepaySummary = {
  interestSaved: number;
  monthsSaved: number;
  payoffMo: number;
};

export type MortgageLoanSummaryCardProps = {
  state: AppPersisted;
  breakdown: MonthlyBreakdown;
  cashToClose: number;
  ltvPct: number;
  lifeInterest: number;
  lifePrincipal: number;
  extraPrincipalMonthly: number;
  prepaySummary: PrepaySummary | null;
};

function formatYearsMonthsFromMonths(totalMonths: number): string {
  const m = Math.max(0, Math.round(totalMonths));
  if (m <= 0) return "—";
  const y = Math.floor(m / 12);
  const r = m % 12;
  if (y <= 0) return `${r} mo`;
  if (r === 0) return `${y} yr`;
  return `${y} yr ${r} mo`;
}

function StatTile({
  kicker,
  value,
  hint,
}: {
  kicker: string;
  value: string;
  hint?: string;
}) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={(t) => ({
        p: 1.35,
        height: "100%",
        borderRadius: 2,
        borderColor: alpha(t.palette.primary.main, t.palette.mode === "light" ? 0.22 : 0.35),
        background:
          t.palette.mode === "light"
            ? `linear-gradient(160deg, ${alpha(t.palette.primary.main, 0.07)} 0%, ${alpha(t.palette.background.paper, 1)} 55%)`
            : `linear-gradient(160deg, ${alpha(t.palette.primary.main, 0.14)} 0%, ${alpha(t.palette.background.paper, 1)} 50%)`,
      })}
    >
      <Typography
        variant="caption"
        sx={(t) => ({
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontSize: "0.65rem",
          color: t.palette.text.secondary,
          display: "block",
          mb: 0.35,
        })}
      >
        {kicker}
      </Typography>
      <Typography
        variant="h6"
        sx={(t) => ({
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          fontSize: { xs: "1.05rem", sm: "1.2rem" },
          color: t.palette.mode === "light" ? t.palette.primary.dark : t.palette.primary.light,
        })}
      >
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, lineHeight: 1.35 }}>
          {hint}
        </Typography>
      ) : null}
    </Paper>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={(t) => ({
        display: "block",
        fontWeight: 800,
        letterSpacing: "0.1em",
        color: t.palette.primary.main,
        mt: 2,
        mb: 0.75,
        fontSize: "0.68rem",
      })}
    >
      {children}
    </Typography>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      gap={2}
      sx={(t) => ({
        py: 0.85,
        px: 1,
        mx: -1,
        borderRadius: 1,
        borderBottom: `1px solid ${alpha(t.palette.divider, 0.9)}`,
        "&:hover": { bgcolor: alpha(t.palette.primary.main, t.palette.mode === "light" ? 0.04 : 0.08) },
      })}
    >
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.35, fontSize: "0.8125rem" }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          textAlign: "right",
          fontSize: "0.8125rem",
          lineHeight: 1.35,
          flexShrink: 0,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export function MortgageLoanSummaryCard({
  state,
  breakdown,
  cashToClose,
  ltvPct,
  lifeInterest,
  lifePrincipal,
  extraPrincipalMonthly,
  prepaySummary,
}: MortgageLoanSummaryCardProps) {
  const hasLoan = breakdown.loanAmount > 0;

  return (
    <Card
      variant="outlined"
      sx={(t) => ({
        borderRadius: 2,
        overflow: "hidden",
        borderColor: alpha(t.palette.primary.main, t.palette.mode === "light" ? 0.35 : 0.45),
        boxShadow:
          t.palette.mode === "light"
            ? `0 4px 20px ${alpha(t.palette.primary.dark, 0.08)}`
            : `0 4px 24px ${alpha("#000", 0.35)}`,
      })}
    >
      <Box
        sx={(t) => ({
          px: 2,
          py: 1.5,
          background:
            t.palette.mode === "light"
              ? `linear-gradient(110deg, ${alpha(t.palette.primary.main, 0.12)} 0%, ${alpha(t.palette.secondary.main, 0.08)} 100%)`
              : `linear-gradient(110deg, ${alpha(t.palette.primary.main, 0.22)} 0%, ${alpha(t.palette.secondary.main, 0.12)} 100%)`,
          borderBottom: "1px solid",
          borderColor: "divider",
        })}
      >
        <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: "0.12em", opacity: 0.9 }}>
          Loan summary
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.02em", mt: 0.25 }}>
          At a glance
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, lineHeight: 1.4 }}>
          Key numbers for this scenario — same data as before, easier to scan.
        </Typography>
      </Box>

      <CardContent sx={{ pt: 2, pb: 2, px: 2 }}>
        <Grid container spacing={1.25}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatTile kicker="Loan amount" value={money.format(breakdown.loanAmount)} hint="Financed at purchase" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatTile
              kicker="P&I / month"
              value={hasLoan ? moneyDec.format(breakdown.principalAndInterest) : "—"}
              hint="Principal + interest only"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatTile
              kicker="Cash to close"
              value={money.format(cashToClose)}
              hint="Down + closing + misc"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <SectionTitle>Purchase &amp; equity</SectionTitle>
        <Stack spacing={0}>
          <DetailRow
            label="Down payment"
            value={`${money.format(state.downPayment)} (${state.downPaymentPercent.toFixed(1)}%)`}
          />
          <DetailRow label="Cash to close (full detail)" value={money.format(cashToClose)} />
        </Stack>

        {hasLoan ? (
          <>
            <SectionTitle>Loan terms</SectionTitle>
            <Stack spacing={0}>
              <DetailRow label="Term" value={`${state.termYears} years`} />
              <DetailRow label="LTV (loan / price)" value={`${ltvPct.toFixed(2)}%`} />
              <DetailRow label="Note rate" value={`${state.interestRateApr}% APR`} />
              {breakdown.pmi > 0.001 ? (
                <DetailRow label="PMI (monthly)" value={moneyDec.format(breakdown.pmi)} />
              ) : (
                <DetailRow label="PMI (monthly)" value="$0.00" />
              )}
            </Stack>

            <SectionTitle>Life of loan (P&amp;I)</SectionTitle>
            <Stack spacing={0}>
              <DetailRow label="Total interest" value={money.format(lifeInterest)} />
              <DetailRow label="Total principal paid" value={money.format(lifePrincipal)} />
            </Stack>

            {prepaySummary ? (
              <>
                <SectionTitle>Prepayment (modeled)</SectionTitle>
                <Stack spacing={0}>
                  <DetailRow label="Extra principal" value={`${money.format(extraPrincipalMonthly)}/mo`} />
                  <DetailRow label="Payoff timing" value={formatYearsMonthsFromMonths(prepaySummary.payoffMo)} />
                  <DetailRow
                    label="Time vs no prepay"
                    value={
                      prepaySummary.monthsSaved > 0
                        ? `${prepaySummary.monthsSaved} mo shorter`
                        : "Same length (try a larger add-on)"
                    }
                  />
                  <DetailRow
                    label="Interest vs no prepay"
                    value={
                      prepaySummary.interestSaved > 0
                        ? `${money.format(prepaySummary.interestSaved)} less`
                        : money.format(0)
                    }
                  />
                </Stack>
              </>
            ) : null}
          </>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, lineHeight: 1.45 }}>
            Enter a purchase price and down payment on the Mortgage tab to see loan terms and life-of-loan totals.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
