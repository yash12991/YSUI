import { NextRequest, NextResponse } from 'next/server'
import { deleteProject, getProjectById } from '@/lib/db/queries'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const userId = req.headers.get('x-user-id')
    const project = await getProjectById(id)

    if (!project || (userId && project.userId !== userId)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const userId = req.headers.get('x-user-id')
    const project = await getProjectById(id)

    if (!project || (userId && project.userId !== userId)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    await deleteProject(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
