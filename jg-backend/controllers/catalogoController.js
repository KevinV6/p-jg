const { getAdminConnection } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Obtener todas las categorías
const getAllCategorias = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;
    const supabase = getAdminConnection();

    let query = supabase
      .from('categoria')
      .select('*')
      .order('orden')
      .order('nombrecategoria');

    if (includeInactive !== 'true') {
      query = query.eq('estado', 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo categorías:', error);
      return errorResponse(res, 'Error al obtener categorías', 500);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get categorias error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Crear categoría
const createCategoria = async (req, res) => {
  try {
    const { nombrecategoria, descripcion, orden } = req.body;

    if (!nombrecategoria) {
      return errorResponse(res, 'Nombre de categoría requerido', 400);
    }

    const supabase = getAdminConnection();

    const { data, error } = await supabase
      .from('categoria')
      .insert({
        nombrecategoria,
        descripcion,
        orden: orden || 0,
        estado: 1
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando categoría:', error);
      return errorResponse(res, 'Error al crear categoría', 500);
    }

    return successResponse(res, data, 'Categoría creada', 201);

  } catch (error) {
    console.error('Create categoria error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Actualizar categoría
const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombrecategoria, descripcion, orden, estado } = req.body;

    const supabase = getAdminConnection();

    const updateData = {};
    if (nombrecategoria !== undefined) updateData.nombrecategoria = nombrecategoria;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (orden !== undefined) updateData.orden = orden;
    if (estado !== undefined) updateData.estado = estado;

    const { data, error } = await supabase
      .from('categoria')
      .update(updateData)
      .eq('idcategoria', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando categoría:', error);
      return errorResponse(res, 'Error al actualizar categoría', 500);
    }

    return successResponse(res, data, 'Categoría actualizada');

  } catch (error) {
    console.error('Update categoria error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Eliminar categoría (soft delete)
const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    // Verificar si hay productos con esta categoría
    const { data: productos } = await supabase
      .from('producto')
      .select('idproducto')
      .eq('categoriaid', id)
      .eq('estado', 1)
      .limit(1);

    if (productos && productos.length > 0) {
      return errorResponse(res, 'No se puede eliminar una categoría con productos activos', 400);
    }

    const { error } = await supabase
      .from('categoria')
      .update({ estado: 0 })
      .eq('idcategoria', id);

    if (error) {
      console.error('Error eliminando categoría:', error);
      return errorResponse(res, 'Error al eliminar categoría', 500);
    }

    return successResponse(res, null, 'Categoría eliminada');

  } catch (error) {
    console.error('Delete categoria error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Obtener todas las unidades de medida
const getAllUnidades = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;
    const supabase = getAdminConnection();

    let query = supabase
      .from('unidad_medida')
      .select('*')
      .order('nombre');

    if (includeInactive !== 'true') {
      query = query.eq('estado', 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo unidades:', error);
      return errorResponse(res, 'Error al obtener unidades', 500);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get unidades error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Crear unidad de medida
const createUnidad = async (req, res) => {
  try {
    const { nombre, abreviatura, es_peso } = req.body;

    if (!nombre || !abreviatura) {
      return errorResponse(res, 'Nombre y abreviatura requeridos', 400);
    }

    const supabase = getAdminConnection();

    const { data, error } = await supabase
      .from('unidad_medida')
      .insert({
        nombre,
        abreviatura,
        es_peso: es_peso || false,
        estado: 1
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando unidad:', error);
      return errorResponse(res, 'Error al crear unidad', 500);
    }

    return successResponse(res, data, 'Unidad creada', 201);

  } catch (error) {
    console.error('Create unidad error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Actualizar unidad de medida
const updateUnidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, abreviatura, es_peso, estado } = req.body;

    const supabase = getAdminConnection();

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (abreviatura !== undefined) updateData.abreviatura = abreviatura;
    if (es_peso !== undefined) updateData.es_peso = es_peso;
    if (estado !== undefined) updateData.estado = estado;

    const { data, error } = await supabase
      .from('unidad_medida')
      .update(updateData)
      .eq('idunidad', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando unidad:', error);
      return errorResponse(res, 'Error al actualizar unidad', 500);
    }

    return successResponse(res, data, 'Unidad actualizada');

  } catch (error) {
    console.error('Update unidad error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Eliminar unidad (soft delete)
const deleteUnidad = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    // Verificar si está en uso
    const { data: productos } = await supabase
      .from('producto_unidad')
      .select('idproductounidad')
      .eq('unidadid', id)
      .eq('estado', 1)
      .limit(1);

    if (productos && productos.length > 0) {
      return errorResponse(res, 'No se puede eliminar una unidad en uso', 400);
    }

    const { error } = await supabase
      .from('unidad_medida')
      .update({ estado: 0 })
      .eq('idunidad', id);

    if (error) {
      console.error('Error eliminando unidad:', error);
      return errorResponse(res, 'Error al eliminar unidad', 500);
    }

    return successResponse(res, null, 'Unidad eliminada');

  } catch (error) {
    console.error('Delete unidad error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

module.exports = {
  getAllCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getAllUnidades,
  createUnidad,
  updateUnidad,
  deleteUnidad
};
