# Foodics Reservations

A Vue 3 reservation management system with TypeScript, built for the Foodics platform.

## Quick Start

```bash
# Install
npm install

# Set up environment
cp env.example .env
# Add your Foodics API token from https://console.foodics.dev/

# Run dev server
npm run dev

# Run tests
npm run test:unit        # Unit tests (watch mode)
npm run test:e2e:chrome  # E2E tests (Chrome only, fast)
```

## Project Structure

```
src/
├── api/           # API service layer
├── components/    # Reusable UI components
├── composables/   # Vue composables (useModal, useToast, useLocale)
├── features/      # Feature modules (branches, etc.)
├── i18n/          # Internationalization (EN/AR)
├── layouts/       # Page layouts
├── styles/        # Global styles + Tailwind
├── types/         # TypeScript types
└── utils/         # Helper functions

tests/
├── unit/          # Vitest unit tests
└── e2e/           # Playwright E2E tests
```

## Tech Stack

- **Vue 3** with Composition API + `<script setup>`
- **TypeScript** (strict mode)
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **Pinia** for state management
- **vue-i18n** for internationalization
- **Vitest** for unit testing
- **Playwright** for E2E testing

## Development

### Commands

```bash
npm run dev              # Start dev server (localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

npm run lint             # Lint and fix
npm run typecheck        # Check types
npm run format           # Format code

npm run test:unit        # Unit tests (watch)
npm run test:e2e         # E2E tests (all browsers)
npm run test:e2e:headed  # E2E with visible browser
npm run test:ci          # Run all tests (CI mode)
```

### Testing

**Unit tests** (Vitest):

- Test utilities, composables, and component logic
- Run in watch mode during development

**E2E tests** (Playwright):

- Test complete user flows
- Run across Chrome, Firefox, Edge, mobile viewports
- Playwright auto-starts dev server on port 5173

### Standards

- Strict TypeScript (no `any`, use `??` not `||`)
- Component complexity limits enforced via ESLint
- Pre-commit hooks run linting/formatting
- Pre-push hooks run type checking + tests

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full guidelines.

## API Integration

Dev server proxies `/api` to `https://api.foodics.dev/v5`:

```ts
// Example: GET /api/branches → https://api.foodics.dev/v5/branches
await axios.get('/api/branches');
```

Set your token in `.env`:

```
VITE_FOODICS_TOKEN=your_token_here
```

## Internationalization

- Supports English and Arabic
- RTL layout for Arabic automatically applied
- Toggle locale via the language switcher button

```vue
<script setup>
import { useLocale } from '@/composables/useLocale';
const { currentLocale, toggleLocale } = useLocale();
</script>

<template>
  <button @click="toggleLocale">
    {{ currentLocale === 'en' ? 'العربية' : 'English' }}
  </button>
</template>
```

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development workflow
- Testing requirements
- Code style guidelines
- PR process

## License

[Add license here]
