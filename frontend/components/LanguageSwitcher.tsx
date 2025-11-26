'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="flex gap-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-2">
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            language === 'en'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('uk')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            language === 'uk'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🇺🇦 UA
        </button>
      </div>
    </div>
  );
}
