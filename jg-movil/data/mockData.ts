// Datos mock completos y realistas para desarrollo
import {
  Usuario, Categoria, UnidadMedida, Producto, ProductoUnidad,
  Variante, OpcionVariante, PrecioVariante, Cliente, Venta,
  DetalleVenta, Pedido, DetallePedido, Cobro, AuxDetalleVenta,
} from '@/types';

// ========== USUARIOS ==========
export const mockUsuarios: Usuario[] = [
  {
    idusuario: 1,
    nombreusuario: 'admin',
    contrasenia: 'admin123',
    primernombre: 'Juan',
    apellidopaterno: 'Pérez',
    apellidomaterno: 'García',
    rol: 'admin',
    photo: 'https://i.pravatar.cc/150?img=12',
    estado: 1,
    fecharegistro: new Date('2024-01-01'),
  },
  {
    idusuario: 2,
    nombreusuario: 'vendedor1',
    contrasenia: 'vendedor123',
    primernombre: 'María',
    apellidopaterno: 'López',
    apellidomaterno: 'Martínez',
    rol: 'vendedor',
    photo: 'https://i.pravatar.cc/150?img=5',
    estado: 1,
    fecharegistro: new Date('2024-02-01'),
  },
];

// ========== CATEGORÍAS ==========
export const mockCategorias: Categoria[] = [
  { idcategoria: 1, nombrecategoria: 'Frutas' },
  { idcategoria: 2, nombrecategoria: 'Verduras' },
  { idcategoria: 3, nombrecategoria: 'Carnes' },
  { idcategoria: 4, nombrecategoria: 'Lácteos' },
  { idcategoria: 5, nombrecategoria: 'Bebidas' },
  { idcategoria: 6, nombrecategoria: 'Granos y Cereales' },
  { idcategoria: 7, nombrecategoria: 'Panadería' },
];

// ========== UNIDADES DE MEDIDA ==========
export const mockUnidadesMedida: UnidadMedida[] = [
  { idunidad: 1, nombre: 'Kilogramo', abreviatura: 'kg', es_peso: true, estado: 1 },
  { idunidad: 2, nombre: 'Gramo', abreviatura: 'g', es_peso: true, estado: 1 },
  { idunidad: 3, nombre: 'Unidad', abreviatura: 'und', es_peso: false, estado: 1 },
  { idunidad: 4, nombre: 'Docena', abreviatura: 'doc', es_peso: false, estado: 1 },
  { idunidad: 5, nombre: 'Litro', abreviatura: 'L', es_peso: false, estado: 1 },
  { idunidad: 6, nombre: 'Caja', abreviatura: 'cja', es_peso: false, estado: 1 },
];

// ========== OPCIONES DE VARIANTES ==========
export const mockOpcionesVariantes: OpcionVariante[] = [
  // Variantes de Manzana
  {
    idopcionvariante: 1,
    nombreopcionvariante: 'Roja',
    varianteid: 1,
    imagenvariante: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=150',
    estado: 1,
    fechacreacion: new Date(),
  },
  {
    idopcionvariante: 2,
    nombreopcionvariante: 'Verde',
    varianteid: 1,
    imagenvariante: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=150',
    estado: 1,
    fechacreacion: new Date(),
  },
  {
    idopcionvariante: 3,
    nombreopcionvariante: 'Amarilla',
    varianteid: 1,
    imagenvariante: 'https://images.unsplash.com/photo-1591206369811-4eeb2f18ecf8?w=150',
    estado: 1,
    fechacreacion: new Date(),
  },
  // Variantes de Leche
  {
    idopcionvariante: 4,
    nombreopcionvariante: 'Entera',
    varianteid: 2,
    imagenvariante: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150',
    estado: 1,
    fechacreacion: new Date(),
  },
  {
    idopcionvariante: 5,
    nombreopcionvariante: 'Descremada',
    varianteid: 2,
    imagenvariante: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150',
    estado: 1,
    fechacreacion: new Date(),
  },
  // Variantes de Pollo
  {
    idopcionvariante: 6,
    nombreopcionvariante: 'Entero',
    varianteid: 3,
    imagenvariante: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=150',
    estado: 1,
    fechacreacion: new Date(),
  },
  {
    idopcionvariante: 7,
    nombreopcionvariante: 'Pechuga',
    varianteid: 3,
    imagenvariante: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=150',
    estado: 1,
    fechacreacion: new Date(),
  },
  {
    idopcionvariante: 8,
    nombreopcionvariante: 'Pierna',
    varianteid: 3,
    imagenvariante: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=150',
    estado: 1,
    fechacreacion: new Date(),
  },
];

