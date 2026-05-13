import { CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function PaymentSuccess() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-surface border border-border p-10 rounded-3xl text-center"
      >
        <div className="w-20 h-20 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-400 mb-8">
          Thank you for your subscription. Your restaurant profile has been upgraded instantly.
        </p>
        <Button onClick={() => navigate('/dashboard')} className="w-full">
          Go to Dashboard
        </Button>
      </motion.div>
    </div>
  );
}

export function PaymentFailed() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-surface border border-border p-10 rounded-3xl text-center"
      >
        <div className="w-20 h-20 bg-red-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
        <p className="text-gray-400 mb-8">
          Something went wrong with your transaction. Please check your payment details and try again.
        </p>
        <div className="space-y-3">
          <Button onClick={() => navigate('/dashboard/pricing')} className="w-full">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
