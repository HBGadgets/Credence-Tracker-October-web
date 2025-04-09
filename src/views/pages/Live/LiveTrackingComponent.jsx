/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useParams } from 'react-router-dom'
import { LoaderComponent } from './Loader'
import { useVehicleTrack } from './useVehicleTrack'
import { RecenterMap } from './useRecenterMap'
import NetworkStatusOverlay from '../../theme/livetrack/NetworkStatusOverlay'

const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

const LiveTrackingMap = () => {
  const { token } = useParams()
  const { position } = useVehicleTrack(token)
  const [path, setPath] = useState([])
  const previousPosition = useRef(null)
  const animationRef = useRef(null)
  const [animatedPosition, setAnimatedPosition] = useState(null)

  useEffect(() => {
    if (!position) return

    const start = previousPosition.current || position
    const end = position
    const duration = 4000
    let startTime = null

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = easeInOutQuad(progress)

      const lat = start.latitude + (end.latitude - start.latitude) * eased
      const lng = start.longitude + (end.longitude - start.longitude) * eased

      const currentPoint = [lat, lng]
      setAnimatedPosition({ latitude: lat, longitude: lng })

      // Gradually add points to the polyline
      setPath((prevPath) => {
        const lastPoint = prevPath[prevPath.length - 1]
        const distance =
          lastPoint && Math.hypot(currentPoint[0] - lastPoint[0], currentPoint[1] - lastPoint[1])

        // Only add if the point is far enough to avoid clutter
        if (!lastPoint || distance > 0.00005) {
          return [...prevPath, currentPoint]
        }
        return prevPath
      })

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        previousPosition.current = position
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [position])

  if (!position || !animatedPosition) return <LoaderComponent />

  return (
    <>
      <MapContainer
        center={[position.latitude, position.longitude]}
        zoom={15}
        style={{ height: '100vh', width: '100%' }}
      >
        <NetworkStatusOverlay position="center" isOnline={position?.network} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; Credence Tracker, HB Gadget Solutions Nagpur"
        />

        <Marker position={[animatedPosition.latitude, animatedPosition.longitude]} />

        {path.length > 1 && <Polyline positions={path} color="blue" />}

        <RecenterMap lat={animatedPosition.latitude} lng={animatedPosition.longitude} />
      </MapContainer>
    </>
  )
}

export default LiveTrackingMap
