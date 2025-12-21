const { getAdminConnection } = require('../config/database');
const { 
  successResponse, 
  errorResponse,
  validateRequired,
  paginate,
  paginatedResponse
} = require('../utils/helpers');

// Obtener todas las ventas
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, fecha, tipo_pago, clienteid } = req.query;
    const { offset, limit: limitNum } = paginate(Number(page), Number(limit));
    
    const supabase = getAdminConnection();
    
    let query = supabase
      .from('venta')
      .select(`
        *,
        cliente:clienteid(idcliente, nombrecliente, ci_nit, telefono),
        usuario:usuarioid(idusuario, primernombre, apellidopaterno),
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
          producto:productoid(idproducto, nombreproducto, imagen),
          productounidad:productounidadid(
            idproductounidad,
            precio,
            unidad:unidadid(idunidad, nombre, abreviatura)
          ),
          opcionvariante:opcionvarianteid(
            idopcionvariante, 
            nombreopcionvariante,
            imagenvariante,
            variante:varianteid(idvariante, nombrevariante)
          )
        )
      `, { count: 'exact' })
      .eq('estado', 1)
      .order('fecha', { ascending: false });

    // Filtro por fecha
    if (fecha) {
      const startDate = new Date(fecha);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(fecha);
      endDate.setHours(23, 59, 59, 999);
      
      query = query
        .gte('fecha', startDate.toISOString())
        .lte('fecha', endDate.toISOString());
    }

    // Filtro por tipo de pago
    if (tipo_pago) {
      query = query.eq('tipo_pago', tipo_pago);
    }

    // Filtro por cliente
    if (clienteid) {
      query = query.eq('clienteid', clienteid);
    }

    // Paginación
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error obteniendo ventas:', error);
      return errorResponse(res, 'Error al obtener ventas', 500);
    }

    return paginatedResponse(res, data, count, Number(page), limitNum, 'Ventas obtenidas');

  } catch (error) {
    console.error('Get all sales error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Obtener venta por ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    const { data, error } = await supabase
      .from('venta')
      .select(`
        *,
        cliente:clienteid(idcliente, nombrecliente, ci_nit, telefono, direccion),
        usuario:usuarioid(idusuario, primernombre, apellidopaterno),
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
          producto:productoid(idproducto, nombreproducto, imagen),
          productounidad:productounidadid(
            idproductounidad,
            precio,
            unidad:unidadid(idunidad, nombre, abreviatura)
          ),
          opcionvariante:opcionvarianteid(
            idopcionvariante, 
            nombreopcionvariante, 
            imagenvariante,
            variante:varianteid(idvariante, nombrevariante)
          )
        )
      `)
      .eq('idventa', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Venta no encontrada', 404);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get sale by id error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Obtener venta por folio
const getByFolio = async (req, res) => {
  try {
    const { folio } = req.params;
    const supabase = getAdminConnection();

    const { data, error } = await supabase
      .from('venta')
      .select(`
        *,
        cliente:clienteid(idcliente, nombrecliente, ci_nit, telefono, direccion),
        usuario:usuarioid(idusuario, primernombre, apellidopaterno),
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
          producto:productoid(idproducto, nombreproducto, imagen),
          productounidad:productounidadid(
            idproductounidad,
            precio,
            unidad:unidadid(idunidad, nombre, abreviatura)
          ),
          opcionvariante:opcionvarianteid(
            idopcionvariante, 
            nombreopcionvariante,
            imagenvariante,
            variante:varianteid(idvariante, nombrevariante)
          )
        )
      `)
      .eq('folio', folio)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Venta no encontrada', 404);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get sale by folio error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Crear venta
const create = async (req, res) => {
  try {
    console.log('=== INICIO CREAR VENTA ===');
    console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('Usuario:', req.user?.idusuario);

    const { 
      clienteid,
      tipo_pago = 'contado',
      total,
      fecha, // Fecha desde el cliente
      detalle = []
    } = req.body;

    // Log de datos extraídos
    console.log('Datos extraídos:', { clienteid, tipo_pago, total, fecha, detalleCount: detalle.length });

    // Validar campos requeridos
    if (!clienteid) {
      console.log('ERROR: clienteid no proporcionado');
      return errorResponse(res, 'El cliente es requerido', 400);
    }

    if (detalle.length === 0) {
      console.log('ERROR: No hay productos en el detalle');
      return errorResponse(res, 'Debe agregar al menos un producto', 400);
    }

    const supabase = getAdminConnection();

    // Verificar que el cliente existe
    console.log('Verificando cliente:', clienteid);
    const { data: cliente, error: clienteError } = await supabase
      .from('cliente')
      .select('idcliente, nombrecliente, es_generico')
      .eq('idcliente', clienteid)
      .single();

    if (clienteError || !cliente) {
      console.log('ERROR: Cliente no encontrado', clienteError);
      return errorResponse(res, 'Cliente no encontrado', 404);
    }
    console.log('Cliente encontrado:', cliente);

    // Si es venta a crédito, verificar que no sea cliente genérico
    if (tipo_pago === 'credito' && cliente.es_generico) {
      console.log('ERROR: Venta a crédito con cliente genérico');
      return errorResponse(res, 'No se puede hacer venta a crédito al cliente "Cliente General". Debe registrar los datos del cliente.', 400);
    }

    // Calcular total si no viene
    const totalCalculado = total || detalle.reduce((sum, d) => sum + (d.subtotal || 0), 0);
    console.log('Total calculado:', totalCalculado);

    // Generar folio
    console.log('Generando folio...');
    const { data: folioData, error: folioError } = await supabase
      .rpc('generar_folio_venta');

    let folio;
    if (folioError) {
      console.log('Error generando folio con RPC, generando manual:', folioError);
      // Generar folio manual si no existe la función RPC
      const fecha = new Date();
      folio = `V${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;
    } else {
      folio = folioData;
    }
    console.log('Folio generado:', folio);

    // Crear venta
    const ventaData = {
      fecha: fecha ? new Date(fecha).toISOString() : new Date().toISOString(), // Usar fecha del cliente o servidor
      clienteid: Number(clienteid),
      usuarioid: req.user.idusuario,
      total: totalCalculado,
      tipo_pago,
      folio,
      estado: 1
    };
    console.log('Datos de venta a insertar:', ventaData);

    const { data: venta, error: ventaError } = await supabase
      .from('venta')
      .insert(ventaData)
      .select()
      .single();

    if (ventaError) {
      console.error('ERROR creando venta:', ventaError);
      return errorResponse(res, `Error al crear venta: ${ventaError.message}`, 500);
    }
    console.log('Venta creada:', venta);

    // Crear detalles de venta
    console.log('Creando detalles de venta...');
    const detallesData = detalle.map((d, index) => {
      const detalleItem = {
        ventaid: venta.idventa,
        productoid: d.productoid,
        productounidadid: d.productounidadid || null,
        opcionvarianteid: d.opcionvarianteid || null,
        cantidad: d.cantidad,
        peso: 0, // Campo requerido
        unidadmedida: 'unidad', // Campo requerido
        precio_lista: d.precio,
        precio_aplicado: d.precio,
        descuento_manual: 0,
        subtotal: d.subtotal
      };
      console.log(`Detalle ${index + 1}:`, detalleItem);
      return detalleItem;
    });

    const { error: detallesError } = await supabase
      .from('detalle_venta')
      .insert(detallesData);

    if (detallesError) {
      console.error('ERROR creando detalles:', detallesError);
      // Revertir venta si falla
      await supabase.from('venta').delete().eq('idventa', venta.idventa);
      return errorResponse(res, `Error al crear detalles de venta: ${detallesError.message}`, 500);
    }
    console.log('Detalles creados exitosamente');

    // Si es venta a crédito, crear cobro automáticamente
    if (tipo_pago === 'credito') {
      console.log('Creando cobro para venta a crédito...');
      const cobroData = {
        clienteid: Number(clienteid),
        ventaid: venta.idventa,
        usuarioid: req.user.idusuario,
        origen: 'venta',
        total: totalCalculado,
        monto_pagado: 0,
        saldo: totalCalculado,
        fecha: new Date().toISOString(),
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        estado: 1
      };
      console.log('Datos de cobro:', cobroData);

      const { data: cobro, error: cobroError } = await supabase
        .from('cobros')
        .insert(cobroData)
        .select()
        .single();

      if (cobroError) {
        console.error('ERROR creando cobro:', cobroError);
        // No revertimos la venta, solo logueamos el error
      } else {
        console.log('Cobro creado:', cobro);
      }
    }

    // Obtener venta completa
    console.log('=== VENTA CREADA EXITOSAMENTE ===');
    return getById({ params: { id: venta.idventa }, user: req.user }, res);

  } catch (error) {
    console.error('=== ERROR GENERAL EN CREATE ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Anular venta
const anular = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    // Verificar que la venta existe
    const { data: venta, error: checkError } = await supabase
      .from('venta')
      .select('idventa, estado, tipo_pago')
      .eq('idventa', id)
      .single();

    if (checkError || !venta) {
      return errorResponse(res, 'Venta no encontrada', 404);
    }

    if (venta.estado === 0) {
      return errorResponse(res, 'La venta ya está anulada', 400);
    }

    // Anular venta
    const { error: anularError } = await supabase
      .from('venta')
      .update({ estado: 0 })
      .eq('idventa', id);

    if (anularError) {
      console.error('Error anulando venta:', anularError);
      return errorResponse(res, 'Error al anular venta', 500);
    }

    // Si era venta a crédito, anular también el cobro
    if (venta.tipo_pago === 'credito') {
      const { data: cobro } = await supabase
        .from('cobros')
        .select('idcobro, estado')
        .eq('ventaid', id)
        .single();

      if (cobro && cobro.estado === 1) {
        await supabase
          .from('cobros')
          .update({ estado: 0 }) // 0 = anulado
          .eq('idcobro', cobro.idcobro);
      }
    }

    return successResponse(res, null, 'Venta anulada exitosamente');

  } catch (error) {
    console.error('Anular sale error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Obtener resumen de ventas
const getResumen = async (req, res) => {
  try {
    const { periodo = 'hoy' } = req.query;
    const supabase = getAdminConnection();

    let startDate, endDate;
    const now = new Date();

    switch (periodo) {
      case 'hoy':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'semana':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case 'mes':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(0);
        endDate = new Date();
    }

    const { data, error } = await supabase
      .from('venta')
      .select('total, tipo_pago')
      .eq('estado', 1)
      .gte('fecha', startDate.toISOString())
      .lte('fecha', endDate.toISOString());

    if (error) {
      console.error('Error obteniendo resumen:', error);
      return errorResponse(res, 'Error al obtener resumen', 500);
    }

    const resumen = {
      totalVentas: data.length,
      totalIngresos: data.reduce((sum, v) => sum + Number(v.total), 0),
      ventasContado: data.filter(v => v.tipo_pago === 'contado').length,
      ventasCredito: data.filter(v => v.tipo_pago === 'credito').length,
      totalContado: data.filter(v => v.tipo_pago === 'contado').reduce((sum, v) => sum + Number(v.total), 0),
      totalCredito: data.filter(v => v.tipo_pago === 'credito').reduce((sum, v) => sum + Number(v.total), 0)
    };

    return successResponse(res, resumen);

  } catch (error) {
    console.error('Get resumen error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

module.exports = {
  getAll,
  getById,
  getByFolio,
  create,
  anular,
  getResumen
};
