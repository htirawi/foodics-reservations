# Project Initialization Documentation

**Project**: Foodics Reservations  
**Initialized**: 2025-10-05  
**Framework**: Vue 3 + Vite + TypeScript  

## Overview

This document records the initial setup and configuration decisions for the Foodics Reservations project.

## Architecture Decisions

### 1. Framework & Build Tool

- **Vue 3**: Chosen for modern Composition API, excellent TypeScript support, and composables
- **Vite**: Fast HMR, native ESM support, optimized production builds
- **TypeScript Strict Mode**: Full type safety with `strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`

### 2. State Management & Routing

- **Pinia**: Official Vue 3 state management, simpler than Vuex, excellent TypeScript support
- **Vue Router**: Standard routing (to be added when needed)

### 3. Styling Approach

- **Tailwind CSS**: Utility-first, mobile-first responsive design
- **Design Tokens**: Custom color scales, typography, spacing, shadows
- **Plugins**: @tailwindcss/forms, @tailwindcss/typography for enhanced form/content styling
- **No UI Library**: Handcrafted accessible components for full control

### 4. Internationalization

- **vue-i18n@9**: Composition API support, tree-shakeable
- **Locales**: EN (default) + AR
- **RTL Support**: Built-in from day 1 with `dir` attribute toggling

### 5. HTTP Client

- **Axios**: Centralized API service layer in `src/api/`
- **Proxy**: Vite dev proxy `/api` → `https://api.foodics.dev/v5`
- **Type Safety**: All API calls typed with interfaces from `src/types/`

### 6. Testing Strategy

#### Unit Testing (Vitest)
- **Why Vitest**: Fast, Vite-native, Jest-compatible API
- **jsdom**: DOM environment for component tests
- **Coverage**: V8 provider with text/json/html reports
- **Config**: `vitest.config.ts`

#### E2E Testing (Playwright)
- **Why Playwright**: Cross-browser (Chromium, Firefox, WebKit), reliable, great DX
- **Auto Server**: Automatically starts Vite dev server before tests
- **Config**: `playwright.config.ts` with webServer integration
- **Scripts**: Watch mode, headed mode, CI mode with HTML reports

### 7. Code Quality

#### Linting & Formatting
- **ESLint**: Strict rules, complexity limits, no `any`/`unknown`
- **Prettier**: Consistent formatting, integrated with ESLint
- **No Escapes**: No `eslint-disable` unless documented false positive

#### Git Hooks (Husky + lint-staged)
- **Pre-commit**: ESLint + Prettier on staged files
- **Pre-push**: Typecheck + Unit tests

#### Complexity Limits
- Max 150 SLOC per file
- Cyclomatic complexity ≤8
- Max depth ≤2 for nested conditionals
- Max 4 parameters per function

### 8. Folder Structure

**Feature-Based Organization:**

```
src/
  api/           # Axios services, typed API calls
  components/    # Small reusable atoms
  composables/   # useModal, useToast, useConfirm, useLocale
  features/      # Feature modules (branches, reservations, etc.)
    branches/
      components/
      stores/
      views/
  i18n/          # EN/AR translation files
  layouts/       # Layout components
  styles/        # Global CSS, Tailwind imports
  types/         # Domain types (never in components)
  utils/         # Pure functions (time, validation)
```

**Rationale:**
- Clear separation of concerns
- Co-located feature code
- Easy to navigate and scale
- Types centralized for reuse

### 9. Composables Design

Created stub composables (to be implemented):

- **useModal**: Modal state management (open/close, options)
- **useToast**: Toast notifications (success/error/warning/info)
- **useConfirm**: Confirmation dialogs (promise-based)
- **useLocale**: Locale switching, RTL detection

**Why Composables?**
- Reusable logic across components
- Better than mixins (clear data flow)
- Testable in isolation
- TypeScript friendly

### 10. Path Aliases

Configured in `tsconfig.json` + `vite.config.ts`:

```ts
@/*             # src/
@/api/*         # src/api/
@/components/*  # src/components/
@/composables/* # src/composables/
@/features/*    # src/features/
@/i18n/*        # src/i18n/
@/layouts/*     # src/layouts/
@/stores/*      # src/stores/
@/types/*       # src/types/
@/utils/*       # src/utils/
```

## Configuration Files

### TypeScript (`tsconfig.json`)
- Strict mode enabled
- Path aliases configured
- References `tsconfig.node.json` for config files

### Vite (`vite.config.ts`)
- Vue plugin
- vite-tsconfig-paths for alias support
- Dev proxy: `/api` → Foodics API
- Port: 5173

### Vitest (`vitest.config.ts`)
- jsdom environment
- Coverage with V8 provider
- Excludes node_modules, tests, configs

