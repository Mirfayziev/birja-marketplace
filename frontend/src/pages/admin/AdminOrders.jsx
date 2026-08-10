import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../../api/client";
import { formatPrice } from "../../utils/format";

const STATUSES = ["yangi", "tasdiqlangan", "jarayonda", "yetkazilmoqda", "yetkazilgan", "bekor_qilingan"];

export default function AdminOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadOrders() {
    setLoading(true);
    apiClient
      .get("/api/orders/admin/all")
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(loadOrders, []);

  async function changeStatus(orderId, status) {
    await apiClient.put(`/api/orders/admin/${orderId}/status`, { status });
    loadOrders();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">{t("admin.orders")}</h1>

      <div className="mt-6 space-y-2">
        {loading ? (
          <p className="text-admin-muted">{t("common.loading")}</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="glass-card rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-white">{order.order_number}</p>
                  <p className="text-xs text-admin-muted">
                    {order.contact_name} · {order.contact_phone}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-bold text-white">
                    {formatPrice(order.total_amount, t("common.currency"))}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => changeStatus(order.id, e.target.value)}
                    className="rounded-lg border border-admin-border bg-admin-bg2 px-2 py-1.5 text-xs text-white outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <ul className="mt-3 space-y-0.5 text-xs text-admin-muted">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product_name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
