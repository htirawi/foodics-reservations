# 🏗️ Layout Components Reference

This document covers the layout components in `src/components/layout/`. These components handle the overall structure and layout of the application.

## 📋 **Layout Components Overview**

| Component | Purpose | Props | Emits | Usage |
|-----------|---------|-------|-------|-------|
| `AppHeader` | Application header with title and locale switcher | - | - | Main app header |
| `Toaster` | Toast notification display system | - | - | Show notifications |

---

## 🏷️ **AppHeader**

**File**: `src/components/layout/AppHeader.vue`  
**Purpose**: Main application header with title and locale switcher

### **Features**
- Application title display
- Integrated locale switcher
- Responsive design
- Accessibility support

### **Template Structure**
```vue
<template>
  <header role="banner" class="bg-white shadow-sm">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between gap-4">
        <h1 data-testid="header-title" class="text-2xl font-bold text-neutral-900">
          {{ $t('app.title') }}
        </h1>
        <LocaleSwitcher />
      </div>
    </div>
  </header>
</template>
```

### **Usage**
```vue
<template>
  <div>
    <AppHeader />
    <main>
      <!-- Main content -->
    </main>
  </div>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue';
</script>
```

### **Key Features**

#### **1. Internationalization**
- Uses `$t('app.title')` for translatable title
- Integrates with `LocaleSwitcher` component

#### **2. Accessibility**
- `role="banner"` for semantic HTML
- `data-testid="header-title"` for testing

#### **3. Responsive Design**
- `max-w-7xl` for maximum width
- Responsive padding (`px-4 sm:px-6 lg:px-8`)
- Flexible layout with `justify-between`

### **Styling Classes**
- **Container**: `mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8`
- **Layout**: `flex items-center justify-between gap-4`
- **Title**: `text-2xl font-bold text-neutral-900`

---

## 🍞 **Toaster**

**File**: `src/components/layout/Toaster.vue`  
**Purpose**: Toast notification display system

### **Features**
- Displays multiple toast notifications
- Automatic dismissal with timers
- Different toast types (success, error, warning, info)
- Animated transitions
- Manual dismissal support

### **Template Structure**
```vue
<template>
  <div
    data-testid="toaster"
    class="fixed inset-0 z-50 pointer-events-none"
  >
    <TransitionGroup
      name="toast"
      tag="div"
      class="absolute top-4 end-4 space-y-2"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto"
      >
        <!-- Toast content -->
      </div>
    </TransitionGroup>
  </div>
</template>
```

### **Usage**
The Toaster component is automatically included in the main app and managed by the UI store. Use the `useToast` composable to show notifications.

#### **Basic Usage**
```vue
<template>
  <BaseButton @click="showSuccess">
    Show Success Toast
  </BaseButton>
</template>

<script setup>
import { useToast } from '@/stores/ui.store';

const { success, error, warning, info } = useToast();

const showSuccess = () => {
  success('Operation completed successfully!');
};

const showError = () => {
  error('Something went wrong!');
};

const showWarning = () => {
  warning('Please check your input');
};

const showInfo = () => {
  info('New feature available!');
};
</script>
```

#### **With Custom Duration**
```vue
<script setup>
import { useToast } from '@/stores/ui.store';

const { show } = useToast();

const showPersistentToast = () => {
  show('This toast will stay until manually dismissed', 'info', 0);
};
</script>
```

### **Toast Types**

#### **Success Toast**
```vue
<script setup>
const { success } = useToast();

const handleSave = async () => {
  try {
    await saveData();
    success('Data saved successfully!');
  } catch (error) {
    error('Failed to save data');
  }
};
</script>
```

#### **Error Toast**
```vue
<script setup>
const { error } = useToast();

const handleDelete = async () => {
  try {
    await deleteItem();
    success('Item deleted successfully');
  } catch (err) {
    error(`Failed to delete: ${err.message}`);
  }
};
</script>
```

### **Toast Styling**

