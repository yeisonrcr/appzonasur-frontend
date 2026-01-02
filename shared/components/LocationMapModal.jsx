import { useState, useCallback, useEffect } from 'react'
// ✅ CORRECCIÓN 1: Importamos MarkerF en lugar de Marker
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import Button from './Button'

const containerStyle = {
  width: '100%',
  height: '100%'
}

const defaultCenter = {
  lat: 9.9281,
  lng: -84.0907
}

const mapOptions = {
  mapTypeId: 'hybrid',
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
  zoom: 18,
  minZoom: 3,
  maxZoom: 21,
  disableDefaultUI: false,
  clickableIcons: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
}

function LocationMapModal({ isOpen, initialPosition, onConfirm, onClose }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    language: 'es',
    region: 'CR'
  })

  const [markerPosition, setMarkerPosition] = useState(defaultCenter)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // Obtener ubicación GPS al abrir
  useEffect(() => {
    if (!isOpen || !isLoaded) return

    if (initialPosition && Array.isArray(initialPosition) && initialPosition.length === 2) {
      setMarkerPosition({ lat: initialPosition[0], lng: initialPosition[1] })
      return
    }

    getUserLocation()
  }, [isOpen, isLoaded, initialPosition])

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setMarkerPosition(defaultCenter)
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setMarkerPosition(newPos)
        setIsGettingLocation(false)
      },
      (error) => {
        setIsGettingLocation(false)
        setMarkerPosition(defaultCenter)
        console.error('GPS error:', error.code)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const onMapClick = useCallback((e) => {
    setMarkerPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    })
  }, [])

  const onMarkerDragEnd = useCallback((e) => {
    setMarkerPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    })
  }, [])

  const handleConfirm = () => {
    onConfirm({
      lat: markerPosition.lat.toFixed(6),
      lon: markerPosition.lng.toFixed(6)
    })
  }

  const handleGetLocationAgain = () => {
    getUserLocation()
  }

  if (!isLoaded) {
    return isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="bg-white rounded-2xl p-8 shadow-strong">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    ) : null
  }

  if (loadError) {
    return isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="bg-white rounded-2xl p-8 shadow-strong max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error al cargar el mapa</h3>
          <p className="text-gray-600 mb-4">
            No se pudo cargar Google Maps. Verifica tu conexión.
          </p>
          <Button onClick={onClose} variant="outline" className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    ) : null
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 z-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-strong w-full max-w-2xl flex flex-col pointer-events-auto"
          style={{ height: '80vh', maxHeight: '600px' }}
        >
          
          {/* Header */}
          <div className="p-4 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">
                📍 Confirma tu ubicación
              </h2>
              
              <button
                onClick={handleGetLocationAgain}
                disabled={isGettingLocation}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Obtener mi ubicación actual"
              >
                {isGettingLocation ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                ) : (
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            
            <p className="text-sm text-neutral-600 mt-1">
              {isGettingLocation 
                ? 'Obteniendo tu ubicación GPS...'
                : 'Arrastra el marcador o haz clic en el mapa'
              }
            </p>
          </div>

          {/* Mapa */}
          <div className="flex-1 relative" style={{ minHeight: '0' }}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={markerPosition}
              zoom={mapOptions.zoom}
              options={mapOptions}
              onClick={onMapClick}
            >
              {/* ✅ CORRECCIÓN 2: Usamos MarkerF */}
              <MarkerF
                position={markerPosition}
                draggable={true}
                onDragEnd={onMarkerDragEnd}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 12,
                  fillColor: '#EF4444',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 3
                }}
                animation={window.google.maps.Animation.DROP}
              />
            </GoogleMap>

            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-medium p-3 z-10 pointer-events-none">
              <p className="text-sm text-gray-800 leading-relaxed">
                <strong>💡 Arrastra el punto rojo</strong> para marcar tu ubicación exacta de entrega
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200 flex gap-3 flex-shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 font-bold"
            >
              ✓ Confirmar Ubicación
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default LocationMapModal