import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apiClient from "../api/client";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export default function ProductPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [exchangeChoiceOpen, setExchangeChoiceOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setProduct(null);
    setQuantity(1);
    apiClient.get(`/api/products/slug/${slug}`).then((res) => setProduct(res.data));
  }, [slug, i18n.language]);

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center text-ink/40">
        {t("common.loading")}
      </div>
    );
  }

  const canCash = product.purchase_type === "naqd" || product.purchase_type === "ikkalasi";
  const canExchange = product.purchase_type === "birja" || product.purchase_type === "ikkalasi";
  const activeLots = product.exchange_lots?.filter((l) => l.is_active) || [];

  function handleBuyCash() {
    addItem(product, quantity);
    navigate("/checkout");
  }

  function handleExchangeClick() {
    if (activeLots.length === 1) {
      window.open(activeLots[0].lot_url, "_blank", "noopener");
    } else {
      setExchangeChoiceOpen((v) => !v);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Rasm galereyasi */}
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border border-sand bg-white">
            {product.images?.length ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-5xl text-tile-blue/15">
                {product.name?.[0]}
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    activeImage === i ? "border-tile-blue" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ma'lumot va xarid */}
        <div>
          <span className="rounded-full bg-tile-blue/10 px-2.5 py-1 text-[11px] font-semibold text-tile-blue-deep">
            {t(`purchase_type.${product.purchase_type}`)}
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">{product.name}</h1>

          {product.manufacturer && (
            <p className="mt-1 text-sm text-ink/50">
              {t("product.manufacturer")}: {product.manufacturer}
            </p>
          )}

          <div className="mt-4 font-display text-3xl font-bold text-tile-blue-deep">
            {formatPrice(product.price, t("common.currency"))}
            <span className="ml-1 font-body text-sm font-normal text-ink/40">
              / {product.unit}
            </span>
          </div>

          <p className="mt-2 text-sm text-ink/60">
            {product.stock_quantity > 0
              ? t("product.in_stock", { count: product.stock_quantity, unit: product.unit })
              : t("product.out_of_stock")}
          </p>

          {product.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-ink">{t("product.description")}</h2>
              <p className="mt-1 whitespace-pre-line text-sm text-ink/70">{product.description}</p>
            </div>
          )}

          {/* Xarid tugmalari */}
          <div className="mt-8 flex flex-col gap-3">
            {canCash && product.stock_quantity > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-ink/70">{t("cart.quantity")}</span>
                <div className="flex items-center rounded-full border border-sand">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-9 w-9 items-center justify-center text-ink/60 hover:text-ink disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-ink">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="flex h-9 w-9 items-center justify-center text-ink/60 hover:text-ink disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {canCash && (
              <button
                onClick={handleBuyCash}
                disabled={product.stock_quantity <= 0}
                className="rounded-full bg-melon px-6 py-3 font-medium text-white transition hover:bg-melon-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("product.buy_cash")}
              </button>
            )}

            {canExchange && activeLots.length > 0 && (
              <div>
                <button
                  onClick={handleExchangeClick}
                  className="w-full rounded-full border-2 border-saffron px-6 py-3 font-medium text-saffron-deep transition hover:bg-saffron/10"
                >
                  {t("product.buy_exchange")}
                </button>

                {exchangeChoiceOpen && activeLots.length > 1 && (
                  <div className="mt-2 space-y-2 rounded-xl border border-sand bg-white p-3">
                    <p className="text-xs font-medium text-ink/50">{t("product.choose_exchange")}</p>
                    {activeLots.map((lot) => (
                      <a
                        key={lot.id}
                        href={lot.lot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg border border-sand px-3 py-2 text-sm hover:border-saffron"
                      >
                        <span>
                          {lot.exchange_name}
                          {lot.lot_number && (
                            <span className="ml-1 font-mono text-xs text-ink/40">
                              #{lot.lot_number}
                            </span>
                          )}
                        </span>
                        <span className="text-saffron-deep">→</span>
                      </a>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-ink/40">{t("product.exchange_note")}</p>
              </div>
            )}
          </div>

          <Link to="/savat" className="mt-6 block text-center text-sm text-tile-blue hover:underline">
            {t("nav.cart")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
