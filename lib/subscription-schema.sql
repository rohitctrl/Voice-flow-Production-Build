-- Razorpay Subscription Management Schema
-- Add this to your Supabase database

-- 1. Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2),
    features JSONB NOT NULL DEFAULT '[]',
    limits JSONB NOT NULL DEFAULT '{}',
    razorpay_plan_id VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    razorpay_subscription_id VARCHAR(100) UNIQUE,
    razorpay_customer_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'authenticated', 'active', 'paused', 'halted', 'cancelled', 'expired')),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Payment History Table
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_order_id VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'refunded', 'failed')),
    method VARCHAR(50),
    description TEXT,
    receipt TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Usage Tracking Table
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    resource_type VARCHAR(50) NOT NULL, -- 'transcription', 'storage', 'api_calls'
    usage_count INTEGER NOT NULL DEFAULT 0,
    usage_limit INTEGER,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Webhook Events Table (for debugging and audit)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(100) UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    account_id VARCHAR(100),
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, limits) VALUES 
(
    'Free',
    'Basic transcription with limited features',
    0.00,
    0.00,
    '["Basic transcription", "Up to 5 hours/month", "English only"]',
    '{"transcription_hours": 5, "file_size_mb": 25, "projects": 3}'
),
(
    'Pro',
    'Unlimited transcription with advanced features',
    2900.00,  -- ₹29.00 in paise for Razorpay
    29000.00, -- ₹290.00 yearly (10 months price)
    '["Unlimited transcription", "Multi-language support", "Speaker identification", "Export options", "Priority support"]',
    '{"transcription_hours": -1, "file_size_mb": 500, "projects": -1}'
),
(
    'Enterprise',
    'Advanced features with API access',
    9900.00,  -- ₹99.00 in paise
    99000.00, -- ₹990.00 yearly
    '["Everything in Pro", "API access", "Custom integrations", "Advanced analytics", "Dedicated support"]',
    '{"transcription_hours": -1, "file_size_mb": 1000, "projects": -1, "api_calls": 10000}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);

-- Row Level Security (RLS) policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Subscription plans are public readable
CREATE POLICY "Subscription plans are publicly readable" ON subscription_plans
    FOR SELECT USING (is_active = true);

-- Users can only see their own subscription data
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payment history" ON payment_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all data (for webhook handling)
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage payments" ON payment_history
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage usage" ON usage_tracking
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage webhooks" ON webhook_events
    FOR ALL USING (auth.role() = 'service_role');

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payment_history_updated_at BEFORE UPDATE ON payment_history FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();