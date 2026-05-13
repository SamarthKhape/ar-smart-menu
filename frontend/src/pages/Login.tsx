import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { Mail, Lock, UtensilsCrossed, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validatePhone = (num: string) => {
    const reg = /^\+91[6-9]\d{9}$/;
    return reg.test(num);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!validatePhone(phone)) {
      alert('Please enter a valid 10-digit Indian phone number starting with +91');
      return;
    }

    setIsLoading(true);
    // MOCKED FOR DEVELOPMENT: Skipping actual SMS send
    console.log('Development Mode: OTP Send skipped. Navigating to verify screen...');
    setTimeout(() => {
      setShowOtp(true);
      setIsLoading(false);
    }, 500);

    /* ACTUAL CODE KEPT IN COMMENTS:
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setShowOtp(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
    */
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // MOCKED FOR DEVELOPMENT: Always success
    console.log('Development Mode: OTP Verification successful');
    setTimeout(() => {
      navigate('/dashboard');
      setIsLoading(false);
    }, 500);

    /* ACTUAL CODE KEPT IN COMMENTS:
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
    */
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email address first.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Step 1: Check if the email exists in our restaurants table
      const { data: userExists, error: checkError } = await supabase
        .from('restaurants')
        .select('email')
        .eq('email', email)
        .single();

      if (checkError || !userExists) {
        alert('This email is not registered with us. Please check the spelling or sign up.');
        setIsLoading(false);
        return;
      }

      // Step 2: If user exists, send reset link
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      alert('Password reset link has been sent to your email!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface p-8 rounded-2xl border border-border shadow-2xl relative overflow-hidden group"
      >
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/15 transition-colors duration-500" />

        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-xl group-hover:scale-110 transition-transform duration-500">
              <UtensilsCrossed className="h-10 w-10 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-center mb-8">Sign in to manage your smart menu</p>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <Input
              icon={<Mail className="h-5 w-5" />}
              type="email"
              placeholder="name@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              icon={<Lock className="h-5 w-5" />}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            />
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input type="checkbox" className="rounded border-border bg-surface text-primary focus:ring-primary/50" />
                Remember me
              </label>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-primary hover:text-primary-hover transition-colors font-medium"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Sign In
            </Button>
          </form>


          <p className="text-center text-gray-400 mt-8 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
