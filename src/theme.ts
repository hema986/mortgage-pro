import { alpha, createTheme, type Theme } from "@mui/material/styles";

/** Zillow-adjacent blues + greens; typography & surfaces stay Apple-like (SF stack, soft radii). */
const zillowBlue = "#006AFF";
const zillowBlueLight = "#338CFF";
const zillowBlueDark = "#0052CC";
const zillowTeal = "#00A67E";
const zillowGreen = "#1CAC78";
const zillowBlueDarkMode = "#4DA3FF";

const groupedBgLight = "#F0F4FA";
const groupedBgDark = "#05080D";
const elevatedLight = "#FFFFFF";
const elevatedDark = "#141A22";
const separatorLight = "rgba(0, 82, 204, 0.12)";
const separatorDark = "rgba(77, 163, 255, 0.18)";

export const appTheme = createTheme({
  spacing: 6,
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        primary: {
          main: zillowBlue,
          light: zillowBlueLight,
          dark: zillowBlueDark,
          contrastText: "#FFFFFF",
        },
        secondary: {
          main: zillowTeal,
          light: "#33B894",
          dark: "#008563",
          contrastText: "#FFFFFF",
        },
        success: {
          main: zillowGreen,
          light: "#47C08F",
          dark: "#158A5C",
          contrastText: "#FFFFFF",
        },
        info: {
          main: "#0EA5E9",
          contrastText: "#FFFFFF",
        },
        warning: {
          main: "#F59E0B",
          contrastText: "#1a1000",
        },
        error: {
          main: "#DC2626",
          contrastText: "#FFFFFF",
        },
        text: {
          primary: "rgba(15, 23, 42, 0.92)",
          secondary: "rgba(51, 65, 85, 0.72)",
          disabled: "rgba(100, 116, 139, 0.45)",
        },
        background: {
          default: groupedBgLight,
          paper: elevatedLight,
        },
        divider: separatorLight,
        action: {
          active: alpha(zillowBlueDark, 0.55),
          hover: alpha(zillowBlue, 0.06),
          selected: alpha(zillowBlue, 0.12),
          disabled: "rgba(100, 116, 139, 0.28)",
          disabledBackground: "rgba(148, 163, 184, 0.18)",
        },
      },
    },
    dark: {
      palette: {
        mode: "dark",
        primary: {
          main: zillowBlueDarkMode,
          light: "#7DCBFF",
          dark: zillowBlue,
          contrastText: "#041018",
        },
        secondary: {
          main: "#2DD4BF",
          light: "#5EEAD4",
          dark: "#0D9488",
          contrastText: "#041018",
        },
        success: {
          main: "#34D399",
          light: "#6EE7B7",
          dark: zillowGreen,
          contrastText: "#041018",
        },
        info: {
          main: "#38BDF8",
          contrastText: "#041018",
        },
        warning: {
          main: "#FBBF24",
          contrastText: "#1a1000",
        },
        error: {
          main: "#F87171",
          contrastText: "#1a0505",
        },
        text: {
          primary: "rgba(248, 250, 252, 0.95)",
          secondary: "rgba(203, 213, 225, 0.72)",
          disabled: "rgba(148, 163, 184, 0.45)",
        },
        background: {
          default: groupedBgDark,
          paper: elevatedDark,
        },
        divider: separatorDark,
        action: {
          active: "rgba(255, 255, 255, 0.65)",
          hover: alpha(zillowBlueDarkMode, 0.12),
          selected: alpha(zillowBlueDarkMode, 0.2),
          disabled: "rgba(148, 163, 184, 0.35)",
          disabledBackground: "rgba(71, 85, 105, 0.35)",
        },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
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
    subtitle2: { letterSpacing: "-0.008em", fontWeight: 600 },
    body1: { letterSpacing: "-0.011em", lineHeight: 1.47 },
    body2: { letterSpacing: "-0.008em", lineHeight: 1.43 },
    caption: { letterSpacing: "-0.006em" },
    overline: { letterSpacing: "0.06em", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "-0.01em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: ({ theme }: { theme: Theme }) => ({
          textRendering: "optimizeLegibility",
          backgroundAttachment: "fixed",
          backgroundImage:
            theme.palette.mode === "light"
              ? `linear-gradient(165deg, ${alpha(zillowBlue, 0.07)} 0%, ${alpha(zillowTeal, 0.04)} 28%, ${groupedBgLight} 52%, #E8EEF6 100%)`
              : `linear-gradient(165deg, ${alpha(zillowBlueDarkMode, 0.12)} 0%, ${alpha("#0D9488", 0.06)} 35%, ${groupedBgDark} 55%, #000000 100%)`,
        }),
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
          borderRadius: 12,
          paddingInline: 16,
          minHeight: 38,
        },
        contained: ({ theme }) => ({
          boxShadow:
            theme.palette.mode === "light"
              ? `0 1px 2px ${alpha(zillowBlueDark, 0.12)}, 0 2px 8px ${alpha(zillowBlue, 0.18)}`
              : `0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px ${alpha(zillowBlueDarkMode, 0.25)}`,
          "&:hover": {
            boxShadow:
              theme.palette.mode === "light"
                ? `0 2px 6px ${alpha(zillowBlueDark, 0.18)}, 0 4px 14px ${alpha(zillowBlue, 0.22)}`
                : `0 2px 8px rgba(0,0,0,0.45), 0 0 0 1px ${alpha(zillowBlueDarkMode, 0.35)}`,
          },
          "&:active": {
            transform: "scale(0.98)",
            transition: "transform 0.12s ease",
          },
        }),
        containedSecondary: ({ theme }) => ({
          boxShadow:
            theme.palette.mode === "light"
              ? `0 1px 2px ${alpha(zillowTeal, 0.2)}, 0 2px 8px ${alpha(zillowTeal, 0.15)}`
              : undefined,
        }),
        outlined: ({ theme }) => ({
          borderWidth: 1.5,
          borderColor: alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.35 : 0.45),
          "&:hover": {
            borderWidth: 1.5,
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
            borderColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiIconButton: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          padding: 8,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          border: "none",
          borderRadius: 14,
          backgroundImage: "none",
          boxShadow:
            theme.palette.mode === "light"
              ? `0 1px 2px ${alpha(zillowBlueDark, 0.06)}, 0 4px 16px ${alpha(zillowBlue, 0.08)}, 0 0 0 1px ${alpha(zillowBlue, 0.06)}`
              : `0 1px 0 ${alpha("#fff", 0.06)} inset, 0 0 0 1px ${alpha(zillowBlueDarkMode, 0.12)}, 0 8px 24px rgba(0,0,0,0.35)`,
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        outlined: ({ theme }) => ({
          borderColor: alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.14 : 0.22),
          backgroundColor:
            theme.palette.mode === "light"
              ? alpha("#fff", 0.72)
              : alpha(elevatedDark, 0.85),
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
        margin: "dense",
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: 2,
          lineHeight: 1.2,
          fontSize: "0.68rem",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.82rem",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 14,
          "&:last-child": { paddingBottom: 14 },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 44,
          paddingLeft: 14,
          paddingRight: 14,
        },
        content: { marginTop: 8, marginBottom: 8 },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: { padding: 14, paddingTop: 0 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          backgroundColor:
            theme.palette.mode === "light"
              ? alpha(zillowBlue, 0.04)
              : alpha(zillowBlueDarkMode, 0.08),
          "& fieldset": {
            borderColor: alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.15 : 0.25),
          },
          "&:hover fieldset": {
            borderColor: alpha(theme.palette.primary.main, 0.35),
          },
          "&.Mui-focused fieldset": {
            borderWidth: 2,
            borderColor: theme.palette.primary.main,
          },
          "& .MuiInputBase-input.MuiInputBase-inputSizeSmall": {
            paddingTop: 9,
            paddingBottom: 9,
            paddingLeft: 12,
            paddingRight: 12,
            fontSize: "0.9rem",
          },
          "& .MuiSelect-select.MuiInputBase-inputSizeSmall": {
            paddingTop: 9,
            paddingBottom: 9,
            minHeight: "unset",
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          paddingTop: 7,
          paddingBottom: 7,
          paddingLeft: 12,
          paddingRight: 12,
        },
        head: ({ theme }) => ({
          fontWeight: 600,
          fontSize: "0.75rem",
          color:
            theme.palette.mode === "light" ? theme.palette.primary.dark : theme.palette.primary.light,
          letterSpacing: "-0.01em",
          paddingTop: 9,
          paddingBottom: 9,
          backgroundColor:
            theme.palette.mode === "light" ? alpha(zillowBlue, 0.06) : alpha(zillowBlueDarkMode, 0.12),
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
        standardSuccess: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.success.main, theme.palette.mode === "light" ? 0.12 : 0.18),
          color: theme.palette.mode === "light" ? theme.palette.success.dark : theme.palette.success.light,
        }),
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
          minHeight: 52,
          "@media (min-width: 600px)": { minHeight: 52 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: ({ theme }) => ({
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.12)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
          fontWeight: 600,
        }),
      },
    },
  },
});
