'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from '@/styles/components/appLayout.module.css';
import { ChatPanel } from '@/components/layout/ChatPanel';
import { CodePanel } from '@/components/layout/CodePanel';
import { VersionHistory } from '@/components/layout/VersionHistory';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { ChatMessage, GenerationResult, ComponentNode, ComponentType, ProjectFile, VersionEntry } from '@/types';
import { Template } from '@/lib/templates';
import {
  Sparkles,
  PanelLeft,
  Code2,
  Eye,
  Clock,
  RotateCcw,
  Trash2,
  User,
  LogOut,
  Save,
  Download,
  FolderOpen,
  Github,
  Rocket,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';

type ViewTab = 'split' | 'code' | 'preview';
type AuthMode = 'login' | 'signup';
type AuthUser = { id: string; email: string; name?: string | null };
type SavedProject = {
  id: string;
  name: string;
  description?: string | null;
  updatedAt: string;
  versions?: { versionNumber: number; frontendCode?: string | null; backendSpec?: string; createdAt: string }[];
};

// Keywords that suggest an interactive app (should use full HTML mode)
const INTERACTIVE_APP_KEYWORDS = [
  'calculator', 'game', 'todo', 'to-do', 'timer', 'stopwatch', 'countdown',
  'quiz', 'pomodoro', 'markdown editor', 'text editor', 'notepad', 'paint',
  'drawing', 'canvas', 'snake', 'tetris', 'memory game', 'flashcard',
  'currency converter', 'unit converter', 'password generator', 'color picker',
  'random', 'generator', 'app that', 'app which', 'working', 'functional',
  'interactive', 'click', 'button that', 'form that', 'tool',
];

function detectFullAppMode(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return INTERACTIVE_APP_KEYWORDS.some(kw => lower.includes(kw));
}

function emptyPlan(): GenerationResult['plan'] {
  return { layout: 'single-column', components: [], reasoning: 'Loaded from saved project' };
}

function emptyExplanation(): GenerationResult['explanation'] {
  return { explanation: 'Loaded from your saved projects. Ask for changes to modify it.', componentChoices: [], layoutReason: 'Saved project restore' };
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default function Home() {
  // Generation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const [currentHtml, setCurrentHtml] = useState(''); // for full-app HTML mode
  const [outputMode, setOutputMode] = useState<'tsx' | 'html' | 'nextjs'>('tsx');
  const [previewKey, setPreviewKey] = useState(0); // increments to force iframe reload
  const [componentList, setComponentList] = useState<ComponentType[]>([]);
  const [previewComponents, setPreviewComponents] = useState<ComponentNode[]>([]);
  const [previewLayout, setPreviewLayout] = useState('single-column');
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('split');
  const [previewError, setPreviewError] = useState<string | undefined>();
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showAuth, setShowAuth] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [projectError, setProjectError] = useState('');
  const [isProjectBusy, setIsProjectBusy] = useState(false);

  const versionCounterRef = useRef(0);

  useEffect(() => {
    const storedUser = window.localStorage.getItem('simplyui:user');
    if (!storedUser) return;

    try {
      setAuthUser(JSON.parse(storedUser));
    } catch {
      window.localStorage.removeItem('simplyui:user');
    }
  }, []);

  const refreshProjects = useCallback(async (userId = authUser?.id) => {
    if (!userId) {
      setSavedProjects([]);
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        headers: { 'x-user-id': userId },
      });
      if (!response.ok) return;
      const projects = await response.json();
      setSavedProjects(projects);
    } catch (error) {
      console.warn('[projects] Failed to load:', error);
    }
  }, [authUser?.id]);

  useEffect(() => {
    refreshProjects(authUser?.id);
  }, [authUser?.id, refreshProjects]);

  const handleAuthSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const response = await fetch(`/api/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          name: authMode === 'signup' ? authName : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setAuthUser(data.user);
      window.localStorage.setItem('simplyui:user', JSON.stringify(data.user));
      setShowAuth(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
      refreshProjects(data.user.id);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  }, [authEmail, authMode, authName, authPassword, refreshProjects]);

  const handleLogout = useCallback(() => {
    setAuthUser(null);
    setSavedProjects([]);
    setCurrentProjectId(null);
    window.localStorage.removeItem('simplyui:user');
  }, []);

  // Write TSX to disk so Next.js can compile it natively
  const writePreviewFile = useCallback(async (code: string) => {
    try {
      await fetch('/api/write-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      setPreviewKey(k => k + 1); // triggers LivePreview reload
    } catch (e) {
      console.warn('[writePreviewFile] Failed:', e);
    }
  }, []);

  // Apply TSX generation result (existing pipeline)
  const applyGenerationResult = useCallback((result: GenerationResult) => {
    setCurrentCode(result.generation.code);
    setCurrentHtml('');
    setOutputMode('nextjs'); // use Next.js native compilation
    setComponentList(result.generation.componentList);
    setPreviewComponents(result.plan.components);
    setPreviewLayout(result.plan.layout);
    setCurrentVersion(result.version);
    setPreviewError(undefined);
    setCurrentTitle(result.userPrompt);
    setCurrentProjectId(result.projectId ?? null);
    setProjectFiles(result.files || []);

    if (result.version > versionCounterRef.current) {
      versionCounterRef.current = result.version;
    }

    // Write to disk for Next.js live preview (fire-and-forget)
    writePreviewFile(result.generation.code);

    setVersions(prev => {
      if (prev.some(v => v.version === result.version)) return prev;
      return [...prev, {
        version: result.version,
        code: result.generation.code,
        prompt: result.userPrompt,
        plan: result.plan,
        explanation: result.explanation,
        timestamp: result.timestamp,
      }];
    });
  }, [writePreviewFile]);

  // Apply full HTML app result
  const applyHtmlResult = useCallback((html: string, title: string, projectId?: string, files: ProjectFile[] = []) => {
    versionCounterRef.current += 1;
    setCurrentHtml(html);
    setCurrentCode('');
    setOutputMode('html');
    setPreviewComponents([]);
    setCurrentVersion(versionCounterRef.current);
    setPreviewError(undefined);
    setCurrentTitle(title);
    setCurrentProjectId(projectId ?? null);
    setProjectFiles(files);
  }, []);

  // Load template (instant — no API)
  const handleLoadTemplate = useCallback((template: Template) => {
    versionCounterRef.current += 1;
    const nextVersion = versionCounterRef.current;
    const result = { ...template.result, version: nextVersion, timestamp: new Date().toISOString() };
    applyGenerationResult(result);

    const userMsg: ChatMessage = { id: `user-tpl-${Date.now()}`, role: 'user', content: `📐 Template: ${template.name}`, timestamp: new Date().toISOString() };
    const assistantMsg: ChatMessage = { id: `assistant-tpl-${Date.now()}`, role: 'assistant', content: result.explanation.explanation, timestamp: new Date().toISOString(), generationResult: result };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setActiveTab('preview');
  }, [applyGenerationResult]);

  // ── MAIN SEND HANDLER ──
  const handleSendMessage = useCallback(async (message: string) => {
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: message, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Detect whether to use full-app mode or component mode
      const useFullApp = detectFullAppMode(message) && !currentCode;

      if (useFullApp) {
        // ── FULL HTML APP MODE ──
        const response = await fetch('/api/generate-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: message, userId: authUser?.id }),
        });
        const data = await response.json();
        if (data.success && data.data?.html) {
          applyHtmlResult(data.data.html, data.data.title || message, data.data.projectId, data.data.files || []);
          if (authUser?.id) refreshProjects(authUser.id);
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`, role: 'assistant',
            content: `Built your **${data.data.title || message}** — a fully working app.${data.data.projectId ? ' Saved to your projects.' : ''} You can interact with it in the Preview panel.`,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, assistantMsg]);
          setActiveTab('preview');
        } else {
          throw new Error(data.error || 'Full-app generation failed');
        }
      } else if (currentHtml) {
        const response = await fetch('/api/generate-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: message,
            userId: authUser?.id,
            projectId: currentProjectId,
            currentHtml,
            currentVersion,
          }),
        });
        const data = await response.json();
        if (data.success && data.data?.html) {
          applyHtmlResult(data.data.html, data.data.title || message, data.data.projectId || currentProjectId || undefined, data.data.files || []);
          if (authUser?.id) refreshProjects(authUser.id);
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: `Updated "${data.data.title || currentTitle || 'your app'}" and saved a new version.`,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, assistantMsg]);
          setActiveTab('preview');
        } else {
          throw new Error(data.error || 'HTML modification failed');
        }
      } else if (currentCode) {
        // ── MODIFY MODE (existing pipeline) ──
        const response = await fetch('/api/modify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: message, currentCode: currentCode || '// empty', currentVersion: currentVersion || 0, previousLayout: previewLayout, previousComponentList: componentList, projectId: currentProjectId }),
        });
        const data = await response.json();
        if (data.success && data.data) {
          applyGenerationResult(data.data as GenerationResult);
          if (authUser?.id) refreshProjects(authUser.id);
          const assistantMsg: ChatMessage = { id: `assistant-${Date.now()}`, role: 'assistant', content: (data.data as GenerationResult).explanation.explanation, timestamp: new Date().toISOString(), generationResult: data.data };
          setMessages(prev => [...prev, assistantMsg]);
        } else throw new Error(data.error || 'Modification failed');
      } else {
        // ── COMPONENT/LAYOUT GENERATION MODE ──
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: message, userId: authUser?.id }),
        });
        const data = await response.json();
        if (data.success && data.data) {
          const result = data.data as GenerationResult;
          applyGenerationResult(result);
          if (authUser?.id) refreshProjects(authUser.id);
          const assistantMsg: ChatMessage = { id: `assistant-${Date.now()}`, role: 'assistant', content: result.explanation.explanation, timestamp: new Date().toISOString(), generationResult: result };
          setMessages(prev => [...prev, assistantMsg]);
          setActiveTab('preview');
        } else throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      const errorMsg: ChatMessage = { id: `error-${Date.now()}`, role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'Generation failed. Please try again.'}`, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [currentCode, currentHtml, currentVersion, applyGenerationResult, applyHtmlResult, previewLayout, componentList, authUser?.id, refreshProjects, currentProjectId, currentTitle]);

  const handleRollback = useCallback(async (targetVersion: number) => {
    const version = versions.find(v => v.version === targetVersion);
    if (!version) return;
    setCurrentCode(version.code);
    setCurrentHtml('');
    setOutputMode('tsx');
    setPreviewComponents(version.plan.components);
    setPreviewLayout(version.plan.layout);
    setCurrentVersion(version.version);
    setPreviewError(undefined);
    setShowVersionHistory(false);
    setMessages(prev => [...prev, { id: `system-${Date.now()}`, role: 'assistant', content: `Rolled back to version ${targetVersion}. Original prompt: "${version.prompt}"`, timestamp: new Date().toISOString() }]);
  }, [versions]);

  const handleRegenerate = useCallback(async () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;
    setCurrentCode('');
    setCurrentHtml('');
    setCurrentVersion(null);
    handleSendMessage(lastUserMsg.content);
  }, [messages, handleSendMessage]);

  const handleClear = useCallback(() => {
    setMessages([]);
    setCurrentCode('');
    setCurrentHtml('');
    setOutputMode('tsx');
    setComponentList([]);
    setPreviewComponents([]);
    setPreviewLayout('single-column');
    setCurrentVersion(null);
    setVersions([]);
    setPreviewError(undefined);
    setCurrentTitle('');
    setCurrentProjectId(null);
    setProjectFiles([]);
  }, []);

  const hasOutput = !!(currentCode || currentHtml);
  const showLanding = !authUser && !hasOutput && messages.length === 0;

  const handleOpenProject = useCallback(async (projectId: string) => {
    if (!authUser?.id) return;
    setProjectError('');
    setIsProjectBusy(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: { 'x-user-id': authUser.id },
      });
      const project = await response.json();
      if (!response.ok) throw new Error(project.error || 'Failed to open project');

      const versionsFromDb = [...(project.versions || [])].sort((a, b) => a.versionNumber - b.versionNumber);
      const latest = versionsFromDb[versionsFromDb.length - 1];
      if (!latest?.frontendCode) throw new Error('This project has no generated code yet');

      const backendSpec = parseJson<{
        outputMode?: string;
        title?: string;
        plan?: GenerationResult['plan'];
        explanation?: GenerationResult['explanation'];
        prompt?: string;
        files?: ProjectFile[];
      }>(latest.backendSpec, {});

      const isHtml = backendSpec.outputMode === 'html' || latest.frontendCode.trim().startsWith('<!DOCTYPE html');
      setCurrentProjectId(project.id);
      setCurrentTitle(project.name);
      setCurrentVersion(latest.versionNumber);
      setPreviewError(undefined);
      setProjectFiles(backendSpec.files || []);

      if (isHtml) {
        setCurrentHtml(latest.frontendCode);
        setCurrentCode('');
        setOutputMode('html');
        setPreviewComponents([]);
        setPreviewLayout('single-column');
      } else {
        setCurrentCode(latest.frontendCode);
        setCurrentHtml('');
        setOutputMode('nextjs');
        setPreviewComponents(backendSpec.plan?.components || []);
        setPreviewLayout(backendSpec.plan?.layout || 'single-column');
        writePreviewFile(latest.frontendCode);
      }

      versionCounterRef.current = latest.versionNumber;
      setVersions(versionsFromDb.map((version) => {
        const spec = parseJson<{
          plan?: GenerationResult['plan'];
          explanation?: GenerationResult['explanation'];
          prompt?: string;
        }>(version.backendSpec, {});

        return {
          version: version.versionNumber,
          code: version.frontendCode || '',
          prompt: spec.prompt || project.description || project.name,
          plan: spec.plan || emptyPlan(),
          explanation: spec.explanation || emptyExplanation(),
          timestamp: version.createdAt,
        };
      }));
      setMessages([
        {
          id: `loaded-${Date.now()}`,
          role: 'assistant',
          content: `Opened "${project.name}". Ask for changes and I will modify this saved project.`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setActiveTab('preview');
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : 'Failed to open project');
    } finally {
      setIsProjectBusy(false);
    }
  }, [authUser?.id, writePreviewFile]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (!authUser?.id) return;
    setProjectError('');
    setIsProjectBusy(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': authUser.id },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete project');
      if (currentProjectId === projectId) handleClear();
      refreshProjects(authUser.id);
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : 'Failed to delete project');
    } finally {
      setIsProjectBusy(false);
    }
  }, [authUser?.id, currentProjectId, handleClear, refreshProjects]);

  return (
    <div className={styles.appContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarBrand}>
          <Sparkles size={18} className={styles.topBarIcon} />
          SimplyUI
          <span className={styles.topBarBrandSub}>Describe it. Build it.</span>
        </div>
        <div className={styles.topBarActions}>
          {currentVersion !== null && (
            <span className={styles.versionTag}>v{currentVersion}</span>
          )}
          {currentProjectId && (
            <span className={styles.versionTag}><Save size={11} /> Saved</span>
          )}
          {currentProjectId && (
            <a className={styles.topBarButton} href={`/api/projects/${currentProjectId}/download`}>
              <Download size={13} /> ZIP
            </a>
          )}
          {authUser && (
            <span className={styles.projectTag}>{savedProjects.length} projects</span>
          )}
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
          {hasOutput && (
            <button className={styles.topBarButton} onClick={handleRegenerate} disabled={isLoading} id="regenerate-button">
              <RotateCcw size={13} /> Regenerate
            </button>
          )}
          <button className={`${styles.topBarButton} ${styles.topBarButtonDanger}`} onClick={handleClear} id="clear-button">
            <Trash2 size={13} /> Clear
          </button>
          {authUser ? (
            <button className={styles.topBarButton} onClick={handleLogout} id="logout-button" title={authUser.email}>
              <LogOut size={13} /> {authUser.name || authUser.email.split('@')[0]}
            </button>
          ) : (
            <button className={styles.topBarButton} onClick={() => setShowAuth((open) => !open)} id="auth-button">
              <User size={13} /> Login
            </button>
          )}
        </div>
      </div>

      {showAuth && !authUser && (
        <div className={styles.authPopover}>
          <div className={styles.authModeSwitch}>
            <button
              className={`${styles.authModeButton} ${authMode === 'login' ? styles.authModeActive : ''}`}
              onClick={() => setAuthMode('login')}
              type="button"
            >
              Login
            </button>
            <button
              className={`${styles.authModeButton} ${authMode === 'signup' ? styles.authModeActive : ''}`}
              onClick={() => setAuthMode('signup')}
              type="button"
            >
              Sign up
            </button>
          </div>
          <form className={styles.authForm} onSubmit={handleAuthSubmit}>
            {authMode === 'signup' && (
              <input
                className={styles.authInput}
                value={authName}
                onChange={(event) => setAuthName(event.target.value)}
                placeholder="Name"
                autoComplete="name"
              />
            )}
            <input
              className={styles.authInput}
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="Email"
              type="email"
              autoComplete="email"
              required
            />
            <input
              className={styles.authInput}
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              placeholder="Password"
              type="password"
              autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              required
            />
            {authError && <div className={styles.authError}>{authError}</div>}
            <button className={styles.authSubmit} disabled={authLoading} type="submit">
              {authLoading ? 'Please wait...' : authMode === 'signup' ? 'Create account' : 'Login'}
            </button>
          </form>
        </div>
      )}

      {showLanding ? (
        <main className={styles.homepage}>
          <section className={styles.heroSection}>
            <div className={styles.heroCopy}>
              <div className={styles.heroBadge}><Sparkles size={14} /> AI UI community platform</div>
              <h1>Build, save, remix, and ship interfaces from one living studio.</h1>
              <p>
                SimplyUI is becoming a place where creators generate complete apps, keep every project in their workspace,
                modify them with AI, download production folders, and soon push straight to GitHub.
              </p>
              <div className={styles.heroActions}>
                <button className={styles.primaryCta} onClick={() => { setAuthMode('signup'); setShowAuth(true); }}>
                  <Rocket size={16} /> Start building
                </button>
                <button className={styles.secondaryCta} onClick={() => { setAuthMode('login'); setShowAuth(true); }}>
                  <User size={16} /> Login
                </button>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.commandPanel}>
                <div className={styles.commandHeader}>
                  <span />
                  <span />
                  <span />
                  <strong>community/studio</strong>
                </div>
                <div className={styles.commandLine}><Zap size={14} /> Generate SaaS dashboard with auth, billing, charts</div>
                <div className={styles.commandGrid}>
                  <div><strong>Project DB</strong><span>Saved versions</span></div>
                  <div><strong>ZIP Export</strong><span>Folder structure</span></div>
                  <div><strong>AI Modify</strong><span>Iterative edits</span></div>
                  <div><strong>GitHub Next</strong><span>Push pipeline</span></div>
                </div>
              </div>
            </div>
          </section>
          <section className={styles.communityStrip}>
            <div><Users size={18} /><strong>Community-ready</strong><span>Profiles, project galleries, remixing roadmap.</span></div>
            <div><ShieldCheck size={18} /><strong>Private workspace</strong><span>Users own generated projects and history.</span></div>
            <div><Github size={18} /><strong>GitHub pipeline</strong><span>Repo push hooks are planned into the product direction.</span></div>
          </section>
        </main>
      ) : (
        <div className={styles.mainContent}>
          {authUser && (
            <aside className={styles.projectRail}>
              <div className={styles.railHeader}>
                <div>
                  <span>Your workspace</span>
                  <strong>{savedProjects.length} projects</strong>
                </div>
                <button className={styles.iconButton} onClick={() => refreshProjects(authUser.id)} disabled={isProjectBusy}>
                  <RotateCcw size={14} />
                </button>
              </div>
              {projectError && <div className={styles.projectError}>{projectError}</div>}
              <div className={styles.projectList}>
                {savedProjects.length === 0 ? (
                  <div className={styles.projectEmpty}>Generate something and it will live here.</div>
                ) : savedProjects.map((project) => (
                  <article className={`${styles.projectItem} ${currentProjectId === project.id ? styles.projectItemActive : ''}`} key={project.id}>
                    <button className={styles.projectOpen} onClick={() => handleOpenProject(project.id)} disabled={isProjectBusy}>
                      <FolderOpen size={15} />
                      <span>
                        <strong>{project.name}</strong>
                        <small>{project.versions?.[0]?.versionNumber ? `v${project.versions[0].versionNumber}` : 'No version'} · {new Date(project.updatedAt).toLocaleDateString()}</small>
                      </span>
                    </button>
                    <div className={styles.projectActions}>
                      <a className={styles.iconButton} href={`/api/projects/${project.id}/download`} title="Download ZIP">
                        <Download size={13} />
                      </a>
                      <button className={`${styles.iconButton} ${styles.iconButtonDanger}`} onClick={() => handleDeleteProject(project.id)} disabled={isProjectBusy} title="Delete project">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </aside>
          )}

          {/* Left: Chat Panel */}
          <div className={styles.leftPanel}>
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              onLoadTemplate={handleLoadTemplate}
              isLoading={isLoading}
              hasCode={hasOutput}
            />
          </div>

          {/* Right: Code + Preview */}
          <div className={styles.rightArea}>
          {/* Tab Bar */}
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

          {/* Tab Content */}
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
      )}

      {/* Version History Modal */}
      <VersionHistory
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        versions={versions}
        currentVersion={currentVersion}
        onRollback={handleRollback}
      />
    </div>
  );
}
