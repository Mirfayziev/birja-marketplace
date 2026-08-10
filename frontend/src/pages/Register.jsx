import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(fullName, phone, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || t("auth.error_generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-sand bg-white p-8">
        <h1 className="font-display text-xl font-bold text-tile-blue-deep">
          {t("auth.register_title")}
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">{t("auth.full_name")}</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-xl border border-sand px-3 py-2 text-sm outline-none focus:border-tile-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">{t("auth.phone")}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              required
              className="w-full rounded-xl border border-sand px-3 py-2 text-sm outline-none focus:border-tile-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">{t("auth.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-sand px-3 py-2 text-sm outline-none focus:border-tile-blue"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-tile-blue px-6 py-3 font-medium text-white transition hover:bg-tile-blue-deep disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("auth.submit_register")}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink/60">
          {t("auth.have_account")}{" "}
          <Link to="/kirish" className="font-medium text-tile-blue hover:underline">
            {t("nav.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
