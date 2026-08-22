# SkillAssociate — Product Requirements Document (PRD)

**Version:** 1.0.0  
**Status:** Approved for Milestone Execution  
**Target Platform:** Production Career SaaS Platform (Candidate & Institute Ecosystems)  

---

## 1. Executive Summary & Vision

**SkillAssociate** is an all-in-one, high-performance career platform designed to empower job seekers (candidates) to prepare for top-tier roles, build ATS-optimized resumes, evaluate ATS compatibility, practice AI-driven mock interviews, discover curated jobs, and track career progress. Furthermore, SkillAssociate features an extensible multi-tenant architecture designed to support educational institutes, colleges, and bootcamps to manage student placements, track readiness analytics, and host campus recruitment drives.

### Brand Identity & Design Ethos
- **Design Philosophy:** Monochrome Elegance (Strict Black, White, and Neutral Grays). High contrast, precise typography, spacious layouts, thin structural borders, subtle micro-interactions.
- **Core Value Proposition:** *Build. Prepare. Improve. Get Hired.*
- **Target Audience:**
  1. **Candidates:** Fresh graduates, active job seekers, mid-career professionals looking to upskill, practice interviews, and land jobs.
  2. **Institutes (Future Phase Foundation):** Placement officers, university admins, bootcamp directors tracking student job readiness and company pipelines.

---

## 2. Product Ecosystems & Architecture Overview

```text
                               SkillAssociate Platform
                                          |
                     +--------------------+--------------------+
                     |                                         |
             Candidate Ecosystem                       Institute Ecosystem
                     |                                         |
     +---------------+---------------+         +---------------+---------------+
     |               |               |         |               |               |
  Profile         Resume         ATS Scan   Students       Placement       Analytics
 & Metrics       Builder       & Evaluator  Tracking        Drive         & Reports
     |               |               |
     +---------------+---------------+
                     |
            AI Mock Interview Engine
```

---

## 3. Core Candidate Features & Requirements

### 3.1 Candidate Profile Management
- **Personal & Contact Info:** Full Name, Professional Headline, Email, Phone, Location, Profile Photo, Bio.
- **Social & Web Links:** LinkedIn, GitHub, Portfolio URL, Twitter/X.
- **Education:** Institution Name, Degree, Field of Study, Start/End Dates, Grade/CGPA, Achievements.
- **Experience:** Company, Role, Employment Type, Location, Start/End Dates, Key Achievements & Responsibilities.
- **Skills Matrix:** Categorized technical and soft skills with proficiency tags.
- **Projects:** Title, Description, Tech Stack, Live Link, GitHub Repository.
- **Certifications & Achievements:** Issuer, Date, Credential ID, URL, Honors.
- **Dynamic Completion Score:** Real-time calculation engine measuring profile completeness (0-100%).

### 3.2 Professional Resume Builder
- **ATS-Optimized Templates:** Clean, single/double column monochrome layouts engineered for OCR and parser readability.
- **Live Interactive Preview:** Real-time side-by-side editing and visual preview.
- **Section Reordering & Customization:** Ability to add, edit, reorder, and hide sections.
- **PDF Generation & Export:** High-fidelity client/server PDF generation matching ATS standard layouts.
- **Resume Management:** Version history, draft saving, duplicate, edit, and deletion features.

### 3.3 ATS Score Checker & Keyword Evaluator
- **Analysis Engine:** Evaluates resume text against target Job Descriptions (JD) or industry benchmarks.
- **Multi-Dimensional Metrics:**
  - Overall ATS Compatibility Score (0-100%)
  - Keyword & Skill Match Percentage
  - Experience & Education Alignment
  - Formatting & Structural Compliance
  - Missing Critical Keywords
- **Actionable Feedback:** Categorized list of strengths, weaknesses, and step-by-step suggestions for improvement.
- **Scan History & Tracking:** Timeline of previous scans for comparison over time.

