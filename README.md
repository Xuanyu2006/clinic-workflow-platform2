{
  "name": "clinic-workflow-platform",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint --no-error-on-unmatched-pattern \"app/**/*.{ts,tsx}\" \"components/**/*.{ts,tsx}\" \"hooks/**/*.{ts,tsx}\" \"lib/**/*.{ts,tsx}\" \"services/**/*.{ts,tsx}\" \"types/**/*.ts\" middleware.ts next.config.ts tailwind.config.ts eslint.config.mjs",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "dependencies": {
    "@supabase/ssr": "^0.6.1",
    "@supabase/supabase-js": "^2.45.4",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "server-only": "^0.0.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.1.0",
    "@types/node": "^22.7.4",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.11.1",
    "eslint-config-next": "^15.0.0",
    "postcss": "^8.4.47",
    "prettier": "^3.3.3",
    "prettier-plugin-tailwindcss": "^0.6.8",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2"
  },
  "engines": {
    "node": ">=20.11.0"
  }
}
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
import { ClinicWorkflowDashboard } from "@/components/clinic-workflow-dashboard";

export default function HomePage() {
  return <ClinicWorkflowDashboard />;
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Clinic Workflow Platform",
    template: "%s | Clinic Workflow Platform",
  },
  description: "A secure healthcare workflow platform foundation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 205 29% 97%;
  --foreground: 220 28% 12%;
  --muted: 210 18% 93%;
  --muted-foreground: 216 12% 40%;
  --border: 215 16% 84%;
  --primary: 184 70% 27%;
  --primary-foreground: 0 0% 100%;
}

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
}

body {
  min-height: 100%;
  margin: 0;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: Arial, Helvetica, sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}
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
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const variantClassName = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "border border-border bg-white text-foreground hover:bg-muted",
};

