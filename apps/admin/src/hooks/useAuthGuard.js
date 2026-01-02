import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'

export function useAuthGuard() {
  const navigate = useNavigate()
  const { isAuthenticated, loading, token } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }

    if (!loading && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const exp = payload.exp * 1000
        const now = Date.now()
        
        if (now >= exp) {
          localStorage.removeItem('token')
          navigate('/login', { replace: true })
        }
      } catch (error) {
        console.error('Error verificando token:', error)
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
      }
    }
  }, [isAuthenticated, loading, token, navigate])

  return { isAuthenticated, loading }
}