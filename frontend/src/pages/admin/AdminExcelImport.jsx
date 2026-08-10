import { useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../../api/client";

export default function AdminExcelImport() {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await apiClient.post("/api/admin/products/import-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      if (err.response?.status === 422) {
        setResult(err.response.data);
      } else {
        setError(err.response?.data?.error || "Xatolik yuz berdi");
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">{t("admin.excel_import")}</h1>

      <div className="glass-card mt-6 max-w-xl rounded-2xl p-6">
        <p className="text-sm text-admin-muted">
          Majburiy ustunlar: <span className="font-mono text-white">Mahsulot nomi, Kategoriya, Narx,
          O'lchov birligi, Xarid turi</span>. Ixtiyoriy: Tavsif, Ishlab chiqaruvchi, Miqdori (ombor),
          Rasm fayl nomi/havolasi, Birja nomi, Lot raqami/ID, Lot havolasi.
        </p>

        <form onSubmit={handleUpload} className="mt-5 space-y-4">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-xl border border-dashed border-admin-border bg-white/5 px-3 py-6 text-sm text-admin-muted file:mr-3 file:rounded-lg file:border-0 file:bg-saffron file:px-3 file:py-1.5 file:text-white"
          />
          <button
            disabled={!file || uploading}
            className="w-full rounded-full bg-saffron px-6 py-3 text-sm font-medium text-white transition hover:bg-saffron-deep disabled:opacity-40"
          >
            {uploading ? t("common.loading") : t("admin.upload_excel")}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {result && (
          <div className="mt-6 rounded-xl bg-white/5 p-4">
            <p className="text-sm font-medium text-white">{t("admin.import_result")}</p>
            <div className="mt-2 flex gap-6 text-sm">
              <span className="text-melon">
                {t("admin.success_rows")}: {result.success_rows}
              </span>
              <span className="text-red-400">
                {t("admin.failed_rows")}: {result.failed_rows}
              </span>
            </div>

            {result.error_report?.length > 0 && (
              <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto text-xs text-red-300">
                {result.error_report.map((e, i) => (
                  <li key={i}>
                    Qator {e.row}: {e.error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
