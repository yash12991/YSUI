// Project generation types and logic

export type TechStack = {
  frontend: 'react' | 'next' | 'vue' | 'svelte'
  backend: 'node' | 'python' | 'go' | 'none'
  database: 'postgresql' | 'mongodb' | 'mysql' | 'none'
  hosting: 'vercel' | 'railway' | 'render' | 'heroku'
}

export type ProjectFeature =
  | 'authentication'
  | 'database'
  | 'api'
  | 'dashboard'
  | 'admin-panel'
  | 'blog'
  | 'ecommerce'
  | 'payment'
  | 'email'
  | 'file-upload'
  | 'search'
  | 'notifications'
  | 'analytics'

export type ProjectType =
  | 'website'
  | 'web-app'
  | 'saas'
  | 'mobile-app'
  | 'api'
  | 'dashboard'
  | 'cms'
  | 'ecommerce'

export interface ProjectConfig {
  id: string
  name: string
  type: ProjectType
  description: string
  techStack: TechStack
  features: ProjectFeature[]
  theme: 'light' | 'dark' | 'auto'
  colorScheme: string
  pages: string[]
  createdAt: Date
  updatedAt: Date
}

export interface GenerationRequest {
  projectId: string
  projectName: string
  projectType: ProjectType
  description: string
  techStack: TechStack
  features: ProjectFeature[]
  pages?: string[]
}

export interface GeneratedProjectFile {
  path: string
  content: string
}

export interface GenerationResult {
  projectId: string
  versionNumber: number
  status: 'success' | 'failed' | 'in-progress'
  frontend: {
    code: string
    framework: string
    components: number
  }
  backend?: {
    code: string
    runtime: string
    endpoints: number
  }
  database?: {
    schema: string
    tables: number
  }
  deployment?: {
    docker: string
    cicd: string
    guide?: string
  }
  files?: GeneratedProjectFile[]
  downloadUrl?: string
  timestamp: Date
}

// TECH STACK PRESETS
export const TECH_STACK_PRESETS = {
  nextjs_postgresql: {
    frontend: 'next' as const,
    backend: 'node' as const,
    database: 'postgresql' as const,
    hosting: 'vercel' as const,
  },
  react_node_mongodb: {
    frontend: 'react' as const,
    backend: 'node' as const,
    database: 'mongodb' as const,
    hosting: 'railway' as const,
  },
  simple_static: {
    frontend: 'react' as const,
    backend: 'none' as const,
    database: 'none' as const,
    hosting: 'vercel' as const,
  },
  fullstack_python: {
    frontend: 'next' as const,
    backend: 'python' as const,
    database: 'postgresql' as const,
    hosting: 'render' as const,
  },
}

// PROJECT TEMPLATES
export const PROJECT_TEMPLATES = {
  blog: {
    type: 'website' as const,
    features: ['database', 'blog', 'search'] as const,
    pages: ['/', '/blog', '/blog/[id]', '/about', '/contact'],
  },
  ecommerce: {
    type: 'ecommerce' as const,
    features: ['database', 'api', 'payment', 'file-upload', 'notifications'] as const,
    pages: ['/', '/products', '/products/[id]', '/cart', '/checkout', '/admin'],
  },
  saas: {
    type: 'saas' as const,
    features: ['authentication', 'database', 'api', 'dashboard', 'analytics'] as const,
    pages: ['/', '/login', '/signup', '/dashboard', '/settings', '/pricing'],
  },
  admin_dashboard: {
    type: 'dashboard' as const,
    features: ['authentication', 'database', 'api', 'admin-panel', 'analytics'] as const,
    pages: ['/login', '/dashboard', '/users', '/analytics', '/settings'],
  },
  cms: {
    type: 'cms' as const,
    features: ['authentication', 'database', 'api', 'admin-panel', 'file-upload'] as const,
    pages: ['/', '/admin', '/admin/posts', '/admin/pages', '/admin/media'],
  },
  api_only: {
    type: 'api' as const,
    features: ['database', 'api', 'authentication'] as const,
    pages: [],
  },
}

