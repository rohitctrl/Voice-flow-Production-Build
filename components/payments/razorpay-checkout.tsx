"use client"
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { CreditCard, CheckCircle, XCircle } from 'lucide-react'

// Extend window object to include Razorpay
declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayCheckoutProps {
  planId: string
  planName: string
  amount: number
  billingCycle: 'monthly' | 'yearly'
  onSuccess?: (paymentData: any) => void
  onError?: (error: any) => void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export default function RazorpayCheckout({
  planId,
  planName,
  amount,
  billingCycle,
  onSuccess,
  onError,
  disabled = false,
  className = '',
  children,
}: RazorpayCheckoutProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpayScript = () => {
      return new Promise<boolean>((resolve) => {
        if (window.Razorpay) {
          setRazorpayLoaded(true)
          resolve(true)
          return
        }

        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
          setRazorpayLoaded(true)
          resolve(true)
        }
        script.onerror = () => {
          console.error('Failed to load Razorpay script')
          resolve(false)
        }
        document.body.appendChild(script)
      })
    }

    loadRazorpayScript()
  }, [])

  const handlePayment = async () => {
    if (!session?.user || !razorpayLoaded) {
      console.error('User not authenticated or Razorpay not loaded')
      return
    }

    setLoading(true)

    try {
      // Create order on the server
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order')
      }

      const orderData = await orderResponse.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Voiceflow',
        description: orderData.description,
        image: '/logo.png', // Add your logo
        order_id: orderData.orderId,
        prefill: {
          name: session.user.name,
          email: session.user.email,
        },
        theme: {
          color: '#8b5cf6', // Purple color matching your theme
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
        handler: async (response: any) => {
          try {
            // Verify payment on the server
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed')
            }

            const verifyData = await verifyResponse.json()
            
            if (onSuccess) {
              onSuccess({
                ...verifyData,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
              })
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            if (onError) {
              onError(error)
            }
          } finally {
            setLoading(false)
          }
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      setLoading(false)
      if (onError) {
        onError(error)
      }
    }
  }

  if (children) {
    return (
      <div onClick={handlePayment} className={className}>
        {children}
      </div>
    )
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading || !razorpayLoaded}
      className={`flex items-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          Subscribe to {planName}
        </>
      )}
    </Button>
  )
}

// Success/Error message components
export function PaymentSuccess({ 
  message = "Payment successful! Your subscription is now active.",
  onClose 
}: { 
  message?: string
  onClose?: () => void 
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
      <CheckCircle className="h-5 w-5 flex-shrink-0" />
      <div className="flex-grow">
        <p className="font-medium">{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="text-green-400 hover:text-green-300 transition-colors"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export function PaymentError({ 
  message = "Payment failed. Please try again or contact support.",
  onClose 
}: { 
  message?: string
  onClose?: () => void 
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
      <XCircle className="h-5 w-5 flex-shrink-0" />
      <div className="flex-grow">
        <p className="font-medium">{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}