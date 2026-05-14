import { NextRequest, NextResponse } from 'next/server'
import { getCommunityComponents, createCommunityComponent } from '@/lib/db/queries'

export async function GET() {
  try {
    const components = await getCommunityComponents({ limit: 50 })
    const items = components.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      userName: c.userName,
      layout: c.layout,
      componentList: JSON.parse(c.componentList || '[]'),
      tags: JSON.parse(c.tags || '[]'),
      likes: c.likes,
      forks: c.forks,
      commentCount: (c as any)._count?.comments || 0,
      createdAt: c.createdAt.toISOString(),
    }))
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch community components' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userName, title, description, code, layout, componentList, tags, prompt } = body

    if (!userId || !title || !code) {
      return NextResponse.json(
        { success: false, error: 'userId, title, and code are required' },
        { status: 400 }
      )
    }

    const component = await createCommunityComponent(
      userId,
      userName,
      title,
      description,
      code,
      layout || 'single-column',
      componentList || [],
      tags || [],
      prompt
    )

    return NextResponse.json({
      success: true,
      data: {
        id: component.id,
        title: component.title,
        createdAt: component.createdAt.toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to share component' },
      { status: 500 }
    )
  }
}
