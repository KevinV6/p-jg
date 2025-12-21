import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Alert, Modal, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';

interface DetalleItem {
  nombreProducto?: string;
  nombreproductoaux?: string;
  nombreVariante?: string;
  unidad?: string;
  unidadmedida?: string;
  cantidad?: number;
  cantidadaux?: number;
  precio?: number;
  precio_aplicado?: number;
  subtotal?: number;
  productoid?: number;
}

interface ComprobanteModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  data: {
    folio?: string;
    fecha?: Date | string;
    cliente?: string;
    telefono?: string;
    tipo_pago?: 'contado' | 'credito';
    detalle?: DetalleItem[];
    auxDetalles?: DetalleItem[];
    total: number;
    vendedor?: string;
  } | null;
  buttonText?: string;
  onButtonPress?: () => void;
  tipo?: 'venta' | 'cobro';
  showSuccessHeader?: boolean;
}

export const ComprobanteModal: React.FC<ComprobanteModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  data,
  buttonText = 'Continuar',
  onButtonPress,
  showSuccessHeader = true,
  tipo = 'venta'
}) => {
  const formatFecha = (date: Date | string) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm');
  };

  if (!data) {
    return null;
  }

  // Normalizar detalles - puede venir como detalle o auxDetalles
  const detalles = data.detalle || data.auxDetalles || [];

  const handleCompartir = async () => {
    try {
      const tipoTexto = tipo === 'venta' ? 'Venta' : 'Cobro';
      const message = `Comprobante de ${tipoTexto} ${data.folio ? `N° ${data.folio}` : ''}\nCliente: ${data.cliente}\nTotal: Bs. ${data.total.toFixed(2)}\nFecha: ${formatFecha(data.fecha || new Date())}`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el comprobante');
    }
  };

  const generarHTML = () => {
    const tipoTexto = tipo === 'venta' ? 'VENTA' : 'COBRO';
    
    const detallesHTML = detalles.map((item: DetalleItem, index: number) => {
      const nombre = item.nombreProducto || item.nombreproductoaux || `Producto #${item.productoid || index + 1}`;
      const nombreCompleto = item.nombreVariante ? `${nombre} - ${item.nombreVariante}` : nombre;
      const unidad = item.unidad || item.unidadmedida || 'und';
      const cantidad = item.cantidad || item.cantidadaux || 0;
      const precio = item.precio_aplicado || item.precio || 0;
      const subtotal = item.subtotal || (cantidad * precio);

      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${nombreCompleto}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${unidad}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${cantidad}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${precio.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">${subtotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #402612; margin: 10px 0; }
            .info-section { margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #f3f4f6; padding: 10px; text-align: left; font-weight: bold; }
            .totales { margin-top: 20px; text-align: right; }
            .total-final { font-size: 20px; font-weight: bold; color: #402612; margin-top: 10px; }
            .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">JG</div>
            <div>Sistema de Gestión Comercial</div>
            <h2>COMPROBANTE DE ${tipoTexto}</h2>
            ${data.folio ? `<div>N° ${data.folio}</div>` : ''}
          </div>
          
          <div class="info-section">
            <div class="info-row"><strong>Fecha:</strong> <span>${formatFecha(data.fecha || new Date())}</span></div>
            <div class="info-row"><strong>Cliente:</strong> <span>${data.cliente}</span></div>
            ${data.telefono ? `<div class="info-row"><strong>Teléfono:</strong> <span>${data.telefono}</span></div>` : ''}
            ${data.vendedor ? `<div class="info-row"><strong>Vendedor:</strong> <span>${data.vendedor}</span></div>` : ''}
            ${data.tipo_pago ? `<div class="info-row"><strong>Tipo:</strong> <span>${data.tipo_pago === 'contado' ? 'Contado' : 'Crédito'}</span></div>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align: center;">Und.</th>
                <th style="text-align: center;">Cant.</th>
                <th style="text-align: right;">Precio</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${detallesHTML}
            </tbody>
          </table>

          <div class="totales">
            <div class="total-final">TOTAL: Bs. ${data.total.toFixed(2)}</div>
          </div>

          <div class="footer">
            <div>¡Gracias por su ${tipo === 'venta' ? 'compra' : 'confianza'}!</div>
            <div>Comprobante generado el ${formatFecha(new Date())}</div>
          </div>
        </body>
      </html>
    `;
  };

  const handleGenerarPDF = async () => {
    try {
      const html = generarHTML();
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
        });
      } else {
        Alert.alert('Éxito', 'PDF generado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF');
    }
  };

  const handleImprimir = async () => {
    try {
      const html = generarHTML();
      await Print.printAsync({ html });
    } catch (error) {
      Alert.alert('Error', 'No se pudo imprimir el comprobante');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[#F6EBD7]">
        {/* Header */}
        {showSuccessHeader ? (
          <View className="bg-[#402612] px-4 py-10 items-center">
            <View className="bg-white rounded-full p-4 mb-4">
              <Ionicons name="checkmark-circle" size={48} color="#00D98E" />
            </View>
            <Text className="text-2xl font-poppins-black text-[#F6EBD7] text-center mb-2">
              ¡Operación Exitosa!
            </Text>
            <Text className="text-base font-poppins-regular text-[#F6EBD7]/80 text-center">
              {subtitle || title}
            </Text>
          </View>
        ) : (
          <View className="bg-[#402612] px-4 py-4 flex-row items-center">
            <TouchableOpacity onPress={onClose} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#F6EBD7" />
            </TouchableOpacity>
            <Text className="text-xl font-poppins-semibold text-[#F6EBD7]">
              {title}
            </Text>
          </View>
        )}

        {/* Comprobante */}
        <ScrollView className="flex-1 px-4 py-4">
          <View className="bg-white rounded-2xl p-6 shadow-lg mb-4">
            {/* Encabezado del comprobante */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full justify-center items-center mb-3" style={{ backgroundColor: '#402612' + '20' }}>
                <Ionicons name="storefront" size={32} color="#402612" />
              </View>
              <Text className="text-xl font-poppins-bold text-[#402612]">JG</Text>
              <Text className="text-xs font-poppins-regular text-[#8B5A3C] mb-3">Sistema de Gestión Comercial</Text>
              <View className="h-px bg-gray-200 w-full my-2" />
              <Text className="text-lg font-poppins-bold text-[#402612] mt-2">
                COMPROBANTE DE {tipo === 'venta' ? 'VENTA' : 'COBRO'}
              </Text>
              {data.folio && (
                <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
                  N° {data.folio}
                </Text>
              )}
            </View>

            {/* Información del cliente */}
            <View className="mb-4 pb-4 border-b border-gray-200">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-poppins-semibold text-[#8B5A3C]">Fecha:</Text>
                <Text className="font-poppins-regular text-[#402612]">
                  {formatFecha(data.fecha || new Date())}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-poppins-semibold text-[#8B5A3C]">Cliente:</Text>
                <Text className="font-poppins-regular text-[#402612] flex-1 text-right" numberOfLines={1}>
                  {data.cliente}
                </Text>
              </View>
              {data.telefono && (
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-poppins-semibold text-[#8B5A3C]">Teléfono:</Text>
                  <Text className="font-poppins-regular text-[#402612]">{data.telefono}</Text>
                </View>
              )}
              {data.vendedor && (
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-poppins-semibold text-[#8B5A3C]">Vendedor:</Text>
                  <Text className="font-poppins-regular text-[#402612]">{data.vendedor}</Text>
                </View>
              )}
              {data.tipo_pago && (
                <View className="flex-row justify-between items-center">
                  <Text className="font-poppins-semibold text-[#8B5A3C]">Tipo:</Text>
                  <Text className="font-poppins-regular text-[#402612]">
                    {data.tipo_pago === 'contado' ? 'Contado' : 'Crédito'}
                  </Text>
                </View>
              )}
            </View>

            {/* Productos - Header de tabla */}
            <View className="mb-4">
              <Text className="font-poppins-bold text-[#402612] mb-3">Productos</Text>
              
              <View className="flex-row py-2 bg-[#F6EBD7] rounded-lg px-2 mb-2">
                <Text className="flex-[2] text-xs font-poppins-semibold text-[#8B5A3C]">Producto</Text>
                <Text className="flex-1 text-xs font-poppins-semibold text-[#8B5A3C] text-center">Und.</Text>
                <Text className="flex-1 text-xs font-poppins-semibold text-[#8B5A3C] text-center">Cant.</Text>
                <Text className="flex-1 text-xs font-poppins-semibold text-[#8B5A3C] text-right">Precio</Text>
                <Text className="flex-1 text-xs font-poppins-semibold text-[#8B5A3C] text-right">Total</Text>
              </View>

              {detalles.length > 0 ? (
                detalles.map((item: DetalleItem, index: number) => {
                  const nombre = item.nombreProducto || item.nombreproductoaux || `Producto #${item.productoid || index + 1}`;
                  const nombreCompleto = item.nombreVariante ? `${nombre} - ${item.nombreVariante}` : nombre;
                  const unidad = item.unidad || item.unidadmedida || 'und';
                  const cantidad = item.cantidad || item.cantidadaux || 0;
                  const precio = item.precio_aplicado || item.precio || 0;
                  const subtotal = item.subtotal || (cantidad * precio);

                  return (
                    <View key={index} className="flex-row py-2 px-2 border-b border-gray-100 items-center">
                      <View className="flex-[2]">
                        <Text className="text-xs font-poppins-regular text-[#402612]" numberOfLines={2}>
                          {nombreCompleto}
                        </Text>
                      </View>
                      <Text className="flex-1 text-xs font-poppins-regular text-[#402612] text-center">
                        {unidad}
                      </Text>
                      <Text className="flex-1 text-xs font-poppins-regular text-[#402612] text-center">
                        {cantidad}
                      </Text>
                      <Text className="flex-1 text-xs font-poppins-regular text-[#402612] text-right">
                        {precio.toFixed(2)}
                      </Text>
                      <Text className="flex-1 text-xs font-poppins-semibold text-[#402612] text-right">
                        {subtotal.toFixed(2)}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text className="text-sm text-[#8B5A3C] text-center py-4">No hay productos</Text>
              )}
            </View>

            {/* Total */}
            <View className="pt-3 border-t border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-poppins-black text-[#402612]">TOTAL:</Text>
                <Text className="text-xl font-poppins-black text-[#402612]">Bs. {data.total.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Mensaje de agradecimiento */}
          <View className="bg-[#402612] rounded-2xl p-4 mb-4">
            <Text className="text-center text-[#F6EBD7] font-poppins-semibold">
              ¡Gracias por su {tipo === 'venta' ? 'compra' : 'confianza'}!
            </Text>
            <Text className="text-center text-[#F6EBD7]/80 font-poppins-regular text-xs mt-1">
              Comprobante generado el {formatFecha(new Date())}
            </Text>
          </View>

          {/* Botones de acción */}
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity 
              className="flex-1 flex-col items-center bg-white p-3 rounded-xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 2,
              }}
              onPress={handleCompartir}
              activeOpacity={0.8}
            >
              <View className="w-10 h-10 rounded-xl justify-center items-center mb-1" style={{ backgroundColor: '#3b82f620' }}>
                <Ionicons name="share-social" size={20} color="#3b82f6" />
              </View>
              <Text className="text-xs font-poppins-semibold text-[#402612]">Compartir</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 flex-col items-center bg-white p-3 rounded-xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 2,
              }}
              onPress={handleGenerarPDF}
              activeOpacity={0.8}
            >
              <View className="w-10 h-10 rounded-xl justify-center items-center mb-1" style={{ backgroundColor: '#EF444420' }}>
                <Ionicons name="document-text" size={20} color="#EF4444" />
              </View>
              <Text className="text-xs font-poppins-semibold text-[#402612]">PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 flex-col items-center bg-white p-3 rounded-xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 2,
              }}
              onPress={handleImprimir}
              activeOpacity={0.8}
            >
              <View className="w-10 h-10 rounded-xl justify-center items-center mb-1" style={{ backgroundColor: '#8B5A3C20' }}>
                <Ionicons name="print" size={20} color="#8B5A3C" />
              </View>
              <Text className="text-xs font-poppins-semibold text-[#402612]">Imprimir</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Botón principal */}
        <View className="px-4 pb-6 pt-3 bg-white border-t border-gray-200">
          <TouchableOpacity
            onPress={onButtonPress || onClose}
            className="bg-[#402612] rounded-xl py-4 flex-row items-center justify-center"
            style={{
              shadowColor: '#402612',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Ionicons name="arrow-forward-outline" size={24} color="#F6EBD7" />
            <Text className="text-[#F6EBD7] font-poppins-bold text-lg ml-2">
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};