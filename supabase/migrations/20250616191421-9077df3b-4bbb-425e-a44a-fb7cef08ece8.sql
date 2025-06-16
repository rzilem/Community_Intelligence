
-- Enable Row Level Security on the vendors table
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow users to see vendors from their associated HOAs/associations
CREATE POLICY "Users can view vendors from their associations" 
ON public.vendors 
FOR SELECT 
USING (
  hoa_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
);

-- Create RLS policy to allow users to insert vendors for their associated HOAs
CREATE POLICY "Users can create vendors for their associations" 
ON public.vendors 
FOR INSERT 
WITH CHECK (
  hoa_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
);

-- Create RLS policy to allow users to update vendors from their associated HOAs
CREATE POLICY "Users can update vendors from their associations" 
ON public.vendors 
FOR UPDATE 
USING (
  hoa_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
);

-- Create RLS policy to allow users to delete vendors from their associated HOAs
CREATE POLICY "Users can delete vendors from their associations" 
ON public.vendors 
FOR DELETE 
USING (
  hoa_id IN (
    SELECT association_id 
    FROM public.association_users 
    WHERE user_id = auth.uid()
  )
);
