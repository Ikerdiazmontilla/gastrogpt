-- backend/scripts/management/add_feedback_table.sql
-- Este script crea la tabla para almacenar el feedback de los usuarios.
-- Se crea en el schema 'public' para centralizar el feedback de todos los inquilinos.

CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- CORREGIDO: El tipo de dato ahora es UUID para coincidir con public.tenants(id)
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear un índice para buscar feedback por inquilino rápidamente.
CREATE INDEX idx_feedback_tenant_id ON public.feedback(tenant_id);

-- Mensaje de confirmación para la consola.
\echo '✅ Tabla public.feedback creada exitosamente.'