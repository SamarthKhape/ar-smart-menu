import { razorpay } from '../lib/razorpay';
import dotenv from 'dotenv';

dotenv.config();

async function setupPlans() {
  console.log('🚀 Starting Razorpay Plan Setup...');

  try {
    // 1. Professional Plan (₹2999/month)
    const profPlan = await razorpay.plans.create({
      period: 'monthly',
      interval: 1,
      item: {
        name: 'Professional Plan',
        amount: 299900, // in paise
        currency: 'INR',
        description: 'Unlimited dishes, QR generation, Dashboard access, Branding, Mobile menu',
      },
    });
    console.log('✅ Professional Plan Created:', profPlan.id);

    // 2. Enterprise AR Plan (₹4999/month)
    const entPlan = await razorpay.plans.create({
      period: 'monthly',
      interval: 1,
      item: {
        name: 'Enterprise AR Plan',
        amount: 499900, // in paise
        currency: 'INR',
        description: 'Everything from Professional + AR dish viewing, Table QR system, Advanced analytics',
      },
    });
    console.log('✅ Enterprise AR Plan Created:', entPlan.id);

    console.log('\n====================================================');
    console.log('Add these to your backend .env file:');
    console.log(`RAZORPAY_PLAN_PROFESSIONAL=${profPlan.id}`);
    console.log(`RAZORPAY_PLAN_ENTERPRISE=${entPlan.id}`);
    console.log('====================================================\n');

  } catch (error) {
    console.error('❌ Error creating plans:', error);
  }
}

setupPlans();
