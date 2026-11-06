# BRVIN Teachers — First Pilot Brief

**Status:** Phase 0 in progress — pilot teacher identified; source and channel setup pending  
**Last updated:** 6 November 2026  
**Purpose:** Define the smallest genuine teacher-led pilot before Phase 1 data-model implementation.

## 1. Pilot identity

| Field | Current decision |
|---|---|
| Pilot teacher | The user participating in this project as a real-life teacher |
| Teacher consent | Confirmed in the project conversation |
| Public documentation label | `Self-pilot teacher — Physics` |
| Operating model | Operator-managed pilot; no teacher self-service builder |
| Pilot size | One teacher and a small, teacher-approved student test group |

Do not publish the teacher's personal identity or student details in this repository. Use the label above in the BRVIN Admin project until the teacher chooses another display label.

## 2. Subject and teaching workflow

- Subject: Physics.
- Initial topic candidate: **Newton's Laws of Motion**.
- Target knowledge source: one teacher-approved, exactly three-page PDF.
- Intended student workflow: a student asks a conceptual or numerical question about the three-page topic; the assistant explains the relevant principle, works through a suitable example and cites the source title and physical PDF page where supported.
- Topic scope and final learning outcomes must be confirmed by the teacher before the source is treated as approved pilot material.

This is a deliberately narrow pilot. It does not authorize a general-purpose physics tutor or all-subject rollout.

## 3. BRVIN knowledge setup

Create the following records in the existing BRVIN Admin workspace in `ashini-x/parmar-ai`:

| Record | Proposed value |
|---|---|
| Teacher / owner label | `Self-pilot teacher — Physics` |
| Knowledge project | `Physics — Newton's Laws of Motion (Pilot)` |
| Project description | `Teacher-approved three-page physics pilot covering Newton's laws, force, mass, acceleration, inertia, action-reaction and worked examples.` |
| Collection | `Physics — Newton's Laws — Pilot Sources` |
| Collection description | `Approved source material for the first BRVIN Teachers physics pilot.` |
| Source title | `Newton's Laws of Motion — Teacher Pilot Notes` |
| Source type | One original or otherwise legitimately licensed three-page PDF approved by the teacher |

BRVIN remains the authority for PDF storage, OCR, indexing, readiness, grants and retrieval. Do not create a separate BRVIN knowledge database or copy the source into the consumer app.

After ingestion, verify that the source is `READY` and all three pages are indexed. Then grant the pilot project access to the collection (or use a narrow direct-book grant if the actual Admin workflow makes that more appropriate). Do not grant the project to an application yet; the consumer application has not been registered.

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
- [ ] Obtain or prepare the teacher-approved three-page PDF.
- [ ] Create the BRVIN knowledge project.
- [ ] Create the collection and upload the PDF.
- [ ] Verify `READY` and 3/3 indexed pages.
- [ ] Assign the collection/source to the pilot project.
- [ ] Select the first channel.
- [ ] Approve student enrollment/authentication policy.
- [ ] Approve answer behavior and citation format.
- [ ] Set application-level usage and model-spend limits.
- [ ] Record measurable quality and latency acceptance thresholds.

## 10. Explicitly deferred

Do not create the application D1 schema, register a BRVIN application/environment, issue a BRVIN app-project grant, configure the private Service Binding or add live channel credentials until the required Phase 0 decisions and Phase 1 foundation are ready. Do not use a synthetic production teacher, source or grant.
