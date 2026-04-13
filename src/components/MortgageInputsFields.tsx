import { InputAdornment } from "@mui/material";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import type { AppPersisted } from "../storage/mortgageState";

export type MortgageInputsFieldsProps = {
  state: AppPersisted;
  patch: (partial: Partial<AppPersisted>) => void;
  /** Helper under purchase price (e.g. cap rate note on Mortgage tab). */
  purchasePriceHelperText?: string;
  /** Defaults to medium (Mortgage / Rental). */
  inputSize?: "small" | "medium";
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

export function MortgageInputsFields({
  state,
  patch,
  purchasePriceHelperText = "Used as property value for rental cap rate",
  inputSize = "medium",
}: MortgageInputsFieldsProps) {
  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Purchase price"
          size={inputSize}
          fullWidth
          helperText={purchasePriceHelperText}
          value={formatNumberField(state.homePrice)}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
            if (!Number.isFinite(n)) return;
            const hp = Math.max(0, n);
            const dpPct = state.downPaymentPercent;
            const taxPct = state.propertyTaxPercent;
            patch({
              homePrice: hp,
              downPayment: Math.round((hp * dpPct) / 100),
              propertyTaxAnnual: Math.round((hp * taxPct) / 100),
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
          label="Down payment (amount)"
          size={inputSize}
          fullWidth
          helperText="Updates % of purchase price"
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
          label="Down payment (%)"
          size={inputSize}
          fullWidth
          helperText="Keeps same % when you change purchase price"
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
          label="Interest rate (APR)"
          size={inputSize}
          fullWidth
          value={formatNumberField(state.interestRateApr)}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
            if (Number.isFinite(n)) patch({ interestRateApr: Math.max(0, n) });
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
          label="Loan term"
          size={inputSize}
          fullWidth
          select
          SelectProps={{ native: true }}
          value={state.termYears}
          onChange={(e) => patch({ termYears: Number(e.target.value) })}
        >
          {[10, 15, 20, 25, 30].map((y) => (
            <option key={y} value={y}>
              {y} years
            </option>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Property tax (annual)"
          size={inputSize}
          fullWidth
          helperText="Dollar amount per year"
          value={formatNumberField(state.propertyTaxAnnual)}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
            if (!Number.isFinite(n)) return;
            const hp = state.homePrice;
            const annual = Math.max(0, n);
            patch({
              propertyTaxAnnual: annual,
              propertyTaxPercent: hp > 0 ? (annual / hp) * 100 : 0,
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
          label="Property tax (%)"
          size={inputSize}
          fullWidth
          helperText="Annual tax as % of purchase price"
          value={formatPercentField(state.propertyTaxPercent)}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
            if (!Number.isFinite(n)) return;
            const pct = Math.min(100, Math.max(0, n));
            const hp = state.homePrice;
            patch({
              propertyTaxPercent: pct,
              propertyTaxAnnual: hp > 0 ? Math.round((hp * pct) / 100) : state.propertyTaxAnnual,
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
          label="Home insurance (annual)"
          size={inputSize}
          fullWidth
          value={formatNumberField(state.insuranceAnnual)}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
            if (Number.isFinite(n)) patch({ insuranceAnnual: Math.max(0, n) });
          }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            },
          }}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="HOA (monthly)"
          size={inputSize}
          fullWidth
          value={formatNumberField(state.hoaMonthly)}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
            if (Number.isFinite(n)) patch({ hoaMonthly: Math.max(0, n) });
          }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            },
          }}
        />
      </Grid>
    </Grid>
  );
}
