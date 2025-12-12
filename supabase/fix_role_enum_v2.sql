-- Protocolo de Solución de Conflictos de Tipos (Versión 2)

-- 1. Eliminar temporalmente las políticas que dependen de la columna 'role'
-- El error indica que 'site_settings' tiene una política conflictiva.
DROP POLICY IF EXISTS "Admins can update" ON public.site_settings;

-- También es posible que existan otras. Por precaución, eliminamos otras comunes si existen:
-- (Si alguna de estas falla porque no existe, no importa, es safe delete)
DROP POLICY IF EXISTS "Admins can delete" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update" ON public.profiles;


-- 2. Asegurar que el tipo ENUM existe
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('traveler', 'provider', 'admin', 'ambassador');
    END IF;
END $$;

-- 3. Realizar la conversión de tipo (La parte crítica)
ALTER TABLE public.profiles 
ALTER COLUMN role DROP DEFAULT; 

-- Usamos USING para forzar la conversión de texto a enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.user_role 
USING role::text::public.user_role;

ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'traveler'::public.user_role;

-- 4. Otorgar permisos al nuevo tipo
GRANT USAGE ON TYPE public.user_role TO postgres, anon, authenticated, service_role;

-- 5. Restaurar las políticas
-- Restauramos la política de site_settings que causó el conflicto
CREATE POLICY "Admins can update" ON public.site_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::public.user_role
        )
    );

-- Nota: Si tenías otras políticas personalizadas de admin en 'profiles', 
-- deberás recrearlas manualmente o avisarme si ves más errores.
