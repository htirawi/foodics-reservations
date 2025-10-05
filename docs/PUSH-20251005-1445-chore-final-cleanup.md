# chore: use native git hooks instead of tracked config

- **PR**: —  
- **Branch**: chore/final-cleanup  
- **Commit**: 1f7c94c  
- **Date**: 2025-10-05 11:45  

## 1) Overview
- (Fill) Key outcomes in 3–5 bullets.

## 2) Motivation (Why)
- (Fill) The problem and constraints.

## 3) Changes (What & How)
- **Structure**: new folders, aliases, extracted hooks/composables/services
- **Configs**: TS strict, ESLint rules (complexity/lines/params), Prettier, Tailwind tokens
- **Testing**: unit runner + Playwright; scripts
- **CI**: lint/type/unit/e2e; block direct pushes to main
- **i18n/RTL & A11y**
- **Performance/Budgets**
- **Decisions/Trade-offs**

## 4) Commands to reproduce
```bash
npm install
npm run lint && npm run typecheck
npm run test:unit
npm run test:e2e
```

## 5) Files touched (high-level)
- (Only key areas)

## 6) Risk & Rollback
- (Potential risks + how to revert)

## 7) References
- Official framework docs
- TypeScript strict options
- ESLint + @typescript-eslint rules
- Jest/Mocha/Vitest; Testing Library
- Playwright
- Tailwind (+ plugins)
- i18n library

## 8) Talking points (for interviews)
- (3–6 bullets you can explain confidently)
