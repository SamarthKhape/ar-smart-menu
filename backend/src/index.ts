import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import billingRoutes from './routes/billing';
import authRoutes from './routes/auth';
import { supabase } from './lib/supabase';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Register billing and auth routes
app.use('/api/billing', billingRoutes);
app.use('/api/auth', authRoutes);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'AR Smart Menu API is running' });
});

// Example route fetching dishes for a specific restaurant via backend
app.get('/api/restaurants/:id/dishes', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('restaurant_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
