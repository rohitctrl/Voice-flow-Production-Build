"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Crown, Building } from 'lucide-react'
import { cn } from '@/lib/utils'
import RazorpayCheckout, { PaymentSuccess, PaymentError } from './razorpay-checkout'

interface SubscriptionPlan {
  id: string
  name: string
  description: string | null
  price_monthly: number
  price_yearly: number | null
  features: string[]
  limits: Record<string, any>
  is_active: boolean
}

interface UserSubscription {
  id: string
  plan_id: string
  status: string
  billing_cycle: 'monthly' | 'yearly'
  current_period_end: string | null
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlansAndSubscription()
  }, [])

  const fetchPlansAndSubscription = async () => {
    try {
      setLoading(true)
      
      // Fetch plans
      const plansResponse = await fetch('/api/payments/plans')
      if (plansResponse.ok) {
        const plansData = await plansResponse.json()
        setPlans(plansData.plans || [])
      }

      // Fetch current subscription
      const subscriptionResponse = await fetch('/api/payments/create-subscription')
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        setCurrentSubscription(subscriptionData.subscription)
      }
    } catch (error) {
      console.error('Error fetching plans and subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentSuccess(`Payment successful! Your ${paymentData.subscription.planName} subscription is now active.`)
    setPaymentError(null)
    // Refresh subscription data
    fetchPlansAndSubscription()
  }

  const handlePaymentError = (error: any) => {
    setPaymentError(error.message || 'Payment failed. Please try again.')
    setPaymentSuccess(null)
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Zap className="h-6 w-6" />
      case 'pro':
        return <Crown className="h-6 w-6" />
      case 'enterprise':
        return <Building className="h-6 w-6" />
      default:
        return <Zap className="h-6 w-6" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'border-gray-600 bg-gray-800/30'
      case 'pro':
        return 'border-purple-500 bg-purple-500/10'
      case 'enterprise':
        return 'border-yellow-500 bg-yellow-500/10'
      default:
        return 'border-gray-600 bg-gray-800/30'
    }
  }

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId
  }

  const formatPrice = (priceMonthly: number, priceYearly?: number | null) => {
    if (priceMonthly === 0) return 'Free'
    
    const price = billingCycle === 'yearly' && priceYearly 
      ? priceYearly 
      : priceMonthly

    return `₹${price}`
  }

  const formatPeriod = () => {
    return billingCycle === 'yearly' ? '/year' : '/month'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {paymentSuccess && (
        <PaymentSuccess 
          message={paymentSuccess} 
          onClose={() => setPaymentSuccess(null)} 
        />
      )}
      {paymentError && (
        <PaymentError 
          message={paymentError} 
          onClose={() => setPaymentError(null)} 
        />
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-800/50 p-1 rounded-xl border border-gray-700">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              billingCycle === 'monthly'
                ? "bg-purple-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
              billingCycle === 'yearly'
                ? "bg-purple-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            )}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg",
              getPlanColor(plan.name),
              isCurrentPlan(plan.id) && "ring-2 ring-purple-500"
            )}
          >
            {/* Popular Badge */}
            {plan.name.toLowerCase() === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 right-4">
                <span className="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                  Current
                </span>
              </div>
            )}

            <div className="text-center">
              {/* Plan Icon */}
              <div className="flex justify-center mb-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  plan.name.toLowerCase() === 'pro' 
                    ? "bg-purple-500/20 text-purple-400"
                    : plan.name.toLowerCase() === 'enterprise'
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-gray-500/20 text-gray-400"
                )}>
                  {getPlanIcon(plan.name)}
                </div>
              </div>

              {/* Plan Name */}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              
              {/* Plan Description */}
              {plan.description && (
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
              )}

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">
                  {formatPrice(plan.price_monthly, plan.price_yearly)}
                </span>
                {plan.price_monthly > 0 && (
                  <span className="text-gray-400 text-sm">
                    {formatPeriod()}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 text-left">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.name.toLowerCase() === 'free' ? (
                <button
                  disabled
                  className="w-full bg-gray-700 text-gray-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : isCurrentPlan(plan.id) ? (
                <button
                  disabled
                  className="w-full bg-green-500/20 text-green-400 font-semibold py-3 px-6 rounded-xl border border-green-500/30 cursor-not-allowed"
                >
                  Active Plan
                </button>
              ) : (
                <RazorpayCheckout
                  planId={plan.id}
                  planName={plan.name}
                  amount={billingCycle === 'yearly' && plan.price_yearly 
                    ? plan.price_yearly 
                    : plan.price_monthly}
                  billingCycle={billingCycle}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  <div className="w-full text-center">
                    Subscribe to {plan.name}
                  </div>
                </RazorpayCheckout>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Current Subscription Info */}
      {currentSubscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Current Subscription</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Status:</span>
              <div className={cn(
                "mt-1 font-medium",
                currentSubscription.status === 'active' 
                  ? "text-green-400" 
                  : "text-yellow-400"
              )}>
                {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Billing:</span>
              <div className="mt-1 font-medium text-white">
                {currentSubscription.billing_cycle.charAt(0).toUpperCase() + currentSubscription.billing_cycle.slice(1)}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Next Billing:</span>
              <div className="mt-1 font-medium text-white">
                {currentSubscription.current_period_end 
                  ? new Date(currentSubscription.current_period_end).toLocaleDateString()
                  : 'N/A'}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}