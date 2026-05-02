'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '@/styles/components/appLayout.module.css'
import { Sparkles } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Signup failed')

      window.localStorage.setItem('simplyui:user', JSON.stringify(data.user))
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
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
        <h1>Create your studio</h1>
        <p>Save generated projects, reopen them later, modify with AI, and build toward a shareable UI community.</p>
        <input className={styles.authInput} value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" autoComplete="name" />
        <input className={styles.authInput} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" required />
        <input className={styles.authInput} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" required />
        {error && <div className={styles.authError}>{error}</div>}
        <button className={styles.authSubmit} disabled={loading} type="submit">{loading ? 'Creating...' : 'Create account'}</button>
        <span className={styles.authSwitch}>Already building? <Link href="/login">Login</Link></span>
      </form>
    </main>
  )
}
