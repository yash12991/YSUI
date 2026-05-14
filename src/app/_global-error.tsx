'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', background: '#09090b', color: '#f0f2f5' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px' }}>
            <h1 style={{ fontSize: '1.5rem', margin: '0 0 12px', color: '#ef4444' }}>Something went wrong</h1>
            <p style={{ color: '#8b96a5', margin: '0 0 24px', fontSize: '0.9rem' }}>
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '10px 20px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
