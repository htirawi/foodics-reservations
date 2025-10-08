## Final Acceptance Checklist

**Purpose:** Verify the application meets all requirements before handover or production deployment.

---

## 1. Build & Run

### Commands Work

```bash
# Install
npm ci

# Development
npm run dev  # Starts on http://localhost:5173

# Type checking
npm run typecheck  # ✅ No errors

# Linting
npm run lint  # ✅ Passes

# Unit tests
npm run test:unit  # ✅ All tests pass

# E2E tests (requires Playwright browsers)
npx playwright install --with-deps
npm run test:e2e  # ✅ All tests pass (EN + AR)

# Build
npm run build  # ✅ Builds successfully
npm run preview  # ✅ Serves production build
```

### Environment Setup

- [ ] `.env.example` file exists and documents required variables
- [ ] `.env.local` used locally (gitignored, not committed)
- [ ] Required variables: `VITE_API_BASE_URL`, `VITE_FOODICS_TOKEN`

---

## 2. UI Flows

Test all core user flows in the application:

### Branches List

- [ ] **Load branches**: Branches display in a list/table view
- [ ] **Empty state**: Shows when no branches exist
- [ ] **Loading state**: Shows spinner while fetching
- [ ] **Error state**: Shows user-friendly error on failure

### Add Branch

- [ ] **Open modal**: Click "Add Branch" button
- [ ] **Validation**: Required fields validated on submit
- [ ] **Success**: Branch added to list; success toast shown
- [ ] **Error**: User-friendly error toast on failure

### Enable/Disable Branches

- [ ] **Single enable**: Click "Enable" button on disabled branch
- [ ] **Single disable**: Click "Disable" button on enabled branch
- [ ] **Bulk enable**: Select multiple disabled branches, click "Enable All"
- [ ] **Bulk disable**: Select multiple enabled branches, click "Disable All"
- [ ] **Optimistic updates**: UI updates immediately; rolls back on error

### Branch Settings

- [ ] **Open settings**: Click "Settings" button on a branch
- [ ] **Edit duration**: Change `max_reservation_duration` field
- [ ] **Edit day slots**: Add/edit/remove time slots (max 3 per day)
- [ ] **Slot validation**: Prevents overlapping slots; shows errors
- [ ] **Apply to all**: "Apply to All Branches" button works
- [ ] **Success**: Changes saved; success toast shown
- [ ] **Cancel**: Modal closes without saving

---

## 3. Internationalization & RTL

### Locale Switching

- [ ] **Switcher present**: Locale switcher in app header
- [ ] **Switch to Arabic**: Click "العربية" button
- [ ] **UI updates**: All strings switch to Arabic
- [ ] **RTL layout**: `<html dir="rtl">` applied
- [ ] **Persistence**: Locale persists on reload (localStorage)
- [ ] **Switch to English**: Click "English" button
- [ ] **LTR layout**: `<html dir="ltr">` applied

### RTL Verification

Test in Arabic (AR) mode:

- [ ] **Text alignment**: Text aligns right (uses `text-start`, not `text-left`)
- [ ] **Spacing**: Margins/padding flip (uses `margin-inline`, not `margin-left`)
- [ ] **Icons**: Directional arrows/chevrons flip horizontally
- [ ] **Forms**: Input alignment correct
- [ ] **Modals**: Layout mirrors properly

---

## 4. Accessibility

### Keyboard Navigation

- [ ] **Skip link**: First Tab focuses skip link; Enter jumps to main content
- [ ] **Tab order**: Logical tab order through all interactive elements
- [ ] **Focus visible**: All focusable elements show focus ring
- [ ] **Dialogs**: Tab cycles within dialog; Esc closes dialog

### Semantics & ARIA

- [ ] **Landmarks**: `<header>`, `<main>`, proper structure
- [ ] **Dialogs**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] **Forms**: Labels associated with inputs (`for`/`id`)
- [ ] **Errors**: Errors linked to inputs via `aria-describedby`
- [ ] **Buttons**: Use `<button>`, not `<div>` with click handlers
- [ ] **Loading states**: Announce to screen readers (`aria-live`)

### Color & Contrast

- [ ] **Text contrast**: ≥4.5:1 for body text
- [ ] **Focus indicators**: Visible on all interactive elements
- [ ] **Error colors**: Not color-only (text + icon)

### Lighthouse Score

Run Lighthouse audit (Chrome DevTools → Lighthouse):

- [ ] **Accessibility score ≥95** (target: 100)

---

## 5. Testing

### Unit Tests (Vitest)

```bash
npm run test:unit -- --run
```

- [ ] **All tests pass**
- [ ] **Coverage**: Key composables/stores/services/utils covered
- [ ] **Offline**: No real network calls (mocked with `axios-mock-adapter`)

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

- [ ] **All tests pass** (headless mode)
- [ ] **EN tests**: Pass with English locale
- [ ] **AR tests**: Pass with Arabic locale and RTL
- [ ] **Offline**: Uses route intercepts; no real API calls
- [ ] **Selectors**: Uses `data-testid` for stability
- [ ] **A11y smoke**: Checks roles, labels, keyboard nav

