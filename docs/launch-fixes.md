# Pilot hardening release

This release fixes calendar date ranges, persisted-task filters, failed-save feedback, account configuration fallback, private chat membership, team invitations, message authorship, and database-generated audit records. Production builds now check types and lint. CI runs the test suite, lint, type checks and build on Node 24.

Apply `database/004_launch_hardening.sql` once after migrations 001–003 before publishing the frontend. Back up the database first according to your operational policy. The migration was validated with a rollback trial and synthetic authorization fixtures before being applied to the connected production project.

## Invitation workflow
An administrator creates a link in Settings and manually shares it with the specified person. It expires after seven days. The recipient opens it and creates a **new account using that email**; the database assigns the invited workspace and role. Existing accounts are not moved between workspaces. A new non-invited signup creates a separate workspace as its owner. Administrators should create a new invitation when a link expires.

Existing conversations retain their creator as a member. Creators or workspace administrators can add intended members through the validated member function. Other staff no longer receive organization-wide chat access. Messages are append-only for browser clients and the sender must be the authenticated member.

## Workflow changes
- Calendars use the device timezone, provide Previous/Today/Next controls, include weekends, filter actual dates, and render six-week months.
- Manual review drafts contain recent message excerpts and editable task details, priority and optional due date. Staff can assign draft tasks to a workspace email. No AI model is connected.
- Task dates remain ISO timestamps for filtering. My Tasks matches the signed-in email. Overdue derives from due time and excludes completed/cancelled tasks.
- Dashboard counts are limited to the current day; shifts are labeled as scheduled today, not as currently working.
- Use Refresh workspace to load colleagues' updates. Live push messaging is not implemented.
- Settings writes are serialized and failures are shown. Idle sign-out runs according to the configured session timeout while the app is open.
- Password-reset and verification-email actions are available. Configure the Supabase Site URL and allowed reset redirect as `https://medbasehealth.com/reset-password` and the www equivalent if used. Email deliverability depends on the project's email provider and quotas.
- A missing Supabase configuration or missing user profile blocks workspace entry. No fake signed-in fallback or shared-preview membership is created.

## Still outside this release
The site is a **fictional-data pilot**, not a clinical launch. Automated AI summaries, email/SMS reminder delivery, digital patient forms, no-show/wait-time analytics, automatic real-time message delivery, existing-account invitation acceptance, and production legal/compliance readiness are not completed. The interface discloses unsupported features. A dedicated request-demo/lead capture flow and paid-ad conversion measurement still need a product decision.

## Verification
The original 12 source regression tests and four executable behavior tests passed. Behavior tests cover all months from 2024–2028, leap days, persisted-date task filtering, personal assignments, and overdue handling. SQL fixtures verified invitation scope/role, profile role and tenant immutability, private membership, sender identity, cross-tenant updates and authoritative auditing; all fixtures were rolled back. A no-configuration browser check verified that sign-in is blocked. These checks do not replace a complete production security review or a multi-user clinical acceptance test.
