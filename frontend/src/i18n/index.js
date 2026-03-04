import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Function to dynamically load translation files (Lazy Loading)
const loadResources = async (lang) => {
    try {
        const resources = await import(`./locales/${lang}.json`);
        return resources.default;
    } catch (err) {
        console.error(`Failed to load translations for ${lang}`, err);
        return {};
    }
};

const resources = {
    en: { translation: await import('./locales/en.json').then(m => m.default) },
    hi: { translation: await import('./locales/hi.json').then(m => m.default) },
    bn: { translation: await import('./locales/bn.json').then(m => m.default) },
    mr: { translation: await import('./locales/mr.json').then(m => m.default) },
    te: { translation: await import('./locales/te.json').then(m => m.default) },
    ta: { translation: await import('./locales/ta.json').then(m => m.default) },
    gu: { translation: await import('./locales/gu.json').then(m => m.default) },
    kn: { translation: await import('./locales/kn.json').then(m => m.default) },
    ml: { translation: await import('./locales/ml.json').then(m => m.default) },
    or: { translation: await import('./locales/or.json').then(m => m.default) },
    pa: { translation: await import('./locales/pa.json').then(m => m.default) },
    as: { translation: await import('./locales/as.json').then(m => m.default) },
    ur: { translation: await import('./locales/ur.json').then(m => m.default) }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: ['en', 'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 'as', 'ur'],
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
        },
    });


export default i18n;
