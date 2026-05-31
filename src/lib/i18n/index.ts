/* eslint-disable react-refresh/only-export-components */

/**
 * Page-level i18n support.
 *
 * Each admin page declares its own translations in `src/lib/i18n/pages/<name>/`
 * as `ar.json`, `fr.json`, `en.json`.
 *
 * The `usePageTranslation` hook merges page-specific keys with the base
 * (shared) translations from `LanguageContext`, so pages can use both
 * shared keys (nav_*, sign_out, …) and their own keys without clashes.
 */

export type Language = 'ar' | 'fr' | 'en';

export type PageTranslationSet = Record<Language, Record<string, string>>;

/**
 * Creates a merged translation function.
 * Page keys take priority over base (shared) keys.
 * Returns the key itself as a fallback if neither base nor page has it.
 */
export function createPageT(
  baseT: (key: string) => string,
  pageTranslations: PageTranslationSet,
  language: Language,
): (key: string) => string {
  const langData = pageTranslations[language] ?? {};
  return (key: string) => {
    if (key in langData) return langData[key];
    return baseT(key);
  };
}
