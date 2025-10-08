# Project Commands Reference

A comprehensive guide to all available commands in the Foodics Reservations project.

## 📑 Table of Contents

- [Development Commands](#development-commands)
- [Build & Preview Commands](#build--preview-commands)
- [Testing Commands](#testing-commands)
  - [Unit Tests (Vitest)](#unit-tests-vitest)
  - [E2E Tests (Playwright)](#e2e-tests-playwright)
- [Code Quality Commands](#code-quality-commands)
- [Git Hooks](#git-hooks)
- [Quick Reference](#quick-reference)

---

## Development Commands

Commands for running the development server and working on the project.

| Command | Description | When to Use | Output |
|---------|-------------|-------------|--------|
| `npm run dev` | Start Vite development server with HMR | Daily development, coding features | `http://localhost:5173` |
| `npm install` | Install all project dependencies | First time setup, after pulling changes | Installs packages from `package.json` |
| `npm run prepare` | Initialize Husky git hooks | After `npm install` (runs automatically) | Sets up pre-commit & pre-push hooks |

### Example Usage

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
# Changes auto-reload with Hot Module Replacement (HMR)
```

**Development Server Features**:
- ⚡ Fast HMR (Hot Module Replacement)
- 🔌 API proxy: `/api` → `https://api.foodics.dev/v5`
- 🎨 Tailwind CSS compilation
- 📝 TypeScript transpilation
- 🔄 Auto-reload on file changes

---

## Build & Preview Commands

Commands for building and previewing production bundles.

| Command | Description | When to Use | Output |
|---------|-------------|-------------|--------|
| `npm run build` | Build production bundle | Before deployment, CI/CD pipeline | `dist/` folder with optimized assets |
| `npm run preview` | Preview production build locally | Test production build before deployment | `http://localhost:4173` |

### Example Usage

```bash
# Build for production
npm run build

# Output:
# - dist/assets/index-[hash].js
# - dist/assets/index-[hash].css
# - Minified & optimized for production

# Preview the production build
npm run preview

# Opens http://localhost:4173 with production build
```

**Build Features**:
- ✅ TypeScript type checking
- 📦 Code splitting & tree-shaking
- 🗜️ Minification (JS & CSS)
- 🖼️ Asset optimization
- 📊 Bundle size analysis

---

## Testing Commands

### Unit Tests (Vitest)

Fast, isolated tests for functions, composables, components, and utilities.

| Command | Description | When to Use | Speed |
|---------|-------------|-------------|-------|
| `npm run test:unit` | Run unit tests in watch mode | Active development, TDD workflow | ~200ms |
| `npm run test:unit:watch` | Alias for `test:unit` (watch mode) | Same as above | ~200ms |
| `npm run test:unit -- --run` | Run unit tests once (no watch) | CI/CD, pre-push verification | ~200ms |
| `npm run test:unit -- --coverage` | Run with coverage report | Check test coverage, CI/CD | ~300ms |

### Example Usage

```bash
# Start unit tests in watch mode (recommended for development)
npm run test:unit

# Output:
# ✓ tests/unit/utils.time.spec.ts  (2 tests) 1ms
# ✓ tests/unit/utils.slots.spec.ts (2 tests) 1ms
# 
# Test Files  2 passed (2)
#      Tests  4 passed (4)
# 
# Watching for file changes...

# Run once for CI/CD
npm run test:unit -- --run

# Generate coverage report
npm run test:unit -- --coverage

# Coverage report saved to:
# - coverage/index.html (open in browser)
# - coverage/coverage.json (for CI tools)
```

**What to Test with Unit Tests**:
- ✅ Utility functions (`utils/time.ts`, `utils/validation.ts`)
- ✅ Composables (`useModal`, `useToast`, `useLocale`)
- ✅ Store logic (Pinia actions/getters)
- ✅ Component logic (props, events, computed)
- ✅ API service functions

---

### E2E Tests (Playwright)

Full browser tests for user flows, navigation, and integration.

#### Run All Platforms

| Command | Description | Platforms | Speed | When to Use |
|---------|-------------|-----------|-------|-------------|
| `npm run test:e2e` | Run E2E tests on all platforms | 7 (desktop + mobile + tablet) | ~15s | Pre-push, CI/CD |
| `npm run test:e2e:headed` | Run with visible browsers | All platforms | ~20s | Debugging, watching tests |
| `npm run test:e2e:ci` | Run with HTML report | All platforms | ~15s | CI/CD pipeline |

#### Run Desktop Browsers Only

| Command | Description | Browsers | Speed | When to Use |
|---------|-------------|----------|-------|-------------|
| `npm run test:e2e:desktop` | Desktop browsers only | Chrome, Firefox, Edge | ~4s | Pre-commit, quick verification |
| `npm run test:e2e:chrome` | Chrome only (fastest) | Chrome | ~3s | Active development |
| `npm run test:e2e:firefox` | Firefox only | Firefox | ~3s | Firefox-specific testing |
| `npm run test:e2e:edge` | Edge only | Edge (Chromium) | ~3s | Edge-specific testing |

#### Run Mobile Devices Only

| Command | Description | Devices | Speed | When to Use |
|---------|-------------|---------|-------|-------------|
| `npm run test:e2e:mobile` | Mobile browsers only | Pixel 5, iPhone 13 | ~8s | Mobile responsiveness testing |

### Example Usage

```bash
# Quick development loop (single browser)
npm run test:e2e:chrome

# Output:
# ✓ [Desktop Chrome] should mount the app successfully
# ✓ [Desktop Chrome] should toggle locale between EN and AR
# ✓ [Desktop Chrome] should have proper page structure
# 
# 3 passed (3.5s)

# Pre-commit check (all desktop browsers)
npm run test:e2e:desktop

# Output:
# ✓ [Desktop Chrome] 3 tests passing
# ✓ [Desktop Firefox] 3 tests passing
# ✓ [Desktop Edge] 3 tests passing
# 
# 9 passed (4.5s)

# Test mobile responsiveness
npm run test:e2e:mobile

# Output:
# ✓ [Mobile Chrome] (Pixel 5) 3 tests passing
# ✓ [Mobile Safari] (iPhone 13) 3 tests passing
# 
# 6 passed (7.6s)

# Full suite (all 7 platforms)
npm run test:e2e

# Output:
# ✓ [Desktop Chrome] 3 tests
# ✓ [Desktop Firefox] 3 tests
# ✓ [Desktop Edge] 3 tests
# ✓ [Mobile Chrome] 3 tests
# ✓ [Mobile Safari] 3 tests
# ✓ [Mobile Safari Landscape] 3 tests
# ✓ [Tablet] (iPad Pro) 3 tests
# 
# 21 passed (15s)

# Debug with visible browser
npm run test:e2e:headed

# Opens browser windows you can watch
# Great for debugging test failures
```

**What to Test with E2E Tests**:
- ✅ User authentication flows
- ✅ Navigation between pages
- ✅ Form submissions
- ✅ Locale switching (EN ↔ AR)
- ✅ Mobile responsiveness
- ✅ API integrations
- ✅ Critical user journeys

**Supported Platforms**:
- **Desktop**: Chrome (1920×1080), Firefox (1920×1080), Edge (1920×1080)
- **Mobile**: Pixel 5 (393×851), iPhone 13 (390×844), iPhone 13 Landscape
- **Tablet**: iPad Pro (1024×1366)

---

### Combined Testing

| Command | Description | What It Runs | Speed | When to Use |
|---------|-------------|--------------|-------|-------------|
| `npm run test:ci` | Run all tests (unit + E2E) | Vitest (unit) → Playwright (E2E all platforms) | ~15s | CI/CD pipeline, final verification |

### Example Usage

```bash
# Run everything (CI/CD pipeline)
npm run test:ci

# Runs in sequence:
# 1. Vitest unit tests (~200ms)
# 2. Playwright E2E tests on all platforms (~15s)
# 
# Perfect for GitHub Actions, GitLab CI, etc.
```

---

## Code Quality Commands

Commands for linting, formatting, and type checking.

### Linting & Formatting

| Command | Description | What It Checks | Auto-Fix | When to Use |
|---------|-------------|----------------|----------|-------------|
| `npm run lint` | Run ESLint with auto-fix | Code quality, complexity, Vue/TS rules | ✅ Yes | Before commit, fixing linter errors |
| `npm run format` | Format code with Prettier | Code style, indentation, spacing | ✅ Yes | Before commit, consistent formatting |
| `npm run typecheck` | Check TypeScript types | Type errors, `any` usage, strictness | ❌ No | Before commit, CI/CD |

### Example Usage

```bash
# Run ESLint (automatically fixes issues)
npm run lint

# Checks:
# - No `any` or `unknown` types
# - Complexity ≤ 8
# - Max depth ≤ 2
# - Max 150 lines per file
# - Vue 3 best practices
# - TypeScript strict rules
#
# Auto-fixes: imports, spacing, semicolons, etc.

# Format all code with Prettier
npm run format

# Formats:
# - All .ts, .vue, .js files in src/
# - Single quotes, 2-space indent, 80 char width
# - Consistent style across the project

# Check TypeScript types
npm run typecheck

# Checks:
# - Type errors
# - Missing types
# - Incorrect type usage
# - Strict mode violations
#
# No output = all types are valid ✅
```

### Code Quality Standards Enforced

**ESLint Rules**:
- ❌ No `any` or `unknown` types
- ❌ No `eslint-disable` comments
- ❌ No `TODO` comments
- ✅ Cyclomatic complexity ≤ 8
- ✅ Max nesting depth ≤ 2
- ✅ Max 150 SLOC per file
- ✅ Max 4 parameters per function
- ✅ Always use `const` over `let`

**TypeScript Strict Mode**:
- `strict: true`
- `noImplicitAny: true`
- `exactOptionalPropertyTypes: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

---

## Git Hooks

Automated checks that run on git actions (managed by Husky).

### Pre-Commit Hook

**Trigger**: Every time you run `git commit`

| What Runs | Files Affected | Can Fail Commit |
|-----------|----------------|-----------------|
| ESLint | Staged `.ts`, `.vue`, `.js` files | ✅ Yes |
| Prettier | Staged files (all types) | ✅ Yes |

**What Happens**:
1. You run `git commit -m "Add feature"`
2. Husky intercepts the commit
3. `lint-staged` runs on only staged files:
   - ESLint checks & fixes code
   - Prettier formats code
4. If fixes are applied, files are automatically re-staged
5. If errors can't be auto-fixed, commit fails

**Example**:
```bash
git add src/components/MyComponent.vue
git commit -m "Add new component"

# Husky runs:
# ✓ ESLint checked 1 file (auto-fixed 3 issues)
# ✓ Prettier formatted 1 file
# ✓ Files re-staged
# ✓ Commit successful
```

### Pre-Push Hook

**Trigger**: Every time you run `git push`

| What Runs | Scope | Can Fail Push |
|-----------|-------|---------------|
| TypeScript type check | All files | ✅ Yes |
| Unit tests | All unit tests | ✅ Yes |

**What Happens**:
1. You run `git push`
2. Husky intercepts the push
3. Runs `npm run typecheck` (checks all TypeScript types)
4. Runs `npm run test:unit` (runs all unit tests)
5. If any check fails, push is blocked

**Example**:
```bash
git push origin main

# Husky runs:
# ✓ TypeScript type check... OK (0 errors)
# ✓ Unit tests... 4 passed
# ✓ Push successful
```

**Why Pre-Push, Not Pre-Commit?**
- Type checking is slower (~2s for large projects)
- Unit tests may take time as project grows
- Pre-commit should be instant (< 1s)
- Pre-push is acceptable to be slower

---

## Quick Reference

### Daily Development Workflow

```bash
# 1. Start development server
npm run dev

# 2. Make changes, write code

# 3. Run unit tests (watch mode)
npm run test:unit

# 4. Check E2E on Chrome (fast)
npm run test:e2e:chrome

# 5. Commit (auto-runs lint + format)
git commit -m "Add feature"

# 6. Push (auto-runs typecheck + unit tests)
git push
```

### Before Committing

```bash
# Quick checks (manual, optional)
npm run lint           # Check linting
npm run format         # Format code
npm run typecheck      # Check types
npm run test:unit      # Run unit tests
npm run test:e2e:chrome  # Quick E2E check

# Git commit (auto-runs lint + format on staged files)
git commit -m "Your message"
```

### Before Pushing / Deployment

```bash
# Full verification
npm run typecheck        # Check all types
npm run test:unit        # All unit tests
npm run test:e2e:desktop # Desktop browsers
npm run test:e2e:mobile  # Mobile devices

# Or run everything at once
npm run test:ci          # Unit + E2E (all platforms)

# Build for production
npm run build

# Test production build
npm run preview
```

### CI/CD Pipeline

```bash
# Install dependencies
npm ci

# Run all quality checks
npm run typecheck
npm run lint
npm run test:ci  # Unit + E2E on all platforms

# Build production
npm run build
```

---

## Command Cheat Sheet

| Category | Command | Speed | Purpose |
|----------|---------|-------|---------|
| **Dev** | `npm run dev` | - | Start dev server |
| **Build** | `npm run build` | ~10s | Production build |
| **Build** | `npm run preview` | - | Preview production |
| **Test** | `npm run test:unit` | ~0.2s | Unit tests (watch) |
| **Test** | `npm run test:e2e:chrome` | ~3s | E2E (Chrome only) |
| **Test** | `npm run test:e2e:desktop` | ~4s | E2E (all desktop) |
| **Test** | `npm run test:e2e:mobile` | ~8s | E2E (mobile only) |
| **Test** | `npm run test:e2e` | ~15s | E2E (all platforms) |
| **Test** | `npm run test:ci` | ~15s | All tests (unit + E2E) |
| **Quality** | `npm run lint` | ~1s | ESLint with auto-fix |
| **Quality** | `npm run format` | ~0.5s | Prettier formatting |
| **Quality** | `npm run typecheck` | ~2s | TypeScript type check |

---

## Troubleshooting

### Command Not Found

```bash
# If you see "command not found"
npm install  # Reinstall dependencies
```

### Tests Failing

```bash
# Unit tests failing
npm run test:unit -- --run  # Run once to see all errors

# E2E tests failing
npm run test:e2e:headed  # Watch tests run in browser

# Playwright browsers missing
npx playwright install --with-deps
```

### Linter Errors

```bash
# See all linting errors
npm run lint

# Most errors auto-fix, but some need manual fixes:
# - Complexity too high → split function
# - File too long → split into smaller files
# - `any` usage → use proper types
```

### Type Errors

```bash
# Check specific file
npx vue-tsc --noEmit src/components/MyComponent.vue

# Common fixes:
# - Add proper type annotations
# - Import types from /types directory
# - Use `??` instead of `||`
# - Use `?.` for optional chaining
```

---

## Related Documentation

- [Testing Guide (Full)](./TESTING.md) - Complete testing documentation
- [Testing Quick Start](./TESTING-QUICKSTART.md) - Quick testing reference
- [Project Setup](./INIT.md) - Initial setup documentation
- [Main README](../README.md) - Project overview

---

**Last Updated**: 2025-10-05  
**Maintained By**: Development Team

## 💡 Tips

- Use `npm run test:e2e:chrome` during active development (fastest E2E)
- Run `npm run test:e2e:desktop` before commits (catches browser issues)
- Run `npm run test:e2e` before pushing (full verification)
- Keep `npm run test:unit` running in watch mode while coding
- Let git hooks handle linting/formatting automatically
- Use `npm run test:e2e:headed` for debugging E2E failures
