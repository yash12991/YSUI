'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles, Zap, Users, ShieldCheck, Github,
  ArrowRight, Code2, Eye, Download, Layers, Rocket
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null)

  useEffect(() => {
    setMounted(true)
    const stored = window.localStorage.getItem('simplyui:user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  const features = [
    { icon: <Zap size={20} />, title: 'AI-Powered Generation', desc: 'Describe what you want in plain English. SimplyUI generates production-ready React/TSX code instantly.' },
    { icon: <Layers size={20} />, title: 'Version Control Built-in', desc: 'Every generation is a new version. Roll back, restore, or fork any point in your project history.' },
    { icon: <Users size={20} />, title: 'Community Gallery', desc: 'Share your UIs, remix what others built, and get inspired by the community.' },
    { icon: <Code2 size={20} />, title: 'Live Preview', desc: 'See your UI come to life instantly with hot-reloading preview. No refresh needed.' },
    { icon: <Download size={20} />, title: 'ZIP Export', desc: 'Download production-ready projects with full folder structure. Ready to deploy.' },
    { icon: <ShieldCheck size={20} />, title: 'Private Workspace', desc: 'Your projects stay private. Auto-saved, versioned, and accessible only to you.' },
  ]

  const steps = [
    { num: '1', title: 'Describe', desc: 'Tell SimplyUI what you want to build in plain English.' },
    { num: '2', title: 'Generate', desc: 'AI creates production-ready code with live preview.' },
    { num: '3', title: 'Iterate', desc: 'Refine with natural language. Every change is a new version.' },
    { num: '4', title: 'Export', desc: 'Download as ZIP or share with the community.' },
  ]

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
        padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(9,9,11,0.8)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#f0f2f5', fontWeight: 700, fontSize: '1.05rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(16,185,129,0.3)',
          }}>
            <Sparkles size={16} color="white" />
          </div>
          SimplyUI
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/community" style={{
            padding: '8px 16px', borderRadius: 9999, fontSize: '0.82rem', fontWeight: 500,
            color: '#8b96a5', textDecoration: 'none', transition: 'color 0.2s',
          }}>Community</Link>
          {user ? (
            <button onClick={() => router.push('/dashboard')} style={{
              padding: '8px 20px', borderRadius: 9999, fontSize: '0.82rem', fontWeight: 600,
              border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', cursor: 'pointer',
              boxShadow: '0 0 16px rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              Dashboard <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <Link href="/login" style={{
                padding: '8px 16px', borderRadius: 9999, fontSize: '0.82rem', fontWeight: 500,
                color: '#8b96a5', textDecoration: 'none',
              }}>Sign in</Link>
              <Link href="/signup" style={{
                padding: '8px 20px', borderRadius: 9999, fontSize: '0.82rem', fontWeight: 600,
                border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white', textDecoration: 'none',
                boxShadow: '0 0 16px rgba(16,185,129,0.2)',
              }}>
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '80px 24px 60px', position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 9999,
            border: '1px solid rgba(16,185,129,0.2)',
            background: 'rgba(16,185,129,0.06)',
            fontSize: '0.78rem', color: '#34d399', fontWeight: 500, marginBottom: 24,
          }}>
            <Sparkles size={14} /> AI-Powered UI Studio
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1.1, maxWidth: 800, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #f0f2f5 0%, #10b981 40%, #34d399 70%, #f0f2f5 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Build, save, and remix UIs with AI
          </h1>
          <p style={{
            fontSize: '1.1rem', color: '#8b96a5', lineHeight: 1.7,
            maxWidth: 600, margin: '0 auto 36px',
          }}>
            Describe what you want in plain English. SimplyUI generates production-ready React components with live preview, version control, and one-click export.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push(user ? '/dashboard' : '/signup')} style={{
              padding: '14px 32px', borderRadius: 9999, fontSize: '0.92rem', fontWeight: 700,
              border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 30px rgba(16,185,129,0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(16,185,129,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 30px rgba(16,185,129,0.25)' }}
            >
              {user ? 'Go to Dashboard' : 'Start building'} <Rocket size={16} />
            </button>
            <Link href="/community" style={{
              padding: '14px 32px', borderRadius: 9999, fontSize: '0.92rem', fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
              color: '#f0f2f5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              Browse gallery <Eye size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', fontSize: '1.8rem', fontWeight: 800,
            letterSpacing: '-0.03em', marginBottom: 48,
          }}>
            How it works
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: 24,
                opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16,
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))',
                  border: '1px solid rgba(16,185,129,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '1.1rem', fontWeight: 800, color: '#34d399',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{step.title}</h3>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', fontSize: '1.8rem', fontWeight: 800,
            letterSpacing: '-0.03em', marginBottom: 48,
          }}>
            Everything you need
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                padding: 24, borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s',
                opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 0.05}s`,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'; e.currentTarget.style.background = 'rgba(16,185,129,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(16,185,129,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#34d399', marginBottom: 12,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800,
            letterSpacing: '-0.03em', marginBottom: 16,
          }}>
            Ready to build?
          </h2>
          <p style={{ fontSize: '1rem', color: '#8b96a5', maxWidth: 500, margin: '0 auto 32px' }}>
            Join the community. Generate UIs with AI, save your projects, and share with the world.
          </p>
          <button onClick={() => router.push(user ? '/dashboard' : '/signup')} style={{
            padding: '14px 36px', borderRadius: 9999, fontSize: '0.92rem', fontWeight: 700,
            border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white', cursor: 'pointer',
            boxShadow: '0 0 30px rgba(16,185,129,0.2)',
          }}>
            {user ? 'Go to Dashboard' : 'Create your free account'}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.78rem', color: '#4a5568', flexWrap: 'wrap', gap: 12,
      }}>
        <div>© 2026 SimplyUI. All rights reserved.</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Github size={16} style={{ opacity: 0.5 }} />
          <span>Built with Next.js + Groq AI</span>
        </div>
      </footer>
    </div>
  )
}
