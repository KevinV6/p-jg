// Tipos para la aplicación JG

export interface Usuario {
  idusuario: number;
  nombreusuario: string;
  contrasenia?: string;
  email?: string;
  primernombre: string;
  apellidopaterno: string;
  apellidomaterno?: string;
  rol: 'admin' | 'vendedor' | 'cajero';
  photo: string;
  estado: number;
  fechacreacion: string;
  fechaactualizacion?: string;
}

export interface Categoria {
  idcategoria: number;
  nombrecategoria: string;
  descripcion?: string;
  estado?: number;
}

export interface UnidadMedida {
  idunidad: number;
  nombre: string;
  abreviatura: string;
  es_peso?: boolean;
  estado?: number;
}

export interface ProductoUnidad {
  idproductounidad: number;
  productoid?: number;
  unidadid: number;
  unidad?: UnidadMedida;
  precio: number;
  estado?: number;
}

export interface OpcionVariante {
  idopcionvariante: number;
  varianteid?: number;
  nombreopcionvariante: string;
  imagenvariante?: string;
  estado?: number;
}

export interface Variante {
  idvariante: number;
  productoid?: number;
  nombrevariante: string;
  estado?: number;
  opciones?: OpcionVariante[];
}

export interface Producto {
  idproducto: number;
  nombreproducto: string;
  descripcion?: string;
  categoriaid: number;
  categoria?: Categoria;
  imagen: string;
  codigoproducto?: string;
  estado: number;
  fechacreacion?: string;
  fechaactualizacion?: string;
  unidades?: ProductoUnidad[];
  variantes?: Variante[];
}

export interface Cliente {
  idcliente: number;
  nombrecliente: string;
  ci_nit?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  es_generico?: boolean;
  estado: number;
  fechacreacion?: string;
  fechaactualizacion?: string;
}

export interface DetalleVenta {
  iddetalleventa?: number;
  ventaid: number;
  productoid: number;
  producto?: Producto;
  productounidadid?: number;
  productounidad?: ProductoUnidad;
  opcionvarianteid?: number;
  opcionvariante?: OpcionVariante;
  cantidad: number;
  peso?: number;
  unidadmedida?: string;
  precio_lista: number;
  precio_aplicado: number;
  descuento_manual?: number;
  subtotal: number;
}

export interface Venta {
  idventa: number;
  folio: string;
  clienteid: number;
  cliente?: Cliente;
  usuarioid: number;
  usuario?: Usuario;
  subtotal?: number;
  descuento?: number;
  total: number;
  tipo_pago: 'contado' | 'credito';
  notas?: string;
  estado: number;
  fecha: string;
  fechacreacion?: string;
  fechaactualizacion?: string;
  detalles?: DetalleVenta[];
}

export interface DetallePedido {
  iddetallepedido: number;
  pedidoid: number;
  productoid: number;
  producto?: Producto;
  productounidadid?: number;
  productounidad?: ProductoUnidad;
  opcionvarianteid?: number;
  opcionvariante?: OpcionVariante;
  cantidad: number;
  precio: number;
  descuento?: number;
  subtotal: number;
}

export interface Pedido {
  idpedido: number;
  clienteid?: number;
  cliente?: Cliente;
  usuarioid: number;
  usuario?: Usuario;
  subtotal?: number;
  descuento?: number;
  total: number;
  notas?: string;
  fecha_entrega?: string;
  estado_pedido: 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
  estado: number;
  fecha: string;
  fechacreacion?: string;
  fechaactualizacion?: string;
  detalles?: DetallePedido[];
}

export interface HistorialPagoCobro {
  idhistorial: number;
  cobroid: number;
  monto: number;
  metodo_pago?: string;
  notas?: string;
  fecha: string;
  fechapago?: string;
  usuarioid: number;
}

export interface Cobro {
  idcobro: number;
  clienteid: number;
  cliente?: Cliente;
  usuarioid: number;
  usuario?: Usuario;
  ventaid?: number;
  venta?: Venta;
  total: number;
  monto_pagado: number;
  saldo?: number;
  fecha_vencimiento?: string;
  fechapago?: string;
  notas?: string;
  origen: 'venta' | 'manual';
  estado: number; // 1: pendiente, 2: pagado, 0: anulado
  fecha: string;
  fechacreacion?: string;
  fechaactualizacion?: string;
  historial_pagos?: HistorialPagoCobro[];
}

// Tipos para formularios
export interface LoginForm {
  nombreusuario: string;
  contrasenia: string;
}

export interface RegisterForm {
  nombreusuario: string;
  contrasenia: string;
  confirmarContrasenia: string;
  email?: string;
  primernombre: string;
  apellidopaterno: string;
  apellidomaterno?: string;
}

export interface ProductoForm {
  nombreproducto: string;
  descripcion?: string;
  categoriaid?: number;
  imagen?: string;
  unidades?: Array<{
    unidadid: number;
    precio: number;
  }>;
  variantes?: Array<{
    nombre: string;
    opciones: Array<{
      nombre: string;
      imagen?: string;
    }>;
  }>;
}

export interface ClienteForm {
  nombrecliente: string;
  ci_nit: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface VentaForm {
  clienteid: number;
  tipo_pago: 'contado' | 'credito';
  notas?: string;
  detalle: Array<{
    productoid: number;
    productounidadid: number;
    opcionvarianteid?: number;
    cantidad: number;
    precio: number;
    subtotal: number;
  }>;
}

export interface CobroForm {
  clienteid: number;
  total: number;
  fecha_vencimiento?: string;
  notas?: string;
}

// Tipos para item de carrito (usado en ventas)
export interface CarritoItem {
  producto: Producto;
  productounidad: ProductoUnidad;
  opcionvariante?: OpcionVariante;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
}
