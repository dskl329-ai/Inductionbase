import { SEVERN_TRUSTS } from "@/types";
import Link from "next/link";

export default async function DashboardPage() {
  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Welcome to Inductionbase
        </h1>
        <p className="text-slate-600">
          Select your trust to browse the wiki.
        </p>
      </div>

      {/* All Severn Trusts */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Severn Trusts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SEVERN_TRUSTS.map((trust) => (
            <Link
              key={trust.slug}
              href={`/trust/${trust.slug}`}
              className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg font-bold text-blue-600">
                  {trust.short_name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition">
                    {trust.short_name}
                  </h3>
                  <p className="text-xs text-slate-500">{trust.region}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">
                {trust.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity (placeholder) */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Updates</h2>
        <div className="bg-white rounded-xl border p-6 text-center text-slate-500">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-sm">No recent activity yet. Be the first to contribute!</p>
        </div>
      </div>
    </div>
  );
}
