import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ApiService from '../services/apiService';
import { getLocalMinutes, parseTimeToMinutes } from '../utils/timeSlots';

const RestaurantInfoContext = createContext();

const DEFAULT_INFO = {
  name: '',
  slogan: '',
  address_line: '',
  contact_phone: '',
  contact_email: '',
  opening_time: '09:00',
  closing_time: '22:00',
};

const getFallbackInfo = (t) => ({
  ...DEFAULT_INFO,
  name: t('home.restaurantName'),
  slogan: t('home.restaurantSlogan'),
});

const toHHMM = (timeText, fallback) => {
  if (!timeText) return fallback;
  return String(timeText).slice(0, 5);
};

const normalizeInfo = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return {
      ...DEFAULT_INFO,
    };
  }

  return {
    ...DEFAULT_INFO,
    ...raw,
    name: String(raw.name || '').trim(),
    slogan: String(raw.slogan || '').trim(),
    address_line: String(raw.address_line || '').trim(),
    contact_phone: String(raw.contact_phone || '').trim(),
    contact_email: String(raw.contact_email || '').trim(),
    opening_time: toHHMM(raw.opening_time, DEFAULT_INFO.opening_time),
    closing_time: toHHMM(raw.closing_time, DEFAULT_INFO.closing_time),
  };
};

export const RestaurantInfoProvider = ({ children }) => {
  const { t } = useTranslation();
  const fallbackInfo = useMemo(() => getFallbackInfo(t), [t]);
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
    refreshRestaurantInfo();
  }, [refreshRestaurantInfo]);

  const value = useMemo(() => {
    const openingTime = restaurantInfo.opening_time || fallbackInfo.opening_time;
    const closingTime = restaurantInfo.closing_time || fallbackInfo.closing_time;

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
      restaurantName: restaurantInfo.name || fallbackInfo.name,
      restaurantSlogan: restaurantInfo.slogan || fallbackInfo.slogan,
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
  }, [fallbackInfo, loadingRestaurantInfo, refreshRestaurantInfo, restaurantInfo]);

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

RestaurantInfoProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
