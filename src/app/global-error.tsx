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
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          color: '#f0f2f5',
          fontFamily: "'Inter', system-ui, sans-serif",
          padding: 24,
          textAlign: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.06))',
            border: '1px solid rgba(239,68,68,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem',
          }}>!</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#8b96a5', maxWidth: 400, lineHeight: 1.6, fontSize: '0.85rem' }}>
            {error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 24px', borderRadius: 9999, fontSize: '0.85rem', fontWeight: 600,
              border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', cursor: 'pointer', marginTop: 8,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
