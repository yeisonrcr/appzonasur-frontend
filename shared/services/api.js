const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1'

let currentTenantIdentifier = null

export function setTenantIdentifier(identifier) {
  currentTenantIdentifier = identifier
}

// ✅ NUEVA FUNCIÓN - Detectar si es dominio (tiene puntos) o slug
function isCustomDomain(identifier) {
  if (!identifier) return false
  // Un dominio tiene puntos (ej: www.zonasur.app, mirestaurante.com)
  // Un slug NO tiene puntos (ej: tienda-yadira, pizzeria-roma)
  return identifier.includes('.')
}

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

// ✅ FUNCIÓN CORREGIDA
export async function getTenantInfo(identifier) {
  setTenantIdentifier(identifier)
  
  // Si es un dominio custom (tiene puntos), NO ponerlo en el path
  // Si es un slug (sin puntos), puede ir en el path como fallback
  let url
  if (isCustomDomain(identifier)) {
    // Dominio custom: Solo usar header, NO en path
    url = `${BASE_URL}/info`
  } else {
    // Slug: Intentar con path primero (backward compatibility)
    url = `${BASE_URL}/${identifier}/info`
  }
  
  let response = await fetch(url, { headers: getHeaders() })
  
  // Si falla con slug en path, intentar solo con header
  if (!response.ok && !isCustomDomain(identifier)) {
    url = `${BASE_URL}/info`
    response = await fetch(url, { headers: getHeaders() })
  }
  
  return handleResponse(response)
}

// ✅ FUNCIÓN CORREGIDA
export async function getCategories(slug) {
  // Si es dominio, no usar en path
  const url = (slug && !isCustomDomain(slug)) 
    ? `${BASE_URL}/${slug}/categories` 
    : `${BASE_URL}/categories`
  const response = await fetch(url, { headers: getHeaders() })
  return handleResponse(response)
}

// ✅ FUNCIÓN CORREGIDA
export async function getProducts(slug) {
  // Si es dominio, no usar en path
  const url = (slug && !isCustomDomain(slug)) 
    ? `${BASE_URL}/${slug}/products` 
    : `${BASE_URL}/products`
  const response = await fetch(url, { headers: getHeaders() })
  return handleResponse(response)
}

// ✅ FUNCIÓN CORREGIDA
export async function getProduct(slug, productId) {
  // Si es dominio, no usar en path
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

// ✅ FUNCIÓN CORREGIDA
export async function validateCoupon(slug, code, subtotal) {
  // Si es dominio, no usar en path
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

// ✅ FUNCIÓN CORREGIDA
export async function createOrder(slug, orderData) {
  // Si es dominio, no usar en path
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

// ✅ FUNCIÓN CORREGIDA
export async function getOrder(slug, publicId) {
  // Si es dominio, no usar en path
  const url = (slug && !isCustomDomain(slug))
    ? `${BASE_URL}/${slug}/orders/${publicId}` 
    : `${BASE_URL}/orders/${publicId}`
  const response = await fetch(url, { headers: getHeaders() })
  return handleResponse(response)
}

// ✅ FUNCIÓN CORREGIDA
export async function getActiveOrder(slug, tableId = null) {
  // Si es dominio, no usar en path
  const baseUrl = (slug && !isCustomDomain(slug))
    ? `${BASE_URL}/${slug}/orders/active` 
    : `${BASE_URL}/orders/active`
  const url = tableId ? `${baseUrl}?table_id=${tableId}` : baseUrl
  
  const response = await fetch(url, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

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

export async function logoutBusiness() {
  const response = await fetch(`${BASE_URL}/business/logout`, {
    method: 'POST',
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

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