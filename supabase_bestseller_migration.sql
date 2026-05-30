-- Add is_bestseller column to dishes table
ALTER TABLE public.dishes ADD COLUMN is_bestseller BOOLEAN DEFAULT false;
