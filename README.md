# SkillAssociate — AI Recruitment & Resume Intelligence Platform

SkillAssociate is an industry-grade, full-stack recruitment and candidate preparation platform built with **Next.js 15 App Router**, **TypeScript**, **TailwindCSS**, **Prisma**, **SQLite**, and **Google Gemini AI**.

It seamlessly bridges the gap between job candidates, corporate employers, and academic placement institutes by offering real-time ATS resume analysis, job-matching intelligence, adaptive AI mock interviews, and automated recruitment pipelines.

---

## 🌟 Key Features

### 📄 1. ATS Resume Intelligence & Scoring Engine v2.1
- **Multi-Score Analytics**: Calculates **ATS Compatibility Score**, **Job Match Score**, and **Overall Application Score** (0–100%).
- **Deterministic Skill Taxonomy**: Normalizes 500+ technology aliases (e.g., `Node.js` ↔ `NodeJS` ↔ `Node`) with exact, alias, and semantic category matching.
- **Truth Guard System**: Audits candidate resume claims against mandatory job requirements to flag unverified or weak evidence.
- **Bullet Quality Auditor**: Evaluates action verbs, quantifiable metrics, and impact statements across resume bullet points.
- **Score Improvement Simulator**: Interactive calculator showing candidate potential score gain by adding missing skills.

### 🎙️ 2. Adaptive AI Mock Interview System
- **Personalized Context Builder**: Fuses candidate resume data and target Job Description into a Candidate Intelligence Profile.
- **Dynamic State Machine Engine**: Tracks global and domain-specific candidate proficiency in real time across 5 difficulty levels (`Novice` to `Principal`).
- **Adaptive Follow-Up Generator**: Analyzes response depth, technical accuracy, and completeness to trigger deep-dive follow-up questions.
- **Text & Voice Interaction**: Full support for real-time speech-to-text input (Web Speech API) and text-to-speech question playback.
- **Comprehensive Interview Reports**: Generates final score breakdowns, role readiness ratings, question-by-question reviews, and a 7-day personalized preparation plan.

### 🏢 3. Corporate Employer Portal
- **Job Management Engine**: Create, edit, close, reopen, and **republish** job openings (resets timestamp for marketplace visibility bump).
- **Candidate Pipeline Tracking**: Review candidate applications, inspect ATS scores, update application states (`APPLIED` → `SHORTLISTED` → `OFFERED`), and download candidate resumes.
- **Optional Company Branding**: Add optional company website links to public listings.

### 🎓 4. Academic Institute Portal
- **Placement Dashboard**: Track student enrollment, resume uploads, ATS average scores, and interview performance metrics across departments.
- **Bulk CSV Student Import**: Upload student rosters with automated validation and account creation.
- **Student Performance Reports**: Deep-dive analytics per student for institutional placement drives.

### 📧 5. Real-Time Nodemailer Support System
- **Gmail SMTP Integration**: Real-time email dispatch using App Password authentication.
- **Fail-Safe JSON Transport**: Graceful fallback mechanism preventing lost inquiries if SMTP services are unavailable.
- **Floating Contact Modal**: Industrial call button with green live status pulse.

---

## 📐 System Architecture

