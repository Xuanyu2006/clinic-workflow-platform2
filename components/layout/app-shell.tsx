import type { PropsWithChildren } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <main className="min-h-dvh bg-background text-foreground">{children}</main>
  );
}
