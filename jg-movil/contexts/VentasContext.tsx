import { mockClientes, mockVentas } from '@/data/mockData';
import { Cliente, DetalleVenta, Venta } from '@/types';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface NuevaVentaData {
  cliente: string;
  tipoventa: number;
  total: number;
  detalle: any[];
}

interface VentasContextData {
  ventas: Venta[];
  clientes: Cliente[];
  addVenta: (ventaData: NuevaVentaData) => number;
  getVentaById: (id: number) => Venta | undefined;
  getVentasByFecha: (fecha: Date) => Venta[];
  getTotalVentas: () => number;
  getVentasRecientes: (limit: number) => Venta[];
}

const VentasContext = createContext<VentasContextData>({} as VentasContextData);

export const VentasProvider = ({ children }: { children: ReactNode }) => {
  const [ventas, setVentas] = useState<Venta[]>(mockVentas);
  const [clientes] = useState<Cliente[]>(mockClientes);

  const addVenta = (ventaData: NuevaVentaData): number => {
    const newId = ventas.length > 0 ? Math.max(...ventas.map(v => v.idventa)) + 1 : 1;
    const clienteExistente = clientes.find(c => c.cliente.toLowerCase() === ventaData.cliente.toLowerCase());
    
    // Mapear los detalles al formato correcto
    const detalles: DetalleVenta[] = ventaData.detalle.map((item: any) => ({
      productoid: item.productoid,
      producto: { 
        idproducto: item.productoid, 
        nombreproducto: item.nombreProducto || 'Producto',
        descripcion: '',
        categoriaid: 0,
        imagen: '',
        estado: 1,
        fechacreacion: new Date()
      },
      ventaid: newId,
      cantidad: item.cantidad,
      peso: item.cantidad,
      unidadmedida: item.unidad || 'und',
      productounidadid: item.productounidadid,
      productounidad: item.productounidad || { 
        idproductounidad: item.productounidadid,
        productoid: item.productoid,
        unidadid: 0,
        unidad: { idunidad: 0, nombre: item.unidad || 'Unidad', abreviatura: item.unidad || 'und', es_peso: false, estado: 1 },
        precio: item.precio,
        estado: 1
      },
      opcionvarianteid: item.opcionvarianteid,
      opcionvariante: item.nombreVariante ? {
        idopcionvariante: item.opcionvarianteid,
        nombreopcionvariante: item.nombreVariante,
        varianteid: 0,
        imagenvariante: '',
        estado: 1,
        fechacreacion: new Date()
      } : undefined,
      precio_lista: item.precio,
      precio_aplicado: item.precio_aplicado || item.precio,
      descuento_manual: 0,
      subtotal: item.subtotal,
    }));

    const newVenta: Venta = {
      idventa: newId,
      fecha: new Date(),
      clienteid: clienteExistente?.idcliente || 0,
      cliente: clienteExistente || { idcliente: 0, cliente: ventaData.cliente, telefono: '', estado: 1, fechacreacion: new Date() },
      tipoventa: ventaData.tipoventa,
      total: ventaData.total,
      estado: 1,
      usuarioid: 1,
      fecharegistro: new Date(),
      detalles: detalles,
    };
    
    setVentas([...ventas, newVenta]);
    return newId;
  };

  const getVentaById = (id: number): Venta | undefined => {
    return ventas.find((v) => v.idventa === id);
  };

  const getVentasByFecha = (fecha: Date): Venta[] => {
    return ventas.filter(
      (v) =>
        v.fecha.getDate() === fecha.getDate() &&
        v.fecha.getMonth() === fecha.getMonth() &&
        v.fecha.getFullYear() === fecha.getFullYear()
    );
  };

  const getTotalVentas = (): number => {
    return ventas.reduce((sum, v) => sum + v.total, 0);
  };

  const getVentasRecientes = (limit: number): Venta[] => {
    return [...ventas]
      .sort((a, b) => {
        const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
        const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  };

  return (
    <VentasContext.Provider
      value={{
        ventas,
        clientes,
        addVenta,
        getVentaById,
        getVentasByFecha,
        getTotalVentas,
        getVentasRecientes,
      }}
    >
      {children}
    </VentasContext.Provider>
  );
};

export const useVentas = () => {
  const context = useContext(VentasContext);
  if (!context) {
    throw new Error('useVentas debe usarse dentro de VentasProvider');
  }
  return context;
};
