const { getAdminConnection } = require('../config/database');
const { 
  successResponse, 
  errorResponse,
  validateRequired,
  paginate,
  paginatedResponse
} = require('../utils/helpers');

// Obtener todos los cobros
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, estado, clienteid } = req.query;
    const { offset, limit: limitNum } = paginate(Number(page), Number(limit));
    
    const supabase = getAdminConnection();
    
    let query = supabase
      .from('cobros')
      .select(`
        *,
        cliente:clienteid(idcliente, nombrecliente, ci_nit, telefono),
        usuario:usuarioid(idusuario, primernombre, apellidopaterno),
        venta:ventaid(
          idventa,
          folio,
          fecha,
          detalles:detalle_venta(
            productoid,
            ventaid,
            cantidad,
            peso,
            unidadmedida,
            precio_lista,
            precio_aplicado,
            descuento_manual,
            subtotal,
            productounidadid,
            opcionvarianteid,
            producto:productoid(idproducto, nombreproducto),
            productounidad:productounidadid(
              idproductounidad,
              unidad:unidadid(idunidad, nombre, abreviatura)
            ),
            opcionvariante:opcionvarianteid(idopcionvariante, nombreopcionvariante)
          )
        ),
        detalles:detalle_cobro(
          iddetallecobro,
          nombreproducto,
          cantidad,
          peso,
          unidadmedida,
          precio
        )
      `, { count: 'exact' })
      .neq('estado', 3) // Excluir anulados por defecto
      .order('fechacreacion', { ascending: false });

    // Filtro por estado
    if (estado) {
      query = query.eq('estado', estado);
    }

    // Filtro por cliente
    if (clienteid) {
      query = query.eq('clienteid', clienteid);
    }

    // Paginación
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error obteniendo cobros:', error);
      return errorResponse(res, 'Error al obtener cobros', 500);
    }

    return paginatedResponse(res, data, count, Number(page), limitNum, 'Cobros obtenidos');

  } catch (error) {
    console.error('Get all cobros error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Obtener cobro por ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    const { data, error } = await supabase
      .from('cobros')
      .select(`
        *,
        cliente:clienteid(idcliente, nombrecliente, ci_nit, telefono, direccion),
        usuario:usuarioid(idusuario, primernombre, apellidopaterno),
        venta:ventaid(
          idventa,
          folio,
          fecha,
          total,
          detalles:detalle_venta(
            productoid,
            ventaid,
            cantidad,
            peso,
            unidadmedida,
            precio_lista,
            precio_aplicado,
            descuento_manual,
            subtotal,
            productounidadid,
            opcionvarianteid,
            producto:productoid(idproducto, nombreproducto),
            productounidad:productounidadid(
              idproductounidad,
              unidad:unidadid(idunidad, nombre, abreviatura)
            ),
            opcionvariante:opcionvarianteid(idopcionvariante, nombreopcionvariante)
          )
        ),
        detalles:detalle_cobro(
          iddetallecobro,
          nombreproducto,
          cantidad,
          peso,
          unidadmedida,
          precio
        ),
        historial:historial_pago_cobro(
          idhistorial,
          monto_pagado,
          metodo_pago,
          observacion,
          fechapago,
          usuario:usuarioid(primernombre, apellidopaterno)
        )
      `)
      .eq('idcobro', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Cobro no encontrado', 404);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get cobro by id error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Crear cobro manual
const create = async (req, res) => {
  try {
    const { 
      clienteid,
      nombrecobro,
      telefono,
      observacion,
      imagen,
      detalles = []
    } = req.body;

    // Validar campos
    if (!clienteid && !nombrecobro) {
      return errorResponse(res, 'Debe seleccionar un cliente o proporcionar un nombre', 400);
    }

    if (detalles.length === 0) {
      return errorResponse(res, 'Debe agregar al menos un producto', 400);
    }

    const supabase = getAdminConnection();

    // Obtener datos del cliente si se proporciona ID
    let nombreCliente = nombrecobro;
    let telefonoCliente = telefono;

    if (clienteid) {
      const { data: cliente } = await supabase
        .from('cliente')
        .select('nombrecliente, telefono')
        .eq('idcliente', clienteid)
        .single();

      if (cliente) {
        nombreCliente = nombreCliente || cliente.nombrecliente;
        telefonoCliente = telefonoCliente || cliente.telefono;
      }
    }

    // Calcular total
    const total = detalles.reduce((sum, d) => sum + (d.cantidad * d.precio), 0);

    // Crear cobro
    const { data: cobro, error: cobroError } = await supabase
      .from('cobros')
      .insert({
        clienteid: clienteid ? Number(clienteid) : null,
        ventaid: null, // Manual, no viene de venta
        origen: 'manual',
        nombrecobro: nombreCliente,
        telefono: telefonoCliente || '',
        total,
        observacion,
        estado: 1,
        usuarioid: req.user.idusuario,
        imagen: imagen || ''
      })
      .select()
      .single();

    if (cobroError) {
      console.error('Error creando cobro:', cobroError);
      return errorResponse(res, 'Error al crear cobro', 500);
    }

    // Crear detalles
    const detallesData = detalles.map(d => ({
      cobroid: cobro.idcobro,
      nombreproducto: d.nombreproducto,
      cantidad: d.cantidad,
      peso: d.peso || d.cantidad,
      unidadmedida: d.unidadmedida || 'und',
      precio: d.precio,
      estado: 1,
      usuarioid: req.user.idusuario
    }));

    const { error: detallesError } = await supabase
      .from('detalle_cobro')
      .insert(detallesData);

    if (detallesError) {
      console.error('Error creando detalles:', detallesError);
    }

    // Crear notificación
    await supabase.from('notificacion').insert({
      usuarioid: req.user.idusuario,
      tipo: 'cobro_nuevo',
      titulo: 'Nuevo cobro creado',
      mensaje: `Se creó un cobro manual de Bs. ${total.toFixed(2)} para ${nombreCliente}`,
      referencia_tipo: 'cobro',
      referencia_id: cobro.idcobro,
      estado: 1
    });

    return getById({ params: { id: cobro.idcobro }, user: req.user }, res);

  } catch (error) {
    console.error('Create cobro error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Actualizar cobro manual
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombrecobro, telefono, observacion, imagen, detalles } = req.body;

    const supabase = getAdminConnection();

    // Verificar que el cobro existe y es manual
    const { data: cobro, error: checkError } = await supabase
      .from('cobros')
      .select('*')
      .eq('idcobro', id)
      .single();

    if (checkError || !cobro) {
      return errorResponse(res, 'Cobro no encontrado', 404);
    }

    if (cobro.origen !== 'manual') {
      return errorResponse(res, 'Solo se pueden editar cobros manuales', 400);
    }

    if (cobro.estado !== 1) {
      return errorResponse(res, 'Solo se pueden editar cobros pendientes', 400);
    }

    // Preparar datos de actualización
    const updateData = {};
    if (nombrecobro !== undefined) updateData.nombrecobro = nombrecobro;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (observacion !== undefined) updateData.observacion = observacion;
    if (imagen !== undefined) updateData.imagen = imagen;

    // Si se proporcionan nuevos detalles, recalcular total
    if (detalles && detalles.length > 0) {
      updateData.total = detalles.reduce((sum, d) => sum + (d.cantidad * d.precio), 0);

      // Eliminar detalles anteriores
      await supabase
        .from('detalle_cobro')
        .delete()
        .eq('cobroid', id);

      // Crear nuevos detalles
      const detallesData = detalles.map(d => ({
        cobroid: Number(id),
        nombreproducto: d.nombreproducto,
        cantidad: d.cantidad,
        peso: d.peso || d.cantidad,
        unidadmedida: d.unidadmedida || 'und',
        precio: d.precio,
        estado: 1,
        usuarioid: req.user.idusuario
      }));

      await supabase.from('detalle_cobro').insert(detallesData);
    }

    // Actualizar cobro
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('cobros')
        .update(updateData)
        .eq('idcobro', id);

      if (updateError) {
        console.error('Error actualizando cobro:', updateError);
        return errorResponse(res, 'Error al actualizar cobro', 500);
      }
    }

    return getById({ params: { id }, user: req.user }, res);

  } catch (error) {
    console.error('Update cobro error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Marcar cobro como pagado
const marcarPagado = async (req, res) => {
  try {
    const { id } = req.params;
    const { metodo_pago = 1, observacion } = req.body;

    const supabase = getAdminConnection();

    // Verificar que el cobro existe y está pendiente
    const { data: cobro, error: checkError } = await supabase
      .from('cobros')
      .select('*')
      .eq('idcobro', id)
      .single();

    if (checkError || !cobro) {
      return errorResponse(res, 'Cobro no encontrado', 404);
    }

    if (cobro.estado !== 1) {
      return errorResponse(res, 'El cobro no está pendiente', 400);
    }

    const fechaPago = new Date().toISOString();

    // Actualizar estado del cobro
    const { error: updateError } = await supabase
      .from('cobros')
      .update({ 
        estado: 2, // Pagado
        fechapago: fechaPago
      })
      .eq('idcobro', id);

    if (updateError) {
      console.error('Error actualizando cobro:', updateError);
      return errorResponse(res, 'Error al marcar como pagado', 500);
    }

    // Crear registro en historial de pagos
    await supabase.from('historial_pago_cobro').insert({
      cobroid: Number(id),
      monto_pagado: cobro.total,
      metodo_pago: Number(metodo_pago),
      observacion,
      usuarioid: req.user.idusuario,
      fechapago: fechaPago
    });

    // Crear notificación
    await supabase.from('notificacion').insert({
      usuarioid: req.user.idusuario,
      tipo: 'cobro_pagado',
      titulo: 'Cobro pagado',
      mensaje: `El cobro de Bs. ${cobro.total.toFixed(2)} de ${cobro.nombrecobro} fue pagado`,
      referencia_tipo: 'cobro',
      referencia_id: Number(id),
      estado: 1
    });

    return getById({ params: { id }, user: req.user }, res);

  } catch (error) {
    console.error('Marcar pagado error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Anular cobro
const anular = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    // Verificar que el cobro existe y está pendiente
    const { data: cobro, error: checkError } = await supabase
      .from('cobros')
      .select('*')
      .eq('idcobro', id)
      .single();

    if (checkError || !cobro) {
      return errorResponse(res, 'Cobro no encontrado', 404);
    }

    if (cobro.estado !== 1) {
      return errorResponse(res, 'Solo se pueden anular cobros pendientes', 400);
    }

    // Anular cobro
    const { error: anularError } = await supabase
      .from('cobros')
      .update({ estado: 3 }) // 3 = anulado
      .eq('idcobro', id);

    if (anularError) {
      console.error('Error anulando cobro:', anularError);
      return errorResponse(res, 'Error al anular cobro', 500);
    }

    // Si viene de una venta, anular también la venta
    if (cobro.ventaid) {
      await supabase
        .from('venta')
        .update({ estado: 0 })
        .eq('idventa', cobro.ventaid);
    }

    return successResponse(res, null, 'Cobro anulado exitosamente');

  } catch (error) {
    console.error('Anular cobro error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Obtener resumen de cobros
const getResumen = async (req, res) => {
  try {
    const supabase = getAdminConnection();

    const { data: cobros, error } = await supabase
      .from('cobros')
      .select('total, estado')
      .neq('estado', 3); // Excluir anulados

    if (error) {
      console.error('Error obteniendo resumen:', error);
      return errorResponse(res, 'Error al obtener resumen', 500);
    }

    const resumen = {
      totalCobros: cobros.length,
      cobrosPendientes: cobros.filter(c => c.estado === 1).length,
      cobrosPagados: cobros.filter(c => c.estado === 2).length,
      totalPendiente: cobros.filter(c => c.estado === 1).reduce((sum, c) => sum + Number(c.total), 0),
      totalCobrado: cobros.filter(c => c.estado === 2).reduce((sum, c) => sum + Number(c.total), 0)
    };

    return successResponse(res, resumen);

  } catch (error) {
    console.error('Get resumen cobros error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  marcarPagado,
  anular,
  getResumen
};
