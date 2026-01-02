import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom'
import { AuthProvider } from '@shared/context/AuthContext'
import { TenantProvider } from '@shared/context/TenantContext'
import { CartProvider } from '@shared/context/CartContext'
import { useTenant } from '@shared/context/TenantContext'
import Cart from '@shared/components/Cart'
import Header from '@shared/components/Header'
import ProtectedRoute from '@shared/components/ProtectedRoute'

import { Toaster } from 'react-hot-toast'

import MenuPage from './pages/MenuPage'
import ProductPage from './pages/ProductPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import OrdersHistoryPage from './pages/OrdersHistoryPage'
import TermsPage from './pages/TermsPage'
import HelpPage from './pages/HelpPage'

const RootRedirect = () => {
  const lastSlug = localStorage.getItem('last_visited_slug')
  
  if (lastSlug) {
    return <Navigate to={`/${lastSlug}`} replace />
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
        <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🪧</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido a ZonaSur</h1>
        <p className="text-gray-500 mb-6">
          Para comenzar, por favor escanea el código QR de tu restaurante favorito o utiliza su enlace directo.
        </p>
        <div className="text-xs text-gray-400">
          Esperando enlace de tienda...
        </div>
      </div>
    </div>
  )
}

function TenantRoutes() {
  const { tenant, slug } = useTenant()
  
  return (
    <CartProvider 
      currentTenantSlug={slug} 
      currentTenantName={tenant?.name}
    >
      <div className="relative min-h-screen">
        <Routes>
          <Route index element={<MenuPage />} />
          <Route path="mesa/:tableId" element={<MenuPage />} />
          <Route path="producto/:productId" element={<ProductPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="pedido/:publicId" element={<OrderTrackingPage />} />
        </Routes>
        <Cart />
      </div>
    </CartProvider>
  )
}

function AppContent() {
  const location = useLocation()
  
  const isAuthPage = ['/login', '/register'].includes(location.pathname)
  const isRoot = location.pathname === '/'
  const isTrackingPage = location.pathname.includes('/pedido/')
  const isCheckoutPage = location.pathname.includes('/checkout')
  
  const shouldShowHeader = !isAuthPage && !isRoot && !isTrackingPage && !isCheckoutPage
  
  return (
    <>
      {shouldShowHeader && <Header />}
      
      <div className={shouldShowHeader ? 'pt-14' : ''}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/perfil" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/mis-pedidos" element={
            <ProtectedRoute>
              <OrdersHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/ayuda" element={<HelpPage />} />

          <Route path="/:slug/*" element={
            <TenantProvider>
              <TenantRoutes />
            </TenantProvider>
          } />
          
          <Route path="/*" element={
            <TenantProvider>
              <TenantRoutes />
            </TenantProvider>
          } />
          
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
                <p className="text-gray-600 font-medium">Página no encontrada</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#16151aff',
              color: '#fff',
              fontSize: '14px',
              padding: '8px 12px',
              maxWidth: '300px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App