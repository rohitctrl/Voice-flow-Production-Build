import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import {
  verifyWebhookSignature,
  type WebhookEvent,
} from '@/lib/razorpay'
import {
  updateUserSubscriptionByRazorpayId,
  updatePaymentRecord,
  logWebhookEvent,
  markWebhookEventProcessed,
  syncProfileSubscriptionTier,
} from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('x-razorpay-signature')

    if (!signature) {
      console.error('Missing Razorpay signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event: WebhookEvent = JSON.parse(body)
    
    // Log webhook event
    await logWebhookEvent(
      `webhook_${Date.now()}`, // Generate a unique event ID
      event.event,
      event.account_id,
      event
    )

    console.log(`Processing webhook event: ${event.event}`)

    try {
      // Process different webhook events
      switch (event.event) {
        case 'payment.authorized':
          await handlePaymentAuthorized(event)
          break

        case 'payment.captured':
          await handlePaymentCaptured(event)
          break

        case 'payment.failed':
          await handlePaymentFailed(event)
          break

        case 'subscription.authenticated':
          await handleSubscriptionAuthenticated(event)
          break

        case 'subscription.activated':
          await handleSubscriptionActivated(event)
          break

        case 'subscription.charged':
          await handleSubscriptionCharged(event)
          break

        case 'subscription.completed':
          await handleSubscriptionCompleted(event)
          break

        case 'subscription.cancelled':
          await handleSubscriptionCancelled(event)
          break

        case 'subscription.paused':
          await handleSubscriptionPaused(event)
          break

        case 'subscription.resumed':
          await handleSubscriptionResumed(event)
          break

        case 'subscription.halted':
          await handleSubscriptionHalted(event)
          break

        default:
          console.log(`Unhandled webhook event: ${event.event}`)
      }

      // Mark event as processed successfully
      await markWebhookEventProcessed(`webhook_${Date.now()}`)

      return NextResponse.json({ success: true })

    } catch (processingError) {
      console.error('Error processing webhook event:', processingError)
      
      // Mark event as processed with error
      await markWebhookEventProcessed(
        `webhook_${Date.now()}`,
        false,
        processingError instanceof Error ? processingError.message : 'Unknown error'
      )

      return NextResponse.json(
        { error: 'Error processing webhook' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentAuthorized(event: WebhookEvent) {
  const payment = event.payload.payment?.entity
  if (!payment) return

  console.log(`Payment authorized: ${payment.id}`)

  await updatePaymentRecord(payment.id, {
    status: 'authorized',
    method: payment.method,
    metadata: payment,
  })
}

async function handlePaymentCaptured(event: WebhookEvent) {
  const payment = event.payload.payment?.entity
  if (!payment) return

  console.log(`Payment captured: ${payment.id}`)

  await updatePaymentRecord(payment.id, {
    status: 'captured',
    method: payment.method,
    metadata: payment,
  })

  // If this is a subscription payment, activate the subscription
  if (payment.notes?.subscriptionId) {
    await updateUserSubscriptionByRazorpayId(payment.notes.subscriptionId, {
      status: 'active',
    })

    // Sync profile subscription tier
    if (payment.notes?.userId) {
      await syncProfileSubscriptionTier(payment.notes.userId)
    }
  }
}

async function handlePaymentFailed(event: WebhookEvent) {
  const payment = event.payload.payment?.entity
  if (!payment) return

  console.log(`Payment failed: ${payment.id}`)

  await updatePaymentRecord(payment.id, {
    status: 'failed',
    metadata: payment,
  })

  // If this is a subscription payment, handle subscription failure
  if (payment.notes?.subscriptionId) {
    await updateUserSubscriptionByRazorpayId(payment.notes.subscriptionId, {
      status: 'halted',
    })
  }
}

async function handleSubscriptionAuthenticated(event: WebhookEvent) {
  const subscription = event.payload.subscription?.entity
  if (!subscription) return

  console.log(`Subscription authenticated: ${subscription.id}`)

  await updateUserSubscriptionByRazorpayId(subscription.id, {
    status: 'authenticated',
    current_period_start: subscription.current_start 
      ? new Date(subscription.current_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_end 
      ? new Date(subscription.current_end * 1000).toISOString()
      : null,
  })
}

async function handleSubscriptionActivated(event: WebhookEvent) {
  const subscription = event.payload.subscription?.entity
  if (!subscription) return

  console.log(`Subscription activated: ${subscription.id}`)

  const updates: any = {
    status: 'active',
    current_period_start: subscription.current_start 
      ? new Date(subscription.current_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_end 
      ? new Date(subscription.current_end * 1000).toISOString()
      : null,
  }

  await updateUserSubscriptionByRazorpayId(subscription.id, updates)

  // Sync profile subscription tier
  if (subscription.notes?.userId) {
    await syncProfileSubscriptionTier(subscription.notes.userId)
  }
}

async function handleSubscriptionCharged(event: WebhookEvent) {
  const subscription = event.payload.subscription?.entity
  if (!subscription) return

  console.log(`Subscription charged: ${subscription.id}`)

  // Update subscription period
  await updateUserSubscriptionByRazorpayId(subscription.id, {
    current_period_start: subscription.current_start 
      ? new Date(subscription.current_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_end 
      ? new Date(subscription.current_end * 1000).toISOString()
      : null,
  })
}

async function handleSubscriptionCompleted(event: WebhookEvent) {
  const subscription = event.payload.subscription?.entity
  if (!subscription) return

  console.log(`Subscription completed: ${subscription.id}`)

  await updateUserSubscriptionByRazorpayId(subscription.id, {
    status: 'expired',
    ended_at: subscription.ended_at 
      ? new Date(subscription.ended_at * 1000).toISOString()
      : new Date().toISOString(),
  })

  // Sync profile to free tier
  if (subscription.notes?.userId) {
    await syncProfileSubscriptionTier(subscription.notes.userId)
  }
}

async function handleSubscriptionCancelled(event: WebhookEvent) {
  const subscription = event.payload.subscription?.entity
  if (!subscription) return

  console.log(`Subscription cancelled: ${subscription.id}`)

  await updateUserSubscriptionByRazorpayId(subscription.id, {
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
    ended_at: subscription.ended_at 
      ? new Date(subscription.ended_at * 1000).toISOString()
      : null,
  })

  // Sync profile to free tier if subscription ended
  if (subscription.ended_at && subscription.notes?.userId) {
    await syncProfileSubscriptionTier(subscription.notes.userId)
  }
}

async function handleSubscriptionPaused(event: WebhookEvent) {
  const subscription = event.payload.subscription?.entity
  if (!subscription) return

  console.log(`Subscription paused: ${subscription.id}`)

  await updateUserSubscriptionByRazorpayId(subscription.id, {
    status: 'paused',
  })
}

async function handleSubscriptionResumed(event: WebhookEvent) {
  const subscription = event.payload.subscription?.entity
  if (!subscription) return

  console.log(`Subscription resumed: ${subscription.id}`)

  await updateUserSubscriptionByRazorpayId(subscription.id, {
    status: 'active',
    current_period_start: subscription.current_start 
      ? new Date(subscription.current_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_end 
      ? new Date(subscription.current_end * 1000).toISOString()
      : null,
  })

  // Sync profile subscription tier
  if (subscription.notes?.userId) {
    await syncProfileSubscriptionTier(subscription.notes.userId)
  }
}

async function handleSubscriptionHalted(event: WebhookEvent) {
  const subscription = event.payload.subscription?.entity
  if (!subscription) return

  console.log(`Subscription halted: ${subscription.id}`)

  await updateUserSubscriptionByRazorpayId(subscription.id, {
    status: 'halted',
  })

  // Sync profile to free tier
  if (subscription.notes?.userId) {
    await syncProfileSubscriptionTier(subscription.notes.userId)
  }
}