'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles, Plus, FolderOpen, Trash2, Download,
  LogOut, ArrowRight, Clock, User, Rocket, Loader2
} from 'lucide-react'

type SavedProject = {
  id: string
  name: string
  description?: string | null
  updatedAt: string
  techStack?: string
  versions?: { versionNumber: number; createdAt: string }[]
}

type AuthUser = { id: string; email: string; name?: string | null }

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [projects, setProjects] = useState<SavedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const stored = window.localStorage.getItem('simplyui:user')
    if (!stored) {
      router.push('/login')
      return
    }
    try {
      const u = JSON.parse(stored)
      setUser(u)
      fetchProjects(u.id)
    } catch {
      window.localStorage.removeItem('simplyui:user')
      router.push('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchProjects(userId: string) {
    try {
      const res = await fetch(`/api/projects`, {
        headers: { 'x-user-id': userId },
      })
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (e) {
      console.warn('Failed to load projects:', e)
    } finally {
      setLoading(false)
    }
  }

  async function createProject() {
    if (!user || !newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim() || undefined,
        }),
      })
      const project = await res.json()
      if (res.ok) {
        router.push(`/workspace/${project.id}`)
      } else {
        alert(project.error || 'Failed to create project')
      }
    } catch {
      alert('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = useCallback(async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user || !confirm('Delete this project permanently?')) return
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id },
      })
      setProjects(p => p.filter(pr => pr.id !== projectId))
    } catch {
      alert('Failed to delete project')
    }
  }, [user])

  function handleLogout() {
    window.localStorage.removeItem('simplyui:user')
    router.push('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090b',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#f0f2f5',
    }}>
      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(9,9,11,0.85)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#f0f2f5', fontWeight: 700, fontSize: '1rem' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(16,185,129,0.25)',
          }}>
            <Sparkles size={14} color="white" />
          </div>
          SimplyUI
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/community" style={{
            padding: '6px 14px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 500,
            color: '#8b96a5', textDecoration: 'none',
          }}>Community</Link>
          {user && (
            <>
              <span style={{ fontSize: '0.78rem', color: '#4a5568' }}>{user.name || user.email}</span>
              <button onClick={handleLogout} style={{
                padding: '6px 12px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'transparent', color: '#8b96a5', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <LogOut size={12} /> Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* HEADER */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 36, flexWrap: 'wrap', gap: 16,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
              Your projects
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          <button onClick={() => setShowNewProject(true)} style={{
            padding: '10px 24px', borderRadius: 9999, fontSize: '0.85rem', fontWeight: 700,
            border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 0 20px rgba(16,185,129,0.15)',
          }}>
            <Plus size={16} /> New project
          </button>
        </div>

        {/* NEW PROJECT DIALOG */}
        {showNewProject && (
          <div style={{
            marginBottom: 32, padding: 24, borderRadius: 16,
            border: '1px solid rgba(16,185,129,0.2)',
            background: 'rgba(16,185,129,0.04)',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Create new project</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Project name"
                autoFocus
                style={{
                  width: '100%', height: 44, padding: '0 14px',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', color: '#f0f2f5',
                  fontSize: '0.88rem', outline: 'none',
                }}
                onKeyDown={e => { if (e.key === 'Enter') createProject() }}
              />
              <input
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                style={{
                  width: '100%', height: 44, padding: '0 14px',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', color: '#f0f2f5',
                  fontSize: '0.88rem', outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowNewProject(false); setNewName(''); setNewDesc('') }} style={{
                  padding: '8px 16px', borderRadius: 9999, fontSize: '0.8rem', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'transparent', color: '#8b96a5', cursor: 'pointer',
                }}>
                  Cancel
                </button>
                <button onClick={createProject} disabled={creating || !newName.trim()} style={{
                  padding: '8px 20px', borderRadius: 9999, fontSize: '0.8rem', fontWeight: 700,
                  border: 'none', background: !newName.trim() ? '#1a2e26' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: !newName.trim() ? '#4a5568' : 'white', cursor: !newName.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {creating ? <><Loader2 size={14} /> Creating...</> : <><Plus size={14} /> Create</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PROJECT GRID */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: '#4a5568' }}>
            <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 20,
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚀</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>No projects yet</h3>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: 24 }}>
              Create your first project and start building with AI.
            </p>
            <button onClick={() => setShowNewProject(true)} style={{
              padding: '10px 24px', borderRadius: 9999, fontSize: '0.85rem', fontWeight: 700,
              border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <Plus size={16} /> Create your first project
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {projects.map((project, i) => (
              <div key={project.id} onClick={() => router.push(`/workspace/${project.id}`)} style={{
                padding: 20, borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 0.04}s`,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'; e.currentTarget.style.background = 'rgba(16,185,129,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontSize: '1.3rem' }}>
                    {project.name.includes('SaaS') ? '⚡' : project.name.includes('Store') ? '🛒' : project.name.includes('Blog') ? '📝' : project.name.includes('Dash') ? '📊' : '📁'}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <a href={`/api/projects/${project.id}/download`} onClick={e => e.stopPropagation()} style={{
                      padding: 6, borderRadius: 8, border: 'none',
                      background: 'rgba(255,255,255,0.04)', color: '#6b7280', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Download size={13} />
                    </a>
                    <button onClick={(e) => handleDelete(project.id, e)} style={{
                      padding: 6, borderRadius: 8, border: 'none',
                      background: 'rgba(255,255,255,0.04)', color: '#6b7280', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 4 }}>{project.name}</h3>
                {project.description && (
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 12, lineHeight: 1.5 }}>
                    {project.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: '#4a5568' }}>
                  <Clock size={12} />
                  {new Date(project.updatedAt).toLocaleDateString()}
                  {project.versions?.[0] && (
                    <>
                      <span>·</span>
                      <span>v{project.versions[0].versionNumber}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
