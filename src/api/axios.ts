import axios, { isAxiosError, type InternalAxiosRequestConfig, type AxiosHeaders } from 'axios'
import { getToken, clearToken } from '../auth'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 20000,
  withCredentials: false,
})

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    const h = cfg.headers as AxiosHeaders | Record<string, string>
    if (typeof (h as any).set === 'function') {
      ;(h as any).set('Authorization', `Bearer ${token}`)
    } else {
      cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` } as any
    }
  }

  // log util doar pentru auth endpoints
  if (cfg.url?.includes('/api/v1/auth')) {
    const ah = (cfg.headers as any)?.Authorization ?? (cfg.headers as any)?.authorization
    console.log('[REQ]', (api.defaults.baseURL || '') + (cfg.url || ''), 'Auth?', !!ah)
  }

  return cfg
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (isAxiosError(err)) {
      const status = err.response?.status
      if (status === 401) {
        // token invalid/expirat → curățăm și ducem utilizatorul la login
        clearToken()
        // folosim replace ca să nu rămână în history
        window.location.replace('/login')
      }
    }
    return Promise.reject(err)
  },
)

export default api
