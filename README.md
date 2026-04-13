# Property Pro

A **single-page web app** for modeling **mortgages**, **rental cash flow**, and **when-to-sell** scenarios. Built with **React**, **TypeScript**, **Vite**, and **Material UI** (Material Design). State stays in the browser (local storage) and can be exported or imported as JSON.

## Features

- **Mortgage** — Loan inputs, amortization-style views, paydown visualization, and related calculations.
- **Rental** — Rental income and expense modeling (including composition breakdown).
- **When to sell** — Scenario math to compare holding vs. selling.
- **Persistence** — Scenarios are saved automatically in `localStorage`.
- **Import / export** — Download or upload a `property-pro.json` file from the toolbar.
- **Theme** — Light and dark mode.

## Requirements

- **Node.js** 18+ (the GitHub Actions workflow uses Node 22).
- **npm** (comes with Node).

## Quick start

```bash
git clone git@github.com:hema986/mortgage-pro.git
cd mortgage-pro
npm install
npm run dev
```

Open the URL Vite prints (default: [http://127.0.0.1:5173](http://127.0.0.1:5173)).

### Background dev server (optional)

Scripts install npm dependencies when needed, start Vite in the background, and write logs to `.dev-server.log` (see `.gitignore`).

```bash
./scripts/dev-start.sh # or: npm run dev:start
./scripts/dev-stop.sh     # or: npm run dev:stop
```

Override port or host if needed:

```bash
PORT=3000 HOST=0.0.0.0 ./scripts/dev-start.sh
```

## Build

```bash
npm run build
```

Output is in `dist/`. For a local production preview:

```bash
npm run preview
```

## GitHub Pages

This repo includes a workflow (`.github/workflows/deploy-pages.yml`) that builds with `npm ci` and deploys `dist/` to **GitHub Pages**.

1. Push to `main` (or run the workflow manually).
2. In the repository: **Settings → Pages → Build and deployment**, set the source to **GitHub Actions**.
3. The site is served at `https://<user>.github.io/<repo>/`. The workflow sets `VITE_BASE_PATH` to `/<repository-name>/` so assets resolve correctly.

For local dev, `VITE_BASE_PATH` defaults to `/` (see `vite.config.ts`).

## Scripts

| Command            | Description |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Vite dev server (foreground)         |
| `npm run dev:start`| Start Vite in background (see above) |
| `npm run dev:stop` | Stop background server / free port   |
| `npm run build`    | Typecheck + production build         |
| `npm run preview`  | Preview `dist/` locally              |
| `npm run lint`     | ESLint                               |

## Project layout

```
src/
  App.tsx              # Shell, tabs, import/export, theme toggle
  tabs/                # Mortgage, rental, when-to-sell screens
  components/          # Shared UI (charts, inputs, tables)
  lib/                 # Pure math helpers
  storage/             # State shape + local persistence
  hooks/               # Synced app state hook
```

## License

This project is private / all rights reserved unless you add an explicit `LICENSE` file.