// FEATURE DESCRIPTIONS
export const FEATURE_DESCRIPTIONS = {
  authentication: 'User login, signup, password reset',
  database: 'Data persistence and queries',
  api: 'REST/GraphQL API endpoints',
  dashboard: 'Analytics and metrics views',
  'admin-panel': 'Admin interface for management',
  blog: 'Blog posting and article management',
  ecommerce: 'Product catalog and shopping features',
  payment: 'Payment processing (Stripe, PayPal)',
  email: 'Email notifications and templates',
  'file-upload': 'File upload and storage',
  search: 'Full-text search functionality',
  notifications: 'Real-time notifications',
  analytics: 'User and system analytics',
}

// GENERATION PROMPTS FOR AI
export function generatePromptForPlanner(config: GenerationRequest): string {
  return `
You are the PLANNER agent for a ${config.projectType} project generation system.

PROJECT DETAILS:
- Name: ${config.projectName}
- Type: ${config.projectType}
- Description: ${config.description}
- Tech Stack: ${config.techStack.frontend} (frontend), ${config.techStack.backend} (backend), ${config.techStack.database} (database)
- Features: ${config.features.join(', ')}
- Pages: ${config.pages?.join(', ') || 'Auto-determined'}

Your task:
1. Create a comprehensive architecture plan for this project
2. Define all database tables and relationships needed
3. List all API endpoints required
4. Plan the component structure for the frontend
5. Design the project folder structure
6. Specify deployment configuration

Output VALID JSON with this structure:
{
  "projectArchitecture": { ... },
  "database": { ... },
  "apiEndpoints": [ ... ],
  "components": [ ... ],
  "folderStructure": { ... },
  "deployment": { ... },
  "reasoning": "Why this approach"
}

Focus on:
✓ Type safety
✓ Scalability
✓ Best practices
✓ Production readiness
✓ Feature completeness
`
}

export function generatePromptForBackend(config: GenerationRequest): string {
  return `
Generate backend code for this project:
- Type: ${config.projectType}
- Runtime: ${config.techStack.backend}
- Database: ${config.techStack.database}
- Features: ${config.features.join(', ')}

Create:
1. API route handlers
2. Database models/schemas
3. Authentication middleware
4. Error handling
5. Validation schemas

Output as TypeScript/JavaScript code.
`
}

export function generatePromptForFrontend(config: GenerationRequest): string {
  return `
Generate frontend code for this project:
- Type: ${config.projectType}
- Framework: ${config.techStack.frontend}
- Features: ${config.features.join(', ')}
- Pages: ${config.pages?.join(', ') || 'Standard pages'}

Create:
1. Page components
2. UI components
3. Layout structure
4. State management
5. API integration

Use TypeScript and best practices.
`
}

// VALIDATION
export function validateProjectConfig(config: Partial<ProjectConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.name) errors.push('Project name is required')
  if (!config.type) errors.push('Project type is required')
  if (!config.description) errors.push('Project description is required')
  if (!config.techStack) errors.push('Tech stack is required')
  if (!config.features || config.features.length === 0) errors.push('At least one feature is required')

  return {
    valid: errors.length === 0,
    errors,
  }
}

// PROJECT STATS
export function estimateProjectStats(config: GenerationRequest) {
  const stats = {
    estimatedComponents: 15 + (config.pages?.length || 0) * 2,
    estimatedEndpoints: config.features.includes('api') ? 20 : 5,
    estimatedTables: config.features.includes('database') ? 8 : 0,
    estimatedTime: '45 minutes to 1 hour',
    complexity:
      config.features.length > 5 ? 'Complex' : config.features.length > 2 ? 'Medium' : 'Simple',
  }

  return stats
}
