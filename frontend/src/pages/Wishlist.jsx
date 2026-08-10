import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export default function Wishlist() {
  const { t } = useTranslation();
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-ink/50">{t("wishlist.empty")}</p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-full bg-neon-green px-6 py-2.5 font-semibold text-ink shadow-neon-sm transition hover:bg-neon-green-deep hover:text-white"
        >
          {t("wishlist.empty_cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-tile-blue-deep">{t("wishlist.title")}</h1>

      <div className="mt-6 divide-y divide-sand rounded-2xl border border-sand bg-white">
        {items.map((item) => (
          <div key={item.product_id} className="flex items-center gap-4 p-4">
            <Link to={`/mahsulot/${item.slug}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand/40">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-tile-blue/20">
                  {item.name?.[0]}
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <Link to={`/mahsulot/${item.slug}`} className="truncate font-medium text-ink hover:underline">
                {item.name}
              </Link>
              <p className="text-sm text-tile-blue-deep">
                {formatPrice(item.price, t("common.currency"))} / {item.unit}
              </p>
            </div>

            <button
              onClick={() => addItem({ id: item.product_id, name: item.name, price: item.price, unit: item.unit, images: item.image ? [item.image] : [] })}
              className="rounded-full bg-neon-green px-3 py-1.5 text-xs font-semibold text-ink shadow-neon-sm transition hover:bg-neon-green-deep hover:text-white"
            >
              {t("product.add_to_cart")}
            </button>

            <button
              onClick={() => removeItem(item.product_id)}
              className="text-xs text-ink/40 hover:text-red-500"
            >
              {t("cart.remove")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