export function Button({
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition ${variantClassName[variant]} ${className}`}
      type={type}
      {...props}
    />
  );
}
"use client";

import {
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Button } from "@/components/ui/button";

type AppointmentStatus = "Confirmed" | "Needs reminder" | "Forms pending";
type ReminderChannel = "SMS" | "Email" | "Call";
type FormStatus = "Not sent" | "Sent" | "Completed";
type InsuranceStatus = "Verified" | "Pending" | "Issue found";

type Appointment = {
  id: string;
  patient: string;
  reason: string;
  time: string;
  provider: string;
  status: AppointmentStatus;
  reminderChannel: ReminderChannel;
  formsStatus: FormStatus;
  insuranceStatus: InsuranceStatus;
};

type Message = {
  id: string;
  sender: "Clinic" | "Patient";
  patient: string;
  body: string;
  time: string;
};
"use client";

import {
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Button } from "@/components/ui/button";

type AppointmentStatus = "Confirmed" | "Needs reminder" | "Forms pending";
type ReminderChannel = "SMS" | "Email" | "Call";
type FormStatus = "Not sent" | "Sent" | "Completed";
type InsuranceStatus = "Verified" | "Pending" | "Issue found";

type Appointment = {
  id: string;
  patient: string;
  reason: string;
  time: string;
  provider: string;
  status: AppointmentStatus;
  reminderChannel: ReminderChannel;
  formsStatus: FormStatus;
  insuranceStatus: InsuranceStatus;
};

type Message = {
  id: string;
  sender: "Clinic" | "Patient";
  patient: string;
  body: string;
  time: string;
};

const initialAppointments: Appointment[] = [];

const initialMessages: Message[] = [];

const tabs = [
  "Appointments",
  "Reminders",
  "Digital Forms",
  "Messaging",
  "Insurance",
] as const;

type Tab = (typeof tabs)[number];
type AuthMode = "login" | "create";

const statusStyles = {
  Confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Needs reminder": "bg-amber-50 text-amber-700 ring-amber-200",
  "Forms pending": "bg-sky-50 text-sky-700 ring-sky-200",
  "Not sent": "bg-slate-100 text-slate-700 ring-slate-200",
  Sent: "bg-sky-50 text-sky-700 ring-sky-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  "Issue found": "bg-rose-50 text-rose-700 ring-rose-200",
};

export function ClinicWorkflowDashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [createAccountForm, setCreateAccountForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("Appointments");
  const [appointments, setAppointments] = useState(initialAppointments);
  const [messages, setMessages] = useState(initialMessages);
  const [newAppointment, setNewAppointment] = useState({
    patient: "",
    reason: "",
    time: "",
    provider: "",
  });
  const [messageDraft, setMessageDraft] = useState("");

  const metrics = useMemo(() => {
    const remindersNeeded = appointments.filter(
      (appointment) => appointment.status === "Needs reminder",
    ).length;
    const formsPending = appointments.filter(
      (appointment) => appointment.formsStatus !== "Completed",
    ).length;
    const insuranceNeedsReview = appointments.filter(
      (appointment) => appointment.insuranceStatus !== "Verified",
    ).length;

    return [
      { label: "Today's appointments", value: appointments.length },
      { label: "Reminder queue", value: remindersNeeded },
      { label: "Forms not complete", value: formsPending },
      { label: "Insurance review", value: insuranceNeedsReview },
    ];
  }, [appointments]);

  function updateAppointment(
    id: string,
    updates: Partial<Omit<Appointment, "id">>,
  ) {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id ? { ...appointment, ...updates } : appointment,
      ),
    );
  }

  function addAppointment() {
    if (
      !newAppointment.patient ||
      !newAppointment.reason ||
      !newAppointment.time ||
      !newAppointment.provider
    ) {
      return;
    }

    setAppointments((current) => [
      ...current,
      {
        id: `APT-${String(current.length + 1).padStart(4, "0")}`,
        patient: newAppointment.patient,
        reason: newAppointment.reason,
        time: newAppointment.time,
        provider: newAppointment.provider,
        status: "Needs reminder",
        reminderChannel: "SMS",
        formsStatus: "Not sent",
        insuranceStatus: "Pending",
      },
    ]);
    setNewAppointment({
      patient: "",
      reason: "",
      time: "",
      provider: "",
    });
  }

  function sendMessage(patient: string, body = messageDraft) {
    if (!patient || !body.trim()) {
      return;
    }

    setMessages((current) => [
      {
        id: `MSG-${current.length + 1}`,
        sender: "Clinic",
        patient,
        body,
        time: "Just now",
      },
      ...current,
    ]);
  }

  function sendReminder(appointment: Appointment) {
    updateAppointment(appointment.id, { status: "Confirmed" });
    sendMessage(
      appointment.patient,
      `${appointment.reminderChannel} reminder sent for ${appointment.time} with ${appointment.provider}.`,
    );
  }

  function signIn() {
    if (!loginForm.email || !loginForm.password) {
      setLoginError("Enter an email and password to continue.");
      return;
    }

    if (loginForm.password.length < 8) {
      setLoginError("Password must be at least 8 characters.");
      return;
    }

    setUserEmail(loginForm.email);
    setLoginError("");
    setLoginForm({
      email: "",
      password: "",
    });
  }

  function createAccount() {
    if (
      !createAccountForm.email ||
      !createAccountForm.password ||
      !createAccountForm.confirmPassword
    ) {
      setLoginError("Complete all account fields to continue.");
      return;
    }

    if (createAccountForm.password.length < 8) {
      setLoginError("Password must be at least 8 characters.");
      return;
    }

    if (createAccountForm.password !== createAccountForm.confirmPassword) {
      setLoginError("Passwords do not match.");
      return;
    }

    setUserEmail(createAccountForm.email);
    setLoginError("");
    setCreateAccountForm({
      email: "",
      password: "",
      confirmPassword: "",
    });
    setAuthMode("login");
  }

  function signOut() {
    setUserEmail("");
    setActiveTab("Appointments");
    setMessageDraft("");
  }

  if (!userEmail) {
    return (
      <LoginScreen
        authMode={authMode}
        createAccount={createAccount}
        createAccountForm={createAccountForm}
        loginError={loginError}
        loginForm={loginForm}
        setAuthMode={(mode) => {
          setAuthMode(mode);
          setLoginError("");
        }}
        setCreateAccountForm={setCreateAccountForm}
        setLoginForm={setLoginForm}
        signIn={signIn}
      />
    );
  }
    return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="border-b border-border bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">
              Clinic Workflow Platform
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Front desk operations dashboard
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as {userEmail}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setActiveTab("Appointments")}>
              New appointment
            </Button>
            <Button variant="secondary" onClick={() => setActiveTab("Reminders")}>
              Reminder queue
            </Button>
            <Button variant="secondary" onClick={signOut}>
              Log out
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav className="grid gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`rounded-md px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-white text-muted-foreground hover:bg-muted"
                }`}
                type="button"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </aside>

        <main className="grid gap-6">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-border bg-white p-4 shadow-sm"
              >
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
              </div>
            ))}
          </section>

          {activeTab === "Appointments" && (
            <AppointmentsPanel
              appointments={appointments}
              newAppointment={newAppointment}
              setNewAppointment={setNewAppointment}
              addAppointment={addAppointment}
              updateAppointment={updateAppointment}
            />
          )}

          {activeTab === "Reminders" && (
            <RemindersPanel
              appointments={appointments}
              sendReminder={sendReminder}
              updateAppointment={updateAppointment}
            />
          )}

          {activeTab === "Digital Forms" && (
            <FormsPanel
              appointments={appointments}
              updateAppointment={updateAppointment}
              sendMessage={sendMessage}
            />
          )}

          {activeTab === "Messaging" && (
            <MessagingPanel
              appointments={appointments}
              messages={messages}
              messageDraft={messageDraft}
              setMessageDraft={setMessageDraft}
              sendMessage={sendMessage}
            />
          )}

          {activeTab === "Insurance" && (
            <InsurancePanel
              appointments={appointments}
              updateAppointment={updateAppointment}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function LoginScreen({
  authMode,
  createAccount,
  createAccountForm,
  loginError,
  loginForm,
  setAuthMode,
  setCreateAccountForm,
  setLoginForm,
  signIn,
}: {
  authMode: AuthMode;
  createAccount: () => void;
  createAccountForm: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  loginError: string;
  loginForm: {
    email: string;
    password: string;
  };
  setAuthMode: (mode: AuthMode) => void;
  setCreateAccountForm: Dispatch<
    SetStateAction<{
      email: string;
      password: string;
      confirmPassword: string;
    }>
  >;
  setLoginForm: Dispatch<
    SetStateAction<{
      email: string;
      password: string;
    }>
  >;
  signIn: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isCreateMode = authMode === "create";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase text-primary">
          Clinic Workflow Platform
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          {isCreateMode ? "Create account" : "Log in"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isCreateMode
            ? "Create clinic account credentials to access workflow tools."
            : "Enter your clinic account credentials to access workflow tools."}
        </p>

        <div className="mt-5 grid grid-cols-2 rounded-md border border-border bg-muted p-1">
          <button
            className={`rounded px-3 py-2 text-sm font-medium transition ${
              !isCreateMode
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
            type="button"
            onClick={() => setAuthMode("login")}
          >
            Log in
          </button>
                    <button
            className={`rounded px-3 py-2 text-sm font-medium transition ${
              isCreateMode
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
            type="button"
            onClick={() => setAuthMode("create")}
          >
            Create account
          </button>
        </div>

        <form
          className="mt-6 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (isCreateMode) {
              createAccount();
            } else {
              signIn();
            }
          }}
        >
          <Field label="Email">
            <input
              autoComplete="email"
              className={inputClassName}
              placeholder="Email address"
              type="email"
              value={isCreateMode ? createAccountForm.email : loginForm.email}
              onChange={(event) =>
                isCreateMode
                  ? setCreateAccountForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  : setLoginForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
              }
            />
          </Field>

          <Field label="Password">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-md border border-border bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <input
                autoComplete="current-password"
                className="h-10 min-w-0 border-0 bg-white px-3 text-sm outline-none"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={
                  isCreateMode ? createAccountForm.password : loginForm.password
                }
                onChange={(event) =>
                  isCreateMode
                    ? setCreateAccountForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    : setLoginForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                }
              />
              <button
                className="border-l border-border px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          {isCreateMode ? (
            <Field label="Confirm password">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-md border border-border bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <input
                  autoComplete="new-password"
                  className="h-10 min-w-0 border-0 bg-white px-3 text-sm outline-none"
                  placeholder="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={createAccountForm.confirmPassword}
                  onChange={(event) =>
                    setCreateAccountForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
                <button
                  className="border-l border-border px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </Field>
          ) : null}

          {loginError ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {loginError}
            </p>
          ) : null}

          <Button className="w-full" type="submit">
            {isCreateMode ? "Create account" : "Log in"}
          </Button>
        </form>
      </section>
    </main>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-white shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function StatusBadge({ value }: { value: keyof typeof statusStyles }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusStyles[value]}`}
    >
      {value}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
function AppointmentsPanel({
  appointments,
  newAppointment,
  setNewAppointment,
  addAppointment,
  updateAppointment,
}: {
  appointments: Appointment[];
  newAppointment: {
    patient: string;
    reason: string;
    time: string;
    provider: string;
  };
  setNewAppointment: Dispatch<
    SetStateAction<{
      patient: string;
      reason: string;
      time: string;
      provider: string;
    }>
  >;
  addAppointment: () => void;
  updateAppointment: (
    id: string,
    updates: Partial<Omit<Appointment, "id">>,
  ) => void;
}) {
  return (
    <Panel
      title="Appointment Scheduling"
      description="Create appointments and manage today's central clinic schedule."
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_140px_160px_auto]">
        <Field label="Patient">
          <input
            className={inputClassName}
            placeholder="Patient name"
            value={newAppointment.patient}
            onChange={(event) =>
              setNewAppointment((current) => ({
                ...current,
                patient: event.target.value,
              }))
            }
          />
        </Field>
        <Field label="Reason">
          <input
            className={inputClassName}
            placeholder="Visit reason"
            value={newAppointment.reason}
            onChange={(event) =>
              setNewAppointment((current) => ({
                ...current,
                reason: event.target.value,
              }))
            }
          />
        </Field>
        <Field label="Time">
          <input
            className={inputClassName}
            placeholder="1:30 PM"
            value={newAppointment.time}
            onChange={(event) =>
              setNewAppointment((current) => ({
                ...current,
                time: event.target.value,
              }))
            }
          />
        </Field>
        <Field label="Provider">
          <input
            className={inputClassName}
            placeholder="Provider name"
            value={newAppointment.provider}
            onChange={(event) =>
              setNewAppointment((current) => ({
                ...current,
                provider: event.target.value,
              }))
            }
          />
        </Field>
        <div className="flex items-end">
          <Button className="w-full" onClick={addAppointment}>
            Add
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1fr_120px_140px_150px] bg-muted px-4 py-3 text-xs font-semibold uppercase text-muted-foreground max-md:hidden">
          <span>Patient</span>
          <span>Time</span>
          <span>Status</span>
          <span>Provider</span>
        </div>
        {appointments.length === 0 ? (
          <div className="border-t border-border p-4">
            <EmptyState message="No appointments have been added yet." />
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="grid gap-3 border-t border-border px-4 py-4 md:grid-cols-[1fr_120px_140px_150px]"
            >
              <div>
                <p className="font-medium">{appointment.patient}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.reason}
                </p>
              </div>
              <p className="text-sm font-medium">{appointment.time}</p>
              <StatusBadge value={appointment.status} />
              <input
                className={inputClassName}
                placeholder="Provider name"
                value={appointment.provider}
                onChange={(event) =>
                  updateAppointment(appointment.id, {
                    provider: event.target.value,
                  })
                }
              />
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

function RemindersPanel({
  appointments,
  sendReminder,
  updateAppointment,
}: {
  appointments: Appointment[];
  sendReminder: (appointment: Appointment) => void;
  updateAppointment: (
    id: string,
    updates: Partial<Omit<Appointment, "id">>,
  ) => void;
}) {
  return (
    <Panel
      title="Patient Reminders"
      description="Edit channels, send reminders, and move patients out of the no-show risk queue."
    >
      {appointments.length === 0 ? (
        <EmptyState message="No reminders are queued because no appointments have been added yet." />
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="grid gap-4 rounded-lg border border-border p-4 lg:grid-cols-[1fr_160px_140px_auto]"
            >
              <div>
                <p className="font-medium">{appointment.patient}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.time} with {appointment.provider}
                </p>
              </div>
              <select
                className={inputClassName}
                value={appointment.reminderChannel}
                onChange={(event) =>
                  updateAppointment(appointment.id, {
                    reminderChannel: event.target.value as ReminderChannel,
                  })
                }
              >
                <option>SMS</option>
                <option>Email</option>
                <option>Call</option>
              </select>
              <StatusBadge value={appointment.status} />
              <Button onClick={() => sendReminder(appointment)}>
                Send reminder
              </Button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function FormsPanel({
  appointments,
  updateAppointment,
  sendMessage,
}: {
  appointments: Appointment[];
  updateAppointment: (
    id: string,
    updates: Partial<Omit<Appointment, "id">>,
  ) => void;
  sendMessage: (patient: string, body?: string) => void;
}) {
  return (
    <Panel
      title="Digital Forms"
      description="Send intake packets before visits and track completion status."
    >
      {appointments.length === 0 ? (
        <EmptyState message="No forms are queued because no appointments have been added yet." />
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="grid gap-4 rounded-lg border border-border p-4 lg:grid-cols-[1fr_140px_auto_auto]"
            >
              <div>
                <p className="font-medium">{appointment.patient}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.reason} at {appointment.time}
                </p>
              </div>
              <StatusBadge value={appointment.formsStatus} />
              <Button
                variant="secondary"
                onClick={() => {
                  updateAppointment(appointment.id, {
                    formsStatus: "Sent",
                    status: "Forms pending",
                  });
                  sendMessage(
                    appointment.patient,
                    "Your digital intake forms are ready to complete before your visit.",
                  );
                }}
              >
                Send forms
              </Button>
              <Button
                onClick={() =>
                  updateAppointment(appointment.id, {
                    formsStatus: "Completed",
                    status: "Confirmed",
                  })
                }
              >
                Mark complete
              </Button>
            </div>
          ))}
        </div>
      )}
            )}
    </Panel>
  );
}

