import { createContext, useState, useContext, useEffect, useMemo } from 'react'

const AuthContext = createContext()

const ME_CACHE_DURATION = 60 * 1000
let meCache = null

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1'

function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

function isTokenExpired(token) {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  return decoded.exp * 1000 < Date.now()
}

function isTokenExpiringSoon(token, minutesThreshold = 5) {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  
  const expirationTime = decoded.exp * 1000
  const now = Date.now()
  const timeUntilExpiration = expirationTime - now
  const thresholdMs = minutesThreshold * 60 * 1000
  
  return timeUntilExpiration < thresholdMs
}

export function AuthProvider({ children }) {
  const [client, setClient] = useState(null)
  const [businessUser, setBusinessUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [userType, setUserType] = useState(null)

  useEffect(() => {
    async function loadUserFromToken() {
      const storedToken = localStorage.getItem('token')
      
      if (!storedToken) {
        setLoading(false)
        return
      }

      if (isTokenExpired(storedToken)) {
        localStorage.removeItem('token')
        setToken(null)
        setClient(null)
        setBusinessUser(null)
        setUserType(null)
        meCache = null
        setLoading(false)
        return
      }

      if (!isTokenExpiringSoon(storedToken)) {
        const now = Date.now()
        if (meCache && (now - meCache.timestamp) < ME_CACHE_DURATION) {
          if (meCache.type === 'client') {
            setClient(meCache.data)
          } else if (meCache.type === 'owner') {
            setBusinessUser(meCache.data)
          }
          setUserType(meCache.type)
          setToken(storedToken)
          setLoading(false)
          return
        }
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        })

        if (!response.ok) {
          localStorage.removeItem('token')
          setToken(null)
          setClient(null)
          setBusinessUser(null)
          setUserType(null)
          meCache = null
          setLoading(false)
          return
        }

        const data = await response.json()
        
        if (data.type === 'client') {
          meCache = {
            data: data.client,
            type: 'client',
            timestamp: Date.now()
          }
          setClient(data.client)
          setUserType('client')
          setToken(storedToken)
        } else if (data.type === 'business') {
          meCache = {
            data: data.user,
            type: 'owner',
            timestamp: Date.now()
          }
          setBusinessUser(data.user)
          setUserType('owner')
          setToken(storedToken)
        } else {
          localStorage.removeItem('token')
          setToken(null)
          setClient(null)
          setBusinessUser(null)
          setUserType(null)
          meCache = null
        }
      } catch (error) {
        localStorage.removeItem('token')
        setToken(null)
        setClient(null)
        setBusinessUser(null)
        setUserType(null)
        meCache = null
      } finally {
        setLoading(false)
      }
    }

    loadUserFromToken()
  }, [])

  useEffect(() => {
    if (!token) return

    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        logout()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [token])

  const login = async (newToken, userData, type = 'client') => {
    try {
      localStorage.setItem('token', newToken)
      
      const userTypeNormalized = type === 'business' ? 'owner' : type
      
      meCache = {
        data: userData,
        type: userTypeNormalized,
        timestamp: Date.now()
      }
      
      setToken(newToken)
      if (userTypeNormalized === 'client') {
        setClient(userData)
        setUserType('client')
      } else {
        setBusinessUser(userData)
        setUserType('owner')
      }
      
      return Promise.resolve()
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setClient(null)
    setBusinessUser(null)
    setUserType(null)
    localStorage.removeItem('token')
    meCache = null
  }

  const value = useMemo(() => ({
    client,
    businessUser,
    token,
    userType,
    isAuthenticated: !!token && (!!client || !!businessUser),
    loading,
    login,
    logout
  }), [client, businessUser, token, userType, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}