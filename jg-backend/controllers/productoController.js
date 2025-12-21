const { getAdminConnection } = require('../config/database');
const { uploadImage, deleteImage, replaceImage } = require('../config/storage');
const { 
  successResponse, 
  errorResponse,
  validateRequired,
  paginate,
  paginatedResponse
} = require('../utils/helpers');

// =====================================================
// FUNCIONES AUXILIARES PARA CATÁLOGO DE VARIANTES
// =====================================================

/**
 * Busca o crea una variante en el catálogo
 * @param {object} supabase - Conexión a Supabase
 * @param {string} nombreVariante - Nombre de la variante
 * @returns {number} ID de la variante en el catálogo
 */
const getOrCreateVarianteCatalogo = async (supabase, nombreVariante) => {
  const nombreNormalizado = nombreVariante.trim();
  
  // Buscar existente
  const { data: existing } = await supabase
    .from('variante_catalogo')
    .select('idvariantecatalogo')
    .ilike('nombrevariante', nombreNormalizado)
    .eq('estado', 1)
    .single();

  if (existing) {
    console.log(`[Catálogo] Variante existente: ${nombreNormalizado} (ID: ${existing.idvariantecatalogo})`);
    return existing.idvariantecatalogo;
  }

  // Crear nueva
  const { data: newVariante, error } = await supabase
    .from('variante_catalogo')
    .insert({ nombrevariante: nombreNormalizado, estado: 1 })
    .select('idvariantecatalogo')
    .single();

  if (error) {
    console.error('Error creando variante_catalogo:', error);
    throw error;
  }

  console.log(`[Catálogo] Nueva variante: ${nombreNormalizado} (ID: ${newVariante.idvariantecatalogo})`);
  return newVariante.idvariantecatalogo;
};

/**
 * Busca o crea una opción en el catálogo
 * @param {object} supabase - Conexión a Supabase
 * @param {string} nombreOpcion - Nombre de la opción
 * @param {number} varianteCatalogoId - ID de la variante en el catálogo
 * @returns {number} ID de la opción en el catálogo
 */
const getOrCreateOpcionCatalogo = async (supabase, nombreOpcion, varianteCatalogoId) => {
  const nombreNormalizado = nombreOpcion.trim();
  
  // Buscar existente
  const { data: existing } = await supabase
    .from('opcion_catalogo')
    .select('idopcioncatalogo')
    .ilike('nombreopcion', nombreNormalizado)
    .eq('variantecatalogoid', varianteCatalogoId)
    .eq('estado', 1)
    .single();

  if (existing) {
    console.log(`[Catálogo] Opción existente: ${nombreNormalizado} (ID: ${existing.idopcioncatalogo})`);
    return existing.idopcioncatalogo;
  }

  // Crear nueva
  const { data: newOpcion, error } = await supabase
    .from('opcion_catalogo')
    .insert({ 
      nombreopcion: nombreNormalizado, 
      variantecatalogoid: varianteCatalogoId,
      estado: 1 
    })
    .select('idopcioncatalogo')
    .single();

  if (error) {
    console.error('Error creando opcion_catalogo:', error);
    throw error;
  }

  console.log(`[Catálogo] Nueva opción: ${nombreNormalizado} (ID: ${newOpcion.idopcioncatalogo})`);
  return newOpcion.idopcioncatalogo;
};

// =====================================================
// CONTROLADORES DE PRODUCTO
// =====================================================

