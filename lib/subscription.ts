import { supabaseAdmin } from './supabase-admin'
import type { Database } from './supabase'

type Tables = Database['public']['Tables']
type SubscriptionPlan = Tables['subscription_plans']['Row']
type UserSubscription = Tables['user_subscriptions']['Row']
type PaymentHistory = Tables['payment_history']['Row']
type UsageTracking = Tables['usage_tracking']['Row']

// Subscription Plans
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabaseAdmin
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price_monthly', { ascending: true })

  if (error) {
    console.error('Error fetching subscription plans:', error)
    return []
  }

  return data || []
}

export async function getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabaseAdmin
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching subscription plan:', error)
    return null
  }

  return data
}

export async function getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabaseAdmin
    .from('subscription_plans')
    .select('*')
    .eq('name', name)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching subscription plan by name:', error)
    return null
  }

  return data
}

// User Subscriptions
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .select(`
      *,
      subscription_plans(*)
    `)
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching user subscription:', error)
    return null
  }

  return data
}

export async function createUserSubscription(
  subscription: Tables['user_subscriptions']['Insert']
): Promise<UserSubscription | null> {
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .insert(subscription)
    .select()
    .single()

  if (error) {
    console.error('Error creating user subscription:', error)
    return null
  }

  return data
}

export async function updateUserSubscription(
  subscriptionId: string,
  updates: Tables['user_subscriptions']['Update']
): Promise<UserSubscription | null> {
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user subscription:', error)
    return null
  }

  return data
}

export async function updateUserSubscriptionByRazorpayId(
  razorpaySubscriptionId: string,
  updates: Tables['user_subscriptions']['Update']
): Promise<UserSubscription | null> {
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .update(updates)
    .eq('razorpay_subscription_id', razorpaySubscriptionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user subscription by Razorpay ID:', error)
    return null
  }

  return data
}

// Payment History
export async function createPaymentRecord(
  payment: Tables['payment_history']['Insert']
): Promise<PaymentHistory | null> {
  const { data, error } = await supabaseAdmin
    .from('payment_history')
    .insert(payment)
    .select()
    .single()

  if (error) {
    console.error('Error creating payment record:', error)
    return null
  }

  return data
}

export async function updatePaymentRecord(
  paymentId: string,
  updates: Tables['payment_history']['Update']
): Promise<PaymentHistory | null> {
  const { data, error } = await supabaseAdmin
    .from('payment_history')
    .update(updates)
    .eq('razorpay_payment_id', paymentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating payment record:', error)
    return null
  }

  return data
}

export async function getUserPaymentHistory(
  userId: string,
  limit: number = 10
): Promise<PaymentHistory[]> {
  const { data, error } = await supabaseAdmin
    .from('payment_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching payment history:', error)
    return []
  }

  return data || []
}

// Usage Tracking
export async function getCurrentUsage(
  userId: string,
  resourceType: string
): Promise<UsageTracking | null> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const { data, error } = await supabaseAdmin
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('resource_type', resourceType)
    .gte('period_start', startOfMonth.toISOString())
    .lte('period_end', endOfMonth.toISOString())
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error fetching current usage:', error)
  }

  return data || null
}

export async function incrementUsage(
  userId: string,
  resourceType: string,
  incrementBy: number = 1
): Promise<UsageTracking | null> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // Get current usage
  let currentUsage = await getCurrentUsage(userId, resourceType)

  if (!currentUsage) {
    // Create new usage record
    const { data, error } = await supabaseAdmin
      .from('usage_tracking')
      .insert({
        user_id: userId,
        resource_type: resourceType,
        usage_count: incrementBy,
        period_start: startOfMonth.toISOString(),
        period_end: endOfMonth.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating usage record:', error)
      return null
    }

    return data
  } else {
    // Update existing usage record
    const { data, error } = await supabaseAdmin
      .from('usage_tracking')
      .update({
        usage_count: currentUsage.usage_count + incrementBy,
      })
      .eq('id', currentUsage.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating usage record:', error)
      return null
    }

    return data
  }
}

