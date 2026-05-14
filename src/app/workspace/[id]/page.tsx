'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/components/appLayout.module.css'
import { ChatPanel } from '@/components/layout/ChatPanel'
import { CodePanel } from '@/components/layout/CodePanel'
import { VersionHistory } from '@/components/layout/VersionHistory'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { ShareDialog } from '@/components/ShareDialog'
import { ChatMessage, GenerationResult, ComponentNode, ComponentType, ProjectFile, VersionEntry } from '@/types'
import { Template } from '@/lib/templates'
import {
  Sparkles, PanelLeft, Code2, Eye, Clock, RotateCcw,
  Trash2, LogOut, Save, Download, ArrowLeft
} from 'lucide-react'

type ViewTab = 'split' | 'code' | 'preview'
type AuthUser = { id: string; email: string; name?: string | null }

const INTERACTIVE_APP_KEYWORDS = [
  'calculator', 'game', 'todo', 'to-do', 'timer', 'stopwatch', 'countdown',
  'quiz', 'pomodoro', 'markdown editor', 'text editor', 'notepad', 'paint',
  'drawing', 'canvas', 'snake', 'tetris', 'memory game', 'flashcard',
  'currency converter', 'unit converter', 'password generator', 'color picker',
  'random', 'generator', 'app that', 'app which', 'working', 'functional',
  'interactive', 'click', 'button that', 'form that', 'tool',
]

function detectFullAppMode(prompt: string): boolean {
  const lower = prompt.toLowerCase()
  return INTERACTIVE_APP_KEYWORDS.some(kw => lower.includes(kw))
}

function emptyPlan(): GenerationResult['plan'] {
  return { layout: 'single-column', components: [], reasoning: 'Loaded from saved project' }
}

