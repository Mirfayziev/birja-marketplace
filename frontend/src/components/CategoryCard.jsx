import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/kategoriya/${category.id}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-sand bg-white/50 p-5 text-center transition hover:-translate-y-0.5 hover:border-neon-green hover:bg-white hover:shadow-neon-sm"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neon-green/10 font-display text-lg font-bold text-neon-green-deep transition group-hover:bg-neon-green group-hover:text-ink">
        {category.name?.[0]}
      </div>
      <span className="text-sm font-medium text-ink">{category.name}</span>
    </Link>
  );
}
