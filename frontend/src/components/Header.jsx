import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/client";
import LanguageSwitcher from "./LanguageSwitcher";
import CatalogMegaMenu from "./CatalogMegaMenu";

const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE;

function NavIcon({ to, label, count, children }) {
  return (
    <Link to={to} className="group flex flex-col items-center gap-0.5 px-1 text-ink/70 transition hover:text-neon-green-deep">
      <span className="relative">
        {children}
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-neon-green px-1 text-[10px] font-bold text-ink">
            {count}
          </span>
        )}
      </span>
      <span className="hidden text-[11px] font-medium sm:block">{label}</span>
    </Link>
  );
}

export default function Header() {
  const { t, i18n } = useTranslation();
  const { totalCount } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [quickCategories, setQuickCategories] = useState([]);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/qidiruv?q=${encodeURIComponent(query.trim())}`);
      setCatalogOpen(false);
    }
  }

  // Sahifa manzili o'zgarsa katalog menyusini yopish
  useEffect(() => {
    setCatalogOpen(false);
  }, [location.pathname]);

  // Ikkinchi qator uchun tezkor kategoriya havolalari
  useEffect(() => {
    let ignore = false;
    apiClient
      .get("/api/categories", { params: { parent_id: "root" } })
      .then((res) => {
        if (!ignore) setQuickCategories(res.data.slice(0, 6));
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [i18n.language]);

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-white">
      <div className="relative">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0 font-display text-lg font-bold text-tile-blue-deep">
            Birja<span className="text-neon-green-deep">Market</span>
          </Link>

          <button
            type="button"
            onClick={() => setCatalogOpen((v) => !v)}
            aria-expanded={catalogOpen}
            className={`hidden shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-neon-sm transition sm:flex ${
              catalogOpen
                ? "bg-ink text-white"
                : "bg-neon-green text-ink hover:bg-neon-green-deep hover:text-white"
            }`}
          >
            {catalogOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            )}
            {t("nav.catalog")}
          </button>

          <form onSubmit={handleSearch} className="hidden flex-1 sm:block">
            <div className="relative max-w-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("nav.search_placeholder")}
                className="w-full rounded-full border border-sand bg-paper/60 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-neon-green focus:bg-white focus:shadow-neon-sm"
              />
            </div>
          </form>

          <nav className="ml-auto flex items-center gap-4">
            <NavIcon to="/buyurtmalarim" label={t("nav.my_orders")}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7l8-4 8 4v10l-8 4-8-4V7Z" strokeLinejoin="round" />
                <path d="M4 7l8 4 8-4M12 11v10" strokeLinejoin="round" />
              </svg>
            </NavIcon>

            <NavIcon to="/sevimlilar" label={t("nav.wishlist")} count={wishlistCount}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 20.5s-7.5-4.6-9.8-9.2C.7 8 2.3 4.8 5.4 4.1c2-.5 3.9.3 5 1.9.9 1.3.9 1.3 1.6 1.3s.7 0 1.6-1.3c1.1-1.6 3-2.4 5-1.9 3.1.7 4.7 3.9 3.2 7.2C19.5 15.9 12 20.5 12 20.5Z" strokeLinejoin="round" />
              </svg>
            </NavIcon>

            <NavIcon to="/savat" label={t("nav.cart")} count={totalCount}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
                <path d="M2.5 3h2l2.2 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </NavIcon>

            <NavIcon to={user ? "/buyurtmalarim" : "/kirish"} label={user ? user.full_name?.split(" ")[0] || t("nav.profile") : t("nav.login")}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="3.6" />
                <path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" strokeLinecap="round" />
              </svg>
            </NavIcon>
          </nav>
        </div>

        {/* Ikkinchi qator: tezkor kategoriyalar, telefon, admin/chiqish, til */}
        <div className="hidden border-t border-sand/70 sm:block">
          <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-2 text-xs sm:px-6 lg:px-8">
            {quickCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/kategoriya/${cat.id}`}
                className="font-medium text-ink/70 transition hover:text-neon-green-deep"
              >
                {cat.name}
              </Link>
            ))}

            <span className="ml-auto flex items-center gap-5">
              {SUPPORT_PHONE && (
                <a href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`} className="flex items-center gap-1.5 font-semibold text-ink/80 hover:text-neon-green-deep">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 5c0 8.3 6.7 15 15 15l3-3-5-4-2 2a11 11 0 0 1-6-6l2-2-4-5-3 3Z" strokeLinejoin="round" />
                  </svg>
                  {SUPPORT_PHONE}
                </a>
              )}
              {isAdmin && (
                <Link to="/admin" className="font-semibold text-tile-blue hover:underline">
                  {t("nav.admin_panel")}
                </Link>
              )}
              {user && (
                <button onClick={logout} className="text-ink/50 hover:text-ink">
                  {t("nav.logout")}
                </button>
              )}
              <LanguageSwitcher />
            </span>
          </div>
        </div>

        <CatalogMegaMenu open={catalogOpen} onClose={() => setCatalogOpen(false)} />
      </div>
    </header>
  );
}
