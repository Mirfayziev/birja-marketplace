import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../../api/client";
import { formatPrice } from "../../utils/format";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiClient.get("/api/admin/dashboard").then((res) => setStats(res.data));
  }, []);

  const cards = stats
    ? [
        { label: t("admin.total_products"), value: stats.total_products },
        { label: t("admin.total_orders"), value: stats.total_orders },
        { label: t("admin.new_orders"), value: stats.new_orders },
        {
          label: t("admin.total_revenue"),
          value: formatPrice(stats.total_revenue, t("common.currency")),
        },
      ]
    : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">{t("admin.dashboard")}</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats
          ? cards.map((c) => (
              <div key={c.label} className="glass-card rounded-2xl p-5">
                <p className="text-xs text-admin-muted">{c.label}</p>
                <p className="mt-2 font-display text-2xl font-bold text-white">{c.value}</p>
              </div>
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
            ))}
      </div>
    </div>
  );
}
