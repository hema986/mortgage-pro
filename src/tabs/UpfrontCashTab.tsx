import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid2";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { UpfrontCashScenarioPanel } from "../components/UpfrontCashScenarioPanel";
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

export type UpfrontCashTabProps = {
  state: AppPersisted;
  patch: (partial: Partial<AppPersisted>) => void;
};

function formatNumberField(value: number): string {
  if (!Number.isFinite(value)) return "";
  return String(value);
}

function formatPercentField(value: number): string {
  if (!Number.isFinite(value)) return "";
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

export function UpfrontCashTab({ state, patch }: UpfrontCashTabProps) {
  const loanAmount = Math.max(0, state.homePrice - state.downPayment);
  const cashToClose = state.downPayment + state.closingCosts + state.miscInitialCash;

  return (
    <Stack spacing={1.25}>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
        Same scenario as <strong>Mortgage</strong> / <strong>Rental</strong>. <strong>Cash to close</strong> and{" "}
        <strong>upfront cash to buy</strong> both mean this total here: down payment + your entered closing bucket + misc
        one-time.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          background: (t) =>
            t.palette.mode === "light"
              ? `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.06)} 0%, ${alpha(t.palette.background.paper, 1)} 55%)`
              : `linear-gradient(145deg, ${alpha(t.palette.primary.main, 0.12)} 0%, ${alpha(t.palette.background.paper, 1)} 50%)`,
        }}
      >
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: "0.06em" }}>
              Cash to close
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.03em", mt: 0.25, lineHeight: 1.1 }}>
              {moneyDec.format(cashToClose)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block", lineHeight: 1.4 }}>
              Cash due at settlement in this model: down + <strong>closing costs</strong> (fees + prepaids you keep in
              one number) + <strong>misc</strong> one-time.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="overline" color="secondary" sx={{ fontWeight: 700, letterSpacing: "0.06em" }}>
              Upfront cash to buy
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.03em", mt: 0.25, lineHeight: 1.1 }}>
              {moneyDec.format(cashToClose)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block", lineHeight: 1.4 }}>
              Total one-time cash to acquire the home in this scenario (same sum as cash to close — different label for
              budgeting).
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ py: 1.25, px: 1.5, "&:last-child": { pb: 1.25 } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
            Your inputs
          </Typography>
          <Grid container spacing={1.25}>
            <Grid size={12}>
              <TextField
                label="Purchase price"
                size="small"
                fullWidth
                helperText="Syncs annual tax $ when you use tax % on Mortgage"
                value={formatNumberField(state.homePrice)}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
                  if (!Number.isFinite(n)) return;
                  const hp = Math.max(0, n);
                  patch({
                    homePrice: hp,
                    downPayment: Math.round((hp * state.downPaymentPercent) / 100),
                    propertyTaxAnnual: Math.round((hp * state.propertyTaxPercent) / 100),
                  });
                }}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Down payment"
                size="small"
                fullWidth
                value={formatNumberField(state.downPayment)}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
                  if (!Number.isFinite(n)) return;
                  const hp = state.homePrice;
                  const dp = Math.max(0, n);
                  const capped = hp > 0 ? Math.min(dp, hp) : dp;
                  patch({
                    downPayment: capped,
                    downPaymentPercent: hp > 0 ? (capped / hp) * 100 : 0,
                  });
                }}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Down %"
                size="small"
                fullWidth
                value={formatPercentField(state.downPaymentPercent)}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
                  if (!Number.isFinite(n)) return;
                  const pct = Math.min(100, Math.max(0, n));
                  const hp = state.homePrice;
                  patch({
                    downPaymentPercent: pct,
                    downPayment: hp > 0 ? Math.round((hp * pct) / 100) : state.downPayment,
                  });
                }}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Closing costs (fees & prepaids bucket)"
                size="small"
                fullWidth
                helperText="Single line in this app — compare to modeled split below"
                value={formatNumberField(state.closingCosts)}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
                  if (Number.isFinite(n)) patch({ closingCosts: Math.max(0, n) });
                }}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Misc. one-time at close"
                size="small"
                fullWidth
                helperText="Moving, repairs, appliances — not monthly"
                value={formatNumberField(state.miscInitialCash)}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
                  if (Number.isFinite(n)) patch({ miscInitialCash: Math.max(0, n) });
                }}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  },
                }}
              />
            </Grid>
            <Grid size={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" flexWrap="wrap" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  Amount financed (loan)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {money.format(loanAmount)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ py: 1.25, px: 1.5, "&:last-child": { pb: 1.25 } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75 }}>
            Modeled buyer costs vs your closing number
          </Typography>
          <UpfrontCashScenarioPanel
            state={state}
            patch={patch}
            loanAmount={loanAmount}
            cashToClose={cashToClose}
            hideEditHint
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