// ========== VARIANTES ==========
export const mockVariantes: Variante[] = [
  {
    idvariante: 1,
    nombrevariante: 'Tipo',
    estado: 1,
    productoid: 1,
    opciones: [
      mockOpcionesVariantes[0],
      mockOpcionesVariantes[1],
      mockOpcionesVariantes[2],
    ],
  },
  {
    idvariante: 2,
    nombrevariante: 'Tipo de Leche',
    estado: 1,
    productoid: 4,
    opciones: [mockOpcionesVariantes[3], mockOpcionesVariantes[4]],
  },
  {
    idvariante: 3,
    nombrevariante: 'Corte',
    estado: 1,
    productoid: 3,
    opciones: [
      mockOpcionesVariantes[5],
      mockOpcionesVariantes[6],
      mockOpcionesVariantes[7],
    ],
  },
];

// ========== PRODUCTOS CON UNIDADES ==========
export const mockProductosUnidad: ProductoUnidad[] = [
  // Manzana - múltiples unidades
  { idproductounidad: 1, productoid: 1, unidadid: 1, unidad: mockUnidadesMedida[0], precio: 8.5, estado: 1, fechacreacion: new Date() },
  { idproductounidad: 2, productoid: 1, unidadid: 3, unidad: mockUnidadesMedida[2], precio: 1.2, estado: 1, fechacreacion: new Date() },
  { idproductounidad: 3, productoid: 1, unidadid: 6, unidad: mockUnidadesMedida[5], precio: 45.0, estado: 1, fechacreacion: new Date() },
  
  // Tomate
  { idproductounidad: 4, productoid: 2, unidadid: 1, unidad: mockUnidadesMedida[0], precio: 3.5, estado: 1, fechacreacion: new Date() },
  { idproductounidad: 5, productoid: 2, unidadid: 3, unidad: mockUnidadesMedida[2], precio: 0.5, estado: 1, fechacreacion: new Date() },
  
  // Pollo - múltiples unidades
  { idproductounidad: 6, productoid: 3, unidadid: 1, unidad: mockUnidadesMedida[0], precio: 18.0, estado: 1, fechacreacion: new Date() },
  { idproductounidad: 7, productoid: 3, unidadid: 3, unidad: mockUnidadesMedida[2], precio: 22.0, estado: 1, fechacreacion: new Date() },
  
  // Leche
  { idproductounidad: 8, productoid: 4, unidadid: 5, unidad: mockUnidadesMedida[4], precio: 4.5, estado: 1, fechacreacion: new Date() },
  { idproductounidad: 9, productoid: 4, unidadid: 3, unidad: mockUnidadesMedida[2], precio: 4.8, estado: 1, fechacreacion: new Date() },
  
  // Plátano
  { idproductounidad: 10, productoid: 5, unidadid: 1, unidad: mockUnidadesMedida[0], precio: 2.5, estado: 1, fechacreacion: new Date() },
  { idproductounidad: 11, productoid: 5, unidadid: 4, unidad: mockUnidadesMedida[3], precio: 6.0, estado: 1, fechacreacion: new Date() },
  
  // Lechuga
  { idproductounidad: 12, productoid: 6, unidadid: 3, unidad: mockUnidadesMedida[2], precio: 2.0, estado: 1, fechacreacion: new Date() },
  
  // Pan
  { idproductounidad: 13, productoid: 7, unidadid: 3, unidad: mockUnidadesMedida[2], precio: 5.5, estado: 1, fechacreacion: new Date() },
  
  // Arroz
  { idproductounidad: 14, productoid: 8, unidadid: 1, unidad: mockUnidadesMedida[0], precio: 4.2, estado: 1, fechacreacion: new Date() },
  { idproductounidad: 15, productoid: 8, unidadid: 6, unidad: mockUnidadesMedida[5], precio: 85.0, estado: 1, fechacreacion: new Date() },
];

