-- 1. ADD 'approved' COLUMN TO SERVICES
-- This enables the Admin Moderation flow found in the Admin Dashboard
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false;

-- 2. CREATE 'destinations' TABLE
-- Serves as the central entity for grouping Posts and Services by location
CREATE TABLE public.destinations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,  -- for cleaner URLs: /explore/tulum
  name text NOT NULL,
  description text,
  cover_image_url text, -- Hero image for the Destination page
  location_coords USER-DEFINED, -- Using same type as services.location_coords
  popularity_score numeric DEFAULT 0, -- For sorting "Trending Destinations"
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT destinations_pkey PRIMARY KEY (id)
);

-- 3. UPDATE RELATIONS (Posts & Services -> Destinations)

-- Add destination link to Services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS destination_id uuid,
ADD CONSTRAINT services_destination_id_fkey 
    FOREIGN KEY (destination_id) 
    REFERENCES public.destinations(id);

-- Add destination link to Posts
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS destination_id uuid,
ADD CONSTRAINT posts_destination_id_fkey 
    FOREIGN KEY (destination_id) 
    REFERENCES public.destinations(id);

-- (Optional) Enable RLS for the new table
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Destinations are viewable by everyone" 
    ON public.destinations FOR SELECT USING (true);