#### **Toast Container**
- **Position**: `fixed inset-0 z-50 pointer-events-none`
- **Location**: `absolute top-4 end-4` (top-right corner)
- **Spacing**: `space-y-2` between toasts

#### **Toast Types Styling**
```typescript
// Success: Green theme
"bg-white text-green-800 border-l-4 border-green-400"

// Error: Red theme  
"bg-white text-red-800 border-l-4 border-red-400"

// Warning: Yellow theme
"bg-white text-yellow-800 border-l-4 border-yellow-400"

// Info: Blue theme
"bg-white text-blue-800 border-l-4 border-blue-400"
```

### **Animation Classes**
```css
/* Toast enter/leave animations */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
```

### **Accessibility Features**
- **ARIA Live Region**: Announcements for screen readers
- **Focus Management**: Proper focus handling
- **Keyboard Support**: ESC key to dismiss
- **High Contrast**: Clear visual distinction between toast types

---

## 🎯 **Layout Component Patterns**

### **1. Container Pattern**
All layout components use consistent container patterns:
```vue
<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>
```

### **2. Flexbox Layout**
Consistent use of flexbox for alignment:
```vue
<div class="flex items-center justify-between gap-4">
  <!-- Content -->
</div>
```

### **3. Responsive Design**
Mobile-first approach with responsive breakpoints:
- `px-4` (mobile)
- `sm:px-6` (tablet)
- `lg:px-8` (desktop)

### **4. Accessibility**
All layout components include:
- Semantic HTML elements (`<header>`, `<main>`)
- ARIA roles and attributes
- `data-testid` for testing
- Keyboard navigation support

### **5. RTL Support**
Layout components use logical CSS properties:
```vue
<!-- Instead of right-4, use end-4 for RTL support -->
<div class="absolute top-4 end-4">
```

---

## 🔧 **Integration with Stores**

### **AppHeader Integration**
```vue
<script setup>
import LocaleSwitcher from "@/components/ui/LocaleSwitcher.vue";
</script>
```

The AppHeader integrates with:
- **i18n**: For translatable titles
- **LocaleSwitcher**: For language switching

### **Toaster Integration**
```vue
<script setup>
import { storeToRefs } from "pinia";
import { useUIStore } from "@/stores/ui.store";
import { useToastDisplay } from "@/composables/useToastDisplay";

const uiStore = useUIStore();
const { toasts } = storeToRefs(uiStore);
const { removeToast } = uiStore;

const { toastClasses, closeButtonClasses, iconComponent } = useToastDisplay();
</script>
```

The Toaster integrates with:
- **UI Store**: For toast state management
- **useToastDisplay**: For styling and icons

---

## 🚀 **Best Practices**

### ✅ **DO**
- Use semantic HTML elements for layout structure
- Include proper accessibility attributes
- Follow responsive design patterns
- Integrate with stores for state management
- Use consistent spacing and typography

### ❌ **DON'T**
- Add business logic to layout components
- Forget accessibility considerations
- Use fixed positioning without proper z-index management
- Skip responsive design considerations
- Hardcode text that should be translatable

---

## 🧪 **Testing Layout Components**

### **AppHeader Tests**
```typescript
describe('AppHeader', () => {
  it('should display the application title', () => {
    render(AppHeader);
    expect(screen.getByTestId('header-title')).toBeInTheDocument();
  });

  it('should include the locale switcher', () => {
    render(AppHeader);
    expect(screen.getByRole('button', { name: /language/i })).toBeInTheDocument();
  });
});
```

### **Toaster Tests**
```typescript
describe('Toaster', () => {
  it('should display toast notifications', () => {
    const { success } = useToast();
    success('Test message');
    
    render(Toaster);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should dismiss toasts after timeout', async () => {
    const { success } = useToast();
    success('Test message', 'info', 100);
    
    render(Toaster);
    expect(screen.getByText('Test message')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });
});
```

---

This completes the layout components reference. These components provide the structural foundation for the application's user interface.
