# ConvertList Design System

## Overview
This document defines the design tokens and component patterns for ConvertList. All UI implementations should follow these guidelines strictly.

## Color Palette

### Primary Colors
- **Primary (Slate 900)**: `#0f172a` - Main brand color, buttons, headers
- **Primary Hover**: `#1e293b` - Button hover states
- **Primary Light**: `#334155` - Secondary accents

### Semantic Colors
- **Hot**: `#ef4444` - High-priority leads, urgent actions
- **Warm**: `#f59e0b` - Medium-priority leads, warnings
- **Cold**: `#3b82f6` - Low-priority leads, informational
- **Success**: `#22c55e` - Positive states, checkmarks
- **Error**: `#ef4444` - Error states, destructive actions
- **Warning**: `#f59e0b` - Warning states
- **Info**: `#3b82f6` - Informational states

### Neutral Colors
- **Background**: `#ffffff` - Main background
- **Surface**: `#f8fafc` - Secondary backgrounds (slate-50)
- **Border**: `#e2e8f0` - Borders and dividers (slate-200)
- **Text Primary**: `#0f172a` - Main text (slate-900)
- **Text Secondary**: `#64748b` - Secondary text (slate-500)
- **Text Tertiary**: `#94a3b8` - Tertiary text (slate-400)

### Accent Gradients
- **Brand Gradient**: `from-blue-600 to-purple-600` - Hero text, CTAs
- **Warm Gradient**: `from-amber-400 to-orange-400` - Highlights, badges
- **Surface Gradient**: `from-slate-900 to-slate-800` - Cards, dark sections

## Typography Scale

### Font Family
- **Base**: System sans-serif (Inter/San Francisco/Segoe UI)

### Headings
- **H1**: `text-5xl lg:text-7xl` font-bold tracking-tight
- **H2**: `text-4xl` font-bold tracking-tight
- **H3**: `text-xl` font-bold
- **H4**: `text-lg` font-bold

### Body Text
- **Body Large**: `text-lg` leading-relaxed
- **Body Base**: `text-base` leading-relaxed
- **Body Small**: `text-sm` leading-relaxed
- **Body Tiny**: `text-xs` leading-relaxed

## Spacing Scale

### Base Unit: 4px
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px
- **3xl**: 48px
- **4xl**: 64px
- **5xl**: 96px

### Section Padding
- **Standard**: `py-24` (96px)
- **Large**: `py-32` (128px)
- **Hero**: `pt-24 pb-32` (top 96px, bottom 128px)

## Border Radius

- **sm**: 4px - Small elements, badges
- **md**: 8px - Inputs, buttons
- **lg**: 12px - Cards
- **xl**: 16px - Large cards
- **2xl**: 24px - Hero cards, featured elements
- **full**: 9999px - Pills, avatars

## Shadows / Elevation

- **sm**: `shadow-sm` - Subtle elevation
- **md**: `shadow-md` - Standard elevation
- **lg**: `shadow-lg` - Hover states
- **xl**: `shadow-xl` - Featured cards
- **2xl**: `shadow-2xl` - Modals, overlays

## Animation Tokens

### Durations
- **fast**: 150ms - Micro-interactions
- **base**: 300ms - Standard transitions
- **slow**: 500ms - Complex animations

### Easing
- **ease-out**: Default easing
- **ease-in-out**: Smooth bidirectional
- **bounce**: Attention-grabbing

### Common Animations
- **fade-in**: `opacity-0 to opacity-100`
- **slide-up**: `translate-y-4 to translate-y-0`
- **scale-in**: `scale-95 to scale-100`
- **blob**: Custom gradient blob animation (7s infinite)

## Component Patterns

### Buttons
```tsx
// Primary Button
className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"

// Secondary Button
className="bg-white text-slate-900 px-8 py-4 rounded-xl text-lg font-medium border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"

// Small Button
className="btn-primary text-sm"
```

### Cards
```tsx
// Standard Card
className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"

// Featured Card
className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-2 border-slate-700 shadow-xl hover:shadow-2xl hover:-translate-y-1 rounded-2xl p-8"
```

### Inputs
```tsx
// Standard Input
className="input w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"

// With Validation
className="input w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
```

### Badges
```tsx
// Hot Badge
className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-medium"

// Warm Badge
className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-sm font-medium"

// Cold Badge
className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium"
```

## Usage Guidelines

### Strict Enforcement Rules
1. **No arbitrary values** - Always use Tailwind utility classes from the defined scales
2. **No inline styles** - Use Tailwind classes exclusively
3. **No magic numbers** - Use spacing scale values (4, 8, 12, 16, 24, 32, 48, 64)
4. **Component reuse** - Use existing shadcn/ui components when available
5. **Consistent patterns** - Follow the component patterns defined above

### Color Usage
- Use semantic colors (hot/warm/cold) for lead-related UI
- Use primary colors for CTAs and navigation
- Use neutral colors for structure and text
- Use accent gradients for highlights and featured elements

### Spacing Usage
- Use section padding constants (py-24, py-32)
- Use spacing scale for component internals
- Maintain consistent rhythm with 4px base unit

### Typography Usage
- Use heading scale for hierarchy
- Maintain consistent line heights (leading-relaxed)
- Use tracking-tight for large headings

## Accessibility Standards

- **Color Contrast**: WCAG AA compliant (4.5:1 for normal text, 3:1 for large text)
- **Focus States**: All interactive elements must have visible focus states
- **ARIA Labels**: Use semantic HTML and ARIA attributes where needed
- **Keyboard Navigation**: All features must be keyboard accessible
- **Screen Readers**: Use semantic HTML and proper labeling

## Component Library (shadcn/ui)

ConvertList uses shadcn/ui as the component foundation. Available components:
- Button
- Card
- Input
- Badge
- Dialog
- Dropdown Menu
- Tabs
- Skeleton
- Empty State
- Error Boundary

When adding new components:
1. Check if shadcn/ui has a suitable component
2. If yes, use it with our design tokens
3. If no, create a custom component following our patterns
4. Document the component in this file

## Future Additions

- [ ] Add more shadcn/ui components as needed
- [ ] Create custom component variants for ConvertList
- [ ] Add visual regression testing
- [ ] Create component documentation