```text
                  ┌─────────────────────────────────────────┐
                  │          SkillAssociate Platform        │
                  └────────────────────┬────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
  ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
  │ Candidate Portal │       │  Employer Portal │       │ Institute Portal │
  └─────────┬────────┘       └─────────┬────────┘       └─────────┬────────┘
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       │
                                       ▼
                   ┌──────────────────────────────────────┐
                   │    Core Intelligence Engines         │
                   ├──────────────────────────────────────┤
                   │  • ATS Scoring Engine v2.1           │
                   │  • Adaptive AI Mock Interview Engine │
                   │  • Gemini AI Resume Refiner          │
                   │  • PDF Export & LaTeX Compiler       │
                   └───────────────────┬──────────────────┘
                                       │
                                       ▼
                   ┌──────────────────────────────────────┐
                   │      Data & Storage Foundation       │
                   ├──────────────────────────────────────┤
                   │  • SQLite Database (Prisma ORM)     │
                   │  • JWT Auth & Role Authorization     │
                   │  • Nodemailer Gmail SMTP Dispatch    │
                   └──────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15.1 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript 5.x](https://www.typescriptlang.org/) |
| **Styling** | [TailwindCSS 3.4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database** | [SQLite](https://www.sqlite.org/) with [Prisma ORM 6.4](https://www.prisma.io/) |
| **Authentication** | Custom JWT Session Cookies ([jose](https://github.com/panva/jose), `bcryptjs`) |
| **AI Integration** | [Google Gemini API (`@google/genai`)](https://ai.google.dev/) |
| **Email Dispatch** | [Nodemailer](https://nodemailer.com/) (Gmail SMTP) |
| **PDF Processing** | [PDFKit](https://pdfkit.org/), `html2pdf.js` |
| **Testing** | Node.js Native Test Runner (`tsx --test`) |

---

## 📁 Repository Structure

```text
SkillAssociate/
├── app/                        # Next.js 15 App Router Pages & API Endpoints
│   ├── (dashboard)/            # Authenticated Dashboard Layout & Views
│   │   ├── ats-checker/        # ATS Resume Analysis & Score Simulator
│   │   ├── company/            # Employer Management Views (Jobs, Applications)
│   │   ├── institute/          # Placement Officer Portal (Students, Analytics)
│   │   ├── jobs/               # Candidate Marketplace & Job Details
│   │   ├── mock-interview/     # Adaptive AI Mock Interview Wizard & Room
│   │   └── resume/             # Interactive Resume Builder
│   └── api/                    # RESTful API Endpoints
│       ├── ats/                # ATS Scan API
│       ├── company/            # Employer Management Endpoints
│       ├── institute/          # Institute Analytics & Student Endpoints
│       ├── interview/          # Mock Interview Session State Machine API
│       ├── jobs/               # Candidate Job Marketplace API
│       └── support/            # Support Email Dispatch API
├── components/                 # Modular UI Components
│   ├── company/                # Create/Edit Job Modals & Applicant Cards
│   ├── interview/              # Setup Wizard, Interview Room, Report View
│   ├── support/                # Floating Call Icon & Nodemailer Contact Form
│   └── ui/                     # Reusable Modern UI Primitives
├── lib/                        # Core Application Logic & Intelligence Engines
│   ├── ai/                     # Gemini AI Provider Integration
│   ├── ats/                    # Taxonomy, Parsers, Scoring Engine v2.1, Prompt Guard
│   ├── auth/                   # Password Hashing, JWT Sign/Verify, Role Guards
│   ├── company/                # Employer Job & Application Service Layer
│   ├── email/                  # Nodemailer Transport & Email Dispatcher
│   ├── institute/              # Institute Analytics & CSV Parser Service
│   ├── interview/              # Interview Engine, Context Builder, AI Evaluator
│   └── resume/                 # Resume Data Types & PDF Export Engine
├── prisma/                     # Database Schema & Migrations
│   └── schema.prisma           # Prisma Data Model
├── public/                     # Static Public Assets
├── tests/                      # Automated Unit & Integration Tests (15 Files)
├── .env.example                # Template Environment File
├── package.json                # Project Dependencies & NPM Scripts
└── tsconfig.json               # TypeScript Configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ANUPAM4545/Skill--Associate.git
   cd Skill--Associate
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your desired environment variables in `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-jwt-secret-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   GEMINI_API_KEY="your-gemini-api-key"
   SUPPORT_RECIPIENT_EMAIL="anupamsingh8095@gmail.com"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=465
   SMTP_USER="your_email@gmail.com"
   SMTP_PASS="your_gmail_app_password"
   ```

4. **Initialize Database**:
   Push the Prisma schema to create local SQLite database:
   ```bash
   npx prisma db push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` (or `http://localhost:3005`) in your browser.

---

## 🧪 Testing & Quality Assurance

SkillAssociate contains a 15-file automated test suite covering authentication, ATS scoring, interview state transitions, PDF compilers, and job application workflows.

Run all tests:
```bash
npm test
```

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

Run ESLint audit:
```bash
npm run lint
```

---

## 📦 Production Build

To verify and generate an optimized production bundle:

```bash
npm run build
```

To start the production server:
```bash
npm start
```

---

## 🔒 Security & Privacy

- **No Hardcoded Secrets**: All API keys, SMTP passwords, and JWT credentials are read exclusively from environment variables.
- **Input Sanitization**: User-submitted job descriptions and resume text are sanitized against prompt injection and malicious payload injections.
- **Encrypted Password Hashing**: Passwords hashed using `bcryptjs` with salt rounds.
- **HttpOnly Cookies**: Session tokens stored in secure, `SameSite=Lax` cookies.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
