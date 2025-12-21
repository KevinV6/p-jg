-- Script de corrección y datos iniciales para Supabase JG
-- Ejecuta este script en el SQL Editor de Supabase

-- ============================================
-- 1. CORREGIR TABLA CLIENTE
-- ============================================
ALTER TABLE public.cliente RENAME COLUMN cliente TO nombrecliente;

-- ============================================
-- 2. CORREGIR TABLA PEDIDO
-- ============================================
ALTER TABLE public.pedido RENAME COLUMN fechapedido TO fecha;
ALTER TABLE public.pedido RENAME COLUMN observacion TO notas;
ALTER TABLE public.pedido ADD COLUMN IF NOT EXISTS total NUMERIC NOT NULL DEFAULT 0;

-- Crear nueva columna estado_pedido como texto
ALTER TABLE public.pedido ADD COLUMN IF NOT EXISTS estado_pedido VARCHAR NOT NULL DEFAULT 'pendiente';

-- Migrar datos de estado a estado_pedido
UPDATE public.pedido SET estado_pedido = 
  CASE 
    WHEN estado = 1 THEN 'pendiente'
    WHEN estado = 2 THEN 'confirmado'
    WHEN estado = 3 THEN 'cancelado'
    ELSE 'pendiente'
  END;

-- Eliminar la vista que depende de la columna estado
DROP VIEW IF EXISTS public.v_resumen_dashboard CASCADE;

-- Ahora sí eliminar la columna vieja
ALTER TABLE public.pedido DROP COLUMN IF EXISTS estado;

-- ============================================
-- 3. CORREGIR TABLA VENTA
-- ============================================
-- Agregar nueva columna tipo_pago
ALTER TABLE public.venta ADD COLUMN IF NOT EXISTS tipo_pago VARCHAR NOT NULL DEFAULT 'contado';

-- Migrar datos de tipoventa a tipo_pago
UPDATE public.venta SET tipo_pago = CASE 
  WHEN tipoventa = 1 THEN 'contado'
  WHEN tipoventa = 2 THEN 'credito'
  ELSE 'contado'
END;

-- Eliminar vista que depende de tipoventa
DROP VIEW IF EXISTS public.v_ventas_completas CASCADE;

-- Eliminar columna vieja
ALTER TABLE public.venta DROP COLUMN IF EXISTS tipoventa;

-- ============================================
-- 4. CORREGIR TABLA COBROS
-- ============================================
-- Eliminar vistas que dependen de las columnas
DROP VIEW IF EXISTS public.v_cobros_completos CASCADE;

-- Eliminar columnas que ahora vienen de relaciones
ALTER TABLE public.cobros DROP COLUMN IF EXISTS nombrecobro;
ALTER TABLE public.cobros DROP COLUMN IF EXISTS telefono;
ALTER TABLE public.cobros DROP COLUMN IF EXISTS imagen;

-- Agregar nuevos campos
ALTER TABLE public.cobros ADD COLUMN IF NOT EXISTS monto_pagado NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.cobros ADD COLUMN IF NOT EXISTS saldo NUMERIC;
ALTER TABLE public.cobros ADD COLUMN IF NOT EXISTS fecha_vencimiento TIMESTAMP;
ALTER TABLE public.cobros ADD COLUMN IF NOT EXISTS notas VARCHAR;
ALTER TABLE public.cobros ADD COLUMN IF NOT EXISTS fecha TIMESTAMP NOT NULL DEFAULT NOW();

-- Asegurar que clienteid no sea nulo
ALTER TABLE public.cobros ALTER COLUMN clienteid SET NOT NULL;

-- ============================================
-- 5. INSERTAR USUARIO ADMINISTRADOR
-- ============================================
-- Usuario: admin
-- Contraseña: admin123
INSERT INTO public.usuario (
  nombreusuario, 
  contrasenia, 
  primernombre, 
  apellidopaterno, 
  rol, 
  photo, 
  estado, 
  email
) VALUES (
  'admin',
  '$2a$10$21G0uTPbnZu7g.Dvc6hAbOOKaK2m8PAHEX4llG6PLZluzmMiqAPbK',
  'Administrador',
  'Sistema',
  'admin',
  '',
  1,
  'admin@jg.com'
);

-- ============================================
-- 6. INSERTAR CLIENTE GENÉRICO
-- ============================================
INSERT INTO public.cliente (
  nombrecliente, 
  ci_nit, 
  telefono, 
  direccion, 
  es_generico, 
  estado
) VALUES (
  'Cliente General',
  '0',
  '',
  '',
  true,
  1
);

-- ============================================
-- 7. VERIFICACIÓN
-- ============================================
-- Descomentar para verificar los cambios
-- SELECT * FROM public.usuario WHERE nombreusuario = 'admin';
-- SELECT * FROM public.cliente WHERE es_generico = true;
