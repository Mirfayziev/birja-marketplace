import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apiClient from "../api/client";
import ProductCard from "../components/ProductCard";

const PURCHASE_FILTERS = ["", "naqd", "birja", "ikkalasi"];

export default function CategoryPage() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { t, i18n } = useTranslation();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [purchaseType, setPurchaseType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    const params = { per_page: 40 };
    if (categoryId && categoryId !== "all") params.category_id = categoryId;
    if (query) params.q = query;
    if (purchaseType) params.purchase_type = purchaseType;

    apiClient
      .get("/api/products", { params })
      .then((res) => !ignore && setProducts(res.data.items))
      .finally(() => !ignore && setLoading(false));

    if (categoryId && categoryId !== "all") {
      apiClient
        .get(`/api/categories/${categoryId}`)
        .then((res) => !ignore && setCategory(res.data))
        .catch(() => {});
    } else {
      setCategory(null);
    }

    return () => {
      ignore = true;
    };
  }, [categoryId, query, purchaseType, i18n.language]);

  const title = query ? `"${query}"` : category?.name || t("nav.categories");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-tile-blue-deep">{title}</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {PURCHASE_FILTERS.map((pt) => (
          <button
            key={pt || "all"}
            onClick={() => setPurchaseType(pt)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              purchaseType === pt
                ? "border-tile-blue bg-tile-blue text-white"
                : "border-sand text-ink/60 hover:border-tile-blue/40"
            }`}
          >
            {pt ? t(`purchase_type.${pt}`) : t("nav.categories")}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-sand/40" />
            ))
          : products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {!loading && products.length === 0 && (
        <p className="mt-10 text-center text-ink/50">— {t("cart.empty")} —</p>
      )}
    </div>
  );
}
