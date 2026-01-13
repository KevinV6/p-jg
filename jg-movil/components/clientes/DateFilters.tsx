import { Ionicons } from '@expo/vector-icons';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, parse, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export type FilterType = 'all' | 'today' | 'week' | 'month' | 'custom';

interface DateFilterProps {
  dateRange: DateRange | null;
  filterType: FilterType;
  onFilterChange: (range: DateRange | null, type: FilterType) => void;
}

// Función para formatear fecha para mostrar
const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy', { locale: es });
};

// Función para parsear fecha de string
const parseDate = (dateStr: string): Date | null => {
  const parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
  return isValid(parsed) ? parsed : null;
};

// Botones rápidos de filtro
export function DateFilterButtons({ 
  filterType, 
  onFilterChange 
}: DateFilterProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);
  
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [startDateText, setStartDateText] = useState(formatDate(new Date()));
  const [endDateText, setEndDateText] = useState(formatDate(new Date()));

  const getFilterRange = (type: FilterType): DateRange | null => {
    const now = new Date();
    switch (type) {
      case 'today':
        return { startDate: now, endDate: now };
      case 'week':
        return { 
          startDate: startOfWeek(now, { weekStartsOn: 1 }), 
          endDate: endOfWeek(now, { weekStartsOn: 1 }) 
        };
      case 'month':
        return { 
          startDate: startOfMonth(now), 
          endDate: endOfMonth(now) 
        };
      default:
        return null;
    }
  };

  const handleFilterPress = (type: FilterType) => {
    if (type === 'custom') {
      setStartDateText(formatDate(new Date()));
      setEndDateText(formatDate(new Date()));
      setShowCustomModal(true);
    } else {
      const range = getFilterRange(type);
      onFilterChange(range, type);
    }
  };

  const handleApplyCustom = () => {
    const startDate = parseDate(startDateText);
    const endDate = parseDate(endDateText);

    if (!startDate || !endDate) {
      Alert.alert('Error', 'Formato de fecha inválido. Use dd/mm/aaaa');
      return;
    }

    if (startDate > endDate) {
      Alert.alert('Error', 'La fecha inicial no puede ser mayor a la fecha final');
      return;
    }

    onFilterChange({ startDate, endDate }, 'custom');
    setShowCustomModal(false);
  };

  const handleQuickDate = (days: number) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    setStartDateText(formatDate(startDate));
    setEndDateText(formatDate(endDate));
  };

  const handleQuickMonths = (months: number) => {
    const endDate = new Date();
    const startDate = subMonths(endDate, months);
    setStartDateText(formatDate(startDate));
    setEndDateText(formatDate(endDate));
  };

  const filterButtons = [
    { type: 'all' as FilterType, label: 'Todas' },
    { type: 'today' as FilterType, label: 'Hoy' },
    { type: 'week' as FilterType, label: 'Semana' },
    { type: 'month' as FilterType, label: 'Mes' },
    { type: 'custom' as FilterType, label: 'Rango' },
  ];

  return (
    <>
      {/* Filtros de fecha */}
      <View className="flex-row px-4 py-3 gap-2">
        {filterButtons.map((btn) => {
          const isActive = filterType === btn.type;
          return (
            <TouchableOpacity
              key={btn.type}
              onPress={() => handleFilterPress(btn.type)}
              className={`flex-1 py-2 rounded-xl items-center ${
                isActive ? 'bg-[#402612]' : 'bg-[#F6EBD7] border border-[#8B5A3C]'
              }`}
            >
              <Text
                className={`font-poppins-semibold text-sm ${
                  isActive ? 'text-[#F6EBD7]' : 'text-[#402612]'
                }`}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modal de rango personalizado */}
      <Modal
        visible={showCustomModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCustomModal(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-4">
            <View 
              className="bg-[#F6EBD7] rounded-2xl w-full max-w-md"
              style={{ maxHeight: '80%' }}
            >
              <View className="flex-row justify-between items-center p-4 border-b border-[#E5E5E5]">
                <Text className="text-xl font-poppins-bold text-[#402612]">
                  Seleccionar Rango
                </Text>
                <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                  <Ionicons name="close-circle-outline" size={28} color="#8B5A3C" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                className="p-4"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 10 }}
              >
                {/* Fecha Desde */}
                <View className="mb-4">
                  <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
                    Desde (dd/mm/aaaa)
                  </Text>
                  <TextInput
                    value={startDateText}
                    onChangeText={setStartDateText}
                    placeholder="01/01/2024"
                    placeholderTextColor="#8B5A3C80"
                    className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 text-base font-poppins-regular text-[#402612]"
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>

                {/* Fecha Hasta */}
                <View className="mb-4">
                  <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
                    Hasta (dd/mm/aaaa)
                  </Text>
                  <TextInput
                    value={endDateText}
                    onChangeText={setEndDateText}
                    placeholder="31/12/2024"
                    placeholderTextColor="#8B5A3C80"
                    className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 text-base font-poppins-regular text-[#402612]"
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>

                {/* Atajos rápidos */}
                <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-3">
                  Atajos rápidos
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  <TouchableOpacity
                    onPress={() => handleQuickDate(7)}
                    className="bg-white border border-[#8B5A3C] rounded-lg px-3 py-2"
                  >
                    <Text className="text-sm font-poppins-regular text-[#402612]">
                      Últimos 7 días
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickDate(30)}
                    className="bg-white border border-[#8B5A3C] rounded-lg px-3 py-2"
                  >
                    <Text className="text-sm font-poppins-regular text-[#402612]">
                      Últimos 30 días
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickMonths(3)}
                    className="bg-white border border-[#8B5A3C] rounded-lg px-3 py-2"
                  >
                    <Text className="text-sm font-poppins-regular text-[#402612]">
                      Últimos 3 meses
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Botones - Fijos en la parte inferior */}
              <View className="flex-row gap-3 p-4 border-t border-[#E5E5E5]">
                <TouchableOpacity
                  onPress={() => setShowCustomModal(false)}
                  className="flex-1 bg-white border border-[#8B5A3C] rounded-xl py-3"
                >
                  <Text className="text-center text-[#402612] font-poppins-semibold">
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleApplyCustom}
                  className="flex-1 bg-[#402612] rounded-xl py-3"
                >
                  <Text className="text-center text-[#F6EBD7] font-poppins-semibold">
                    Aplicar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

// Filtro de tipo de venta (contado/crédito)
interface TipoVentaFilterProps {
  tipoFilter: 'all' | 'contado' | 'credito';
  onTipoChange: (tipo: 'all' | 'contado' | 'credito') => void;
}

export function TipoVentaFilter({ tipoFilter, onTipoChange }: TipoVentaFilterProps) {
  const buttons = [
    { type: 'all' as const, label: 'Todas' },
    { type: 'contado' as const, label: 'Contado' },
    { type: 'credito' as const, label: 'Crédito' },
  ];

  return (
    <View className="flex-row px-4 pb-3 gap-2">
      {buttons.map((btn) => {
        const isActive = tipoFilter === btn.type;
        return (
          <TouchableOpacity
            key={btn.type}
            onPress={() => onTipoChange(btn.type)}
            className={`flex-1 py-2 rounded-xl items-center ${
              isActive ? 'bg-[#402612]' : 'bg-[#F6EBD7] border border-[#8B5A3C]'
            }`}
          >
            <Text
              className={`font-poppins-semibold text-sm ${
                isActive ? 'text-[#F6EBD7]' : 'text-[#402612]'
              }`}
            >
              {btn.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
