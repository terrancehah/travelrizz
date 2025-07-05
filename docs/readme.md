# Travel-Rizz

Travel-Rizz is an AI-powered travel planning assistant that helps users create personalized trip itineraries. Combining conversational AI with practical travel tools, it offers a seamless experience from initial planning to final itinerary creation.

## 🌟 Features

- **AI Chat-based Trip Planning**: Plan your trip interactively with a conversational AI assistant.
  - **Location:** `pages/chat/index.tsx`, `components/chat/travel-chat.tsx`, `pages/api/chat/chat.ts`
- **Step-by-Step Travel Form**: Guided multi-step form for destination, dates, preferences, and budget.
  - **Location:** `pages/travel-form.tsx`
- **Interactive Maps**: Google Maps integration for destination selection and route visualization.
  - **Location:** `components/features/map-component.tsx`
- **Smart Recommendations**: AI-powered place and activity suggestions based on user preferences.
  - **Location:** `ai/tools.ts` (especially `placeCardTool` and `placeCarouselTool`)
- **Multi-language Support**: Available in English, Chinese (Simplified/Traditional), Japanese, Korean, German, French, Italian, Spanish, and Czech.
  - **Location:** `hooks/useLocalizedFont.ts`, `components/ui/language-switcher.tsx`
- **Real-time Weather Data**: Historical weather information for better planning.
  - **Location:** `components/features/weather/weather-historical.tsx`, `components/features/weather/weather-forecast.tsx`, `pages/api/weather/historical.ts`
- **Currency Conversion**: Live currency rate conversions for budget planning.
  - **Location:** `components/features/currency/currency-converter.tsx`, `pages/api/currency/rates.ts`
- **Premium Features**: Advanced itinerary planning and unlimited place suggestions (via Stripe payments).
  - **Location:** `pages/api/stripe/`, `components/modals/premium-upgrade-modal.tsx`
- **Itinerary Export and Display**: View and export your personalized trip itinerary.
  - **Location:** `components/planner/itinerary-export.tsx`
- **Legal & Privacy Compliance**: Cookie, privacy, and terms pages for user transparency.
  - **Location:** `pages/privacy.tsx`, `pages/cookies.tsx`, `pages/terms.tsx`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- NPM or Yarn
- Google Maps API key(s) (see below)
- Stripe account (for payment processing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/travelrizz.git
   cd travelrizz
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.local` and fill in the required keys:
     - `GOOGLE_MAPS_FRONTEND_API_KEY` (for frontend map usage)
     - `GOOGLE_MAPS_BACKEND_API_KEY` (for backend geocoding)
     - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` (for payments)
     - Other API keys as needed

### Running Locally

```bash
npm run dev
# or
yarn dev
```

Visit http://localhost:3000 to use the app.

## 🗂️ Project Structure

The Travel-Rizz project is structured to ensure modularity, scalability, and maintainability. Key directories and files are organized as follows:

- `pages/` — Next.js pages, including:
  - `index.tsx` — Landing page
  - `chat/` — AI chat interface for trip planning
  - `travel-form.tsx` — Multi-step trip planning form
  - `articles/` — Guides: service, visa, trip preparation
  - `payment-success.tsx` — Payment confirmation
  - `privacy.tsx`, `cookies.tsx`, `terms.tsx` — Legal pages
- `components/` — Reusable UI and layout components
- `managers/` — Session, storage, and saved places managers
- `public/` — Static assets and localization files
- `pages/api/` — Backend API routes (e.g., Google Maps, Stripe)

### Core Files and Their Importance

The following files and directories are vital to the Travel-Rizz project's functionality:

- **`pages/api/`**: This directory contains all backend API routes, which are crucial for handling server-side logic, external API integrations (Google Maps, Stripe, Weather, Currency), and session management. Without these, the application would lack its core data processing and external service capabilities.
  - `pages/api/chat/chat.ts`: Main endpoint for AI chat interactions.
  - `pages/api/stripe/webhook.ts`: Handles Stripe payment webhooks, essential for premium feature activation.
- **`managers/`**: This directory houses the logic for session management, local storage, and saved places. These managers are critical for maintaining user state, preferences, and data persistence across sessions.
  - `managers/session-manager.ts`: Core session management logic.
- **`components/`**: Contains the reusable UI components that form the building blocks of the application's user interface. These are essential for a consistent and efficient frontend.
- **`pages/travel-form.tsx`**: This file defines the multi-step travel form, which is a primary entry point for users to initiate their trip planning process. Its functionality is central to the user's initial interaction with the application.
- **`pages/chat/index.tsx`**: This file implements the AI chat interface, which is the core interactive component for AI-powered trip planning and recommendations.
- **`ai/tools.ts`**: This file defines the tools that the AI can use to interact with the application and external APIs.
- **`.env.local`**: This file (not committed to Git) is crucial for securely storing all API keys and sensitive environment variables. The application cannot function correctly without proper configuration of these keys.
- **`tailwind.config.js`**: Defines the Tailwind CSS configuration, which dictates the application's styling and theming. It's vital for maintaining a consistent and responsive UI.
- **`next.config.js`**: The Next.js configuration file, which controls various aspects of the application's build and runtime behavior, including internationalization, image optimization, and custom webpack configurations.
- **`package.json`**: Lists all project dependencies and scripts. It's fundamental for setting up the development environment and deploying the application.

## ⚙️ Configuration & Environment

- **Localization**: Uses `next-intl` for multi-language support.
- **Theming**: Supports light/dark mode with `next-themes`.
- **Google Maps**: API keys are loaded securely from environment variables; frontend and backend keys are separated for security.
- **Stripe**: Integrated for premium features and payment processing.
- **Cookie Consent**: Third-party cookies are used for Stripe; users are notified via a consent banner.

## 🛡️ Security & Privacy

- API keys are never exposed in the codebase—use environment variables.
- Legal pages for privacy, cookies, and terms are provided for compliance.

## 💡 Usage

1. Start on the landing page and choose to chat or use the trip planning form.
2. Provide trip details via chat or the multi-step form.
3. Receive AI-generated itineraries, maps, and recommendations.
4. Upgrade for premium features via Stripe if desired.

## 📝 License

This project is licensed under the MIT License. See [LICENSE](../LICENSE) for details.

---

For detailed documentation, see the `/docs` folder or contact the maintainers.
