import { createContext, useState, useContext, useEffect, useMemo } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { getTenantInfo } from '../services/api'

const TenantContext = createContext()

const CACHE_DURATION = 5 * 60 * 1000
const tenantCache = {}

export function TenantProvider({ children }) {
  const { slug } = useParams()
  const location = useLocation()
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tenantIdentifier, setTenantIdentifier] = useState(null)

  // ✅ DETECTAR TENANT IDENTIFIER
  // - Custom domain (ej: www.zonasur.app, mirestaurante.com) → usa hostname
  // - Slug (ej: tienda-yadira) → usa el parámetro de ruta
  useEffect(() => {
    const hostname = window.location.hostname
    
    // Detectar si es dominio custom (cualquier dominio que no sea el nuestro)
    const isCustomDomain = hostname !== 'zonasur.app' && 
                           hostname !== 'localhost' && 
                           !hostname.includes('vercel.app')
    


                           
    if (isCustomDomain) {
      // Custom domain: usar hostname completo (ej: www.zonasur.app)
      // Esto incluye el subdominio "www" si existe
      setTenantIdentifier(hostname)
    } else if (slug) {
      // Slug-based: usar el slug de la ruta (ej: /tienda-yadira)
      setTenantIdentifier(slug)
    } else {
      setTenantIdentifier(null)
    }
  }, [slug, location])

  useEffect(() => {
    async function loadTenant() {
      if (!tenantIdentifier) return
      
      const now = Date.now()
      const cached = tenantCache[tenantIdentifier]
      
      // Usar caché si existe y es válido (< 5 minutos)
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setTenant(cached.data)
        setLoading(false)
        if (cached.data.name) {
          localStorage.setItem('last_visited_slug', cached.data.slug)
          localStorage.setItem('last_visited_name', cached.data.name)
        }
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // ✅ Llamar a la API con el identifier
        // La función getTenantInfo detectará si es dominio o slug
        // y construirá la URL correctamente
        const data = await getTenantInfo(tenantIdentifier)
        
        // Guardar en caché
        tenantCache[tenantIdentifier] = {
          data,
          timestamp: now
        }
        
        setTenant(data)
        
        // Guardar en localStorage para "último visitado"
        localStorage.setItem('last_visited_slug', data.slug)
        if (data.name) {
          localStorage.setItem('last_visited_name', data.name)
        }
      } catch (err) {
        setError(err.message)
        console.error('Error cargando tenant:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTenant()
  }, [tenantIdentifier])

  const value = useMemo(() => ({
    tenant,
    isOpen: tenant?.is_open || false,
    loading,
    error,
    slug: tenant?.slug,
    tenantIdentifier
  }), [tenant, loading, error, tenantIdentifier])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Negocio no encontrado</h1>
        </div>
      </div>
    )
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant debe usarse dentro de TenantProvider')
  }
  return context
}