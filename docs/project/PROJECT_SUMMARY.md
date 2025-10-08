# 📋 Project Summary - Quick Reference

**Foodics Reservations** - Vue 3 + TypeScript Restaurant Reservation Management System

---

## 🎯 **What It Does**

A comprehensive restaurant reservation management system that allows:
- **Branch Management**: Enable/disable branches for reservations
- **Reservation Settings**: Configure duration and time slots per branch
- **Time Slot Management**: Day-by-day time slot configuration with validation
- **Table Management**: View and manage restaurant tables and sections
- **Multi-language Support**: English and Arabic with RTL layout

---

## 🏗️ **Architecture Overview**

```
src/
├── app/                    # Application wiring (main.ts, i18n, styles)
├── components/             # Global UI components
│   ├── ui/                # Primitives (BaseButton, BaseModal, etc.)
│   └── layout/            # AppHeader, Toaster
├── features/branches/      # Branches feature
│   ├── components/        # Feature-specific UI
│   ├── composables/       # Feature-specific logic
│   ├── stores/            # Feature state management
│   ├── services/          # Feature API calls
│   └── views/             # Feature pages
├── services/              # Cross-feature services (HTTP client)
├── stores/                # Global state (UI store)
├── composables/           # Global composables
├── utils/                 # Pure utility functions
└── types/                 # Shared TypeScript types
```

---

## 🛠️ **Tech Stack**

| Technology | Purpose | Version |
|------------|---------|---------|
| **Vue 3** | Frontend framework | 3.4+ |
| **TypeScript** | Type safety | 5.3+ (strict mode) |
| **Pinia** | State management | 2.1+ |
| **vue-i18n** | Internationalization | 9.10+ |
| **Tailwind CSS** | Styling | 3.4+ |
| **Axios** | HTTP client | 1.6+ |
| **Vitest** | Unit testing | 1.3+ |
| **Playwright** | E2E testing | 1.42+ |

---

## 📊 **Key Statistics**

- **Components**: 20+ Vue components (all under 150 lines)
- **Composables**: 15+ composables for reusable logic
- **Utils**: 10+ pure utility functions
- **Tests**: 454+ unit tests, comprehensive E2E coverage
- **Types**: 15+ TypeScript interfaces (I-prefixed)
- **Locales**: EN/AR with RTL support
- **Bundle**: Minimal dependencies, optimized build

---

## 🎯 **Key Features**

### **Branch Management**
- List all restaurant branches
- Enable/disable branches for reservations
- View branch details and settings
- Optimistic updates with rollback

### **Reservation Settings**
- Configure reservation duration (30-180 minutes)
- Set time slots per day (max 3 slots per day)
- Day-by-day time slot editor
- Copy Saturday slots to all days
- Real-time validation with i18n error messages

### **Time Slot Management**
- Pure time parsing/formatting (no Date libraries)
- Slot overlap detection and validation
- Business rule enforcement (max 3 slots, no overnight)
- i18n-ready error handling

### **Table Management**
- View restaurant sections and tables
- Count reservable tables per branch
- Format table labels with i18n support

---

## 🔧 **Core Utilities**

### **Time Utilities** (`src/utils/time.ts`)
- `parseTime()` - Parse HH:mm strings
- `formatTime()` - Format to HH:mm
- `toMinutes()` - Convert to minutes
- `fromMinutes()` - Convert from minutes

### **Slot Utilities** (`src/utils/slots.ts`)
- `isValidRange()` - Validate single slot
- `isOverlapping()` - Check slot overlap
- `canAddSlot()` - Validate slot addition
- `copySaturdayToAll()` - Copy slots to all days
- `normalizeDay()` - Sort and deduplicate slots

### **Table Utilities** (`src/utils/tables.ts`)
- `reservableTablesCount()` - Count reservable tables
- `formatTableLabel()` - Format table labels

---

## 🧪 **Testing Strategy**

### **Unit Tests** (Vitest)
- **Coverage**: 454+ tests passing
- **Focus**: Composables, stores, utils
- **Strategy**: Pure functions, mocked dependencies
- **Location**: `tests/unit/` (mirrors `src/`)

