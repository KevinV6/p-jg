-- ============================================
-- Script para actualizar "Cliente General" a "Sin Nombre"
-- ============================================
-- Fecha: 23 de diciembre de 2025
-- Descripción: Actualiza el nombre del cliente genérico
-- ============================================

-- Actualizar el cliente genérico existente
UPDATE cliente 
SET nombrecliente = 'Sin Nombre'
WHERE es_generico = true 
  OR ci_nit = '0' 
  OR ci_nit = 'S/N'
  OR nombrecliente = 'Cliente General';

-- Verificar el cambio
SELECT idcliente, nombrecliente, ci_nit, es_generico 
FROM cliente 
WHERE es_generico = true OR nombrecliente = 'Sin Nombre';
