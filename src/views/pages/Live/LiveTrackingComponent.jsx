'use client'

/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { LoaderComponent } from './Loader'
import { useVehicleTrack } from './useVehicleTrack'
import { RecenterMap } from './useRecenterMap'
import NetworkStatusOverlay from '../../theme/livetrack/NetworkStatusOverlay'
import TimerPopup from './TimerPopup'
import useGetVehicleIcon from '../../Reports/HistoryReport/useGetVehicleIcon'
import MapFunctions from './MapFunctions'
import Draggable from 'react-draggable'
import { CCard, CCardBody } from '@coreui/react'
import useVehicleImage from '../../Reports/HistoryReport/useVehicleImage'
import './styles.css'
import axios from 'axios'
import MobileVehiclePanel from './MobileVehiclePanel'
import { useLocation } from 'react-router-dom'

const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t) // Easing function for smooth animation

const LiveTrackingMap = ({ token }) => {
  const { position, timerCount, showTimer, tokenExpired } = useVehicleTrack(token)
  const icon = useGetVehicleIcon(position, position?.category)
  const [path, setPath] = useState([])
  const previousPosition = useRef(null)
  const animationRef = useRef(null)
  const [animatedPosition, setAnimatedPosition] = useState(null)
  const [isSatelliteView, setIsSatelliteView] = useState(false)
  const [autoFocusEnabled, setAutoFocusEnabled] = useState(true)
  const [showTraffic, setShowTraffic] = useState(false)
  const toggleMapView = () => setIsSatelliteView(!isSatelliteView)
  const [address, setAddress] = useState('')
  const vehicleImg = useVehicleImage(position?.category, position)

  function useQuery() {
    return new URLSearchParams(useLocation().search)
  }

  useEffect(() => {
    if (!position) return

    const start = previousPosition.current || position
    const end = position
    const duration = 3500 // Animation duration in milliseconds
    let startTime = null

    // Animation function
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
        if (!lastPoint || distance > 0.0000005) {
          return [...prevPath, currentPoint]
        }
        return prevPath
      })

      // Update the map view
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

  // Fetch address using vehicle coordinates
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const apiKey = 'huWGT6bXG3aRcdvLhkca' // Replace with your actual MapTiler API key
        const response = await axios.get(
          `https://api.maptiler.com/geocoding/${position?.longitude},${position?.latitude}.json?key=${apiKey}&language=en`, // Added language parameter
        )
        if (response.data.features.length > 0) {
          setAddress(response.data.features[0].place_name) // Use place_name instead of place_name_en
        } else {
          setAddress('Address not found')
        }
      } catch (error) {
        console.error('Error fetching the address:', error)
        setAddress('Error fetching address')
      }
    }

    if (position?.latitude && position?.longitude) {
      fetchAddress()
    }
  }, [position])

  if (!position || !animatedPosition) return <LoaderComponent tokenExpired={tokenExpired} /> // Loading state

  return (
    <>
      {/* Map Component */}
      <MapContainer
        center={[position.latitude, position.longitude]}
        zoom={15}
        style={{ height: '100vh', width: '100%' }}
      >
        <MapFunctions
          toggleMapView={toggleMapView}
          isSatelliteView={isSatelliteView}
          autoFocusEnabled={autoFocusEnabled}
          setAutoFocusEnabled={setAutoFocusEnabled}
          showTraffic={showTraffic}
          setShowTraffic={setShowTraffic}
          individualSalesMan={position}
        />

        {/* Network Status Overlay */}
        <NetworkStatusOverlay position="center" isOnline={position?.network} />

        {/* Map Tile Layer */}
        <TileLayer
          url={
            isSatelliteView
              ? 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
          attribution="&copy; Credence Tracker, HB Gadget Solutions Nagpur"
        />

        {showTraffic && (
          <TileLayer
            url="https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=WI92B5fNrRuw3y9wnNVFbF10gosmx1h2"
            attribution="Traffic data © 2024 TomTom"
          />
        )}

        {/* Animated Marker */}
        <Marker position={[animatedPosition.latitude, animatedPosition.longitude]} icon={icon} />

        {/* Polyline */}
        {path.length > 1 && <Polyline positions={path} color="blue" />}

        {autoFocusEnabled && (
          <RecenterMap lat={animatedPosition.latitude} lng={animatedPosition.longitude} />
        )}

        {/* Draggable Vehicle Panel */}
        <Draggable bounds="parent">
          <CCard className="mb-4 parametersContainer shadow" style={{ zIndex: '555' }}>
            <CCardBody>
              <div className="row">
                <div className="col-7 mt-3">
                  <h6 className="fw-bold text-decoration-underline">
                    {position?.name ? position?.name : 'User Name'}
                  </h6>
                  <p>{address ? `${address}` : 'Address of User'}</p>
                  <div className="d-flex align-items-center gap-1 mt-2 mb-2">
                    <i className="bi bi-clock-history text-secondary small"></i>
                    <span className="text-secondary ">
                      Last Update:
                      <span className="text-dark fw-semibold ms-1 font-monospace">
                        {position?.lastUpdate
                          ? new Date(position.lastUpdate).toLocaleString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: 'numeric',
                              month: 'short',
                            })
                          : 'N/A'}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="col-5">
                  <img src={vehicleImg || '/placeholder.svg'} className="nimg" alt="vehicle" />
                </div>
              </div>
              <div className="row gap-3 justify-content-center">
                <div className="col-2 text-center attribute shadow">
                  <strong>{`${position?.attributes?.ignition ? 'On' : 'Off'}`}</strong>
                  <br />
                  <p className="p-0 m-0">Ignition</p>
                </div>
                <div className="col-2 text-center attribute shadow">
                  <strong>{`${Math.round(position?.speed).toFixed(2)}`}</strong>
                  <small> km/h</small>
                  <br />
                  <p className="p-0 m-0">Speed</p>
                </div>
                <div className="col-2 text-center attribute shadow">
                  <strong>{`${Math.round(position?.todayDistance)}`}</strong>
                  <small> KM</small>
                  <br />
                  <p className="p-0 m-0">Distance</p>
                </div>
                <div className="col-2 text-center attribute shadow">
                  <strong>{`${position?.attributes?.motion ? 'Yes' : 'No'}`}</strong>
                  <br />
                  <p className="p-0 m-0">Moving</p>
                </div>
                <div className="col-2 text-center attribute shadow">
                  <strong>{`${position?.category}`}</strong>
                  <br />
                  <p className="p-0 m-0">
                    <small>Category</small>
                  </p>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </Draggable>

        {/* Mobile Vehicle Panel */}
        <MobileVehiclePanel position={position} address={address} />

        {/* Timer Popup */}
        {showTimer && <TimerPopup timerCount={timerCount} />}
      </MapContainer>
    </>
  )
}

// PropTypes for LiveTrackingMap
LiveTrackingMap.propTypes = {
  token: PropTypes.string.isRequired,
}

export default LiveTrackingMap
