export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <h2 className="mb-5 text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
