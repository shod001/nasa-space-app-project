# Outpost Director — Moon & Mars

A NASA-inspired space mission game for ages 7–12. You are the Commander of a Moon or Mars outpost: keep your crew safe and happy, grow food, run science experiments, and survive 14 days of space surprises with your robot co-pilot **A.S.T.R.O.**

Built with Next.js 16, React 19, TypeScript, Tailwind CSS, and shadcn/ui.

## Play

- **Live app:** https://nasa-space-app-project.vercel.app

## Features

- Moon and Mars outposts with story scenes
- Easy, Normal, and Hard difficulty modes
- Crew health, happiness, food, and energy management
- Real NASA science: live space-weather events from the [NASA DONKI API](https://api.nasa.gov/), with an offline demo feed fallback
- Mission debriefs, achievements, and space jokes

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Copy `.env.example` to `.env` and set the values you need:

- `NASA_API_KEY` — optional; the app falls back to NASA's `DEMO_KEY`
- `DATABASE_URL` — local SQLite path used by the Prisma examples

## Project report

See `Outpost-Director-Code-Explained.pdf` for a code walkthrough and `pdf-report/` for the full project report.
