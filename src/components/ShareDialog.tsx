'use client'

import { useState } from 'react'
import { Share2, Check, X, Loader } from 'lucide-react'

interface ShareDialogProps {
  code: string
  title: string
  userId: string
  userName: string
  componentList: string[]
  outputMode: string
}

export function ShareDialog({ code, title, userId, userName, componentList, outputMode }: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [shareTitle, setShareTitle] = useState(title || 'My Component')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleShare = async () => {
    if (!code || saving) return
    setSaving(true)
    setError('')

    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          title: shareTitle || 'Untitled',
          description: description || null,
          code,
          layout: outputMode === 'html' ? 'full-width' : 'single-column',
          componentList,
          tags: tagList.length > 0 ? tagList : ['ui', outputMode],
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Share failed')

      setDone(true)
      setTimeout(() => { setOpen(false); setDone(false) }, 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to share')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button className="topBarButton" onClick={() => setOpen(true)} id="share-button" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '6px 14px', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '9999px', background: 'transparent',
        color: '#8b96a5', fontSize: '0.73rem', fontWeight: 500,
        fontFamily: "'Inter', system-ui, sans-serif", cursor: 'pointer',
        whiteSpace: 'nowrap', transition: 'all 150ms',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f0f2f5'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b96a5'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
      >
        <Share2 size={13} /> Share
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }} onClick={() => !saving && setOpen(false)}>
      <div style={{
        width: 'min(440px, calc(100vw - 32px))',
        background: '#0c0e12', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px', padding: '28px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={16} style={{ color: '#10b981' }} /> Share to Community
          </h3>
          <button onClick={() => setOpen(false)} style={{
            background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', padding: '4px',
          }}><X size={16} /></button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Check size={24} style={{ color: '#10b981' }} />
            </div>
            <p style={{ color: '#34d399', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
              Shared to community!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '5px' }}>Title</label>
              <input value={shareTitle} onChange={(e) => setShareTitle(e.target.value)}
                placeholder="My Awesome Component"
                style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '5px' }}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this component do?"
                rows={2} style={{ ...inputStyle, resize: 'vertical', paddingTop: '10px', height: 'auto', minHeight: '60px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '5px' }}>Tags (comma-separated)</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)}
                placeholder="dashboard, charts, dark-mode"
                style={inputStyle} />
            </div>
            {error && (
              <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.78rem' }}>
                {error}
              </div>
            )}
            <button onClick={handleShare} disabled={saving || !shareTitle.trim()} style={{
              height: '42px', border: 'none', borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white', fontSize: '0.85rem', fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving || !shareTitle.trim() ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: "'Inter', system-ui, sans-serif",
              boxShadow: '0 0 20px rgba(16,185,129,0.15)',
            }}>
              {saving ? <><Loader size={16} style={{ animation: 'spin 0.6s linear infinite' }} /> Sharing...</> : <><Share2 size={16} /> Share to Community</>}
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: '38px', padding: '0 12px',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)', color: '#f0f2f5',
  fontSize: '0.82rem', fontWeight: 500, outline: 'none',
  fontFamily: "'Inter', system-ui, sans-serif", boxSizing: 'border-box',
}
