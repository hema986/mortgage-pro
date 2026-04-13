import { createTheme } from "@mui/material/styles";

/** Approximates iOS system colors & hierarchy (HIG-style, web-safe). */
const systemBlueLight = "#007AFF";
const systemBlueDark = "#0A84FF";
const groupedBgLight = "#F2F2F7";
const groupedBgDark = "#000000";
const elevatedLight = "#FFFFFF";
const elevatedDark = "#1C1C1E";
const separatorLight = "rgba(60, 60, 67, 0.29)";
const separatorDark = "rgba(84, 84, 88, 0.65)";

export const appTheme = createTheme({
  /** Tighter rhythm: spacing(n) = 6n px (default theme uses 8n). */
  spacing: 6,
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        primary: { main: systemBlueLight, contrastText: "#FFFFFF" },
        secondary: { main: "rgba(60, 60, 67, 0.72)" },
        text: {
          primary: "rgba(0, 0, 0, 0.88)",
          secondary: "rgba(60, 60, 67, 0.6)",
          disabled: "rgba(60, 60, 67, 0.3)",
        },
        background: {
          default: groupedBgLight,
          paper: elevatedLight,
        },
        divider: separatorLight,
        action: {
          active: "rgba(0, 0, 0, 0.45)",
          hover: "rgba(60, 60, 67, 0.08)",
          selected: "rgba(0, 122, 255, 0.12)",
          disabled: "rgba(60, 60, 67, 0.18)",
          disabledBackground: "rgba(120, 120, 128, 0.16)",
        },
      },
    },
    dark: {
      palette: {
        mode: "dark",
        primary: { main: systemBlueDark, contrastText: "#FFFFFF" },
        secondary: { main: "rgba(235, 235, 245, 0.72)" },
        text: {
          primary: "rgba(255, 255, 255, 0.92)",
          secondary: "rgba(235, 235, 245, 0.6)",
          disabled: "rgba(235, 235, 245, 0.3)",
        },
        background: {
          default: groupedBgDark,
          paper: elevatedDark,
        },
        divider: separatorDark,
        action: {
          active: "rgba(255, 255, 255, 0.55)",
          hover: "rgba(255, 255, 255, 0.06)",
          selected: "rgba(10, 132, 255, 0.22)",
          disabled: "rgba(235, 235, 245, 0.3)",
          disabledBackground: "rgba(120, 120, 128, 0.24)",
        },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
      letterSpacing: "-0.022em",
      lineHeight: 1.15,
    },
    h5: { fontWeight: 600, letterSpacing: "-0.018em" },
    h6: { fontWeight: 600, letterSpacing: "-0.015em" },
    subtitle1: { letterSpacing: "-0.012em" },
    subtitle2: { letterSpacing: "-0.008em", fontWeight: 500 },
    body1: { letterSpacing: "-0.011em", lineHeight: 1.47 },
    body2: { letterSpacing: "-0.008em", lineHeight: 1.43 },
    caption: { letterSpacing: "-0.006em" },
    overline: { letterSpacing: "0.06em", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "-0.01em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          textRendering: "optimizeLegibility",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
        disableElevation: true,
        size: "small",
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 14,
          minHeight: 36,
        },
        contained: {
          boxShadow: "none",
          "&:active": {
            transform: "scale(0.98)",
            transition: "transform 0.1s ease",
          },
        },
      },
    },
    MuiIconButton: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: 8,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          border: "none",
          borderRadius: 10,
          backgroundImage: "none",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)"
              : "0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 0 0 1px rgba(255, 255, 255, 0.04)",
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
        margin: "dense",
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 12,
          "&:last-child": { paddingBottom: 12 },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 44,
          paddingLeft: 12,
          paddingRight: 12,
        },
        content: { marginTop: 8, marginBottom: 8 },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: { padding: 12, paddingTop: 0 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(120, 120, 128, 0.06)"
              : "rgba(120, 120, 128, 0.16)",
          "& fieldset": {
            borderColor: "transparent",
          },
          "&:hover fieldset": {
            borderColor: theme.palette.divider,
          },
          "&.Mui-focused fieldset": {
            borderWidth: 2,
            borderColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 10,
          paddingRight: 10,
        },
        head: ({ theme }) => ({
          fontWeight: 600,
          fontSize: "0.75rem",
          color: theme.palette.text.secondary,
          letterSpacing: "-0.01em",
          paddingTop: 8,
          paddingBottom: 8,
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      },
    },
    MuiTablePagination: {
      defaultProps: { size: "small" },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 48,
          "@media (min-width: 600px)": { minHeight: 48 },
        },
      },
    },
  },
});
