// Tipos para la aplicación JG

export interface Usuario {
  idusuario: number;
  nombreusuario: string;
  contrasenia: string;
  primernombre: string;
  apellidopaterno: string;
  apellidomaterno?: string;
  rol: 'admin' | 'vendedor' | 'cajero';
  photo: string;
  estado: number;
  fecharegistro: Date;
  fechaactualizacion?: Date;
}

export interface Categoria {
  idcategoria: number;
  nombrecategoria: string;
}

export interface UnidadMedida {
  idunidad: number;
  nombre: string;
  abreviatura: string;
  es_peso: boolean;
  estado: number;
}

export interface Producto {
  idproducto: number;
  nombreproducto: string;
  descripcion?: string;
  categoriaid: number;
  categoria?: Categoria;
  imagen: string;
  imagenproducto?: string;
  estado: number;
  fechacreacion: Date;
  fechaactualizacion?: Date;
  unidades?: ProductoUnidad[];
  variantes?: Variante[];
}

export interface ProductoUnidad {
  idproductounidad: number;
  productoid: number;
  unidadid: number;
  unidad?: UnidadMedida;
  precio: number;
  stock?: number; // Stock disponible de esta unidad de producto
  estado: number;
  fechacreacion: Date;
  fechaactualizacion?: Date;
}

export interface Variante {
  idvariante: number;
  nombrevariante: string;
  estado: number;
  productoid: number;
  opciones?: OpcionVariante[];
}

export interface OpcionVariante {
  idopcionvariante: number;
  nombreopcionvariante: string;
  varianteid: number;
  imagenvariante: string;
  imagenopcionvariante?: string;
  estado: number;
  fechacreacion: Date;
  fechaactualizacion?: Date;
}

export interface PrecioVariante {
  idpreciovariante: number;
  productounidadid: number;
  opcionvarianteid: number;
  precio: number;
  fechacreacion: Date;
}

export interface Cliente {
  idcliente: number;
  cliente: string;
}

export interface Venta {
  idventa: number;
  fecha: Date;
  clienteid: number;
  cliente?: Cliente;
  total: number;
  estado: number;
  tipoventa: number; // 1: contado, 2: crédito
  usuarioid: number;
  usuario?: Usuario;
  fecharegistro: Date;
  fechaactualizacion?: Date;
  detalles?: DetalleVenta[];
}

export interface DetalleVenta {
  productoid: number;
  producto?: Producto;
  ventaid: number;
  cantidad: number;
  peso: number;
  unidadmedida: string;
  productounidadid?: number;
  productounidad?: ProductoUnidad;
  opcionvarianteid?: number;
  opcionvariante?: OpcionVariante;
  precio_lista: number;
  precio_aplicado: number;
  descuento_manual: number;
  subtotal: number;
}

export interface Pedido {
  idpedido: number;
  fechapedido: Date;
  estado: number; // 1: pendiente, 2: confirmado, 3: cancelado
  clienteid: number;
  cliente?: Cliente;
  observacion: string;
  fechaactualizacion: Date;
  detalles?: DetallePedido[];
}

export interface DetallePedido {
  pedidoid: number;
  productoid: number;
  producto?: Producto;
  cantidad: number;
  peso: number;
  unidadmedida: string;
  productounidadid?: number;
  productounidad?: ProductoUnidad;
  opcionvarianteid?: number;
  opcionvariante?: OpcionVariante;
  precio_referencia: number;
}

export interface AuxDetalleVenta {
  idauxventa: number;
  nombreproductoaux: string;
  cantidadaux: number;
  pesoaux: number;
  unidadmedida: string;
  precio: number;
  estado: number;
  fechacreacion: Date;
  fechaactualizacion?: Date;
  usuarioid: number;
}

export interface Cobro {
  idcobro: number;
  nombrecobro: string;
  auxventa: number;
  auxDetalles?: AuxDetalleVenta[];
  total: number;
  telefono: string;
  estado: number; // 1: pendiente, 2: pagado, 3: vencido
  fechacreacion: Date;
  fechaactualizacion?: Date;
  fechapago?: Date;
  usuarioid: number;
  usuario?: Usuario;
  imagen: string;
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
  primernombre: string;
  apellidopaterno: string;
  apellidomaterno?: string;
}

export interface ProductoForm {
  nombreproducto: string;
  descripcion?: string;
  categoriaid: number;
  imagen: string;
  unidades: Array<{
    unidadid: number;
    precio: number;
  }>;
  variantes?: Array<{
    nombrevariante: string;
    opciones: Array<{
      nombreopcionvariante: string;
      imagenvariante: string;
    }>;
  }>;
}

export interface CobroForm {
  nombrecobro: string;
  telefono: string;
  productos: Array<{
    nombreproducto: string;
    cantidad: number;
    peso: number;
    unidadmedida: string;
    precio: number;
  }>;
  imagen?: string;
}
