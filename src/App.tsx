import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Alert from "@mui/material/Alert";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Snackbar,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useColorScheme, useTheme } from "@mui/material/styles";
import { useState } from "react";
import { MortgageTab } from "./tabs/MortgageTab";
import { RentalTab } from "./tabs/RentalTab";
import { UpfrontCashTab } from "./tabs/UpfrontCashTab";
import { WhenToSellTab } from "./tabs/WhenToSellTab";
import { useMortgageSyncedState } from "./hooks/useMortgageSyncedState";
import { downloadScenarioExcel } from "./lib/scenarioExcelExport";

export default function App() {
  const { setMode } = useColorScheme();
  const theme = useTheme();
  const { state, patch, reset, saveToBrowser } = useMortgageSyncedState();
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(
    null
  );

  const isDark = theme.palette.mode === "dark";

  function exportExcel() {
    downloadScenarioExcel(state);
    setToast({
      message: "Exported property-pro-scenario.xlsx (inputs, formulas, and calculated tables).",
      severity: "success",
    });
  }

  function saveToLocalStorage() {
    saveToBrowser();
    setToast({ message: "Saved to this browser (localStorage).", severity: "success" });
  }

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "transparent" }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: (t) => alpha(t.palette.primary.main, t.palette.mode === "light" ? 0.12 : 0.2),
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          bgcolor: (t) =>
            t.palette.mode === "light"
              ? alpha("#E8F2FF", 0.82)
              : alpha("#0D1520", 0.78),
        }}
      >
        <Toolbar sx={{ py: 0.35, gap: 0.75, flexWrap: "wrap" }}>
          <Typography
            component="div"
            sx={{
              flexGrow: 1,
              fontSize: { xs: "1.28rem", sm: "1.42rem" },
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.15,
              background: isDark
                ? "linear-gradient(120deg, #93C5FD 0%, #5EEAD4 55%, #7DD3FC 100%)"
                : "linear-gradient(120deg, #0052CC 0%, #006AFF 40%, #00A67E 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Property Pro
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0, flexWrap: "wrap" }}>
            <Tooltip title="Write the current scenario to this browser (localStorage). Factory defaults for new visitors live in src/defaults/scenario-defaults.json; Reset reloads those defaults.">
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<SaveOutlinedIcon />}
                onClick={saveToLocalStorage}
                aria-label="Save scenario to local storage"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  px: { xs: 1.1, sm: 1.6 },
                }}
              >
                Save
              </Button>
            </Tooltip>
            <Tooltip title="Download Excel workbook: scenario inputs, metric definitions, and calculated tables (multi-sheet).">
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={exportExcel}
                aria-label="Export scenario to Excel"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  px: { xs: 1, sm: 1.5 },
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Export Excel
                </Box>
                <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                  Excel
                </Box>
              </Button>
            </Tooltip>
          </Stack>
          <Tooltip title="Reset to defaults">
            <IconButton onClick={reset} aria-label="reset" sx={{ color: "text.secondary" }}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={isDark ? "Light mode" : "Dark mode"}>
            <IconButton
              onClick={() => setMode(isDark ? "light" : "dark")}
              aria-label="toggle color mode"
              sx={{ color: "text.secondary" }}
            >
              {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 1, sm: 1.15 } }}>
        <Box
          role="tablist"
          aria-label="Main sections"
          sx={{
            display: "flex",
            p: 0.65,
            mb: 1.1,
            borderRadius: 3,
            gap: 0.65,
            background: (t) =>
              t.palette.mode === "light"
                ? `linear-gradient(145deg, ${alpha(t.palette.primary.main, 0.09)}, ${alpha(t.palette.secondary.main, 0.06)})`
                : `linear-gradient(145deg, ${alpha(t.palette.primary.main, 0.16)}, ${alpha(t.palette.secondary.main, 0.08)})`,
            boxShadow: (t) =>
              t.palette.mode === "light"
                ? `0 1px 2px ${alpha(t.palette.primary.dark, 0.06)}, inset 0 1px 0 ${alpha("#fff", 0.65)}`
                : `inset 0 1px 0 ${alpha("#fff", 0.06)}`,
            border: (t) => `1px solid ${alpha(t.palette.primary.main, t.palette.mode === "light" ? 0.14 : 0.22)}`,
          }}
        >
          {(
            [
              { label: "Mortgage", id: "mortgage" },
              { label: "Upfront", id: "upfront" },
              { label: "Rental", id: "rental" },
              { label: "When to sell", id: "sell" },
            ] as const
          ).map(({ label, id }, i) => (
            <Button
              key={id}
              size="medium"
              fullWidth
              disableElevation
              id={`tab-${id}`}
              aria-controls={`tabpanel-${id}`}
              aria-selected={tab === i}
              role="tab"
              onClick={() => setTab(i)}
              sx={{
                py: 0.85,
                minHeight: 42,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: { xs: "0.82rem", sm: "0.95rem" },
                letterSpacing: "-0.022em",
                color: (t) =>
                  tab === i
                    ? "#FFFFFF"
                    : t.palette.mode === "light"
                      ? t.palette.primary.dark
                      : t.palette.primary.light,
                background: (t) =>
                  tab === i
                    ? `linear-gradient(145deg, ${t.palette.primary.main} 0%, ${alpha(t.palette.secondary.main, 0.92)} 100%)`
                    : alpha(t.palette.background.paper, t.palette.mode === "light" ? 0.55 : 0.12),
                boxShadow:
                  tab === i
                    ? (th) =>
                        `0 2px 10px ${alpha(th.palette.primary.main, 0.35)}, 0 0 0 1px ${alpha(th.palette.primary.light, 0.35)}`
                    : "none",
                "&:hover": {
                  background: (t) =>
                    tab === i
                      ? `linear-gradient(145deg, ${alpha(t.palette.primary.main, 0.95)} 0%, ${alpha(t.palette.secondary.main, 0.88)} 100%)`
                      : alpha(t.palette.primary.main, t.palette.mode === "light" ? 0.1 : 0.16),
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        <Box role="tabpanel" hidden={tab !== 0} id="tabpanel-mortgage" aria-labelledby="tab-mortgage">
          <MortgageTab state={state} patch={patch} />
        </Box>
        <Box role="tabpanel" hidden={tab !== 1} id="tabpanel-upfront" aria-labelledby="tab-upfront">
          <UpfrontCashTab state={state} patch={patch} />
        </Box>
        <Box role="tabpanel" hidden={tab !== 2} id="tabpanel-rental" aria-labelledby="tab-rental">
          <RentalTab state={state} patch={patch} />
        </Box>
        <Box role="tabpanel" hidden={tab !== 3} id="tabpanel-sell" aria-labelledby="tab-sell">
          <WhenToSellTab state={state} patch={patch} />
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.45, pt: 1.25, pb: 0.5 }}>
          Estimates only. One scenario across tabs; edits auto-save to localStorage. Use <strong>Save</strong> in the header
          to force a write. <strong>Export Excel</strong> downloads a multi-sheet workbook (inputs, formulas, projections).
        </Typography>
      </Container>

      <Snackbar
        open={toast != null}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity ?? "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast?.message ?? ""}
        </Alert>
      </Snackbar>
    </Box>
  );
}
