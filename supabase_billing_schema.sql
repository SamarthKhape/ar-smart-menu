-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('professional', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'expired', 'cancelled', 'created')),
    razorpay_subscription_id TEXT UNIQUE,
    razorpay_customer_id TEXT,
    trial_start TIMESTAMPTZ DEFAULT NOW(),
    trial_end TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_subscription_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL,
    method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (restaurant_id = auth.uid());

-- Policies for payments
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
TO authenticated
USING (restaurant_id = auth.uid());

-- Grant access
GRANT ALL ON public.subscriptions TO authenticated;
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
GRANT ALL ON public.payments TO service_role;
