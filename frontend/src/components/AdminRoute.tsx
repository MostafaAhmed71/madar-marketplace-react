import { Navigate, useLocation } from 'react-router-dom'
import { LoadingSpinner } from './LoadingSpinner'
import { useAuth } from '../context/AuthContext'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (profile?.role !== 'admin') return <Navigate to="/marketplace" replace />

  return <>{children}</>
}
