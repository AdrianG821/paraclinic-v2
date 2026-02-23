import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getToken } from '../auth'

export default function ProtectedRoute() {
  const { user } = useAuth()
  const token = getToken()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
