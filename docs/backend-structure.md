# Backend Structure

## Introduction

The Travel-Rizz backend is structured around Next.js API routes and Edge Functions, focusing on serverless architecture and efficient API integrations. This document outlines the backend organization and implementation details.

## API Routes Structure

### Directory Organization

-   **`pages/api/`**: This directory contains all backend API routes.
    -   `chat/`: Handles all chat-related logic.
        -   `chat.ts`: Main endpoint for AI chat interactions.
        -   `quick-response.ts`: Generates quick response options for the user.
    -   `currency/`: Handles currency conversion.
        -   `rates.ts`: Fetches currency conversion rates.
    -   `maps/`: Handles Google Maps API requests.
        -   `geocode.ts`: Geocodes a location string to latitude and longitude.
    -   `stripe/`: Handles Stripe payment integration.
        -   `verify.ts`: Verifies a Stripe payment by polling for a successful payment.
        -   `webhook.ts`: Handles Stripe webhooks to confirm payment success.
    -   `weather/`: Handles weather data requests.
        -   `historical.ts`: Fetches historical weather data.

### Route Handling Pattern

```typescript
// Example API route structure
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Method validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Request validation
  try {
    // validation logic
  } catch (error) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // 3. Business logic
  try {
    // main logic
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }

  // 4. Response
  return res.status(200).json({ data });
}
```

## Session Management

-   **Location:** `managers/session-manager.ts`

### Session Structure

```typescript
interface TravelSession {
  // Session info
  sessionId: string;
  startTime: number;
  lastActive: number;
  expiresAt: number;

  // Travel details
  destination: string;
  startDate: string;
  endDate: string;
  preferences: string[];
  budget: string;
  language: string;
  transport: string[];
  
  // Places
  savedPlaces: Place[];
  currentStage: number;

  // Metrics
  totalPrompts: number;
  stagePrompts: Record<number, number>;
  
  // Payment
  isPaid: boolean;
  paymentReference: string;
}
```

### Session Operations

```typescript
// Create session
export function initializeSession(): TravelSession {
  const sessionId = generateSessionId();
  const now = Date.now();
  
  return {
    sessionId,
    startTime: now,
    lastActive: now,
    expiresAt: now + SESSION_CONFIG.ABSOLUTE_TIMEOUT,
    // ... other initial values
  };
}

// Validate session
export function checkSessionValidity(): boolean {
  const session = getStoredSession();
  if (!session) return false;
  
  return (
    session.expiresAt > Date.now() &&
    Date.now() - session.lastActive < SESSION_CONFIG.INACTIVE_TIMEOUT
  );
}
```

## Payment Integration

-   **Location:** `components/modals/premium-upgrade-modal.tsx`, `pages/api/stripe/`

### Stripe Buy Button and Polling

The application uses a client-side Stripe Buy Button for handling payments. The flow is as follows:

1.  A **Stripe Buy Button** is rendered in the `PremiumUpgradeModal`.
2.  The modal generates a unique `client_reference_id` for the transaction.
3.  The frontend polls the `/api/stripe/verify` endpoint to check for payment success.
4.  The `/api/stripe/webhook` endpoint receives a webhook from Stripe upon successful payment and updates the session metadata.
5.  The `/api/stripe/verify` endpoint confirms the payment success by checking the session metadata.

### Stripe Setup

```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia'
});

// Webhook handling
export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['stripe-signature'];
  const rawBody = await buffer(req);
  
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Handle event
  } catch (error) {
    return res.status(400).json({ error: 'Webhook error' });
  }
}
```

## External API Integration

-   **Location:** `ai/tools.ts`

### API Client Pattern

```typescript
// Example API client
class ExternalAPIClient {
  private readonly apiKey: string;
  private readonly baseURL: string;
  
  constructor(apiKey: string, baseURL: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }
  
  async fetchData(endpoint: string, params: Record<string, any>) {
    try {
      const response = await fetch(
        `${this.baseURL}${endpoint}?${new URLSearchParams(params)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API client error:', error);
      throw error;
    }
  }
}
```

## Error Handling

### Error Types

```typescript
enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  INTERNAL = 'INTERNAL_ERROR'
}

interface APIError {
  type: ErrorType;
  message: string;
  code: number;
  details?: any;
}
```

### Error Response Pattern

```typescript
function handleError(error: unknown): APIError {
  if (error instanceof ValidationError) {
    return {
      type: ErrorType.VALIDATION,
      message: error.message,
      code: 400,
      details: error.details
    };
  }
  
  // Default error
  return {
    type: ErrorType.INTERNAL,
    message: 'An unexpected error occurred',
    code: 500
  };
}
```

## Rate Limiting

-   **Location:** `pages/api/stripe/webhook.ts` (for Stripe webhooks)

Rate limiting for the main chat API (`pages/api/chat/chat.ts`) is not explicitly implemented in the codebase. It is assumed to be handled at the infrastructure level (e.g., Vercel platform or Google Cloud Console).

### Implementation

```typescript
const RATE_LIMIT = 100; // requests
const TIME_WINDOW = 60 * 1000; // 1 minute
const requests = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - TIME_WINDOW;
  
  const timestamps = requests.get(ip) || [];
  const windowTimestamps = timestamps.filter(time => time > windowStart);
  
  requests.set(ip, [...windowTimestamps, now]);
  
  return windowTimestamps.length > RATE_LIMIT;
}
```

## Caching Strategy

### Implementation

```typescript
interface CacheEntry {
  data: any;
  timestamp: number;
}

class Cache {
  private store = new Map<string, CacheEntry>();
  private readonly ttl: number;
  
  constructor(ttl = 60 * 60 * 1000) { // 1 hour default
    this.ttl = ttl;
  }
  
  set(key: string, data: any) {
    this.store.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(key: string): any {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key);
      return null;
    }
    
    return entry.data;
  }
}
```
