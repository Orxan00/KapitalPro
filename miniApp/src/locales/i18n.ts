import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en/translation.json';
import ru from './ru/translation.json'; 
import az from './az/translation.json';  

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },  
      az: { translation: az },
    },
    lng: 'az',  
    fallbackLng: 'az',  
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,  
    },
  });
