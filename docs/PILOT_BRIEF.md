# BRVIN Teachers — First Pilot Brief

**Status:** First real teacher profile created; BRVIN production environment registered; project/collection/PDF upload awaits private binding release and verification  
**Last updated:** 6 November 2026  
**Purpose:** Define the smallest genuine teacher-led pilot before Phase 1 data-model implementation.

## 1. Pilot identity

| Field | Current decision |
|---|---|
| Pilot teacher | The real teacher profile already created in BRVIN Teachers (`TCH-000001`) |
| Teacher participation | Confirmed; the teacher is directly participating in onboarding and will approve the teaching material |
| Public documentation label | `First teacher onboarding — Physics` (role label only; no personal details) |
| Operating model | Standard operator-managed teacher onboarding; this is the same process intended for future teachers |
| Pilot size | One teacher and a small, teacher-approved student test group |

Do not publish the teacher's personal identity or student details in this repository. The actual display name is already stored in the BRVIN Teachers teacher profile and will be associated with the Core project through the Operator Console. The repository uses a role label only; this is not a synthetic teacher or a special internal account.

## 2. Subject and teaching workflow

- Subject: Physics (Class IX Science topic).
- Initial topic candidate: **Newton's Laws of Motion**.
- Target knowledge source: the prepared three-page Class IX *Force and Laws of Motion* handout; teacher review and approval are still pending.
- Intended student workflow: a student asks a conceptual or numerical question about the three-page topic; the assistant explains the relevant principle, works through a suitable example and cites the source title and physical PDF page where supported.
- Topic scope and final learning outcomes must be confirmed by the teacher before the source is treated as approved pilot material.

This is a deliberately narrow pilot. It does not authorize a general-purpose physics tutor or all-subject rollout.

## 3. BRVIN knowledge setup

After the private management binding is live, create the following records from the existing teacher's workspace in the BRVIN Teachers Operator Console. The Console calls the Core management entrypoint; BRVIN Core remains the owner of project, collection and source records. Do not create a duplicate project manually in BRVIN Admin.

| Record | Proposed value |
|---|---|
| Teacher / owner label | The existing teacher workspace; retain the real display name already entered |
| Knowledge project | `Physics — Newton's Laws of Motion` |
| Project description | `Teacher-approved three-page physics pilot covering Newton's laws, force, mass, acceleration, inertia, action-reaction and worked examples.` |
| Collection | `Physics — Newton's Laws of Motion` |
| Collection description | `Approved source material for the first BRVIN Teachers physics pilot.` |
| Source title | `Force and Laws of Motion — Class IX pilot handout (3 pages)` |
| Source type | Prepared attributed CC BY-SA 4.0 adaptation; obtain teacher approval before upload |

BRVIN remains the authority for PDF storage, OCR, indexing, readiness, grants and retrieval. Do not create a separate BRVIN knowledge database or copy the source into the consumer app.

After ingestion, verify that the source is `READY` and all three pages are indexed. The management API creates the BRVIN Teachers application-project grant when it creates the teacher-owned project. Then assign the collection/source to that project through the teacher workspace. Do not create duplicate Core projects or manually change grants unless the operator workflow explicitly requires it.

Google Cloud Vision OCR may incur usage costs; acknowledge the upload prompt only after reviewing the intended PDF and its page count.

## 4. Channel decision

**Not yet selected.**

Telegram is the recommended first candidate because of the existing operational experience, but the teacher has not confirmed the channel. Do not register a live bot, add provider credentials or create a webhook until this decision and the credential-storage design are accepted.

## 5. Student authentication and access

**Not yet finalized.**

Recommended first-pilot policy: a small, teacher-approved student allowlist or invitation-based enrollment. The application must authenticate each student and map the verified identity to the tenant and project server-side. A Telegram user ID, browser parameter, teacher label or project ID alone is not authorization.

## 6. Initial answer behavior

Proposed baseline, subject to teacher approval:

1. Explain the relevant physics principle in clear student-friendly language.
2. Show the reasoning or calculation step by step where relevant.
3. Include a simple worked example when useful.
4. Cite the source title and physical PDF page only when supported by retrieved evidence.
5. Say clearly when the approved source does not contain enough information.
6. Never invent evidence, PDF pages or teacher-approved rules.

## 7. Operating policy and budget

- Pilot administration is operator-managed.
- Only teacher-approved students should be enabled.
- Provider usage and per-tenant limits must be configurable and visible.
- BRVIN currently enforces its own project-level monthly retrieval allowance; that is not a substitute for an application-level model-spend budget.
- The application-level request limit, per-student policy and monthly model budget remain to be set before students are enabled.

## 8. Pilot acceptance tests

The first acceptance set must include:

1. A relevant question is answered using the approved project evidence.
2. The answer preserves the correct source title and physical PDF page.
3. A question outside the three-page source's coverage does not receive fabricated citations or unsupported claims.
4. An unauthenticated student is denied.
5. A student cannot select another tenant's project.
6. A revoked BRVIN application-project grant causes subsequent retrieval to be denied.
7. BRVIN/provider unavailability fails safely without unrestricted fallback.
8. Usage is attributable to the correct tenant and student without storing unnecessary raw personal data or source text in logs.

Quality, latency and cost thresholds must be agreed before wider student access.

## 9. Remaining Phase 0 decisions

- [ ] Confirm Newton's Laws of Motion as the exact three-page topic.
- [x] Prepare an attributed three-page open-license adaptation; teacher approval remains pending.
- [x] Create the real teacher profile in BRVIN Teachers (`TCH-000001`).
- [x] Register BRVIN Teachers and its active production environment in BRVIN Admin.
- [ ] Release and verify the two private BRVIN bindings.
- [ ] Create the Physics knowledge project and collection from the existing teacher workspace.
- [ ] Obtain teacher approval and upload the prepared PDF.
- [ ] Verify `READY` and 3/3 indexed pages.
- [ ] Assign the collection/source to the pilot project.
- [ ] Select the first channel.
- [ ] Approve student enrollment/authentication policy.
- [ ] Approve answer behavior and citation format.
- [ ] Set application-level usage and model-spend limits.
- [ ] Record measurable quality and latency acceptance thresholds.

## 10. Explicitly deferred

Do not create the application D1 schema, register a BRVIN application/environment, issue a BRVIN app-project grant, configure the private Service Binding or add live channel credentials until the required Phase 0 decisions and Phase 1 foundation are ready. Do not use a synthetic production teacher, source or grant.