### **E2E Tests** (Playwright)
- **Coverage**: All user flows
- **Strategy**: Offline with API mocking
- **Locales**: EN and AR testing
- **Location**: `tests/e2e/`

### **Quality Gates**
- ✅ Lint (ESLint strict)
- ✅ TypeCheck (TypeScript strict)
- ✅ Unit Tests (454+ passing)
- ✅ E2E Tests (all passing)
- ✅ Build (production ready)

---

## 🌍 **Internationalization**

### **Supported Locales**
- **EN** (English) - Left-to-right
- **AR** (Arabic) - Right-to-left

### **Features**
- All user-facing text via i18n
- RTL layout support
- Logical CSS properties
- Error messages in both languages
- Locale persistence

---

## ♿ **Accessibility**

### **WCAG Compliance**
- **ARIA labels**: Proper `aria-labelledby`, `aria-describedby`
- **Keyboard navigation**: All interactive elements accessible
- **Focus management**: Visible focus indicators
- **Semantic HTML**: Proper heading hierarchy
- **Screen reader support**: Proper landmarks and roles

---

## 🚀 **Performance**

### **Optimizations**
- **Tiny components**: Under 150 lines each
- **Pure functions**: No unnecessary re-renders
- **Tree-shaking**: Composition API optimization
- **Minimal dependencies**: No heavy libraries
- **TypeScript**: Compile-time optimizations

---

## 📋 **Development Standards**

### **Code Quality**
- **TypeScript strict**: No `any`/`unknown`
- **ESLint strict**: No `eslint-disable`
- **Component limits**: SFC ≤150 lines, complexity ≤8
- **I-prefixed interfaces**: `IUser`, `IApiError`, etc.
- **Conventional commits**: `feat:`, `fix:`, `chore:`

### **Architecture Patterns**
- **Feature-first**: Organize by business features
- **Separation of concerns**: Clear layer boundaries
- **Pure functions**: Extract complex logic to utils
- **Composables**: Reusable Vue logic
- **Optimistic updates**: Immediate UI feedback

---

## 🎤 **Interview Talking Points**

### **30-Second Pitch**
> "I built a Vue 3 + TypeScript restaurant reservation management system with feature-first architecture, 454+ unit tests, comprehensive i18n/RTL support, and strict type safety. The system handles branch management and reservation settings with pure utility functions and optimistic updates."

### **Key Strengths**
- **Architecture**: Feature-first, scalable, maintainable
- **Quality**: Strict TypeScript, comprehensive testing
- **Accessibility**: WCAG compliant, keyboard navigation
- **Internationalization**: EN/AR with RTL support
- **Performance**: Optimized bundle, fast load times

### **Technical Decisions**
- **Pure utils**: Extract complex logic for testability
- **I-prefixed interfaces**: Consistent type naming
- **Optimistic updates**: Better user experience
- **Offline testing**: Reliable test execution
- **Minimal dependencies**: Reduced bundle size

---

## 📚 **Quick File Reference**

### **Core Files**
- `src/utils/time.ts` - Time utilities
- `src/utils/slots.ts` - Slot validation
- `src/features/branches/stores/branches.store.ts` - State management
- `src/services/branches.service.ts` - API layer
- `src/types/foodics.ts` - Type definitions

### **Key Components**
- `BranchesListView.vue` - Main branches page
- `BranchSettingsModal.vue` - Settings configuration
- `DaySlotsEditor.vue` - Time slot editor
- `BaseButton.vue` - Reusable button component

### **Testing Files**
- `tests/unit/utils.slots.spec.ts` - Slot validation tests
- `tests/e2e/branches-list.spec.ts` - E2E branch management
- `tests/e2e/branches.settings-modal.spec.ts` - E2E settings

---

## 🎯 **Project Goals Achieved**

✅ **Maintainable**: Clear architecture, tiny components  
✅ **Scalable**: Feature-first structure, reusable patterns  
✅ **Testable**: Comprehensive test coverage, pure functions  
✅ **Type-safe**: Strict TypeScript, no `any`/`unknown`  
✅ **Accessible**: WCAG compliant, keyboard navigation  
✅ **Global**: Multi-language, RTL support  
✅ **Performant**: Optimized bundle, fast load times  

---

**Last Updated**: CARD 10 - Pure time/slots validation with i18n support
