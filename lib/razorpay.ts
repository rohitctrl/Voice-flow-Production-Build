import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  currency: 'INR',
  company: 'Voiceflow',
  description: 'AI-Powered Voice Transcription Service',
  image: '/logo.png', // Add your logo path
  theme: {
    color: '#8b5cf6', // Purple theme matching your app
  },
}

// Subscription plan configurations
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: [
      'Basic transcription',
      'Up to 5 hours/month',
      'English only',
      '3 projects max',
    ],
    limits: {
      transcription_hours: 5,
      file_size_mb: 25,
      projects: 3,
    },
  },
  PRO: {
    name: 'Pro',
    price: 29,
    priceInPaise: 2900, // Razorpay uses paise (1 INR = 100 paise)
    features: [
      'Unlimited transcription',
      'Multi-language support',
      'Speaker identification',
      'Export options',
      'Priority support',
    ],
    limits: {
      transcription_hours: -1, // unlimited
      file_size_mb: 500,
      projects: -1, // unlimited
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 99,
    priceInPaise: 9900,
    features: [
      'Everything in Pro',
      'API access',
      'Custom integrations',
      'Advanced analytics',
      'Dedicated support',
    ],
    limits: {
      transcription_hours: -1, // unlimited
      file_size_mb: 1000,
      projects: -1, // unlimited
      api_calls: 10000,
    },
  },
}

// Create Razorpay customer
export async function createRazorpayCustomer(email: string, name: string, phone?: string) {
  try {
    const customer = await razorpay.customers.create({
      name,
      email,
      contact: phone,
      fail_existing: false, // Don't fail if customer already exists
    })
    return customer
  } catch (error) {
    console.error('Error creating Razorpay customer:', error)
    throw error
  }
}

// Create Razorpay order
export async function createRazorpayOrder(
  amount: number,
  currency: string = 'INR',
  receipt?: string,
  notes?: Record<string, any>
) {
  try {
    const order = await razorpay.orders.create({
      amount, // amount in paise
      currency,
      receipt,
      notes,
    })
    return order
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw error
  }
}

// Create Razorpay subscription
export async function createRazorpaySubscription(
  planId: string,
  customerId: string,
  totalCount?: number,
  addons?: Array<{ item: { name: string; amount: number; currency: string } }>,
  notes?: Record<string, any>
) {
  try {
    // Fetch customer details first
    const customer = await razorpay.customers.fetch(customerId)
    
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1, // 1 = notify customer, 0 = don't notify
      total_count: totalCount ?? 0, // Number of billing cycles, default to 0 for indefinite
      quantity: 1, // Default quantity
      addons,
      notes: {
        ...notes,
        customer_id: customerId, // Store customer ID in notes for reference
      },
      // Add customer details for subscription
      customer: {
        name: customer.name,
        email: customer.email,
        contact: customer.contact,
      },
    } as any) // Type assertion to handle type mismatch
    return subscription
  } catch (error) {
    console.error('Error creating Razorpay subscription:', error)
    throw error
  }
}

// Verify Razorpay payment signature
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret?: string
): boolean {
  try {
    const webhookSecret = secret || process.env.RAZORPAY_KEY_SECRET!
    const body = `${orderId}|${paymentId}`
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body.toString())
      .digest('hex')
    
    return expectedSignature === signature
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error)
    return false
  }
}

// Verify Razorpay webhook signature
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret?: string
): boolean {
  try {
    const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET!
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody, 'utf8')
      .digest('hex')
    
    return expectedSignature === signature
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

// Get subscription details
export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error fetching subscription details:', error)
    throw error
  }
}

// Cancel subscription
export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd: boolean = true
) {
  try {
    const result = await razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd)
    return result
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

// Pause subscription
export async function pauseRazorpaySubscription(subscriptionId: string) {
  try {
    const result = await razorpay.subscriptions.pause(subscriptionId)
    return result
  } catch (error) {
    console.error('Error pausing subscription:', error)
    throw error
  }
}

// Resume subscription
export async function resumeRazorpaySubscription(subscriptionId: string) {
  try {
    const result = await razorpay.subscriptions.resume(subscriptionId)
    return result
  } catch (error) {
    console.error('Error resuming subscription:', error)
    throw error
  }
}

// Fetch payment details
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error('Error fetching payment details:', error)
    throw error
  }
}

// Create refund
export async function createRefund(
  paymentId: string,
  amount?: number,
  speed?: 'normal' | 'optimum',
  notes?: Record<string, any>
) {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount, // amount in paise, if not provided, full refund
      speed,
      notes,
    })
    return refund
  } catch (error) {
    console.error('Error creating refund:', error)
    throw error
  }
}

// Utility function to convert INR to paise
export function convertToPaise(amountInINR: number): number {
  return Math.round(amountInINR * 100)
}

// Utility function to convert paise to INR
export function convertToINR(amountInPaise: number): number {
  return amountInPaise / 100
}

// Format currency for display
export function formatCurrency(amountInPaise: number, currency: string = 'INR'): string {
  const amountInINR = convertToINR(amountInPaise)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amountInINR)
}

// Generate receipt string
export function generateReceipt(prefix: string = 'VF'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}_${timestamp}_${random}`
}

// Error handler for Razorpay API calls
export function handleRazorpayError(error: any): string {
  if (error?.error?.description) {
    return error.error.description
  }
  if (error?.message) {
    return error.message
  }
  return 'An unexpected error occurred with payment processing'
}

// Types for better TypeScript support
export interface RazorpayCustomer {
  id: string
  entity: string
  name: string
  email: string
  contact?: string
  gstin?: string
  created_at: number
}

export interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: string
  attempts: number
  notes: Record<string, any>
  created_at: number
}

export interface RazorpayPayment {
  id: string
  entity: string
  amount: number
  currency: string
  status: string
  order_id?: string
  method: string
  amount_refunded: number
  captured: boolean
  description?: string
  email?: string
  contact?: string
  notes: Record<string, any>
  created_at: number
}

export interface RazorpaySubscription {
  id: string
  entity: string
  plan_id: string
  customer_id: string
  status: string
  current_start?: number
  current_end?: number
  ended_at?: number
  quantity: number
  notes: Record<string, any>
  charge_at?: number
  start_at?: number
  end_at?: number
  auth_attempts: number
  total_count: number
  paid_count: number
  customer_notify: boolean
  created_at: number
  expire_by?: number
  short_url?: string
}

export interface WebhookEvent {
  entity: string
  account_id: string
  event: string
  contains: string[]
  payload: {
    payment?: { entity: RazorpayPayment }
    order?: { entity: RazorpayOrder }
    subscription?: { entity: RazorpaySubscription }
  }
  created_at: number
}