// ========== PRECIOS POR VARIANTE ==========
export const mockPreciosVariante: PrecioVariante[] = [
  // Manzana Roja
  { idpreciovariante: 1, productounidadid: 1, opcionvarianteid: 1, precio: 8.5, fechacreacion: new Date() },
  { idpreciovariante: 2, productounidadid: 2, opcionvarianteid: 1, precio: 1.2, fechacreacion: new Date() },
  
  // Manzana Verde
  { idpreciovariante: 3, productounidadid: 1, opcionvarianteid: 2, precio: 9.0, fechacreacion: new Date() },
  { idpreciovariante: 4, productounidadid: 2, opcionvarianteid: 2, precio: 1.3, fechacreacion: new Date() },
  
  // Manzana Amarilla
  { idpreciovariante: 5, productounidadid: 1, opcionvarianteid: 3, precio: 7.8, fechacreacion: new Date() },
  { idpreciovariante: 6, productounidadid: 2, opcionvarianteid: 3, precio: 1.1, fechacreacion: new Date() },
  
  // Leche Entera
  { idpreciovariante: 7, productounidadid: 8, opcionvarianteid: 4, precio: 4.5, fechacreacion: new Date() },
  
  // Leche Descremada
  { idpreciovariante: 8, productounidadid: 8, opcionvarianteid: 5, precio: 5.0, fechacreacion: new Date() },
  
  // Pollo Entero
  { idpreciovariante: 9, productounidadid: 6, opcionvarianteid: 6, precio: 18.0, fechacreacion: new Date() },
  
  // Pollo Pechuga
  { idpreciovariante: 10, productounidadid: 6, opcionvarianteid: 7, precio: 22.0, fechacreacion: new Date() },
  
  // Pollo Pierna
  { idpreciovariante: 11, productounidadid: 6, opcionvarianteid: 8, precio: 16.5, fechacreacion: new Date() },
];

// ========== PRODUCTOS ==========
export const mockProductos: Producto[] = [
  {
    idproducto: 1,
    nombreproducto: 'Manzana',
    descripcion: 'Manzanas frescas de la mejor calidad, disponibles en diferentes variedades',
    categoriaid: 1,
    categoria: mockCategorias[0],
    imagen: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
    estado: 1,
    fechacreacion: new Date(),
    unidades: [mockProductosUnidad[0], mockProductosUnidad[1], mockProductosUnidad[2]],
    variantes: [mockVariantes[0]],
  },
  {
    idproducto: 2,
    nombreproducto: 'Tomate',
    descripcion: 'Tomates frescos y jugosos del campo',
    categoriaid: 2,
    categoria: mockCategorias[1],
    imagen: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
    estado: 1,
    fechacreacion: new Date(),
    unidades: [mockProductosUnidad[3], mockProductosUnidad[4]],
  },
  {
    idproducto: 3,
    nombreproducto: 'Pollo',
    descripcion: 'Pollo fresco de granja, diferentes cortes disponibles',
    categoriaid: 3,
    categoria: mockCategorias[2],
    imagen: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
    estado: 1,
    fechacreacion: new Date(),
    unidades: [mockProductosUnidad[5], mockProductosUnidad[6]],
    variantes: [mockVariantes[2]],
  },
  {
    idproducto: 4,
    nombreproducto: 'Leche',
    descripcion: 'Leche pasteurizada fresca, entera o descremada',
    categoriaid: 4,
    categoria: mockCategorias[3],
    imagen: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
    estado: 1,
    fechacreacion: new Date(),
    unidades: [mockProductosUnidad[7], mockProductosUnidad[8]],
    variantes: [mockVariantes[1]],
  },
  {
    idproducto: 5,
    nombreproducto: 'Plátano',
    descripcion: 'Plátanos maduros y dulces',
    categoriaid: 1,
    categoria: mockCategorias[0],
    imagen: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    estado: 1,
    fechacreacion: new Date(),
    unidades: [mockProductosUnidad[9], mockProductosUnidad[10]],
  },
  {
    idproducto: 6,
    nombreproducto: 'Lechuga',
    descripcion: 'Lechuga fresca y crujiente',
    categoriaid: 2,
    categoria: mockCategorias[1],
    imagen: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400',
    estado: 1,
    fechacreacion: new Date(),
    unidades: [mockProductosUnidad[11]],
  },
  {
    idproducto: 7,
    nombreproducto: 'Pan Integral',
    descripcion: 'Pan integral recién horneado',
    categoriaid: 7,
    categoria: mockCategorias[6],
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    estado: 1,
    fechacreacion: new Date(),
    unidades: [mockProductosUnidad[12]],
  },
  {
    idproducto: 8,
    nombreproducto: 'Arroz',
    descripcion: 'Arroz blanco de grano largo premium',
    categoriaid: 6,
    categoria: mockCategorias[5],
    imagen: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    estado: 1,
    fechacreacion: new Date(),
    unidades: [mockProductosUnidad[13], mockProductosUnidad[14]],
  },
];

