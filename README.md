# Aire

Aire is a minimalist mobile breathing coach built with Expo, React Native, and TypeScript.

## MVP

- Short guided breathing sessions for calm, focus, energy, sleep, recovery, and blood-pressure relaxation support.
- Visual breathing rhythm, countdown timer, pause/resume, completion state, and optional sound cues.
- Practice library, concise learning cards, and local settings.

## Wellness Note

Aire is a wellness app. It does not diagnose, treat, measure, or replace professional medical care. People with cardiovascular, respiratory, pregnancy-related, neurological, or other health concerns should use gentle practices and consult a qualified professional when needed.

## Commands

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Windows Runner

Double-click `run-aire.bat` to run the latest local web build.

Optional flags:

```bat
run-aire.bat --check
run-aire.bat --update
run-aire.bat --update --check
```

- `--check` runs dependency checks, typecheck, lint, tests, and build without starting the preview server.
- `--update` refreshes dependencies and runs a safe audit fix before launching.

## ECC Prompt

Use this prompt form in Codex:

```text
/prompts:ecc-prp-implement .claude/PRPs/plans/breathing-coach-mobile-app.plan.md
```

## PWA Deploy

Aire's web build is installable as a Progressive Web App (offline shell, standalone mode, home screen icon).

### Build

```bash
npm run build     # → dist/
npm run preview   # local preview
```

### Netlify Drop (fastest)

1. `npm run build`
2. Open [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist/` folder into the browser
4. Get the public URL

### Vercel

```bash
npx vercel --prod   # set output directory to dist/
```

### Cloudflare Pages

Go to [pages.cloudflare.com](https://pages.cloudflare.com) → Create Project → Upload assets → upload the contents of `dist/`.

### GitHub Pages

```bash
npm run build
npx gh-pages -d dist
```

### Install as PWA

After deploying to HTTPS:
- **Android Chrome**: "Add to Home Screen" prompt appears automatically
- **iOS Safari**: Share → Add to Home Screen

The service worker caches the app shell on first visit so it works offline.
