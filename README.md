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
