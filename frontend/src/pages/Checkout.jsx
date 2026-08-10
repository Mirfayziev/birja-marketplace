import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/client";
import { formatPrice } from "../utils/format";

const PAYMENT_METHODS = [
  { value: "payme", key: "checkout.pay_payme" },
  { value: "click", key: "checkout.pay_click" },
  { value: "naqd_yetkazishda", key: "checkout.pay_cash" },
];

export default function Checkout() {
  const { t } = useTranslation();
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    contact_name: user?.full_name || "",
    contact_phone: user?.phone || "",
    delivery_region: "",
    delivery_address: "",
    comment: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("naqd_yetkazishda");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-ink/60">{t("auth.login_title")}</p>
        <Link
          to="/kirish"
          className="mt-4 inline-block rounded-full bg-tile-blue px-6 py-2.5 font-medium text-white hover:bg-tile-blue-deep"
        >
          {t("nav.login")}
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !successOrder) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-ink/50">{t("cart.empty")}</div>
    );
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: order } = await apiClient.post("/api/orders", {
        ...form,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });

      if (paymentMethod === "payme" || paymentMethod === "click") {
        try {
          const { data } = await apiClient.post(
            `/api/payments/checkout-url/${order.id}`,
            { provider: paymentMethod }
          );
          clearCart();
          window.location.href = data.checkout_url;
          return;
        } catch {
          // To'lov havolasini olib bo'lmasa ham, buyurtma allaqachon yaratilgan -
          // xaridorga muvaffaqiyat sahifasini ko'rsatamiz, operator qo'lda bog'lanadi.
        }
      }

      clearCart();
      setSuccessOrder(order);
    } catch (err) {
      setError(err.response?.data?.error || t("auth.error_generic"));
    } finally {
      setLoading(false);
    }
  }

  if (successOrder) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-melon/15 text-2xl text-melon-deep">
          ✓
        </div>
        <h1 className="font-display text-xl font-bold text-tile-blue-deep">
          {t("checkout.success_title")}
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          {t("checkout.success_text", { number: successOrder.order_number })}
        </p>
        <Link
          to="/buyurtmalarim"
          className="mt-6 inline-block rounded-full bg-tile-blue px-6 py-2.5 font-medium text-white hover:bg-tile-blue-deep"
        >
          {t("nav.my_orders")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-tile-blue-deep">{t("checkout.title")}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-sand bg-white p-6">
        <Field label={t("checkout.contact_name")} name="contact_name" value={form.contact_name} onChange={handleChange} required />
        <Field label={t("checkout.contact_phone")} name="contact_phone" value={form.contact_phone} onChange={handleChange} required placeholder="+998 90 123 45 67" />
        <Field label={t("checkout.delivery_region")} name="delivery_region" value={form.delivery_region} onChange={handleChange} />
        <Field label={t("checkout.delivery_address")} name="delivery_address" value={form.delivery_address} onChange={handleChange} />
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/70">{t("checkout.comment")}</label>
          <textarea
            name="comment"
            value={form.comment}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-xl border border-sand px-3 py-2 text-sm outline-none focus:border-tile-blue"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink/70">
            {t("checkout.payment_method")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                type="button"
                key={m.value}
                onClick={() => setPaymentMethod(m.value)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  paymentMethod === m.value
                    ? "border-tile-blue bg-tile-blue/10 text-tile-blue-deep"
                    : "border-sand text-ink/60"
                }`}
              >
                {t(m.key)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-sand pt-4">
          <span className="font-medium text-ink">{t("cart.total")}</span>
          <span className="font-display text-lg font-bold text-tile-blue-deep">
            {formatPrice(totalAmount, t("common.currency"))}
          </span>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-saffron px-6 py-3 font-medium text-white transition hover:bg-saffron-deep disabled:opacity-50"
        >
          {loading ? t("common.loading") : t("checkout.submit")}
        </button>
      </form>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink/70">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-sand px-3 py-2 text-sm outline-none focus:border-tile-blue"
      />
    </div>
  );
}
