import { mockCobros } from '@/data/mockData';
import { Cobro } from '@/types';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface CobrosContextData {
  cobros: Cobro[];
  addCobro: (cobro: Omit<Cobro, 'idcobro'>) => void;
  updateCobro: (id: number, cobro: Partial<Cobro>) => void;
  deleteCobro: (id: number) => void;
  getCobroById: (id: number) => Cobro | undefined;
  getCobrosPendientes: () => Cobro[];
  marcarComoPagado: (id: number) => void;
  getCobrosVencidos: () => Cobro[];
}

const CobrosContext = createContext<CobrosContextData>({} as CobrosContextData);

export const CobrosProvider = ({ children }: { children: ReactNode }) => {
  const [cobros, setCobros] = useState<Cobro[]>(mockCobros);

  const addCobro = (cobro: Omit<Cobro, 'idcobro'>) => {
    const newCobro: Cobro = {
      ...cobro,
      idcobro: cobros.length > 0 ? Math.max(...cobros.map(c => c.idcobro)) + 1 : 1,
      fechacreacion: new Date(),
      estado: 1,
    };
    setCobros([...cobros, newCobro]);
  };

  const updateCobro = (id: number, cobroData: Partial<Cobro>) => {
    setCobros(
      cobros.map((c) =>
        c.idcobro === id
          ? { ...c, ...cobroData, fechaactualizacion: new Date() }
          : c
      )
    );
  };

  const deleteCobro = (id: number) => {
    setCobros(cobros.filter((c) => c.idcobro !== id));
  };

  const getCobroById = (id: number): Cobro | undefined => {
    return cobros.find((c) => c.idcobro === id);
  };

  const getCobrosPendientes = (): Cobro[] => {
    return cobros.filter((c) => c.estado === 1);
  };

  const marcarComoPagado = (id: number) => {
    setCobros(
      cobros.map((c) =>
        c.idcobro === id
          ? { ...c, estado: 2, fechapago: new Date(), fechaactualizacion: new Date() }
          : c
      )
    );
  };

  const getCobrosVencidos = (): Cobro[] => {
    const now = new Date();
    return cobros.filter((c) => {
      if (c.estado !== 1) return false;
      const daysDiff = Math.floor(
        (now.getTime() - c.fechacreacion.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff > 7; // Vencido después de 7 días
    });
  };

  return (
    <CobrosContext.Provider
      value={{
        cobros,
        addCobro,
        updateCobro,
        deleteCobro,
        getCobroById,
        getCobrosPendientes,
        marcarComoPagado,
        getCobrosVencidos,
      }}
    >
      {children}
    </CobrosContext.Provider>
  );
};

export const useCobros = () => {
  const context = useContext(CobrosContext);
  if (!context) {
    throw new Error('useCobros debe usarse dentro de CobrosProvider');
  }
  return context;
};