function MessagingPanel({
  appointments,
  messages,
  messageDraft,
  setMessageDraft,
  sendMessage,
}: {
  appointments: Appointment[];
  messages: Message[];
  messageDraft: string;
  setMessageDraft: Dispatch<SetStateAction<string>>;
  sendMessage: (patient: string, body?: string) => void;
}) {
  const [selectedPatient, setSelectedPatient] = useState("");

  return (
    <Panel
      title="Patient Messaging"
      description="Send lightweight operational messages from the front desk."
    >
      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="grid gap-3">
          <Field label="Patient">
            <select
              className={inputClassName}
              disabled={appointments.length === 0}
              value={selectedPatient}
              onChange={(event) => setSelectedPatient(event.target.value)}
            >
              <option value="">Select patient</option>
              {appointments.map((appointment) => (
                <option key={appointment.id} value={appointment.patient}>
                  {appointment.patient}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Message">
            <textarea
              className="min-h-32 rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Write patient message"
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
            />
          </Field>
          <Button onClick={() => sendMessage(selectedPatient)}>Send message</Button>
        </div>

        <div className="max-h-[420px] overflow-auto rounded-lg border border-border">
          {messages.length === 0 ? (
            <div className="p-4">
              <EmptyState message="No messages have been sent yet." />
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className="border-b border-border p-4 last:border-b-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{message.patient}</p>
                  <p className="text-xs text-muted-foreground">
                    {message.sender} - {message.time}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {message.body}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Panel>
  );
}

function InsurancePanel({
  appointments,
  updateAppointment,
}: {
  appointments: Appointment[];
  updateAppointment: (
    id: string,
    updates: Partial<Omit<Appointment, "id">>,
  ) => void;
}) {
  return (
    <Panel
      title="Insurance Verification"
      description="Review coverage status before visits and resolve issues earlier."
    >
      {appointments.length === 0 ? (
        <EmptyState message="No insurance checks are queued because no appointments have been added yet." />
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="grid gap-4 rounded-lg border border-border p-4 lg:grid-cols-[1fr_140px_auto_auto]"
            >
              <div>
                <p className="font-medium">{appointment.patient}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.id} - {appointment.reason}
                </p>
              </div>
              <StatusBadge value={appointment.insuranceStatus} />
              <Button
                variant="secondary"
                onClick={() =>
                  updateAppointment(appointment.id, {
                    insuranceStatus: "Pending",
                  })
                }
              >
                Recheck
              </Button>
              <Button
                onClick={() =>
                  updateAppointment(appointment.id, {
                    insuranceStatus: "Verified",
                  })
                }
              >
                Verify
              </Button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
      
