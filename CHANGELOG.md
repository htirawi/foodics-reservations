# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2025-10-08

### Added

**Core Features:**
- Branches list view with empty state, loading state, and error handling
- Add branch modal with validation
- Enable/disable single branch actions
- Bulk enable/disable actions with selection
- Branch settings editor (duration and day slots)
- Apply settings to all branches functionality

**Internationalization:**
- English (EN) and Arabic (AR) locales
- Locale switcher in app header
- Persistent locale selection (localStorage)
- RTL support with proper layout mirroring
- Logical CSS properties (margin-inline, padding-inline, etc.)

**UI System:**
- App shell (App.vue, AppHeader, AppToaster)
- UI primitives (UiButton, UiModal, UiConfirm, UiBanner, UiInput, UiSelect, UiCheckbox, UiToggle, UiTable, UiEmptyState)
- Skip link for accessibility
- Toast notification system
- Confirmation dialog system

**State Management:**
- Pinia stores (branches, UI)
- Optimistic updates with rollback
- Error normalization

**Services:**
- Centralized HTTP client with interceptors
- Branches service (fetch, create, update)
- Error normalization to consistent shape

**Composables:**
- `useLocale` - Locale management
- `useRTL` - RTL direction management
- `useModal` - Modal state management
- `useToast` - Toast notifications
- `useConfirm` - Confirmation dialogs
- `useSelection` - Selection set management
- `useAsyncAction` - Async action orchestration
- `useErrorMapper` - Error to i18n key mapping
- Feature-specific composables (day slots editor, duration field, etc.)

**Utils:**
- Time conversion utilities (minutes ↔ hours ↔ HH:MM)
- Slots validation (overlap detection, range validation)
- Tables calculation (max reservations)

**Constants:**
- Centralized constants in `src/constants/` (API endpoints, testids, weekdays, time, UI, locale, regex, i18n keys, storage, errors, HTML, stores)

**Testing:**
- Unit tests (Vitest) for composables, stores, services, utils
- E2E tests (Playwright) for core flows, i18n, RTL, accessibility
- Offline testing with route intercepts (no real API calls)
- EN and AR test coverage
- A11y smoke tests

**CI/CD:**
- GitHub Actions workflow (typecheck → lint → test:unit → test:e2e)
- PR template with comprehensive sections
- Artifact uploads on failure (Playwright report, test results)

**Documentation:**
- Comprehensive README with structure, rationale, setup, testing, quality bars
- Public docs (api.md, stores.md, ui.md, validation.md, ADRs.md, ACCEPTANCE.md)
- Architecture Decision Records (ADRs)
- Final acceptance checklist

**Infrastructure:**
- TypeScript strict mode
- ESLint strict configuration (no `eslint-disable`, no `@ts-ignore`)
- Prettier formatting
- Tailwind CSS with design tokens
- Path aliases (`@/*`)
- Environment variable configuration

### Changed

- N/A (initial release)

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- No secrets in code; all tokens from environment variables
- HTTP client with Bearer auth via interceptor
- Error normalization to prevent leaking sensitive data

---

## Release Tagging Strategy

**Semantic Versioning:**
- **Major (X.0.0)**: Breaking changes (API contract changes, major refactors)
- **Minor (0.X.0)**: New features (backward-compatible)
- **Patch (0.0.X)**: Bug fixes, docs, small improvements

**Creating Releases:**

1. Update CHANGELOG.md with new version and changes
2. Commit: `chore(release): prepare v0.2.0`
3. Tag: `git tag -a v0.2.0 -m "Release v0.2.0"`
4. Push: `git push origin main --follow-tags`

**Do not auto-push tags from automation.** Tags should be created manually after review.

---

## [Unreleased]

### Added
- (List new features/additions here before next release)

### Changed
- (List changes to existing functionality here)

### Fixed
- (List bug fixes here)

