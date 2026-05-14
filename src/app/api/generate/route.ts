import { NextRequest, NextResponse } from 'next/server';
import { orchestrateGeneration } from '@/lib/agents';
import { GenerateRequest, ApiResponse, GenerationResult } from '@/types';
import { getVersionHistory, addVersion } from '@/lib/store';
import { createProject, createVersion } from '@/lib/db/queries';
import { createNextProjectFiles } from '@/lib/generation/projectFiles';

function makeProjectName(prompt: string) {
    const compact = prompt.trim().replace(/\s+/g, ' ').slice(0, 48);
    return compact || 'Untitled project';
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateRequest = await request.json();

        if (!body.prompt || body.prompt.trim().length === 0) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const currentVersion = getVersionHistory().length;
        const result: GenerationResult = await orchestrateGeneration(body.prompt, currentVersion);
        result.files = createNextProjectFiles(result, makeProjectName(body.prompt));

        if (body.projectId) {
            await createVersion(body.projectId, result.version, result.generation.code, {
                plan: result.plan,
                explanation: result.explanation,
                prompt: result.userPrompt,
                files: result.files,
            }, undefined, { files: result.files });
            result.projectId = body.projectId;
            result.downloadUrl = `/api/projects/${body.projectId}/download`;
        } else if (body.userId) {
            const project = await createProject(
                body.userId,
                `${makeProjectName(body.prompt)} ${Date.now()}`,
                body.prompt,
                { source: 'component-generator' }
            );
            await createVersion(project.id, result.version, result.generation.code, {
                plan: result.plan,
                explanation: result.explanation,
                prompt: result.userPrompt,
                files: result.files,
            }, undefined, { files: result.files });
            result.projectId = project.id;
            result.downloadUrl = `/api/projects/${project.id}/download`;
        }

        // Store version
        addVersion({
            version: result.version,
            code: result.generation.code,
            prompt: result.userPrompt,
            plan: result.plan,
            explanation: result.explanation,
            timestamp: result.timestamp,
        });

        return NextResponse.json<ApiResponse<GenerationResult>>(
            { success: true, data: result },
            { status: 200 }
        );
    } catch (error) {
        console.error('[API /generate] Error:', error);
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: error instanceof Error ? error.message : 'Generation failed' },
            { status: 500 }
        );
    }
}