// ========== CLIENTES ==========
export const mockClientes: Cliente[] = [
  { idcliente: 1, cliente: 'Carlos Mendoza' },
  { idcliente: 2, cliente: 'Ana Torres' },
  { idcliente: 3, cliente: 'Roberto Sánchez' },
  { idcliente: 4, cliente: 'Lucía Ramírez' },
  { idcliente: 5, cliente: 'Pedro Castillo' },
  { idcliente: 6, cliente: 'Sofia Vargas' },
  { idcliente: 7, cliente: 'Miguel Ángel Díaz' },
  { idcliente: 8, cliente: 'Carmen López' },
];

// ========== DETALLES DE VENTA ==========
export const mockDetallesVenta: DetalleVenta[] = [
  // Venta 1
  {
    ventaid: 1,
    productoid: 1,
    producto: mockProductos[0],
    cantidad: 2,
    peso: 2,
    unidadmedida: 'kg',
    productounidadid: 1,
    productounidad: mockProductosUnidad[0],
    opcionvarianteid: 1,
    opcionvariante: mockOpcionesVariantes[0],
    precio_lista: 8.5,
    precio_aplicado: 8.5,
    descuento_manual: 0,
    subtotal: 17.0,
  },
  {
    ventaid: 1,
    productoid: 2,
    producto: mockProductos[1],
    cantidad: 3,
    peso: 3,
    unidadmedida: 'kg',
    productounidadid: 4,
    productounidad: mockProductosUnidad[3],
    precio_lista: 3.5,
    precio_aplicado: 3.5,
    descuento_manual: 0,
    subtotal: 10.5,
  },
  // Venta 2
  {
    ventaid: 2,
    productoid: 3,
    producto: mockProductos[2],
    cantidad: 1,
    peso: 1.5,
    unidadmedida: 'kg',
    productounidadid: 6,
    productounidad: mockProductosUnidad[5],
    opcionvarianteid: 7,
    opcionvariante: mockOpcionesVariantes[6],
    precio_lista: 22.0,
    precio_aplicado: 22.0,
    descuento_manual: 0,
    subtotal: 33.0,
  },
  {
    ventaid: 2,
    productoid: 4,
    producto: mockProductos[3],
    cantidad: 2,
    peso: 2,
    unidadmedida: 'L',
    productounidadid: 8,
    productounidad: mockProductosUnidad[7],
    opcionvarianteid: 4,
    opcionvariante: mockOpcionesVariantes[3],
    precio_lista: 4.5,
    precio_aplicado: 4.5,
    descuento_manual: 0,
    subtotal: 9.0,
  },
  // Venta 3
  {
    ventaid: 3,
    productoid: 5,
    producto: mockProductos[4],
    cantidad: 5,
    peso: 5,
    unidadmedida: 'kg',
    productounidadid: 10,
    productounidad: mockProductosUnidad[9],
    precio_lista: 2.5,
    precio_aplicado: 2.5,
    descuento_manual: 0,
    subtotal: 12.5,
  },
  {
    ventaid: 3,
    productoid: 7,
    producto: mockProductos[6],
    cantidad: 2,
    peso: 2,
    unidadmedida: 'und',
    productounidadid: 13,
    productounidad: mockProductosUnidad[12],
    precio_lista: 5.5,
    precio_aplicado: 5.5,
    descuento_manual: 0,
    subtotal: 11.0,
  },
  // Venta 4
  {
    ventaid: 4,
    productoid: 8,
    producto: mockProductos[7],
    cantidad: 2,
    peso: 2,
    unidadmedida: 'kg',
    productounidadid: 14,
    productounidad: mockProductosUnidad[13],
    precio_lista: 4.2,
    precio_aplicado: 4.2,
    descuento_manual: 0,
    subtotal: 8.4,
  },
  // Venta 5
  {
    ventaid: 5,
    productoid: 1,
    producto: mockProductos[0],
    cantidad: 5,
    peso: 5,
    unidadmedida: 'kg',
    productounidadid: 1,
    productounidad: mockProductosUnidad[0],
    opcionvarianteid: 2,
    opcionvariante: mockOpcionesVariantes[1],
    precio_lista: 9.0,
    precio_aplicado: 9.0,
    descuento_manual: 0,
    subtotal: 45.0,
  },
];

