import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Utensils, Eye, QrCode, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user, dishes, subscription } = useStore();

  // Mock scan logic: base count + some random growth
  const mockScans = 1200 + (dishes.length * 42);
  const scanTrend = "+14% from last month";

  // Calculate new dishes this week (mocked as 2 if there are dishes, or actual logic if created_at exists)
  const newDishesCount = dishes.length > 0 ? 2 : 0;

  const stats = [
    { 
      label: 'Total Dishes', 
      value: dishes.length.toString(), 
      icon: Utensils, 
      trend: `+${newDishesCount} this week` 
    },
    { 
      label: 'Active Menu Items', 
      value: dishes.length.toString(), 
      icon: Eye, 
      trend: '100% active' 
    },
    { 
      label: 'QR Scans', 
      value: mockScans.toLocaleString(), 
      icon: QrCode, 
      trend: scanTrend 
    },
    { 
      label: 'Subscription', 
      value: subscription?.plan_type === 'enterprise' ? 'Enterprise' : subscription?.plan_type === 'professional' ? 'Pro' : 'Free', 
      icon: TrendingUp, 
      trend: subscription?.status === 'active' || subscription?.status === 'trialing' ? 'Active' : 'Inactive' 
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Welcome back, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 mt-2">Here's what's happening at {user?.restaurantName} today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="flex flex-col relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-surface rounded-xl border border-border">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-gray-400 font-medium">{stat.label}</h3>
              </div>
              <div className="mt-auto">
                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-sm text-primary/80">{stat.trend}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Dishes</h2>
          <a href="/dashboard/dishes" className="text-primary hover:text-primary-hover text-sm font-medium">
            View All
          </a>
        </div>
        
        {dishes.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2 bg-surface/30">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Utensils className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No dishes yet</h3>
            <p className="text-gray-400 mb-6 max-w-md">Your menu is currently empty. Add your first dish to start showcasing your restaurant's offerings to customers.</p>
            <a href="/dashboard/dishes/add" className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-black hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
              Add Your First Dish
            </a>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.slice(0, 3).map((dish, idx) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 + 0.3 }}
              >
                <Card className="p-0 overflow-hidden group cursor-pointer border-border hover:border-primary/50 transition-colors">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={dish.imageUrl} 
                      alt={dish.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded backdrop-blur-md border border-primary/20">
                        {dish.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white">{dish.name}</h3>
                      <span className="text-primary font-medium">₹{dish.price.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{dish.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
