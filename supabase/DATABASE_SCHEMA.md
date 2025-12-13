-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ambassador_details (
  user_id uuid NOT NULL,
  referral_code text NOT NULL UNIQUE,
  niche ARRAY,
  commission_rate numeric DEFAULT 0.05,
  total_earnings numeric DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ambassador_details_pkey PRIMARY KEY (user_id),
  CONSTRAINT ambassador_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  service_id uuid,
  status USER-DEFINED DEFAULT 'pending'::booking_status,
  total_price numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.destinations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  place_id text UNIQUE,
  address text,
  city text,
  state text,
  country text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  category text,
  posts_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT destinations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.post_comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  parent_comment_id uuid,
  content text NOT NULL CHECK (length(content) > 0 AND length(content) <= 500),
  likes_count integer DEFAULT 0 CHECK (likes_count >= 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT post_comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.post_comments(id)
);
CREATE TABLE public.post_likes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  video_url text NOT NULL,
  thumbnail_url text,
  description text,
  likes_count integer DEFAULT 0,
  linked_service_id uuid,
  destination_id uuid,
  location_tag USER-DEFINED,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT posts_linked_service_id_fkey FOREIGN KEY (linked_service_id) REFERENCES public.services(id),
  CONSTRAINT posts_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  full_name text,
  role USER-DEFINED DEFAULT 'traveler'::user_role,
  avatar_url text,
  km_container numeric DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ambassador_id uuid,
  referred_user_id uuid,
  status USER-DEFINED DEFAULT 'pending'::referral_status,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT referrals_pkey PRIMARY KEY (id),
  CONSTRAINT referrals_ambassador_id_fkey FOREIGN KEY (ambassador_id) REFERENCES public.profiles(id),
  CONSTRAINT referrals_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.service_reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  service_id uuid NOT NULL,
  user_id uuid NOT NULL,
  booking_id uuid UNIQUE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT service_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT service_reviews_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT service_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT service_reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  provider_id uuid,
  title text NOT NULL,
  description text,
  service_type USER-DEFINED NOT NULL,
  price_mxn numeric NOT NULL,
  available boolean DEFAULT true,
  images ARRAY DEFAULT '{}'::text[],
  rating numeric DEFAULT 0 CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  total_reviews integer DEFAULT 0,
  duration_hours integer,
  max_capacity integer,
  location USER-DEFINED,
  location_name text,
  location_address text,
  location_place_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  location_coords jsonb,
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.site_settings (
  id integer NOT NULL DEFAULT 1 CHECK (id = 1),
  site_name text DEFAULT 'Ketzal'::text,
  site_description text,
  logo_url text,
  contact_email text,
  contact_phone text,
  maintenance_mode boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  wallet_id uuid,
  amount numeric NOT NULL,
  type USER-DEFINED NOT NULL,
  reference_id uuid,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id)
);
CREATE TABLE public.wallets (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric DEFAULT 0.0000,
  currency_code text DEFAULT 'AXO'::text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wallets_pkey PRIMARY KEY (id),
  CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);