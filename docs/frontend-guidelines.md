# Frontend Guidelines

## Color System

-   **Location:** `tailwind.config.js`

Our color system is primarily defined within the `tailwind.config.js` file, which extends the default Tailwind CSS color palette with a few custom brand colors. The application relies on Tailwind's utility classes for styling and does not use a custom CSS variable system for colors.

### Custom Colors

The following custom colors are defined in `tailwind.config.js`:

```javascript
// tailwind.config.js
{
  // ...
  theme: {
    extend: {
      colors: {
        'primary': '#123456',
        'secondary': '#456789',
        'sky-blue': '#4a88c6',
        'light-blue': '#e8f4ff',
      },
    },
  },
  // ...
}
```

-   `primary`: A dark blue, used for primary text and elements.
-   `secondary`: A lighter blue, used for secondary text and elements.
-   `sky-blue`: The main brand accent color.
-   `light-blue`: A very light blue, often used for backgrounds.

## Usage Guidelines

### Accessibility

-   Maintain WCAG 2.1 AA standard contrast ratios
-   Use semantic variations for states and feedback
-   Provide clear hover and focus states
-   Support dark mode for all color combinations

### Dark Mode Implementation

-   **Location:** `hooks/useTheme.ts`, `components/ui/theme-switcher.tsx`

```jsx
// Example component with dark mode support
<div className="
  bg-white dark:bg-gray-900
  text-gray-600 dark:text-gray-300
  border-gray-200 dark:border-gray-700
">
  {children}
</div>
```

### Best Practices

1.  **Use Semantic Colors:**
    -   Base UI elements: Background and border colors
    -   Interactive elements: Brand colors
    -   Feedback and states: Accent colors
    -   Text and icons: Content colors

2.  **Transitions and Animations:**

    ```css
    .transitions {
      transition-colors: duration-300;
      transition-all: duration-400;
    }
    ```

3.  **Opacity Variations:**

    ```css
    /* Example opacity usages */
    bg-light-blue/95         /* 95% opacity */
    bg-light-blue/60         /* 60% opacity */
    bg-sky-blue/90          /* 90% opacity */
    ```

4.  **Color Combinations:**

    ```css
    /* Example combinations */
    bg-slate-100/40 dark:bg-gray-900    /* Background */
    text-primary dark:text-sky-100       /* Text */
    hover:text-primary dark:hover:text-white  /* Interactive */
    ```

### Implementation Notes

-   Use Tailwind's utility classes for all color implementations
-   Follow mobile-first and dark mode patterns
-   Maintain consistent transitions for color changes
-   Use semantic class names that reflect purpose
-   Implement backdrop blur with caution for performance

These guidelines ensure consistent, accessible, and maintainable color usage across the Travel-Rizz application.
