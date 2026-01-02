import { useState } from 'react'
import Button from './Button'

function TermsModal({ isOpen, onAccept, onDecline }) {
  const [hasRead, setHasRead] = useState(false)

  if (!isOpen) return null

  const handleAccept = () => {
    if (!hasRead) return
    onAccept()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 animate-fade-in" />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-strong max-w-lg w-full max-h-[80vh] flex flex-col animate-scale-in">
          
          {/* Header */}
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900">
              📍 Términos del Servicio de Delivery
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Por favor, lee y acepta los términos antes de continuar
            </p>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-neutral-700">
            
            <section>
              <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <span>📍</span> 1. Ubicación GPS
              </h3>
              <ul className="space-y-1 list-disc list-inside ml-4">
                <li>La ubicación se captura mediante GPS de tu dispositivo</li>
                <li>Debes verificar que las coordenadas sean correctas</li>
                <li>La ubicación es obligatoria para procesar el delivery</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <span>✅</span> 2. Responsabilidad de la Dirección
              </h3>
              <ul className="space-y-1 list-disc list-inside ml-4">
                <li>Eres responsable de proporcionar coordenadas exactas</li>
                <li>El negocio puede cancelar si la ubicación es inaccesible</li>
                <li>Debes estar disponible en la ubicación indicada</li>
                <li>No se aceptan reembolsos por direcciones incorrectas</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <span>🕐</span> 3. Tiempos de Entrega
              </h3>
              <ul className="space-y-1 list-disc list-inside ml-4">
                <li>Los tiempos son estimados y pueden variar</li>
                <li>Dependen de la distancia y disponibilidad del repartidor</li>
                <li>El negocio te informará el tiempo aproximado</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <span>🔒</span> 4. Privacidad
              </h3>
              <ul className="space-y-1 list-disc list-inside ml-4">
                <li>Tu ubicación se usa solo para esta entrega</li>
                <li>No se comparte con terceros</li>
                <li>Se almacena de forma segura</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <span>❌</span> 5. Cancelaciones
              </h3>
              <ul className="space-y-1 list-disc list-inside ml-4">
                <li>El negocio puede cancelar si la ubicación es incorrecta</li>
                <li>Puedes cancelar antes de que el pedido sea aceptado</li>
                <li>Los reembolsos dependen de la política del negocio</li>
              </ul>
            </section>

            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mt-6">
              <p className="text-blue-900 text-xs leading-relaxed">
                <strong>Importante:</strong> Al aceptar estos términos, confirmas que has leído y comprendido las condiciones del servicio de delivery. ZonaSur actúa como intermediario tecnológico y no se hace responsable por la entrega física de los productos.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-200 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasRead}
                onChange={(e) => setHasRead(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-sm text-neutral-700">
                He leído y acepto los <strong>términos del servicio de delivery</strong>
              </span>
            </label>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onDecline}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!hasRead}
                className="flex-1"
              >
                Aceptar y Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TermsModal