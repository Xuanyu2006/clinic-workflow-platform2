# Supabase Setup

Med Base is Supabase-ready, but it must not store real patient data until privacy, security, legal, and compliance review is complete.

## 1. Create Project

1. Open Supabase.
2. Create a new project for Med Base.
3. Copy the project URL and anon public key from Project Settings > API.

## 2. Add Environment Variables

Add these locally in `.env.local` and in Vercel project settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON=
SUPABASE_SERVICE_ROLE_KEY=
```

Only use `SUPABASE_SERVICE_ROLE_KEY` on the server. Never expose it in browser code.

## 3. Run Database Foundation SQL

In Supabase SQL Editor, run:

```text
database/001_medbase_foundation.sql
```

This creates:

- user profiles and roles
- organizations
- tasks
- appointments
- schedule events
- conversations
- conversation members
- messages
- AI summary drafts
- row-level security policies

## 4. Auth Settings For Testing

For fastest internal testing, Supabase Auth can temporarily allow email/password signups without email confirmation. Before a broader beta, decide whether email confirmation should be required.

## 5. Testing Rules

- Use fictional names and fictional workflow records only.
- Do not enter real patient names, dates of birth, diagnoses, treatment details, insurance identifiers, billing data, or medical record content.
- AI summaries are operational drafts only and must require human review before task creation.

## 6. Vercel Deploy

After setting env vars in Vercel, redeploy the latest commit. Login/create-account should show `Supabase authentication is active.`
