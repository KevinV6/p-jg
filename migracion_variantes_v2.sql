-- =====================================================
-- MIGRACIÓN: Normalización de Variantes y Opciones
-- Fecha: 2024-12-20
-- Descripción: Normaliza las tablas de variantes para evitar duplicados
-- =====================================================

-- IMPORTANTE: Ejecutar en orden, paso a paso
-- Hacer BACKUP antes de ejecutar

-- =====================================================
-- PASO 1: Crear nueva tabla producto_variante_opcion
-- Esta tabla relaciona productos con opciones de variante
-- y guarda la imagen específica para cada producto
-- =====================================================

CREATE TABLE IF NOT EXISTS public.producto_variante_opcion (
  idproductovarianteopcion integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  productoid integer NOT NULL,
  opcionvarianteid integer NOT NULL,
  imagenvariante text,
  estado smallint NOT NULL DEFAULT 1,
  fechacreacion timestamp without time zone NOT NULL DEFAULT now(),
  fechaactualizacion timestamp without time zone,
  CONSTRAINT producto_variante_opcion_pkey PRIMARY KEY (idproductovarianteopcion),
  CONSTRAINT fk_pvo_producto FOREIGN KEY (productoid) REFERENCES public.producto(idproducto),
  CONSTRAINT fk_pvo_opcionvariante FOREIGN KEY (opcionvarianteid) REFERENCES public.opcionvariante(idopcionvariante),
  CONSTRAINT uq_producto_opcionvariante UNIQUE (productoid, opcionvarianteid)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pvo_productoid ON public.producto_variante_opcion(productoid);
CREATE INDEX IF NOT EXISTS idx_pvo_opcionvarianteid ON public.producto_variante_opcion(opcionvarianteid);

-- =====================================================
-- PASO 2: Migrar datos existentes a la nueva tabla
-- Copia los registros actuales preservando relaciones
-- =====================================================

INSERT INTO public.producto_variante_opcion (productoid, opcionvarianteid, imagenvariante, estado)
SELECT DISTINCT 
  v.productoid,
  ov.idopcionvariante,
  ov.imagenvariante,
  ov.estado
FROM public.variante v
JOIN public.opcionvariante ov ON ov.varianteid = v.idvariante
WHERE v.productoid IS NOT NULL
ON CONFLICT (productoid, opcionvarianteid) DO NOTHING;

-- =====================================================
-- PASO 3: Agregar columna productovarianteopcionid a precio_variante
-- Esta columna reemplazará a opcionvarianteid
-- =====================================================

-- Agregar nueva columna
ALTER TABLE public.precio_variante 
ADD COLUMN IF NOT EXISTS productovarianteopcionid integer;

-- Agregar FK constraint
ALTER TABLE public.precio_variante 
ADD CONSTRAINT fk_preciovariante_pvo 
FOREIGN KEY (productovarianteopcionid) 
REFERENCES public.producto_variante_opcion(idproductovarianteopcion);

-- =====================================================
-- PASO 4: Migrar datos de precio_variante
-- Actualiza los registros existentes con el nuevo ID
-- =====================================================

UPDATE public.precio_variante 
SET productovarianteopcionid = pvo.idproductovarianteopcion
FROM public.producto_variante_opcion pvo
WHERE pvo.opcionvarianteid = precio_variante.opcionvarianteid
  AND pvo.productoid = (
    SELECT pu.productoid 
    FROM public.producto_unidad pu 
    WHERE pu.idproductounidad = precio_variante.productounidadid
  )
  AND precio_variante.productovarianteopcionid IS NULL;

-- =====================================================
-- PASO 5: Crear tabla catálogo de variantes (nombres únicos)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.variante_catalogo (
  idvariantecatalogo integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombrevariante character varying NOT NULL,
  estado smallint NOT NULL DEFAULT 1,
  fechacreacion timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT variante_catalogo_pkey PRIMARY KEY (idvariantecatalogo),
  CONSTRAINT uq_nombrevariante UNIQUE (nombrevariante)
);

-- =====================================================
-- PASO 6: Crear tabla catálogo de opciones (nombres únicos por variante)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.opcion_catalogo (
  idopcioncatalogo integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombreopcion character varying NOT NULL,
  variantecatalogoid integer NOT NULL,
  estado smallint NOT NULL DEFAULT 1,
  fechacreacion timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT opcion_catalogo_pkey PRIMARY KEY (idopcioncatalogo),
  CONSTRAINT fk_opcion_variantecatalogo FOREIGN KEY (variantecatalogoid) REFERENCES public.variante_catalogo(idvariantecatalogo),
  CONSTRAINT uq_opcion_variante UNIQUE (nombreopcion, variantecatalogoid)
);

-- =====================================================
-- PASO 7: Poblar catálogo de variantes desde datos existentes
-- =====================================================

INSERT INTO public.variante_catalogo (nombrevariante)
SELECT DISTINCT TRIM(nombrevariante)
FROM public.variante
WHERE estado = 1 AND nombrevariante IS NOT NULL
ON CONFLICT (nombrevariante) DO NOTHING;

-- =====================================================
-- PASO 8: Poblar catálogo de opciones desde datos existentes
-- =====================================================

INSERT INTO public.opcion_catalogo (nombreopcion, variantecatalogoid)
SELECT DISTINCT 
  TRIM(ov.nombreopcionvariante),
  vc.idvariantecatalogo
FROM public.opcionvariante ov
JOIN public.variante v ON v.idvariante = ov.varianteid
JOIN public.variante_catalogo vc ON TRIM(vc.nombrevariante) = TRIM(v.nombrevariante)
WHERE ov.estado = 1 AND ov.nombreopcionvariante IS NOT NULL
ON CONFLICT (nombreopcion, variantecatalogoid) DO NOTHING;

-- =====================================================
-- PASO 9: Agregar referencias de catálogo a tablas existentes
-- Esto permite vincular con el catálogo sin romper la estructura actual
-- =====================================================

-- Agregar referencia de catálogo a variante
ALTER TABLE public.variante 
ADD COLUMN IF NOT EXISTS variantecatalogoid integer REFERENCES public.variante_catalogo(idvariantecatalogo);

-- Agregar referencia de catálogo a opcionvariante
ALTER TABLE public.opcionvariante 
ADD COLUMN IF NOT EXISTS opcioncatalogoid integer REFERENCES public.opcion_catalogo(idopcioncatalogo);

-- =====================================================
-- PASO 10: Actualizar referencias de catálogo en tablas existentes
-- =====================================================

-- Vincular variantes con su catálogo
UPDATE public.variante v
SET variantecatalogoid = vc.idvariantecatalogo
FROM public.variante_catalogo vc
WHERE TRIM(LOWER(v.nombrevariante)) = TRIM(LOWER(vc.nombrevariante))
  AND v.variantecatalogoid IS NULL;

-- Vincular opciones con su catálogo
UPDATE public.opcionvariante
SET opcioncatalogoid = oc.idopcioncatalogo
FROM public.opcion_catalogo oc
JOIN public.variante_catalogo vc ON vc.idvariantecatalogo = oc.variantecatalogoid
WHERE TRIM(LOWER(opcionvariante.nombreopcionvariante)) = TRIM(LOWER(oc.nombreopcion))
  AND EXISTS (
    SELECT 1 FROM public.variante v 
    WHERE v.idvariante = opcionvariante.varianteid 
    AND TRIM(LOWER(v.nombrevariante)) = TRIM(LOWER(vc.nombrevariante))
  )
  AND opcionvariante.opcioncatalogoid IS NULL;

-- =====================================================
-- PASO 11: Crear índices adicionales para mejor rendimiento
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_variante_catalogoid ON public.variante(variantecatalogoid);
CREATE INDEX IF NOT EXISTS idx_opcionvariante_catalogoid ON public.opcionvariante(opcioncatalogoid);
CREATE INDEX IF NOT EXISTS idx_preciovariante_pvoid ON public.precio_variante(productovarianteopcionid);

-- =====================================================
-- PASO 12: Crear vista para facilitar consultas
-- Esta vista une toda la información de variantes
-- =====================================================

CREATE OR REPLACE VIEW public.v_producto_variantes AS
SELECT 
  p.idproducto,
  p.nombreproducto,
  pvo.idproductovarianteopcion,
  pvo.imagenvariante,
  vc.idvariantecatalogo,
  vc.nombrevariante,
  oc.idopcioncatalogo,
  oc.nombreopcion as nombreopcionvariante,
  ov.idopcionvariante,
  v.idvariante,
  pu.idproductounidad,
  um.idunidad,
  um.nombre as nombre_unidad,
  um.abreviatura,
  COALESCE(prv.precio, pu.precio) as precio
FROM public.producto p
JOIN public.producto_variante_opcion pvo ON pvo.productoid = p.idproducto
JOIN public.opcionvariante ov ON ov.idopcionvariante = pvo.opcionvarianteid
JOIN public.variante v ON v.idvariante = ov.varianteid
LEFT JOIN public.variante_catalogo vc ON vc.idvariantecatalogo = v.variantecatalogoid
LEFT JOIN public.opcion_catalogo oc ON oc.idopcioncatalogo = ov.opcioncatalogoid
LEFT JOIN public.producto_unidad pu ON pu.productoid = p.idproducto AND pu.estado = 1
LEFT JOIN public.unidad_medida um ON um.idunidad = pu.unidadid
LEFT JOIN public.precio_variante prv ON prv.productovarianteopcionid = pvo.idproductovarianteopcion 
  AND prv.productounidadid = pu.idproductounidad
WHERE p.estado = 1 AND pvo.estado = 1;

-- =====================================================
-- VERIFICACIÓN: Consultas para verificar la migración
-- =====================================================

-- Ver cantidad de registros migrados
-- SELECT 'producto_variante_opcion' as tabla, COUNT(*) as registros FROM public.producto_variante_opcion
-- UNION ALL SELECT 'variante_catalogo', COUNT(*) FROM public.variante_catalogo
-- UNION ALL SELECT 'opcion_catalogo', COUNT(*) FROM public.opcion_catalogo;

-- Ver variantes del catálogo
-- SELECT * FROM public.variante_catalogo ORDER BY nombrevariante;

-- Ver opciones del catálogo
-- SELECT vc.nombrevariante, oc.nombreopcion 
-- FROM public.opcion_catalogo oc
-- JOIN public.variante_catalogo vc ON vc.idvariantecatalogo = oc.variantecatalogoid
-- ORDER BY vc.nombrevariante, oc.nombreopcion;

-- Ver productos con sus variantes usando la vista
-- SELECT * FROM public.v_producto_variantes ORDER BY idproducto, nombrevariante, nombreopcionvariante;

-- =====================================================
-- NOTAS IMPORTANTES:
-- 
-- 1. La estructura anterior (variante.productoid, opcionvariante.imagenvariante)
--    se MANTIENE por compatibilidad con código existente
--
-- 2. El nuevo flujo usa:
--    - variante_catalogo: para nombres de variantes únicos
--    - opcion_catalogo: para nombres de opciones únicos por variante
--    - producto_variante_opcion: relación producto ↔ opción con imagen
--    - precio_variante.productovarianteopcionid: precio específico
--
-- 3. Las tablas detalle_venta, detalle_pedido siguen usando
--    opcionvarianteid para no romper el historial
--
-- 4. Para NUEVOS productos, el backend debe:
--    a) Buscar/crear en variante_catalogo
--    b) Buscar/crear en opcion_catalogo
--    c) Crear variante local (con variantecatalogoid)
--    d) Crear opcionvariante local (con opcioncatalogoid)
--    e) Crear producto_variante_opcion (con imagen)
--    f) Crear precio_variante (con productovarianteopcionid)
-- =====================================================
