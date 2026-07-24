import { AppShell } from "@/components/layout/app-shell";

const architectureAreas = [
  "Typed Supabase clients",
  "Service-layer boundaries",
  "Reusable UI components",
  "Healthcare-ready documentation",
];

export default function HomePage() {
  return (
    <AppShell>
      <section className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-6 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            SaaS foundation
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground md:text-6xl">
            Clinic Workflow Platform
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            A production-ready Next.js architecture prepared for secure, modular
            healthcare workflows.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {architectureAreas.map((area) => (
            <div
              key={area}
              className="rounded-lg border border-border bg-white p-5 text-sm font-medium shadow-sm"
            >
              {area}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
