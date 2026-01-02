// TermsPage.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@shared/components/Button'

export default function TermsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8 px-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        
        {/* Título principal */}
        <h1 className="text-xl font-bold mb-4 text-gray-900">Términos y Condiciones</h1>
        
        {/* Contenido de términos */}
        <div className="space-y-4 text-gray-600 text-xs">
          
          {/* Sección 1: Identidad Legal */}
          <section>
            <h2 className="font-bold text-gray-900 mb-1.5 text-sm">1. Identidad Legal</h2>
            <p>La plataforma "ZonaSur" es propiedad de <strong>Yeison Araya</strong>, cédula física N° <strong>6-043#####</strong>.</p>
          </section>

          {/* Sección 2: Alcance del Servicio */}
          <section>
            <h2 className="font-bold text-gray-900 mb-1.5 text-sm">2. Alcance del Servicio</h2>
            <p>ZonaSur actúa exclusivamente como un <strong>intermediario tecnológico</strong> que conecta al cliente con el restaurante. ZonaSur no prepara, manipula ni entrega alimentos, y no asume responsabilidad por la calidad, estado o seguridad de los mismos.</p>
          </section>

          {/* Sección 3: Política de Reembolsos */}
          <section>
            <h2 className="font-bold text-gray-900 mb-1.5 text-sm">3. Política de Reembolsos y Errores</h2>
            <p>Cualquier reclamo sobre productos faltantes, en mal estado o errores en la orden debe gestionarse <strong>directamente con el Restaurante</strong>. El comercio es el único responsable de emitir reembolsos o soluciones.</p>
          </section>

          {/* Sección 4: Pagos SINPE */}
          <section>
            <h2 className="font-bold text-gray-900 mb-1.5 text-sm">4. Pagos SINPE Móvil</h2>
            <p>Para pedidos pagados vía SINPE Móvil, es responsabilidad del usuario enviar el comprobante de pago correcto. El restaurante se reserva el derecho de no procesar la orden hasta verificar la recepción de los fondos.</p>
          </section>

          {/* Sección 5: Términos de Delivery */}
          <section className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-3">
            <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5 text-sm">
              <span>📍</span> 5. Servicio de Delivery
            </h2>
            
            <div className="space-y-2.5 text-gray-700">
              
              {/* 5.1 Ubicación GPS */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-xs">5.1 Ubicación GPS</h3>
                <p className="text-[11px]">
                  Al solicitar delivery, el usuario autoriza el uso de su ubicación GPS para determinar la dirección de entrega. 
                  La ubicación capturada debe ser <strong>exacta y verificada</strong> por el usuario antes de confirmar el pedido.
                </p>
              </div>

              {/* 5.2 Responsabilidad de la Dirección */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-xs">5.2 Responsabilidad de la Dirección</h3>
                <p className="text-[11px]">El usuario es completamente responsable de:</p>
                <ul className="text-[11px] list-disc list-inside ml-3 mt-1 space-y-0.5">
                  <li>Proporcionar coordenadas GPS correctas y accesibles</li>
                  <li>Agregar información adicional en las notas (color de casa, puntos de referencia)</li>
                  <li>Estar disponible en la ubicación indicada durante la entrega</li>
                  <li>Cualquier error en la ubicación que impida la entrega</li>
                </ul>
              </div>

              {/* 5.3 Cancelaciones */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-xs">5.3 Cancelaciones por Dirección</h3>
                <p className="text-[11px]">El restaurante se reserva el derecho de <strong>cancelar pedidos</strong> si:</p>
                <ul className="text-[11px] list-disc list-inside ml-3 mt-1 space-y-0.5">
                  <li>La ubicación proporcionada es inaccesible o incorrecta</li>
                  <li>El cliente no está disponible en la dirección indicada</li>
                  <li>La distancia excede el radio de cobertura del negocio</li>
                </ul>
                <p className="text-[11px] mt-1.5">
                  <strong>No se realizan reembolsos</strong> por direcciones incorrectas proporcionadas por el usuario.
                </p>
              </div>

              {/* 5.4 Tiempos de Entrega */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-xs">5.4 Tiempos de Entrega</h3>
                <p className="text-[11px]">Los tiempos de entrega son <strong>estimados</strong> y pueden variar según:</p>
                <ul className="text-[11px] list-disc list-inside ml-3 mt-1 space-y-0.5">
                  <li>Distancia desde el negocio</li>
                  <li>Condiciones de tráfico</li>
                  <li>Disponibilidad de repartidores</li>
                  <li>Condiciones climáticas</li>
                </ul>
              </div>

              {/* 5.5 Privacidad */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-xs">5.5 Privacidad y Datos de Ubicación</h3>
                <p className="text-[11px]">La ubicación GPS capturada se utiliza <strong>exclusivamente</strong> para:</p>
                <ul className="text-[11px] list-disc list-inside ml-3 mt-1 space-y-0.5">
                  <li>Procesar la entrega del pedido actual</li>
                  <li>Calcular tiempos y costos de envío</li>
                  <li>Coordinar con el repartidor</li>
                </ul>
                <p className="text-[11px] mt-1.5">
                  Los datos de ubicación <strong>no se comparten</strong> con terceros y se almacenan de forma segura.
                </p>
              </div>

              {/* Nota importante */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 mt-2">
                <p className="text-[10px] text-yellow-900 leading-relaxed">
                  <strong>⚠️ Importante:</strong> Al usar el servicio de delivery, confirmas que has leído y aceptado estos términos específicos. 
                  La precisión de la ubicación GPS es fundamental para una entrega exitosa.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 6: Jurisdicción */}
          <section>
            <h2 className="font-bold text-gray-900 mb-1.5 text-sm">6. Jurisdicción</h2>
            <p>Cualquier disputa relacionada con el uso de la plataforma se regirá e interpretará bajo las leyes de la <strong>República de Costa Rica</strong>.</p>
          </section>
        </div>

        {/* Botón volver */}
        <div className="mt-6">
          <Button onClick={() => navigate(-1)} className="w-full" size="md">Volver</Button>
        </div>
      </div>
    </div>
  )
}