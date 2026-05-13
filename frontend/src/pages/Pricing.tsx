import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Check, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { loadRazorpayScript } from '../lib/razorpay';

export default function Pricing() {
  const { user, createSubscription, verifyPayment } = useStore();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubscribe = async (planType: 'professional' | 'enterprise') => {
    setLoadingPlan(planType);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Check your internet connection.');
        return;
      }

      const subscriptionId = await createSubscription(planType);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: 'AR Smart Menu',
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription`,
        image: 'https://hwwmoqtczyqxtfbfpvsi.supabase.co/storage/v1/object/public/dish-images/logo.png', // Replace with actual logo
        handler: async (response: any) => {
          const result = await verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (result) {
            navigate('/dashboard/billing?success=true');
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#F59E0B', // Gold/Amber
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      type: 'professional',
      name: 'Professional',
      price: '2,999',
      description: 'Ideal for growing restaurants looking for a digital edge.',
      icon: Zap,
      features: [
        'Unlimited dishes',
        'QR generation',
        'Dashboard access',
        'Branding',
        'Mobile menu',
        'Basic analytics'
      ]
    },
    {
      type: 'enterprise',
      name: 'Enterprise AR',
      price: '4,999',
      description: 'The ultimate AR experience for modern dining.',
      icon: Star,
      popular: true,
      features: [
        'Everything from Professional',
        'AR dish viewing',
        'Table QR system',
        'Advanced analytics',
        'Premium customization',
        'Priority support'
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-10 px-4">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
        >
          Simple, Transparent <span className="text-primary">Pricing</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-lg max-w-2xl mx-auto"
        >
          Choose the plan that fits your restaurant. All plans include a 7-day free trial.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 + 0.2 }}
          >
            <Card className={`relative p-8 h-full flex flex-col border-2 ${plan.popular ? 'border-primary/50 bg-primary/5 shadow-2xl shadow-primary/10' : 'border-border'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-gray-400'}`}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handleSubscribe(plan.type as any)}
                className="w-full py-6 text-lg"
                variant={plan.popular ? 'primary' : 'outline'}
                isLoading={loadingPlan === plan.type}
              >
                Start 7-day Free Trial
              </Button>
              
              <p className="text-center text-xs text-gray-500 mt-4">
                No credit card required upfront. Cancel anytime.
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 text-center bg-surface/30 border border-border p-8 rounded-3xl backdrop-blur-md">
        <h2 className="text-2xl font-bold text-white mb-2">Need a custom enterprise solution?</h2>
        <p className="text-gray-400 mb-6">Contact our sales team for custom volume pricing and on-site implementation.</p>
        <Button variant="outline">Contact Sales</Button>
      </div>
    </div>
  );
}