// ========== VENTAS ==========
export const mockVentas: Venta[] = [
  {
    idventa: 1,
    fecha: new Date('2024-12-15T10:30:00'),
    clienteid: 1,
    cliente: mockClientes[0],
    total: 27.5,
    estado: 1,
    tipoventa: 1,
    usuarioid: 1,
    usuario: mockUsuarios[0],
    fecharegistro: new Date('2024-12-15T10:30:00'),
    detalles: [mockDetallesVenta[0], mockDetallesVenta[1]],
  },
  {
    idventa: 2,
    fecha: new Date('2024-12-16T14:20:00'),
    clienteid: 2,
    cliente: mockClientes[1],
    total: 42.0,
    estado: 1,
    tipoventa: 2,
    usuarioid: 1,
    usuario: mockUsuarios[0],
    fecharegistro: new Date('2024-12-16T14:20:00'),
    detalles: [mockDetallesVenta[2], mockDetallesVenta[3]],
  },
  {
    idventa: 3,
    fecha: new Date('2024-12-17T09:15:00'),
    clienteid: 3,
    cliente: mockClientes[2],
    total: 23.5,
    estado: 1,
    tipoventa: 1,
    usuarioid: 2,
    usuario: mockUsuarios[1],
    fecharegistro: new Date('2024-12-17T09:15:00'),
    detalles: [mockDetallesVenta[4], mockDetallesVenta[5]],
  },
  {
    idventa: 4,
    fecha: new Date('2024-12-17T11:45:00'),
    clienteid: 4,
    cliente: mockClientes[3],
    total: 8.4,
    estado: 1,
    tipoventa: 1,
    usuarioid: 1,
    usuario: mockUsuarios[0],
    fecharegistro: new Date('2024-12-17T11:45:00'),
    detalles: [mockDetallesVenta[6]],
  },
  {
    idventa: 5,
    fecha: new Date('2024-12-17T16:30:00'),
    clienteid: 5,
    cliente: mockClientes[4],
    total: 45.0,
    estado: 1,
    tipoventa: 2,
    usuarioid: 2,
    usuario: mockUsuarios[1],
    fecharegistro: new Date('2024-12-17T16:30:00'),
    detalles: [mockDetallesVenta[7]],
  },
];

// ========== DETALLES DE PEDIDO ==========
export const mockDetallesPedido: DetallePedido[] = [
  // Pedido 1
  {
    pedidoid: 1,
    productoid: 1,
    producto: mockProductos[0],
    cantidad: 10,
    peso: 10,
    unidadmedida: 'kg',
    productounidadid: 1,
    productounidad: mockProductosUnidad[0],
    opcionvarianteid: 1,
    opcionvariante: mockOpcionesVariantes[0],
    precio_referencia: 8.5,
  },
  {
    pedidoid: 1,
    productoid: 3,
    producto: mockProductos[2],
    cantidad: 5,
    peso: 5,
    unidadmedida: 'kg',
    productounidadid: 6,
    productounidad: mockProductosUnidad[5],
    opcionvarianteid: 6,
    opcionvariante: mockOpcionesVariantes[5],
    precio_referencia: 18.0,
  },
  // Pedido 2
  {
    pedidoid: 2,
    productoid: 4,
    producto: mockProductos[3],
    cantidad: 12,
    peso: 12,
    unidadmedida: 'L',
    productounidadid: 8,
    productounidad: mockProductosUnidad[7],
    opcionvarianteid: 4,
    opcionvariante: mockOpcionesVariantes[3],
    precio_referencia: 4.5,
  },
  // Pedido 3
  {
    pedidoid: 3,
    productoid: 8,
    producto: mockProductos[7],
    cantidad: 20,
    peso: 20,
    unidadmedida: 'kg',
    productounidadid: 14,
    productounidad: mockProductosUnidad[13],
    precio_referencia: 4.2,
  },
];

