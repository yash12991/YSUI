import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createZip } from '@/lib/download/zip'

type StoredFile = {
  path: string
  content: string
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'
}

function parseFiles(deploymentConfig: string | null | undefined): StoredFile[] {
  if (!deploymentConfig) return []

  try {
    const parsed = JSON.parse(deploymentConfig)
    if (Array.isArray(parsed.files)) {
      return parsed.files.filter(
        (file: Partial<StoredFile>) =>
          typeof file.path === 'string' && typeof file.content === 'string'
      ) as StoredFile[]
    }
  } catch {
    return []
  }

  return []
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const userId = request.headers.get('x-user-id')

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...(userId ? { userId } : {}),
    },
    include: {
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1,
      },
    },
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const latest = project.versions[0]
  if (!latest) {
    return NextResponse.json({ error: 'No generated version found' }, { status: 404 })
  }

  const files = parseFiles(latest.deploymentConfig)

  if (files.length === 0 && latest.frontendCode) {
    files.push({
      path: 'src/generated/GeneratedUI.tsx',
      content: latest.frontendCode,
    })
  }

  if (files.length === 0) {
    return NextResponse.json({ error: 'No downloadable files found' }, { status: 404 })
  }

  const zip = createZip(files)
  const filename = `${slugify(project.name)}.zip`

  return new NextResponse(zip, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(zip.byteLength),
    },
  })
}
