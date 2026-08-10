import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apiClient from "../api/client";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import TilePattern from "../components/TilePattern";

export default function Home() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    Promise.all([
      apiClient.get("/api/categories", { params: { parent_id: "root" } }),
      apiClient.get("/api/products", { params: { per_page: 8 } }),
    ])
      .then(([catRes, prodRes]) => {
        if (ignore) return;
        setCategories(catRes.data);
        setProducts(prodRes.data.items);
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [i18n.language]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 text-tile-blue">
          <TilePattern opacity={0.05} />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
          <div className="flex flex-col justify-center">
            <span className="w-fit rounded-full bg-saffron/15 px-3 py-1 text-xs font-semibold text-saffron-deep">
              {t("hero.eyebrow")}
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-tile-blue-deep sm:text-4xl md:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-4 max-w-md text-ink/70">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#kategoriyalar"
                className="rounded-full bg-neon-green px-6 py-3 font-semibold text-ink shadow-neon-sm transition hover:bg-neon-green-deep hover:text-white"
              >
                {t("hero.cta_browse")}
              </a>
              <a
                href="#qanday-ishlaydi"
                className="rounded-full border border-tile-blue/30 px-6 py-3 font-medium text-tile-blue-deep transition hover:bg-tile-blue/5"
              >
                {t("hero.cta_how")}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 self-center">
            {["XT-Xarid", "Uzex Xarid", "Cooperation.uz"].map((name, i) => (
              <div
                key={name}
                className={`rounded-2xl border border-sand bg-paper p-5 ${i === 2 ? "col-span-2" : ""}`}
              >
                <div className="mb-2 h-2 w-8 rounded-full bg-saffron" />
                <div className="font-display text-sm font-bold text-tile-blue-deep">{name}</div>
                <div className="mt-1 text-xs text-ink/50">
                  {t("product.related_lots")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KATEGORIYALAR */}
      <section id="kategoriyalar" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-xl font-bold text-tile-blue-deep">
          {t("nav.categories")}
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-sand/40" />
              ))
            : categories.map((c) => <CategoryCard key={c.id} category={c} />)}
        </div>
      </section>

      {/* YANGI MAHSULOTLAR */}
      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-tile-blue-deep">
              {t("hero.cta_browse")}
            </h2>
            <Link to="/kategoriya/all" className="text-sm font-medium text-tile-blue hover:underline">
              →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* BIRJA QANDAY ISHLAYDI */}
      <section id="qanday-ishlaydi" className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-xl font-bold text-tile-blue-deep">
            {t("hero.cta_how")}
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              { n: "01", key: "product.buy_exchange" },
              { n: "02", key: "product.choose_exchange" },
              { n: "03", key: "product.go_to_lot" },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-saffron/15 font-mono text-sm font-bold text-saffron-deep">
                  {step.n}
                </div>
                <p className="mt-3 text-sm font-medium text-ink">{t(step.key)}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm text-ink/60">
            {t("product.exchange_note")}
          </p>
        </div>
      </section>
    </div>
  );
}
