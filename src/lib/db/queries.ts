import { prisma } from './prisma'

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
export async function createProject(userId: string, name: string, description?: string, techStack?: any) {
  return prisma.project.create({
    data: {
      userId,
      name,
      description,
      techStack: JSON.stringify(techStack || {}),
    },
  })
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

export async function updateProject(id: string, data: any) {
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
  backendSpec?: any,
  databaseSchema?: any,
  deploymentConfig?: any
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
  propsSchema?: any
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
  requestSchema?: any,
  responseSchema?: any
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
