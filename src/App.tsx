import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import Alert from "@mui/material/Alert";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useColorScheme, useTheme } from "@mui/material/styles";
import { useRef, useState } from "react";
import { MortgageTab } from "./tabs/MortgageTab";
import { RentalTab } from "./tabs/RentalTab";
import { WhenToSellTab } from "./tabs/WhenToSellTab";
import { useMortgageSyncedState } from "./hooks/useMortgageSyncedState";
import { tryParseMortgageJson } from "./storage/mortgageState";

export default function App() {
  const { setMode } = useColorScheme();
  const theme = useTheme();
  const { state, patch, reset, replace } = useMortgageSyncedState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(
    null
  );

  const isDark = theme.palette.mode === "dark";

  function exportJson() {
    const payload = {
      ...state,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "property-pro.json";
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: "Saved property-pro.json", severity: "success" });
  }

  async function onImportFile(file: File) {
    try {
      const text = await file.text();
      const next = tryParseMortgageJson(text);
      if (!next) {
        setToast({
          message: "Could not read file. Expected JSON with v: 1 or v: 2.",
          severity: "error",
        });
        return;
      }
      replace(next);
      setToast({ message: "Scenario imported.", severity: "success" });
    } catch {
      setToast({ message: "Failed to read file.", severity: "error" });
    }
  }

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "0.5px solid",
          borderColor: "divider",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          bgcolor: isDark ? "rgba(28, 28, 30, 0.72)" : "rgba(242, 242, 247, 0.72)",
        }}
      >
        <Toolbar sx={{ py: 0.25, gap: 0.5 }}>
          <Typography
            component="div"
            sx={{
              flexGrow: 1,
              fontSize: { xs: "1.25rem", sm: "1.375rem" },
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Property Pro
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void onImportFile(file);
            }}
          />
          <Tooltip title="Export JSON">
            <IconButton onClick={exportJson} aria-label="export json" sx={{ color: "text.secondary" }}>
              <FileDownloadOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Import JSON">
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              aria-label="import json"
              sx={{ color: "text.secondary" }}
            >
              <UploadFileOutlinedIcon />
            </IconButton>
          </Tooltip>
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

      <Container maxWidth="lg" sx={{ py: { xs: 1.5, sm: 2 } }}>
        <Box
          role="tablist"
          aria-label="Main sections"
          sx={{
            display: "flex",
            p: 0.5,
            mb: 2,
            borderRadius: 2.5,
            bgcolor: (t) =>
              t.palette.mode === "dark"
                ? "rgba(118, 118, 128, 0.24)"
                : "rgba(118, 118, 128, 0.12)",
            gap: 0.5,
          }}
        >
          {(["Mortgage", "Rental", "When to sell"] as const).map((label, i) => (
            <Button
              key={label}
              size="medium"
              fullWidth
              disableElevation
              id={i === 0 ? "tab-mortgage" : i === 1 ? "tab-rental" : "tab-sell"}
              aria-controls={i === 0 ? "tabpanel-mortgage" : i === 1 ? "tabpanel-rental" : "tabpanel-sell"}
              aria-selected={tab === i}
              role="tab"
              onClick={() => setTab(i)}
              sx={{
                py: 0.75,
                minHeight: 38,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9375rem",
                letterSpacing: "-0.02em",
                color: tab === i ? "text.primary" : "text.secondary",
                bgcolor: tab === i ? "background.paper" : "transparent",
                boxShadow:
                  tab === i
                    ? (th) =>
                        th.palette.mode === "light"
                          ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)"
                          : "0 1px 0 rgba(255,255,255,0.08) inset, 0 0 0 1px rgba(255,255,255,0.06)"
                    : "none",
                "&:hover": {
                  bgcolor: tab === i ? "background.paper" : "action.hover",
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        <Box
          role="tabpanel"
          hidden={tab !== 0}
          id="tabpanel-mortgage"
          aria-labelledby="tab-mortgage"
        >
          <MortgageTab state={state} patch={patch} />
        </Box>
        <Box
          role="tabpanel"
          hidden={tab !== 1}
          id="tabpanel-rental"
          aria-labelledby="tab-rental"
        >
          <RentalTab state={state} patch={patch} />
        </Box>
        <Box role="tabpanel" hidden={tab !== 2} id="tabpanel-sell" aria-labelledby="tab-sell">
          <WhenToSellTab
            state={state}
            onSyncAck={() => setToast({ message: "Exit horizon aligned to your loan term (Mortgage tab).", severity: "success" })}
          />
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ pt: 2, pb: 1 }}>
          Estimates only. Mortgage, Rental, and When to sell share the same saved scenario (price, down, APR, loan).
          Sell analysis uses live values from Mortgage. Saved in this browser (localStorage). Export JSON to back up.
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
