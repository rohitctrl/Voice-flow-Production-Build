"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Users, ArrowRight } from 'lucide-react';

export const PricingSection = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "month",
      description: "Perfect for trying out Voiceflow",
      features: [
        "30 minutes/month transcription",
        "Basic transcription accuracy", 
        "Cloud storage included",
        "Standard processing speed",
        "Email support",
        "Web app access"
      ],
      limitations: [
        "Limited monthly usage",
        "Standard accuracy",
        "Basic support only"
      ],
      buttonText: "Start Free",
      buttonVariant: "secondary",
      icon: Zap,
      popular: false,
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "Pro", 
      price: "$9",
      period: "month",
      description: "For professionals and content creators",
      features: [
        "Unlimited recording time",
        "Advanced AI features",
        "99%+ transcription accuracy",
        "Custom themes & formatting",
        "Mobile app access",
        "Priority support",
        "Export to multiple formats",
        "Speaker identification",
        "Real-time collaboration"
      ],
      limitations: [],
      buttonText: "Start Free Trial",
      buttonVariant: "primary",
      icon: Star,
      popular: true,
      color: "from-gray-600/30 via-gray-700/30 to-purple-500/30",
      badge: "Most Popular"
    },
    {
      name: "Business",
      price: "$29", 
      period: "month",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Team collaboration tools",
        "Advanced analytics & insights",
        "Enterprise security (SSO)",
        "User management dashboard",
        "API access for integrations",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "Advanced workflow automation"
      ],
      limitations: [],
      buttonText: "Contact Sales",
      buttonVariant: "secondary",
      icon: Users,
      popular: false,
      color: "from-purple-500 to-white/20"
    }
  ];

  const faqs = [
    {
      question: "Can I switch plans anytime?",
      answer: "Yes! You can upgrade, downgrade, or cancel your subscription at any time from your dashboard."
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer: "We'll notify you when approaching limits. You can upgrade or purchase additional minutes as needed."
    },
    {
      question: "Is there a discount for annual billing?",
      answer: "Yes! Save 20% when you choose annual billing on Pro and Business plans."
    }
  ];

  return (
    <section id="pricing-section" className="py-20 px-6 relative overflow-hidden">

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 data-testid="pricing-heading" className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free and scale as you grow. All plans include our core transcription features with increasing limits and advanced capabilities.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`relative group ${plan.popular ? 'lg:scale-105' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-gray-700/30 backdrop-blur-md border border-white/30 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border ${
                plan.popular ? 'border-white/50 shadow-lg shadow-white/20' : 'border-gray-700/50'
              } hover:border-gray-600/50 transition-all duration-300 h-full group-hover:transform group-hover:scale-105`}>
                
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-3">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-white/80 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  plan.buttonVariant === 'primary'
                    ? 'bg-gradient-to-r from-white/20 to-white/20 hover:from-white/30 hover:to-white/30 text-white shadow-lg'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600'
                }`}>
                  {plan.buttonText}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/30 rounded-full px-6 py-3">
            <Crown className="h-5 w-5 text-white/80" />
            <span className="text-white font-medium">30-day money-back guarantee</span>
          </div>
        </motion.div>

        {/* Mini FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="text-center">
                <h4 className="text-white font-semibold mb-3">{faq.question}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">
            Need a custom solution for your organization?
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-white/20 hover:from-purple-600 hover:to-white/30 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
            Contact Enterprise Sales
          </button>
        </motion.div>
      </div>
    </section>
  );
};