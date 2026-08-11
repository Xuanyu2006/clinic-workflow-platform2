import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you requested does not exist.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          href="/"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
