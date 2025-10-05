# Foodics Reservations

A Vue 3 reservation management system for Foodics restaurants, built with TypeScript and strict engineering standards.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env.local
# Add your Foodics API token from https://console.foodics.dev/

# Run dev server
npm run dev

# Run tests
npm run test:unit        # Unit tests (watch mode)
npm run test:e2e:chrome  # E2E tests (Chrome only, fast)
```

## 📁 Project Structure

```
src/
├── services/        # HTTP client & API modules
├── composables/     # Vue composables (logic, no DOM)
├── stores/          # Pinia state management
├── components/      # Tiny, single-purpose UI units
├── views/           # Page-level components
├── features/        # Feature modules (branches, etc.)
├── i18n/            # Internationalization (EN/AR)
├── layouts/         # Page layouts
├── styles/          # Tailwind tokens/layers
└── utils/           # Pure helper functions

types/               # Shared TypeScript types (only here)
tests/
├── unit/            # Vitest unit tests
└── e2e/             # Playwright E2E tests
```

## 🛠️ Tech Stack

- **Vue 3** - Composition API + `<script setup>`
- **TypeScript** - Strict mode, no `any`/`unknown`
- **Vite** - Fast builds & HMR
- **Tailwind CSS** - Utility-first styling with design tokens
- **Pinia** - State management
- **vue-i18n** - Internationalization (EN/AR with RTL)
- **Axios** - HTTP client with interceptors
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## 📜 Commands

### Development
```bash
npm run dev              # Start dev server (localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build
```

### Code Quality
```bash
npm run lint             # Lint and fix
npm run typecheck        # TypeScript check
npm run format           # Format code with Prettier
```

### Testing
```bash
npm run test:unit        # Unit tests (watch)
npm run test:e2e         # E2E tests (all browsers)
npm run test:e2e:headed  # E2E with visible browser
npm run test:ci          # All checks (CI mode)
```

## 🔧 API Integration

The app connects to Foodics API through a centralized service layer:

### Setup
1. Get your token from [Foodics Console](https://console.foodics.dev/)
2. Add to `.env.local`:
   ```env
   VITE_FOODICS_TOKEN=your-token-here
   VITE_API_BASE_URL=https://api.foodics.dev/v5
   ```
3. Restart dev server

### How It Works
- **Dev:** Vite proxies `/api` → `https://api.foodics.dev/v5`
- **Services:** `src/services/` - Typed API methods with error normalization
- **Types:** `types/` - All domain types (Branch, Section, Table, etc.)

**📖 Full guide:** [docs/API_SETUP.md](./docs/API_SETUP.md)

## 🌍 Internationalization

- Supports **English** and **Arabic** with RTL layout
- All user-facing strings via `vue-i18n`
- Toggle locale with language switcher

```vue
<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
const { currentLocale, toggleLocale } = useLocale();
</script>

<template>
  <button @click="toggleLocale">
    {{ currentLocale === 'en' ? 'العربية' : 'English' }}
  </button>
</template>
```

## 📐 Architecture Principles

### Strict TypeScript
- Strict mode enabled (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`)
- No `any` or `unknown` - use precise unions/generics
- All types in `/types` directory only

### Component Philosophy
- **Tiny & focused** - Single responsibility
- Extract logic to **composables**
- Complexity limits enforced by ESLint:
  - Max 150 lines per file
  - Cyclomatic complexity ≤ 8
  - Max 4 function parameters

### Service Layer
- Centralized HTTP client: `src/services/http.ts`
- Auth interceptor (Bearer token)
- Error normalization: all errors → `{ status, message, details }`
- API modules: `src/services/*.service.ts`

### State Management
- **Pinia** for global state
- Keep stores thin (state + actions)
- Side effects in services/composables

### Styling
- **Tailwind** with design tokens
- Mobile-first responsive
- RTL-ready (logical properties)
- No arbitrary values without justification

## 🧪 Testing Strategy

### Unit Tests (Vitest)
- Test composables, services, utilities
- Mock HTTP with `axios-mock-adapter`
- No real network calls
- Coverage goal: ≥80%

### E2E Tests (Playwright)
- Test complete user flows
- Multi-browser (Chrome, Firefox, Edge)
- Mobile viewports (iOS, Android)
- A11y smoke tests

**Current coverage:** 35 unit tests + 10 e2e tests ✅

## ♿ Accessibility

- Lighthouse A11y score ≥ 95
- Semantic HTML
- Keyboard navigation
- Visible focus states
- ARIA labels (translatable)
- Automated checks in Playwright

## 🎨 Code Standards

### Imports
- Use `@/*` aliases (not relative `../../`)
- Destructure named exports
- `import type` for types

### Null Safety
- Use `?.` optional chaining
- Use `??` nullish coalescing (NOT `||`)

### Commits
- Conventional commits
- Small, focused changes
- No `TODO:` comments (use issues)

### ESLint Rules
- `no-any`, `no-unknown` - Error
- `complexity: 8` - Max cyclomatic complexity
- `max-lines: 150` - Max lines per file
- `max-depth: 2` - Max nested blocks

## 📚 Documentation

- [API Setup Guide](./docs/API_SETUP.md)
- [Types & HTTP Architecture](./docs/TYPES_AND_HTTP.md)
- [CARD 1 Completion Report](./docs/CARD_1_COMPLETION.md)
- [Testing Quick Start](./docs/TESTING-QUICKSTART.md)
- [Commands Reference](./docs/COMMANDS.md)

## 🔒 Security

- No secrets in code
- `.env.local` gitignored
- Token injection via interceptor
- Input validation at boundaries
- Sanitize HTML output

## 📦 Dependencies

**Runtime (minimal):**
- `axios` - HTTP client (~14 KB)
- `pinia` - State management
- `vue-i18n` - i18n
- `tailwindcss` - Styling

**Dev/Test:**
- `vitest` - Unit testing
- `@vue/test-utils` - Vue testing utils
- `playwright` - E2E testing
- `eslint` + plugins - Linting
- `typescript` - Type checking

**Policy:** No UI kits or date libraries by default. New deps require bundle impact justification.

## 🚦 CI/CD

```bash
# Pre-commit (automatic)
- Lint & format staged files

# Pre-push (automatic)
- Type check
- Unit tests

# CI Pipeline
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development workflow
- Testing requirements
- Code style guidelines
- PR process

## 📄 License

[Add license here]