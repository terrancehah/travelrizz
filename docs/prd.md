# Travel-Rizz Project Requirements Document

### Overview

Travel-Rizz is an AI-powered travel planning assistant that helps users create personalized trip itineraries. The platform combines conversational AI with practical travel tools to streamline the trip planning process, from initial destination selection to final itinerary creation.

### User Flow

1.  **Landing and Initial Setup**
    -   Users land on the homepage showcasing key features
    -   Access travel form to begin planning (`pages/travel-form.tsx`)
    -   Multi-step form collects essential trip details:
        -   Destination (with Google Places integration)
        -   Travel dates (5-day maximum duration)
        -   Travel preferences
        -   Budget level

2.  **Chat-based Planning Flow** (`pages/chat/index.tsx`, `components/chat/travel-chat.tsx`)
    -   Stage 1: Initial parameters confirmation
    -   Stage 2: City introduction with local insights
    -   Stage 3: Places exploration and saving (limited in free version)
    -   Stage 4: Premium itinerary planning (requires payment)
    -   Stage 5: Itinerary Display and Export (`components/planner/itinerary-export.tsx`) - This stage focuses on presenting the finalized itinerary from Stage 4 and enabling export to PDF.

3.  **Interactive Planning Features**
    -   Real-time map integration for place visualization (`components/features/map-component.tsx`)
    -   Weather data for informed planning (`components/features/weather/weather-historical.tsx`, `components/features/weather/weather-forecast.tsx`)
    -   Currency conversion for budget management (`components/features/currency/currency-converter.tsx`)
    -   Drag-and-drop itinerary organization (`components/planner/daily-planner.tsx`)

### Tech Stack & APIs

**Frontend:**

-   Next.js with Page Router
-   TypeScript for type safety
-   Tailwind CSS with Shadcn/ui components
-   `next-intl` for internationalization
-   `next-themes` for dark mode support

**Backend & Services:**

-   Vercel Edge Functions
-   Session-based state management (`managers/session-manager.ts`)
-   Stripe payment integration (`pages/api/stripe/`, `components/modals/premium-upgrade-modal.tsx`)
-   API integrations:
    -   Google Maps Platform (Places, Routes)
    -   Visual Crossing Weather
    -   FreeCurrency API
    -   Vercel AI SDK

### Core Features

**Session Management:** (`managers/session-manager.ts`)

-   Secure session handling
-   Timeout warnings
-   State persistence

**Travel Planning:**

-   AI-guided conversation (`pages/api/chat/chat.ts`)
-   Place recommendations (`ai/tools.ts`)
-   Route optimization (`ai/tools.ts`)
-   Weather insights (`ai/tools.ts`)
-   Currency conversion (`ai/tools.ts`)

**Premium Features:**

-   Unlimited place suggestions
-   Advanced itinerary planning
-   Daily route optimization
-   Detailed local insights

### In-scope

-   Multi-language support (9 languages)
-   Responsive design (mobile/desktop)
-   Dark mode support
-   Place search and saving
-   Weather data integration
-   Currency conversion
-   Basic and premium features
-   Payment processing
-   Session management

### Out-of-scope

-   User accounts/authentication
-   Trip history
-   Offline support
-   Native mobile apps
-   Social sharing
-   Multi-trip planning
-   Email notifications
-   Group planning features

### Non-functional Requirements

**Performance:**

-   Page load times < 3s
-   Real-time map updates
-   Responsive UI across devices

**Security:**

-   Secure payment processing (`pages/api/stripe/`)
-   Session data encryption
-   API key protection
-   Rate limiting (implemented at the infrastructure level, e.g., Vercel platform, Google Cloud Console)

**Scalability:**

-   Serverless architecture
-   CDN integration
-   Edge function deployment

### Constraints & Assumptions

**Technical Constraints:**

-   5-day maximum trip duration
-   Limited place suggestions in free version
-   Browser-based only (no native apps)
-   Internet connection required

**Business Constraints:**

-   One-time payment model
-   Limited free tier features
-   Single trip planning at a time

**User Assumptions:**

-   Basic device/internet access
-   English or supported language proficiency
-   Browser compatibility (modern browsers)

### Known Issues & Potential Pitfalls

**API Dependencies:**

-   Google Maps API rate limits
-   Weather API data accuracy
-   Currency API availability

**Technical Challenges:**

-   Complex state management (`managers/session-manager.ts`)
-   Map performance on mobile
-   Session timeout handling
-   Payment flow reliability (`pages/api/stripe/`)

**User Experience:**

-   Learning curve for AI chat
-   Place selection limitations
-   Premium feature visibility
-   Mobile map interactions

### Testing and Debugging

-   **Test Mode**: The application includes a test mode to facilitate rapid testing of the final itinerary features (Stage 5).
    -   **Activation**: Navigate to `/chat?test=true`.
    -   **Behavior**: This loads a mock `TravelSession` with pre-filled data for a trip to Tokyo, bypassing the multi-step form and initial chat stages.
    -   **Purpose**: It allows developers to directly render and test the `components/planner/itinerary-export.tsx` component, including its layout, data mapping, and PDF export functionality.
