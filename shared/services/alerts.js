import toast from 'react-hot-toast'

let audioCache = null

export const showSuccess = (message) => {
  toast.success(message, {
    duration: 500,
    style: {
      fontSize: '12px',
      padding: '5px',
    }
  })
}

export const showError = (message) => {
  toast.error(message)
}

export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
  })
}

export const showLoading = (message) => {
  return toast.loading(message)
}

export const dismissToast = (toastId) => {
  toast.dismiss(toastId)
}

export const showPromise = (promise, messages) => {
  return toast.promise(promise, {
    loading: messages.loading || 'Cargando...',
    success: messages.success || '¡Éxito!',
    error: messages.error || 'Error',
  })
}

export function playAlertSound(soundFile = '/notification.mp3') {
  try {
    if (!audioCache) {
      audioCache = new Audio(soundFile)
    }
    audioCache.currentTime = 0
    const playPromise = audioCache.play()
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Interacción requerida para audio:', error.message)
      })
    }
  } catch (error) {
    console.error('Error audio:', error)
  }
}

export function playSuccessSound() {
  playAlertSound('/notification.mp3')
}

export function playErrorSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 400
    gainNode.gain.value = 0.3
    
    oscillator.start()
    setTimeout(() => oscillator.stop(), 200)
  } catch (error) {
    console.error('AudioContext error:', error)
  }
}

export function vibrate(pattern = [200, 100, 200]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  } catch (error) {
    console.error('Vibración error:', error)
  }
}

export function vibrateShort() {
  vibrate(100)
}

export function vibrateLong() {
  vibrate([400, 200, 400])
}

export function vibrateAlert() {
  vibrate([200, 100, 200, 100, 200])
}

export async function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) return 'denied'
    if (Notification.permission === 'granted') return 'granted'
    if (Notification.permission === 'default') {
      return await Notification.requestPermission()
    }
    return Notification.permission
  } catch (error) {
    console.error('Permiso notificación error:', error)
    return 'denied'
  }
}

export function showNotification(title, options = {}) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return null
    
    const defaultOptions = {
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options
    }
    
    return new Notification(title, defaultOptions)
  } catch (error) {
    console.error('Notificación error:', error)
    return null
  }
}

export function notifyNewOrder(orderId, orderType = 'COUNTER') {
  const typeLabels = {
    TABLE: 'Mesa',
    COUNTER: 'Mostrador',
    EXPRESS: 'Express'
  }
  
  return showNotification('🔔 Nuevo Pedido', {
    body: `Pedido #${orderId} - ${typeLabels[orderType] || orderType}`,
    tag: `order-${orderId}`,
    requireInteraction: true
  })
}

export function notifyOrderReady(orderId) {
  return showNotification('✅ Pedido Listo', {
    body: `Pedido #${orderId} está listo para entregar`,
    tag: `order-ready-${orderId}`
  })
}

export function notifyOrderCancelled(orderId) {
  return showNotification('❌ Pedido Cancelado', {
    body: `Pedido #${orderId} ha sido cancelado`,
    tag: `order-cancelled-${orderId}`
  })
}

export function alertNewOrder(orderId, orderType) {
  playAlertSound()
  vibrateAlert()
  notifyNewOrder(orderId, orderType)
}

export function alertOrderReady(orderId) {
  playSuccessSound()
  vibrateShort()
  notifyOrderReady(orderId)
}

export function alertOrderCancelled(orderId) {
  playErrorSound()
  vibrateLong()
  notifyOrderCancelled(orderId)
}

export function areNotificationsEnabled() {
  return 'Notification' in window && Notification.permission === 'granted'
}

export function isVibrationSupported() {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

export function isAudioSupported() {
  return typeof Audio !== 'undefined'
}

export function getAlertCapabilities() {
  return {
    notifications: areNotificationsEnabled(),
    vibration: isVibrationSupported(),
    audio: isAudioSupported(),
    notificationPermission: 'Notification' in window ? Notification.permission : 'denied'
  }
}

export async function initializeAlerts() {
  const capabilities = getAlertCapabilities()
  
  if (capabilities.audio) {
    try {
      audioCache = new Audio('/notification.mp3')
      audioCache.preload = 'auto'
    } catch (error) {
      console.error('Preload audio error:', error)
    }
  }
  
  if (!capabilities.notifications && capabilities.notificationPermission === 'default') {
    await requestNotificationPermission()
  }
  
  return getAlertCapabilities()
}

export default {
  playAlertSound,
  playSuccessSound,
  playErrorSound,
  vibrate,
  vibrateShort,
  vibrateLong,
  vibrateAlert,
  requestNotificationPermission,
  showNotification,
  notifyNewOrder,
  notifyOrderReady,
  notifyOrderCancelled,
  alertNewOrder,
  alertOrderReady,
  alertOrderCancelled,
  areNotificationsEnabled,
  isVibrationSupported,
  isAudioSupported,
  getAlertCapabilities,
  initializeAlerts
}