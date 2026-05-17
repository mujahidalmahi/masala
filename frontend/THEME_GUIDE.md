# Vibrant Dual-Theme System Guide

## Overview
This project now features a comprehensive dual-theme interface with vibrant, student-friendly design elements that work seamlessly in both light and dark modes.

## Theme Colors

### Light Mode (White Mode)
- **Background**: Crisp white (#ffffff) and light gray (#f8f9fa)
- **Text**: Dark gray (#1f2937) for optimal readability
- **Accent Colors**: 
  - Electric Blue: `hsl(199 89% 48%)`
  - Energetic Purple: `hsl(271 81% 56%)`
  - Bright Teal: `hsl(174 72% 56%)`
  - Vivid Orange: `hsl(25 95% 53%)`

### Dark Mode (Night Mode)
- **Background**: Deep charcoal (#1a1a2e) and navy tones
- **Text**: Soft white (#e8e8e8) for high contrast
- **Accent Colors**:
  - Electric Blue: `hsl(199 100% 50%)`
  - Energetic Purple: `hsl(271 91% 65%)`
  - Bright Teal: `hsl(174 100% 41%)`
  - Vivid Orange: `hsl(25 95% 53%)`

## Using the Theme Toggle

The theme toggle is available in the dashboard navbar:
```tsx
import { ThemeToggle } from '@/components/shared/theme-toggle';

<ThemeToggle />
```

## Custom Cursor System

The custom cursor is automatically enabled and includes:
- Animated cursor ring that follows mouse movement
- Trail particles with theme-appropriate colors
- Hover effects on interactive elements
- Click animations

## CSS Utility Classes

### Animations
- `.float-animation` - Floating effect
- `.pulse-glow` - Pulsing glow effect
- `.celebrate` - Celebration animation
- `.shimmer` - Shimmer effect
- `.gradient-text` - Animated gradient text

### Cards
- `.vibrant-card` - Card with gradient border and hover effects

### Buttons
- `.interactive-button` - Button with micro-interactions

### Status Indicators
- `.status-success` - Green success indicator
- `.status-warning` - Orange warning indicator
- `.status-error` - Red error indicator
- `.status-info` - Blue info indicator

### Subject Colors
- `.subject-math` - Blue for mathematics
- `.subject-science` - Green for science
- `.subject-arts` - Purple for arts
- `.subject-language` - Orange for languages

## Component Variants

### Button Variants
```tsx
<Button variant="default">Default</Button>
<Button variant="gradient">Gradient</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
```

### Badge Variants
```tsx
<Badge variant="default">Default</Badge>
<Badge variant="gradient">Gradient</Badge>
<Badge variant="success">Success</Badge>
```

### Progress Bar
The progress bar now features an animated gradient:
```tsx
<Progress value={75} />
```

## Tailwind Custom Classes

### Colors
- `bg-primary`, `text-primary` - Electric blue
- `bg-secondary`, `text-secondary` - Energetic purple
- `bg-accent`, `text-accent` - Bright teal
- `bg-warning`, `text-warning` - Vivid orange
- `bg-success`, `text-success` - Success green

### Shadows
- `shadow-glow-sm` - Small glow effect
- `shadow-glow-md` - Medium glow effect
- `shadow-glow-lg` - Large glow effect
- `shadow-vibrant` - Vibrant card shadow
- `shadow-vibrant-lg` - Large vibrant shadow

### Animations
- `animate-float` - Floating animation
- `animate-pulse-glow` - Pulsing glow
- `animate-gradient-shift` - Gradient shift
- `animate-celebrate` - Celebration effect
- `animate-shimmer` - Shimmer effect

## Best Practices

1. **Contrast**: All color combinations meet WCAG AA standards
2. **Transitions**: Use `theme-transition` class for smooth theme switching
3. **Interactive Elements**: Add `interactive-button` class for micro-interactions
4. **Cards**: Use rounded corners (16-20px) for modern look
5. **Typography**: Use font-semibold (600) or font-bold (700) for headings

## Accessibility

- All interactive elements have proper focus indicators
- Keyboard navigation fully supported
- Color contrast ratios meet WCAG AA standards
- Screen reader friendly with proper ARIA labels