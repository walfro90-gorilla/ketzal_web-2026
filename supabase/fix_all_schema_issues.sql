-- Comprehensive Fix Script

-- 1. SOLUCIÓN AL ERROR "updated_at": Agregar la columna faltante
-- Es probable que exista un trigger intentando actualizar esta fecha, pero la columna no existía en 'profiles'.
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 2. SOLUCIÓN COMPATIBILIDAD POLÍTICAS: Eliminar momentáneamente para evitar conflictos
DROP POLICY IF EXISTS "Admins can update" ON public.site_settings;

-- 3. SOLUCIÓN TIPO DE ROL (ENUM): Asegurar conversión correcta
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('traveler', 'provider', 'admin', 'ambassador');
    END IF;
END $$;

-- forzamos la conversión
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT; 

ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.user_role 
USING role::text::public.user_role;

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'traveler'::public.user_role;
GRANT USAGE ON TYPE public.user_role TO postgres, anon, authenticated, service_role;

-- 4. RESTAURAR POLÍTICAS
-- Volvemos a crear la política de seguridad
CREATE POLICY "Admins can update" ON public.site_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::public.user_role
        )
    );

-- 5. CONFIGURAR TRIGGER UPDATED_AT (Opcional, para que funcione a futuro)
-- Si no existe la funcion standard de supabase, la referencia:
-- CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;
-- CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
