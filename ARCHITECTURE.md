# SkillAssociate — System Architecture & Technical Specification

## 1. Directory & Codebase Structure

```text
SkillAssociate/
├── app/                        # Next.js 15 App Router Pages & API Routes
│   ├── (auth)/                 # Auth routes layout group (login, register)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/            # Authenticated App Shell layout group
│   │   ├── layout.tsx          # Main shell (Header, Sidebar, Navigation)
│   │   ├── dashboard/page.tsx  # Main Candidate Dashboard
│   │   ├── profile/            # Profile Management
│   │   ├── resume/             # Resume Builder & Templates
│   │   ├── ats-checker/        # ATS Score Checker & History
│   │   ├── mock-interview/     # AI Interview Setup, Execution & Results
│   │   ├── jobs/               # Job Discovery & Application Tracker
│   │   ├── resources/          # Career Guides & Assessments
│   │   ├── settings/           # Account & Security Settings
│   │   └── institute/          # Institute Portal Foundation
│   ├── api/                    # RESTful Backend API Endpoints
│   │   ├── auth/               # [...nextauth] / login / register / me / logout
│   │   ├── profile/            # Profile CRUD & completion score calculation
│   │   ├── resume/             # Resume CRUD & PDF export handler
│   │   ├── ats/                # ATS evaluation scanner endpoint
│   │   ├── interview/          # Session generator, question audio/text submit, score evaluator
│   │   ├── jobs/               # Job listing, filtering, saving & application tracking
│   │   └── activity/           # Timeline audit logging & statistics aggregation
│   ├── layout.tsx              # Root HTML Layout, Fonts, Providers, Toaster
│   ├── page.tsx                # Public Landing Page / Marketing Hero
│   └── globals.css             # Design Tokens & Black/White Utility Base
├── components/                 # Design System & UI Components
│   ├── ui/                     # Primitives (Button, Input, Card, Badge, Modal, Tabs, Table, Toast, etc.)
│   ├── shell/                  # Sidebar, Header, MobileNav, UserNav
│   ├── dashboard/              # StatsCards, ProgressCards, ActivityFeed, QuickTools
│   ├── profile/                # ProfileSection, SkillsInput, ExperienceForm, EducationForm
│   ├── resume/                 # ResumeEditor, TemplateSelector, ResumePreview, PDFExportButton
│   ├── ats/                    # JDInputForm, ScoreGauge, MissingKeywords, SuggestionsList
│   ├── interview/              # InterviewSetupForm, QuestionCard, Timer, AudioRecorder, ResultReport
│   └── jobs/                   # JobCard, JobFilters, ApplicationStatusBoard
├── lib/                        # Core Utilities & Services
│   ├── db.ts                   # Prisma client singleton instance
│   ├── auth.ts                 # JWT session helpers, password hashing (bcryptjs)
│   ├── ai/                     # AI Service Adapters (Interview generator, ATS keyword parser)
│   ├── resume-templates/       # B&W PDF & HTML template renderers
│   └── utils.ts                # Tailwind merge (cn), formatting, validation helpers
├── prisma/                     # Database Schema & Migrations
│   ├── schema.prisma           # Complete Relational Data Models
│   └── seed.ts                 # Seed script for initial jobs, guides & demo profile
├── public/                     # Static assets, favicon, default avatars
├── PRD.md                      # Product Requirements Document
├── ARCHITECTURE.md             # This Technical Architecture Document
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 2. Database Schema Architecture (Prisma ORM)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CANDIDATE
  INSTITUTE_ADMIN
  INSTITUTE_STUDENT
  SUPER_ADMIN
}

enum ApplicationState {
  SAVED
  APPLIED
  INTERVIEW
  REJECTED
  SELECTED
}

enum InterviewType {
  TECHNICAL
  BEHAVIORAL
  HR
  SYSTEM_DESIGN
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          Role      @default(CANDIDATE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Tenant / Institute reference
  instituteId   String?
  institute     Institute? @relation(fields: [instituteId], references: [id])

  // Profile
  profile       Profile?

  // User Artifacts
  resumes       Resume[]
  atsScans      AtsScan[]
  interviews    InterviewSession[]
  savedJobs     JobApplication[]
  activities    ActivityLog[]
}

model Institute {
  id          String   @id @default(uuid())
  name        String
  domain      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       User[]
}

model Profile {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  headline        String?
  phone           String?
  location        String?
  bio             String?
  avatarUrl       String?
  linkedinUrl     String?
  githubUrl       String?
  portfolioUrl    String?
  college         String?
  degree          String?
  fieldOfStudy    String?
  graduationYear  Int?
  completionScore Int      @default(0)

  experiences     Experience[]
  educations      Education[]
  skills          Skill[]
  projects        Project[]
  certifications  Certification[]
  achievements    Achievement[]
}

model Experience {
  id          String    @id @default(uuid())
  profileId   String
  profile     Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  company     String
  role        String
  location    String?
  startDate   DateTime
  endDate     DateTime?
  isCurrent   Boolean   @default(false)
  description String?
}

model Education {
  id           String    @id @default(uuid())
  profileId    String
  profile      Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  institution  String
  degree       String
  fieldOfStudy String?
  startDate    DateTime
  endDate      DateTime?
  grade        String?
}

model Skill {
  id        String  @id @default(uuid())
  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  name      String
  category  String? // Technical, Soft, Tool
  level     String? // Beginner, Intermediate, Expert
}

model Project {
  id          String  @id @default(uuid())
  profileId   String
  profile     Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  title       String
  description String
  techStack   String?
  liveUrl     String?
  repoUrl     String?
}

model Certification {
  id           String    @id @default(uuid())
  profileId    String
  profile      Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  name         String
  issuer       String
  issueDate    DateTime
  credentialId String?
  url          String?
}

model Achievement {
  id          String  @id @default(uuid())
  profileId   String
  profile     Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  title       String
  description String?
  date        DateTime?
}

model Resume {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  templateId  String   @default("classic-monochrome")
  contentJson String   // Serialized JSON of all sections
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  atsScans    AtsScan[]
}

model AtsScan {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  resumeId        String?
  resume          Resume?  @relation(fields: [resumeId], references: [id], onDelete: SetNull)
  targetJobTitle  String
  jobDescription  String?
  overallScore    Int
  keywordMatch    Int
  skillsMatch     Int
  experienceMatch Int
  educationMatch  Int
  formattingScore Int
  feedbackJson    String   // Strengths, weaknesses, missing keywords, suggestions
  createdAt       DateTime @default(now())
}

model InterviewSession {
  id           String        @id @default(uuid())
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobRole      String
  seniority    String        @default("Mid")
  type         InterviewType @default(TECHNICAL)
  difficulty   String        @default("Medium")
  totalScore   Int?
  feedbackJson String?       // Overall breakdown, tech knowledge, communication, etc.
  questionsJson String       // Array of questions, answers, and per-question score
  isCompleted  Boolean       @default(false)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model JobPosting {
  id           String           @id @default(uuid())
  title        String
  company      String
  location     String
  type         String           // Full-time, Part-time, Remote, Internship
  experience   String
  salary       String?
  description  String
  requirements String           // Comma-separated or JSON
  tags         String           // JSON string of tags
  createdAt    DateTime         @default(now())

  applications JobApplication[]
}

model JobApplication {
  id        String           @id @default(uuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobId     String
  job       JobPosting       @relation(fields: [jobId], references: [id], onDelete: Cascade)
  status    ApplicationState @default(SAVED)
  notes     String?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  @@unique([userId, jobId])
}

model ActivityLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String   // RESUME_CREATED, ATS_SCAN, MOCK_INTERVIEW, PROFILE_UPDATED, JOB_APPLIED
  title     String
  detail    String?
  createdAt DateTime @default(now())
}
```

---

## 3. Design System Specs (Monochrome B&W Standard)

Components follow a strict atomic hierarchy:
- `components/ui/button.tsx`: Variants (`primary`: bg-black text-white, `secondary`: bg-neutral-100 text-neutral-900 border, `outline`: border-neutral-300 text-neutral-900, `ghost`: hover:bg-neutral-100).
- `components/ui/card.tsx`: Surface container (`bg-white border border-neutral-200 rounded-xl p-6`).
- `components/ui/badge.tsx`: Minimal badge (`bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs font-medium px-2.5 py-0.5 rounded-full`).
- `components/ui/modal.tsx`: Accessible dialog with dark backdrop overlay and monochrome container.
- `components/ui/toast.tsx`: Minimal status notification toast.

---

## 4. Auth & Session Management

- Secure HttpOnly JWT cookie named `skillassociate_session`.
- Passwords hashed with `bcryptjs`.
- Auth middleware protecting `(dashboard)` routes and redirecting unauthenticated users to `/login`.
