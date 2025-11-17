
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { translations } from '../translations';

type Language = 'en' | 'kh';
type TranslationsType = typeof translations.en;

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: TranslationsType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Function to detect browser language
const detectBrowserLanguage = (): Language => {
  // On the server side, return a default language
  if (typeof window === 'undefined') {
    return 'en'; // Default to English on server
  }

  // List of language codes that should default to Khmer
  const khmerLanguages = ['km', 'km-KH', 'kh'];
  
  try {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('preferredLanguage') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'kh')) {
      return savedLanguage;
    }

    // Check navigator languages
    const languages = navigator.languages || [navigator.language];
    
    // Check if any of the browser's languages should default to Khmer
    const shouldUseKhmer = languages.some(lang =>
      khmerLanguages.includes(lang.toLowerCase())
    );

    // Check if the user is accessing from Cambodia (based on browser language)
    const isFromCambodia = languages.some(lang =>
      lang.toLowerCase().includes('kh') || lang.toLowerCase().includes('km')
    );

    return shouldUseKhmer || isFromCambodia ? 'kh' : 'en';
  } catch (error) {
    // Default to Khmer if there's any error
    console.warn('Error detecting language:', error);
    return 'kh';
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en'); // Default on server

  useEffect(() => {
    // Update the state with the browser language after mounting
    setLanguageState(detectBrowserLanguage());
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferredLanguage', lang);
      }
    } catch (error) {
      console.warn('Error saving language preference:', error);
    }
  };

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'kh' : 'en';
    setLanguage(newLang);
  };

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language === 'kh' ? 'km' : 'en';
    }
  }, [language]);

  const t = language === 'en' ? translations.en : translations.kh;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
