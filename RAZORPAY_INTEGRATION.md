# Razorpay Integration for Voiceflow

This document outlines the complete Razorpay payment integration for the Voiceflow transcription service.

## Overview

The integration supports subscription-based billing with three tiers:
- **Free**: 5 hours/month, 25MB file limit, 3 projects
- **Pro**: Unlimited transcriptions, 500MB file limit, unlimited projects
- **Enterprise**: Everything in Pro + API access, 1000MB file limit

## Setup Instructions

### 1. Razorpay Account Setup

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Complete KYC verification
3. Generate API keys from Settings → API Keys
4. Note down:
   - Key ID (for frontend)
   - Key Secret (for backend)
   - Webhook Secret (for webhook verification)

### 2. Environment Variables

Update your `.env.local` file with:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

### 3. Database Schema

Execute the SQL commands in `lib/subscription-schema.sql` in your Supabase dashboard:

```sql
-- This will create:
-- - subscription_plans table
-- - user_subscriptions table
-- - payment_history table
-- - usage_tracking table
-- - webhook_events table
```

### 4. Webhook Configuration

1. In Razorpay Dashboard, go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events:
   - payment.authorized
   - payment.captured  
   - payment.failed
   - subscription.authenticated
   - subscription.activated
   - subscription.charged
   - subscription.completed
   - subscription.cancelled
   - subscription.paused
   - subscription.resumed
   - subscription.halted

## API Endpoints

### Payment Management

- `GET /api/payments/plans` - Get all subscription plans
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment completion
- `GET|POST /api/payments/create-subscription` - Manage subscriptions
- `POST /api/payments/webhook` - Handle Razorpay webhooks

### Subscription Features

- File size limits based on plan
- Monthly usage tracking for free users
- Automatic tier upgrades after payment
- Usage increment tracking
- Subscription status synchronization

## Frontend Integration

### Components

1. **SubscriptionPlans** (`components/payments/subscription-plans.tsx`)
   - Displays available plans
   - Handles billing cycle toggle
   - Shows current subscription status

2. **RazorpayCheckout** (`components/payments/razorpay-checkout.tsx`)
   - Razorpay payment interface
   - Payment success/error handling
   - Client-side payment verification

### Usage

```tsx
import SubscriptionPlans from '@/components/payments/subscription-plans'

// In your billing page
<SubscriptionPlans />
```

## Backend Integration

### Subscription Utilities

```typescript
import { 
  getSubscriptionTier,
  checkUsageLimit,
  incrementUsage,
  getUserSubscription
} from '@/lib/subscription'

// Check user's tier
const tier = await getSubscriptionTier(userId)

// Check usage limits
const usageCheck = await checkUsageLimit(userId, 'transcription_hours')

// Increment usage
await incrementUsage(userId, 'transcription_hours', 2.5)
```

### Payment Processing

```typescript
import { 
  createRazorpayOrder,
  verifyRazorpaySignature
} from '@/lib/razorpay'

// Create payment order
const order = await createRazorpayOrder(2900, 'INR', 'receipt_123')

// Verify payment
const isValid = verifyRazorpaySignature(orderId, paymentId, signature)
```

## Testing

### Test Mode

Use Razorpay test keys for development:
- Test cards: 4111 1111 1111 1111
- Any future expiry date
- Any CVV

### Webhook Testing

Use ngrok for local webhook testing:
```bash
ngrok http 3000
# Use the ngrok URL for webhook endpoint
```

## Subscription Plans Configuration

Plans are automatically created during schema setup:

```json
{
  "free": {
    "price_monthly": 0,
    "limits": {
      "transcription_hours": 5,
      "file_size_mb": 25,
      "projects": 3
    }
  },
  "pro": {
    "price_monthly": 2900, // ₹29 in paise
    "limits": {
      "transcription_hours": -1, // unlimited
      "file_size_mb": 500,
      "projects": -1 // unlimited
    }
  }
}
```

## Usage Tracking

The system automatically tracks:
- Monthly transcription hours for free users
- File upload attempts and sizes
- Payment history and status
- Subscription lifecycle events

## Error Handling

The integration includes comprehensive error handling:
- Invalid payment signatures
- Exceeded usage limits
- File size violations
- Network failures
- Webhook processing errors

## Security Features

- Payment signature verification
- Webhook signature validation
- Row Level Security (RLS) policies
- User data isolation
- Secure API key management

## Monitoring

Track key metrics:
- Active subscriptions by plan
- Monthly recurring revenue (MRR)
- Usage patterns and limits
- Payment success rates
- Webhook event processing

## Support

For integration issues:
1. Check Razorpay dashboard logs
2. Monitor webhook event processing
3. Review payment status in database
4. Verify subscription state synchronization

## Production Checklist

- [ ] KYC completed with Razorpay
- [ ] Production API keys configured
- [ ] Webhook URL updated
- [ ] SSL certificate valid
- [ ] Database backups enabled
- [ ] Error monitoring configured
- [ ] Payment reconciliation process
- [ ] Customer support workflows

## Compliance

The integration follows:
- RBI guidelines for payment processing
- PCI DSS compliance through Razorpay
- GDPR data protection standards
- Indian data localization requirements