// Obtener todos los productos
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, categoria, search, estado = 1 } = req.query;
    const { offset, limit: limitNum } = paginate(Number(page), Number(limit));
    
    const supabase = getAdminConnection();
    
    // Obtener productos con sus unidades
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
        variantes_opciones:producto_variante_opcion(
          idproductovarianteopcion,
          imagenvariante,
          estado,
          opcionvariante:opcionvarianteid(
            idopcionvariante,
            nombreopcionvariante,
            varianteid,
            opcioncatalogoid,
            variante:varianteid(
              idvariante,
              nombrevariante,
              variantecatalogoid
            )
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

    // Obtener IDs de productos para cargar precios de variantes
    const productoIds = data.map(p => p.idproducto);
    let preciosVariante = [];
    
    if (productoIds.length > 0) {
      const pvoIdsAll = data.flatMap(p => p.variantes_opciones?.map(vo => vo.idproductovarianteopcion) || []);
      console.log('[getAll] PVO IDs para buscar precios:', pvoIdsAll);
      
      const { data: precios, error: preciosError } = await supabase
        .from('precio_variante')
        .select(`
          idpreciovariante,
          precio,
          productounidadid,
          opcionvarianteid,
          productovarianteopcionid
        `)
        .in('productovarianteopcionid', pvoIdsAll);
      
      if (preciosError) {
        console.error('[getAll] Error obteniendo precios:', preciosError);
      }
      console.log('[getAll] Precios encontrados:', precios?.length || 0, precios);
      preciosVariante = precios || [];
    }

    // Transformar datos para mantener compatibilidad con frontend
    const productos = data.map(p => {
      // Filtrar unidades activas
      const unidadesActivas = p.unidades?.filter(u => u.estado === 1) || [];
      
      // Agrupar variantes_opciones por variante para estructura compatible
      const variantesMap = new Map();
      
      (p.variantes_opciones || [])
        .filter(vo => vo.estado === 1)
        .forEach(vo => {
          const variante = vo.opcionvariante?.variante;
          if (!variante) return;
          
          const varianteId = variante.idvariante;
          
          if (!variantesMap.has(varianteId)) {
            variantesMap.set(varianteId, {
              idvariante: varianteId,
              nombrevariante: variante.nombrevariante,
              variantecatalogoid: variante.variantecatalogoid,
              estado: 1,
              opciones: []
            });
          }
          
          // Obtener precios para esta opción de variante
          const preciosOpcion = preciosVariante
            .filter(pv => pv.productovarianteopcionid === vo.idproductovarianteopcion)
            .map(pv => ({
              idpreciovariante: pv.idpreciovariante,
              productounidadid: pv.productounidadid,
              precio: pv.precio
            }));
          
          variantesMap.get(varianteId).opciones.push({
            idopcionvariante: vo.opcionvariante.idopcionvariante,
            nombreopcionvariante: vo.opcionvariante.nombreopcionvariante,
            imagenvariante: vo.imagenvariante, // Imagen desde producto_variante_opcion
            idproductovarianteopcion: vo.idproductovarianteopcion,
            opcioncatalogoid: vo.opcionvariante.opcioncatalogoid,
            estado: 1,
            precios: preciosOpcion
          });
        });

      return {
        ...p,
        unidades: unidadesActivas,
        variantes: Array.from(variantesMap.values()),
        variantes_opciones: undefined // Limpiar campo intermedio
      };
    });

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
        variantes_opciones:producto_variante_opcion(
          idproductovarianteopcion,
          imagenvariante,
          estado,
          opcionvariante:opcionvarianteid(
            idopcionvariante,
            nombreopcionvariante,
            varianteid,
            opcioncatalogoid,
            variante:varianteid(
              idvariante,
              nombrevariante,
              variantecatalogoid
            )
          )
        )
      `)
      .eq('idproducto', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Producto no encontrado', 404);
    }

    // Obtener precios de variante para este producto
    const productUnidadIds = data.unidades?.map(u => u.idproductounidad) || [];
    const pvoIds = data.variantes_opciones?.map(vo => vo.idproductovarianteopcion) || [];
    
    let preciosVariante = [];
    if (pvoIds.length > 0 && productUnidadIds.length > 0) {
      const { data: precios } = await supabase
        .from('precio_variante')
        .select('*')
        .in('productovarianteopcionid', pvoIds)
        .in('productounidadid', productUnidadIds);
      
      preciosVariante = precios || [];
    }

    // Transformar datos para mantener compatibilidad con frontend
    const unidadesActivas = data.unidades?.filter(u => u.estado === 1) || [];
    
    // Agrupar variantes_opciones por variante
    const variantesMap = new Map();
    
    (data.variantes_opciones || [])
      .filter(vo => vo.estado === 1)
      .forEach(vo => {
        const variante = vo.opcionvariante?.variante;
        if (!variante) return;
        
        const varianteId = variante.idvariante;
        
        if (!variantesMap.has(varianteId)) {
          variantesMap.set(varianteId, {
            idvariante: varianteId,
            nombrevariante: variante.nombrevariante,
            variantecatalogoid: variante.variantecatalogoid,
            estado: 1,
            opciones: []
          });
        }
        
        // Obtener precios para esta opción de variante
        const preciosOpcion = preciosVariante
          .filter(pv => pv.productovarianteopcionid === vo.idproductovarianteopcion)
          .map(pv => ({
            idpreciovariante: pv.idpreciovariante,
            productounidadid: pv.productounidadid,
            precio: pv.precio
          }));
        
        variantesMap.get(varianteId).opciones.push({
          idopcionvariante: vo.opcionvariante.idopcionvariante,
          nombreopcionvariante: vo.opcionvariante.nombreopcionvariante,
          imagenvariante: vo.imagenvariante,
          idproductovarianteopcion: vo.idproductovarianteopcion,
          opcioncatalogoid: vo.opcionvariante.opcioncatalogoid,
          estado: 1,
          precios: preciosOpcion
        });
      });

    const producto = {
      ...data,
      unidades: unidadesActivas,
      variantes: Array.from(variantesMap.values()),
      variantes_opciones: undefined
    };

    return successResponse(res, producto);

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

    // Verificar si ya existe un producto con el mismo nombre (case-insensitive)
    const { data: existingProduct } = await supabase
      .from('producto')
      .select('idproducto, nombreproducto')
      .ilike('nombreproducto', nombreproducto.trim())
      .eq('estado', 1)
      .single();

    if (existingProduct) {
      return errorResponse(res, `Ya existe un producto con el nombre "${existingProduct.nombreproducto}"`, 400);
    }

    // Crear producto
    const { data: producto, error } = await supabase
      .from('producto')
      .insert({
        nombreproducto: nombreproducto.trim(),
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
    const unidadesCreadas = [];
    if (unidades.length > 0) {
      const unidadesData = unidades.map(u => ({
        productoid: producto.idproducto,
        unidadid: u.unidadid,
        precio: u.precio,
        estado: 1
      }));

      const { data: unidadesResult, error: unidadesError } = await supabase
        .from('producto_unidad')
        .insert(unidadesData)
        .select();

      if (unidadesError) {
        console.error('Error creando unidades:', unidadesError);
      } else {
        unidadesCreadas.push(...unidadesResult);
      }
    }

    // Crear variantes si existen (usando catálogo normalizado)
    if (variantes.length > 0) {
      for (const variante of variantes) {
        const nombreVariante = variante.nombre.trim();
        
        // 1. Buscar/crear en catálogo de variantes
        const varianteCatalogoId = await getOrCreateVarianteCatalogo(supabase, nombreVariante);
        
        // 2. Buscar variante local existente para este producto
        let varianteLocal = null;
        const { data: existingVarianteLocal } = await supabase
          .from('variante')
          .select('*')
          .eq('productoid', producto.idproducto)
          .eq('variantecatalogoid', varianteCatalogoId)
          .eq('estado', 1)
          .single();

        if (existingVarianteLocal) {
          console.log(`[Producto] Reutilizando variante local: ${nombreVariante}`);
          varianteLocal = existingVarianteLocal;
        } else {
          // Crear variante local solo si no existe
          const { data: newVarianteLocal, error: varianteError } = await supabase
            .from('variante')
            .insert({
              nombrevariante: nombreVariante,
              productoid: producto.idproducto,
              variantecatalogoid: varianteCatalogoId,
              estado: 1
            })
            .select()
            .single();

          if (varianteError) {
            console.error('Error creando variante local:', varianteError);
            continue;
          }
          console.log(`[Producto] Nueva variante local creada: ${nombreVariante}`);
          varianteLocal = newVarianteLocal;
        }

        // 3. Crear opciones de variante
        if (variante.opciones && variante.opciones.length > 0) {
          for (const opcion of variante.opciones) {
            const nombreOpcion = opcion.nombre.trim();
            
            // Buscar/crear en catálogo de opciones
            const opcionCatalogoId = await getOrCreateOpcionCatalogo(supabase, nombreOpcion, varianteCatalogoId);
            
            // Buscar opcionvariante local existente
            let opcionLocal = null;
            const { data: existingOpcionLocal } = await supabase
              .from('opcionvariante')
              .select('*')
              .eq('varianteid', varianteLocal.idvariante)
              .eq('opcioncatalogoid', opcionCatalogoId)
              .eq('estado', 1)
              .single();

            if (existingOpcionLocal) {
              console.log(`[Producto] Reutilizando opción local: ${nombreOpcion}`);
              opcionLocal = existingOpcionLocal;
            } else {
              // Crear opcionvariante local solo si no existe
              const { data: newOpcionLocal, error: opcionError } = await supabase
                .from('opcionvariante')
                .insert({
                  nombreopcionvariante: nombreOpcion,
                  varianteid: varianteLocal.idvariante,
                  imagenvariante: '',
                  opcioncatalogoid: opcionCatalogoId,
                  estado: 1
                })
                .select()
                .single();

              if (opcionError) {
                console.error('Error creando opcion local:', opcionError);
                continue;
              }
              console.log(`[Producto] Nueva opción local creada: ${nombreOpcion}`);
              opcionLocal = newOpcionLocal;
            }

            // 4. Crear producto_variante_opcion (aquí va la imagen)
            const { data: pvo, error: pvoError } = await supabase
              .from('producto_variante_opcion')
              .insert({
                productoid: producto.idproducto,
                opcionvarianteid: opcionLocal.idopcionvariante,
                imagenvariante: opcion.imagen || '',
                estado: 1
              })
              .select()
              .single();

            if (pvoError) {
              console.error('Error creando producto_variante_opcion:', pvoError);
              continue;
            }

            // 5. Crear precios por variante si existen
            if (opcion.precios && opcion.precios.length > 0) {
              const preciosData = opcion.precios
                .filter(p => (p.productounidadid || p.unidadid) && parseFloat(p.precio) > 0)
                .map(p => {
                  // Si viene productounidadid, usarlo; si no, buscar por unidadid
                  let productounidadid = p.productounidadid;
                  if (!productounidadid && p.unidadid) {
                    const unidadEncontrada = unidadesCreadas.find(u => u.unidadid === p.unidadid);
                    productounidadid = unidadEncontrada?.idproductounidad;
                  }
                  
                  return productounidadid ? {
                    productounidadid,
                    opcionvarianteid: opcionLocal.idopcionvariante, // Mantener para compatibilidad
                    productovarianteopcionid: pvo.idproductovarianteopcion,
                    precio: parseFloat(p.precio)
                  } : null;
                })
                .filter(Boolean);

              if (preciosData.length > 0) {
                const { error: preciosError } = await supabase
                  .from('precio_variante')
                  .insert(preciosData);

                if (preciosError) {
                  console.error('Error creando precios variante:', preciosError);
                } else {
                  console.log(`[Producto] ${preciosData.length} precios de variante creados para ${nombreOpcion}`);
                }
              }
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

    // Verificar si ya existe otro producto con el mismo nombre (case-insensitive)
    if (nombreproducto !== undefined) {
      const { data: duplicateProduct } = await supabase
        .from('producto')
        .select('idproducto, nombreproducto')
        .ilike('nombreproducto', nombreproducto.trim())
        .eq('estado', 1)
        .neq('idproducto', id)
        .single();

      if (duplicateProduct) {
        return errorResponse(res, `Ya existe un producto con el nombre "${duplicateProduct.nombreproducto}"`, 400);
      }
    }

    // Actualizar producto
    const updateData = {};
    if (nombreproducto !== undefined) updateData.nombreproducto = nombreproducto.trim();
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
    const unidadesActualizadas = [];
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
          
          unidadesActualizadas.push({
            idproductounidad: existingUnidad.idproductounidad,
            unidadid: unidad.unidadid
          });
        } else {
          const { data: newUnidad } = await supabase
            .from('producto_unidad')
            .insert({
              productoid: Number(id),
              unidadid: unidad.unidadid,
              precio: unidad.precio,
              estado: 1
            })
            .select()
            .single();

          if (newUnidad) {
            unidadesActualizadas.push({
              idproductounidad: newUnidad.idproductounidad,
              unidadid: unidad.unidadid
            });
          }
        }
      }
    }

    // Actualizar variantes si se proporcionan
    if (variantes.length > 0) {
      // Desactivar producto_variante_opcion existentes
      await supabase
        .from('producto_variante_opcion')
        .update({ estado: 0 })
        .eq('productoid', id);

      // Desactivar variantes locales existentes
      await supabase
        .from('variante')
        .update({ estado: 0 })
        .eq('productoid', id);

      for (const variante of variantes) {
        const nombreVariante = variante.nombre.trim();
        
        // 1. Buscar/crear en catálogo de variantes
        const varianteCatalogoId = await getOrCreateVarianteCatalogo(supabase, nombreVariante);
        
        // 2. Buscar/crear variante local para este producto
        let varianteLocal = null;
        const { data: existingVariante } = await supabase
          .from('variante')
          .select('*')
          .eq('productoid', id)
          .ilike('nombrevariante', nombreVariante)
          .single();

        if (existingVariante) {
          await supabase
            .from('variante')
            .update({ estado: 1, variantecatalogoid: varianteCatalogoId })
            .eq('idvariante', existingVariante.idvariante);
          varianteLocal = existingVariante;
        } else {
          const { data: newVariante, error: varianteError } = await supabase
            .from('variante')
            .insert({
              nombrevariante: nombreVariante,
              productoid: Number(id),
              variantecatalogoid: varianteCatalogoId,
              estado: 1
            })
            .select()
            .single();

          if (varianteError) {
            console.error('Error creando variante:', varianteError);
            continue;
          }
          varianteLocal = newVariante;
        }

        // 3. Procesar opciones de variante
        if (variante.opciones && variante.opciones.length > 0) {
          for (const opcion of variante.opciones) {
            const nombreOpcion = opcion.nombre.trim();
            
            // Buscar/crear en catálogo de opciones
            const opcionCatalogoId = await getOrCreateOpcionCatalogo(supabase, nombreOpcion, varianteCatalogoId);
            
            // Buscar/crear opcionvariante local
            let opcionLocal = null;
            const { data: existingOpcion } = await supabase
              .from('opcionvariante')
              .select('*')
              .eq('varianteid', varianteLocal.idvariante)
              .ilike('nombreopcionvariante', nombreOpcion)
              .single();

            if (existingOpcion) {
              await supabase
                .from('opcionvariante')
                .update({ estado: 1, opcioncatalogoid: opcionCatalogoId })
                .eq('idopcionvariante', existingOpcion.idopcionvariante);
              opcionLocal = existingOpcion;
            } else {
              const { data: newOpcion, error: opcionError } = await supabase
                .from('opcionvariante')
                .insert({
                  nombreopcionvariante: nombreOpcion,
                  varianteid: varianteLocal.idvariante,
                  imagenvariante: '',
                  opcioncatalogoid: opcionCatalogoId,
                  estado: 1
                })
                .select()
                .single();

              if (opcionError) {
                console.error('Error creando opcion:', opcionError);
                continue;
              }
              opcionLocal = newOpcion;
            }

            // 4. Buscar/crear producto_variante_opcion
            let pvo = null;
            const { data: existingPvo } = await supabase
              .from('producto_variante_opcion')
              .select('*')
              .eq('productoid', id)
              .eq('opcionvarianteid', opcionLocal.idopcionvariante)
              .single();

            if (existingPvo) {
              await supabase
                .from('producto_variante_opcion')
                .update({ 
                  estado: 1, 
                  imagenvariante: opcion.imagen || existingPvo.imagenvariante || ''
                })
                .eq('idproductovarianteopcion', existingPvo.idproductovarianteopcion);
              pvo = existingPvo;
            } else {
              const { data: newPvo, error: pvoError } = await supabase
                .from('producto_variante_opcion')
                .insert({
                  productoid: Number(id),
                  opcionvarianteid: opcionLocal.idopcionvariante,
                  imagenvariante: opcion.imagen || '',
                  estado: 1
                })
                .select()
                .single();

              if (pvoError) {
                console.error('Error creando producto_variante_opcion:', pvoError);
                continue;
              }
              pvo = newPvo;
            }

            // 5. Actualizar precios por variante
            if (opcion.precios && opcion.precios.length > 0) {
              // Eliminar precios anteriores de este pvo
              await supabase
                .from('precio_variante')
                .delete()
                .eq('productovarianteopcionid', pvo.idproductovarianteopcion);

              const preciosData = opcion.precios
                .filter(p => (p.productounidadid || p.unidadid) && parseFloat(p.precio) > 0)
                .map(p => {
                  let productounidadid = p.productounidadid;
                  if (!productounidadid && p.unidadid) {
                    const unidadEncontrada = unidadesActualizadas.find(u => u.unidadid === p.unidadid);
                    productounidadid = unidadEncontrada?.idproductounidad;
                  }
                  
                  return productounidadid ? {
                    productounidadid,
                    opcionvarianteid: opcionLocal.idopcionvariante, // Mantener para compatibilidad
                    productovarianteopcionid: pvo.idproductovarianteopcion,
                    precio: parseFloat(p.precio)
                  } : null;
                })
                .filter(Boolean);

              if (preciosData.length > 0) {
                const { error: preciosError } = await supabase
                  .from('precio_variante')
                  .insert(preciosData);
                
                if (preciosError) {
                  console.error('Error actualizando precios variante:', preciosError);
                } else {
                  console.log(`[Producto] ${preciosData.length} precios actualizados`);
                }
              }
            }
          }
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

// Obtener precios de una opción variante específica por producto y unidad
const getPreciosVariante = async (req, res) => {
  try {
    const { productoid, opcionvarianteid } = req.query;
    const supabase = getAdminConnection();

    if (!productoid || !opcionvarianteid) {
      return errorResponse(res, 'productoid y opcionvarianteid son requeridos', 400);
    }

    // Buscar precios en precio_variante usando la vista o tabla directa
    const { data, error } = await supabase
      .from('precio_variante')
      .select(`
        idpreciovariante,
        precio,
        productounidadid,
        producto_unidad!inner(
          idproductounidad,
          unidadid,
          precio,
          unidad_medida(
            idunidad,
            nombre,
            abreviatura
          )
        )
      `)
      .eq('opcionvarianteid', opcionvarianteid)
      .eq('producto_unidad.productoid', productoid)
      .eq('estado', 1);

    if (error) {
      console.error('Error obteniendo precios de variante:', error);
      return errorResponse(res, 'Error al obtener precios de variante', 500);
    }

    return successResponse(res, data || []);

  } catch (error) {
    console.error('Get precios variante error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Buscar variantes del catálogo (autocompletado)
const searchVariantesCatalogo = async (req, res) => {
  try {
    const { q } = req.query;
    const supabase = getAdminConnection();

    let query = supabase
      .from('variante_catalogo')
      .select('*')
      .eq('estado', 1)
      .order('nombrevariante')
      .limit(10);

    if (q && q.trim()) {
      query = query.ilike('nombrevariante', `%${q.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error buscando variantes:', error);
      return errorResponse(res, 'Error al buscar variantes', 500);
    }

    return successResponse(res, data || []);

  } catch (error) {
    console.error('Search variantes error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Buscar opciones del catálogo por variante (autocompletado)
const searchOpcionesCatalogo = async (req, res) => {
  try {
    const { varianteid, q } = req.query;
    const supabase = getAdminConnection();

    if (!varianteid) {
      return errorResponse(res, 'varianteid es requerido', 400);
    }

    let query = supabase
      .from('opcion_catalogo')
      .select('*')
      .eq('variantecatalogoid', varianteid)
      .eq('estado', 1)
      .order('nombreopcion')
      .limit(10);

    if (q && q.trim()) {
      query = query.ilike('nombreopcion', `%${q.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error buscando opciones:', error);
      return errorResponse(res, 'Error al buscar opciones', 500);
    }

    return successResponse(res, data || []);

  } catch (error) {
    console.error('Search opciones error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
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
  updateProductImage,
  getPreciosVariante,
  searchVariantesCatalogo,
  searchOpcionesCatalogo
};
