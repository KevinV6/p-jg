-- Script para insertar datos iniciales en Supabase JG
-- Categorías y Unidades de Medida

-- ============================================
-- INSERTAR CATEGORÍAS
-- ============================================
INSERT INTO public.categoria (nombrecategoria, descripcion, orden, estado) VALUES
  ('Granos', 'Productos de granos y cereales', 1, 1),
  ('Legumbres', 'Legumbres y derivados', 2, 1),
  ('Especias', 'Especias y condimentos', 3, 1),
  ('Cajas', 'Productos en presentación de cajas', 4, 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERTAR UNIDADES DE MEDIDA
-- ============================================
INSERT INTO public.unidad_medida (nombre, abreviatura, es_peso, estado) VALUES
  ('Libra', 'lb', true, 1),
  ('Kilogramo', 'kg', true, 1),
  ('Cuartilla', 'cua', false, 1),
  ('Arroba', '@', true, 1),
  ('Quintal', 'qq', true, 1),
  ('Envase', 'env', false, 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- SELECT * FROM public.categoria ORDER BY orden;
-- SELECT * FROM public.unidad_medida ORDER BY nombre;
