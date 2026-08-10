import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../../api/client";
import { formatPrice } from "../../utils/format";

const EXCHANGES = ["XT-Xarid", "Uzex Xarid", "Cooperation.uz"];
const PURCHASE_TYPES = ["naqd", "birja", "ikkalasi"];

const emptyForm = {
  name_uz: "",
  category_id: "",
  price: "",
  unit: "dona",
  stock_quantity: 0,
  purchase_type: "naqd",
};

async function uploadProductImage(productId, file) {
  const formData = new FormData();
  formData.append("file", file);
  await apiClient.post(`/api/products/${productId}/images/upload`, formData);
}

export default function AdminProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  function loadData() {
    setLoading(true);
    Promise.all([
      apiClient.get("/api/products", { params: { per_page: 100 } }),
      apiClient.get("/api/categories"),
    ])
      .then(([p, c]) => {
        setProducts(p.data.items);
        setCategories(c.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data: created } = await apiClient.post("/api/products", {
        ...form,
        price: Number(form.price),
      });
      if (newImage) {
        await uploadProductImage(created.id, newImage);
      }
      setForm(emptyForm);
      setNewImage(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Xatolik");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t("common.delete") + "?")) return;
    await apiClient.delete(`/api/products/${id}`);
    loadData();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">{t("admin.products")}</h1>

      {/* Yangi mahsulot qo'shish */}
      <form onSubmit={handleSubmit} className="glass-card mt-6 grid gap-3 rounded-2xl p-5 sm:grid-cols-3 lg:grid-cols-6">
        <input
          placeholder="Nomi *"
          value={form.name_uz}
          onChange={(e) => setForm({ ...form, name_uz: e.target.value })}
          className="rounded-xl border border-admin-border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-admin-muted outline-none focus:border-saffron sm:col-span-2"
        />
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="rounded-xl border border-admin-border bg-admin-bg2 px-3 py-2 text-sm text-white outline-none focus:border-saffron"
        >
          <option value="">Kategoriya *</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Narx *"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="rounded-xl border border-admin-border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-admin-muted outline-none focus:border-saffron"
        />
        <input
          placeholder="Birlik"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          className="rounded-xl border border-admin-border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-admin-muted outline-none focus:border-saffron"
        />
        <select
          value={form.purchase_type}
          onChange={(e) => setForm({ ...form, purchase_type: e.target.value })}
          className="rounded-xl border border-admin-border bg-admin-bg2 px-3 py-2 text-sm text-white outline-none focus:border-saffron"
        >
          {PURCHASE_TYPES.map((pt) => (
            <option key={pt} value={pt}>
              {t(`purchase_type.${pt}`)}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-xl border border-dashed border-admin-border bg-white/5 px-3 py-2 text-xs text-admin-muted">
          <span className="shrink-0">{t("admin.product_image")}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setNewImage(e.target.files?.[0] || null)}
            className="w-full min-w-0 text-white file:mr-2 file:rounded-lg file:border-0 file:bg-tile-blue file:px-2 file:py-1 file:text-white"
          />
        </label>
        <button className="rounded-xl bg-saffron px-4 py-2 text-sm font-medium text-white hover:bg-saffron-deep sm:col-span-full lg:col-span-1">
          + {t("common.save")}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {/* Ro'yxat */}
      <div className="mt-6 space-y-2">
        {loading ? (
          <p className="text-admin-muted">{t("common.loading")}</p>
        ) : (
          products.map((p) => (
            <div key={p.id} className="glass-card overflow-hidden rounded-2xl">
              <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
              >
                <div>
                  <p className="font-medium text-white">{p.name}</p>
                  <p className="text-xs text-admin-muted">
                    {formatPrice(p.price, t("common.currency"))} / {p.unit} ·{" "}
                    {t(`purchase_type.${p.purchase_type}`)} · {p.exchange_lots?.length || 0} lot
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id);
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    {t("common.delete")}
                  </button>
                  <span className="text-admin-muted">{expandedId === p.id ? "−" : "+"}</span>
                </div>
              </div>

              {expandedId === p.id && (
                <>
                  <EditProductForm product={p} onChange={loadData} t={t} />
                  <ImageManager product={p} onChange={loadData} t={t} />
                  <ExchangeLotManager product={p} onChange={loadData} t={t} />
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EditProductForm({ product, onChange, t }) {
  const [form, setForm] = useState({
    price: product.price,
    unit: product.unit,
    stock_quantity: product.stock_quantity,
    purchase_type: product.purchase_type,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/api/products/${product.id}`, {
        price: Number(form.price),
        unit: form.unit,
        stock_quantity: Number(form.stock_quantity),
        purchase_type: form.purchase_type,
      });
      setSaved(true);
      onChange();
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="border-t border-admin-border p-4">
      <p className="mb-3 text-xs font-medium text-admin-muted">{t("admin.edit_product")}</p>
      <div className="grid gap-2 sm:grid-cols-5">
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Narx"
          className="rounded-lg border border-admin-border bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-admin-muted outline-none"
        />
        <input
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          placeholder="Birlik"
          className="rounded-lg border border-admin-border bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-admin-muted outline-none"
        />
        <input
          type="number"
          min="0"
          value={form.stock_quantity}
          onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
          placeholder={t("admin.stock_quantity")}
          className="rounded-lg border border-admin-border bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-admin-muted outline-none"
        />
        <select
          value={form.purchase_type}
          onChange={(e) => setForm({ ...form, purchase_type: e.target.value })}
          className="rounded-lg border border-admin-border bg-admin-bg2 px-2 py-1.5 text-xs text-white outline-none"
        >
          {PURCHASE_TYPES.map((pt) => (
            <option key={pt} value={pt}>
              {t(`purchase_type.${pt}`)}
            </option>
          ))}
        </select>
        <button
          disabled={saving}
          className="rounded-lg bg-tile-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-tile-blue-deep disabled:opacity-50"
        >
          {saved ? "✓" : t("common.save")}
        </button>
      </div>
    </form>
  );
}

function ImageManager({ product, onChange, t }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await uploadProductImage(product.id, file);
      onChange();
    } catch (err) {
      setError(err.response?.data?.error || "Xatolik");
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(imageId) {
    await apiClient.delete(`/api/products/${product.id}/images/${imageId}`);
    onChange();
  }

  return (
    <div className="border-t border-admin-border p-4">
      <p className="mb-3 text-xs font-medium text-admin-muted">{t("admin.product_images")}</p>

      <div className="flex flex-wrap gap-3">
        {product.images?.map((url, i) => (
          <div key={url + i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-admin-border">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => removeImage(product.image_ids?.[i] ?? "")}
              className="absolute inset-0 hidden items-center justify-center bg-black/60 text-xs text-white group-hover:flex"
            >
              {t("common.delete")}
            </button>
          </div>
        ))}

        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-admin-border text-admin-muted hover:border-saffron hover:text-saffron">
          <span className="text-xl leading-none">+</span>
          <span className="text-[10px]">{uploading ? t("common.loading") : t("admin.product_image")}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function ExchangeLotManager({ product, onChange, t }) {
  const [lotForm, setLotForm] = useState({ exchange_name: EXCHANGES[0], lot_number: "", lot_url: "" });
  const [saving, setSaving] = useState(false);

  async function addLot(e) {
    e.preventDefault();
    if (!lotForm.lot_url.trim()) return;
    setSaving(true);
    try {
      await apiClient.post(`/api/products/${product.id}/exchange-lots`, lotForm);
      setLotForm({ exchange_name: EXCHANGES[0], lot_number: "", lot_url: "" });
      onChange();
    } finally {
      setSaving(false);
    }
  }

  async function removeLot(lotId) {
    await apiClient.delete(`/api/products/${product.id}/exchange-lots/${lotId}`);
    onChange();
  }

  return (
    <div className="border-t border-admin-border bg-black/10 p-4">
      <p className="mb-3 text-xs font-medium text-admin-muted">{t("admin.exchange_lots")}</p>

      <div className="space-y-2">
        {product.exchange_lots?.map((lot) => (
          <div key={lot.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
            <span className="text-white">
              {lot.exchange_name}{" "}
              {lot.lot_number && <span className="font-mono text-xs text-admin-muted">#{lot.lot_number}</span>}
            </span>
            <div className="flex items-center gap-3">
              <a
                href={lot.lot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[200px] truncate text-xs text-saffron hover:underline"
              >
                {lot.lot_url}
              </a>
              <button onClick={() => removeLot(lot.id)} className="text-xs text-red-400 hover:text-red-300">
                ×
              </button>
            </div>
          </div>
        ))}
        {!product.exchange_lots?.length && (
          <p className="text-xs text-admin-muted">— hali lot bog'lanmagan —</p>
        )}
      </div>

      <form onSubmit={addLot} className="mt-3 grid gap-2 sm:grid-cols-4">
        <select
          value={lotForm.exchange_name}
          onChange={(e) => setLotForm({ ...lotForm, exchange_name: e.target.value })}
          className="rounded-lg border border-admin-border bg-admin-bg2 px-2 py-1.5 text-xs text-white outline-none"
        >
          {EXCHANGES.map((ex) => (
            <option key={ex} value={ex}>
              {ex}
            </option>
          ))}
        </select>
        <input
          placeholder="Lot raqami"
          value={lotForm.lot_number}
          onChange={(e) => setLotForm({ ...lotForm, lot_number: e.target.value })}
          className="rounded-lg border border-admin-border bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-admin-muted outline-none"
        />
        <input
          placeholder="Lot havolasi (https://...)"
          value={lotForm.lot_url}
          onChange={(e) => setLotForm({ ...lotForm, lot_url: e.target.value })}
          className="rounded-lg border border-admin-border bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-admin-muted outline-none sm:col-span-1"
        />
        <button
          disabled={saving}
          className="rounded-lg bg-tile-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-tile-blue-deep"
        >
          + {t("common.save")}
        </button>
      </form>
    </div>
  );
}
