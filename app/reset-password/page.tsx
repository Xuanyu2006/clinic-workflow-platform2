"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createOptionalClient } from "@/lib/supabase/client";
export default function ResetPassword() {
  const client = useMemo(() => createOptionalClient(), []);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(
    "Open the reset link from your email to continue.",
  );
  useEffect(() => {
    if (!client) return;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setNotice("");
      }
    });
    // Recovery links may use implicit tokens; code flow is completed here too.
    const code = new URLSearchParams(window.location.search).get("code");
    if (code)
      void client.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) {
          setReady(true);
          setNotice("");
          window.history.replaceState({}, "", "/reset-password");
        } else setNotice("This link has expired. Request another reset link.");
      });
    return () => subscription.unsubscribe();
  }, [client]);
  return (
    <main className="mx-auto max-w-md space-y-5 px-6 py-16">
      <h1 className="text-2xl font-bold">Reset your password</h1>
      <p role="status">{notice}</p>
      {ready && (
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!client || busy) return;
            if (
              password.length < 8 ||
              !/[A-Za-z]/.test(password) ||
              !/\d/.test(password) ||
              !/[^A-Za-z0-9]/.test(password)
            ) {
              setNotice(
                "Use at least 8 characters with a letter, number, and special character.",
              );
              return;
            }
            if (password !== confirmation) {
              setNotice("Passwords do not match.");
              return;
            }
            setBusy(true);
            try {
              const { error } = await client.auth.updateUser({ password });
              if (error) setNotice(error.message);
              else {
                setReady(false);
                setPassword("");
                setConfirmation("");
                setNotice("Password updated. Return to Med Base to sign in.");
                await client.auth.signOut({ scope: "local" });
              }
            } catch {
              setNotice("Could not update your password. Please try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            New password
            <input
              required
              className="mt-1 w-full rounded border p-2"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label>
            Confirm password
            <input
              required
              className="mt-1 w-full rounded border p-2"
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </label>
          <button className="rounded bg-primary p-3 text-white" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
      <Link href="/" className="block text-primary">
        Return to Med Base
      </Link>
    </main>
  );
}
