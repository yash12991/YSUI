# 🎯 Website Generation System - Quick Start

## Architecture Overview

```
User Request
    ↓
API: /api/generate-website (POST)
    ↓
Generator Orchestrator (WebsiteGenerator)
    ├─ Step 1: Get Architecture Plan (AI)
    ├─ Step 2: Generate Frontend Code (AI)
    ├─ Step 3: Generate Backend Code (AI)
    ├─ Step 4: Generate Database Schema (AI)
    ├─ Step 5: Generate Deployment Config (AI)
    └─ Step 6: Save to Database
    ↓
Return: Complete Generated Website
```

---

## How It Works

### 1. **Project Configuration**
User provides:
- Project name & description
- Project type (website, saas, ecommerce, etc.)
- Tech stack selection
- Feature requirements
- Page structure

### 2. **Generation Pipeline**
- **Planner Agent**: Creates architecture blueprint
- **Frontend Generator**: Creates React/Next.js components
- **Backend Generator**: Creates API endpoints
- **Database Generator**: Creates Prisma schema
- **Deployment Generator**: Creates Docker, CI/CD configs

### 3. **Database Storage**
- Save as `WebsiteVersion` in database
- Track all generated components
- Maintain version history
- Enable rollback capability

---

## API Usage

### Generate a Website

```bash
curl -X POST http://localhost:3001/api/generate-website \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "projectName": "My E-commerce Store",
    "projectType": "ecommerce",
    "description": "Online store with product catalog and checkout",
    "techStack": {
      "frontend": "next",
      "backend": "node",
      "database": "postgresql",
      "hosting": "vercel"
    },
    "features": [
      "authentication",
      "database",
      "api",
      "payment",
      "file-upload"
    ],
    "pages": ["/", "/products", "/cart", "/checkout", "/admin"]
  }'
```

### Response

```json
{
  "message": "Website generation started",
  "project": {
    "id": "proj_abc123",
    "name": "My E-commerce Store",
    "url": "/projects/proj_abc123"
  },
  "generation": {
    "projectId": "proj_abc123",
    "versionNumber": 1,
    "status": "success",
    "frontend": {
      "code": "...generated code...",
      "framework": "next",
      "components": 25
    },
    "backend": {
      "code": "...generated code...",
      "runtime": "node",
      "endpoints": 15
    },
    "database": {
      "schema": "...schema...",
      "tables": 8
    },
    "deployment": {
      "docker": "...Dockerfile...",
      "cicd": "...GitHub Actions...",
      "guide": "...deployment guide..."
    }
  }
}
```

---

## Project Types Supported

| Type | Best For | Default Features |
|------|----------|-----------------|
| **website** | Blogs, portfolios, marketing sites | Database, Blog, Search |
| **web-app** | Interactive applications | Auth, Database, API, Dashboard |
| **saas** | Software as a Service | Auth, Database, API, Dashboard, Analytics |
| **ecommerce** | Online stores | Database, Payment, File Upload, Analytics |
| **cms** | Content management | Auth, Database, API, Admin Panel |
| **dashboard** | Analytics & admin | Auth, Database, API, Admin Panel |
| **api** | Backend only | Database, API, Auth |
| **mobile-app** | Mobile apps | Auth, Database, API, Notifications |

---

## Tech Stack Options

### Frontend
- **next** (Recommended) - Full-stack React with SSR
- **react** - Client-side React SPA
- **vue** - Vue.js framework
- **svelte** - Lightweight framework

### Backend
- **node** - Node.js / Express
- **python** - Python / FastAPI
- **go** - Go / Gin
- **none** - Static/frontend-only

### Database
- **postgresql** (Recommended) - Relational, Supabase
- **mongodb** - NoSQL document
- **mysql** - Relational
- **none** - No backend database

### Hosting
- **vercel** - Recommended for Next.js
- **railway** - All-in-one platform
- **render** - Simple hosting
- **heroku** - Managed hosting

---

## Available Features

```typescript
type ProjectFeature =
  | 'authentication'    // User login, signup, password reset
  | 'database'          // Data persistence
  | 'api'               // REST/GraphQL endpoints
  | 'dashboard'         // Analytics views
  | 'admin-panel'       // Admin interface
  | 'blog'              // Blog functionality
  | 'ecommerce'         // Shopping features
  | 'payment'           // Payment processing
  | 'email'             // Email notifications
  | 'file-upload'       // File storage
  | 'search'            // Full-text search
  | 'notifications'     // Real-time notifications
  | 'analytics'         // User analytics
```

