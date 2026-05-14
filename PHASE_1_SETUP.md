# 🛠️ PHASE 1: IMPLEMENTATION GUIDE

## Quick Setup for Phase 1 Development

### Prerequisites
- Node.js 18+
- Git
- Supabase account (free tier)
- GitHub account (for CI/CD)

---

## STEP 1: Supabase Setup (Database & Auth)

### 1a. Create Supabase Project
```bash
# Visit: https://app.supabase.com
# Click "New Project"
# Fill in:
#   - Project name: "simpui-phase1"
#   - Database password: (auto-generate)
#   - Region: Closest to your users
# Wait 2-3 minutes for provisioning
```

### 1b. Get Connection Details
```bash
# After project is created:
# 1. Click "Connect" button
# 2. Copy the DATABASE_URL (PostgreSQL connection string)
# 3. Copy the ANON_KEY and SERVICE_KEY from API settings
```

---

## STEP 2: Environment Setup

```bash
cd /home/jax/ysui/Simplyui

# Update .env.local with database credentials
cat > .env.local << 'EOF'
# AI Providers
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here (optional)
AI_PROVIDER=groq

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Database (for Prisma)
DATABASE_URL=postgresql://...your_connection_string...

# Application
NEXTAUTH_SECRET=your_random_secret_here
NODE_ENV=development
EOF
```

---

## STEP 3: Install New Dependencies

```bash
# Add database & auth packages
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs prisma @prisma/client next-auth zod

# Add dev dependencies
npm install -D prisma @types/node

# Initialize Prisma
npx prisma init
```

---

## STEP 4: Prisma Schema (Phase 1 Database)

Update `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Users
model User {
  id            String     @id @default(cuid())
  email         String     @unique
  name          String?
  avatarUrl     String?
  subscriptionPlan String  @default("free")
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relations
  projects      Project[]
  teamMembers   TeamMember[]
  auditLogs     AuditLog[]

  @@map("users")
}

// Projects
model Project {
  id            String     @id @default(cuid())
  userId        String
  name          String
  description   String?
  techStack     Json       @default("{}")
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relations
  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  versions      WebsiteVersion[]
  components    GeneratedComponent[]
  endpoints     ApiEndpoint[]
  teamMembers   TeamMember[]
  auditLogs     AuditLog[]

  @@unique([userId, name])
  @@map("projects")
}

// Website Versions
model WebsiteVersion {
  id                String     @id @default(cuid())
  projectId         String
  versionNumber     Int
  status            String     @default("draft")
  frontendCode      String?    @db.Text
  backendSpec       Json       @default("{}")
  databaseSchema    Json       @default("{}")
  deploymentConfig  Json       @default("{}")
  createdAt         DateTime   @default(now())

  // Relations
  project           Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, versionNumber])
  @@map("website_versions")
}

// Generated Components
model GeneratedComponent {
  id                String     @id @default(cuid())
  projectId         String
  componentName     String
  componentType     String
  componentCode     String     @db.Text
  propsSchema       Json       @default("{}")
  createdAt         DateTime   @default(now())

  // Relations
  project           Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, componentName])
  @@map("generated_components")
}

// API Endpoints
model ApiEndpoint {
  id                String     @id @default(cuid())
  projectId         String
  path              String
  method            String
  description       String?
  requestSchema     Json       @default("{}")
  responseSchema    Json       @default("{}")
  createdAt         DateTime   @default(now())

  // Relations
  project           Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, path, method])
  @@map("api_endpoints")
}

// Team Members
model TeamMember {
  id                String     @id @default(cuid())
  projectId         String
  userId            String
  role              String     @default("member")
  createdAt         DateTime   @default(now())

  // Relations
  project           Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user              User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@map("team_members")
}

// Audit Log
model AuditLog {
  id                String     @id @default(cuid())
  projectId         String
  userId            String
  action            String
  details           Json       @default("{}")
  createdAt         DateTime   @default(now())

  // Relations
  project           Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user              User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("audit_logs")
}
```

---

## STEP 5: Run Migrations

