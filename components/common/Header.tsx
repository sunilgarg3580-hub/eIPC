import { BRAND, HEADER } from "@/lib/content";
import type { Role, LoginMode } from "@/lib/types";

export function Header({
  role,
  userName,
  setLoginMode,
  setActiveTab,
  onLogout,
}: {
  role: Role;
  userName?: string;
  setLoginMode: (mode: LoginMode) => void;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-2xl text-white shadow-lg">
            {BRAND.logo}
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              {BRAND.name}
            </h1>
            <p className="text-sm text-slate-500">{BRAND.tagline}</p>
          </div>
        </div>

        {role === "guest" ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLoginMode("client")}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
            >
              {HEADER.clientLogin}
            </button>

            <button
              onClick={() => setLoginMode("advocate")}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {HEADER.advocateLogin}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Welcome, {userName || role}
            </span>

            <button
              onClick={() => setActiveTab("profile")}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
            >
              My Profile
            </button>

            <button
              onClick={onLogout}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
            >
              {HEADER.logout}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}