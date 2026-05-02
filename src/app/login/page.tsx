'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '@/styles/components/appLayout.module.css'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.authPage}>
      <form className={styles.authCard} onSubmit={submit}>
        <Link className={styles.authBrand} href="/">
          <Sparkles size={18} /> SimplyUI
        </Link>
        <h1>Welcome back</h1>
        <p>Open your workspace, keep modifying projects, and prepare them for the community gallery.</p>
        <input className={styles.authInput} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" required />
        <input className={styles.authInput} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" required />
        {error && <div className={styles.authError}>{error}</div>}
        <button className={styles.authSubmit} disabled={loading} type="submit">{loading ? 'Opening...' : 'Login'}</button>
        <span className={styles.authSwitch}>New here? <Link href="/signup">Create an account</Link></span>
      </form>
    </main>
  )
}
