import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  verifyRazorpaySignature,
  getPaymentDetails,
  handleRazorpayError,
} from '@/lib/razorpay'
import {
  updatePaymentRecord,
  getSubscriptionPlan,
  createUserSubscription,
  getUserSubscription,
  syncProfileSubscriptionTier,
} from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification data' },
        { status: 400 }
      )
    }

    // Verify payment signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    try {
      // Get payment details from Razorpay
      const paymentDetails = await getPaymentDetails(razorpay_payment_id)

      // Update payment record in database
      const paymentRecord = await updatePaymentRecord(razorpay_payment_id, {
        razorpay_payment_id,
        status: paymentDetails.captured ? 'captured' : 'authorized',
        method: paymentDetails.method,
        metadata: {
          ...paymentDetails,
        },
      })

      if (!paymentRecord) {
        return NextResponse.json(
          { error: 'Payment record not found' },
          { status: 404 }
        )
      }

      // Extract plan information from payment metadata
      const planId = paymentRecord.metadata?.planId
      const billingCycle = paymentRecord.metadata?.billingCycle || 'monthly'

      if (!planId) {
        return NextResponse.json(
          { error: 'Plan information not found in payment record' },
          { status: 400 }
        )
      }

      // Get plan details
      const plan = await getSubscriptionPlan(planId)
      if (!plan) {
        return NextResponse.json(
          { error: 'Subscription plan not found' },
          { status: 404 }
        )
      }

      // Check if user already has an active subscription
      let subscription = await getUserSubscription(session.user.id)

      if (!subscription) {
        // Create new subscription
        const now = new Date()
        const nextPeriod = new Date(now)
        
        if (billingCycle === 'yearly') {
          nextPeriod.setFullYear(now.getFullYear() + 1)
        } else {
          nextPeriod.setMonth(now.getMonth() + 1)
        }

        subscription = await createUserSubscription({
          user_id: session.user.id,
          plan_id: planId,
          status: 'active',
          billing_cycle: billingCycle as 'monthly' | 'yearly',
          current_period_start: now.toISOString(),
          current_period_end: nextPeriod.toISOString(),
          metadata: {
            razorpay_payment_id,
            razorpay_order_id,
          },
        })
      }

      // Sync profile subscription tier
      await syncProfileSubscriptionTier(session.user.id)

      return NextResponse.json({
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        subscription: {
          id: subscription?.id,
          planName: plan.name,
          status: subscription?.status,
          billingCycle,
        },
      })

    } catch (error) {
      console.error('Error processing payment verification:', error)
      
      // Update payment record as failed
      await updatePaymentRecord(razorpay_payment_id, {
        status: 'failed',
        metadata: {
          error: handleRazorpayError(error),
        },
      })

      return NextResponse.json(
        { error: handleRazorpayError(error) },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}