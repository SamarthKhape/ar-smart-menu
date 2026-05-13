import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const { user } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const [restaurantName, setRestaurantName] = useState(user?.restaurantName || '');
  const [ownerName, setOwnerName] = useState(user?.name || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          restaurant_name: restaurantName,
          owner_name: ownerName
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Settings saved successfully!');
      // Refresh user data would be good here, or just keep state
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your restaurant profile and application preferences.</p>
      </div>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8">
            <h2 className="text-xl font-bold text-white mb-6">Restaurant Profile</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Restaurant Name"
                  value={restaurantName}
                  placeholder="Restaurant Name (letters only)"
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setRestaurantName(val);
                  }}
                />
                <Input
                  label="Owner Name"
                  value={ownerName}
                  placeholder="Owner Name (letters only)"
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setOwnerName(val);
                  }}
                />
                <Input
                  label="Email Address (Locked)"
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="opacity-50 cursor-not-allowed"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  icon={<span className="text-sm font-bold text-gray-500 ml-1">+91</span>}
                  placeholder="Enter valid 10-digit mobile number"
                  defaultValue={user?.email?.includes('@') ? '' : user?.email?.replace('+91', '')}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    e.target.value = val;
                  }}
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button type="submit" isLoading={isLoading}>Save Changes</Button>
              </div>
            </form>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-8">
            <h2 className="text-xl font-bold text-white mb-6">Theme Preferences</h2>
            <div className="flex gap-4">
              <button className="flex-1 p-4 rounded-xl border-2 border-primary bg-background flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary" />
                <span className="text-white font-medium">Gold / Dark</span>
              </button>
              <button className="flex-1 p-4 rounded-xl border-2 border-border bg-background flex flex-col items-center justify-center gap-3 opacity-50 cursor-not-allowed">
                <div className="w-8 h-8 rounded-full bg-blue-500" />
                <span className="text-white font-medium">Coming Soon</span>
              </button>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-8 border-red-500/20">
            <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
            <p className="text-gray-400 text-sm mb-6">Permanently delete your account and all data.</p>
            <Button variant="danger">Delete Account</Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