```bash
# Create database tables
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

---

## STEP 6: Create API Routes (New)

### Create `src/app/api/auth/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password, action } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });

  try {
    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Auth error' },
      { status: 500 }
    );
  }
}
```

### Create `src/app/api/projects/route.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const projects = await prisma.project.findMany({
      where: { userId },
      include: { versions: { take: 1, orderBy: { createdAt: 'desc' } } },
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description, techStack } = await req.json();

    const project = await prisma.project.create({
      data: { userId, name, description, techStack },
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
```

---

## STEP 7: Install & Start Development

```bash
# Install all dependencies
npm install

# Run development server
npm run dev
```

Visit: **http://localhost:3000**

---

## FOLDER STRUCTURE (After Phase 1)

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts (NEW)
│   │   ├── projects/
│   │   │   ├── route.ts (NEW)
│   │   │   ├── [id]/
│   │   │   │   └── route.ts (NEW)
│   │   │   └── [id]/versions/
│   │   │       └── route.ts (NEW)
│   │   ├── generate-website/ (NEW)
│   │   │   └── route.ts
│   │   └── export/ (NEW)
│   │       └── route.ts
│   ├── dashboard/ (NEW)
│   │   └── page.tsx
│   ├── projects/ (NEW)
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── auth/ (NEW)
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/
│   ├── page.tsx (existing)
│   └── ...
├── components/
│   ├── ui/ (existing)
│   ├── dashboard/ (NEW)
│   ├── projects/ (NEW)
│   └── ...
├── lib/
│   ├── agents/ (existing)
│   ├── db/ (NEW)
│   │   ├── prisma.ts
│   │   └── queries.ts
│   ├── auth/ (NEW)
│   │   └── client.ts
│   └── ...
└── prisma/
    ├── schema.prisma (NEW)
    └── migrations/ (NEW)
```

---

## PAYMENT OPTIONS FOR DATABASES

### Option 1: Supabase (Recommended)
```
Free Tier:
├─ 500MB Database
├─ 2 project limits
├─ 1GB bandwidth
└─ Free Auth users (unlimited)

Pricing: $25-200/month for production
Link: https://supabase.com/pricing
```

### Option 2: Railway
```
Free Tier:
├─ $5/month free credits
├─ PostgreSQL included
└─ Good for small projects

Pricing: Pay-as-you-go, ~$10-50/month
Link: https://railway.app/pricing
```

### Option 3: PlanetScale (MySQL)
```
Free Tier:
├─ 5GB storage
├─ Unlimited queries
└─ 3 databases

Pricing: $39/month for production
Link: https://planetscale.com/pricing
```

### RECOMMENDATION:
**Start with Supabase Free → Railway/PlanetScale for Production**

---

## TESTING PHASE 1

```bash
# 1. Test database connection
npx prisma db execute --stdin
# Run: SELECT 1

# 2. Test API endpoints
curl -X GET http://localhost:3000/api/projects \
  -H "x-user-id: test-user-id"

# 3. Test full generation flow
# Use the UI and verify projects save to database
```

---

## DEPLOYMENT CHECKLIST

```
Before going live:
☐ Database backups configured
☐ Environment variables secured
☐ API rate limiting enabled
☐ CORS properly configured
☐ SSL certificates valid
☐ Monitoring/logging set up
☐ Performance tested (< 2s response time)
☐ Security audit completed
☐ Error handling implemented
☐ Documentation complete
```

---

## NEXT PHASES

### Phase 2: Backend Generation
- [ ] Generate Express.js API routes
- [ ] Generate database models
- [ ] Generate middleware & validation

### Phase 3: DevOps
- [ ] Generate Docker configs
- [ ] Generate GitHub Actions workflows
- [ ] Generate deployment scripts

### Phase 4: Collaboration
- [ ] Team project sharing
- [ ] Real-time collaboration
- [ ] Comments & reviews

---

## SUPPORT & RESOURCES

- Prisma Docs: https://www.prisma.io/docs/
- Supabase Docs: https://supabase.com/docs
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

**Status:** Ready for implementation  
**Estimated Time:** 2-3 weeks for Phase 1 MVP  
**Last Updated:** May 2, 2026
