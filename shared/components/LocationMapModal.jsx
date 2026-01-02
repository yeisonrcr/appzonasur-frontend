// LocationMapModal.jsx
import { useState, useCallback, useEffect } from 'react'
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
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando mapa...</p>
        </div>
      </div>
    ) : null
  }

  if (loadError) {
    return isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="bg-white rounded-xl p-6 shadow-lg max-w-md">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Error al cargar el mapa</h3>
          <p className="text-gray-600 mb-4 text-sm">
            No se pudo cargar Google Maps. Verifica tu conexión.
          </p>
          <Button onClick={onClose} variant="outline" className="w-full" size="sm">
            Cerrar
          </Button>
        </div>
      </div>
    ) : null
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/70 z-50" 
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-xl shadow-lg w-full max-w-2xl flex flex-col pointer-events-auto"
          style={{ height: '80vh', maxHeight: '600px' }}
        >
          
          <div className="p-3 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">
                📍 Confirma tu ubicación
              </h2>
              
              <button
                onClick={handleGetLocationAgain}
                disabled={isGettingLocation}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Obtener mi ubicación actual"
              >
                {isGettingLocation ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                ) : (
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            
            <p className="text-xs text-neutral-600 mt-1">
              {isGettingLocation 
                ? 'Obteniendo tu ubicación GPS...'
                : 'Arrastra el marcador o haz clic en el mapa'
              }
            </p>
          </div>

          <div className="flex-1 relative" style={{ minHeight: '0' }}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={markerPosition}
              zoom={mapOptions.zoom}
              options={mapOptions}
              onClick={onMapClick}
            >
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

            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-2.5 z-10 pointer-events-none">
              <p className="text-xs text-gray-800 leading-relaxed">
                <strong>💡 Arrastra el punto rojo</strong> para marcar tu ubicación exacta de entrega
              </p>
            </div>
          </div>

          <div className="p-3 border-t border-neutral-200 flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 font-bold"
              size="sm"
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