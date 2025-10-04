# Baseline Tooling Hackathon — Starter Scaffold

This scaffold helps you rapidly prepare a project for the Baseline Tooling Hackathon. It includes a tiny CLI demo, an offline demo, a smoke test, and a submission draft you can copy into Devpost.

Files added:
- `src/index.js` — CLI that attempts to load `web-features` and print a sample entry.
- `src/demo.js` — offline demo output you can run without installing deps.
- `test/run.js` — smoke test that runs the demo.
- `SUBMISSION.md` — copy-ready submission text and checklist for Devpost.

How to run (Windows PowerShell):

```powershell
cd "C:\Users\mubva\Downloads\BaseLine Chrome hackathons"
node src/demo.js
node src/index.js
node test/run.js
```

To install dependencies (optional):

```powershell
npm install
```

Next steps: implement your integration (ESLint plugin, VS Code extension, CI check, etc.), record a >3-minute demo video, publish your repo, choose a permissive OSS license, and submit on Devpost with the materials in `SUBMISSION.md`.

Evidence & how to run the full demo
----------------------------------

The repo includes an ESLint plugin, a prefetch script for the Web Platform Dashboard cache, and a small demo/test harness.

Run these locally (PowerShell):

```powershell
cd "C:\Users\mubva\Downloads\BaseLine Chrome hackathons"
npm install
# Build the webstatus cache used by CI (creates data/webstatus-cache.json)
node tools/prefetch-webstatus.js
# Run the demo and smoke test
npm run demo
npm test
# Run ESLint with baseline plugin
npx eslint -c .eslintrc-baseline.cjs example/styles.js -f stylish
```

The CI workflow uses a similar flow in `.github/workflows/lint.yml` to prefetch and run the rules in a reproducible way.
