const { getAdminConnection } = require('../config/database');
const { uploadImage, deleteImage } = require('../config/storage');
const { successResponse, errorResponse } = require('../utils/helpers');

// Obtener configuración
const getConfig = async (req, res) => {
  try {
    const supabase = getAdminConnection();

    const { data, error } = await supabase
      .from('configuracion_empresa')
      .select('*')
      .eq('estado', 1)
      .single();

    if (error || !data) {
      // Si no existe, crear configuración por defecto
      const { data: newConfig, error: createError } = await supabase
        .from('configuracion_empresa')
        .insert({
          nombre_empresa: 'Mi Empresa',
          direccion: '',
          telefono: '',
          logo: '',
          moneda: 'Bs',
          mensaje_comprobante: 'Este documento no es válido como factura fiscal.',
          estado: 1
        })
        .select()
        .single();

      if (createError) {
        return errorResponse(res, 'Error al obtener configuración', 500);
      }

      return successResponse(res, newConfig);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get config error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Actualizar configuración
const updateConfig = async (req, res) => {
  try {
    const { nombre_empresa, direccion, telefono, logo, moneda, mensaje_comprobante } = req.body;

    const supabase = getAdminConnection();

    // Obtener config actual
    const { data: currentConfig } = await supabase
      .from('configuracion_empresa')
      .select('idconfig')
      .eq('estado', 1)
      .single();

    const updateData = {};
    if (nombre_empresa !== undefined) updateData.nombre_empresa = nombre_empresa;
    if (direccion !== undefined) updateData.direccion = direccion;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (logo !== undefined) updateData.logo = logo;
    if (moneda !== undefined) updateData.moneda = moneda;
    if (mensaje_comprobante !== undefined) updateData.mensaje_comprobante = mensaje_comprobante;

    let data;
    if (currentConfig) {
      const { data: updated, error } = await supabase
        .from('configuracion_empresa')
        .update(updateData)
        .eq('idconfig', currentConfig.idconfig)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando config:', error);
        return errorResponse(res, 'Error al actualizar configuración', 500);
      }
      data = updated;
    } else {
      const { data: created, error } = await supabase
        .from('configuracion_empresa')
        .insert({
          ...updateData,
          estado: 1
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando config:', error);
        return errorResponse(res, 'Error al crear configuración', 500);
      }
      data = created;
    }

    return successResponse(res, data, 'Configuración actualizada');

  } catch (error) {
    console.error('Update config error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Subir logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No se proporcionó imagen', 400);
    }

    const supabase = getAdminConnection();

    // Obtener logo actual para eliminarlo
    const { data: currentConfig } = await supabase
      .from('configuracion_empresa')
      .select('logo')
      .eq('estado', 1)
      .single();

    // Subir nuevo logo
    const result = await uploadImage(req.file, 'usuarios'); // Usamos carpeta usuarios para logos

    // Eliminar logo anterior si existe
    if (currentConfig?.logo) {
      await deleteImage(currentConfig.logo).catch(err => {
        console.error('Error eliminando logo anterior:', err);
      });
    }

    // Actualizar config con nuevo logo
    await supabase
      .from('configuracion_empresa')
      .update({ logo: result.url })
      .eq('estado', 1);

    return successResponse(res, result, 'Logo actualizado');

  } catch (error) {
    console.error('Upload logo error:', error);
    return errorResponse(res, error.message || 'Error al subir logo', 500);
  }
};

// Obtener dashboard resumen
const getDashboard = async (req, res) => {
  try {
    const supabase = getAdminConnection();

    // Usar la vista de resumen
    const { data, error } = await supabase
      .from('v_resumen_dashboard')
      .select('*')
      .single();

    if (error) {
      console.error('Error obteniendo dashboard:', error);
      
      // Fallback: calcular manualmente
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [ventas, cobros, pedidos, productos, clientes] = await Promise.all([
        supabase.from('venta').select('total').eq('estado', 1),
        supabase.from('cobros').select('total, estado'),
        supabase.from('pedido').select('idpedido'),
        supabase.from('producto').select('idproducto').eq('estado', 1),
        supabase.from('cliente').select('idcliente').eq('estado', 1).eq('es_generico', false)
      ]);

      const ventasHoy = ventas.data?.filter(v => {
        const fecha = new Date(v.fecha);
        return fecha >= today && fecha <= todayEnd;
      }) || [];

      const dashboard = {
        ventas_hoy: ventasHoy.length,
        total_ventas_hoy: ventasHoy.reduce((sum, v) => sum + Number(v.total), 0),
        total_ventas: ventas.data?.length || 0,
        total_ingresos: ventas.data?.reduce((sum, v) => sum + Number(v.total), 0) || 0,
        cobros_pendientes: cobros.data?.filter(c => c.estado === 1).length || 0,
        total_cobros_pendientes: cobros.data?.filter(c => c.estado === 1).reduce((sum, c) => sum + Number(c.total), 0) || 0,
        pedidos_pendientes: pedidos.data?.length || 0,
        total_productos: productos.data?.length || 0,
        total_clientes: clientes.data?.length || 0
      };

      return successResponse(res, dashboard);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get dashboard error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Obtener notificaciones
const getNotificaciones = async (req, res) => {
  try {
    const { leidas = false, limit = 20 } = req.query;
    const supabase = getAdminConnection();

    let query = supabase
      .from('notificacion')
      .select('*')
      .eq('usuarioid', req.user.idusuario)
      .eq('estado', 1)
      .order('fechacreacion', { ascending: false })
      .limit(Number(limit));

    if (leidas !== 'true') {
      query = query.eq('leida', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo notificaciones:', error);
      return errorResponse(res, 'Error al obtener notificaciones', 500);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get notificaciones error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Marcar notificación como leída
const marcarNotificacionLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    const { error } = await supabase
      .from('notificacion')
      .update({ leida: true })
      .eq('idnotificacion', id)
      .eq('usuarioid', req.user.idusuario);

    if (error) {
      console.error('Error marcando notificación:', error);
      return errorResponse(res, 'Error al marcar notificación', 500);
    }

    return successResponse(res, null, 'Notificación marcada como leída');

  } catch (error) {
    console.error('Marcar notificacion error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Marcar todas las notificaciones como leídas
const marcarTodasLeidas = async (req, res) => {
  try {
    const supabase = getAdminConnection();

    const { error } = await supabase
      .from('notificacion')
      .update({ leida: true })
      .eq('usuarioid', req.user.idusuario)
      .eq('leida', false);

    if (error) {
      console.error('Error marcando notificaciones:', error);
      return errorResponse(res, 'Error al marcar notificaciones', 500);
    }

    return successResponse(res, null, 'Todas las notificaciones marcadas como leídas');

  } catch (error) {
    console.error('Marcar todas leidas error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

module.exports = {
  getConfig,
  updateConfig,
  uploadLogo,
  getDashboard,
  getNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas
};
