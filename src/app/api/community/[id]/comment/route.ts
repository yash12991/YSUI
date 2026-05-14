import { NextRequest, NextResponse } from 'next/server'
import { addCommunityComment } from '@/lib/db/queries'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId, userName, content } = body

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: 'userId and content are required' },
        { status: 400 }
      )
    }

    const comment = await addCommunityComment(id, userId, userName, content)

    return NextResponse.json({
      success: true,
      data: {
        id: comment.id,
        userName: comment.userName,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to add comment' },
      { status: 500 }
    )
  }
}
