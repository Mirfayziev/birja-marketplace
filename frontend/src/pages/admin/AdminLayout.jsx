import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";

const NAV_ITEMS = [
  { to: "/admin", key: "admin.dashboard", end: true },
  { to: "/admin/mahsulotlar", key: "admin.products" },
  { to: "/admin/kategoriyalar", key: "admin.categories" },
  { to: "/admin/buyurtmalar", key: "admin.orders" },
  { to: "/admin/excel-import", key: "admin.excel_import" },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, isAdmin, logout } = useAuth();

  if (!user) return <Navigate to="/kirish" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-admin-bg bg-gradient-to-br from-admin-bg to-admin-bg2 text-admin-text">
      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-admin-border p-5 md:flex">
          <div className="font-display text-lg font-bold text-white">
            Birja<span className="text-saffron">Market</span>
            <div className="text-xs font-normal text-admin-muted">{t("admin.dashboard")}</div>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "glass-card text-white"
                      : "text-admin-muted hover:bg-white/5 hover:text-admin-text"
                  }`
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3 border-t border-admin-border pt-4">
            <LanguageSwitcher dark />
            <button
              onClick={logout}
              className="w-full rounded-xl border border-admin-border px-3 py-2 text-left text-sm text-admin-muted hover:text-admin-text"
            >
              {t("nav.logout")}
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="min-h-screen flex-1 p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
