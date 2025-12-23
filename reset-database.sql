-- =====================================================
-- SCRIPT DE LIMPIEZA COMPLETA DE BASE DE DATOS JG
-- =====================================================
-- Este script elimina TODOS los datos de la base de datos
-- EXCEPTO: Usuario admin y Cliente "Sin nombre"
-- 
-- ADVERTENCIA: Esta acción es IRREVERSIBLE
-- Hacer backup antes de ejecutar
-- =====================================================

BEGIN;

-- =====================================================
-- 1. DESHABILITAR TRIGGERS Y CONSTRAINTS TEMPORALMENTE
-- =====================================================
SET session_replication_role = 'replica';

-- =====================================================
-- 2. ELIMINAR DATOS DE TABLAS DEPENDIENTES (EN ORDEN)
-- =====================================================

-- Eliminar historial de pagos de cobros
DELETE FROM public.historial_pago_cobro;

-- Eliminar notificaciones
DELETE FROM public.notificacion;

-- Eliminar detalles de cobros
DELETE FROM public.detalle_cobro;

-- Eliminar cobros
DELETE FROM public.cobros;

-- Eliminar detalles de ventas
DELETE FROM public.detalle_venta;

-- Eliminar ventas
DELETE FROM public.venta;

-- Eliminar detalles de pedidos
DELETE FROM public.detalle_pedido;

-- Eliminar pedidos
DELETE FROM public.pedido;

-- Eliminar precios de variantes
DELETE FROM public.precio_variante;

-- Eliminar producto_variante_opcion
DELETE FROM public.producto_variante_opcion;

-- Eliminar opciones de variantes
DELETE FROM public.opcionvariante;

-- Eliminar variantes
DELETE FROM public.variante;

-- Eliminar opciones del catálogo
DELETE FROM public.opcion_catalogo;

-- Eliminar variantes del catálogo
DELETE FROM public.variante_catalogo;

-- Eliminar unidades de productos
DELETE FROM public.producto_unidad;

-- Eliminar productos
DELETE FROM public.producto;

-- Eliminar categorías
DELETE FROM public.categoria;

-- Eliminar clientes (EXCEPTO "Sin nombre")
DELETE FROM public.cliente 
WHERE nombrecliente != 'Sin nombre' 
  AND es_generico = false;

-- Eliminar sesiones de tokens
DELETE FROM public.sesion_token;

-- Eliminar usuarios (EXCEPTO admin)
DELETE FROM public.usuario 
WHERE nombreusuario != 'admin';

-- Eliminar configuración de empresa
DELETE FROM public.configuracion_empresa;

-- Reiniciar folios de ventas
DELETE FROM public.folio_venta;

-- =====================================================
-- 3. REINICIAR SECUENCIAS (AUTO-INCREMENT)
-- =====================================================

-- Obtener el ID del usuario admin para no reiniciar desde 1
DO $$
DECLARE
    admin_id INTEGER;
    cliente_id INTEGER;
BEGIN
    -- Obtener ID del admin
    SELECT idusuario INTO admin_id FROM public.usuario WHERE nombreusuario = 'admin';
    IF admin_id IS NOT NULL THEN
        PERFORM setval('usuario_idusuario_seq', admin_id);
    END IF;

    -- Obtener ID del cliente "Sin nombre"
    SELECT idcliente INTO cliente_id FROM public.cliente WHERE nombrecliente = 'Sin nombre' LIMIT 1;
    IF cliente_id IS NOT NULL THEN
        PERFORM setval('cliente_idcliente_seq', cliente_id);
    END IF;
END $$;

-- Reiniciar secuencias de otras tablas
ALTER SEQUENCE categoria_idcategoria_seq RESTART WITH 1;
ALTER SEQUENCE cobros_idcobro_seq RESTART WITH 1;
ALTER SEQUENCE detalle_cobro_iddetallecobro_seq RESTART WITH 1;
ALTER SEQUENCE pedido_idpedido_seq RESTART WITH 1;
ALTER SEQUENCE producto_idproducto_seq RESTART WITH 1;
ALTER SEQUENCE variante_idvariante_seq RESTART WITH 1;
ALTER SEQUENCE opcionvariante_idopcionvariante_seq RESTART WITH 1;
ALTER SEQUENCE venta_idventa_seq RESTART WITH 1;

-- =====================================================
-- 4. RESTAURAR TRIGGERS Y CONSTRAINTS
-- =====================================================
SET session_replication_role = 'origin';

-- =====================================================
-- 5. VERIFICAR RESULTADOS
-- =====================================================

-- Contar registros restantes
DO $$
DECLARE
    usuario_count INTEGER;
    cliente_count INTEGER;
    producto_count INTEGER;
    venta_count INTEGER;
    cobro_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO usuario_count FROM public.usuario;
    SELECT COUNT(*) INTO cliente_count FROM public.cliente;
    SELECT COUNT(*) INTO producto_count FROM public.producto;
    SELECT COUNT(*) INTO venta_count FROM public.venta;
    SELECT COUNT(*) INTO cobro_count FROM public.cobros;

    RAISE NOTICE '==========================================';
    RAISE NOTICE 'LIMPIEZA COMPLETADA';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Usuarios restantes: %', usuario_count;
    RAISE NOTICE 'Clientes restantes: %', cliente_count;
    RAISE NOTICE 'Productos restantes: %', producto_count;
    RAISE NOTICE 'Ventas restantes: %', venta_count;
    RAISE NOTICE 'Cobros restantes: %', cobro_count;
    RAISE NOTICE '==========================================';
    
    IF usuario_count = 1 AND cliente_count >= 1 THEN
        RAISE NOTICE 'Base de datos limpiada correctamente';
        RAISE NOTICE 'Usuario admin y cliente genérico preservados';
    ELSE
        RAISE WARNING 'Verificar datos: se esperaba 1 usuario y al menos 1 cliente';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- NOTA: Si necesitas recrear el usuario admin o cliente genérico:
-- 
-- INSERT INTO public.usuario (nombreusuario, contrasenia, primernombre, 
--   apellidopaterno, apellidomaterno, rol, photo, estado) 
-- VALUES ('admin', '$2b$10$hash...', 'Administrador', 'Sistema', '', 
--   'admin', '', 1);
--
-- INSERT INTO public.cliente (nombrecliente, ci_nit, telefono, direccion, 
--   es_generico, estado, usuarioid)
-- VALUES ('Sin nombre', '', '', '', true, 1, 1);
