import { useMemo } from 'react';
import { useLanguage } from '../LanguageContext';
import { createPageT, type PageTranslationSet, type Language } from './index';

/**
 * Hook that merges page-specific JSON translations on top of the shared
 * translations from LanguageContext.
 *
 * @param pageTranslations – object keyed by language, each containing
 *   a flat `Record<string, string>` of page-specific keys.
 *
 * Usage in a page component:
 * ```ts
 * import ar from '../lib/i18n/pages/dashboard/ar.json';
 * import en from '../lib/i18n/pages/dashboard/en.json';
 * import fr from '../lib/i18n/pages/dashboard/fr.json';
 * import { usePageTranslation } from '../lib/i18n/usePageTranslation';
 *
 * const { t, language, isRtl } = usePageTranslation({ ar, en, fr });
 * ```
 */
export function usePageTranslation(pageTranslations: PageTranslationSet) {
  const { t: baseT, language, isRtl } = useLanguage();

  const t = useMemo(
    () => createPageT(baseT, pageTranslations, language),
    [baseT, pageTranslations, language],
  );

  return { t, language, isRtl };
}
