export function PortalLayout({
  tabs,
  activeTab,
  setActiveTab,
  children,
}: {
  tabs: string[][];
  activeTab: string;
  setActiveTab: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-3xl bg-slate-950 p-4 text-white">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`mb-2 w-full rounded-2xl px-4 py-3 text-left text-sm ${
              activeTab === key ? "bg-white text-slate-950" : "bg-white/10 text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </aside>
      <section>{children}</section>
    </div>
  );
}
