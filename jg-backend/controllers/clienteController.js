const { getAdminConnection } = require('../config/database');
const { 
  successResponse, 
  errorResponse,
  validateRequired,
  paginate,
  paginatedResponse
} = require('../utils/helpers');

// Obtener todos los clientes
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, includeGenerico = false } = req.query;
    const { offset, limit: limitNum } = paginate(Number(page), Number(limit));
    
    const supabase = getAdminConnection();
    
    let query = supabase
      .from('cliente')
      .select('*', { count: 'exact' })
      .eq('estado', 1)
      .order('nombrecliente');

    // Excluir cliente genérico por defecto
    if (includeGenerico !== 'true' && includeGenerico !== true) {
      query = query.eq('es_generico', false);
    }

    // Búsqueda
    if (search) {
      query = query.or(`nombrecliente.ilike.%${search}%,ci_nit.ilike.%${search}%,telefono.ilike.%${search}%`);
    }

    // Paginación
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error obteniendo clientes:', error);
      return errorResponse(res, 'Error al obtener clientes', 500);
    }

    return paginatedResponse(res, data, count, Number(page), limitNum, 'Clientes obtenidos');

  } catch (error) {
    console.error('Get all clients error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Obtener cliente por ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('idcliente', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get client by id error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Obtener cliente genérico "Sin nombre"
const getGenerico = async (req, res) => {
  try {
    const supabase = getAdminConnection();

    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('es_generico', true)
      .single();

    if (error || !data) {
      // Si no existe, crearlo
      const { data: newGenerico, error: createError } = await supabase
        .from('cliente')
        .insert({
          nombrecliente: 'Cliente General',
          ci_nit: 'S/N',
          es_generico: true,
          estado: 1
        })
        .select()
        .single();

      if (createError) {
        return errorResponse(res, 'Error al obtener cliente genérico', 500);
      }

      return successResponse(res, newGenerico);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get generic client error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Buscar cliente por CI/NIT
const getByCiNit = async (req, res) => {
  try {
    const { ciNit } = req.params;
    const supabase = getAdminConnection();

    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('ci_nit', ciNit)
      .eq('estado', 1)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get client by CI/NIT error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Verificar si cliente tiene deuda pendiente
const checkDeuda = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    const { data, error } = await supabase
      .rpc('cliente_tiene_deuda', { p_clienteid: Number(id) });

    if (error) {
      console.error('Error verificando deuda:', error);
      return errorResponse(res, 'Error al verificar deuda', 500);
    }

    // Obtener monto de deuda si existe
    let montoDeuda = 0;
    if (data === true) {
      const { data: deuda } = await supabase
        .rpc('obtener_deuda_cliente', { p_clienteid: Number(id) });
      montoDeuda = deuda || 0;
    }

    return successResponse(res, {
      tieneDeuda: data,
      montoDeuda
    });

  } catch (error) {
    console.error('Check debt error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Crear cliente
const create = async (req, res) => {
  try {
    // Aceptar tanto 'nombre' como 'nombrecliente' para flexibilidad
    const { nombre, nombrecliente, ci_nit, telefono, direccion, email } = req.body;
    const clienteNombre = nombrecliente || nombre;

    // Validar campos requeridos
    if (!clienteNombre || !clienteNombre.trim()) {
      return errorResponse(res, 'El nombre del cliente es requerido', 400);
    }

    const supabase = getAdminConnection();

    // Verificar si CI/NIT ya existe (solo si no es S/N)
    if (ci_nit && ci_nit !== 'S/N') {
      const { data: existingClient } = await supabase
        .from('cliente')
        .select('idcliente, nombrecliente')
        .eq('ci_nit', ci_nit)
        .eq('estado', 1)
        .single();

      if (existingClient) {
        return errorResponse(res, `Ya existe un cliente con ese CI/NIT: ${existingClient.nombrecliente}`, 400);
      }
    }

    // Crear cliente
    const { data, error } = await supabase
      .from('cliente')
      .insert({
        nombrecliente: clienteNombre.trim(),
        ci_nit: ci_nit || 'S/N',
        telefono,
        direccion,
        email,
        es_generico: false,
        estado: 1,
        usuarioid: req.user?.idusuario
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando cliente:', error);
      return errorResponse(res, 'Error al crear cliente', 500);
    }

    return successResponse(res, data, 'Cliente creado exitosamente', 201);

  } catch (error) {
    console.error('Create client error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Actualizar cliente
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, nombrecliente, ci_nit, telefono, direccion, email } = req.body;
    const clienteNombre = nombrecliente || nombre;

    const supabase = getAdminConnection();

    // Verificar que el cliente existe y no es genérico
    const { data: existingClient, error: checkError } = await supabase
      .from('cliente')
      .select('*')
      .eq('idcliente', id)
      .eq('estado', 1)
      .single();

    if (checkError || !existingClient) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }

    if (existingClient.es_generico) {
      return errorResponse(res, 'No se puede modificar el cliente genérico', 400);
    }

    // Si se actualiza CI/NIT, verificar que no exista
    if (ci_nit && ci_nit !== existingClient.ci_nit && ci_nit !== 'S/N') {
      const { data: duplicateCi } = await supabase
        .from('cliente')
        .select('idcliente')
        .eq('ci_nit', ci_nit)
        .eq('estado', 1)
        .neq('idcliente', id)
        .single();

      if (duplicateCi) {
        return errorResponse(res, 'Ya existe un cliente con ese CI/NIT', 400);
      }
    }

    // Actualizar
    const updateData = {};
    if (clienteNombre !== undefined) updateData.nombrecliente = clienteNombre;
    if (ci_nit !== undefined) updateData.ci_nit = ci_nit;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (direccion !== undefined) updateData.direccion = direccion;
    if (email !== undefined) updateData.email = email;

    const { data, error } = await supabase
      .from('cliente')
      .update(updateData)
      .eq('idcliente', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando cliente:', error);
      return errorResponse(res, 'Error al actualizar cliente', 500);
    }

    return successResponse(res, data, 'Cliente actualizado');

  } catch (error) {
    console.error('Update client error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Eliminar cliente (soft delete)
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    // Verificar que no es genérico
    const { data: client } = await supabase
      .from('cliente')
      .select('es_generico')
      .eq('idcliente', id)
      .single();

    if (client?.es_generico) {
      return errorResponse(res, 'No se puede eliminar el cliente genérico', 400);
    }

    // Verificar que no tiene deudas pendientes
    const { data: tieneDeuda } = await supabase
      .rpc('cliente_tiene_deuda', { p_clienteid: Number(id) });

    if (tieneDeuda) {
      return errorResponse(res, 'No se puede eliminar un cliente con deudas pendientes', 400);
    }

    const { error } = await supabase
      .from('cliente')
      .update({ estado: 0 })
      .eq('idcliente', id);

    if (error) {
      console.error('Error eliminando cliente:', error);
      return errorResponse(res, 'Error al eliminar cliente', 500);
    }

    return successResponse(res, null, 'Cliente eliminado');

  } catch (error) {
    console.error('Delete client error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

module.exports = {
  getAll,
  getById,
  getGenerico,
  getByCiNit,
  checkDeuda,
  create,
  update,
  remove
};
