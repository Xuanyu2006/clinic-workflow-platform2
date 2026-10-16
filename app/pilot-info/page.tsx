import Link from "next/link";
export const metadata = { title: "Pilot information" };
export default function PilotInformation() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-16">
      <Link href="/" className="text-primary">
        ← Med Base
      </Link>
      <h1 className="text-3xl font-bold">Pilot use and data handling</h1>
      <p>
        Med Base is currently a fictional-data pilot for staff scheduling, team
        messages, and manually reviewed tasks. It is not available for real
        patient information or clinical documentation.
      </p>
      <h2 className="text-xl font-semibold">What is stored</h2>
      <p>
        Account email, workspace membership, staff roles, schedules, messages,
        task drafts, preferences, and audit records are stored in the connected
        Supabase project. The application is hosted on Vercel.
      </p>
      <h2 className="text-xl font-semibold">Current features</h2>
      <p>
        Conversation review copies recent message excerpts into an editable
        draft. No AI model is connected. Email and SMS reminders, digital
        patient forms, billing, and clinical decisions are not supported.
      </p>
      <h2 className="text-xl font-semibold">Invitations and access</h2>
      <p>
        Workspace owners can create invitation links for new staff accounts.
        Links expire after seven days and are limited to the specified email.
        The owner shares the link directly; Med Base does not send an invitation
        email.
      </p>
      <h2 className="text-xl font-semibold">Before real use</h2>
      <p>
        A production privacy policy, service terms, retention and deletion
        procedures, and security review must be finalized before onboarding real
        clinic data. Contact your workspace owner about access or stored pilot
        data.
      </p>
    </main>
  );
}
