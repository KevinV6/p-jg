const { getAdminConnection } = require('../config/database');
const { successResponse, errorResponse, paginate, paginatedResponse } = require('../utils/helpers');

// Obtener todos los pedidos
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, estado_pedido, clienteid, fecha_desde, fecha_hasta } = req.query;
    const supabase = getAdminConnection();

    let query = supabase
      .from('pedido')
      .select(`
        *,
        cliente:clienteid (
          idcliente,
          nombrecliente,
          ci_nit,
          telefono
        ),
        detalles:detalle_pedido (
          *,
          producto:productoid (
            idproducto,
            nombreproducto,
            imagen
          )
        )
      `, { count: 'exact' });

    // Filtros
    if (estado_pedido) {
      query = query.eq('estado_pedido', estado_pedido);
    }

    if (clienteid) {
      query = query.eq('clienteid', clienteid);
    }

    // TODO: Los pedidos no tienen fechacreacion, usar fecha cuando esté disponible
    // if (fecha_desde) {
    //   query = query.gte('fechacreacion', fecha_desde);
    // }

    // if (fecha_hasta) {
    //   query = query.lte('fechacreacion', fecha_hasta);
    // }

    // Paginación
    const { from, to, pageNum, limitNum } = paginate(page, limit);
    // Ordenar por idpedido en lugar de fechacreacion
    query = query.range(from, to).order('idpedido', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error obteniendo pedidos:', error);
      return errorResponse(res, 'Error al obtener pedidos', 500);
    }

    return paginatedResponse(res, data, count, pageNum, limitNum);

  } catch (error) {
    console.error('Get all pedidos error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Obtener pedido por ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    const { data, error } = await supabase
      .from('pedido')
      .select(`
        *,
        cliente:clienteid (
          idcliente,
          nombrecliente,
          ci_nit,
          telefono,
          direccion
        ),
        detalles:detalle_pedido (
          *,
          producto:productoid (
            idproducto,
            nombreproducto,
            imagen,
            descripcion
          )
        )
      `)
      .eq('idpedido', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Pedido no encontrado', 404);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get pedido by id error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Crear pedido
const create = async (req, res) => {
  try {
    const { clienteid, detalles, notas, fecha_entrega } = req.body;
    const usuarioid = req.user.idusuario;
    const supabase = getAdminConnection();

    // Validaciones
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return errorResponse(res, 'Debe incluir al menos un producto', 400);
    }

    // Validar cliente si se proporciona
    if (clienteid) {
      const { data: cliente, error: clienteError } = await supabase
        .from('cliente')
        .select('idcliente')
        .eq('idcliente', clienteid)
        .eq('estado', 1)
        .single();

      if (clienteError || !cliente) {
        return errorResponse(res, 'Cliente no encontrado', 404);
      }
    }

    // Calcular totales
    let subtotal = 0;
    let total = 0;

    const detallesValidados = detalles.map(det => {
      const precioUnitario = Number(det.precio_unitario) || 0;
      const cantidad = Number(det.cantidad) || 1;
      const descuento = Number(det.descuento) || 0;
      const lineaSubtotal = (precioUnitario * cantidad) - descuento;

      subtotal += precioUnitario * cantidad;
      total += lineaSubtotal;

      return {
        productoid: det.productoid,
        cantidad,
        precio_unitario: precioUnitario,
        descuento,
        subtotal: lineaSubtotal,
        notas: det.notas || null
      };
    });

    // Crear pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedido')
      .insert({
        clienteid: clienteid || null,
        usuarioid,
        subtotal,
        descuento: subtotal - total,
        total,
        notas: notas || null,
        fecha_entrega: fecha_entrega || null,
        estado_pedido: 'pendiente',
        estado: 1
      })
      .select()
      .single();

    if (pedidoError) {
      console.error('Error creando pedido:', pedidoError);
      return errorResponse(res, 'Error al crear pedido', 500);
    }

    // Crear detalles
    const detallesConPedido = detallesValidados.map(det => ({
      ...det,
      pedidoid: pedido.idpedido
    }));

    const { error: detallesError } = await supabase
      .from('detalle_pedido')
      .insert(detallesConPedido);

    if (detallesError) {
      console.error('Error creando detalles:', detallesError);
      // Rollback: eliminar pedido
      await supabase.from('pedido').delete().eq('idpedido', pedido.idpedido);
      return errorResponse(res, 'Error al crear detalles del pedido', 500);
    }

    // Obtener pedido completo
    const { data: pedidoCompleto } = await supabase
      .from('pedido')
      .select(`
        *,
        cliente:clienteid (idcliente, nombrecliente, ci_nit),
        detalles:detalle_pedido (
          *,
          producto:productoid (idproducto, nombreproducto)
        )
      `)
      .eq('idpedido', pedido.idpedido)
      .single();

    return successResponse(res, pedidoCompleto, 'Pedido creado exitosamente', 201);

  } catch (error) {
    console.error('Create pedido error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Actualizar pedido
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { detalles, notas, fecha_entrega, estado_pedido } = req.body;
    const supabase = getAdminConnection();

    // Verificar que el pedido existe
    const { data: pedidoActual, error: pedidoError } = await supabase
      .from('pedido')
      .select('*')
      .eq('idpedido', id)
      .single();

    if (pedidoError || !pedidoActual) {
      return errorResponse(res, 'Pedido no encontrado', 404);
    }

    // No permitir editar pedidos completados o cancelados
    if (['completado', 'cancelado'].includes(pedidoActual.estado_pedido)) {
      return errorResponse(res, 'No se puede editar un pedido completado o cancelado', 400);
    }

    const updateData = {};
    if (notas !== undefined) updateData.notas = notas;
    if (fecha_entrega !== undefined) updateData.fecha_entrega = fecha_entrega;
    if (estado_pedido !== undefined) updateData.estado_pedido = estado_pedido;

    // Si hay nuevos detalles, recalcular
    if (detalles && Array.isArray(detalles) && detalles.length > 0) {
      let subtotal = 0;
      let total = 0;

      const detallesValidados = detalles.map(det => {
        const precioUnitario = Number(det.precio_unitario) || 0;
        const cantidad = Number(det.cantidad) || 1;
        const descuento = Number(det.descuento) || 0;
        const lineaSubtotal = (precioUnitario * cantidad) - descuento;

        subtotal += precioUnitario * cantidad;
        total += lineaSubtotal;

        return {
          productoid: det.productoid,
          cantidad,
          precio_unitario: precioUnitario,
          descuento,
          subtotal: lineaSubtotal,
          notas: det.notas || null,
          pedidoid: Number(id)
        };
      });

      updateData.subtotal = subtotal;
      updateData.descuento = subtotal - total;
      updateData.total = total;

      // Eliminar detalles anteriores
      await supabase
        .from('detalle_pedido')
        .delete()
        .eq('pedidoid', id);

      // Insertar nuevos detalles
      const { error: detallesError } = await supabase
        .from('detalle_pedido')
        .insert(detallesValidados);

      if (detallesError) {
        console.error('Error actualizando detalles:', detallesError);
        return errorResponse(res, 'Error al actualizar detalles', 500);
      }
    }

    // Actualizar pedido
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('pedido')
        .update(updateData)
        .eq('idpedido', id);

      if (updateError) {
        console.error('Error actualizando pedido:', updateError);
        return errorResponse(res, 'Error al actualizar pedido', 500);
      }
    }

    // Obtener pedido actualizado
    const { data: pedidoActualizado } = await supabase
      .from('pedido')
      .select(`
        *,
        cliente:clienteid (idcliente, nombrecliente, ci_nit),
        detalles:detalle_pedido (
          *,
          producto:productoid (idproducto, nombreproducto)
        )
      `)
      .eq('idpedido', id)
      .single();

    return successResponse(res, pedidoActualizado, 'Pedido actualizado');

  } catch (error) {
    console.error('Update pedido error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Cambiar estado del pedido
const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_pedido } = req.body;
    const supabase = getAdminConnection();

    const estadosValidos = ['pendiente', 'en_proceso', 'completado', 'cancelado'];
    if (!estadosValidos.includes(estado_pedido)) {
      return errorResponse(res, 'Estado no válido', 400);
    }

    // Verificar que el pedido existe
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedido')
      .select('estado_pedido')
      .eq('idpedido', id)
      .single();

    if (pedidoError || !pedido) {
      return errorResponse(res, 'Pedido no encontrado', 404);
    }

    // Validar transiciones de estado
    if (pedido.estado_pedido === 'completado' || pedido.estado_pedido === 'cancelado') {
      return errorResponse(res, 'No se puede cambiar el estado de un pedido finalizado', 400);
    }

    const { error: updateError } = await supabase
      .from('pedido')
      .update({ estado_pedido })
      .eq('idpedido', id);

    if (updateError) {
      console.error('Error cambiando estado:', updateError);
      return errorResponse(res, 'Error al cambiar estado', 500);
    }

    return successResponse(res, { idpedido: id, estado_pedido }, 'Estado actualizado');

  } catch (error) {
    console.error('Cambiar estado pedido error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Convertir pedido a venta
const convertirAVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_pago = 'contado', clienteid } = req.body;
    const usuarioid = req.user.idusuario;
    const supabase = getAdminConnection();

    // Obtener pedido con detalles
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedido')
      .select(`
        *,
        detalles:detalle_pedido (
          productoid,
          cantidad,
          precio_unitario,
          descuento,
          subtotal,
          notas
        )
      `)
      .eq('idpedido', id)
      .single();

    if (pedidoError || !pedido) {
      return errorResponse(res, 'Pedido no encontrado', 404);
    }

    if (pedido.estado_pedido === 'completado') {
      return errorResponse(res, 'Este pedido ya fue convertido a venta', 400);
    }

    if (pedido.estado_pedido === 'cancelado') {
      return errorResponse(res, 'No se puede convertir un pedido cancelado', 400);
    }

    // Determinar cliente
    const clienteFinal = clienteid || pedido.clienteid;

    // Si es crédito, validar cliente
    if (tipo_pago === 'credito') {
      if (!clienteFinal) {
        return errorResponse(res, 'Se requiere cliente para ventas a crédito', 400);
      }

      // Verificar que no sea cliente genérico
      const { data: cliente } = await supabase
        .from('cliente')
        .select('es_generico')
        .eq('idcliente', clienteFinal)
        .single();

      if (cliente?.es_generico) {
        return errorResponse(res, 'No se puede vender a crédito al cliente genérico', 400);
      }

      // Verificar que no tenga deuda
      const { data: tieneDeuda } = await supabase.rpc('cliente_tiene_deuda', {
        p_clienteid: clienteFinal
      });

      if (tieneDeuda) {
        return errorResponse(res, 'El cliente tiene deuda pendiente', 400);
      }
    }

    // Generar folio
    const { data: folio, error: folioError } = await supabase.rpc('generar_folio_venta');

    if (folioError || !folio) {
      console.error('Error generando folio:', folioError);
      return errorResponse(res, 'Error al generar folio de venta', 500);
    }

    // Crear venta
    const { data: venta, error: ventaError } = await supabase
      .from('venta')
      .insert({
        folio,
        clienteid: clienteFinal,
        usuarioid,
        subtotal: pedido.subtotal,
        descuento: pedido.descuento,
        total: pedido.total,
        tipo_pago,
        notas: `Convertido desde pedido #${id}. ${pedido.notas || ''}`.trim(),
        estado: 1
      })
      .select()
      .single();

    if (ventaError) {
      console.error('Error creando venta:', ventaError);
      return errorResponse(res, 'Error al crear venta', 500);
    }

    // Crear detalles de venta
    const detallesVenta = pedido.detalles.map(det => ({
      ventaid: venta.idventa,
      productoid: det.productoid,
      productounidadid: det.productounidadid || null,
      opcionvarianteid: det.opcionvarianteid || null,
      cantidad: det.cantidad,
      peso: 0,
      unidadmedida: 'unidad',
      precio_lista: det.precio_unitario,
      precio_aplicado: det.precio_unitario,
      descuento_manual: det.descuento || 0,
      subtotal: det.subtotal
    }));

    await supabase.from('detalle_venta').insert(detallesVenta);

    // Si es crédito, crear cobro
    if (tipo_pago === 'credito') {
      await supabase.from('cobros').insert({
        clienteid: clienteFinal,
        usuarioid,
        ventaid: venta.idventa,
        total: pedido.total,
        monto_pagado: 0,
        fecha_vencimiento: null,
        notas: `Crédito de venta ${folio}`,
        origen: 'venta',
        estado: 1
      });
    }

    // Marcar pedido como completado
    await supabase
      .from('pedido')
      .update({ estado_pedido: 'completado' })
      .eq('idpedido', id);

    return successResponse(res, { venta, folio }, 'Pedido convertido a venta exitosamente', 201);

  } catch (error) {
    console.error('Convertir a venta error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Cancelar pedido
const cancelar = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const supabase = getAdminConnection();

    const { data: pedido, error: pedidoError } = await supabase
      .from('pedido')
      .select('estado_pedido')
      .eq('idpedido', id)
      .single();

    if (pedidoError || !pedido) {
      return errorResponse(res, 'Pedido no encontrado', 404);
    }

    if (pedido.estado_pedido === 'completado') {
      return errorResponse(res, 'No se puede cancelar un pedido completado', 400);
    }

    if (pedido.estado_pedido === 'cancelado') {
      return errorResponse(res, 'El pedido ya está cancelado', 400);
    }

    const { error: updateError } = await supabase
      .from('pedido')
      .update({
        estado_pedido: 'cancelado',
        notas: motivo ? `CANCELADO: ${motivo}` : 'CANCELADO'
      })
      .eq('idpedido', id);

    if (updateError) {
      console.error('Error cancelando pedido:', updateError);
      return errorResponse(res, 'Error al cancelar pedido', 500);
    }

    return successResponse(res, null, 'Pedido cancelado');

  } catch (error) {
    console.error('Cancelar pedido error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Eliminar pedido (soft delete)
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    const { data: pedido, error: pedidoError } = await supabase
      .from('pedido')
      .select('estado_pedido')
      .eq('idpedido', id)
      .single();

    if (pedidoError || !pedido) {
      return errorResponse(res, 'Pedido no encontrado', 404);
    }

    if (pedido.estado_pedido === 'completado') {
      return errorResponse(res, 'No se puede eliminar un pedido completado', 400);
    }

    const { error: updateError } = await supabase
      .from('pedido')
      .update({ estado: 0 })
      .eq('idpedido', id);

    if (updateError) {
      console.error('Error eliminando pedido:', updateError);
      return errorResponse(res, 'Error al eliminar pedido', 500);
    }

    return successResponse(res, null, 'Pedido eliminado');

  } catch (error) {
    console.error('Remove pedido error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  cambiarEstado,
  convertirAVenta,
  cancelar,
  remove
};
