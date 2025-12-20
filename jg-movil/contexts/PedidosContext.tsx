import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Pedido, DetallePedido } from '@/types';
import { mockPedidos } from '@/data/mockData';

interface PedidosContextData {
  pedidos: Pedido[];
  addPedido: (pedido: Pedido) => void;
  updatePedido: (id: number, pedido: Partial<Pedido>) => void;
  getPedidoById: (id: number) => Pedido | undefined;
  getPedidosPendientes: () => Pedido[];
  confirmarPedido: (id: number) => void;
  cancelarPedido: (id: number) => void;
}

const PedidosContext = createContext<PedidosContextData>({} as PedidosContextData);

export const PedidosProvider = ({ children }: { children: ReactNode }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>(mockPedidos);

  const addPedido = (pedido: Pedido) => {
    const newPedido = {
      ...pedido,
      idpedido: pedidos.length > 0 ? Math.max(...pedidos.map(p => p.idpedido)) + 1 : 1,
      fechapedido: new Date(),
      fechaactualizacion: new Date(),
      estado: 1,
    };
    setPedidos([...pedidos, newPedido]);
  };

  const updatePedido = (id: number, pedidoData: Partial<Pedido>) => {
    setPedidos(
      pedidos.map((p) =>
        p.idpedido === id
          ? { ...p, ...pedidoData, fechaactualizacion: new Date() }
          : p
      )
    );
  };

  const getPedidoById = (id: number): Pedido | undefined => {
    return pedidos.find((p) => p.idpedido === id);
  };

  const getPedidosPendientes = (): Pedido[] => {
    return pedidos.filter((p) => p.estado === 1);
  };

  const confirmarPedido = (id: number) => {
    setPedidos(
      pedidos.map((p) =>
        p.idpedido === id
          ? { ...p, estado: 2, fechaactualizacion: new Date() }
          : p
      )
    );
  };

  const cancelarPedido = (id: number) => {
    setPedidos(
      pedidos.map((p) =>
        p.idpedido === id
          ? { ...p, estado: 3, fechaactualizacion: new Date() }
          : p
      )
    );
  };

  return (
    <PedidosContext.Provider
      value={{
        pedidos,
        addPedido,
        updatePedido,
        getPedidoById,
        getPedidosPendientes,
        confirmarPedido,
        cancelarPedido,
      }}
    >
      {children}
    </PedidosContext.Provider>
  );
};

export const usePedidos = () => {
  const context = useContext(PedidosContext);
  if (!context) {
    throw new Error('usePedidos debe usarse dentro de PedidosProvider');
  }
  return context;
};
