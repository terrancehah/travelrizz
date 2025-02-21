# Frontend Guidelines

## Color System

Based on the Tailwind framework, our color system is organized into five key categories:

### 1. Background Colors

Background colors establish the foundation of our UI:

```css
/* Light Mode Backgrounds */
.backgrounds {
  --bg-white: white;                    /* Primary background */
  --bg-light-blue: rgb(236 245 255);    /* Light blue background */
  --bg-sky-100: rgb(224 242 254);       /* Sky background */
  --bg-slate-100: rgb(241 245 249);     /* Slate background - subtle */
  --bg-gray-100: rgb(243 244 246);      /* Gray background - subtle */
}

/* Dark Mode Backgrounds */
.backgrounds-dark {
  --bg-gray-900: rgb(17 24 39);         /* Primary dark background */
  --bg-gray-800: rgb(31 41 55);         /* Secondary dark background */
  --bg-gray-700: rgb(55 65 81);         /* Tertiary dark background */
  --bg-blue-900: rgb(30 58 138);        /* Accent dark background */
}
```

### 2. Border Colors

Our border system uses two styles: primary for dividers and strong for interactive elements:

```css
/* Light Mode Borders */
.borders {
  --border-gray-100: rgb(243 244 246);  /* Primary border */
  --border-gray-200: rgb(229 231 235);  /* Divider border */
  --border-gray-300: rgb(209 213 219);  /* Interactive border */
  --border-slate-400: rgb(148 163 184); /* Strong border */
}

/* Dark Mode Borders */
.borders-dark {
  --border-gray-800: rgb(31 41 55);     /* Primary dark border */
  --border-gray-700: rgb(55 65 81);     /* Secondary dark border */
  --border-gray-600: rgb(75 85 99);     /* Interactive dark border */
}
```

### 3. Content Colors

Content colors for text, buttons, and interactive elements:

```css
/* Light Mode Content */
.content {
  --text-primary: rgb(74 136 198);      /* Primary text/brand */
  --text-secondary: rgb(107 114 128);    /* Secondary text */
  --text-gray-600: rgb(75 85 99);       /* Muted text */
  --text-gray-500: rgb(107 114 128);    /* Subtle text */
}

/* Dark Mode Content */
.content-dark {
  --text-white: white;                   /* Primary text */
  --text-sky-100: rgb(224 242 254);     /* Brand text */
  --text-gray-300: rgb(209 213 219);    /* Muted text */
  --text-gray-400: rgb(156 163 175);    /* Subtle text */
}
```

### 4. Accent Colors

Accent colors for states, alerts, and emphasis:

```css
/* Success States */
.accent-success {
  --success-bg: emerald-100;            /* Success background */
  --success-content: emerald-500;       /* Success content */
}

/* Error States */
.accent-error {
  --error-bg: rose-100;                 /* Error background */
  --error-content: red-500;             /* Error content */
}

/* Alert States */
.accent-alert {
  --alert-bg: orange-100;               /* Alert background */
  --alert-content: orange-500;          /* Alert content */
}
```

### 5. Brand Colors

Our primary brand colors:

```css
/* Brand Primary */
.brand {
  --sky-blue: rgb(74 136 198);          /* Primary brand color */
  --sky-600: rgb(2 132 199);            /* Hover state */
  --sky-500: rgb(14 165 233);           /* Dark mode primary */
  --sky-400: rgb(56 189 248);           /* Dark mode hover */
}
```

## Usage Guidelines

### Accessibility

- Maintain WCAG 2.1 AA standard contrast ratios
- Use semantic variations for states and feedback
- Provide clear hover and focus states
- Support dark mode for all color combinations

### Dark Mode Implementation

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

1. Use Semantic Colors:
   - Base UI elements: Background and border colors
   - Interactive elements: Brand colors
   - Feedback and states: Accent colors
   - Text and icons: Content colors

2. Transitions and Animations:
   ```css
   .transitions {
     transition-colors: duration-300;
     transition-all: duration-400;
   }
   ```

3. Opacity Variations:
   ```css
   /* Example opacity usages */
   bg-light-blue/95         /* 95% opacity */
   bg-light-blue/60         /* 60% opacity */
   bg-sky-blue/90          /* 90% opacity */
   ```

4. Color Combinations:
   ```css
   /* Example combinations */
   bg-slate-100/40 dark:bg-gray-900    /* Background */
   text-primary dark:text-sky-100       /* Text */
   hover:text-primary dark:hover:text-white  /* Interactive */
   ```

### Implementation Notes

- Use Tailwind's utility classes for all color implementations
- Follow mobile-first and dark mode patterns
- Maintain consistent transitions for color changes
- Use semantic class names that reflect purpose
- Implement backdrop blur with caution for performance

These guidelines ensure consistent, accessible, and maintainable color usage across the Travel-Rizz application.