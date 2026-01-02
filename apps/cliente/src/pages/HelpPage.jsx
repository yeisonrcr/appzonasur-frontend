// HelpPage.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@shared/components/Button'

export default function HelpPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8 px-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        
        {/* Título principal */}
        <h1 className="text-xl font-bold mb-4 text-gray-900">Ayuda y Preguntas Frecuentes</h1>
        
        {/* Preguntas frecuentes */}
        <div className="space-y-4 text-gray-600 text-xs">
          
          {/* Pregunta 1: Cancelaciones */}
          <div className="border-b pb-3">
            <h3 className="font-bold text-gray-900 mb-1 text-sm">¿Puedo cancelar mi pedido?</h3>
            <p>No. Una vez que el restaurante cambia el estado a "Aceptado" o "Preparando", el pedido no se puede cancelar a través de la plataforma.</p>
          </div>

          {/* Pregunta 2: Alergias */}
          <div className="border-b pb-3">
            <h3 className="font-bold text-gray-900 mb-1 text-sm">Tengo alergias alimentarias</h3>
            <p>Debes reportar tus alergias obligatoriamente en la sección de "Notas" antes de finalizar el pedido. La plataforma se exime de responsabilidad si esta información no es comunicada claramente.</p>
          </div>

          {/* Pregunta 3: Demoras */}
          <div className="border-b pb-3">
            <h3 className="font-bold text-gray-900 mb-1 text-sm">Mi pedido está tardando mucho</h3>
            <p>Los tiempos mostrados son estimados. Si hay una demora excesiva, por favor contacta directamente al restaurante.</p>
          </div>

          {/* Pregunta 4: Uso de datos */}
          <div className="border-b pb-3">
            <h3 className="font-bold text-gray-900 mb-1 text-sm">Uso de mis datos</h3>
            <p>Tu correo y teléfono se utilizan exclusivamente para notificaciones sobre el estado de tu pedido y comunicaciones directas del restaurante o la aplicación relacionadas con el servicio.</p>
          </div>
        </div>

        {/* Botón volver */}
        <div className="mt-6">
          <Button onClick={() => navigate(-1)} className="w-full" size="md">Volver</Button>
        </div>
      </div>
    </div>
  )
}