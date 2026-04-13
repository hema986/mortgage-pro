import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SyncIcon from "@mui/icons-material/Sync";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { alpha, type Theme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { buildAmortizationSchedule } from "../lib/mortgageMath";
import {
  addYearsToDate,
  balanceAfterPaymentMonth,
  buildRealWealthExitSnapshots,
  buildSellYearlyRows,
  firstYearMajorityEquity,
  REAL_WEALTH_MILESTONE_YEARS,
  type RealWealthExitSnapshot,
} from "../lib/whenToSellMath";
import type { AppPersisted } from "../storage/mortgageState";

const money = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function signedMoney(n: number): string {
  if (!Number.isFinite(n)) return money.format(0);
  if (n < 0) return `−${money.format(Math.abs(n))}`;
  return money.format(n);
}

/** Prefix + for positive amounts in running totals (zero stays plain). */
function plusMoney(n: number): string {
  if (!Number.isFinite(n)) return money.format(0);
  if (n < 0) return signedMoney(n);
  if (n === 0) return money.format(0);
  return `+${money.format(n)}`;
}

export type WhenToSellTabProps = {
  state: AppPersisted;
  onSyncAck?: () => void;
};

export function WhenToSellTab({ state, onSyncAck }: WhenToSellTabProps) {
  const loanAmount = Math.max(0, state.homePrice - state.downPayment);
  const apr = state.interestRateApr;
  const basePrice = Math.max(0, state.homePrice);

  const [exitYears, setExitYears] = useState(7);
  const [appreciationPct, setAppreciationPct] = useState(3);
  const [sellingCostPct, setSellingCostPct] = useState(6);
  const [viewMode, setViewMode] = useState<"compare" | "30" | "15">("compare");
  const [tableDetail, setTableDetail] = useState(false);

  const schedule30 = useMemo(() => buildAmortizationSchedule(loanAmount, apr, 30), [loanAmount, apr]);

  const rows = useMemo(
    () => buildSellYearlyRows(loanAmount, apr, basePrice, appreciationPct, sellingCostPct, 30),
    [loanAmount, apr, basePrice, appreciationPct, sellingCostPct]
  );

  const wealthSnapshots = useMemo(
    () => buildRealWealthExitSnapshots(state, loanAmount, apr, rows, REAL_WEALTH_MILESTONE_YEARS),
    [state, loanAmount, apr, rows]
  );

  const exitRow = rows[Math.min(30, Math.max(1, exitYears)) - 1];
  const equityAdvantage = exitRow ? exitRow.equity15 - exitRow.equity30 : 0;
  const interestSavedVs30 = exitRow ? exitRow.cumInterest30 - exitRow.cumInterest15 : 0;
  const netWalkAwayDelta = exitRow ? exitRow.netProceeds15 - exitRow.netProceeds30 : 0;

  const tip30 = useMemo(
    () => firstYearMajorityEquity(loanAmount, apr, 30, basePrice, appreciationPct, 30),
    [loanAmount, apr, basePrice, appreciationPct]
  );
  const tip15 = useMemo(
    () => firstYearMajorityEquity(loanAmount, apr, 15, basePrice, appreciationPct, 30),
    [loanAmount, apr, basePrice, appreciationPct]
  );

  const payoffYear15 = loanAmount > 0 ? 15 : null;

  const milestones = [3, 5, 7, 10, 15] as const;

  function setExitYearsClamped(y: number) {
    setExitYears(Math.min(30, Math.max(1, Math.round(y))));
  }

  const chartYears = rows.map((r) => r.year);
  const eq30Pts = rows.map((r) => r.equity30);
  const eq15Pts = rows.map((r) => r.equity15);
  const int30Pts = rows.map((r) => r.cumInterest30);
  const int15Pts = rows.map((r) => r.cumInterest15);

  const show30 = viewMode !== "15";
  const show15 = viewMode !== "30";

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45 }}>
        Uses your <strong>Mortgage</strong> numbers (price, down payment, interest rate) and your <strong>Rental</strong>{" "}
        income and costs. We compare the <strong>same loan size</strong> on a <strong>30-year</strong> payment plan vs a{" "}
        <strong>15-year</strong> plan. In real life 15-year rates are often lower — change the rate on Mortgage if you
        want that.
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "action.hover"),
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Edit scenario
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: "block", mt: 0.25 }}>
            Expand a section to change inputs. Summaries show your current choices when collapsed.
          </Typography>
        </Box>

        <Accordion
          defaultExpanded
          disableGutters
          elevation={0}
          sx={{ "&:before": { display: "none" }, boxShadow: "none" }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, minHeight: 48, "& .MuiAccordionSummary-content": { my: 1 } }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Sale price &amp; closing
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.35 }}>
                {appreciationPct}% / yr appreciation · {sellingCostPct}% closing at sale
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Annual appreciation"
                  size="small"
                  fullWidth
                  value={String(appreciationPct)}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/[^0-9.-]/g, ""));
                    if (Number.isFinite(n)) setAppreciationPct(Math.min(15, Math.max(-5, n)));
                  }}
                  helperText="Yearly growth on purchase price until sale"
                  slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Closing cost at sale"
                  size="small"
                  fullWidth
                  value={String(sellingCostPct)}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
                    if (Number.isFinite(n)) setSellingCostPct(Math.min(15, Math.max(0, n)));
                  }}
                  helperText="Rough share of sale price (agent, title, transfer, etc.)"
                  slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Divider />

        <Accordion defaultExpanded disableGutters elevation={0} sx={{ "&:before": { display: "none" }, boxShadow: "none" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, minHeight: 48, "& .MuiAccordionSummary-content": { my: 1 } }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Exit timing &amp; charts
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.35 }}>
                Year {exitYears} · charts:{" "}
                {viewMode === "compare" ? "side-by-side" : viewMode === "30" ? "30-yr focus" : "15-yr focus"}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
            <Stack spacing={2}>
              <Stack direction="row" flexWrap="wrap" justifyContent="flex-end">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SyncIcon />}
                  onClick={() => {
                    setExitYearsClamped(state.termYears);
                    onSyncAck?.();
                  }}
                >
                  Align exit to loan term
                </Button>
              </Stack>
              <TextField
                label="Years to sale"
                type="number"
                size="small"
                sx={{ maxWidth: { xs: "100%", sm: 160 } }}
                helperText="1–30 · calendar hint below"
                slotProps={{
                  htmlInput: { min: 1, max: 30, step: 1 },
                }}
                value={exitYears}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") return;
                  const n = Number(raw);
                  if (!Number.isFinite(n)) return;
                  setExitYearsClamped(n);
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                ≈ calendar exit about{" "}
                {addYearsToDate(new Date(), exitYears).toLocaleDateString(undefined, { month: "short", year: "numeric" })}{" "}
                (from today, rounded to full years)
              </Typography>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Chart view
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={viewMode}
                  onChange={(_, v) => v && setViewMode(v)}
                  aria-label="15 vs 30 view"
                >
                  <ToggleButton value="30">30-yr focus</ToggleButton>
                  <ToggleButton value="15">15-yr focus</ToggleButton>
                  <ToggleButton value="compare">Side-by-side</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Divider />

        <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" }, boxShadow: "none" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, minHeight: 48, "& .MuiAccordionSummary-content": { my: 1 } }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Year-by-year table
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.35 }}>
                Columns: {tableDetail ? "full (includes equity %)" : "essential"}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, lineHeight: 1.45 }}>
              Applies to the projection table at the bottom of this tab.
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={tableDetail ? "detailed" : "simple"}
              onChange={(_, v) => {
                if (v === "simple") setTableDetail(false);
                else if (v === "detailed") setTableDetail(true);
              }}
              aria-label="Year table columns"
            >
              <ToggleButton value="simple">Essential columns</ToggleButton>
              <ToggleButton value="detailed">+ Equity %</ToggleButton>
            </ToggleButtonGroup>
          </AccordionDetails>
        </Accordion>
      </Paper>

      <Stack spacing={1.5}>
        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "action.hover" }}>
          <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              How we calculate &quot;your total gain&quot;
            </Typography>
            <Box component="ol" sx={{ m: 0, pl: 2.25, color: "text.secondary", "& li": { mb: 1, lineHeight: 1.5 } }}>
              <Typography component="li" variant="body2">
                <strong>Money you put in at the start</strong> — down payment, closing costs, and misc one-time cash
                (same numbers as on the Rental tab).
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Rent money (added up year by year)</strong> — what is left each year after operating costs and
                the mortgage payment, using your rent and expense settings. If this is negative, the model assumes you
                funded that gap from other savings.
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Cash from selling</strong> — estimated sale price, minus what you still owe the bank, minus
                closing cost at sale ({sellingCostPct}% of the sale). The sale price grows at {appreciationPct}% per year from
                today&apos;s purchase price.
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Your total gain</strong> = cash from selling + rent money added up − money you put in at the
                start. Interest you paid the bank is <em>already inside</em> the mortgage part of step 2, so we do not
                subtract it again.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ px: 0.25 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Your total gain by exit year ({REAL_WEALTH_MILESTONE_YEARS.join(", ")})
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45, display: "block", mt: 0.5, mb: 1 }}>
            Same exit year, two loan lengths. <strong>Left border + chip</strong> summarize both paths.{" "}
            <strong>Bottom row cells</strong> are green if that path is ahead, red if the model shows a net loss, amber
            highlight on rent if rent cash flow is negative.
          </Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mb: 1.5 }}>
            <Chip size="small" color="success" variant="outlined" label="Green edge: both paths gain" />
            <Chip size="small" color="error" variant="outlined" label="Red edge: both paths lose" />
            <Chip size="small" color="warning" variant="outlined" label="Amber edge: gain on one, loss on other" />
          </Stack>
        </Box>
        <Grid container spacing={1.5}>
          {wealthSnapshots.map((w) => (
            <Grid key={w.year} size={{ xs: 12, sm: 6, lg: 4 }}>
              <MilestoneWealthCard snapshot={w} />
            </Grid>
          ))}
        </Grid>

        <Accordion variant="outlined" disableGutters sx={{ borderRadius: 2, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Optional: interest paid to the bank and loan principal (detail only)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.25, lineHeight: 1.45 }}>
              These rows are for curiosity. They are <strong>not</strong> extra subtractions from your total gain —
              interest is already counted inside your yearly rent line (via the mortgage payment).
            </Typography>
            <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Sell after</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Interest (30-yr)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Interest (15-yr)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Principal paid (30-yr)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Principal paid (15-yr)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wealthSnapshots.map((w) => (
                    <TableRow key={w.year}>
                      <TableCell>{w.year} yr</TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {money.format(w.interestToBank30)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {money.format(w.interestToBank15)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {money.format(w.principalPaidIntoLoan30)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {money.format(w.principalPaidIntoLoan15)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </Stack>

      <Grid container spacing={1.25} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              borderRadius: 2,
              borderColor: (theme) => theme.palette.divider,
              boxShadow: (theme) =>
                theme.palette.mode === "dark" ? "0 0 0 1px rgba(255,255,255,0.06) inset" : "0 1px 0 rgba(0,0,0,0.04)",
            }}
          >
            <CardContent>
              <Stack direction="row" flexWrap="wrap" alignItems="baseline" justifyContent="space-between" gap={1} sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    If you sell in year {exitYears} — where does the sale check come from?
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45, display: "block", maxWidth: 560 }}>
                    Estimated sale price, minus what you still owe, minus closing cost at sale ({sellingCostPct}% of the sale).
                    Same price growth ({appreciationPct}%/year) for both loans.
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: "ui-monospace, monospace", fontSize: "0.7rem", lineHeight: 1.4 }}
                >
                  FV = {money.format(basePrice)} × (1 + {appreciationPct}%)
                  <sup>{exitYears}</sup> = {exitRow ? money.format(exitRow.futureHomeValue) : money.format(0)}
                </Typography>
              </Stack>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: "100%" }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.02em" }}>
                      30-year loan
                    </Typography>
                    {exitRow ? (
                      <WealthAtExitFormula
                        futureValue={exitRow.futureHomeValue}
                        balance={exitRow.balance30}
                        sellingCostPct={sellingCostPct}
                        netProceeds={exitRow.netProceeds30}
                      />
                    ) : null}
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: "100%" }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.02em" }}>
                      15-year loan
                    </Typography>
                    {exitRow ? (
                      <WealthAtExitFormula
                        futureValue={exitRow.futureHomeValue}
                        balance={exitRow.balance15}
                        sellingCostPct={sellingCostPct}
                        netProceeds={exitRow.netProceeds15}
                      />
                    ) : null}
                  </Paper>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 1.75,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(144, 202, 249, 0.08)" : "rgba(25, 118, 210, 0.06)"),
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  Extra cash at closing with a 15-year loan: {money.format(netWalkAwayDelta)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: "block", mt: 0.5 }}>
                  Sale check with 15-year financing minus sale check with 30-year financing (same sale price). Does not
                  count the higher monthly payment on the 15-year path.
                </Typography>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: "block", mt: 1.25 }}>
                Before selling costs, (estimated value − loan) for the 15-year path minus the 30-year path:{" "}
                {signedMoney(equityAdvantage)}. Closing cost at sale applies to the same sale price for both, so cash at closing
                can move differently.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card variant="outlined" sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Interest paid to the bank by this exit (30-yr minus 15-yr)
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", mt: 0.5 }}>
                {money.format(interestSavedVs30)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35, display: "block", mt: 0.75 }}>
                How much more interest the 30-year plan paid through this month. Not the same as extra cash in your
                pocket — it is mostly already reflected in smaller mortgage payments vs the 15-year plan.
              </Typography>
              <Divider sx={{ my: 1.25 }} />
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35, display: "block" }}>
                Year table &quot;Net&quot; = sale price − loan balance − {sellingCostPct}% closing at sale. Same idea as
                the breakdown on the left.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Exit milestones (net proceeds)
          </Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            {milestones.map((yr) => {
              const row = rows[yr - 1];
              if (!row) return null;
              const w15 = row.netProceeds15 >= row.netProceeds30;
              return (
                <Box
                  key={yr}
                  sx={{
                    flex: "1 1 132px",
                    minWidth: { xs: "calc(50% - 8px)", sm: 140 },
                    maxWidth: { sm: 200 },
                    p: 1.25,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: (theme) =>
                      w15
                        ? theme.palette.mode === "dark"
                          ? "rgba(46, 125, 50, 0.2)"
                          : "rgba(46, 125, 50, 0.12)"
                        : theme.palette.mode === "dark"
                          ? "rgba(211, 47, 47, 0.2)"
                          : "rgba(211, 47, 47, 0.1)",
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Year {yr}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {w15 ? "15-yr ahead" : "30-yr ahead"}
                  </Typography>
                  <Typography variant="caption" sx={{ fontVariantNumeric: "tabular-nums", display: "block", mt: 0.5 }}>
                    Δ {money.format(Math.abs(row.netProceeds15 - row.netProceeds30))}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={1.25}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Majority equity (≈50%)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Green mindset: your equity share of appraised value crosses half. Red: still owing more than half of
                value in loan at year-end on that path.
              </Typography>
              <Typography variant="body2">
                <strong>30-yr:</strong> first year ≥ 50% equity — {tip30 != null ? `Year ${tip30}` : "Not within 30 yr"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>15-yr:</strong> first year ≥ 50% equity — {tip15 != null ? `Year ${tip15}` : "Not within 30 yr"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Payoff status
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                15-year loan is modeled paid in full after month 180 (year {payoffYear15 ?? "—"}). After payoff, only
                appreciation affects net vs remaining 30-yr balance.
              </Typography>
              <Typography variant="body2">
                30-yr remaining balance @ year 15:{" "}
                <strong>{money.format(balanceAfterPaymentMonth(schedule30, 15 * 12))}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Equity build (FV − balance)
          </Typography>
          <EquitySparkline years={chartYears} series30={eq30Pts} series15={eq15Pts} show30={show30} show15={show15} />
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Cumulative interest paid (P&amp;I)
          </Typography>
          <EquitySparkline years={chartYears} series30={int30Pts} series15={int15Pts} show30={show30} show15={show15} />
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Year-by-year projection
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, lineHeight: 1.45 }}>
            Column layout is in <strong>Edit scenario</strong> → Year-by-year table.
          </Typography>
          <TableContainer sx={{ maxHeight: 380, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "background.paper" }}>Year</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "background.paper" }}>
                    Future value
                  </TableCell>
                  {show30 ? (
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "background.paper" }}>
                      Bal 30
                    </TableCell>
                  ) : null}
                  {show15 ? (
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "background.paper" }}>
                      Bal 15
                    </TableCell>
                  ) : null}
                  {show30 ? (
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "background.paper" }}>
                      Net 30
                    </TableCell>
                  ) : null}
                  {show15 ? (
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "background.paper" }}>
                      Net 15
                    </TableCell>
                  ) : null}
                  {tableDetail && show30 ? (
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "background.paper" }}>
                      Eq% 30
                    </TableCell>
                  ) : null}
                  {tableDetail && show15 ? (
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "background.paper" }}>
                      Eq% 15
                    </TableCell>
                  ) : null}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => {
                  const hi = r.year === exitYears;
                  return (
                    <TableRow
                      key={r.year}
                      sx={{
                        bgcolor: hi ? "action.selected" : undefined,
                        "&:hover": { bgcolor: hi ? "action.selected" : "action.hover" },
                      }}
                    >
                      <TableCell sx={{ fontWeight: hi ? 700 : 400 }}>{r.year}</TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {money.format(r.futureHomeValue)}
                      </TableCell>
                      {show30 ? (
                        <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                          {money.format(r.balance30)}
                        </TableCell>
                      ) : null}
                      {show15 ? (
                        <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                          {money.format(r.balance15)}
                        </TableCell>
                      ) : null}
                      {show30 ? (
                        <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                          {money.format(r.netProceeds30)}
                        </TableCell>
                      ) : null}
                      {show15 ? (
                        <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                          {money.format(r.netProceeds15)}
                        </TableCell>
                      ) : null}
                      {tableDetail && show30 ? (
                        <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                          {r.equityPct30.toFixed(0)}%
                        </TableCell>
                      ) : null}
                      {tableDetail && show15 ? (
                        <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                          {r.equityPct15.toFixed(0)}%
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Highlighted row matches <strong>{exitYears}-yr</strong> exit. Net = future value − balance − closing at sale (
            {sellingCostPct}% of sale).
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

type MilestoneScenario = "bothGain" | "bothLoss" | "mixed";

function milestoneScenario(g30: number, g15: number): MilestoneScenario {
  if (g30 >= 0 && g15 >= 0) return "bothGain";
  if (g30 < 0 && g15 < 0) return "bothLoss";
  return "mixed";
}

function MilestoneWealthCard(props: { snapshot: RealWealthExitSnapshot }) {
  const w = props.snapshot;
  const g30 = w.realWealthMade30;
  const g15 = w.realWealthMade15;
  const scenario = milestoneScenario(g30, g15);

  const chipProps =
    scenario === "bothGain"
      ? { label: "Both: gain", color: "success" as const }
      : scenario === "bothLoss"
        ? { label: "Both: loss", color: "error" as const }
        : { label: "Mixed", color: "warning" as const };

  const rentCellSx = (n: number) => (theme: Theme) => ({
    fontVariantNumeric: "tabular-nums" as const,
    py: 0.65,
    bgcolor: n < 0 ? alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.14 : 0.1) : undefined,
    color: n < 0 ? "warning.dark" : undefined,
  });

  const gainCellSx = (n: number) => (theme: Theme) => ({
    fontVariantNumeric: "tabular-nums" as const,
    fontWeight: 700,
    pt: 1,
    borderTop: "1px solid",
    borderColor: "divider",
    color: n > 0 ? "success.dark" : n < 0 ? "error.main" : "text.primary",
    bgcolor:
      n > 0
        ? alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.18 : 0.12)
        : n < 0
          ? alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.2 : 0.1)
          : alpha(theme.palette.action.hover, theme.palette.mode === "dark" ? 0.12 : 0.08),
  });

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        height: "100%",
        borderRadius: 2,
        borderLeftWidth: 5,
        borderLeftStyle: "solid",
        borderLeftColor:
          scenario === "bothGain"
            ? theme.palette.success.main
            : scenario === "bothLoss"
              ? theme.palette.error.main
              : theme.palette.warning.main,
        bgcolor:
          scenario === "bothGain"
            ? alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.06 : 0.04)
            : scenario === "bothLoss"
              ? alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.07 : 0.04)
              : alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.07 : 0.05),
      })}
    >
      <CardContent sx={{ "&:last-child": { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            Sell after year {w.year}
          </Typography>
          <Chip size="small" variant="outlined" {...chipProps} sx={{ fontWeight: 700, flexShrink: 0 }} />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.25, lineHeight: 1.45 }}>
          Rent uses your Rental tab; mortgage payment is for 30- vs 15-year (same rate). Amber cells = negative rent
          drag in the model.
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, borderBottom: "none", py: 0.5 }} />
              <TableCell align="right" sx={{ fontWeight: 600, py: 0.5 }}>
                30-yr loan
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, py: 0.5 }}>
                15-yr loan
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ color: "text.secondary", borderBottom: "none", py: 0.65, maxWidth: 168 }}>
                Cash you put in at closing
              </TableCell>
              <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", py: 0.65 }}>
                {money.format(w.initialCashInvested)}
              </TableCell>
              <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", py: 0.65 }}>
                {money.format(w.initialCashInvested)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "text.secondary", borderBottom: "none", py: 0.65 }}>
                + Rent (after bills &amp; mortgage)
              </TableCell>
              <TableCell align="right" sx={rentCellSx(w.cumulativeRentalCashFlow30)}>
                {plusMoney(w.cumulativeRentalCashFlow30)}
              </TableCell>
              <TableCell align="right" sx={rentCellSx(w.cumulativeRentalCashFlow15)}>
                {plusMoney(w.cumulativeRentalCashFlow15)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "text.secondary", borderBottom: "none", py: 0.65 }}>
                + Cash when you sell
              </TableCell>
              <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", py: 0.65 }}>
                {plusMoney(w.netProceeds30)}
              </TableCell>
              <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", py: 0.65 }}>
                {plusMoney(w.netProceeds15)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  pt: 1,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                = Your total gain
              </TableCell>
              <TableCell align="right" sx={gainCellSx(g30)}>
                {signedMoney(g30)}
              </TableCell>
              <TableCell align="right" sx={gainCellSx(g15)}>
                {signedMoney(g15)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, lineHeight: 1.45 }}>
          Your total gain = rent + cash when you sell − cash you put in at closing.
        </Typography>
      </CardContent>
    </Card>
  );
}

