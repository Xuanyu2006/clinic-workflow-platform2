# Med Base User Guide

Med Base is a workflow coordination prototype for healthcare teams. It helps
test administrative workflows, scheduling, internal communication, task review,
and operational settings.

Do not enter real patient information. Use fictional names, fake phone numbers,
fake appointment details, and fake messages only.

## Before You Start

Use the live site:

```text
https://www.medbasehealth.com
```

You need:

- An email address for testing.
- A password with at least 8 characters, including a letter, number, and special
  character.
- A fictional company or clinic name for the workspace.

## Create An Account

1. Open `https://www.medbasehealth.com`.
2. Click the login or account button on the landing page.
3. Choose `Create account`.
4. Enter your email.
5. Enter a fictional company or clinic name.
6. Choose your role.
7. Create a password.
8. Confirm the password.
9. Submit the form.

Each new company name creates a separate organization workspace. Users from one
company should not see another company's workflow data.

## Log In

1. Open `https://www.medbasehealth.com`.
2. Go to the login screen.
3. Choose `Log in`.
4. Enter your email and password.
5. Submit the form.

After login, the dashboard opens for your organization workspace.

## Dashboard

Use the dashboard as the team's daily operations overview.

Check:

- Today's appointments.
- Staff on shift.
- Pending tasks.
- Overdue tasks.
- Recent activity.
- Notifications.

For testing, confirm that a new organization starts clean and does not show
another company's information.

## Scheduling

Use Scheduling to test appointment and shift coordination.

You can:

- View clinic and SNF schedule items.
- Switch between daily, weekly, and monthly views.
- Move schedule items between days.
- Review color-coded event types.

Use fake schedule titles only, such as `Follow-up appointment` or
`Front desk shift`.

## Tasks

Use Tasks for shared administrative work.

Tasks can move through these statuses:

- Draft
- Pending Approval
- Approved
- In Progress
- Completed
- Cancelled
- Overdue

Use filters to review:

- My Tasks
- Provider
- Department
- Today's Tasks
- Overdue
- Completed

Do not enter medical decisions, diagnoses, prescriptions, or real patient
details.

## Messages

Use Messages for internal team communication testing.

You can:

- Create a group conversation.
- Add staff to a group.
- Send internal operational messages.
- Generate an AI summary draft from the conversation.
- Review suggested follow-up actions before creating a task.

AI suggestions are drafts only. A human must review them before they become
tasks. The AI must not make clinical or medical decisions.

## Communication

Use Communication for broader internal updates.

Boards include:

- Announcements
- Shift notes
- Daily reminders

Use this for operational notes only. Do not post real patient identifiers or
clinical details.

## Analytics

Use Analytics to review operational metrics only.

Examples:

- Appointment volume.
- No-show rate.
- Average wait time.
- Task completion rate.
- Staff workload.
- Phone call volume.

Analytics should not show patient medical information.

## Settings

Use Settings to adjust organization and user preferences.

You can test:

- Organization name.
- Departments.
- Notification preferences.
- Theme preferences.
- User management.
- Role management.
- Privacy mode.
- Session timeout preference.

Settings are part of the workflow prototype and should be tested with fake
organization data only.

## Role Access

Different roles may see different navigation tabs.

Current roles include:

- Administrator
- Physician
- Nurse
- Medical Assistant
- Front Desk
- Office Manager
- Scheduler
- Therapist
- Patient Coordinator
- Referral Coordinator
- Care Coordinator
- SNF Coordinator
- Records Coordinator
- Operations Lead
- Receptionist

For testing, create accounts with different roles and confirm the navigation
matches what that role should access.

## What Testers Should Check

Use this checklist:

1. The landing page opens.
2. Create account works.
3. Company or clinic name appears during signup.
4. Login works.
5. Dashboard loads.
6. Scheduling tab opens.
7. Tasks tab opens.
8. Messages tab opens.
9. Communication tab opens.
10. Analytics tab opens when the selected role has permission.
11. Settings tab opens when the selected role has permission.
12. One company's account does not show another company's data.
13. No page asks for real patient data.

## Current Limitations

Med Base is ready for private testing, but not real clinical use.

Not ready yet:

- Real patient data.
- HIPAA production use.
- Billing.
- EHR replacement workflows.
- Diagnosis or treatment workflows.
- Real email or SMS notifications.
- Formal audit retention.
- Full compliance review.
- Signed BAAs with vendors.

## Safe Testing Rules

Use fictional data like:

```text
Test Clinic
Demo Staff Member
Appointment follow-up
Front desk coverage
Insurance verification pending
```

Do not use:

```text
Real patient names
Birth dates
Phone numbers
Medical record numbers
Insurance member IDs
Diagnoses
Treatment plans
Prescription information
Billing details
```

## Quick Support Notes

If signup fails, check:

- Supabase environment variables in Vercel.
- Supabase Auth settings.
- Password strength.
- Whether email confirmation is required.

If the domain fails, check:

- Vercel deployment status.
- Cloudflare DNS records.
- Proxy status is DNS only during verification.
- `medbasehealth.com` redirects to `www.medbasehealth.com`.

If data appears missing, first confirm:

- You are logged into the correct account.
- You are in the expected company workspace.
- The data was created after the Supabase database setup was completed.
