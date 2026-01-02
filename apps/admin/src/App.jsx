import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@shared/context/AuthContext'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import AdminLoginPage from './pages/AdminLoginPage'

import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import ProductFormPage from './pages/ProductFormPage'
import CategoriesPage from './pages/CategoriesPage'
import ModifiersPage from './pages/ModifiersPage'
import TablesPage from './pages/TablesPage'
import CouponsPage from './pages/CouponsPage'
import ConfigPage from './pages/ConfigPage'

import CashRegisterPage from './pages/CashRegisterPage'
import ReportsPage from './pages/ReportsPage'
import PrepTokenPage from './pages/PrepTokenPage'

import PrepPage from './pages/PrepPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          
          <Route path="/:slug/prep" element={<PrepPage />} />
          
          <Route path="/:slug/admin/*" element={
            <ProtectedRoute requiredRole="owner">
              <AdminLayout>
                <Routes>
                  <Route index element={<DashboardPage />} />
                  <Route path="productos" element={<ProductsPage />} />
                  <Route path="productos/nuevo" element={<ProductFormPage />} />
                  <Route path="productos/:productId" element={<ProductFormPage />} />
                  <Route path="categorias" element={<CategoriesPage />} />
                  <Route path="modificadores" element={<ModifiersPage />} />
                  <Route path="mesas" element={<TablesPage />} />
                  <Route path="cupones" element={<CouponsPage />} />
                  <Route path="config" element={<ConfigPage />} />
                  <Route path="caja" element={<CashRegisterPage />} />
                  <Route path="prep" element={<PrepTokenPage />} />
                  <Route path="reportes" element={<ReportsPage />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App