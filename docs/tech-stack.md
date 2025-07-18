# Travel-Rizz Technical Stack

## Introduction

Travel-Rizz is built using modern web technologies, focusing on performance, scalability, and developer experience. The stack is chosen to provide a robust foundation for AI-powered travel planning functionality while maintaining excellent user experience.

## Frontend Technologies

### Core Framework

-   **Next.js 14**
-   **TypeScript**
-   **React (latest version)**

### UI Components & Styling

-   **Tailwind CSS for utility-first styling** (`tailwind.config.js`)
-   **ShadCN UI for base components**
-   **Lucide Icons for consistent iconography**
-   **Custom components with dark mode support** (`components/`)
-   **Itinerary Export Component** (`components/planner/itinerary-export.tsx`)

### State Management & Data Flow

-   **React Hooks for local state**
-   **Custom hooks for business logic** (`hooks/`)
-   **Session-based persistence** (`managers/session-manager.ts`)
-   **Vercel AI SDK integration** (`pages/api/chat/chat.ts`)

### International & Accessibility

-   **`next-intl` for translations** (`public/locales/`)
-   **Multiple font optimizations** (`hooks/useLocalizedFont.ts`)
-   **WCAG compliance features**
-   **RTL support ready**

## Backend Services

### API Routes

-   **Next.js API routes** (`pages/api/`)
-   **Edge Functions**
-   **Rate limiting implementation** (`pages/api/stripe/webhook.ts`)
-   **Error handling middleware**

### External APIs

1.  **Google Maps Platform** (`pages/api/maps/`)

    ```typescript
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
    ```

    -   Places API
    -   Routes API
    -   Geocoding API
    -   Maps JavaScript API

2.  **Weather Services** (`pages/api/weather/`)

    ```typescript
    NEXT_PUBLIC_VISUALCROSSING_API_KEY=your_api_key
    ```

    -   Historical weather data
    -   Weather forecasts
    -   Timezone handling

3.  **Currency Services** (`pages/api/currency/`)

    ```typescript
    FREECURRENCY_API_KEY=your_api_key
    ```

    -   Real-time exchange rates
    -   Currency conversion
    -   Rate updates

4.  **Payment Processing** (`pages/api/stripe/`)

    ```typescript
    STRIPE_SECRET_KEY=your_secret_key
    STRIPE_WEBHOOK_SECRET=your_webhook_secret
    ```

    -   Payment processing
    -   Webhook handling
    -   Transaction verification

## Development Tools

### Code Quality

-   **TypeScript for type safety**
-   **ESLint configuration**
-   **Prettier for formatting**
-   **Husky for git hooks**

### Testing

-   **Manual testing procedures**
-   **Error monitoring**
-   **Performance tracking**
-   **Test Mode**: A test mode is available at `/chat?test=true` to quickly test the itinerary export and display features by loading a mock session.

### Build Tools

-   **Next.js build system**
-   **PostCSS processing**
-   **Optimization plugins**

## Deployment & Infrastructure

### Hosting

```typescript
NEXT_PUBLIC_APP_URL=your_app_url
```

-   **Vercel Platform**
-   **Edge Function deployment**
-   **CDN configuration**

### Monitoring

-   **Vercel Analytics**
-   **Error tracking**
-   **Performance monitoring**

### Domain & SSL

-   **Custom domain setup**
-   **Automatic SSL**
-   **HTTPS enforcement**

## Environment Requirements

### Development Environment

-   **Node.js 18+**
-   **npm or yarn**
-   **Environment variables setup** (`.env.local`)

### Required API Keys

All keys must be properly configured in `.env.local`:

```typescript
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_VISUALCROSSING_API_KEY=
FREECURRENCY_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "next-intl": "latest",
    "next-themes": "latest",
    "@vercel/ai": "latest",
    "stripe": "latest",
    "@radix-ui/react-dialog": "latest",
    "lucide-react": "latest",
    "class-variance-authority": "latest"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

## API Documentation Links

-   [Google Maps Platform](https://developers.google.com/maps/documentation)
-   [Stripe API](https://stripe.com/docs/api)
-   [Visual Crossing Weather](https://www.visualcrossing.com/resources/documentation/weather-api/timeline-weather-api/)
-   [FreeCurrency API](https://freecurrencyapi.com/docs)
-   [Next.js Documentation](https://nextjs.org/docs)
-   [Tailwind CSS](https://tailwindcss.com/docs)
-   [ShadcnUI Components](https://ui.shadcn.com/docs)
-   [Vercel AI SDK](https://sdk.vercel.ai/docs)
