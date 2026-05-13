import express from 'express';
import { razorpay } from '../lib/razorpay';
import { supabase } from '../lib/supabase';
import crypto from 'crypto';

const router = express.Router();

// Plan IDs - These should be created in Razorpay dashboard or via script
const PLANS = {
  professional: 'plan_professional_id', // Replace with actual plan ID after setup
  enterprise: 'plan_enterprise_id',     // Replace with actual plan ID after setup
};

// Create a subscription
router.post('/create-subscription', async (req, res) => {
  try {
    const { planType, restaurantId, email } = req.body;
    
    if (!planType || !restaurantId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const planId = planType === 'enterprise' ? process.env.RAZORPAY_PLAN_ENTERPRISE : process.env.RAZORPAY_PLAN_PROFESSIONAL;

    if (!planId) {
      return res.status(500).json({ error: 'Razorpay Plan IDs not configured' });
    }

    // Create subscription in Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 12, // For 1 year, monthly
      quantity: 1,
      customer_notify: 1,
      // 7-day free trial logic
      start_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), 
      addons: [],
      notes: {
        restaurantId,
      },
    });

    // Store subscription in Supabase with 'trialing' status
    const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const periodEndDate = new Date(trialEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { error: dbError } = await supabase
      .from('subscriptions')
      .upsert({
        restaurant_id: restaurantId,
        plan_type: planType,
        status: 'trialing',
        razorpay_subscription_id: subscription.id,
        trial_start: new Date().toISOString(),
        trial_end: trialEndDate.toISOString(),
        current_period_end: periodEndDate.toISOString(),
      }, { onConflict: 'restaurant_id' });

    if (dbError) throw dbError;

    res.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment signature
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      restaurantId,
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_payment_id + '|' + razorpay_subscription_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment is verified
      
      // Update subscription status and renewal date in Supabase
      const newRenewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'active', 
          current_period_end: newRenewalDate.toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('razorpay_subscription_id', razorpay_subscription_id);

      if (subError) throw subError;

      // Log payment
      const { error: payError } = await supabase
        .from('payments')
        .insert({
          restaurant_id: restaurantId,
          razorpay_payment_id,
          razorpay_subscription_id,
          amount: 0, // Amount is handled by subscription, 0 for initial verification
          status: 'verified',
        });

      if (payError) throw payError;

      res.json({ status: 'success' });
    } else {
      res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook for recurring payments and status updates
router.post('/webhook', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const signature = req.headers['x-razorpay-signature'] as string;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    const payload = req.body.payload;

    // Handle different events
    // subscription.activated, subscription.charged, subscription.halted, etc.
    console.log('Razorpay Webhook Event:', event);
    
    // Logic to update Supabase based on webhook events would go here
    
    res.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

export default router;
