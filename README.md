# EJC — Employee Journey Cloud

> **An AI-powered, multi-tenant Employee Experience and HR platform built around the continuous, connected Employee Journey.**

---

## 🚀 Overview

Unlike conventional CRUD-based HR management systems that treat employee data as disconnected forms, **Employee Journey Cloud (EJC)** models the employee experience as an evolving, intelligent digital journey. 

Every lifecycle interaction — from pre-boarding, onboarding tasks, SMART goal execution, and skill mastery to peer recognitions, performance cycles, and promotions — automatically feeds into the **Employee Journey Graph**, providing unified intelligence and explainable recommendations for employees, managers, and HR leaders.

---

## 🎨 UI/UX Design Philosophy

Designed strictly around the **"Less but better"** philosophy:
- **Dark Mode First**: Layered dark surfaces (`#090B0E` canvas, `#0D1117` surfaces, `#161B22` cards, `#21262D` elevated, subtle `#30363D` borders).
- **Modern Minimalist Visual Language**: Inspired by Linear, Vercel, and Raycast — avoids traditional HR clutter and rainbow dashboards.
- **Visual Centerpiece**: An interactive **Journey Graph & Timeline** with clickable event nodes, milestone drawers, and lifecycle phase progression.
- **Native AI Copilot**: Slide-over intelligent assistant with RAG source document citations, context pills, and suggested inquiries.

---

## 🏗 System Architecture

```
EJC Monorepo
├── apps/
│   ├── api/                 # Express + TypeScript REST API Gateway
│   │   ├── src/
│   │   │   ├── modules/     # Journey, Employees, Goals, Skills, Learning, Career, AI/RAG, Analytics
│   │   │   ├── middleware/  # Tenant isolation, RBAC, JWT auth, Zod validation, Audit logging
│   │   │   └── database/    # Prisma client singleton
│   └── web/                 # React 18 + Vite + Tailwind CSS Dark-Mode UI
│       ├── src/
│       │   ├── components/  # JourneyTimeline, AppShell, AIAssistantDrawer, common UI primitives
│       │   ├── pages/       # Dashboard, Journey, Profile, Goals, Skills, Learning, Career, People, Analytics
│       │   └── context/     # AuthContext with 1-click persona switcher (Employee, Manager, HR Admin)
├── packages/
│   ├── types/               # Shared TypeScript domain interfaces & DTOs
│   └── validation/          # Shared Zod validation schemas
├── prisma/
│   ├── schema.prisma        # Normalized schema with pgvector vector(1536) support
│   └── seed.ts              # Multi-tenant demo dataset (Acme & Nova tenants)
├── infrastructure/
│   ├── docker/              # Multi-stage production Dockerfiles & Nginx reverse proxy
│   └── kubernetes/          # K8s Deployments, Services, ConfigMaps, Secrets, Ingress
└── .github/workflows/       # CI/CD pipeline (Lint, Build, Test, Docker)
```

---

## 🔑 Key Personas & Test Credentials

The platform comes pre-configured with a demo dataset featuring **Acme Innovations** and **Nova Dynamics** (to prove cross-tenant data isolation):

| Persona | Role | Email | Password | What to Test |
|---|---|---|---|---|
| **Alex Rivers** | Employee (`L3`) | `alex.rivers@acme.internal` | `Password123!` | Employee 360, Interactive Journey, Goal Execution, Skill Gaps, AI Copilot |
| **David Vance** | Manager (`L5`) | `manager@acme.internal` | `Password123!` | Team Analytics, Competency Verification, Promotion Approvals |
| **Sarah Chen** | HR Admin (`L6`) | `admin@acme.internal` | `Password123!` | Workforce Analytics, Onboarding Workflows, Policy Ingestion (RAG), Audit Logs |
| **Nova Admin** | Tenant 2 Admin | `admin@nova.internal` | `Password123!` | Multi-tenant isolation verification (strict boundary check) |

*(Note: In the web interface, use the **Persona View** switcher at the bottom of the sidebar to jump between roles instantly!)*

---

## 🛠 Quickstart & Local Setup

### Prerequisites
- Node.js 22+ (tested on Node v24.11.0)
- pnpm 10+ (`npm install -g pnpm`)
- Docker & Docker Compose (optional for local PostgreSQL + pgvector)

### 1. Clone & Install Dependencies
```bash
git clone <repo-url> EJC_main
cd EJC_main
pnpm install
```

### 2. Build Packages & Applications
```bash
pnpm build
```

### 3. Run Automated Tests
```bash
pnpm test
```

### 4. Run Development Servers
To run both backend API and frontend concurrently:
```bash
pnpm dev
```
- **Web Application**: `http://localhost:5173`
- **Backend API Gateway**: `http://localhost:4000/api`
- **Health Check**: `http://localhost:4000/api/health`

---

## 🐳 Docker Compose Setup

Run the complete multi-container stack locally (PostgreSQL 16 with pgvector, Redis, API, and Web):
```bash
docker-compose up --build
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:4000/api`
- PostgreSQL: `localhost:5432`

---

## ☸ Kubernetes Deployment

Deploy to any Kubernetes cluster (Minikube, EKS, GKE):
```bash
kubectl apply -f infrastructure/kubernetes/ejc-k8s.yaml
```

---

## 🤖 AI Assistant & pgvector RAG Pipeline

1. **Document Ingestion**: HR Admins upload documents (Handbooks, Leave Policies, Codes of Conduct).
2. **Text Chunking**: Documents are split into semantic segments and stored with tenant metadata.
3. **Vector Embeddings**: Vector representations (`vector(1536)`) are indexed in PostgreSQL using pgvector.
4. **Tenant-Safe Retrieval**: AI queries perform cosine vector similarity search strictly scoped by `organizationId` and user role (`ALL_EMPLOYEES`, `MANAGERS_ONLY`, `HR_ONLY`).
5. **Tool-Calling Agent**: The AI Copilot safely invokes authorized tools (`getMyProfile`, `getMyJourney`, `getMyGoals`, `getMySkills`) to synthesize personalized answers with document citations.

---

## 🛡 Security & Multi-Tenancy Guarantees

- **Tenant Isolation**: Backend middleware enforces that authenticated requests cannot query or mutate data from other organizations (`403 TENANT_ACCESS_DENIED`).
- **Role-Based Access Control (RBAC)**: Route-level authorization protects administrative endpoints.
- **Audit Logging**: Sensitive changes (promotions, policy uploads, verifications) are recorded in an append-only audit trail.
- **Input Validation**: All API bodies, query parameters, and route parameters are validated via Zod schemas before hitting business logic.

---

## 📄 License
Enterprise SaaS Proprietary — All Rights Reserved.