### 3.4 AI Mock Interview Platform
- **Session Customization:** Job Role, Target Seniority Level, Interview Focus (Technical, Behavioral, HR, System Design), Difficulty Level, and Question Count (3 to 10 questions).
- **Interactive Interview Loop:** Question presentation, timer, text/speech response entry, question navigation.
- **Comprehensive AI Evaluation Report:**
  - Overall Score & Radar Matrix
  - Technical Knowledge & Accuracy
  - Communication Clarity & Structure (STAR method adherence)
  - Problem Solving & Role Relevance
  - Detailed Question-by-Question Feedback with Model Sample Answers
- **Session History:** Historical trends of scores across multiple practice sessions.

### 3.5 Jobs & Career Portal
- **Job Discovery:** Integrated job board with keyword search, location filtering, experience level, job type (Full-time, Remote, Internship).
- **Application Tracker:** Kanban/List view to track jobs across stages (`Saved`, `Applied`, `Interviewing`, `Offered`, `Rejected`).
- **Job Recommendation Baseline:** Skill and headline matching engine recommending relevant openings to candidates.

### 3.6 Career Resources & Skill Assessments
- **Interview Guides:** Industry-specific cheat sheets and common behavioral/technical questions.
- **Skill Assessments:** Self-paced quick quizzes to validate competencies and add verified badges to candidate profiles.
- **Saved Items:** Bookmarked jobs, guides, and resume templates.

---

## 4. Institute Ecosystem Baseline (Architecture & Tenant Foundation)

- **Multi-Tenant Data Isolation:** Tenant ID scoping across student records and job postings.
- **Role-Based Access Control (RBAC):** `CANDIDATE`, `INSTITUTE_ADMIN`, `INSTITUTE_FACULTY`, `SUPER_ADMIN`.
- **Institute Dashboard Concept:** Aggregate view of student enrollment, overall interview readiness scores, resume ATS pass rates, and active recruiter postings.

---

## 5. Design System Specifications (Monochrome B&W Standard)

### Color Palette
- **Background Primary:** `#FFFFFF` (Light Mode) / `#09090B` (Dark Mode Container background)
- **Background Secondary:** `#F4F4F5` / `#18181B`
- **Surface / Card:** `#FFFFFF` / `#09090B` with subtle 1px border (`#E4E4E7` / `#27272A`)
- **Text Primary:** `#09090B` / `#FAFAFA`
- **Text Secondary:** `#71717A` / `#A1A1AA`
- **Borders & Dividers:** `#E4E4E7` / `#27272A`
- **Accents & Action Buttons:** `#000000` text white (Primary Action) or outline 1px border.

### Visual Principles
1. **Typography:** Inter / System Sans-serif with crisp font weights (Medium 500, SemiBold 600, Bold 700).
2. **Borders:** Thin 1px solid borders (`border-neutral-200` / `border-neutral-800`).
3. **Card Elevation:** Zero heavy drop-shadows; clean borders with subtle micro-shadow on hover.
4. **States:** Every interactive element features explicit Hover, Focus-visible (ring-neutral-900), Active, Disabled, Loading (Spinner/Skeleton), and Empty states.

---

## 6. Technical Stack & Infrastructure Requirements

- **Framework:** Next.js 15 (App Router with React 19, TypeScript)
- **Styling:** Tailwind CSS v4 / CSS Modules with Monochrome Custom Theme
- **Database & ORM:** Prisma ORM with SQLite (Local Dev) / PostgreSQL ready schema
- **Authentication:** Custom Secure Session Management (HttpOnly Cookies, JWT with bcryptjs password hashing)
- **PDF Engine:** Client-side / Server-side HTML-to-PDF engine (`@react-pdf/renderer` or `jspdf`/`html2canvas`)
- **AI Engine:** Structured evaluation engine adapter supporting OpenAI / Gemini API with fallback rule-based NLP parser.
- **State & Icons:** React Context / Zustand, Lucide Icons, Framer Motion.

---

## 7. Quality Assurance & Milestone Verification Protocol

Each milestone must strictly fulfill:
1. TypeScript strict type checking without errors.
2. Lint check (`npm run lint`) passing clean.
3. Build execution (`npm run build`) succeeding without compilation or route errors.
4. Functional verification of responsive layout, loading states, error boundaries, and empty states.
