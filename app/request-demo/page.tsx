"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const inbox = "taexuanyu@gmail.com";
const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20";

export default function RequestDemo() {
  const [prepared, setPrepared] = useState(false);

  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = [
      "Hi Med Base, I'd like to request a demo.",
      "",
      `Name: ${String(form.get("name") ?? "").trim()}`,
      `Reply email: ${String(form.get("email") ?? "").trim()}`,
      `Clinic or team: ${String(form.get("clinic") ?? "").trim()}`,
      `Team size: ${form.get("teamSize")}`,
      `Interested in: ${form.getAll("interests").join(", ") || "General walkthrough"}`,
      "",
      "I'd like to explore staff coordination using fictional data.",
    ].join("\n");
    window.location.href = `mailto:${inbox}?subject=${encodeURIComponent("Med Base demo request")}&body=${encodeURIComponent(body)}`;
    setPrepared(true);
  }

  return (
    <main className="min-h-dvh bg-[#f4f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"
        >
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#06172f]"
          >
            Med Base<span className="text-cyan-600">.</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-cyan-700"
          >
            ← Back to home
          </Link>
        </nav>
      </header>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
            Meet your next team workspace
          </p>
          <h1 className="mt-5 max-w-lg text-4xl font-semibold leading-tight tracking-tight text-[#06172f] sm:text-5xl">
            Less coordination.
            <br />
            More clarity.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-600">
            See how Med Base brings staff schedules, team conversations, and
            everyday tasks into one workspace.
          </p>
          <div className="mt-10 space-y-6">
            {[
              [
                "01",
                "Plan the week",
                "Explore staff scheduling and calendar views.",
              ],
              [
                "02",
                "Keep the team connected",
                "Walk through conversations and workspace access.",
              ],
              [
                "03",
                "Turn discussion into action",
                "Review messages and create editable task drafts.",
              ],
            ].map(([number, title, description]) => (
              <div key={number} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-800">
                  {number}
                </span>
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-md rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-slate-700">
            An early pilot, demonstrated with fictional data. Please keep
            patient information out of your request.{" "}
            <Link
              href="/pilot-info"
              className="font-medium underline underline-offset-4"
            >
              Read about pilot use
            </Link>
            .
          </p>
        </section>
        <section
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8"
          aria-labelledby="request-heading"
        >
          <h2
            id="request-heading"
            className="text-2xl font-semibold text-[#06172f]"
          >
            Request a demo
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tell us a little about your team. Then review and send your request
            in your email app.
          </p>
          <form onSubmit={prepareEmail} className="mt-7 space-y-5">
            <label className="block text-sm font-medium" htmlFor="name">
              Your name <span aria-hidden="true">*</span>
              <input
                className={fieldClass}
                id="name"
                name="name"
                autoComplete="name"
                required
                maxLength={100}
              />
            </label>
            <label className="block text-sm font-medium" htmlFor="email">
              Email address <span aria-hidden="true">*</span>
              <input
                className={fieldClass}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            </label>
            <label className="block text-sm font-medium" htmlFor="clinic">
              Clinic or team name <span aria-hidden="true">*</span>
              <input
                className={fieldClass}
                id="clinic"
                name="clinic"
                autoComplete="organization"
                required
                maxLength={150}
              />
            </label>
            <label className="block text-sm font-medium" htmlFor="team-size">
              Team size
              <select
                className={fieldClass}
                id="team-size"
                name="teamSize"
                defaultValue="Not sure yet"
              >
                <option>1–5 people</option>
                <option>6–20 people</option>
                <option>21–50 people</option>
                <option>51+ people</option>
                <option>Not sure yet</option>
              </select>
            </label>
            <fieldset>
              <legend className="text-sm font-medium">
                What would you like to explore?{" "}
                <span className="font-normal text-slate-500">(Optional)</span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                {["Scheduling", "Team messages", "Tasks"].map((interest) => (
                  <label
                    key={interest}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <input
                      type="checkbox"
                      name="interests"
                      value={interest}
                      className="h-4 w-4 accent-cyan-700"
                    />
                    {interest}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="text-xs leading-5 text-slate-500">
              Required fields are marked *. Your details are added to an email
              addressed to {inbox}. Nothing is submitted by this page; you
              choose when to send.
            </p>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#087f9b] px-5 py-3.5 font-semibold text-white transition hover:bg-[#06677e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700"
            >
              Continue to email →
            </button>
            {prepared && (
              <p
                role="status"
                className="rounded-xl bg-cyan-50 p-4 text-sm leading-6 text-slate-700"
              >
                Your email app should open with a draft. Your request is only
                sent when you press Send there. If nothing opened, email{" "}
                <a
                  href={`mailto:${inbox}?subject=Med%20Base%20demo%20request`}
                  className="break-all font-medium underline"
                >
                  {inbox}
                </a>{" "}
                with your name and team.
              </p>
            )}
          </form>
          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            Prefer to write directly?{" "}
            <a
              className="underline underline-offset-4"
              href={`mailto:${inbox}?subject=Med%20Base%20demo%20request`}
            >
              Email Med Base
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
