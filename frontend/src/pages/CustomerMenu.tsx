import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Dish } from '../store/useStore';
import { UtensilsCrossed, Box, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load AR viewer to keep initial bundle small
const ARViewer = lazy(() => import('../components/ARViewer'));

export default function CustomerMenu() {
  const { restaurantId } = useParams();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [restaurantName, setRestaurantName] = useState('...');
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Famous Picks');
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [arDish, setArDish] = useState<Dish | null>(null);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      if (!restaurantId) return;
      
      try {
        // Fetch restaurant profile
        const { data: profile } = await supabase
          .from('restaurants')
          .select('restaurant_name')
          .eq('id', restaurantId)
          .single();
          
        if (profile) {
          setRestaurantName(profile.restaurant_name);
        }

        // Fetch subscription
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan_type, status, current_period_end')
          .eq('restaurant_id', restaurantId)
          .single();
          
        if (sub) {
          setIsEnterprise(sub.plan_type === 'enterprise');
          
          const periodEnd = new Date(sub.current_period_end);
          const gracePeriodEnd = new Date(periodEnd.getTime() + (2 * 24 * 60 * 60 * 1000));
          
          // Secure server time check to prevent client clock manipulation
          const { data: serverTime } = await supabase.rpc('get_server_time');
          const now = serverTime ? new Date(serverTime) : new Date();
          
          // If status is not active and grace period has passed
          const hasExpired = sub.status === 'expired' || (sub.status !== 'active' && sub.status !== 'trialing' && now > gracePeriodEnd);
          setIsExpired(hasExpired);
        }

        // Fetch dishes
        const { data: menuDishes } = await supabase
          .from('dishes')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });

        if (menuDishes) {
          setDishes(menuDishes.map(d => ({
            id: d.id,
            restaurant_id: d.restaurant_id,
            name: d.name,
            price: d.price,
            description: d.description,
            category: d.category,
            imageUrl: d.image_url,
            arModelUrl: d.ar_model_url,
            is_bestseller: d.is_bestseller
          })));
        }
      } catch (error) {
        console.error('Failed to load menu', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadMenu();
  }, [restaurantId]);

  const categories = ['Famous Picks', 'All', 'Starters', 'Mains', 'Desserts', 'Drinks'];

  const handleARClick = (dish: Dish) => {
    // Check for WebXR compatibility
    if ('xr' in navigator) {
      setArDish(dish);
    } else {
      alert("Your device or browser does not support Augmented Reality (WebXR). Please try using a compatible browser like Chrome on Android.");
    }
  };

  const filteredDishes = dishes.filter(dish => {
    if (activeCategory === 'Famous Picks') return dish.is_bestseller;
    if (activeCategory === 'All') return true;
    return dish.category === activeCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <UtensilsCrossed className="text-red-500 h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Menu Currently Unavailable</h1>
        <p className="text-gray-400 max-w-xs">
          The menu for <strong>{restaurantName}</strong> is temporarily unavailable. Please contact the restaurant staff for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-4">
      <div className="flex flex-col items-center justify-center mb-8 text-center">
        <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
          <UtensilsCrossed className="text-black h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">{restaurantName}</h1>
        <p className="text-primary mt-1 text-sm font-medium">Smart Digital Menu</p>
      </div>

      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border mb-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
                activeCategory === category 
                  ? 'bg-primary text-black' 
                  : 'bg-surface border border-border text-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {filteredDishes.length > 0 ? (
            filteredDishes.map((dish, idx) => (
              <motion.div
                key={dish.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-surface/50 backdrop-blur-md rounded-2xl border border-border/50 overflow-hidden"
              >
                <div 
                  className="h-48 relative overflow-hidden cursor-pointer"
                  onClick={() => setSelectedDish(selectedDish === dish.id ? null : dish.id)}
                >
                  <img 
                    src={dish.imageUrl} 
                    alt={dish.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  
                  {/* AR Badge */}
                {isEnterprise && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-1.5 shadow-lg">
                    <Box className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">AR Ready</span>
                  </div>
                )}

                  <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                    <h3 className="text-xl font-bold text-white text-shadow">{dish.name}</h3>
                    <span className="px-3 py-1 bg-primary text-black font-bold rounded-lg shadow-lg">
                      ₹{dish.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedDish === dish.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/50"
                    >
                      <div className="p-4">
                        <p className="text-sm text-gray-300 leading-relaxed mb-4">
                          {dish.description}
                        </p>
                        
                        {isEnterprise ? (
                          <button 
                            onClick={() => handleARClick(dish)}
                            className="w-full bg-surface border border-primary/30 hover:bg-primary/10 text-primary py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <Box className="w-5 h-5" />
                            View in AR
                          </button>
                        ) : (
                          <div className="w-full bg-surface/30 border border-white/5 text-gray-500 py-3 rounded-xl font-medium flex items-center justify-center gap-2 cursor-not-allowed">
                            <Box className="w-5 h-5 opacity-50" />
                            Upgrade for AR Experience
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20">
              <UtensilsCrossed className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No dishes found in this category.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {arDish && arDish.imageUrl && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        }>
          <ARViewer 
            imageUrl={arDish.imageUrl} 
            onClose={() => setArDish(null)} 
          />
        </Suspense>
      )}
    </div>
  );
}