export async function checkUsageLimit(
  userId: string,
  resourceType: string
): Promise<{ canUse: boolean; currentUsage: number; limit: number | null }> {
  // Get user's subscription
  const subscription = await getUserSubscription(userId)
  if (!subscription) {
    return { canUse: false, currentUsage: 0, limit: 0 }
  }

  // Get subscription plan limits
  const planData = subscription as any // Type assertion for joined data
  const limits = planData.subscription_plans?.limits || {}
  const limit = limits[resourceType]

  // If limit is -1, it means unlimited
  if (limit === -1) {
    return { canUse: true, currentUsage: 0, limit: -1 }
  }

  // Get current usage
  const currentUsage = await getCurrentUsage(userId, resourceType)
  const usageCount = currentUsage?.usage_count || 0

  return {
    canUse: limit === null || usageCount < limit,
    currentUsage: usageCount,
    limit,
  }
}

// Subscription utilities
export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return subscription?.status === 'active' || subscription?.status === 'authenticated'
}

export async function getSubscriptionTier(userId: string): Promise<string> {
  const subscription = await getUserSubscription(userId)
  if (!subscription) return 'free'

  const planData = subscription as any
  return planData.subscription_plans?.name?.toLowerCase() || 'free'
}

export async function canAccessFeature(
  userId: string,
  featureName: string
): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  if (!subscription) return false

  const planData = subscription as any
  const features = planData.subscription_plans?.features || []
  
  return features.some((feature: string) =>
    feature.toLowerCase().includes(featureName.toLowerCase())
  )
}

// Webhook event logging
export async function logWebhookEvent(
  eventId: string,
  eventType: string,
  accountId: string,
  payload: any
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('webhook_events')
    .insert({
      event_id: eventId,
      event_type: eventType,
      account_id: accountId,
      payload,
      processed: false,
    })

  if (error) {
    console.error('Error logging webhook event:', error)
  }
}

export async function markWebhookEventProcessed(
  eventId: string,
  success: boolean = true,
  errorMessage?: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('webhook_events')
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
      error_message: errorMessage,
    })
    .eq('event_id', eventId)

  if (error) {
    console.error('Error marking webhook event as processed:', error)
  }
}

// Subscription statistics
export async function getSubscriptionStats() {
  // Get total active subscriptions by plan
  const { data: subscriptionStats, error: statsError } = await supabaseAdmin
    .from('user_subscriptions')
    .select(`
      status,
      billing_cycle,
      subscription_plans(name)
    `)
    .in('status', ['active', 'authenticated'])

  if (statsError) {
    console.error('Error fetching subscription stats:', statsError)
    return null
  }

  // Get revenue data
  const { data: revenueData, error: revenueError } = await supabaseAdmin
    .from('payment_history')
    .select('amount, created_at')
    .eq('status', 'captured')

  if (revenueError) {
    console.error('Error fetching revenue data:', revenueError)
  }

  return {
    subscriptions: subscriptionStats,
    revenue: revenueData,
  }
}

// Clean up expired subscriptions
export async function cleanupExpiredSubscriptions(): Promise<void> {
  const now = new Date().toISOString()

  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({ status: 'expired' })
    .lt('current_period_end', now)
    .in('status', ['active', 'past_due'])

  if (error) {
    console.error('Error cleaning up expired subscriptions:', error)
  }
}

// Update profile subscription tier based on active subscription
export async function syncProfileSubscriptionTier(userId: string): Promise<void> {
  const subscription = await getUserSubscription(userId)
  let tier: 'free' | 'pro' | 'enterprise' = 'free'

  if (subscription && ['active', 'authenticated'].includes(subscription.status)) {
    const planData = subscription as any
    const planName = planData.subscription_plans?.name?.toLowerCase()
    
    if (planName === 'pro') tier = 'pro'
    else if (planName === 'enterprise') tier = 'enterprise'
  }

  // Update profile
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ subscription_tier: tier })
    .eq('id', userId)

  if (error) {
    console.error('Error syncing profile subscription tier:', error)
  }
}