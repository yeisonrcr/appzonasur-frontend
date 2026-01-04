// ============================================
// API.JS - ZONASUR FRONTEND
// ============================================
// ✅ Corregido para manejar correctamente:
//    - Dominios de plataforma (zonasur.app, www.zonasur.app, etc)
//    - Dominios custom de tenants (mirestaurante.com)
//    - Desarrollo local (localhost)

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1'

let currentTenantIdentifier = null

export function setTenantIdentifier(identifier) {
  currentTenantIdentifier = identifier
}

// ============================================
// ✅ FUNCIÓN CORREGIDA - Detectar tipo de identifier
// ============================================
// Retorna TRUE si el identifier es un dominio custom de tenant
// Retorna FALSE si es un slug (tienda-yadira) o dominio de plataforma
function isCustomDomain(identifier) {
  if (!identifier) return false
  
  // Lista de dominios que pertenecen a la plataforma ZonaSur
  // Estos NO son dominios custom de tenants
  const platformDomains = [
    'zonasur.app',
    'www.zonasur.app',
    'admin.zonasur.app',
    'cliente.zonasur.app',
  ]
  
  // Si el identifier está en la lista de dominios de plataforma, NO es custom
  if (platformDomains.includes(identifier)) {
    return false
  }
  
  // Si contiene vercel.app o localhost, NO es custom
  if (identifier.includes('vercel.app') || identifier.includes('localhost')) {
    return false
  }
  
  // Un dominio custom tiene puntos (ej: mirestaurante.com)
  // Un slug NO tiene puntos (ej: tienda-yadira)
  return identifier.includes('.')
}

// ============================================
// HELPERS
// ============================================

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      detail: 'Error desconocido' 
    }))
    throw new Error(error.detail || 'Error en la petición')
  }
  return response.json()
}

function getHeaders(includeAuth = false) {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  // Enviar el identifier como header para que el backend lo use
  if (currentTenantIdentifier) {
    headers['X-Tenant-Slug'] = currentTenantIdentifier
  }
  
  if (includeAuth) {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}

// ============================================
// FUNCIONES DE API - TENANT
// ============================================

export async function getTenantInfo(identifier) {
  setTenantIdentifier(identifier)
  
  let url
  
  if (isCustomDomain(identifier)) {
    // ============================================
    // CASO 1: Dominio custom (mirestaurante.com)
    // ============================================
    // Solo usar header, NO poner el dominio en el path
    // El backend buscará por custom_domain
    console.log('🌐 API: Dominio custom detectado:', identifier)
    url = `${BASE_URL}/info`
  } else {
    // ============================================
    // CASO 2: Slug (tienda-yadira)
    // ============================================
    // Poner el slug en el path (backward compatibility)
    console.log('🌐 API: Slug detectado:', identifier)
    url = `${BASE_URL}/${identifier}/info`
  }
  
  console.log('🌐 API: Llamando a:', url)
  
  let response = await fetch(url, { headers: getHeaders() })
  
  // Si falla con slug en path, intentar solo con header
  if (!response.ok && !isCustomDomain(identifier)) {
    console.log('🌐 API: Reintentando con header solamente')
    url = `${BASE_URL}/info`
    response = await fetch(url, { headers: getHeaders() })
  }
  
  return handleResponse(response)
}

// ============================================
// FUNCIONES DE API - CATEGORÍAS Y PRODUCTOS
// ============================================

export async function getCategories(slug) {
  // Si es dominio custom, no usar en path
  const url = (slug && !isCustomDomain(slug)) 
    ? `${BASE_URL}/${slug}/categories` 
    : `${BASE_URL}/categories`
  const response = await fetch(url, { headers: getHeaders() })
  return handleResponse(response)
}

export async function getProducts(slug) {
  // Si es dominio custom, no usar en path
  const url = (slug && !isCustomDomain(slug)) 
    ? `${BASE_URL}/${slug}/products` 
    : `${BASE_URL}/products`
  const response = await fetch(url, { headers: getHeaders() })
  return handleResponse(response)
}

export async function getProduct(slug, productId) {
  // Si es dominio custom, no usar en path
  const url = (slug && !isCustomDomain(slug))
    ? `${BASE_URL}/${slug}/products/${productId}` 
    : `${BASE_URL}/products/${productId}`
  const response = await fetch(url, { headers: getHeaders() })
  return handleResponse(response)
}

export async function getProductModifiers(productId) {
  const response = await fetch(`${BASE_URL}/modifiers/product/${productId}`, {
    headers: getHeaders()
  })
  return handleResponse(response)
}

// ============================================
// FUNCIONES DE API - CUPONES
// ============================================

export async function validateCoupon(slug, code, subtotal) {
  // Si es dominio custom, no usar en path
  const url = (slug && !isCustomDomain(slug))
    ? `${BASE_URL}/${slug}/coupons/validate` 
    : `${BASE_URL}/coupons/validate`
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ code, subtotal })
  })
  return handleResponse(response)
}

// ============================================
// FUNCIONES DE API - PEDIDOS
// ============================================

export async function createOrder(slug, orderData) {
  // Si es dominio custom, no usar en path
  const url = (slug && !isCustomDomain(slug))
    ? `${BASE_URL}/${slug}/orders` 
    : `${BASE_URL}/orders`
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(orderData)
  })
  return handleResponse(response)
}

export async function getOrder(slug, publicId) {
  // Si es dominio custom, no usar en path
  const url = (slug && !isCustomDomain(slug))
    ? `${BASE_URL}/${slug}/orders/${publicId}` 
    : `${BASE_URL}/orders/${publicId}`
  const response = await fetch(url, { headers: getHeaders() })
  return handleResponse(response)
}

export async function getActiveOrder(slug, tableId = null) {
  // Si es dominio custom, no usar en path
  const baseUrl = (slug && !isCustomDomain(slug))
    ? `${BASE_URL}/${slug}/orders/active` 
    : `${BASE_URL}/orders/active`
  const url = tableId ? `${baseUrl}?table_id=${tableId}` : baseUrl
  
  const response = await fetch(url, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

// ============================================
// FUNCIONES DE API - AUTENTICACIÓN CLIENTE
// ============================================

export async function registerClient(data) {
  const response = await fetch(`${BASE_URL}/client/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export async function loginClient(data) {
  const response = await fetch(`${BASE_URL}/client/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export async function getClientProfile() {
  const response = await fetch(`${BASE_URL}/client/profile`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

export async function getClientOrders() {
  const response = await fetch(`${BASE_URL}/client/orders`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

export async function logoutClient() {
  const response = await fetch(`${BASE_URL}/client/logout`, {
    method: 'POST',
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

// ============================================
// FUNCIONES DE API - AUTENTICACIÓN BUSINESS
// ============================================

export async function logoutBusiness() {
  const response = await fetch(`${BASE_URL}/business/logout`, {
    method: 'POST',
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

// ============================================
// OBJETO API GENÉRICO
// ============================================

const api = {
  async get(url, includeAuth = false) {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: getHeaders(includeAuth)
    })
    return handleResponse(response)
  },

  async post(url, data, includeAuth = false) {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: getHeaders(includeAuth),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  }
}

export default api