import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  // This is a simple mock of a translation hook/function
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    'Dashboard': 'Dashboard',
    'Campanhas': 'Campanhas',
    'Chat': 'Chat',
    // ... add more as needed
  },
  en: {
    'Dashboard': 'Dashboard',
    'Campanhas': 'Campaigns',
    'Chat': 'Chat',
    // ... add more as needed
  },
  es: {
    'Dashboard': 'Dashboard',
    'Campanhas': 'Campañas',
    'Chat': 'Chat',
    // ... add more as needed
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
