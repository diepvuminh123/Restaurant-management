import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import viTranslation from './locales/vi/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  vi: {
    translation: viTranslation
  }
};

i18n
  // Phát hiện ngôn ngữ từ trình duyệt
  .use(LanguageDetector)
  // Tích hợp với React
  .use(initReactI18next)
  // Khởi tạo i18next
  .init({
    resources,
    fallbackLng: 'vi', // Ngôn ngữ mặc định là tiếng Việt
    lng: 'vi', // Ngôn ngữ khởi đầu
    debug: false, // Bật debug mode khi phát triển (có thể chuyển thành true nếu cần)
    
    interpolation: {
      escapeValue: false // React đã tự động escape
    },

    // Cấu hình phát hiện ngôn ngữ
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    }
  });

export default i18n;
