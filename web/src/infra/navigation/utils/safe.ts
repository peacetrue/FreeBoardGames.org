import { IGameDef } from 'gamesShared/definitions/game';
import { Language } from 'infra/i18n';
import { getI18n } from 'server/config/i18n';

export const getLanguagePrefix = (language: Language) => {
  const isEnabled = process.env.NEXT_PUBLIC_I18N_ENABLED === 'true';
  return isEnabled ? getLanguage(language) : null;
};

export const getSafeGameCode = (game: IGameDef, language: Language) => {
  const safeLanguage = getLanguagePrefix(language);
  return game?.codes?.[safeLanguage] || game?.code;
};

export const getLanguage = (language: Language, defaultLanguage: Language = 'en') => {
  const i18n = getI18n();
  return i18n.locales.includes(language) ? language : defaultLanguage;
};
