import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Producto, ProductoUnidad, Variante } from '@/types';
import { mockProductos, mockProductosUnidad, mockVariantes } from '@/data/mockData';

interface InventarioContextData {
  productos: Producto[];
  addProducto: (producto: Producto) => void;
  updateProducto: (id: number, producto: Partial<Producto>) => void;
  deleteProducto: (id: number) => void;
  getProductoById: (id: number) => Producto | undefined;
  searchProductos: (query: string) => Producto[];
}

const InventarioContext = createContext<InventarioContextData>({} as InventarioContextData);

export const InventarioProvider = ({ children }: { children: ReactNode }) => {
  const [productos, setProductos] = useState<Producto[]>(mockProductos);

  const addProducto = (producto: Producto) => {
    const newProducto = {
      ...producto,
      idproducto: productos.length > 0 ? Math.max(...productos.map(p => p.idproducto)) + 1 : 1,
      fechacreacion: new Date(),
      estado: 1,
    };
    setProductos([...productos, newProducto]);
  };

  const updateProducto = (id: number, productoData: Partial<Producto>) => {
    setProductos(
      productos.map((p) =>
        p.idproducto === id
          ? { ...p, ...productoData, fechaactualizacion: new Date() }
          : p
      )
    );
  };

  const deleteProducto = (id: number) => {
    setProductos(productos.map((p) => (p.idproducto === id ? { ...p, estado: 0 } : p)));
  };

  const getProductoById = (id: number): Producto | undefined => {
    return productos.find((p) => p.idproducto === id && p.estado === 1);
  };

  const searchProductos = (query: string): Producto[] => {
    const lowerQuery = query.toLowerCase();
    return productos.filter(
      (p) =>
        p.estado === 1 &&
        (p.nombreproducto.toLowerCase().includes(lowerQuery) ||
          p.descripcion?.toLowerCase().includes(lowerQuery) ||
          p.categoria?.nombrecategoria.toLowerCase().includes(lowerQuery))
    );
  };

  return (
    <InventarioContext.Provider
      value={{
        productos: productos.filter((p) => p.estado === 1),
        addProducto,
        updateProducto,
        deleteProducto,
        getProductoById,
        searchProductos,
      }}
    >
      {children}
    </InventarioContext.Provider>
  );
};

export const useInventario = () => {
  const context = useContext(InventarioContext);
  if (!context) {
    throw new Error('useInventario debe usarse dentro de InventarioProvider');
  }
  return context;
};
