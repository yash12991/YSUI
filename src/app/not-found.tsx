export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>404 — Page Not Found</h1>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>Sorry, we couldn’t find that page.</p>
      </div>
    </div>
  )
}
