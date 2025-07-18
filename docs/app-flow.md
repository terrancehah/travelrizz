# Travel-Rizz Application Flow

### Introduction

The Travel-Rizz application provides a seamless journey from initial travel planning to final itinerary creation. Built on Next.js with a robust backend of API routes and integrated services, the application is designed to guide users through a natural progression of travel planning stages, combining AI assistance with practical tools.

### Landing Page Journey

Upon accessing the landing page (`pages/index.tsx`), users are introduced to Travel-Rizz through:

The homepage presents four key sections:
- Features showcase with interactive examples
- About section explaining the platform's purpose
- Pricing information including premium features
- Footer with quick links and language selection

### Multi-step Travel Form

The travel form (`pages/travel-form.tsx`) guides users through four essential steps:

1.  **Destination Input**
    -   Google Places autocomplete integration
    -   Real-time validation
    -   Map preview of selected location

2.  **Date Selection**
    -   Interactive calendar with date range picker
    -   5-day maximum duration enforcement
    -   Automatic validation of selected dates

3.  **Travel Preferences**
    -   Six preference categories:
        -   Culture and Heritage
        -   Nature
        -   Foodie
        -   Leisure
        -   Adventure
        -   Arts & Museum
    -   Multiple selection allowed
    -   Visual confirmation of choices

4.  **Budget Selection**
    -   Four budget levels:
        -   Budget
        -   Moderate
        -   Luxury
        -   Ultra Luxury
    -   Clear pricing expectations
    -   Visual budget indicators

### Chat Interface Journey

Post form submission, users progress through four stages in the chat interface (`pages/chat/index.tsx`, `components/chat/travel-chat.tsx`):

**Stage 1: Initial Setup**
- Session initialization
- Travel details confirmation
- Additional preference gathering

**Stage 2: City Overview**
- Local insights presentation
- Weather information display
- Currency and budget context
- Cultural highlights

**Stage 3: Place Discovery**
- AI-driven recommendations
- Interactive map exploration
- Place saving functionality
- Premium upgrade prompt

**Stage 4: Itinerary Planning (Premium)**
- Day-by-day organization
- Route optimization
- Timing suggestions
- Place rearrangement

**Stage 5: Itinerary Display and Export**
- **Purpose**: This stage is dedicated to presenting the finalized itinerary generated in Stage 4 and providing options for export.
- **Trigger**: Users proceed to this stage once they are satisfied with the itinerary planned in Stage 4.
- **Key Features**:
    - Comprehensive presentation of the day-by-day itinerary, including city information, travel details, saved places, and important reminders.
    - Interactive map display showing all saved places.
    - Functionality to export the entire itinerary to a PDF format (via `window.print()`).
- **Location**: The UI is defined in `components/planner/itinerary-export.tsx`.
- **Implementation**: This is not a separate page. The `itinerary-export` component is dynamically imported and rendered within the main chat interface at `pages/chat/index.tsx` when the user reaches Stage 5.
- **Test Mode**: A test mode can be activated by navigating to `/chat?test=true`. It loads a mock session with pre-filled data for a trip to Tokyo, allowing developers to bypass the initial planning stages and directly test the `itinerary-export.tsx` component in Stage 5.

### Map Interface Evolution

The map component (`components/features/map-component.tsx`) adapts throughout the journey:

**Landing to Form:**
- Initial city view
- Destination confirmation
- Area overview

**Chat Interface:**
- Place markers appear
- Interactive info windows
- Route visualization
- Cluster management

**Premium Planning:**
- Optimized routes
- Day-based color coding
- Distance calculations
- Timing estimates

### Session Management

User session handling (`managers/session-manager.ts`) occurs through:

**Initialization:**
- Session creation
- State storage setup
- Timeout configuration

**Maintenance:**
- Regular state updates
- Activity monitoring
- Timeout warnings

**Recovery:**
- Session restoration
- State preservation
- Error handling

### Language System

Language management (`hooks/useLocalizedFont.ts`, `components/ui/language-switcher.tsx`) includes:

**Selection:**
- Initial detection
- Manual override
- Persistent storage

**Content Loading:**
- Dynamic translations
- Font adjustments
- RTL support
- Format localization

### Theme System

Dark/Light mode implementation (`hooks/useTheme.ts`, `components/ui/theme-switcher.tsx`) includes:

**Toggle:**
- System preference detection
- Manual selection
- State persistence

**Styling:**
- Color scheme switching
- Component adaptation
- Smooth transitions

### Error Handling

The application manages errors through:

**Prevention:**
- Input validation
- State verification
- API error catching (`pages/api/`)

**Recovery:**
- Graceful fallbacks
- User notifications
- State restoration

### Responsive Behavior

The interface adapts based on:

**Screen Size:**
- Mobile-first design
- Breakpoint adjustments
- Component reflow

**Capabilities:**
- Touch optimization
- Gesture support
- Input adaptation

### Premium Flow

The premium upgrade process is handled by a client-side Stripe Buy Button and a backend verification flow.

**Trigger:**
- Feature limit detection in the chat interface.
- A `PremiumUpgradeModal` (`components/modals/premium-upgrade-modal.tsx`) is displayed.

**Processing:**
- A Stripe Buy Button is rendered in the modal.
- The frontend polls the `/api/stripe/verify` endpoint to check for payment success.
- The `/api/stripe/webhook` endpoint receives a webhook from Stripe upon successful payment.

**Confirmation:**
- The `verify` endpoint confirms the payment.
- A `PaymentSuccessPopup` (`components/modals/payment-success-popup.tsx`) is displayed.
- Premium features are unlocked for the user's session.