function emptyExplanation(): GenerationResult['explanation'] {
  return { explanation: 'Loaded from your saved projects. Ask for changes to modify it.', componentChoices: [], layoutReason: 'Saved project restore' }
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

export default function WorkspacePage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [user, setUser] = useState<AuthUser | null>(null)
  const [projectName, setProjectName] = useState('')

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentCode, setCurrentCode] = useState('')
  const [currentHtml, setCurrentHtml] = useState('')
  const [outputMode, setOutputMode] = useState<'tsx' | 'html' | 'nextjs'>('tsx')
  const [previewKey, setPreviewKey] = useState(0)
  const [componentList, setComponentList] = useState<ComponentType[]>([])
  const [previewComponents, setPreviewComponents] = useState<ComponentNode[]>([])
  const [previewLayout, setPreviewLayout] = useState('single-column')
  const [currentVersion, setCurrentVersion] = useState<number | null>(null)
  const [versions, setVersions] = useState<VersionEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<ViewTab>('split')
  const [previewError, setPreviewError] = useState<string | undefined>()
  const [currentTitle, setCurrentTitle] = useState('')
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([])

  const versionCounterRef = useRef(0)

  useEffect(() => {
    const stored = window.localStorage.getItem('simplyui:user')
    if (!stored) {
      router.push('/login')
      return
    }
    try {
      const u = JSON.parse(stored)
      setUser(u)
      loadProject(u)
    } catch {
      window.localStorage.removeItem('simplyui:user')
      router.push('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  async function loadProject(u: AuthUser) {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { 'x-user-id': u.id },
      })
      if (!res.ok) { router.push('/dashboard'); return }
      const project = await res.json()
      setProjectName(project.name)

      const versionsFromDb = [...(project.versions || [])].sort((a: any, b: any) => a.versionNumber - b.versionNumber)
      const latest = versionsFromDb[versionsFromDb.length - 1]

      if (latest?.frontendCode) {
        const backendSpec = parseJson<{
          outputMode?: string; title?: string; plan?: GenerationResult['plan']
          explanation?: GenerationResult['explanation']; prompt?: string; files?: ProjectFile[]
        }>(latest.backendSpec, {})

        const isHtml = backendSpec.outputMode === 'html' || latest.frontendCode.trim().startsWith('<!DOCTYPE html')
        setCurrentTitle(project.name)
        setCurrentVersion(latest.versionNumber)
        setPreviewError(undefined)
        setProjectFiles(backendSpec.files || [])

        if (isHtml) {
          setCurrentHtml(latest.frontendCode)
          setCurrentCode('')
          setOutputMode('html')
          setPreviewComponents([])
          setPreviewLayout('single-column')
        } else {
          setCurrentCode(latest.frontendCode)
          setCurrentHtml('')
          setOutputMode('tsx')
          setPreviewComponents(backendSpec.plan?.components || [])
          setPreviewLayout(backendSpec.plan?.layout || 'single-column')
          setPreviewKey(k => k + 1)
        }

        versionCounterRef.current = latest.versionNumber
        setVersions(versionsFromDb.map((version: any) => {
          const spec = parseJson<{ plan?: GenerationResult['plan']; explanation?: GenerationResult['explanation']; prompt?: string; files?: ProjectFile[] }>(version.backendSpec, {})
          return {
            version: version.versionNumber,
            code: version.frontendCode || '',
            prompt: spec.prompt || project.description || project.name,
            plan: spec.plan || emptyPlan(),
            explanation: spec.explanation || emptyExplanation(),
            timestamp: version.createdAt,
            files: spec.files,
          }
        }))
        setMessages([{
          id: `loaded-${Date.now()}`, role: 'assistant',
          content: `Opened "${project.name}". Describe changes to modify it.`,
          timestamp: new Date().toISOString(),
        }])
      } else {
        setMessages([{
          id: `welcome-${Date.now()}`, role: 'assistant',
          content: `Welcome to **${project.name}**. Describe what you want to build and I'll generate it.`,
          timestamp: new Date().toISOString(),
        }])
      }
    } catch (e) {
      console.warn('Failed to load project:', e)
      router.push('/dashboard')
    }
  }

  const applyGenerationResult = useCallback((result: GenerationResult) => {
    setCurrentCode(result.generation.code)
    setCurrentHtml('')
    setOutputMode('tsx')
    setComponentList(result.generation.componentList)
    setPreviewComponents(result.plan.components)
    setPreviewLayout(result.plan.layout)
    setCurrentVersion(result.version)
    setPreviewError(undefined)
    setCurrentTitle(result.userPrompt)
    setProjectFiles(result.files || [])
    setPreviewKey(k => k + 1)

    if (result.version > versionCounterRef.current) {
      versionCounterRef.current = result.version
    }

    setVersions(prev => {
      if (prev.some(v => v.version === result.version)) return prev
      return [...prev, {
        version: result.version, code: result.generation.code,
        prompt: result.userPrompt, plan: result.plan,
        explanation: result.explanation, timestamp: result.timestamp,
        files: result.files,
      }]
    })
  }, [])

  const applyHtmlResult = useCallback((html: string, title: string, files: ProjectFile[] = []) => {
    versionCounterRef.current += 1
    setCurrentHtml(html)
    setCurrentCode('')
    setOutputMode('html')
    setPreviewComponents([])
    setCurrentVersion(versionCounterRef.current)
    setPreviewError(undefined)
    setCurrentTitle(title)
    setProjectFiles(files)
  }, [])

  const handleLoadTemplate = useCallback((template: Template) => {
    versionCounterRef.current += 1
    const nextVersion = versionCounterRef.current
    const result = { ...template.result, version: nextVersion, timestamp: new Date().toISOString() }
    applyGenerationResult(result)

    const userMsg: ChatMessage = { id: `user-tpl-${Date.now()}`, role: 'user', content: `📐 Template: ${template.name}`, timestamp: new Date().toISOString() }
    const assistantMsg: ChatMessage = { id: `assistant-tpl-${Date.now()}`, role: 'assistant', content: result.explanation.explanation, timestamp: new Date().toISOString(), generationResult: result }
    setMessages(prev => [...prev, userMsg, assistantMsg])
    setActiveTab('preview')
  }, [applyGenerationResult])

  const handleRollback = useCallback(async (targetVersion: number) => {
    const version = versions.find(v => v.version === targetVersion)
    if (!version) return
    setCurrentCode(version.code)
    setCurrentHtml('')
    setOutputMode('tsx')
    setPreviewComponents(version.plan.components)
    setPreviewLayout(version.plan.layout)
    setCurrentVersion(version.version)
    setPreviewError(undefined)
    setProjectFiles(version.files || [])
    setShowVersionHistory(false)
    setMessages(prev => [...prev, {
      id: `system-${Date.now()}`, role: 'assistant',
      content: `Rolled back to version ${targetVersion}. Original prompt: "${version.prompt}"`,
      timestamp: new Date().toISOString(),
    }])
  }, [versions])

  async function saveGeneration(result: GenerationResult) {
    if (!user) return
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({
          frontendCode: result.generation.code,
          versionNumber: result.version,
          backendSpec: {
            plan: result.plan, explanation: result.explanation,
            prompt: result.userPrompt, files: result.files,
            outputMode,
          },
        }),
      })
    } catch (e) {
      console.warn('[save] Failed:', e)
    }
  }

  const handleSendMessage = useCallback(async (message: string) => {
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: message, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const useFullApp = detectFullAppMode(message) && !currentCode

      if (useFullApp) {
        const response = await fetch('/api/generate-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: message, userId: user?.id, projectId }),
        })
        const data = await response.json()
        if (data.success && data.data?.html) {
          applyHtmlResult(data.data.html, data.data.title || message, data.data.files || [])
          const msg: ChatMessage = {
            id: `assistant-${Date.now()}`, role: 'assistant',
            content: `Built your **${data.data.title || message}** — a fully working app.${data.data.projectId ? ' Saved.' : ''}`,
            timestamp: new Date().toISOString(),
          }
          setMessages(prev => [...prev, msg])
          setActiveTab('preview')
        } else throw new Error(data.error || 'Generation failed')
      } else if (currentHtml) {
        const response = await fetch('/api/generate-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: message, userId: user?.id, projectId,
            currentHtml, currentVersion,
          }),
        })
        const data = await response.json()
        if (data.success && data.data?.html) {
          applyHtmlResult(data.data.html, data.data.title || message, data.data.files || [])
          const msg: ChatMessage = {
            id: `assistant-${Date.now()}`, role: 'assistant',
            content: `Updated "${data.data.title || currentTitle || 'your app'}" — saved new version.`,
            timestamp: new Date().toISOString(),
          }
          setMessages(prev => [...prev, msg])
          setActiveTab('preview')
        } else throw new Error(data.error || 'Modification failed')
      } else if (currentCode) {
        const response = await fetch('/api/modify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: message, currentCode: currentCode || '// empty',
            currentVersion: currentVersion || 0,
            previousLayout: previewLayout, previousComponentList: componentList,
            projectId,
          }),
        })
        const data = await response.json()
        if (data.success && data.data) {
          applyGenerationResult(data.data as GenerationResult)
          const msg: ChatMessage = {
            id: `assistant-${Date.now()}`, role: 'assistant',
            content: (data.data as GenerationResult).explanation.explanation,
            timestamp: new Date().toISOString(), generationResult: data.data,
          }
          setMessages(prev => [...prev, msg])
          saveGeneration(data.data)
        } else throw new Error(data.error || 'Modification failed')
      } else {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: message, userId: user?.id, projectId }),
        })
        const data = await response.json()
        if (data.success && data.data) {
          const result = data.data as GenerationResult
          applyGenerationResult(result)
          const msg: ChatMessage = {
            id: `assistant-${Date.now()}`, role: 'assistant',
            content: result.explanation.explanation,
            timestamp: new Date().toISOString(), generationResult: result,
          }
          setMessages(prev => [...prev, msg])
          saveGeneration(result)
          setActiveTab('preview')
        } else throw new Error(data.error || 'Generation failed')
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`, role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Generation failed. Please try again.'}`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [currentCode, currentHtml, currentVersion, applyGenerationResult, applyHtmlResult, previewLayout, componentList, user, projectId, currentTitle, saveGeneration])

  const handleRegenerate = useCallback(async () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMsg) return
    setCurrentCode('')
    setCurrentHtml('')
    setCurrentVersion(null)
    handleSendMessage(lastUserMsg.content)
  }, [messages, handleSendMessage])

  const handleClear = useCallback(() => {
    setMessages([])
    setCurrentCode('')
    setCurrentHtml('')
    setOutputMode('tsx')
    setComponentList([])
    setPreviewComponents([])
    setPreviewLayout('single-column')
    setCurrentVersion(null)
    setVersions([])
    setPreviewError(undefined)
    setCurrentTitle('')
    setProjectFiles([])
  }, [])

  const hasOutput = !!(currentCode || currentHtml)

  function handleLogout() {
    window.localStorage.removeItem('simplyui:user')
    router.push('/')
  }

  return (
    <div className={styles.appContainer}>
      <div className={styles.topBar}>
        <div className={styles.topBarBrand}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'inherit' }}>
            <ArrowLeft size={15} />
            <Sparkles size={16} className={styles.topBarIcon} />
            SimplyUI
          </Link>
          <span className={styles.topBarBrandSub}>{projectName || 'Workspace'}</span>
        </div>
        <div className={styles.topBarActions}>
          {currentVersion !== null && (
            <span className={styles.versionTag}>v{currentVersion}</span>
          )}
          <span className={styles.versionTag}><Save size={11} /> Auto-saved</span>
          <a className={styles.topBarButton} href={`/api/projects/${projectId}/download`}>
            <Download size={13} /> ZIP
          </a>
          {outputMode === 'html' && (
            <span className={styles.versionTag} style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>⚡ Full App</span>
          )}
          {versions.length > 0 && (
            <button className={styles.topBarButton} onClick={() => setShowVersionHistory(true)} id="history-button">
              <Clock size={13} /> History ({versions.length})
            </button>
          )}
          {versions.length > 1 && (
            <select className={styles.topBarButton} onChange={(e) => handleRollback(Number(e.target.value))} value="" id="version-select">
              <option value="" disabled>Rollback</option>
              {versions.map((v, idx) => (
                <option key={`opt-${idx}-${v.version}`} value={v.version}>v{v.version} — {v.prompt.slice(0, 30)}...</option>
              ))}
            </select>
          )}
          {hasOutput && user && (
            <ShareDialog code={currentCode || currentHtml} title={currentTitle} userId={user.id} userName={user.name || user.email} componentList={componentList} outputMode={outputMode} />
          )}
          {hasOutput && (
            <button className={styles.topBarButton} onClick={handleRegenerate} disabled={isLoading} id="regenerate-button">
              <RotateCcw size={13} /> Regenerate
            </button>
          )}
          <button className={`${styles.topBarButton} ${styles.topBarButtonDanger}`} onClick={handleClear} id="clear-button">
            <Trash2 size={13} /> Clear
          </button>
          {user && (
            <button className={styles.topBarButton} onClick={handleLogout} id="logout-button" title={user.email}>
              <LogOut size={13} /> {user.name || user.email.split('@')[0]}
            </button>
          )}
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.leftPanel}>
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onLoadTemplate={handleLoadTemplate}
            isLoading={isLoading}
            hasCode={hasOutput}
          />
        </div>

        <div className={styles.rightArea}>
          <div className={styles.tabBar}>
            <button className={`${styles.tab} ${activeTab === 'split' ? styles.tabActive : ''}`} onClick={() => setActiveTab('split')} id="tab-split">
              <PanelLeft size={14} /> Split View
            </button>
            <button className={`${styles.tab} ${activeTab === 'code' ? styles.tabActive : ''}`} onClick={() => setActiveTab('code')} id="tab-code">
              <Code2 size={14} /> Code
            </button>
            <button className={`${styles.tab} ${activeTab === 'preview' ? styles.tabActive : ''}`} onClick={() => setActiveTab('preview')} id="tab-preview">
              <Eye size={14} /> Preview
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'split' && (
              <div className={styles.splitView}>
                <div className={styles.splitLeft}>
                  <CodePanel code={currentCode || (currentHtml ? currentHtml : '')} files={projectFiles} componentList={componentList} />
                </div>
                <div className={styles.splitRight}>
                  <PreviewPanel
                    key={previewKey}
                    components={previewComponents}
                    layout={previewLayout}
                    version={currentVersion}
                    error={previewError}
                    code={currentCode || undefined}
                    htmlOutput={currentHtml || undefined}
                    outputMode={outputMode}
                    title={currentTitle}
                  />
                </div>
              </div>
            )}
            {activeTab === 'code' && (
              <CodePanel code={currentCode || currentHtml} files={projectFiles} componentList={componentList} />
            )}
            {activeTab === 'preview' && (
              <PreviewPanel
                key={previewKey}
                components={previewComponents}
                layout={previewLayout}
                version={currentVersion}
                error={previewError}
                code={currentCode || undefined}
                htmlOutput={currentHtml || undefined}
                outputMode={outputMode}
                title={currentTitle}
              />
            )}
          </div>
        </div>
      </div>

      <VersionHistory
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        versions={versions}
        currentVersion={currentVersion}
        onRollback={handleRollback}
      />
    </div>
  )
}
