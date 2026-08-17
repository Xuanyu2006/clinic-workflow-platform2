# Med Base Privacy And Security Readiness

Med Base is not approved for real patient data until a formal legal, security,
and compliance review is completed.

## Current Allowed Use

- Prototype testing
- Internal workflow demos
- Fictional data only
- Operational coordination examples

## Blocked Until Approval

- Protected Health Information
- Patient identifiers
- Diagnosis, treatment, prescription, or clinical decision content
- Billing or claims data
- Insurance member IDs or policy numbers

## Required Before Production Clinical Use

1. HIPAA risk assessment.
2. Signed BAAs with all vendors that may touch regulated data.
3. Access control review for each role.
4. Supabase RLS verification in staging and production.
5. Audit log retention policy.
6. Incident response plan.
7. Backup and restore testing.
8. Monitoring and alerting setup.
9. Privacy policy and terms review by counsel.
10. Staff training and acceptable-use policy.

## Product Guardrail

Med Base is a workflow coordination platform. It is not an EHR and must not make
medical decisions, generate diagnoses, prescribe treatment, or store clinical
documentation unless the product scope and compliance controls are formally
expanded.
