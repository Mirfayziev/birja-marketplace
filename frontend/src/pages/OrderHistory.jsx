import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../api/client";
import { formatPrice } from "../utils/format";

const STATUS_STYLES = {
  yangi: "bg-tile-blue/10 text-tile-blue-deep",
  tasdiqlangan: "bg-melon/10 text-melon-deep",
  jarayonda: "bg-saffron/15 text-saffron-deep",
  yetkazilmoqda: "bg-saffron/15 text-saffron-deep",
  yetkazilgan: "bg-melon/15 text-melon-deep",
  bekor_qilingan: "bg-red-100 text-red-600",
};

export default function OrderHistory() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/api/orders")
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="px-4 py-24 text-center text-ink/40">{t("common.loading")}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-tile-blue-deep">{t("orders.title")}</h1>

      {orders.length === 0 ? (
        <p className="mt-10 text-center text-ink/50">{t("orders.empty")}</p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-sand bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-ink">
                  {order.order_number}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    STATUS_STYLES[order.status] || ""
                  }`}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-ink/70">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.subtotal, t("common.currency"))}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-sand pt-3 font-medium">
                <span>{t("cart.total")}</span>
                <span className="text-tile-blue-deep">
                  {formatPrice(order.total_amount, t("common.currency"))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
