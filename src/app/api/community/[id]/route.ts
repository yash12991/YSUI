import { NextRequest, NextResponse } from 'next/server'
import { getCommunityComponentById, likeCommunityComponent } from '@/lib/db/queries'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const component = await getCommunityComponentById(id)

    if (!component) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: component.id,
        userId: component.userId,
        userName: component.userName,
        title: component.title,
        description: component.description,
        code: component.code,
        layout: component.layout,
        componentList: JSON.parse(component.componentList || '[]'),
        tags: JSON.parse(component.tags || '[]'),
        likes: component.likes,
        forks: component.forks,
        comments: (component.comments || []).map(c => ({
          id: c.id,
          userName: c.userName,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
        })),
        createdAt: component.createdAt.toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch component' },
      { status: 500 }
    )
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const component = await likeCommunityComponent(id)
    return NextResponse.json({ success: true, data: { likes: component.likes } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to like component' },
      { status: 500 }
    )
  }
}
