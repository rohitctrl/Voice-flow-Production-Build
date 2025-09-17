import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  createRazorpayOrder,
  generateReceipt,
  handleRazorpayError,
  convertToPaise,
} from '@/lib/razorpay'
import {
  getSubscriptionPlan,
  createPaymentRecord,
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

    // Get subscription plan details
    const plan = await getSubscriptionPlan(planId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      )
    }

    // Don't create order for free plan
    if (plan.name.toLowerCase() === 'free') {
      return NextResponse.json(
        { error: 'Free plan does not require payment' },
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

    // Determine amount based on billing cycle
    const amountInINR = billingCycle === 'yearly' 
      ? plan.price_yearly || plan.price_monthly * 10 // 10 months price for yearly
      : plan.price_monthly

    const amountInPaise = convertToPaise(amountInINR)
    const receipt = generateReceipt('VF')

    const notes = {
      planId,
      billingCycle,
      userId: session.user.id,
      userEmail: profile.email,
      planName: plan.name,
    }

    try {
      // Create Razorpay order
      const order = await createRazorpayOrder(
        amountInPaise,
        'INR',
        receipt,
        notes
      )

      // Create payment record in database
      const paymentRecord = {
        user_id: session.user.id,
        razorpay_order_id: order.id,
        amount: amountInINR,
        currency: 'INR',
        status: 'created' as const,
        description: `${plan.name} Plan - ${billingCycle} billing`,
        receipt,
        metadata: {
          planId,
          billingCycle,
          planName: plan.name,
        },
      }

      await createPaymentRecord(paymentRecord)

      // Return order details for Razorpay checkout
      return NextResponse.json({
        orderId: order.id,
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes,
        planName: plan.name,
        billingCycle,
        description: `${plan.name} Plan - ${billingCycle} billing`,
      })

    } catch (error) {
      console.error('Error creating Razorpay order:', error)
      return NextResponse.json(
        { error: handleRazorpayError(error) },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error processing payment order request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}