function WealthAtExitFormula(props: {
  futureValue: number;
  balance: number;
  sellingCostPct: number;
  netProceeds: number;
}) {
  const sellingCosts = props.futureValue * (props.sellingCostPct / 100);
  const row = (label: string, amountDisplay: string) => (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
        {amountDisplay}
      </Typography>
    </Stack>
  );

  return (
    <Stack spacing={0.85} sx={{ mt: 1.25 }}>
      {row("Estimated sale price", money.format(props.futureValue))}
      {row("Loan payoff", `−${money.format(props.balance)}`)}
      {row(`Closing at sale (${props.sellingCostPct}% of price)`, `−${money.format(sellingCosts)}`)}
      <Divider sx={{ my: 0.25 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          = Net cash at closing
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {money.format(props.netProceeds)}
        </Typography>
      </Stack>
    </Stack>
  );
}

function EquitySparkline(props: {
  years: number[];
  series30: number[];
  series15: number[];
  show30: boolean;
  show15: boolean;
}) {
  const w = 720;
  const h = 200;
  const pad = 36;
  const all = [...(props.show30 ? props.series30 : []), ...(props.show15 ? props.series15 : [])];
  const maxV = Math.max(1, ...all);
  const minV = 0;
  const x = (i: number) => pad + (i / Math.max(1, props.years.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - minV) / (maxV - minV)) * (h - pad * 2);

  const line = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-label="Comparison chart">
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="currentColor" strokeOpacity={0.2} />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="currentColor" strokeOpacity={0.2} />
        {props.show30 ? (
          <path d={line(props.series30)} fill="none" stroke="#1976d2" strokeWidth={2} />
        ) : null}
        {props.show15 ? (
          <path d={line(props.series15)} fill="none" stroke="#2e7d32" strokeWidth={2} />
        ) : null}
        <text x={w - pad} y={pad} textAnchor="end" fontSize="11" fill="currentColor" opacity={0.7}>
          {props.show30 ? "Blue 30-yr" : ""} {props.show30 && props.show15 ? " · " : ""}
          {props.show15 ? "Green 15-yr" : ""}
        </text>
      </svg>
    </Box>
  );
}
