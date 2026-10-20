import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { validateDemoRequest } from "@/lib/demo-requests";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    return Response.json(
      { error: "Please submit the form from this website." },
      { status: 403 },
    );
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json({ error: "Invalid request format." }, { status: 415 });
  let value: unknown;
  try {
    const body = await request.text();
    if (body.length > 4096)
      return Response.json({ error: "Request is too large." }, { status: 413 });
    value = JSON.parse(body);
  } catch {
    return Response.json(
      { error: "Please check your form and try again." },
      { status: 400 },
    );
  }
  const data = validateDemoRequest(value);
  if (!data)
    return Response.json(
      { error: "Please check your name, email, clinic, and team size." },
      { status: 400 },
    );
  if (!env.isSupabaseConfigured)
    return Response.json(
      {
        error: "Requests are temporarily unavailable. Please try again later.",
      },
      { status: 503 },
    );
  const client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: receipt, error } = await client.rpc("submit_demo_request", {
    request_id: data.requestId,
    contact_name: data.name,
    contact_email: data.email,
    clinic_name: data.clinic,
    team_size: data.teamSize,
    requested_interests: data.interests,
  });
  if (error || !receipt) {
    const limited =
      error?.code === "P0001" && error.message.includes("Too many");
    return Response.json(
      {
        error: limited
          ? "Too many requests. Please try again in an hour."
          : "We could not save your request. Please try again.",
      },
      {
        status: limited ? 429 : 503,
        headers: limited ? { "Retry-After": "3600" } : undefined,
      },
    );
  }
  // Saving the request is the source of truth. Email failure must not lose it.
  if (process.env.RESEND_API_KEY && process.env.DEMO_NOTIFICATION_FROM) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `demo-${receipt}`,
        },
        body: JSON.stringify({
          from: process.env.DEMO_NOTIFICATION_FROM,
          to: ["taexuanyu@gmail.com"],
          reply_to: data.email,
          subject: "New Med Base demo request",
          text: [
            `Name: ${data.name}`,
            `Email: ${data.email}`,
            `Clinic / team: ${data.clinic}`,
            `Team size: ${data.teamSize}`,
            `Interests: ${data.interests.join(", ") || "General walkthrough"}`,
            `Reference: ${receipt}`,
          ].join("\n"),
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok)
        console.error("Demo notification delivery failed", {
          receipt,
          status: response.status,
        });
    } catch {
      console.error("Demo notification delivery unavailable", { receipt });
    }
  } else console.error("Demo notification is not configured", { receipt });
  return Response.json(
    { saved: true, reference: receipt },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
