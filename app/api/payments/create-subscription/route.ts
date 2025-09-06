import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  createRazorpayCustomer,
  createRazorpaySubscription,
  generateReceipt,
  handleRazorpayError,
} from '@/lib/razorpay'
import {
  getSubscriptionPlan,
  createUserSubscription,
  getUserSubscription,
} from '@/lib/subscription'
import { getProfile } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planId, billingCycle = 'monthly' } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Check if user already has an active subscription
    const existingSubscription = await getUserSubscription(session.user.id)
    if (existingSubscription && ['active', 'authenticated'].includes(existingSubscription.status)) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    // Get subscription plan details
    const plan = await getSubscriptionPlan(planId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      )
    }

    // Don't create subscription for free plan
    if (plan.name.toLowerCase() === 'free') {
      return NextResponse.json(
        { error: 'Free plan does not require subscription creation' },
        { status: 400 }
      )
    }

    // Get user profile
    const profile = await getProfile(session.user.id)
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    let customerId = null

    try {
      // Create or get Razorpay customer
      const customer = await createRazorpayCustomer(
        profile.email,
        profile.name || 'Voiceflow User'
      )
      customerId = customer.id
    } catch (error) {
      console.error('Error creating Razorpay customer:', error)
      return NextResponse.json(
        { error: handleRazorpayError(error) },
        { status: 500 }
      )
    }

    // Determine amount based on billing cycle
    const amount = billingCycle === 'yearly' 
      ? plan.price_yearly || plan.price_monthly * 10 // 10 months price for yearly
      : plan.price_monthly

    // For subscriptions, we need to create a plan first in Razorpay
    // For now, we'll create a simple payment order instead of subscription
    // You can create subscription plans in Razorpay dashboard and use them here
    
    const receipt = generateReceipt('SUB')
    
    // Create subscription record in database
    const subscriptionData = {
      user_id: session.user.id,
      plan_id: planId,
      razorpay_customer_id: customerId,
      status: 'created' as const,
      billing_cycle: billingCycle as 'monthly' | 'yearly',
      metadata: {
        receipt,
        amount,
        currency: 'INR',
      },
    }

    const subscription = await createUserSubscription(subscriptionData)
    if (!subscription) {
      return NextResponse.json(
        { error: 'Failed to create subscription record' },
        { status: 500 }
      )
    }

    // Return subscription details for frontend processing
    return NextResponse.json({
      subscriptionId: subscription.id,
      customerId,
      amount,
      currency: 'INR',
      receipt,
      planName: plan.name,
      billingCycle,
      description: `${plan.name} Plan - ${billingCycle} billing`,
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's current subscription
    const subscription = await getUserSubscription(session.user.id)
    
    return NextResponse.json({
      subscription,
    })

  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}