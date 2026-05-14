'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Sparkles, Heart, ArrowLeft, MessageCircle, Code2, Copy, Check, Clock, User } from 'lucide-react'

interface ComponentDetail {
  id: string
  title: string
  description: string | null
  code: string
  userName: string | null
  layout: string
  componentList: string[]
  tags: string[]
  likes: number
  comments: { id: string; userName: string | null; content: string; createdAt: string }[]
  createdAt: string
}

export default function CommunityDetailPage() {
  const params = useParams()
  const [component, setComponent] = useState<ComponentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/community/${params.id}`)
        const data = await res.json()
        if (data.success) setComponent(data.data)
        else setError(data.error || 'Not found')
      } catch {
        setError('Failed to load component')
      } finally {
        setLoading(false)
      }
    }
    if (params.id) load()
  }, [params.id])

  const handleLike = async () => {
    if (!component || liked) return
    try {
      await fetch(`/api/community/${component.id}`, { method: 'POST' })
      setComponent({ ...component, likes: component.likes + 1 })
      setLiked(true)
    } catch {}
  }

  const handleCopy = async () => {
    if (!component) return
    try {
      await navigator.clipboard.writeText(component.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      </div>
    )
  }

  if (error || !component) {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
          <p>{error || 'Component not found'}</p>
          <Link href="/community" style={{ color: '#10b981', textDecoration: 'none', fontSize: '0.85rem' }}>Back to gallery</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090b',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#f0f2f5',
    }}>
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '32px 24px',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.4s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <Link href="/community" style={{
            display: 'flex', alignItems: 'center', gap: '6px', color: '#4a5568',
            textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600,
            padding: '8px 14px', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px', transition: 'all 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#f0f2f5' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#4a5568' }}
          >
            <ArrowLeft size={14} /> Gallery
          </Link>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: '6px', color: '#4a5568',
            textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600,
            padding: '8px 14px', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px', transition: 'all 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#f0f2f5' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#4a5568' }}
          >
            <Sparkles size={14} /> Studio
          </Link>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: '32px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {component.tags.map((tag, i) => (
                  <span key={i} style={{
                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em',
                    padding: '3px 10px', borderRadius: '6px',
                    background: 'rgba(16,185,129,0.08)', color: '#34d399',
                    textTransform: 'uppercase',
                  }}>{tag}</span>
                ))}
                <span style={{
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em',
                  padding: '3px 10px', borderRadius: '6px',
                  background: 'rgba(59,130,246,0.08)', color: '#93c5fd',
                  textTransform: 'uppercase',
                }}>{component.layout}</span>
              </div>
              <h1 style={{
                fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em',
                margin: 0,
                background: 'linear-gradient(135deg, #f0f2f5 0%, #10b981 60%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{component.title}</h1>
              {component.description && (
                <p style={{ color: '#8b96a5', fontSize: '0.88rem', lineHeight: 1.6, margin: '8px 0 0', maxWidth: '500px' }}>
                  {component.description}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleLike} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px', background: liked ? 'rgba(239,68,68,0.1)' : 'transparent',
                color: liked ? '#fca5a5' : '#6b7280', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif",
                transition: 'all 0.2s',
              }}>
                <Heart size={14} fill={liked ? '#fca5a5' : 'none'} /> {component.likes}
              </button>
              <button onClick={handleCopy} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px', background: copied ? 'rgba(16,185,129,0.1)' : 'transparent',
                color: copied ? '#34d399' : '#6b7280', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif",
                transition: 'all 0.2s',
              }}>
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Code</>}
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px',
            fontSize: '0.75rem', color: '#4a5568',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={13} /> {component.userName || 'Anonymous'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> {new Date(component.createdAt).toLocaleDateString()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Code2 size={13} /> {component.componentList.join(', ')}
            </span>
          </div>

          <div style={{
            position: 'relative',
            background: '#0a0c10',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#475569' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#475569' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#475569' }} />
              <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#4a5568', fontFamily: "'JetBrains Mono', monospace" }}>
                GeneratedUI.tsx
              </span>
            </div>
            <pre style={{
              margin: 0, padding: '20px', overflow: 'auto',
              fontSize: '0.78rem', lineHeight: 1.6,
              color: '#d1d5db', fontFamily: "'JetBrains Mono', monospace",
              maxHeight: '500px',
            }}>{component.code}</pre>
          </div>

          {component.comments.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageCircle size={14} /> Comments ({component.comments.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {component.comments.map((comment) => (
                  <div key={comment.id} style={{
                    padding: '14px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#f0f2f5' }}>
                        {comment.userName || 'Anonymous'}
                      </span>
                      <span style={{ color: '#4a5568', fontSize: '0.68rem' }}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ color: '#a0aab4', fontSize: '0.82rem', lineHeight: 1.55, margin: 0 }}>
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
