import { useState } from "react"
import { register } from "../api/auth"
import { useAuth } from "../context/AuthContext"

// TYpes

type Role = 'MEDIC' | 'ASISTENT' | 'REGISTRATOR'


export default function Register() {
  const { setUser } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<Role>('REGISTRATOR')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { user, accessToken } = await register({ name, email, password , role })
      localStorage.setItem('token', accessToken)
      setUser(user as any)
      window.location.href = '/lab_requests'
    } catch (err: any) {
      setError(err?.message ?? 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg p-6 space-y-5">
          <h1 className="text-2xl font-semibold text-slate-100">Inregistreaza un nou cont</h1>
          <form onSubmit={onSubmit} className="space-y-3">
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Numele Angajatului" 
              required 
              minLength={8}
              className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30" 
            />
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" 
              type="email" 
              required 
              className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              type="password" 
              required 
              minLength={8} 
              className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option value="REGISTRATOR">REGISTRATOR</option>
              <option value="ASISTENT">ASISTENT</option>
              <option value="MEDIC">MEDIC</option>
            </select><br />




            <button disabled={loading} type="submit" className="h-10 w-full rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 border border-slate-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30">{loading ? '...' : 'Create account'}</button>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
          </form>
          <p className="text-sm text-slate-400"><a href="/login" className="text-slate-100 hover:text-blue-300 underline underline-offset-4 decoration-slate-700 hover:decoration-blue-400">Deja am cont!</a></p>
        </div>
    </div>
  )
}