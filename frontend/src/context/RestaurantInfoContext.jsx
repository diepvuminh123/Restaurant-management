import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ApiService from '../services/apiService';
import { getLocalMinutes, parseTimeToMinutes } from '../utils/timeSlots';

const RestaurantInfoContext = createContext();

const FALLBACK_INFO = {
  name: 'Nhà hàng',
  slogan: 'Hương vị truyền thống',
  address_line: '',
  contact_phone: '',
  contact_email: '',
  opening_time: '09:00',
  closing_time: '22:00',
};

const toHHMM = (timeText, fallback) => {
  if (!timeText) return fallback;
  return String(timeText).slice(0, 5);
};

const normalizeInfo = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return {
      ...FALLBACK_INFO,
    };
  }

  return {
    ...FALLBACK_INFO,
    ...raw,
    name: String(raw.name || FALLBACK_INFO.name).trim(),
    slogan: String(raw.slogan || FALLBACK_INFO.slogan).trim(),
    address_line: String(raw.address_line || '').trim(),
    contact_phone: String(raw.contact_phone || '').trim(),
    contact_email: String(raw.contact_email || '').trim(),
    opening_time: toHHMM(raw.opening_time, FALLBACK_INFO.opening_time),
    closing_time: toHHMM(raw.closing_time, FALLBACK_INFO.closing_time),
  };
};

export const RestaurantInfoProvider = ({ children }) => {
  const [restaurantInfo, setRestaurantInfo] = useState(() => normalizeInfo(null));
  const [loadingRestaurantInfo, setLoadingRestaurantInfo] = useState(true);

  const refreshRestaurantInfo = useCallback(async () => {
    setLoadingRestaurantInfo(true);
    try {
      const response = await ApiService.getRestaurantInfo();
      setRestaurantInfo(normalizeInfo(response?.data));
    } catch {
      setRestaurantInfo((prev) => normalizeInfo(prev));
    } finally {
      setLoadingRestaurantInfo(false);
    }
  }, []);

  useEffect(() => {
    void refreshRestaurantInfo();
  }, [refreshRestaurantInfo]);

  const value = useMemo(() => {
    const openingTime = restaurantInfo.opening_time || FALLBACK_INFO.opening_time;
    const closingTime = restaurantInfo.closing_time || FALLBACK_INFO.closing_time;

    const openingMinutes = parseTimeToMinutes(openingTime);
    const closingMinutes = parseTimeToMinutes(closingTime);
    const nowMinutes = getLocalMinutes(new Date());

    const isOpenNow =
      Number.isFinite(openingMinutes) &&
      Number.isFinite(closingMinutes) &&
      nowMinutes >= openingMinutes &&
      nowMinutes < closingMinutes;

    return {
      restaurantInfo,
      loadingRestaurantInfo,
      refreshRestaurantInfo,
      restaurantName: restaurantInfo.name || FALLBACK_INFO.name,
      restaurantSlogan: restaurantInfo.slogan || FALLBACK_INFO.slogan,
      contactPhone: restaurantInfo.contact_phone || '',
      contactEmail: restaurantInfo.contact_email || '',
      addressLine: restaurantInfo.address_line || '',
      openingTime,
      closingTime,
      openingMinutes,
      closingMinutes,
      isOpenNow,
      timeRangeLabel: `${openingTime} - ${closingTime}`,
    };
  }, [loadingRestaurantInfo, refreshRestaurantInfo, restaurantInfo]);

  return (
    <RestaurantInfoContext.Provider value={value}>
      {children}
    </RestaurantInfoContext.Provider>
  );
};

export const useRestaurantInfoContext = () => {
  const context = useContext(RestaurantInfoContext);
  if (!context) {
    throw new Error('useRestaurantInfoContext must be used within RestaurantInfoProvider');
  }
  return context;
};