### Test Reports

On failure, artifacts are uploaded (CI) or stored locally:

- [ ] **Playwright report**: `playwright-report/`
- [ ] **Test results**: `test-results/`

---

## 6. Performance

### Bundle Size

```bash
npm run build
```

Check `dist/` folder:

- [ ] **Main bundle**: ≤250KB gzip (reasonable for SPA)
- [ ] **No massive chunks**: No single chunk >100KB (unless justified)

### Loading & Rendering

- [ ] **First contentful paint**: ≤1.5s (dev server or preview)
- [ ] **Time to interactive**: ≤3s
- [ ] **No layout shifts**: Content stable on load

### Optimizations Applied

- [ ] **Code splitting**: Routes lazy-loaded
- [ ] **Tree shaking**: Dead code eliminated (check build output)
- [ ] **No console.*** in production: Linted out of `src/**`

---

## 7. Security

### No Secrets

- [ ] **No tokens in code**: All secrets from environment variables
- [ ] **`.env*` gitignored**: No `.env` files committed
- [ ] **`.env.example` present**: Documents required variables

### HTTP Security

- [ ] **Auth headers**: Bearer token added via axios interceptor
- [ ] **Error normalization**: No sensitive data in error messages
- [ ] **No XSS**: No `v-html` or unsanitized user input

---

## 8. Documentation

### Public Docs Present

- [ ] **README.md**: Structure, rationale, setup, testing, quality bars
- [ ] **docs/api.md**: Service layer contracts
- [ ] **docs/stores.md**: Store responsibilities, optimistic updates
- [ ] **docs/ui.md**: App shell, UI primitives, tokens, RTL
- [ ] **docs/validation.md**: Time/slots utils, error mapping
- [ ] **docs/ADRs.md**: Architecture decisions
- [ ] **docs/ACCEPTANCE.md**: This checklist

### Private Docs Untracked

- [ ] **`docs/reference/`**: Design screenshots not committed (gitignored)
- [ ] **`.cursor/`**: Cursor workspace files not committed
- [ ] **`.husky/`**: Local git hooks not committed

### Docs Accuracy

- [ ] **Commands work**: All documented commands execute without error
- [ ] **File paths correct**: All referenced files exist
- [ ] **No placeholders**: No "TODO" or "Coming soon" sections

---

## 9. Git & CI

### Branch Protection (Recommended Setup)

**GitHub Settings → Branches → Add rule:**

1. **Branch name pattern**: `main` (or default branch)
2. **Require pull request before merging**: ✅
3. **Require status checks to pass**: ✅
   - `typecheck`
   - `lint`
   - `test:unit`
   - `test:e2e`
4. **Do not allow bypassing**: ✅
5. **Require linear history**: ✅ (optional, prevents merge commits)

### CI Workflow

- [ ] **`.github/workflows/ci.yml`**: Present and configured
- [ ] **Runs on PRs**: Triggers on pull requests to main
- [ ] **Runs on push**: Triggers on pushes to non-default branches
- [ ] **All checks pass**: typecheck → lint → test:unit → test:e2e
- [ ] **Artifacts on failure**: Playwright report and test results uploaded

### Git Hygiene

- [ ] **Conventional commits**: Clear, semantic commit messages
- [ ] **Small PRs**: Focused changes (not 30+ files)
- [ ] **PR template used**: All sections filled in

---

## 10. Code Quality

### TypeScript

```bash
npm run typecheck
```

- [ ] **No errors**: All type checks pass
- [ ] **Strict mode**: `tsconfig.json` has `"strict": true`
- [ ] **No `any`**: No `any`/`unknown` in `src/**`
- [ ] **Types in `/types`**: All shared types centralized

### ESLint

```bash
npm run lint
```

- [ ] **No errors**: Lint passes without warnings
- [ ] **No disables**: No `eslint-disable` comments in code
- [ ] **No `@ts-ignore`**: No TypeScript ignore comments

### Component Size

- [ ] **Components ≤150 SLOC**: All Vue components under size limit
- [ ] **Logic extracted**: Business logic in composables/stores/utils
- [ ] **No services in components**: No direct axios imports in `.vue` files

---

## 11. Final Smoke Test

### Manual Flow (5 minutes)

1. **Start app**: `npm run dev`
2. **Load branches**: See branches list
3. **Add branch**: Use "Add Branch" modal
4. **Enable branch**: Enable newly added branch
5. **Open settings**: Edit duration and day slots
6. **Apply to all**: Apply settings to all branches
7. **Switch to Arabic**: Change locale to AR
8. **Verify RTL**: Check layout and text alignment
9. **Switch back to English**: Change locale to EN
10. **Disable all**: Bulk disable all branches

**Expected**: All flows work without errors; UI responsive and accessible.

---

## ✅ Sign-Off

When all items are checked:

- [ ] **All acceptance criteria met**
- [ ] **Documentation complete and accurate**
- [ ] **CI green on latest commit**
- [ ] **No known critical bugs**
- [ ] **Ready for handover or production deployment**

**Reviewer Name**: ___________________________  
**Date**: ___________________________  
**Signature**: ___________________________

