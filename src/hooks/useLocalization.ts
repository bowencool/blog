import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export const useLocalization = () => {
  const { i18n } = useTranslation();
  const localizePath = useCallback(
    (path: string) => {
      const currentLanguage = i18n.language;
      if (currentLanguage === "en") {
        return path;
      }
      return `/${currentLanguage}${path}`;
    },
    [i18n.language]
  );
  // todo: localize url
  // const localizeUrl = useCallback(
  //   (url: string) => {
  //     const currentLanguage = i18n.language;
  //     if (currentLanguage === "en") {
  //     }
  //   },
  //   [i18n.language]
  // );
  return { localizePath };
};
