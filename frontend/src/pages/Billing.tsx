import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function Billing() {
  const { user, subscription } = useStore();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function loadPayments() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('restaurant_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPayments(data || []);
      } catch (error) {
        console.error('Error loading payments:', error);
      }
    }
    loadPayments();
  }, [user]);

  const handleDownloadInvoice = (payment: any) => {
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) return;

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - AR Smart Menu</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #333; padding: 40px; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f4f4f4; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #F59E0B; }
            .invoice-details { text-align: right; }
            .section { margin-bottom: 30px; }
            .section-title { font-weight: bold; text-transform: uppercase; font-size: 12px; color: #666; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background: #f9f9f9; padding: 12px; border-bottom: 1px solid #eee; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 30px; }
            .footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">AR SMART MENU</div>
            <div class="invoice-details">
              <div>Invoice #: ${payment.razorpay_payment_id.slice(-8).toUpperCase()}</div>
              <div>Date: ${format(new Date(payment.created_at), 'MMMM d, yyyy')}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Billed To</div>
            <div><strong>${user?.restaurantName}</strong></div>
            <div>${user?.email}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Period</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${subscription?.plan_type === 'enterprise' ? 'Enterprise AR' : 'Professional'} Plan Subscription</td>
                <td>Monthly</td>
                <td>₹${(payment.amount / 100).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total Paid: ₹${(payment.amount / 100).toFixed(2)}
          </div>

          <div class="footer">
            Thank you for using AR Smart Menu!<br>
            If you have any questions, contact us at support@arsmartmenu.com
          </div>

          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `;

    invoiceWindow.document.write(invoiceHtml);
    invoiceWindow.document.close();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'trialing': return 'text-primary bg-primary/10 border-primary/20';
      case 'expired': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Billing & Subscription</h1>
        <p className="text-gray-400 mt-2">Manage your plan, invoices, and payment methods.</p>
      </div>

      <div className="space-y-8">
        {/* Subscription Status Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-surface rounded-xl border border-border">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {subscription?.plan_type === 'enterprise' ? 'Enterprise AR Plan' : subscription?.plan_type === 'professional' ? 'Professional Plan' : 'No Active Plan'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(subscription?.status || 'none')}`}>
                      {subscription?.status || 'Inactive'}
                    </span>
                    {subscription?.status === 'trialing' && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Trial ends {subscription?.trial_end ? format(new Date(subscription.trial_end), 'MMM d, yyyy') : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button size="sm" onClick={() => window.location.href='/dashboard/pricing'}>
                  {subscription ? 'Upgrade Plan' : 'Select a Plan'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Renewal Date</p>
                  <p className="text-sm text-gray-200">
                    {subscription?.current_period_end ? format(new Date(subscription.current_period_end), 'MMMM d, yyyy') : 'No upcoming renewal'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Next Invoice Amount</p>
                  <p className="text-sm text-gray-200">
                    {subscription?.plan_type === 'enterprise' ? '₹4,999' : subscription?.plan_type === 'professional' ? '₹2,999' : '₹0'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Payment History */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-white">Payment History</h2>
          </div>
          <Card className="p-0 overflow-hidden border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface/50 border-b border-border">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {format(new Date(payment.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-medium capitalize">
                          {subscription?.plan_type || 'Plan'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          ₹{payment.amount / 100}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 rounded bg-green-400/10 text-green-400 text-xs font-medium">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <button 
                            onClick={() => handleDownloadInvoice(payment)}
                            className="text-primary hover:text-primary-hover flex items-center gap-1 ml-auto"
                          >
                            <span className="text-xs">Download</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="w-8 h-8 text-gray-600" />
                          <p className="text-gray-400 italic">No payment history found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
