import { prisma } from './prisma'
import type { Prisma } from '@prisma/client'

// USER QUERIES
export async function createUser(email: string, name?: string, password?: string) {
  return prisma.user.create({
    data: {
      email,
      name,
      password,
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  })
}

// PROJECT QUERIES
export async function createProject(userId: string, name: string, description?: string, techStack?: Record<string, unknown>) {
  try {
    return await prisma.project.create({
      data: {
        userId,
        name,
        description,
        techStack: JSON.stringify(techStack || {}),
      },
    })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      const uniqueName = `${name} ${Date.now()}`;
      return prisma.project.create({
        data: {
          userId,
          name: uniqueName,
          description,
          techStack: JSON.stringify(techStack || {}),
        },
      })
    }
    throw err;
  }
}

export async function getProjectsByUser(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    include: {
      versions: { take: 1, orderBy: { createdAt: 'desc' } },
    },
  })
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      versions: true,
      components: true,
      endpoints: true,
    },
  })
}

export async function updateProject(id: string, data: Prisma.ProjectUpdateInput) {
  return prisma.project.update({
    where: { id },
    data,
  })
}

export async function deleteProject(id: string) {
  return prisma.project.delete({
    where: { id },
  })
}

// VERSION QUERIES
export async function createVersion(
  projectId: string,
  versionNumber: number,
  frontendCode?: string,
  backendSpec?: Record<string, unknown>,
  databaseSchema?: Record<string, unknown>,
  deploymentConfig?: Record<string, unknown>
) {
  return prisma.websiteVersion.create({
    data: {
      projectId,
      versionNumber,
      frontendCode,
      backendSpec: JSON.stringify(backendSpec || {}),
      databaseSchema: JSON.stringify(databaseSchema || {}),
      deploymentConfig: JSON.stringify(deploymentConfig || {}),
    },
  })
}

export async function getVersionsByProject(projectId: string) {
  return prisma.websiteVersion.findMany({
    where: { projectId },
    orderBy: { versionNumber: 'desc' },
  })
}

export async function getLatestVersion(projectId: string) {
  return prisma.websiteVersion.findFirst({
    where: { projectId },
    orderBy: { versionNumber: 'desc' },
  })
}

// COMPONENT QUERIES
export async function createComponent(
  projectId: string,
  componentName: string,
  componentType: string,
  componentCode: string,
  propsSchema?: Record<string, unknown>
) {
  return prisma.generatedComponent.create({
    data: {
      projectId,
      componentName,
      componentType,
      componentCode,
      propsSchema: JSON.stringify(propsSchema || {}),
    },
  })
}

export async function getComponentsByProject(projectId: string) {
  return prisma.generatedComponent.findMany({
    where: { projectId },
  })
}

// API ENDPOINT QUERIES
export async function createApiEndpoint(
  projectId: string,
  path: string,
  method: string,
  description?: string,
  requestSchema?: Record<string, unknown>,
  responseSchema?: Record<string, unknown>
) {
  return prisma.apiEndpoint.create({
    data: {
      projectId,
      path,
      method,
      description,
      requestSchema: JSON.stringify(requestSchema || {}),
      responseSchema: JSON.stringify(responseSchema || {}),
    },
  })
}

export async function getEndpointsByProject(projectId: string) {
  return prisma.apiEndpoint.findMany({
    where: { projectId },
  })
}

// COMMUNITY QUERIES
export async function createCommunityComponent(
  userId: string,
  userName: string | null | undefined,
  title: string,
  description: string | null | undefined,
  code: string,
  layout: string,
  componentList: string[],
  tags: string[],
  prompt?: string | null
) {
  return prisma.communityComponent.create({
    data: {
      userId,
      userName,
      title,
      description,
      code,
      prompt,
      layout,
      componentList: JSON.stringify(componentList),
      tags: JSON.stringify(tags),
    },
  })
}

export async function getCommunityComponents(options?: { limit?: number; offset?: number }) {
  return prisma.communityComponent.findMany({
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
    include: { _count: { select: { comments: true } } },
  })
}

export async function getCommunityComponentById(id: string) {
  return prisma.communityComponent.findUnique({
    where: { id },
    include: {
      comments: { orderBy: { createdAt: 'desc' } },
    },
  })
}

export async function likeCommunityComponent(id: string) {
  return prisma.communityComponent.update({
    where: { id },
    data: { likes: { increment: 1 } },
  })
}

export async function addCommunityComment(
  communityComponentId: string,
  userId: string,
  userName: string | null | undefined,
  content: string
) {
  return prisma.communityComment.create({
    data: {
      communityComponentId,
      userId,
      userName,
      content,
    },
  })
}
