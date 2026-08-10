import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
      navigate(location.state?.from || "/");
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
          {t("auth.login_title")}
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">{t("auth.phone")}</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
              className="w-full rounded-xl border border-sand px-3 py-2 text-sm outline-none focus:border-tile-blue"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-tile-blue px-6 py-3 font-medium text-white transition hover:bg-tile-blue-deep disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("auth.submit_login")}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink/60">
          {t("auth.no_account")}{" "}
          <Link to="/royxatdan-otish" className="font-medium text-tile-blue hover:underline">
            {t("nav.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
