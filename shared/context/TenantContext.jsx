import { createContext, useState, useContext, useEffect, useMemo } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { getTenantInfo } from '../services/api'

const TenantContext = createContext()

const CACHE_DURATION = 5 * 60 * 1000
const tenantCache = {}

// ============================================
// ✅ FUNCIÓN HELPER - Detectar si es dominio de plataforma
// ============================================
// Dominios que pertenecen a ZonaSur (NO son dominios custom de tenants)
function isPlatformDomain(hostname) {
  const platformDomains = [
    'zonasur.app',
    'www.zonasur.app',
    'admin.zonasur.app',
    'cliente.zonasur.app',
    'localhost',
  ]
  
  // Verificar si el hostname está en la lista o es un preview de Vercel
  return platformDomains.includes(hostname) || 
         hostname.includes('vercel.app') ||
         hostname.includes('localhost')
}

export function TenantProvider({ children }) {
  const { slug } = useParams()
  const location = useLocation()
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tenantIdentifier, setTenantIdentifier] = useState(null)

  // ============================================
  // ✅ DETECTAR TENANT IDENTIFIER (CORREGIDO)
  // ============================================
  useEffect(() => {
    const hostname = window.location.hostname
    
    // ✅ CORREGIDO: Usar función helper para detectar dominio de plataforma
    // Esto ahora incluye www.zonasur.app como dominio de plataforma
    const isCustomDomain = !isPlatformDomain(hostname)
    
    console.log('🔍 TenantContext - Detectando tenant:', {
      hostname,
      isPlatformDomain: isPlatformDomain(hostname),
      isCustomDomain,
      slugFromPath: slug
    })
    
    if (isCustomDomain) {
      // ============================================
      // CASO 1: Dominio custom de un tenant
      // ============================================
      // Ejemplo: mirestaurante.com → usar hostname como identifier
      console.log('📌 Usando dominio custom:', hostname)
      setTenantIdentifier(hostname)
      
    } else if (slug) {
      // ============================================
      // CASO 2: Dominio de plataforma con slug en path
      // ============================================
      // Ejemplos:
      //   - zonasur.app/tienda-yadira → slug = "tienda-yadira"
      //   - www.zonasur.app/tienda-yadira → slug = "tienda-yadira"
      //   - localhost:5174/tienda-yadira → slug = "tienda-yadira"
      console.log('📌 Usando slug del path:', slug)
      setTenantIdentifier(slug)
      
    } else {
      // ============================================
      // CASO 3: Sin tenant identificable
      // ============================================
      // Ejemplo: zonasur.app (sin slug) → mostrar página de inicio
      console.log('📌 Sin tenant identifier')
      setTenantIdentifier(null)
    }
  }, [slug, location])

  // ============================================
  // CARGAR DATOS DEL TENANT
  // ============================================
  useEffect(() => {
    async function loadTenant() {
      if (!tenantIdentifier) {
        setLoading(false)
        return
      }
      
      const now = Date.now()
      const cached = tenantCache[tenantIdentifier]
      
      // Usar caché si existe y es válido (< 5 minutos)
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        console.log('📦 Usando tenant desde caché:', tenantIdentifier)
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
        
        console.log('🌐 Cargando tenant desde API:', tenantIdentifier)
        
        // ✅ Llamar a la API con el identifier
        // La función getTenantInfo detectará si es dominio o slug
        // y construirá la URL correctamente
        const data = await getTenantInfo(tenantIdentifier)
        
        console.log('✅ Tenant cargado:', data.name, data.slug)
        
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
        console.error('❌ Error cargando tenant:', err)
        setError(err.message)
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
          <p className="text-gray-500 text-sm">{error}</p>
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