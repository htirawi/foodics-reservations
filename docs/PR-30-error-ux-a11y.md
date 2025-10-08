# feat(error-ux-a11y): implement centralized error handling with auth banner

- **PR**: https://github.com/htirawi/foodics-reservations/pull/30  
- **Branch**: feat/error-ux-a11y  
- **Commit**: dda6135  
- **Date**: 2025-01-05 14:56  


## 1) Overview
- Implemented comprehensive centralized error handling system with authentication banner for 401 errors
- Fixed all 76 E2E test failures while maintaining 76 skipped @online tests  
- Added proper RTL focus management and keyboard navigation support across all browsers
- Integrated auth banner into UI store with show/hide actions and HTTP interceptor wiring
- Resolved inconsistent toast state management between composables and centralized store

## 2) Motivation (Why)
The application had 76 failed E2E tests due to missing error handling components and inconsistent state management between local composables and the centralized UI store. Users needed proper feedback for different error types (401 authentication, 4xx client errors, 5xx server errors) with accessible, internationalized messaging that works correctly in both English and Arabic RTL layouts.

## 3) Changes (What & How)
- **Error Handling Architecture**: Implemented centralized error handling with three distinct flows:
  - 401 Unauthorized: Auth banner with dismissible action
  - 4xx Client Errors: Inline error messages in components  
  - 5xx Server Errors: Toast notifications with retry messaging
- **New Components**: Created `AuthTokenBanner.vue` with proper ARIA attributes and i18n support
- **State Management**: Extended UI store with `authBanner` state and actions (`showAuthBanner`, `hideAuthBanner`)
- **HTTP Integration**: Wired response interceptor to automatically show auth banner on 401 responses
- **i18n Support**: Added authentication error keys in both EN and AR locale files
- **Toast Fix**: Resolved data flow disconnect between `useToast()` composable and `AppToaster` component by using `uiStore.notify()` directly
- **RTL Polish**: Fixed WebKit focus visibility issues with increased timeouts and proper element targeting
- **Testing**: All E2E tests now pass with proper error flow coverage

## 4) Commands to reproduce locally
```bash
# Install dependencies
npm install

# Run quality gates
npm run lint
npm run typecheck  
npm run test:unit
npm run test:e2e

# Start development server
npm run dev
```

## 5) Files touched (high-level)
- `src/components/ui/AuthTokenBanner.vue` - New auth banner component
- `src/stores/ui.store.ts` - Extended with auth banner state management
- `src/services/http.ts` - Added 401 response handling
- `src/app/App.vue` - Integrated auth banner into main layout
- `src/features/branches/views/BranchesListView.vue` - Fixed toast state management
- `src/app/i18n/locales/` - Added auth error messages (EN/AR)
- `tests/e2e/` - Fixed test helpers and assertions for error flows

## 6) Risk & Rollback
**Low Risk**: Error handling improvements only, no breaking changes to existing functionality.

**Rollback**: 
```bash
git revert dda6135
```
This will restore the previous error handling behavior and revert all changes.

## 7) References
- [Vue 3 Composition API](https://vuejs.org/guide/composition-api/)
- [Pinia State Management](https://pinia.vuejs.org/)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [Vue i18n](https://vue-i18n.intlify.dev/)
- [Playwright Testing](https://playwright.dev/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## 8) Talking points (for interviews)
- **Centralized Error Handling**: Implemented a comprehensive error handling system that provides appropriate user feedback for different HTTP status codes (401, 4xx, 5xx) with proper accessibility and internationalization
- **State Management Architecture**: Resolved data flow inconsistencies between local composables and centralized store, ensuring toast notifications work reliably across the application
- **Cross-browser RTL Support**: Fixed WebKit-specific focus visibility issues in Arabic RTL layouts while maintaining keyboard navigation accessibility
- **E2E Test Strategy**: Systematically debugged and fixed 76 test failures by implementing missing components and correcting test assertions, demonstrating thorough testing practices
- **Accessibility & i18n**: Ensured all error messages are properly internationalized and accessible, with proper ARIA attributes and keyboard navigation support
- **HTTP Interceptor Pattern**: Used Axios response interceptors to automatically handle authentication errors globally, reducing boilerplate and ensuring consistent error handling

