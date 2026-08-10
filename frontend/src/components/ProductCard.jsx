import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../utils/format";
import { useWishlist } from "../context/WishlistContext";

const BADGE_STYLES = {
  naqd: "bg-melon/10 text-melon-deep",
  birja: "bg-saffron/15 text-saffron-deep",
  ikkalasi: "bg-tile-blue/10 text-tile-blue-deep",
};

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(product.id);

  return (
    <Link
      to={`/mahsulot/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-sand bg-white/60 transition hover:-translate-y-0.5 hover:border-neon-green/50 hover:shadow-neon-sm"
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle(product);
        }}
        aria-pressed={saved}
        aria-label={t("nav.wishlist")}
        className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition ${
          saved ? "bg-neon-green text-ink" : "bg-white/80 text-ink/50 hover:text-neon-green-deep"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
          <path d="M12 20.5s-7.5-4.6-9.8-9.2C.7 8 2.3 4.8 5.4 4.1c2-.5 3.9.3 5 1.9.9 1.3.9 1.3 1.6 1.3s.7 0 1.6-1.3c1.1-1.6 3-2.4 5-1.9 3.1.7 4.7 3.9 3.2 7.2C19.5 15.9 12 20.5 12 20.5Z" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="aspect-square w-full overflow-hidden bg-sand/40">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-tile-blue/20 font-display">
            {product.name?.[0]}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span
          className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            BADGE_STYLES[product.purchase_type] || BADGE_STYLES.naqd
          }`}
        >
          {t(`purchase_type.${product.purchase_type}`)}
        </span>

        <h3 className="line-clamp-2 font-medium leading-snug text-ink">{product.name}</h3>

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="font-display text-sm font-bold text-tile-blue-deep">
            {formatPrice(product.price, t("common.currency"))}
          </span>
          <span className="font-mono text-[11px] text-ink/40">/ {product.unit}</span>
        </div>
      </div>
    </Link>
  );
}