// ========== PEDIDOS ==========
export const mockPedidos: Pedido[] = [
  {
    idpedido: 1,
    fechapedido: new Date('2024-12-16'),
    estado: 1,
    clienteid: 6,
    cliente: mockClientes[5],
    observacion: 'Entregar antes de las 5pm',
    fechaactualizacion: new Date('2024-12-16'),
    detalles: [mockDetallesPedido[0], mockDetallesPedido[1]],
  },
  {
    idpedido: 2,
    fechapedido: new Date('2024-12-17'),
    estado: 1,
    clienteid: 7,
    cliente: mockClientes[6],
    observacion: 'Cliente regular - prioridad',
    fechaactualizacion: new Date('2024-12-17'),
    detalles: [mockDetallesPedido[2]],
  },
  {
    idpedido: 3,
    fechapedido: new Date('2024-12-17'),
    estado: 2,
    clienteid: 8,
    cliente: mockClientes[7],
    observacion: 'Pedido confirmado para mañana',
    fechaactualizacion: new Date('2024-12-17'),
    detalles: [mockDetallesPedido[3]],
  },
];

// ========== AUX DETALLE VENTA ==========
export const mockAuxDetallesVenta: AuxDetalleVenta[] = [
  {
    idauxventa: 1,
    nombreproductoaux: 'Manzana Roja',
    cantidadaux: 5,
    pesoaux: 5,
    unidadmedida: 'kg',
    precio: 8.5,
    estado: 1,
    fechacreacion: new Date('2024-12-10'),
    usuarioid: 1,
  },
  {
    idauxventa: 2,
    nombreproductoaux: 'Tomate',
    cantidadaux: 3,
    pesoaux: 3,
    unidadmedida: 'kg',
    precio: 3.5,
    estado: 1,
    fechacreacion: new Date('2024-12-10'),
    usuarioid: 1,
  },
  {
    idauxventa: 3,
    nombreproductoaux: 'Pollo Pechuga',
    cantidadaux: 2,
    pesoaux: 2,
    unidadmedida: 'kg',
    precio: 22.0,
    estado: 1,
    fechacreacion: new Date('2024-12-12'),
    usuarioid: 1,
  },
  {
    idauxventa: 4,
    nombreproductoaux: 'Leche Entera',
    cantidadaux: 4,
    pesoaux: 4,
    unidadmedida: 'L',
    precio: 4.5,
    estado: 1,
    fechacreacion: new Date('2024-12-14'),
    usuarioid: 1,
  },
];

// ========== COBROS ==========
export const mockCobros: Cobro[] = [
  {
    idcobro: 1,
    nombrecobro: 'Carlos Mendoza',
    auxventa: 1,
    auxDetalles: [mockAuxDetallesVenta[0], mockAuxDetallesVenta[1]],
    total: 53.0,
    telefono: '987654321',
    estado: 1,
    fechacreacion: new Date('2024-12-10'),
    fechapago: undefined,
    usuarioid: 1,
    usuario: mockUsuarios[0],
    imagen: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
  },
  {
    idcobro: 2,
    nombrecobro: 'Ana Torres',
    auxventa: 2,
    auxDetalles: [mockAuxDetallesVenta[2]],
    total: 44.0,
    telefono: '987654322',
    estado: 2,
    fechacreacion: new Date('2024-12-12'),
    fechapago: new Date('2024-12-15'),
    usuarioid: 1,
    usuario: mockUsuarios[0],
    imagen: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
  },
  {
    idcobro: 3,
    nombrecobro: 'Roberto Sánchez',
    auxventa: 3,
    auxDetalles: [mockAuxDetallesVenta[3]],
    total: 18.0,
    telefono: '987654323',
    estado: 1,
    fechacreacion: new Date('2024-12-14'),
    fechapago: undefined,
    usuarioid: 1,
    usuario: mockUsuarios[0],
    imagen: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
  },
];
