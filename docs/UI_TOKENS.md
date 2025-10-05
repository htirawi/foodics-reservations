# UI Design Tokens

**Derived from**: Reference designs (1.webp, 2.webp, 3.webp, 4.webp)  
**Date**: October 5, 2025

---

## Color Tokens

### Brand Purple (Primary)
Based on the purple buttons and borders in references.

| Token | Value | Usage |
|-------|-------|-------|
| `primary-50` | `#faf5ff` | Lightest tint |
| `primary-100` | `#f3e8ff` | Very light backgrounds |
| `primary-200` | `#e9d5ff` | Light backgrounds |
| `primary-300` | `#d8b4fe` | Borders (light) |
| `primary-400` | `#c084fc` | Borders |
| `primary-500` | `#a855f7` | Default hover states |
| `primary-600` | `#7c3aed` | **Main brand color** (buttons, links, borders) |
| `primary-700` | `#6d28d9` | Active/pressed states |
| `primary-800` | `#5b21b6` | Dark purple |
| `primary-900` | `#4c1d95` | Darkest purple |
| `primary-950` | `#2e1065` | Near-black purple |

**Where used:**
- Primary buttons (`bg-primary-600`, hover: `bg-primary-700`)
- Focus rings (`focus:ring-primary-500`)
- Border accents (TimePill, focused inputs)
- Links and interactive text

### Neutral Grays
Based on backgrounds, text hierarchy, and borders.

| Token | Value | Usage |
|-------|-------|-------|
| `neutral-50` | `#f9fafb` | Page background (light gray) |
| `neutral-100` | `#f3f4f6` | Card backgrounds, disabled inputs |
| `neutral-200` | `#e5e7eb` | Borders (light) |
| `neutral-300` | `#d1d5db` | Borders (default) |
| `neutral-400` | `#9ca3af` | Placeholder text, muted icons |
| `neutral-500` | `#6b7280` | Secondary text |
| `neutral-600` | `#4b5563` | Body text (medium) |
| `neutral-700` | `#374151` | Labels, headings (secondary) |
| `neutral-800` | `#1f2937` | Headings (primary) |
| `neutral-900` | `#111827` | Headings (darkest), main text |
| `neutral-950` | `#030712` | Near-black |

**Where used:**
- Page bg: `bg-neutral-50`
- Card: `bg-white` + `border-neutral-200`
- Text: `text-neutral-900` (body), `text-neutral-700` (labels), `text-neutral-400` (placeholders)
- Borders: `border-neutral-300` (inputs, buttons)

### Success (Green)
| Token | Value | Usage |
|-------|-------|-------|
| `success-500` | `#22c55e` | Success messages, icons |
| `success-600` | `#16a34a` | Success buttons hover |

### Danger (Red)
| Token | Value | Usage |
|-------|-------|-------|
| `danger-500` | `#ef4444` | Error text, icons |
| `danger-600` | `#dc2626` | Danger buttons, required asterisks |

### Info Blue
| Token | Value | Usage |
|-------|-------|-------|
| `#eff6ff` | Light blue background (info banners) |

---

## Spacing Scale

Derived from card padding, gaps, and margins in references.

| Token | Value | Usage |
|-------|-------|-------|
| `p-2` | `0.5rem` (8px) | Tight spacing |
| `p-3` | `0.75rem` (12px) | Small padding |
| `p-4` | `1rem` (16px) | Standard spacing |
| `p-6` | `1.5rem` (24px) | Card padding, modal padding |
| `p-8` | `2rem` (32px) | Large card padding |
| `gap-2` | `0.5rem` (8px) | Tight gaps (icons, pills) |
| `gap-4` | `1rem` (16px) | Standard gaps (form fields) |
| `gap-6` | `1.5rem` (24px) | Large gaps (sections) |

**Where used:**
- Cards: `p-6` to `p-8`
- Modals: `p-6`
- Buttons: `px-6 py-3` (medium), `px-3 py-1.5` (small)
- Table cells: `px-6 py-4`

