import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Store, UtensilsCrossed, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '+91',
    password: '',
    confirmPassword: '',
    otp: '',
    showOtp: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginMethod === 'email') {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match");
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase.from('restaurants').insert({
            id: data.user.id,
            restaurant_name: formData.restaurantName,
            owner_name: formData.ownerName,
            email: formData.email,
          });
          if (profileError) throw profileError;
          navigate('/dashboard');
        }
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Phone OTP flow (MOCKED FOR DEVELOPMENT)
      if (!formData.showOtp) {
        setIsLoading(true);
        setTimeout(() => {
          setFormData({ ...formData, showOtp: true });
          setIsLoading(false);
          console.log('Development Mode: OTP sent successfully (Mocked)');
        }, 500);

        /* ACTUAL CODE:
        try {
          const response = await fetch('http://localhost:5000/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: formData.phone }),
          });
          ...
        }
        */
      } else {
        setIsLoading(true);
        setTimeout(() => {
          navigate('/dashboard');
          setIsLoading(false);
          console.log('Development Mode: OTP verified successfully (Mocked)');
        }, 500);

        /* ACTUAL CODE:
        try {
          const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: formData.phone, code: formData.otp }),
          });
          ...
        }
        */
      }
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setFormData({ ...formData, otp: '' });
      setIsLoading(false);
      alert('Development Mode: New OTP "sent" (Mocked)');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

          <h1 className="text-3xl font-bold text-center text-white mb-2">Create Account</h1>
          <p className="text-gray-400 text-center mb-8">Start your smart menu journey</p>

          {/* Toggle Signup Method - HIDDEN FOR NOW */}
          {/* 
          <div className="flex bg-surface-light p-1 rounded-xl mb-8 border border-border">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                loginMethod === 'email' ? 'bg-primary text-background shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                loginMethod === 'phone' ? 'bg-primary text-background shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Phone (OTP)
            </button>
          </div>
          */}

          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              icon={<Store className="h-5 w-5" />}
              type="text"
              placeholder="Restaurant Name (letters only)"
              value={formData.restaurantName}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setFormData({...formData, restaurantName: val});
              }}
              required
            />
            <Input
              icon={<User className="h-5 w-5" />}
              type="text"
              placeholder="Owner Name (letters only)"
              value={formData.ownerName}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setFormData({...formData, ownerName: val});
              }}
              required
            />

            <Input
              icon={<Mail className="h-5 w-5" />}
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input
              icon={<Lock className="h-5 w-5" />}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
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
            <Input
              icon={<Lock className="h-5 w-5" />}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            />

            <Button type="submit" className="w-full mt-6 shadow-lg shadow-primary/20" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          {/* OTP SECTION REMOVED FROM VIEW
          {loginMethod !== 'email' && (
            ...
          )}
          */}

          <p className="text-center text-gray-400 mt-8 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
