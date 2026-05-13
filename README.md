# Loop prototype

Production-ready Vercel package for the Loop golf prototype.

## What is included

- Latest Loop prototype UI
- Five-course database wired into the course setup dropdown
- Loop insight engine connected to round review, next round plan, practice and prompts
- Single-select hole tags by input group
- Logo asset in `public/loop-logo.png`

## Run locally

```bash
npm install
npm run dev
```

## Build check

```bash
npm run build
```

## Deploy on Vercel

Use the default Vite settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Repository hygiene

Do not upload `node_modules`, `dist`, `.vercel`, `.env` or local system files.
