import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "uz", label: "UZ" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher({ dark = false }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.split("-")[0] || "uz";

  return (
    <div
      className={`flex items-center rounded-full border p-0.5 text-xs font-medium ${
        dark ? "border-admin-border" : "border-tile-blue/30"
      }`}
    >
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            current === lang.code
              ? dark
                ? "bg-tile-blue text-white"
                : "bg-tile-blue text-white"
              : dark
              ? "text-admin-muted hover:text-admin-text"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
