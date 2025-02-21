# Travel-Rizz

Travel-Rizz is an AI-powered travel planning assistant that helps users create personalized trip itineraries. Combining conversational AI with practical travel tools, it offers a seamless experience from initial planning to final itinerary creation.

## 🌟 Features

- **Interactive Travel Planning**: Multi-step guided process for trip planning
- **AI Chat Interface**: Natural conversation-based trip planning
- **Visual Route Planning**: Interactive maps with optimized route suggestions
- **Smart Recommendations**: AI-powered place suggestions based on preferences
- **Multi-language Support**: Available in English, Chinese (Simplified/Traditional), Japanese, Korean, German, French, Italian, Spanish, and Czech
- **Real-time Weather Data**: Historical weather information for better planning
- **Currency Conversion**: Live currency rate conversions for budget planning
- **Premium Features**: Advanced itinerary planning and unlimited place suggestions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- NPM or Yarn
- Google Maps API key
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
```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `NEXT_PUBLIC_APP_URL`: Your application URL
- `FREECURRENCY_API_KEY`: FreeCurrency API key
- `NEXT_PUBLIC_VISUALCROSSING_API_KEY`: Visual Crossing API key for weather data

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## 💡 Usage

1. **Initial Planning**
   - Enter your destination
   - Select travel dates (up to 5 days)
   - Choose travel preferences
   - Set your budget level

2. **Explore with AI**
   - Chat with the AI to discover places
   - Get local insights and recommendations
   - View places on the interactive map

3. **Premium Features**
   - Unlimited place suggestions
   - Advanced itinerary planning
   - Route optimization
   - Detailed local insights

4. **Finalize Your Trip**
   - Review and organize your saved places
   - Get optimized daily routes
   - Export your final itinerary

## 🛠 Tech Stack

- **Framework**: Next.js with Page Router
- **Styling**: Tailwind CSS, ShadCN UI
- **Maps**: Google Maps Platform
- **State Management**: React Hooks
- **Internationalization**: next-intl
- **Payment Processing**: Stripe
- **Type Safety**: TypeScript
- **APIs**:
  - Google Places API
  - Visual Crossing Weather API
  - FreeCurrency API

## 📱 Responsive Design

- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface
- Optimized map interactions for mobile

## 🔐 Security

- Session-based authentication
- Secure payment processing
- API key protection
- Rate limiting on critical endpoints

## 🌐 Localization

Supported languages:
- English
- Chinese (Simplified & Traditional)
- Japanese
- Korean
- German
- French
- Italian
- Spanish
- Czech

## 🚧 Development Status

Currently in active development. Features are being added and refined based on user feedback.

## 📄 License

Copyright © 2025 Travel-Rizz. All rights reserved.