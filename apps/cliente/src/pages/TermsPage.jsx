import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@shared/components/Button'

export default function TermsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Términos y Condiciones</h1>
        
        <div className="space-y-6 text-gray-600 text-sm">
          <section>
            <h2 className="font-bold text-gray-900 mb-2">1. Identidad Legal</h2>
            <p>La plataforma "ZonaSur" es propiedad de <strong>Yeison Araya</strong>, cédula física N° <strong>6-043#####</strong>.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">2. Alcance del Servicio</h2>
            <p>ZonaSur actúa exclusivamente como un <strong>intermediario tecnológico</strong> que conecta al cliente con el restaurante. ZonaSur no prepara, manipula ni entrega alimentos, y no asume responsabilidad por la calidad, estado o seguridad de los mismos.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">3. Política de Reembolsos y Errores</h2>
            <p>Cualquier reclamo sobre productos faltantes, en mal estado o errores en la orden debe gestionarse <strong>directamente con el Restaurante</strong>. El comercio es el único responsable de emitir reembolsos o soluciones.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">4. Pagos SINPE Móvil</h2>
            <p>Para pedidos pagados vía SINPE Móvil, es responsabilidad del usuario enviar el comprobante de pago correcto. El restaurante se reserva el derecho de no procesar la orden hasta verificar la recepción de los fondos.</p>
          </section>

          {/* ✅ NUEVA SECCIÓN: TÉRMINOS DE DELIVERY */}
          <section className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>📍</span> 5. Servicio de Delivery
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">5.1 Ubicación GPS</h3>
                <p className="text-sm">
                  Al solicitar delivery, el usuario autoriza el uso de su ubicación GPS para determinar la dirección de entrega. 
                  La ubicación capturada debe ser <strong>exacta y verificada</strong> por el usuario antes de confirmar el pedido.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">5.2 Responsabilidad de la Dirección</h3>
                <p className="text-sm">
                  El usuario es completamente responsable de:
                </p>
                <ul className="text-sm list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Proporcionar coordenadas GPS correctas y accesibles</li>
                  <li>Agregar información adicional en las notas (color de casa, puntos de referencia)</li>
                  <li>Estar disponible en la ubicación indicada durante la entrega</li>
                  <li>Cualquier error en la ubicación que impida la entrega</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">5.3 Cancelaciones por Dirección</h3>
                <p className="text-sm">
                  El restaurante se reserva el derecho de <strong>cancelar pedidos</strong> si:
                </p>
                <ul className="text-sm list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>La ubicación proporcionada es inaccesible o incorrecta</li>
                  <li>El cliente no está disponible en la dirección indicada</li>
                  <li>La distancia excede el radio de cobertura del negocio</li>
                </ul>
                <p className="text-sm mt-2">
                  <strong>No se realizan reembolsos</strong> por direcciones incorrectas proporcionadas por el usuario.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">5.4 Tiempos de Entrega</h3>
                <p className="text-sm">
                  Los tiempos de entrega son <strong>estimados</strong> y pueden variar según:
                </p>
                <ul className="text-sm list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Distancia desde el negocio</li>
                  <li>Condiciones de tráfico</li>
                  <li>Disponibilidad de repartidores</li>
                  <li>Condiciones climáticas</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">5.5 Privacidad y Datos de Ubicación</h3>
                <p className="text-sm">
                  La ubicación GPS capturada se utiliza <strong>exclusivamente</strong> para:
                </p>
                <ul className="text-sm list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Procesar la entrega del pedido actual</li>
                  <li>Calcular tiempos y costos de envío</li>
                  <li>Coordinar con el repartidor</li>
                </ul>
                <p className="text-sm mt-2">
                  Los datos de ubicación <strong>no se comparten</strong> con terceros y se almacenan de forma segura.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-yellow-900 leading-relaxed">
                  <strong>⚠️ Importante:</strong> Al usar el servicio de delivery, confirmas que has leído y aceptado estos términos específicos. 
                  La precisión de la ubicación GPS es fundamental para una entrega exitosa.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">6. Jurisdicción</h2>
            <p>Cualquier disputa relacionada con el uso de la plataforma se regirá e interpretará bajo las leyes de la <strong>República de Costa Rica</strong>.</p>
          </section>
        </div>

        <div className="mt-8">
          <Button onClick={() => navigate(-1)} className="w-full">Volver</Button>
        </div>
      </div>
    </div>
  )
}