### Playwright (`playwright.config.ts`)
- Tests in `tests/e2e/`
- Runs on Chromium, Firefox, WebKit
- webServer: auto-starts Vite on 5173
- Retries: 2 in CI, 0 locally
- Trace on first retry

### ESLint (`.eslintrc.cjs`)
- Vue 3 recommended rules
- TypeScript strict rules
- Complexity limits enforced
- No `any`/`unknown` allowed

### Prettier (`.prettierrc`)
- Single quotes
- 2-space tabs
- 80-char line width
- Trailing commas (ES5)

### Tailwind (`tailwind.config.js`)
- Custom design tokens
- Mobile-first approach
- Forms + Typography plugins

## Initial Scripts

```json
{
  "dev": "vite --port 5173",
  "build": "vue-tsc && vite build",
  "preview": "vite preview",
  "typecheck": "vue-tsc --noEmit",
  "lint": "eslint . --ext .vue,.js,.ts --fix",
  "format": "prettier --write src/**/*.{js,ts,vue,css,md}",
  "test:unit": "vitest",
  "test:unit:watch": "vitest --watch",
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:ci": "playwright test --reporter=html",
  "test:ci": "vitest run && playwright test",
  "prepare": "husky"
}
```

## Environment Setup

### Required Environment Variables

- `VITE_FOODICS_TOKEN`: API authentication token (from console.foodics.dev)

### Example `.env` File

```bash
VITE_FOODICS_TOKEN=your_actual_token_here
```

**Note**: `.env` is gitignored. Copy from `env.example`.

## Initial Tests

### Unit Tests
- `tests/unit/utils.time.spec.ts`: Placeholder for time utility tests
- `tests/unit/utils.slots.spec.ts`: Placeholder for slot generation tests

### E2E Tests
- `tests/e2e/smoke.spec.ts`: 
  - App mounts successfully
  - Locale toggle works (EN ↔ AR)
  - Page structure (header, main)

## Post-Installation Steps

After cloning the repo, developers should:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp env.example .env
   # Edit .env with actual Foodics token
   ```

3. **Install Playwright browsers** (first time):
   ```bash
   npx playwright install --with-deps
   ```

4. **Verify setup**:
   ```bash
   npm run typecheck
   npm run lint
   npm run test:unit
   npm run dev  # Should start on http://localhost:5173
   ```

5. **Run E2E tests**:
   ```bash
   npm run test:e2e:headed  # Watch tests run in browser
   ```

## Development Workflow

### Adding a New Feature

1. Create feature directory: `src/features/[feature-name]/`
2. Add components, stores, views subdirectories
3. Define types in `src/types/[feature-name].ts`
4. Create API service in `src/api/[feature-name].ts`
5. Add unit tests in `tests/unit/features/[feature-name]/`
6. Add E2E tests in `tests/e2e/[feature-name].spec.ts`
7. Update i18n keys in `src/i18n/en.ts` and `src/i18n/ar.ts`

### Adding a New Composable

1. Create in `src/composables/use[Name].ts`
2. Export typed interface and composable function
3. Add unit tests in `tests/unit/composables/use[Name].spec.ts`
4. Document usage in composable file

### Adding a New Utility

1. Create in `src/utils/[name].ts`
2. Pure functions only (no side effects)
3. Add unit tests in `tests/unit/utils.[name].spec.ts`
4. Export typed functions with JSDoc

## Accessibility Checklist

From day 1, ensure:

- ✅ Semantic HTML (header, main, nav, article, etc.)
- ✅ ARIA labels for interactive elements
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus visible styles (outline-primary-500)
- ✅ Color contrast ≥4.5:1 (WCAG AA)
- ✅ Alt text for images
- ✅ Form labels and error messages
- ✅ Skip links for screen readers

Target: Lighthouse A11y ≥95

## Performance Targets

- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3.5s
- **Cumulative Layout Shift**: <0.1
- **Bundle Size**: <200KB gzipped (main chunk)

Monitor with Lighthouse and `npm run build -- --analyze`.

## Next Steps

1. Implement API service layer in `src/api/`
2. Create reusable UI components (Modal, Toast, Confirm, Button, Input)
3. Build branch listing feature
4. Add reservation flow
5. Implement time slot generation utility
6. Add comprehensive E2E tests for critical paths
7. Set up CI/CD pipeline
8. Add A11y smoke test with axe-core in Playwright

## References

- [Vue 3 Docs](https://vuejs.org/)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [vue-i18n@9](https://vue-i18n.intlify.dev/)

---

**Last Updated**: 2025-10-05  
**Author**: Project Initialization Team
