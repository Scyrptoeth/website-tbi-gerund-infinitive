# Website TBI Gerund Infinitive

Static MVP for Bimbel Persiapantubel students to learn English gerund and infinitive verb patterns for TBI preparation.

## Current Scope

- Dashboard with progress chart and next action.
- Global search across verb forms, Indonesian meanings, categories, patterns, and notes.
- Materi packages for Verb-1, Verb-2, Verb-3, meaning, pattern, usage note, and common mistakes.
- Flipcard active recall with local viewed-card progress.
- Test packages with A-D answers, draft state, final submit lock, score, and Indonesian explanations.
- SuperAdmin summary that clearly labels the production boundary.

This implementation is a static/live MVP. Browser localStorage is used only for demo progress. Production student operations should use server-side auth, database-backed progress, attempt snapshots, role checks, and audit logs.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- lucide-react
- Vitest
- Playwright
- axe via `@axe-core/playwright`

## Commands

```bash
npm run typecheck
npm run test
npm run lint
npm run build
npm run dev
```

## Content Baseline

The current learning bank is a quality-first MVP sample:

- 30 gerund-only verbs
- 30 infinitive-only verbs
- 30 dual-pattern verbs
- 9 mixed test packages
- 90 original quiz questions

No official TOEFL, TOEIC, or IELTS questions are copied. Exam-related wording remains conservative unless exact legal source evidence is available.
