import { GenerationRequest, GenerationResult, GeneratedProjectFile } from './types'
import { callAI } from '../agents/aiProvider'
import {
  createVersion,
  createComponent,
  createApiEndpoint,
} from '../db/queries'

type PlanEndpoint = {
  method: string
  path: string
  description?: string
}

type PlanTable = {
  name: string
  fields: string[]
}

type GenerationPlan = {
  endpoints?: PlanEndpoint[]
  tables?: PlanTable[]
}

type DeploymentConfig = {
  docker: string
  cicd: string
  guide?: string
}

type SaveGenerationInput = {
  frontendCode: string
  backendCode: string
  databaseSchema: Record<string, unknown>
  deploymentConfig: DeploymentConfig
  backendEndpoints: PlanEndpoint[]
  files: GeneratedProjectFile[]
}

export class WebsiteGenerator {
  private projectId: string
  private request: GenerationRequest
  private currentVersion: number = 1

  constructor(projectId: string, request: GenerationRequest) {
    this.projectId = projectId
    this.request = request
  }

  /**
   * Main generation workflow
   */
  async generate(): Promise<GenerationResult> {
    try {
      console.log('🚀 Starting website generation...')

      // Step 1: Get architecture plan from Planner Agent
      console.log('📋 Step 1: Creating architecture plan...')
      const plan = await this.getPlan()

      // Step 2: Generate Frontend Code
      console.log('🎨 Step 2: Generating frontend code...')
      const frontendCode = await this.generateFrontend()

      // Step 3: Generate Backend Code (if needed)
      let backendCode = ''
      let backendEndpoints: PlanEndpoint[] = []
      if (this.request.techStack.backend !== 'none') {
        console.log('🔌 Step 3: Generating backend code...')
        const backend = await this.generateBackend(plan)
        backendCode = backend.code
        backendEndpoints = backend.endpoints
      }

      // Step 4: Generate Database Schema (if needed)
      let databaseSchema: Record<string, unknown> = {}
      if (this.request.techStack.database !== 'none') {
        console.log('🗄️  Step 4: Generating database schema...')
        databaseSchema = await this.generateDatabase(plan)
      }

      // Step 5: Generate Deployment Config
      console.log('🚀 Step 5: Generating deployment config...')
      const deploymentConfig = await this.generateDeployment()

      // Step 6: Build a downloadable project folder
      console.log('📦 Step 6: Creating project files...')
      const files = this.createProjectFiles({
        frontendCode,
        backendCode,
        databaseSchema,
        deploymentConfig,
      })

      // Step 7: Save to database
      console.log('💾 Step 7: Saving to database...')
      await this.saveGeneration({
        frontendCode,
        backendCode,
        databaseSchema,
        deploymentConfig,
        backendEndpoints,
        files,
      })

      console.log('✅ Website generation complete!')

      return {
        projectId: this.projectId,
        versionNumber: this.currentVersion,
        status: 'success',
        frontend: {
          code: frontendCode,
          framework: this.request.techStack.frontend,
          components: 25, // Estimated
        },
        backend: backendCode
          ? {
              code: backendCode,
              runtime: this.request.techStack.backend,
              endpoints: backendEndpoints.length,
            }
          : undefined,
        database: Object.keys(databaseSchema).length > 0 ? {
          schema: JSON.stringify(databaseSchema),
          tables: Object.keys(databaseSchema).length,
        } : undefined,
        deployment: deploymentConfig,
        files,
        downloadUrl: `/api/projects/${this.projectId}/download`,
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('❌ Generation failed:', error)
      throw error
    }
  }

  /**
   * Get architecture plan from AI
   */
  private async getPlan(): Promise<GenerationPlan> {
    const prompt = `
Create a detailed architecture plan for this project:
- Name: ${this.request.projectName}
- Type: ${this.request.projectType}
- Description: ${this.request.description}
- Frontend: ${this.request.techStack.frontend}
- Backend: ${this.request.techStack.backend}
- Database: ${this.request.techStack.database}
- Features: ${this.request.features.join(', ')}
- Pages: ${this.request.pages?.join(', ') || 'To be determined'}

Provide:
1. Folder structure
2. Database tables
3. API endpoints
4. Components needed
5. Authentication flow
6. Deployment strategy

Return as JSON.
`

    try {
      const response = await callAI(prompt)
      return JSON.parse(response)
    } catch {
      console.warn('Plan generation failed, using defaults')
      return this.getDefaultPlan()
    }
  }

  /**
   * Generate frontend code
   */
  private async generateFrontend() {
    const prompt = `
Generate production-ready ${this.request.techStack.frontend} code for this project:
- Type: ${this.request.projectType}
- Pages: ${this.request.pages?.join(', ')}
- Features: ${this.request.features.join(', ')}

Create:
1. pages/ directory with all pages
2. components/ directory with reusable components
3. types/ with TypeScript definitions
4. utils/ with helper functions
5. styles/ with CSS modules

Use:
- TypeScript for type safety
- Tailwind CSS for styling
- Next.js best practices
- Component composition
- State management (React hooks or Context)

Return complete, working code.
`

    try {
      const code = await callAI(prompt)
      return code
    } catch {
      console.warn('Frontend generation failed, using template')
      return this.getDefaultFrontendTemplate()
    }
  }

  /**
   * Generate backend code
   */
  private async generateBackend(plan: GenerationPlan): Promise<{ code: string; endpoints: PlanEndpoint[] }> {
    const prompt = `
Generate production-ready ${this.request.techStack.backend} API code:

Required endpoints:
${plan.endpoints ? plan.endpoints.map((e) => `- ${e.method} ${e.path}`).join('\n') : ''}

Features to implement:
- ${this.request.features.join('\n- ')}

Create:
1. API routes for all endpoints
2. Request validation schemas
3. Error handling middleware
4. Authentication middleware
5. CORS configuration

Return code and list of endpoints with methods.
`

    try {
      const response = await callAI(prompt)
      return {
        code: response,
        endpoints: this.extractEndpoints(response),
      }
    } catch {
      console.warn('Backend generation failed, using template')
      return {
        code: this.getDefaultBackendTemplate(),
        endpoints: [],
      }
    }
  }

  /**
   * Generate database schema
   */
  private async generateDatabase(plan: GenerationPlan): Promise<Record<string, unknown>> {
    const prompt = `
Generate Prisma schema for ${this.request.techStack.database} database:

Features to support:
- ${this.request.features.join('\n- ')}

Tables needed:
${plan.tables ? plan.tables.map((t) => `- ${t.name}: ${t.fields.join(', ')}`).join('\n') : ''}

Create:
1. Complete Prisma schema.prisma file
2. All model definitions
3. Relationships
4. Indexes for performance
5. Validation constraints

Return valid Prisma schema as JSON format.
`

    try {
      const response = await callAI(prompt)
      return JSON.parse(response)
    } catch {
      console.warn('Database schema generation failed')
      return {}
    }
  }

  /**
   * Generate deployment configuration
   */
  private async generateDeployment(): Promise<DeploymentConfig> {
    const prompt = `
Generate deployment configuration:
- Hosting: ${this.request.techStack.hosting}
- Frontend: ${this.request.techStack.frontend}
- Backend: ${this.request.techStack.backend}
- Database: ${this.request.techStack.database}

Create:
1. Dockerfile for backend
2. docker-compose.yml for local dev
3. GitHub Actions workflow for CI/CD
4. .env.example with all variables
5. Deployment guide (README)

Return as JSON with files.
`

    try {
      const response = await callAI(prompt)
      return {
        docker: response,
        cicd: response,
        guide: response,
      }
    } catch {
      console.warn('Deployment config failed')
      return {
        docker: this.dockerfile(),
        cicd: this.githubWorkflow(),
        guide: this.createReadme(),
      }
    }
  }

  /**
   * Save generated project to database
   */
  private async saveGeneration(data: SaveGenerationInput) {
    try {
      await createVersion(
        this.projectId,
        this.currentVersion,
        data.frontendCode,
        { endpoints: data.backendEndpoints },
        data.databaseSchema,
        {
          ...data.deploymentConfig,
          files: data.files,
        }
      )

      // Save components
      if (this.request.features.includes('database')) {
        await createComponent(this.projectId, 'UserModel', 'database', 'User model schema', {})
      }

      // Save API endpoints
      for (const endpoint of data.backendEndpoints) {
        await createApiEndpoint(
          this.projectId,
          endpoint.path,
          endpoint.method,
          endpoint.description
        )
      }
    } catch (error) {
      console.error('Failed to save generation:', error)
      throw error
    }
  }

  /**
   * Extract endpoints from response
   */
  private extractEndpoints(response: string): PlanEndpoint[] {
    const endpoints: PlanEndpoint[] = []
    const lines = response.split('\n')

    for (const line of lines) {
      const match = line.match(/^(GET|POST|PUT|DELETE|PATCH)\s+(.+)/i)
      if (match) {
        endpoints.push({
          method: match[1].toUpperCase(),
          path: match[2].trim(),
          description: '',
        })
      }
    }

    return endpoints
  }

  /**
   * Default templates (fallback)
   */
  private getDefaultPlan() {
    return {
      endpoints: [
        { method: 'GET', path: '/api/health' },
        { method: 'GET', path: '/api/projects' },
        { method: 'POST', path: '/api/projects' },
      ],
      tables: [
        { name: 'users', fields: ['id', 'email', 'name'] },
        { name: 'projects', fields: ['id', 'userId', 'name'] },
      ],
    }
  }

  private getDefaultFrontendTemplate() {
    return `
// Default frontend template
// Replace with actual generated code
export default function Home() {
  return <div>Welcome to ${this.request.projectName}</div>
}
`
  }

  private getDefaultBackendTemplate() {
    return `
// Default backend template
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})
`
  }

  private createProjectFiles(data: {
    frontendCode: string
    backendCode: string
    databaseSchema: Record<string, unknown>
    deploymentConfig: { docker?: string; cicd?: string; guide?: string }
  }): GeneratedProjectFile[] {
    const files: GeneratedProjectFile[] = []
    const name = this.slugify(this.request.projectName)

    files.push({
      path: 'README.md',
      content: this.createReadme(),
    })

    files.push({
      path: '.env.example',
      content: this.createEnvExample(),
    })

    files.push({
      path: 'package.json',
      content: JSON.stringify(this.createPackageJson(name), null, 2),
    })

    if (this.request.techStack.frontend === 'next') {
      files.push(
        { path: 'app/layout.tsx', content: this.nextLayout() },
        { path: 'app/page.tsx', content: this.cleanGeneratedCode(data.frontendCode, this.nextPage()) },
        { path: 'app/globals.css', content: this.globalCss() },
        { path: 'next.config.ts', content: "import type { NextConfig } from 'next'\n\nconst nextConfig: NextConfig = {}\n\nexport default nextConfig\n" },
        { path: 'tsconfig.json', content: this.tsConfig() }
      )
    } else {
      files.push(
        { path: 'src/main.tsx', content: this.reactMain() },
        { path: 'src/App.tsx', content: this.cleanGeneratedCode(data.frontendCode, this.reactApp()) },
        { path: 'src/styles.css', content: this.globalCss() },
        { path: 'index.html', content: this.indexHtml() },
        { path: 'vite.config.ts', content: this.viteConfig() },
        { path: 'tsconfig.json', content: this.tsConfig() }
      )
    }

    files.push(
      { path: 'src/lib/api.ts', content: this.apiClient() },
      { path: 'src/types/index.ts', content: this.appTypes() }
    )

    if (this.request.techStack.backend === 'node') {
      files.push(
        { path: 'server/package.json', content: JSON.stringify(this.nodeServerPackageJson(name), null, 2) },
        { path: 'server/src/index.ts', content: data.backendCode || this.nodeServer() },
        { path: 'server/tsconfig.json', content: this.tsConfig() }
      )
    }

    if (this.request.techStack.backend === 'python') {
      files.push(
        { path: 'server/requirements.txt', content: 'fastapi==0.115.6\nuvicorn[standard]==0.34.0\npython-dotenv==1.0.1\n' },
        { path: 'server/main.py', content: data.backendCode || this.pythonServer() }
      )
    }

    if (this.request.techStack.database !== 'none') {
      files.push({
        path: 'prisma/schema.prisma',
        content: this.prismaSchema(data.databaseSchema),
      })
    }

    files.push(
      { path: 'Dockerfile', content: data.deploymentConfig.docker || this.dockerfile() },
      { path: 'docker-compose.yml', content: this.dockerCompose() },
      { path: '.github/workflows/ci.yml', content: data.deploymentConfig.cicd || this.githubWorkflow() }
    )

    return files
  }

  private cleanGeneratedCode(code: string, fallback: string) {
    const trimmed = code.trim()
    if (!trimmed || trimmed.startsWith('```') || trimmed.length > 30000) return fallback
    return trimmed
  }

  private slugify(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'generated-app'
  }

  private createPackageJson(name: string) {
    const scripts = this.request.techStack.frontend === 'next'
      ? { dev: 'next dev', build: 'next build', start: 'next start', lint: 'next lint' }
      : { dev: 'vite', build: 'vite build', preview: 'vite preview', lint: 'eslint .' }

    return {
      name,
      version: '1.0.0',
      private: true,
      scripts,
      dependencies: this.request.techStack.frontend === 'next'
        ? { '@prisma/client': '^5.20.0', next: '^16.1.6', react: '^19.2.3', 'react-dom': '^19.2.3' }
        : { '@vitejs/plugin-react': '^4.3.4', react: '^19.2.3', 'react-dom': '^19.2.3', vite: '^6.0.7' },
      devDependencies: { '@types/node': '^20.17.10', '@types/react': '^19.0.2', '@types/react-dom': '^19.0.2', typescript: '^5.7.2' },
    }
  }

  private nodeServerPackageJson(name: string) {
    return {
      name: `${name}-server`,
      version: '1.0.0',
      private: true,
      scripts: { dev: 'tsx watch src/index.ts', build: 'tsc', start: 'node dist/index.js' },
      dependencies: { cors: '^2.8.5', dotenv: '^16.4.7', express: '^4.21.2', zod: '^3.24.1' },
      devDependencies: { '@types/cors': '^2.8.17', '@types/express': '^5.0.0', '@types/node': '^20.17.10', tsx: '^4.19.2', typescript: '^5.7.2' },
    }
  }

  private createReadme() {
    return `# ${this.request.projectName}

${this.request.description}

## Stack
- Frontend: ${this.request.techStack.frontend}
- Backend: ${this.request.techStack.backend}
- Database: ${this.request.techStack.database}
- Hosting: ${this.request.techStack.hosting}

## Run
\`\`\`bash
npm install
npm run dev
\`\`\`

${this.request.techStack.backend !== 'none' ? 'The backend lives in `server/` and can be run separately with `npm install && npm run dev` from that folder.\n' : ''}
`
  }

  private createEnvExample() {
    const lines = ['NEXT_PUBLIC_API_URL=http://localhost:4000']
    if (this.request.techStack.database !== 'none') lines.push('DATABASE_URL=postgresql://user:password@localhost:5432/app')
    if (this.request.features.includes('authentication')) lines.push('AUTH_SECRET=replace-me')
    if (this.request.features.includes('payment')) lines.push('STRIPE_SECRET_KEY=sk_test_replace_me')
    return `${lines.join('\n')}\n`
  }

  private nextLayout() {
    return `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${this.request.projectName}',
  description: '${this.request.description.replace(/'/g, "\\'")}',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`
  }

  private nextPage() {
    return `const pages = ${JSON.stringify(this.request.pages || ['/'], null, 2)}
const features = ${JSON.stringify(this.request.features, null, 2)}

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">${this.request.projectType}</p>
        <h1>${this.request.projectName}</h1>
        <p>${this.request.description}</p>
      </section>
      <section className="grid">
        {features.map((feature) => (
          <article key={feature} className="card">
            <h2>{feature}</h2>
            <p>Ready-to-connect module generated for this project.</p>
          </article>
        ))}
      </section>
      <section className="card">
        <h2>Pages</h2>
        <ul>{pages.map((page) => <li key={page}>{page}</li>)}</ul>
      </section>
    </main>
  )
}
`
  }

  private reactMain() {
    return `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`
  }

  private reactApp() {
    return this.nextPage().replace('export default function Home()', 'export default function App()')
  }

  private globalCss() {
    return `* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #09090b; color: #f8fafc; }
.shell { min-height: 100vh; padding: 48px; background: radial-gradient(circle at 20% 10%, rgba(16,185,129,.14), transparent 28%), radial-gradient(circle at 80% 0%, rgba(59,130,246,.12), transparent 28%), #09090b; }
.hero { max-width: 860px; margin-bottom: 36px; }
.eyebrow { color: #34d399; text-transform: uppercase; letter-spacing: .14em; font-size: 12px; font-weight: 800; }
h1 { font-size: clamp(40px, 8vw, 88px); line-height: .92; margin: 0 0 18px; }
h2 { margin: 0 0 10px; }
p { color: #a1a1aa; font-size: 18px; line-height: 1.7; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 16px; }
.card { border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04); border-radius: 16px; padding: 22px; }
li { margin: 8px 0; color: #d4d4d8; }
`
  }

  private indexHtml() {
    return '<div id="root"></div><script type="module" src="/src/main.tsx"></script>\n'
  }

  private viteConfig() {
    return "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({ plugins: [react()] })\n"
  }

  private tsConfig() {
    return JSON.stringify({ compilerOptions: { target: 'ES2020', lib: ['dom', 'dom.iterable', 'esnext'], allowJs: false, skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true, module: 'esnext', moduleResolution: 'bundler', resolveJsonModule: true, isolatedModules: true, jsx: 'preserve' }, include: ['**/*.ts', '**/*.tsx'], exclude: ['node_modules'] }, null, 2)
  }

  private apiClient() {
    return `const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(\`\${API_URL}\${path}\`)
  if (!response.ok) throw new Error('Request failed')
  return response.json()
}
`
  }

  private appTypes() {
    return `export type ProjectFeature = ${this.request.features.map((feature) => `'${feature}'`).join(' | ') || 'string'}

export type ApiResponse<T> = {
  data?: T
  error?: string
}
`
  }

  private nodeServer() {
    return `import cors from 'cors'
import express from 'express'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.get('/api/features', (_req, res) => res.json(${JSON.stringify(this.request.features)}))

app.listen(4000, () => console.log('API running on http://localhost:4000'))
`
  }

  private pythonServer() {
    return `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="${this.request.projectName}")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/api/health")
def health():
    return {"ok": True}
`
  }

  private prismaSchema(schema: Record<string, unknown>) {
    if (typeof schema === 'string') return schema
    return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${this.request.techStack.database === 'mysql' ? 'mysql' : 'postgresql'}"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
`
  }

  private dockerfile() {
    return 'FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\nCMD ["npm", "start"]\n'
  }

  private dockerCompose() {
    return `services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
`
  }

  private githubWorkflow() {
    return `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install
      - run: npm run build
`
  }
}

/**
 * Helper function to start generation
 */
export async function generateWebsite(
  projectId: string,
  request: GenerationRequest
): Promise<GenerationResult> {
  const generator = new WebsiteGenerator(projectId, request)
  return generator.generate()
}