---

## Border Radius

Derived from rounded corners in references.

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | `0.75rem` (12px) | Inputs, time pills, small buttons |
| `rounded-xl` | `1rem` (16px) | Medium/large buttons |
| `rounded-2xl` | `1.5rem` (24px) | Cards, modals |
| `rounded-3xl` | `2rem` (32px) | Large containers (if needed) |

**Where used:**
- Cards/Modals: `rounded-2xl`
- Buttons: `rounded-xl` (primary), `rounded-lg` (small)
- Inputs/Select: `rounded-lg`
- Time pills: `rounded-lg`

---

## Typography Scale

Based on hierarchy in references.

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-sm` | `0.875rem` (14px) | `1.25rem` | Small text, labels |
| `text-base` | `1rem` (16px) | `1.5rem` | Body text, inputs |
| `text-lg` | `1.125rem` (18px) | `1.75rem` | Subheadings |
| `text-xl` | `1.25rem` (20px) | `1.75rem` | Modal titles |
| `text-2xl` | `1.5rem` (24px) | `2rem` | Page titles |
| `text-3xl` | `1.875rem` (30px) | `2.25rem` | Large headings |

**Font Weights:**
- `font-medium` (500): Labels, buttons
- `font-semibold` (600): Headings, modal titles
- `font-bold` (700): Page titles

**Where used:**
- Page title (Reservations): `text-2xl font-bold`
- Modal title: `text-xl font-semibold`
- Table headers: `text-sm font-medium`
- Body text: `text-base`

---

## Shadows

Derived from card elevations.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle card shadow |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Default card shadow |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Modal shadow |

**Where used:**
- Cards: `shadow-sm`
- Modals: `shadow-xl`

---

## Focus States

**All interactive elements:**
- `focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`

**Accessibility requirement:** Visible focus indicator on all buttons, inputs, links.

---

## Component Token Map

### Button (Primary)
```
bg-primary-600
text-white
hover:bg-primary-700
rounded-xl
px-6 py-3
text-base font-medium
focus:ring-2 focus:ring-primary-500
```

### Button (Ghost)
```
border border-neutral-300
bg-white
text-neutral-700
hover:bg-neutral-50
rounded-xl
px-6 py-3
```

### Card
```
bg-white
rounded-2xl
shadow-sm
border border-neutral-200
p-6 or p-8
```

### Input/Select
```
rounded-lg
border border-neutral-300
px-4 py-3
text-neutral-900
placeholder:text-neutral-400
focus:ring-2 focus:ring-primary-500
```

### Modal
```
rounded-2xl
shadow-xl
bg-white
max-w-{size} (md, lg, xl)
p-6 (header and body)
```

### Time Pill
```
rounded-lg
border-2 border-primary-600
bg-white
px-4 py-2.5
text-sm font-medium
```

### Table
```
border-b border-neutral-200 (header)
px-6 py-4 (cells)
text-sm (body)
font-medium (headers)
```

---

## RTL Considerations

**Logical properties used:**
- `ms-*` (margin-start) instead of `ml-*`
- `me-*` (margin-end) instead of `mr-*`
- `ps-*` (padding-start) instead of `pl-*`
- `pe-*` (padding-end) instead of `pr-*`

**Icons that flip in RTL:**
- Chevrons, arrows (use `transform: scaleX(-1)` conditionally)

---

## Mobile-First Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm:` | `640px` | Tablets portrait |
| `md:` | `768px` | Tablets landscape |
| `lg:` | `1024px` | Desktops |
| `xl:` | `1280px` | Large desktops |

**Default styles target mobile** — enhance with breakpoints as needed.

---

## References

- Visual references: `docs/reference/1.webp`, `2.webp`, `3.webp`, `4.webp`
- Tailwind config: `tailwind.config.ts`
- Components: `src/components/ui/Base*.vue`, `TimePill.vue`
