import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Configura el alias para poder importar desde la carpeta 'shared'
    // Ejemplo: import Button from '@shared/components/Button'
    alias: {
      '@shared': path.resolve(__dirname, '../../shared')
    }
  },
  server: {
    host: '0.0.0.0', // Necesario para exponer el servidor fuera del contenedor Docker
    port: 5175,      // IMPORTANTE: Puerto diferente al del cliente (5174)
    proxy: {
      // Proxy reverso para evitar problemas de CORS durante el desarrollo
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true
      },
      '/uploads': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})