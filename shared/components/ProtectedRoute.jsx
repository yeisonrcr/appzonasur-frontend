import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, userType, token } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && userType !== requiredRole) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute