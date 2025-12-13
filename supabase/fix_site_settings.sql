-- Create default site settings if not exist
INSERT INTO public.site_settings (id, site_name, maintenance_mode)
VALUES (1, 'Ketzal', false)
ON CONFLICT (id) DO NOTHING;
