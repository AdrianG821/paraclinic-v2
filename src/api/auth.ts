import api from '../api/axios'

export async function register(p: { name: string; email: string; password: string ; role: string}) {
  const { data } = await api.post<{ user: any; accessToken: string }>('/api/v1/auth/register', p)
  return data
}
export async function login(p: { email: string; password: string }) {
  const { data } = await api.post<{ user: any; accessToken: string }>('/api/v1/auth/login', p)
  return data
}
export async function me() {
  const { data } = await api.get('/api/v1/auth/me')
  return data
}
