import { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function NetworkStatusOverlay({ position = 'top-right', isOnline: propIsOnline }) {
  const [internalIsOnline, setInternalIsOnline] = useState(navigator.onLine)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const isOnline = propIsOnline !== undefined ? propIsOnline : internalIsOnline

  const positionStyles = {
    'top-left': { top: '1rem', left: '1rem' },
    'top-right': { top: '1rem', right: '1rem' },
    'bottom-left': { bottom: '1rem', left: '1rem' },
    'bottom-right': { bottom: '1rem', right: '1rem' },
    center: { top: '30%', left: '50%', transform: 'translate(-50%, -50%)' }, // Centered position
  }

  useEffect(() => {
    if (propIsOnline !== undefined) return

    const handleOnline = () => {
      setInternalIsOnline(true)
      setLastUpdated(new Date())
    }

    const handleOffline = () => {
      setInternalIsOnline(false)
      setLastUpdated(new Date())
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [propIsOnline])

  const getNetworkIcon = () => {
    if (!isOnline) {
      return (
        <div className="wifi-symbol">
          <div className="wifi-circle first"></div>
          <div className="wifi-circle second"></div>
          <div className="wifi-circle third"></div>
          <div className="wifi-circle fourth"></div>
        </div>
      )
    }
    return null
  }

  const getStatusText = () => {
    return isOnline ? 'Online' : 'Offline' // Fixed missing return value
  }

  return isOnline === false ? ( // Removed incorrect {}
    <div className="position-absolute z-index-50" style={positionStyles[position]}>
      <div
        className="rounded overflow-hidden"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
        }}
      >
        <div className="p-3 d-flex align-items-center gap-3">
          <div style={{ position: 'relative', width: 24, height: 24 }}>{getNetworkIcon()}</div>
          <span>{getStatusText()}</span>
        </div>
      </div>
      <style>
        {`
          @keyframes wifianimation {
            0% { opacity: 0.4; }
            5% { opacity: 1; }
            6% { opacity: 0.1; }
            100% { opacity: 0.1; }
          }
          
          .wifi-symbol {
            position: absolute;
            width: 24px;
            height: 24px;
            transform: rotate(-45deg);
          }
          
          .wifi-circle {
            box-sizing: border-box;
            position: absolute;
            bottom: 0;
            left: 0;
            border-style: solid;
            border-color: #dc3545;
            border-radius: 0 100% 0 0;
            opacity: 0;
            animation: wifianimation 3s infinite;
          }
          
          .wifi-circle.first {
            width: 24px;
            height: 24px;
            border-width: 3px 3px 0 0;
          }
          
          .wifi-circle.second {
            width: 18px;
            height: 18px;
            border-width: 2px 2px 0 0;
            animation-delay: 400ms;
          }
          
          .wifi-circle.third {
            width: 12px;
            height: 12px;
            border-width: 2px 2px 0 0;
            animation-delay: 800ms;
          }
          
          .wifi-circle.fourth {
            width: 6px;
            height: 6px;
            background-color: #dc3545;
            opacity: 1;
            animation: none;
          }
          
          .z-index-50 { z-index: 1050; }
        `}
      </style>
    </div>
  ) : null // Properly handle the case when online
}
