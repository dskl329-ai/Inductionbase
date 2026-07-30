import { SEVERN_TRUSTS } from "@/types";
import Link from "next/link";

export default async function DashboardPage() {
  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">
          Welcome to Inductionbase
        </h1>
        <p className="text-text-secondary">
          Select your trust to browse the wiki.
        </p>
      </div>

      {/* All Severn Trusts */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-4">Severn Trusts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SEVERN_TRUSTS.map((trust) => (
            <Link
              key={trust.slug}
              href={`/trust/${trust.slug}`}
              className="group p-4 bg-surface rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-lg font-bold text-primary">
                  {trust.short_name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-text group-hover:text-primary transition">
                    {trust.short_name}
                  </h3>
                  <p className="text-xs text-text-secondary">{trust.region}</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary line-clamp-2">
                {trust.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity (placeholder) */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-text mb-4">Recent Updates</h2>
        <div className="bg-surface rounded-xl border p-6 text-center text-text-secondary">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-sm">No recent activity yet. Be the first to contribute!</p>
        </div>
      </div>
    </div>
  );
}
