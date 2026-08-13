const translations = {
  en: {
    planetaryWeight: {
      tabLabel: 'Planetary Weight',
      title: 'Planetary Weight Calculator',
      earthWeightLabel: 'Earth Weight (lbs)',
      calculateButton: 'Calculate',
      tableHeaderBody: 'Body',
      tableHeaderWeight: 'Weight',
      tableHeaderRelative: 'Relative to Jupiter',
      errorPositiveNumber: 'Weight must be a positive number',
      unitLbs: 'lbs',
      bodies: {
        Mercury: 'Mercury',
        Venus: 'Venus',
        Moon: 'Moon',
        Mars: 'Mars',
        Jupiter: 'Jupiter',
        Saturn: 'Saturn',
        Uranus: 'Uranus',
        Neptune: 'Neptune',
        Pluto: 'Pluto',
        Titan: 'Titan',
      },
    },
  },
  la: {
    planetaryWeight: {
      tabLabel: 'Pondus Planetarium',
      title: 'Calculus Ponderis Planetarii',
      earthWeightLabel: 'Pondus Terrestris (lb)',
      calculateButton: 'Computare',
      tableHeaderBody: 'Corpus',
      tableHeaderWeight: 'Pondus',
      tableHeaderRelative: 'Relatum ad Iovem',
      errorPositiveNumber: 'Pondus numerum positivum esse debet',
      unitLbs: 'lb',
      bodies: {
        Mercury: 'Mercurius',
        Venus: 'Venus',
        Moon: 'Luna',
        Mars: 'Mars',
        Jupiter: 'Iuppiter',
        Saturn: 'Saturnus',
        Uranus: 'Uranus',
        Neptune: 'Neptunus',
        Pluto: 'Pluto',
        Titan: 'Titan',
      },
    },
  },
};

function t(key, locale) {
  const parts = key.split('.');
  let value = translations[locale];

  for (const part of parts) {
    if (value === undefined || value === null) {
      break;
    }
    value = value[part];
  }

  if (value === undefined) {
    let enValue = translations.en;
    for (const part of parts) {
      if (enValue === undefined || enValue === null) {
        break;
      }
      enValue = enValue[part];
    }

    if (enValue !== undefined && locale !== 'en') {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(`Missing translation key "${key}" for locale "${locale}"; falling back to English`);
      }
      return enValue;
    }

    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`Translation key "${key}" not found in any locale`);
    }
    return undefined;
  }

  return value;
}

function getLocale() {
  if (typeof localStorage === 'undefined') {
    return 'en';
  }

  try {
    const stored = localStorage.getItem('calculator-locale');
    if (stored === 'en' || stored === 'la') {
      return stored;
    }
  } catch (e) {
    /* localStorage unavailable */
  }

  return 'en';
}

function setLocale(locale) {
  if (locale !== 'en' && locale !== 'la') {
    throw new TypeError(`Invalid locale: "${locale}". Must be 'en' or 'la'.`);
  }

  if (typeof localStorage === 'undefined') {
    throw new TypeError('localStorage is not available');
  }

  try {
    localStorage.setItem('calculator-locale', locale);
  } catch (e) {
    throw new TypeError(`Failed to set locale in localStorage: ${e.message}`);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { translations, t, getLocale, setLocale };
}
if (typeof window !== 'undefined') {
  window.Translations = { translations, t, getLocale, setLocale };
}
