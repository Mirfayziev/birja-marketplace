import { useTranslation } from "react-i18next";
import TilePattern from "./TilePattern";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-sand bg-tile-blue-deep text-white">
      <div className="pointer-events-none absolute inset-0 text-white">
        <TilePattern opacity={0.06} />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="font-display text-xl font-bold">
              Birja<span className="text-saffron">Market</span>
            </div>
            <p className="mt-2 max-w-sm text-sm text-white/70">{t("footer.tagline")}</p>
          </div>
          <div className="text-xs text-white/50">
            XT-Xarid · Uzex Xarid · Cooperation.uz
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-4 text-xs text-white/40">
          © {new Date().getFullYear()} BirjaMarket. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
