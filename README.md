# APA2118 Contract Comparison Tool

A discounted cash flow analysis tool for Allegiant Air pilots (APA Local 2118) to compare the Tentative Agreement against Vote No scenarios.

## What it does

Walks pilots through a guided onboarding to collect:
- Seat (FO / Captain) and longevity as of July 1, 2026
- Line type (Flying / Reserve) and average monthly hours
- Date of birth (to compute horizon to mandatory retirement at 65)
- Profit sharing, retention bonus, and investment return assumptions
- Vote-No scenario assumptions: 2nd offer probability, JCBA timeline, post-JCBA negotiating position

Then produces a full **monthly discounted cash flow comparison** of three scenarios:
- **A**: Vote Yes — accept the Tentative Agreement
- **B**: Vote No, and a second bridge offer arrives (probability-weighted)
- **C**: Vote No, no second offer (stay on current CBA until JCBA)

Output includes headline present values, projected retirement balances, transparent month-by-month tables, charts, and PDF export.

## Tech stack

Vite + React + TypeScript + Tailwind CSS + Recharts + Zustand + Vitest

## Development

```bash
npm install
npm run dev       # dev server at localhost:5173
npm test          # run unit tests
npm run build     # production build
```

## Embedding

This tool is designed to be embedded in an iframe on an external site:

```html
<iframe id="apa-tool" src="https://your-deploy-url" height="600" frameborder="0" style="width:100%"></iframe>
<script>
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'apa2118-resize') {
      document.getElementById('apa-tool').style.height = e.data.height + 'px'
    }
  })
</script>
```

## Data

Pay scales are hardcoded in `src/data/payScales.ts`. Rate updates require editing that file only — no logic changes needed.
