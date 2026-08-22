# SkillAssociate — Placement Readiness Engine Specification

This document defines the deterministic, database-backed **Placement Readiness Formula** for educational institutions on SkillAssociate.

---

## 1. Objective

The Placement Readiness Engine evaluates student career profiles, resume availability, ATS match capability, and AI mock interview scores to convert raw student activity into actionable institution-level placement intelligence.

It avoids black-box or arbitrary AI scores, relying entirely on deterministic database metrics.

---

## 2. Readiness Dimensions & Thresholds

| Readiness Dimension | Deterministic Database Condition | Weight / Criteria |
| :--- | :--- | :--- |
| **Profile Readiness** | `Profile.completionScore >= 80` | Required |
| **Resume Readiness** | `Resumes.length >= 1` | Required |
| **ATS Readiness** | `Average(AtsScans.overallScore) >= 75` | Required |
| **Interview Readiness** | `InterviewSessions.length >= 1 AND Average(InterviewSessions.totalScore) >= 70` | Required |

---

## 3. Overall Placement Readiness Definition

A candidate is classified as **Placement Ready** if and only if **ALL FOUR** individual readiness dimensions are satisfied:

$$\text{Placement Ready} = \text{Profile Ready} \land \text{Resume Ready} \land \text{ATS Ready} \land \text{Interview Ready}$$

### Student Career Status Categorization

1. **Placement Ready**: All 4 readiness dimensions satisfied.
2. **Needs Improvement**: Satisfies at least 2 dimensions, but missing 1 or 2.
3. **Not Ready**: Satisfies fewer than 2 dimensions.

---

## 4. Placement Funnel Stages

Institutions track student placement progression through 7 deterministic stages:

1. **Total Enrolled Students**: All candidates associated with `User.instituteId`.
2. **Profile Completed**: Candidates with `completionScore >= 80`.
3. **Resume Ready**: Candidates with at least 1 active resume.
4. **ATS Verified**: Candidates with average ATS score >= 75.
5. **Interview Qualified**: Candidates with mock interview score >= 70.
6. **Placement Ready**: Candidates meeting all 4 readiness thresholds.
7. **Placed**: Candidates with job application status `OFFERED` or profile placement status `PLACED`.

---

## 5. Security & Isolation

- Readiness calculations are computed strictly server-side inside `lib/institute/readiness-engine.ts`.
- All database aggregations filter by `User.instituteId`, preventing cross-institutional data leakage.
