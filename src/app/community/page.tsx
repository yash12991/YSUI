'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Heart, MessageCircle, Share2, ArrowLeft, Grid3X3, LayoutGrid, Search } from 'lucide-react'

interface CommunityItem {
  id: string
  title: string
  description: string | null
  userName: string | null
  layout: string
  componentList: string[]
  tags: string[]
  likes: number
  forks: number
  commentCount: number
  createdAt: string
}

export default function CommunityPage() {
  const [items, setItems] = useState<CommunityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/community')
        const data = await res.json()
        if (data.success) setItems(data.data)
        else setError(data.error || 'Failed to load')
      } catch (e) {
        setError('Failed to load community gallery')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = items.filter(item =>
    !search || item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  const layoutIcons: Record<string, string> = {
    'dashboard': '📊',
    'centered': '🎯',
    'single-column': '📄',
    'two-column': '📑',
    'sidebar-layout': '🗂️',
    'landing-page': '🚀',
    'form-page': '📝',
    'app-shell': '⚡',
    'full-width': '🖥️',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090b',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#f0f2f5',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.5s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{
              display: 'flex', alignItems: 'center', gap: '6px', color: '#4a5568',
              textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600,
              padding: '8px 14px', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px', transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#f0f2f5' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#4a5568' }}
            >
              <ArrowLeft size={14} /> Studio
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(16,185,129,0.25)',
              }}>
                <Grid3X3 size={16} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Community Gallery</h1>
                <p style={{ color: '#6b7280', fontSize: '0.72rem', margin: '2px 0 0' }}>Explore UIs built by the SimplyUI community</p>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4a5568', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components..."
              style={{
                width: '100%', height: '38px', padding: '0 14px 0 36px',
                border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)', color: '#f0f2f5',
                fontSize: '0.82rem', fontWeight: 500, outline: 'none',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(16,185,129,0.3)'; e.target.style.boxShadow = '0 0 0 2px rgba(16,185,129,0.06)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{
                height: '200px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: '#6b7280',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
            <p style={{ fontSize: '0.9rem' }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: '#6b7280',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏗️</div>
            <p style={{ fontSize: '0.9rem' }}>{search ? 'No results found' : 'No components shared yet — be the first!'}</p>
            {!search && (
              <Link href="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px',
                padding: '10px 20px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700,
                boxShadow: '0 0 20px rgba(16,185,129,0.2)',
              }}>
                <Sparkles size={16} /> Build & Share
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filtered.map(item => (
              <Link
                key={item.id}
                href={`/community/${item.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.025)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'
                    e.currentTarget.style.background = 'rgba(16,185,129,0.04)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{
                      fontSize: '1.8rem', lineHeight: 1,
                    }}>
                      {layoutIcons[item.layout] || '🧩'}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {item.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} style={{
                          fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.04em',
                          padding: '3px 8px', borderRadius: '6px',
                          background: 'rgba(16,185,129,0.08)', color: '#34d399',
                          textTransform: 'uppercase',
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: '1rem', fontWeight: 700, margin: '0 0 6px',
                    letterSpacing: '-0.02em',
                  }}>{item.title}</h3>

                  {item.description && (
                    <p style={{
                      color: '#6b7280', fontSize: '0.78rem', lineHeight: 1.55,
                      margin: '0 0 auto', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>{item.description}</p>
                  )}

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    marginTop: '16px', paddingTop: '14px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '0.72rem', color: '#4a5568',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Heart size={13} /> {item.likes}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageCircle size={13} /> {item.commentCount}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Share2 size={13} /> {item.forks}
                    </span>
                    <span style={{ marginLeft: 'auto', color: '#4a5568' }}>
                      {item.userName || 'Anonymous'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
