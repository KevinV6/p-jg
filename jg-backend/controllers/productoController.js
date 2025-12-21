const { getAdminConnection } = require('../config/database');
const { uploadImage, deleteImage, replaceImage } = require('../config/storage');
const { 
  successResponse, 
  errorResponse,
  validateRequired,
  paginate,
  paginatedResponse
} = require('../utils/helpers');

// Obtener todos los productos
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, categoria, search, estado = 1 } = req.query;
    const { offset, limit: limitNum } = paginate(Number(page), Number(limit));
    
    const supabase = getAdminConnection();
    
    let query = supabase
      .from('producto')
      .select(`
        *,
        categoria:categoriaid(idcategoria, nombrecategoria),
        unidades:producto_unidad(
          idproductounidad,
          precio,
          estado,
          unidad:unidadid(idunidad, nombre, abreviatura, es_peso)
        ),
        variantes:variante(
          idvariante,
          nombrevariante,
          estado,
          opciones:opcionvariante(
            idopcionvariante,
            nombreopcionvariante,
            imagenvariante,
            estado
          )
        )
      `, { count: 'exact' })
      .eq('estado', estado)
      .order('nombreproducto');

    // Filtro por categoría
    if (categoria) {
      query = query.eq('categoriaid', categoria);
    }

    // Búsqueda
    if (search) {
      query = query.or(`nombreproducto.ilike.%${search}%,descripcion.ilike.%${search}%`);
    }

    // Paginación
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error obteniendo productos:', error);
      return errorResponse(res, 'Error al obtener productos', 500);
    }

    // Filtrar unidades y variantes activas
    const productos = data.map(p => ({
      ...p,
      unidades: p.unidades?.filter(u => u.estado === 1) || [],
      variantes: p.variantes?.filter(v => v.estado === 1).map(v => ({
        ...v,
        opciones: v.opciones?.filter(o => o.estado === 1) || []
      })) || []
    }));

    return paginatedResponse(res, productos, count, Number(page), limitNum, 'Productos obtenidos');

  } catch (error) {
    console.error('Get all products error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Obtener producto por ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    const { data, error } = await supabase
      .from('producto')
      .select(`
        *,
        categoria:categoriaid(idcategoria, nombrecategoria),
        unidades:producto_unidad(
          idproductounidad,
          precio,
          estado,
          unidad:unidadid(idunidad, nombre, abreviatura, es_peso)
        ),
        variantes:variante(
          idvariante,
          nombrevariante,
          estado,
          opciones:opcionvariante(
            idopcionvariante,
            nombreopcionvariante,
            imagenvariante,
            estado,
            precios:precio_variante(
              idpreciovariante,
              productounidadid,
              precio
            )
          )
        )
      `)
      .eq('idproducto', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Producto no encontrado', 404);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Get product by id error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Crear producto
const create = async (req, res) => {
  try {
    const { 
      nombreproducto, 
      descripcion, 
      categoriaid, 
      imagen,
      unidades = [],
      variantes = []
    } = req.body;

    // Validar campos requeridos
    const validation = validateRequired(
      { nombreproducto, categoriaid },
      ['nombreproducto', 'categoriaid']
    );
    
    if (!validation.valid) {
      return errorResponse(res, `Campos requeridos: ${validation.missing.join(', ')}`, 400);
    }

    if (unidades.length === 0) {
      return errorResponse(res, 'Debe agregar al menos una unidad de medida con precio', 400);
    }

    const supabase = getAdminConnection();

    // Crear producto
    const { data: producto, error } = await supabase
      .from('producto')
      .insert({
        nombreproducto,
        descripcion,
        categoriaid: Number(categoriaid),
        imagen: imagen || '',
        estado: 1
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando producto:', error);
      return errorResponse(res, 'Error al crear producto', 500);
    }

    // Crear unidades de medida
    if (unidades.length > 0) {
      const unidadesData = unidades.map(u => ({
        productoid: producto.idproducto,
        unidadid: u.unidadid,
        precio: u.precio,
        estado: 1
      }));

      const { error: unidadesError } = await supabase
        .from('producto_unidad')
        .insert(unidadesData);

      if (unidadesError) {
        console.error('Error creando unidades:', unidadesError);
      }
    }

    // Crear variantes si existen
    if (variantes.length > 0) {
      for (const variante of variantes) {
        // Normalizar nombre: trim espacios al inicio y final
        const nombreVarianteNormalizado = variante.nombre.trim();
        
        // Buscar si ya existe una variante con el mismo nombre para este producto
        let varianteId = null;
        const { data: existingVariante } = await supabase
          .from('variante')
          .select('idvariante')
          .eq('productoid', producto.idproducto)
          .ilike('nombrevariante', nombreVarianteNormalizado)
          .eq('estado', 1)
          .single();

        if (existingVariante) {
          varianteId = existingVariante.idvariante;
          console.log(`[Producto] Reutilizando variante existente: ${nombreVarianteNormalizado} (ID: ${varianteId})`);
        } else {
          // Crear nueva variante
          const { data: newVariante, error: varianteError } = await supabase
            .from('variante')
            .insert({
              nombrevariante: nombreVarianteNormalizado,
              productoid: producto.idproducto,
              estado: 1
            })
            .select()
            .single();

          if (varianteError) {
            console.error('Error creando variante:', varianteError);
            continue;
          }
          varianteId = newVariante.idvariante;
          console.log(`[Producto] Nueva variante creada: ${nombreVarianteNormalizado} (ID: ${varianteId})`);
        }

        // Crear opciones de variante
        if (variante.opciones && variante.opciones.length > 0) {
          for (const opcion of variante.opciones) {
            // Normalizar nombre de opción
            const nombreOpcionNormalizado = opcion.nombre.trim();
            
            // Verificar si ya existe la opción para esta variante
            const { data: existingOpcion } = await supabase
              .from('opcionvariante')
              .select('idopcionvariante')
              .eq('varianteid', varianteId)
              .ilike('nombreopcionvariante', nombreOpcionNormalizado)
              .eq('estado', 1)
              .single();

            if (existingOpcion) {
              // Actualizar imagen si es necesario
              if (opcion.imagen) {
                await supabase
                  .from('opcionvariante')
                  .update({ imagenvariante: opcion.imagen })
                  .eq('idopcionvariante', existingOpcion.idopcionvariante);
              }
              console.log(`[Producto] Opción existente actualizada: ${nombreOpcionNormalizado}`);
              continue;
            }

            const { data: newOpcion, error: opcionError } = await supabase
              .from('opcionvariante')
              .insert({
                nombreopcionvariante: nombreOpcionNormalizado,
                varianteid: varianteId,
                imagenvariante: opcion.imagen || '',
                estado: 1
              })
              .select()
              .single();

            if (opcionError) {
              console.error('Error creando opción:', opcionError);
              continue;
            }

            // Crear precios por variante si existen
            if (opcion.precios && opcion.precios.length > 0) {
              const preciosData = opcion.precios.map(p => ({
                productounidadid: p.productounidadid,
                opcionvarianteid: newOpcion.idopcionvariante,
                precio: p.precio
              }));

              await supabase.from('precio_variante').insert(preciosData);
            }
          }
        }
      }
    }

    // Obtener producto completo
    return getById({ params: { id: producto.idproducto } }, res);

  } catch (error) {
    console.error('Create product error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Actualizar producto
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombreproducto, 
      descripcion, 
      categoriaid, 
      imagen,
      unidades = [],
      variantes = []
    } = req.body;

    const supabase = getAdminConnection();

    // Verificar que el producto existe
    const { data: existingProduct, error: checkError } = await supabase
      .from('producto')
      .select('idproducto, imagen')
      .eq('idproducto', id)
      .eq('estado', 1)
      .single();

    if (checkError || !existingProduct) {
      return errorResponse(res, 'Producto no encontrado', 404);
    }

    // Actualizar producto
    const updateData = {};
    if (nombreproducto !== undefined) updateData.nombreproducto = nombreproducto;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (categoriaid !== undefined) updateData.categoriaid = Number(categoriaid);
    if (imagen !== undefined) updateData.imagen = imagen;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('producto')
        .update(updateData)
        .eq('idproducto', id);

      if (updateError) {
        console.error('Error actualizando producto:', updateError);
        return errorResponse(res, 'Error al actualizar producto', 500);
      }
    }

    // Actualizar unidades si se proporcionan
    if (unidades.length > 0) {
      // Desactivar unidades existentes
      await supabase
        .from('producto_unidad')
        .update({ estado: 0 })
        .eq('productoid', id);

      // Crear/reactivar unidades
      for (const unidad of unidades) {
        const { data: existingUnidad } = await supabase
          .from('producto_unidad')
          .select('idproductounidad')
          .eq('productoid', id)
          .eq('unidadid', unidad.unidadid)
          .single();

        if (existingUnidad) {
          await supabase
            .from('producto_unidad')
            .update({ precio: unidad.precio, estado: 1 })
            .eq('idproductounidad', existingUnidad.idproductounidad);
        } else {
          await supabase
            .from('producto_unidad')
            .insert({
              productoid: Number(id),
              unidadid: unidad.unidadid,
              precio: unidad.precio,
              estado: 1
            });
        }
      }
    }

    // Obtener producto actualizado
    return getById({ params: { id } }, res);

  } catch (error) {
    console.error('Update product error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Eliminar producto (soft delete)
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAdminConnection();

    const { error } = await supabase
      .from('producto')
      .update({ estado: 0 })
      .eq('idproducto', id);

    if (error) {
      console.error('Error eliminando producto:', error);
      return errorResponse(res, 'Error al eliminar producto', 500);
    }

    return successResponse(res, null, 'Producto eliminado');

  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Subir imagen de producto (sin asociar a un producto específico)
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No se proporcionó imagen', 400);
    }

    const result = await uploadImage(req.file, 'productos');
    return successResponse(res, result, 'Imagen subida exitosamente');

  } catch (error) {
    console.error('Upload image error:', error);
    return errorResponse(res, error.message || 'Error al subir imagen', 500);
  }
};

// Subir imagen de variante
const uploadVarianteImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No se proporcionó imagen', 400);
    }

    const result = await uploadImage(req.file, 'variantes');
    return successResponse(res, result, 'Imagen de variante subida exitosamente');

  } catch (error) {
    console.error('Upload variante image error:', error);
    return errorResponse(res, error.message || 'Error al subir imagen de variante', 500);
  }
};

// Actualizar imagen de producto existente
const updateProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return errorResponse(res, 'No se proporcionó imagen', 400);
    }

    const supabase = getAdminConnection();
    
    // Obtener imagen actual
    const { data: producto } = await supabase
      .from('producto')
      .select('imagen')
      .eq('idproducto', id)
      .single();

    // Subir nueva imagen (y eliminar la anterior si existe)
    const result = await replaceImage(req.file, 'productos', producto?.imagen);
    
    // Actualizar referencia en producto
    await supabase
      .from('producto')
      .update({ imagen: result.url })
      .eq('idproducto', id);

    return successResponse(res, result, 'Imagen actualizada exitosamente');

  } catch (error) {
    console.error('Update image error:', error);
    return errorResponse(res, error.message || 'Error al actualizar imagen', 500);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  uploadProductImage,
  uploadVarianteImage,
  updateProductImage
};
