import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export default function Cart() {
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem, totalAmount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-ink/50">{t("cart.empty")}</p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-full bg-tile-blue px-6 py-2.5 font-medium text-white hover:bg-tile-blue-deep"
        >
          {t("cart.empty_cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-tile-blue-deep">{t("cart.title")}</h1>

      <div className="mt-6 divide-y divide-sand rounded-2xl border border-sand bg-white">
        {items.map((item) => (
          <div key={item.product_id} className="flex items-center gap-4 p-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand/40">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-tile-blue/20">
                  {item.name?.[0]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-ink">{item.name}</p>
              <p className="text-sm text-tile-blue-deep">
                {formatPrice(item.price, t("common.currency"))} / {item.unit}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                className="h-7 w-7 rounded-full border border-sand text-ink/60 hover:border-tile-blue"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                className="h-7 w-7 rounded-full border border-sand text-ink/60 hover:border-tile-blue"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeItem(item.product_id)}
              className="text-xs text-ink/40 hover:text-red-500"
            >
              {t("cart.remove")}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-sand bg-white p-4">
        <span className="font-medium text-ink">{t("cart.total")}</span>
        <span className="font-display text-xl font-bold text-tile-blue-deep">
          {formatPrice(totalAmount, t("common.currency"))}
        </span>
      </div>

      <button
        onClick={() => navigate("/checkout")}
        className="mt-6 w-full rounded-full bg-saffron px-6 py-3 font-medium text-white hover:bg-saffron-deep"
      >
        {t("cart.checkout")}
      </button>
    </div>
  );
}
