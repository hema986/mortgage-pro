import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import "./index.css";
import { appTheme } from "./theme";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InitColorSchemeScript attribute="class" defaultMode="system" />
    <ThemeProvider theme={appTheme} defaultMode="system">
      <CssBaseline enableColorScheme />
      <App />
    </ThemeProvider>
  </StrictMode>
);
