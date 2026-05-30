-- Enable RLS for core tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- RESTAURANTS POLICIES
-- ----------------------------------------------------
-- Allow anyone to view restaurants (needed for public customer menu)
CREATE POLICY "Public can view restaurants"
ON public.restaurants FOR SELECT
USING (true);

-- Allow authenticated users to update their own restaurant profile
CREATE POLICY "Users can update their own restaurant profile"
ON public.restaurants FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- ----------------------------------------------------
-- DISHES POLICIES
-- ----------------------------------------------------
-- Allow anyone to view dishes (needed for public customer menu)
CREATE POLICY "Public can view dishes"
ON public.dishes FOR SELECT
USING (true);

-- Allow users to insert their own dishes
CREATE POLICY "Users can insert their own dishes"
ON public.dishes FOR INSERT
TO authenticated
WITH CHECK (restaurant_id = auth.uid());

-- Allow users to update their own dishes
CREATE POLICY "Users can update their own dishes"
ON public.dishes FOR UPDATE
TO authenticated
USING (restaurant_id = auth.uid());

-- Allow users to delete their own dishes
CREATE POLICY "Users can delete their own dishes"
ON public.dishes FOR DELETE
TO authenticated
USING (restaurant_id = auth.uid());

-- ----------------------------------------------------
-- SECURE SERVER TIME RPC
-- ----------------------------------------------------
-- Create a secure RPC function to get server time
CREATE OR REPLACE FUNCTION get_server_time()
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant execution to public and authenticated users
GRANT EXECUTE ON FUNCTION get_server_time() TO anon, authenticated;
