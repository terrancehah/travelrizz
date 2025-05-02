# Travel-Rizz

Travel-Rizz is an AI-powered travel planning assistant that helps users create personalized trip itineraries. Combining conversational AI with practical travel tools, it offers a seamless experience from initial planning to final itinerary creation.

## 🌟 Features

- **AI Chat-based Trip Planning**: Plan your trip interactively with a conversational AI assistant.
- **Step-by-Step Travel Form**: Guided multi-step form for destination, dates, preferences, and budget.
- **Interactive Maps**: Google Maps integration for destination selection and route visualization.
- **Smart Recommendations**: AI-powered place and activity suggestions based on user preferences.
- **Multi-language Support**: Available in English, Chinese (Simplified/Traditional), Japanese, Korean, German, French, Italian, Spanish, and Czech.
- **Real-time Weather Data**: Historical weather information for better planning.
- **Currency Conversion**: Live currency rate conversions for budget planning.
- **Premium Features**: Advanced itinerary planning and unlimited place suggestions (via Stripe payments).
- **Legal & Privacy Compliance**: Cookie, privacy, and terms pages for user transparency.

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
- `api/` — Backend API routes (e.g., Google Maps, Stripe)

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
