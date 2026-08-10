import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "birja_market_wishlist";

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function isSaved(productId) {
    return items.some((i) => i.product_id === productId);
  }

  function toggle(product) {
    setItems((prev) => {
      if (prev.some((i) => i.product_id === product.id)) {
        return prev.filter((i) => i.product_id !== product.id);
      }
      return [
        ...prev,
        {
          product_id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          unit: product.unit,
          image: product.images?.[0] || null,
        },
      ];
    });
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }

  return (
    <WishlistContext.Provider value={{ items, isSaved, toggle, removeItem, totalCount: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist WishlistProvider ichida ishlatilishi kerak");
  return ctx;
}
