// OptimizedImage.jsx
import { useState, useEffect, useRef } from 'react'

const imageCache = new Map()
const failedImages = new Set()

function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  fallbackIcon = '🍽️',
  threshold = 400,
  ...props 
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (failedImages.has(src)) {
      setHasError(true)
      return
    }

    if (imageCache.has(src)) {
      setIsLoaded(true)
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: `${threshold}px` }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src, threshold])

  const handleLoad = () => {
    imageCache.set(src, true)
    setIsLoaded(true)
  }

  const handleError = () => {
    failedImages.add(src)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div 
        ref={imgRef}
        className={`${className} bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center`}
        {...props}
      >
        <span className="text-2xl">{fallbackIcon}</span>
      </div>
    )
  }

  return (
    <div ref={imgRef} className={`relative ${className}`} {...props}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  )
}

export default OptimizedImage