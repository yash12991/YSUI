import { NextRequest, NextResponse } from 'next/server'
import { generateWebsite } from '@/lib/generation/generator'
import { createProject, createUser, getUserById } from '@/lib/db/queries'
import type { GenerationRequest } from '@/lib/generation/types'

async function resolveUserId(requestedUserId: string | null) {
  if (requestedUserId && requestedUserId !== 'anonymous') {
    const existing = await getUserById(requestedUserId)
    if (existing) return existing.id
  }

  const demoUser = await createUser(
    `demo-${Date.now()}@simplyui.local`,
    'SimplyUI Demo User'
  )
  return demoUser.id
}

export async function POST(req: NextRequest) {
  try {
    // Get user ID from header
    const userId = await resolveUserId(req.headers.get('x-user-id'))

    // Parse request
    const body = await req.json()
    const {
      projectName,
      projectType,
      description,
      techStack,
      features,
      pages,
    } = body

    // Validate input
    if (!projectName || !projectType || !description || !techStack) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log(`📝 Generating website for: ${projectName}`)

    // Create project in database
    const project = await createProject(
      userId,
      projectName,
      description,
      techStack
    )

    console.log(`✅ Project created with ID: ${project.id}`)

    // Prepare generation request
    const generationRequest: GenerationRequest = {
      projectId: project.id,
      projectName,
      projectType,
      description,
      techStack,
      features: features || [],
      pages,
    }

    // Generate website (non-blocking - you could make this async)
    let result
    try {
      result = await generateWebsite(project.id, generationRequest)
    } catch (genError) {
      console.error('Generation error:', genError)
      result = {
        projectId: project.id,
        versionNumber: 1,
        status: 'failed',
        frontend: { code: '', framework: techStack.frontend, components: 0 },
        timestamp: new Date(),
      }
    }

    return NextResponse.json(
      {
        message: 'Website generation started',
        project: {
          id: project.id,
          name: project.name,
          url: `/projects/${project.id}`,
          downloadUrl: `/api/projects/${project.id}/download`,
        },
        generation: result,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Generation failed',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Website generation API',
    endpoint: 'POST /api/generate-website',
    body: {
      projectName: 'string',
      projectType: 'website | web-app | saas | mobile-app | api | dashboard | cms | ecommerce',
      description: 'string',
      techStack: {
        frontend: 'react | next | vue | svelte',
        backend: 'node | python | go | none',
        database: 'postgresql | mongodb | mysql | none',
        hosting: 'vercel | railway | render | heroku',
      },
      features: ['array of feature strings'],
      pages: ['array of page routes (optional)'],
    },
    example: {
      projectName: 'My E-commerce Store',
      projectType: 'ecommerce',
      description: 'A modern e-commerce store with product catalog and checkout',
      techStack: {
        frontend: 'next',
        backend: 'node',
        database: 'postgresql',
        hosting: 'vercel',
      },
      features: [
        'authentication',
        'database',
        'api',
        'payment',
        'file-upload',
      ],
      pages: ['/', '/products', '/cart', '/checkout', '/admin'],
    },
  })
}
