import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../../api/client";

// Yassi ro'yxatni ota-bola tartibida (daraxt shaklida) qatorlarga yig'adi,
// har biriga chuqurlik (depth) qo'shadi - jadvalda chekinish uchun.
function buildRows(categories) {
  const byParent = new Map();
  for (const c of categories) {
    const key = c.parent_id || "root";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(c);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.sort_order - b.sort_order);
  }

  const rows = [];
  function walk(parentKey, depth) {
    for (const c of byParent.get(parentKey) || []) {
      rows.push({ ...c, depth });
      walk(c.id, depth + 1);
    }
  }
  walk("root", 0);
  return rows;
}

export default function AdminCategories() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name_uz: "", name_ru: "", name_en: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [deleting, setDeleting] = useState(false);

  function loadCategories() {
    setLoading(true);
    apiClient
      .get("/api/categories", { params: { lang: "uz" } })
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(loadCategories, []);

  const rows = useMemo(() => buildRows(categories), [categories]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name_uz.trim()) return;
    try {
      await apiClient.post("/api/categories", form);
      setForm({ name_uz: "", name_ru: "", name_en: "" });
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.error || "Xatolik");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t("common.delete") + "?")) return;
    await apiClient.delete(`/api/categories/${id}`);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    loadCategories();
  }

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  }

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    if (!window.confirm(t("admin.delete_selected_confirm", { count: selected.size }))) return;
    setDeleting(true);
    try {
      await Promise.all([...selected].map((id) => apiClient.delete(`/api/categories/${id}`)));
      setSelected(new Set());
      loadCategories();
    } finally {
      setDeleting(false);
    }
  }

  const allSelected = rows.length > 0 && selected.size === rows.length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">{t("admin.categories")}</h1>
        {selected.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={deleting}
            className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {t("admin.delete_selected", { count: selected.size })}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="glass-card mt-6 grid gap-3 rounded-2xl p-5 sm:grid-cols-4">
        <input
          placeholder="Nomi (o'zbekcha) *"
          value={form.name_uz}
          onChange={(e) => setForm({ ...form, name_uz: e.target.value })}
          className="rounded-xl border border-admin-border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-admin-muted outline-none focus:border-saffron"
        />
        <input
          placeholder="Название (русский)"
          value={form.name_ru}
          onChange={(e) => setForm({ ...form, name_ru: e.target.value })}
          className="rounded-xl border border-admin-border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-admin-muted outline-none focus:border-saffron"
        />
        <input
          placeholder="Name (English)"
          value={form.name_en}
          onChange={(e) => setForm({ ...form, name_en: e.target.value })}
          className="rounded-xl border border-admin-border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-admin-muted outline-none focus:border-saffron"
        />
        <button className="rounded-xl bg-saffron px-4 py-2 text-sm font-medium text-white hover:bg-saffron-deep">
          + {t("common.save")}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <div className="mt-6 overflow-hidden rounded-2xl border border-admin-border">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-admin-muted">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-admin-border accent-saffron"
                  aria-label={t("admin.select_all")}
                />
              </th>
              <th className="px-4 py-3 font-medium">Nomi</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-admin-muted" colSpan={4}>
                  {t("common.loading")}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-admin-muted" colSpan={4}>
                  {t("admin.no_categories")}
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id} className="text-admin-text">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleOne(c.id)}
                      className="h-4 w-4 rounded border-admin-border accent-saffron"
                    />
                  </td>
                  <td className="px-4 py-3" style={{ paddingLeft: `${16 + c.depth * 20}px` }}>
                    {c.depth > 0 && <span className="mr-1.5 text-admin-muted">└</span>}
                    {c.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-admin-muted">{c.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
