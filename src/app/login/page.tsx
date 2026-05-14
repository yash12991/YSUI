'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Eye, EyeOff, Mail, Lock, ArrowRight, Github, Globe } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const ctx2d = ctx as CanvasRenderingContext2D

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = []
    const count = 60

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.1,
      })
    }

    let animId: number
    function animate() {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx2d.beginPath()
        ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx2d.fillStyle = `rgba(16, 185, 129, ${p.alpha})`
        ctx2d.fill()
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx2d.beginPath()
            ctx2d.moveTo(particles[i].x, particles[i].y)
            ctx2d.lineTo(particles[j].x, particles[j].y)
            ctx2d.strokeStyle = `rgba(16, 185, 129, ${0.06 * (1 - dist / 120)})`
            ctx2d.lineWidth = 0.5
            ctx2d.stroke()
          }
        }
      }
      animId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')

      window.localStorage.setItem('simplyui:user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      background: '#09090b',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      <div style={{
        position: 'fixed',
        top: '15%',
        left: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        borderRadius: '50%',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        borderRadius: '50%',
        zIndex: 0,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '40px', textDecoration: 'none', color: '#f0f2f5', fontWeight: 700, fontSize: '1.1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(16,185,129,0.3)',
              }}>
                <Sparkles size={18} color="white" />
              </div>
              SimplyUI
            </Link>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: '36px 32px',
              backdropFilter: 'blur(20px)',
            }}>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #f0f2f5 0%, #10b981 60%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 6px',
              }}>
                Welcome back
              </h1>
              <p style={{ color: '#8b96a5', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 28px' }}>
                Sign in to your studio to continue building, remixing, and shipping.
              </p>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4a5568', pointerEvents: 'none' }} />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      type="email"
                      required
                      autoComplete="email"
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 14px 0 42px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#f0f2f5',
                        fontSize: '0.88rem',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontWeight: 500,
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(16,185,129,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.08)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4a5568', pointerEvents: 'none' }} />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 42px 0 42px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#f0f2f5',
                        fontSize: '0.88rem',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontWeight: 500,
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(16,185,129,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.08)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#4a5568',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#fca5a5',
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    height: '48px',
                    border: 'none',
                    borderRadius: '14px',
                    background: loading ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1,
                    boxShadow: '0 0 24px rgba(16,185,129,0.2)',
                  }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(16,185,129,0.3)' } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 24px rgba(16,185,129,0.2)' }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div style={{ position: 'relative', textAlign: 'center', margin: '4px 0' }}>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
                  <span style={{ position: 'relative', background: 'rgba(12,14,18,0.96)', padding: '0 12px', color: '#4a5568', fontSize: '0.74rem' }}>or continue with</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button type="button" style={{
                    height: '42px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#f0f2f5',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    <Github size={16} /> GitHub
                  </button>
                  <button type="button" style={{
                    height: '42px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#f0f2f5',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    <Globe size={16} /> Google
                  </button>
                </div>
              </form>
            </div>

            <p style={{ textAlign: 'center', color: '#4a5568', fontSize: '0.82rem', marginTop: '24px' }}>
              New here?{' '}
              <Link href="/signup" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
                Create an account <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </Link>
            </p>
          </div>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(5,150,105,0.02) 50%, rgba(13,148,136,0.04) 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'relative',
            zIndex: 1,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateX(0)' : 'translateX(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '24px',
              padding: '36px',
              maxWidth: '420px',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚀</div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#f0f2f5',
                margin: '0 0 10px',
              }}>
                Your Studio Awaits
              </h2>
              <p style={{ color: '#8b96a5', fontSize: '0.85rem', lineHeight: 1.7, margin: '0 0 20px' }}>
                Every project you build stays in your private workspace — saved, versioned, and ready to remix with AI.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: '💾', title: 'Auto-saved versions', desc: 'Never lose a change. Every generation is a new version.' },
                  { icon: '🤖', title: 'AI-powered editing', desc: 'Describe changes and watch your UI transform instantly.' },
                  { icon: '📦', title: 'Download as ZIP', desc: 'Export production-ready projects with full folder structure.' },
                  { icon: '🌐', title: 'Community gallery', desc: 'Share your best UIs and remix what others have built.' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>{item.icon}</span>
                    <div>
                      <div style={{ color: '#f0f2f5', fontWeight: 600, fontSize: '0.82rem' }}>{item.title}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hide the second panel on mobile */}
      <style>{`
        @media (max-width: 860px) {
          div > div:last-child {
            display: none !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
