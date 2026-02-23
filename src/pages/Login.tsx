import { useState } from 'react'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { saveToken } from '../auth'

export default function Login() {
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { user, accessToken } = await login({ email, password })
      saveToken(accessToken)
      setUser(user)
      navigate('/lab_requests', { replace: true })
    } catch (err: any) {
      setError(err?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-5">
        <h1 className="text-2xl font-semibold text-slate-100">Login</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            required
                />
          <input
           value={password} 
           onChange={(e) => setPassword(e.target.value)} 
           placeholder="Password" 
           type="password" 
           required 
           minLength={6} 
           className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
           />
          <button
           disabled={loading} 
           type="submit"
           className="h-10 w-full rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 border border-slate-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30"
           >
            {loading ? '...' : 'Login'}</button>
          {error && <p style={{ color: 'crimson' }}>{error}</p>}
        </form>
        <p className="text-sm text-slate-400"><a href="/register" className="text-slate-100 hover:text-blue-300 underline underline-offset-4 decoration-slate-700 hover:decoration-blue-400">Create account</a></p>
      </div>
    </div>
  )
}