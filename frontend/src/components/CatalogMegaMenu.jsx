import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apiClient from "../api/client";

function CategoryIcon({ label }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neon-green/10 font-display text-xs font-bold text-neon-green-deep">
      {label?.[0]?.toUpperCase()}
    </span>
  );
}

export default function CatalogMegaMenu({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const [roots, setRoots] = useState([]);
  const [loadingRoots, setLoadingRoots] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const cacheRef = useRef({});

  // Ildiz kategoriyalarni yuklash
  useEffect(() => {
    if (!open) return;
    let ignore = false;
    cacheRef.current = {};
    setLoadingRoots(true);
    apiClient
      .get("/api/categories", { params: { parent_id: "root" } })
      .then((res) => {
        if (ignore) return;
        setRoots(res.data);
        setActiveId(res.data[0]?.id ?? null);
      })
      .finally(() => !ignore && setLoadingRoots(false));
    return () => {
      ignore = true;
    };
  }, [open, i18n.language]);

  // Faol kategoriyaning ustunlarini (bolalar + nabiralar) yuklash
  useEffect(() => {
    if (!open || !activeId) {
      setColumns([]);
      return;
    }
    if (cacheRef.current[activeId]) {
      setColumns(cacheRef.current[activeId]);
      return;
    }
    let ignore = false;
    setLoadingColumns(true);
    apiClient
      .get("/api/categories", { params: { parent_id: activeId } })
      .then(async (res) => {
        const children = res.data;
        const withGrandchildren = await Promise.all(
          children.map((child) =>
            apiClient
              .get("/api/categories", { params: { parent_id: child.id } })
              .then((r) => ({ id: child.id, name: child.name, items: r.data }))
          )
        );
        if (ignore) return;

        const groups = withGrandchildren.filter((g) => g.items.length > 0);
        const singles = withGrandchildren.filter((g) => g.items.length === 0);

        const result = [...groups];
        if (singles.length > 0) {
          result.push({
            id: `${activeId}-singles`,
            name: t("nav.categories"),
            items: singles.map((s) => ({ id: s.id, name: s.name })),
          });
        }
        cacheRef.current[activeId] = result;
        setColumns(result);
      })
      .finally(() => !ignore && setLoadingColumns(false));
    return () => {
      ignore = true;
    };
  }, [open, activeId, t]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        aria-label="close"
        onClick={onClose}
        className="fixed inset-0 z-30 cursor-default bg-ink/20 backdrop-blur-[1px]"
      />
      <div className="absolute inset-x-0 top-full z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex max-h-[70vh] overflow-hidden rounded-b-2xl border border-t-0 border-neon-green/30 bg-white shadow-neon">
            {/* Chap: ildiz kategoriyalar */}
            <div className="w-64 shrink-0 overflow-y-auto border-r border-sand bg-paper/60 py-3">
              {loadingRoots ? (
                <div className="space-y-2 px-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-9 animate-pulse rounded-xl bg-sand/50" />
                  ))}
                </div>
              ) : roots.length === 0 ? (
                <p className="px-4 py-6 text-sm text-ink/40">{t("nav.no_categories")}</p>
              ) : (
                roots.map((cat) => (
                  <button
                    key={cat.id}
                    onMouseEnter={() => setActiveId(cat.id)}
                    onClick={() => setActiveId(cat.id)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                      activeId === cat.id
                        ? "border-l-2 border-neon-green bg-neon-green/10 font-semibold text-ink"
                        : "border-l-2 border-transparent text-ink/70 hover:bg-white"
                    }`}
                  >
                    <CategoryIcon label={cat.name} />
                    <span className="flex-1 truncate">{cat.name}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-50">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))
              )}
            </div>

            {/* O'ng: tanlangan kategoriyaning ustunlari */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingColumns ? (
                <div className="grid grid-cols-3 gap-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-sand/50" />
                      <div className="h-3 w-32 animate-pulse rounded bg-sand/30" />
                      <div className="h-3 w-28 animate-pulse rounded bg-sand/30" />
                    </div>
                  ))}
                </div>
              ) : columns.length === 0 ? (
                <div className="flex h-full flex-col items-start justify-center gap-3">
                  <p className="text-sm text-ink/40">{t("nav.no_subcategories")}</p>
                  {activeId && (
                    <Link
                      to={`/kategoriya/${activeId}`}
                      onClick={onClose}
                      className="rounded-full bg-neon-green px-4 py-2 text-sm font-semibold text-ink shadow-neon-sm transition hover:bg-neon-green-deep hover:text-white"
                    >
                      {t("nav.view_all")}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-3">
                  {columns.map((col) => (
                    <div key={col.id}>
                      <h3 className="font-display text-sm font-bold text-ink">{col.name}</h3>
                      <ul className="mt-3 space-y-2">
                        {col.items.map((item) => (
                          <li key={item.id}>
                            <Link
                              to={`/kategoriya/${item.id}`}
                              onClick={onClose}
                              className="text-sm text-ink/60 transition hover:text-neon-blue-deep hover:underline"
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
