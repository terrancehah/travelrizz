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
-   **Shadcn/ui for base components**
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
-   **Test Mode**: A test mode, accessible via `/chat?test=true`, is implemented for development. It loads a mock session to bypass the standard user flow, enabling direct testing of the `components/planner/itinerary-export.tsx` component.

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
-   **Langfuse** - LLM observability and tracing
    -   Cost and token tracking
    -   Tool execution monitoring
    -   Error tracking
    -   Conversation analytics
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

# Optional - Langfuse for production monitoring
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=https://cloud.langfuse.com
```

## Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^15.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next-intl": "^3.26.3",
    "next-themes": "^0.4.4",
    "@ai-sdk/google": "^1.1.14",
    "stripe": "^17.5.0",
    "@radix-ui/react-dialog": "^1.1.4",
    "lucide-react": "^0.468.0",
    "class-variance-authority": "^0.7.1"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.7.3",
    "@types/node": "^20.17.16",
    "@types/react": "^18.3.18",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
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
