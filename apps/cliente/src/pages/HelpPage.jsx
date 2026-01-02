import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@shared/components/Button'

export default function HelpPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Ayuda y Preguntas Frecuentes</h1>
        
        <div className="space-y-6 text-gray-600 text-sm">
          <div className="border-b pb-4">
            <h3 className="font-bold text-gray-900 mb-1">¿Puedo cancelar mi pedido?</h3>
            <p>No. Una vez que el restaurante cambia el estado a "Aceptado" o "Preparando", el pedido no se puede cancelar a través de la plataforma.</p>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-bold text-gray-900 mb-1">Tengo alergias alimentarias</h3>
            <p>Debes reportar tus alergias obligatoriamente en la sección de "Notas" antes de finalizar el pedido. La plataforma se exime de responsabilidad si esta información no es comunicada claramente.</p>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-bold text-gray-900 mb-1">Mi pedido está tardando mucho</h3>
            <p>Los tiempos mostrados son estimados. Si hay una demora excesiva, por favor contacta directamente al restaurante.</p>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-bold text-gray-900 mb-1">Uso de mis datos</h3>
            <p>Tu correo y teléfono se utilizan exclusivamente para notificaciones sobre el estado de tu pedido y comunicaciones directas del restaurante o la aplicación relacionadas con el servicio.</p>
          </div>
        </div>

        <div className="mt-8">
          <Button onClick={() => navigate(-1)} className="w-full">Volver</Button>
        </div>
      </div>
    </div>
  )
}