---

## Example Workflows

### 1. Simple Marketing Website

```json
{
  "projectName": "Tech Company Website",
  "projectType": "website",
  "techStack": {
    "frontend": "next",
    "backend": "none",
    "database": "none",
    "hosting": "vercel"
  },
  "features": [],
  "pages": ["/", "/about", "/services", "/contact", "/blog"]
}
```

### 2. SaaS Application

```json
{
  "projectName": "Project Management SaaS",
  "projectType": "saas",
  "techStack": {
    "frontend": "next",
    "backend": "node",
    "database": "postgresql",
    "hosting": "railway"
  },
  "features": [
    "authentication",
    "database",
    "api",
    "dashboard",
    "notifications",
    "analytics"
  ]
}
```

### 3. E-commerce Store

```json
{
  "projectName": "Online Fashion Store",
  "projectType": "ecommerce",
  "techStack": {
    "frontend": "next",
    "backend": "node",
    "database": "postgresql",
    "hosting": "vercel"
  },
  "features": [
    "authentication",
    "database",
    "api",
    "payment",
    "file-upload",
    "search",
    "notifications"
  ],
  "pages": [
    "/",
    "/products",
    "/products/[id]",
    "/cart",
    "/checkout",
    "/admin",
    "/orders"
  ]
}
```

---

## Database Schema Generated

For each project, the system auto-generates:

```
Users
├─ Projects
│  ├─ WebsiteVersions
│  │  ├─ GeneratedComponents
│  │  ├─ ApiEndpoints
│  │  └─ DeploymentConfigs
│  ├─ TeamMembers
│  └─ AuditLogs
```

---

## Next Steps

1. **Provide Supabase Connection String**
   - Get it from Supabase project settings
   - Add to `.env`: `DATABASE_URL=postgresql://...`
   - Run: `npx prisma db push`

2. **Test Generation API**
   ```bash
   npm run dev
   # Visit: http://localhost:3001/api/generate-website
   ```

3. **Create Generation UI**
   - Build React form component
   - Connect to `/api/generate-website`
   - Display generated project

4. **Export Projects as ZIP**
   - Implement `/api/projects/[id]/export`
   - Include all generated files
   - Ready for download

5. **Deploy to Production**
   - Switch DATABASE_URL to Supabase
   - Deploy to Vercel
   - Enable CI/CD pipeline

---

## File Structure

```
src/
├─ lib/
│  ├─ generation/
│  │  ├─ types.ts           (Types & constants)
│  │  ├─ generator.ts       (Main orchestrator)
│  │  └─ index.ts           (Exports)
│  ├─ db/
│  │  ├─ prisma.ts          (Client singleton)
│  │  └─ queries.ts         (Database queries)
│  └─ agents/
│     └─ aiProvider.ts      (AI integration)
├─ app/
│  └─ api/
│     ├─ auth/
│     │  └─ signup/route.ts
│     ├─ projects/
│     │  └─ route.ts
│     └─ generate-website/
│        └─ route.ts        (NEW!)
└─ components/
   └─ GenerationForm.tsx    (TODO)
```

---

## Environment Variables Required

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/db"

# AI Provider (already configured)
AI_PROVIDER="groq"
GROQ_API_KEY="your-key"

# Supabase (optional, for production)
NEXT_PUBLIC_SUPABASE_URL="https://..."
SUPABASE_PUBLISHABLE_KEY="..."
```

---

## Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Add your Supabase connection string to .env
# DATABASE_URL="postgresql://..."

# 3. Sync database
npx prisma db push

# 4. Start development server
npm run dev

# 5. Test generation
curl -X POST http://localhost:3001/api/generate-website \
  -H "x-user-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Test","projectType":"website",...}'
```

---

## Support & Debugging

- Check logs: `npm run dev` (watch console)
- Database issues: `npx prisma studio`
- API testing: Use the GET endpoint to see schema
- AI issues: Check `GROQ_API_KEY` in `.env`

---

**Status**: ✅ Architecture complete, ready for testing!
