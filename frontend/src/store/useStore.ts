import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Dish {
  id: string;
  restaurant_id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string;
  arModelUrl?: string;
}

export interface User {
  id: string;
  name: string;
  restaurantName: string;
  email: string;
}

interface AppState {
  user: User | null;
  dishes: Dish[];
  isAuthenticated: boolean;
  isLoading: boolean;
  
  initialize: () => Promise<void>;
  login: (user: User) => void;
  logout: () => Promise<void>;
  
  // Billing state
  subscription: any | null;
  checkSubscription: () => Promise<void>;
  createSubscription: (planType: 'professional' | 'enterprise') => Promise<string>;
  verifyPayment: (data: any) => Promise<boolean>;
  
  fetchDishes: () => Promise<void>;
  addDish: (dish: Omit<Dish, 'id' | 'restaurant_id'>) => Promise<void>;
  deleteDish: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  dishes: [],
  isLoading: true,
  subscription: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch restaurant profile
        const { data: profile } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: profile.owner_name,
              restaurantName: profile.restaurant_name
            },
            isAuthenticated: true,
          });
          
          await get().fetchDishes();
          await get().checkSubscription();
        }
      }
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      set({ isLoading: false });
    }

    // Set up auth state listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: profile.owner_name,
              restaurantName: profile.restaurant_name
            },
            isAuthenticated: true,
          });
          get().fetchDishes();
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, isAuthenticated: false, dishes: [] });
      }
    });
  },

  login: (user) => set({ user, isAuthenticated: true }),
  
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, dishes: [], subscription: null });
  },
  
  checkSubscription: async () => {
    const user = get().user;
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('restaurant_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      set({ subscription: data });
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  },
  
  createSubscription: async (planType) => {
    const user = get().user;
    if (!user) throw new Error('Not authenticated');
    
    try {
      const response = await fetch('http://localhost:5000/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          restaurantId: user.id,
          email: user.email
        }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.subscriptionId;
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },
  
  verifyPayment: async (paymentData) => {
    const user = get().user;
    if (!user) return false;
    
    try {
      const response = await fetch('http://localhost:5000/api/billing/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentData,
          restaurantId: user.id
        }),
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        await get().checkSubscription();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  },

  fetchDishes: async () => {
    const user = get().user;
    if (!user) return;
    
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('restaurant_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching dishes:', error);
      return;
    }
    
    // Map database fields to interface
    const formattedDishes: Dish[] = data.map(d => ({
      id: d.id,
      restaurant_id: d.restaurant_id,
      name: d.name,
      price: d.price,
      description: d.description,
      category: d.category,
      imageUrl: d.image_url,
      arModelUrl: d.ar_model_url
    }));
    
    set({ dishes: formattedDishes });
  },

  addDish: async (dishData) => {
    const user = get().user;
    if (!user) return;

    // We'll optimistically update the UI after a successful DB insert
    const { data, error } = await supabase
      .from('dishes')
      .insert({
        restaurant_id: user.id,
        name: dishData.name,
        price: dishData.price,
        description: dishData.description,
        category: dishData.category,
        image_url: dishData.imageUrl
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding dish:', error);
      throw error;
    }

    if (data) {
      const newDish: Dish = {
        id: data.id,
        restaurant_id: data.restaurant_id,
        name: data.name,
        price: data.price,
        description: data.description,
        category: data.category,
        imageUrl: data.image_url,
        arModelUrl: data.ar_model_url
      };
      
      set((state) => ({ 
        dishes: [newDish, ...state.dishes] 
      }));
    }
  },

  deleteDish: async (id) => {
    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dish:', error);
      return;
    }

    set((state) => ({
      dishes: state.dishes.filter(d => d.id !== id)
    }));
  }
}));
