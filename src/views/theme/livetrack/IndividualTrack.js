import React, { useContext, useEffect, useState, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
  Polygon,
  Circle,
  useMapEvents,
} from 'react-leaflet'
import { BsFillGeoFill } from 'react-icons/bs'
import L, { latLng } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import axios from 'axios'
import useVehicleTracker from './useVehicleTracker'
import { useNavigate, useParams } from 'react-router-dom'
import location from 'src/assets/location.png'
import { duration } from 'dayjs'
import { Eye, EyeOff } from 'lucide-react'
import ReactLeafletDriftMarker from 'react-leaflet-drift-marker'
import './IndividualTrack.css'
import Draggable from 'react-draggable'

import '../../Reports/style/remove-gutter.css'
import useGetVehicleIcon from '../../Reports/HistoryReport/useGetVehicleIcon'
import useVehicleImage from '../../Reports/HistoryReport/useVehicleImage'
import { IoMdSpeedometer } from 'react-icons/io'
import { HiOutlineStatusOnline } from 'react-icons/hi'
import { RxLapTimer } from 'react-icons/rx'
import { IoLocationSharp } from 'react-icons/io5'

import dayjs from 'dayjs'
import { FaSatellite } from 'react-icons/fa'
import Cookies from 'js-cookie'
import IconDropdown from '../../../components/ButtonDropdown'
import { HiOutlineLogout } from 'react-icons/hi'
import { MdDashboard } from 'react-icons/md'
import { Select, Slider } from '@mui/material'
import zIndex from '@mui/material/styles/zIndex'
import toast, { Toaster } from 'react-hot-toast'

const accessToken = Cookies.get('authToken')

function pointInPolygon(point, vs) {
  const x = point[1],
    y = point[0]
  let inside = false
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][1],
      yi = vs[i][0]
    const xj = vs[j][1],
      yj = vs[j][0]
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function interpolatePoints(start, end, steps) {
  const interpolated = []
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    interpolated.push([start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t])
  }
  return interpolated
}

// Updated MapController.jsx
const MapController = ({ individualSalesMan, previousPosition, polylineRef, autoFocusEnabled }) => {
  const map = useMap()
  const animationRef = useRef(null)

  // Easing function: easeInOutQuad
  const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

  useEffect(() => {
    if (individualSalesMan && map && autoFocusEnabled) {
      const { latitude, longitude } = individualSalesMan
      const targetPosition = [latitude, longitude]

      // If we have a previous position, animate from there to the new position.
      if (previousPosition.current) {
        const { latitude: prevLat, longitude: prevLon } = previousPosition.current
        const duration = 2000 // duration in milliseconds for smooth transition
        let startTime

        const animateMarker = (timestamp) => {
          if (!startTime) startTime = timestamp
          const elapsedTime = timestamp - startTime
          const progress = Math.min(elapsedTime / duration, 1)
          const easedProgress = easeInOutQuad(progress)

          // Calculate the new marker position
          const newLat = prevLat + (latitude - prevLat) * easedProgress
          const newLon = prevLon + (longitude - prevLon) * easedProgress

          // Update polyline in real-time using ref
          if (polylineRef.current) {
            const currentPath = polylineRef.current.getLatLngs()
            currentPath.push([newLat, newLon])
            polylineRef.current.setLatLngs(currentPath)
          }

          // Optionally update the map view as the marker moves
          map.setView([newLat, newLon], map.getZoom(), { animate: true })

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animateMarker)
          } else {
            // Ensure we finish at the target position and update the ref
            map.setView(targetPosition, 16, { animate: true })
            previousPosition.current = individualSalesMan
          }
        }

        animationRef.current = requestAnimationFrame(animateMarker)

        return () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
          }
        }
      } else {
        // If there is no previous position, simply add the current position
        if (polylineRef.current) {
          const currentPath = polylineRef.current.getLatLngs()
          currentPath.push(targetPosition)
          polylineRef.current.setLatLngs(currentPath)
        }
        map.setView(targetPosition, 16, { animate: true })
        previousPosition.current = individualSalesMan
      }
    }
  }, [individualSalesMan, map, autoFocusEnabled, previousPosition, polylineRef])

  return null
}

const IndividualTrack = () => {
  const [autoFocusEnabled, setAutoFocusEnabled] = useState(true)
  const { deviceId, category, name } = useParams()
  const { vehicleData, loading, error } = useVehicleTracker(deviceId)
  const [individualSalesMan, setIndividualSalesMan] = useState(null)
  const [address, setAddress] = useState(null)
  const previousPosition = useRef(null) // Ref to store the previous position
  const [path, setPath] = useState([]) // State for polyline path
  const [geofences, setGeofences] = useState([]) // state for geofence circle data
  const [polygonData, setPolygonData] = useState([]) // state for geofence polygon data
  // Toggle state for geofence display
  const [showGeofence, setShowGeofence] = useState(true)
  // State to track which geofences the vehicle is currently inside
  const [activeGeofences, setActiveGeofences] = useState([])
  const [clickedPosition, setClickedPosition] = useState(null)
  const [formData, setFormData] = useState({})
  const [clickMap, setClickMap] = useState(false)
  const [radiusSlider, setRadiusSlider] = useState(0)
  const [geofenceName, setGeofencesName] = useState('')
  const [geofenceType, setGeofencesType] = useState()
  // Add this state at the top of the component
  const [enableAddGeofence, setEnableAddGeofence] = useState(false)
  const polylineRef = useRef(null) // Ref for polyline instance

  const PlaceType = [
    { value: 'ATM', label: 'ATM' },
    { value: 'Airport', label: 'Airport' },
    { value: 'Bank', label: 'Bank' },
    { value: 'Beach', label: 'Beach' },
    { value: 'Bus_Stop', label: 'Bus Stop' },
    { value: 'Restaurant', label: 'Restaurant' },
    { value: 'Dairy', label: 'Dairy' },
    { value: 'District', label: 'District' },
    { value: 'Facility', label: 'Facility' },
    { value: 'Factory', label: 'Factory' },
    { value: 'Fuel_Station', label: 'Fuel Station' },
    { value: 'Highway_point', label: 'Highway Point' },
    { value: 'Home', label: 'Home' },
    { value: 'Hospital', label: 'Hospital' },
    { value: 'Hotel', label: 'Hotel' },
    { value: 'Mosque', label: 'Mosque' },
    { value: 'Office', label: 'Office' },
    { value: 'Other', label: 'Other' },
    { value: 'Police_Station', label: 'Police Station' },
    { value: 'Post_Office', label: 'Post Office' },
    { value: 'Railway_Station', label: 'Railway Station' },
    { value: 'Recycle_Station', label: 'Recycle Station' },
    { value: 'School', label: 'School' },
    { value: 'Traffic_Signal', label: 'Traffic Signal' },
    { value: 'State_Border', label: 'State Border' },
    { value: 'Sub_Division', label: 'Sub Division' },
    { value: 'Temple', label: 'Temple' },
    { value: 'Theater', label: 'Theater' },
    { value: 'Theme_Park', label: 'Theme Park' },
    { value: 'Toll_Gate', label: 'Toll Gate' },
    { value: 'Tunnel', label: 'Tunnel' },
    { value: 'University', label: 'University' },
    { value: 'Way_Bridge', label: 'Way Bridge' },
    { value: 'Sensative_Points', label: 'Sensitive Points' },
    { value: 'Dumping_Yard', label: 'Dumping Yard' },
    { value: 'Mine', label: 'Mine' },
    { value: 'No_POI_Report', label: 'No POI Report' },
    { value: 'Entry_Restriction', label: 'Entry Restriction' },
    { value: 'Tyre_Shop', label: 'Tyre Shop' },
    { value: 'Workshop', label: 'Workshop' },
    { value: 'Yard', label: 'Yard' },
    { value: 'Parking_Place', label: 'Parking Place' },
    { value: 'Driver_Home', label: 'Driver Home' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Puspakom', label: 'Puspakom' },
    { value: 'Exit_Restriction', label: 'Exit Restriction' },
    { value: 'Gurudwara', label: 'Gurudwara' },
    { value: 'Church', label: 'Church' },
    { value: 'Distributor', label: 'Distributor' },
    { value: 'State', label: 'State' },
    { value: 'WaterFall', label: 'WaterFall' },
    { value: 'Depot', label: 'Depot' },
    { value: 'Terminal', label: 'Terminal' },
    { value: 'Port', label: 'Port' },
  ]

  const popupStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  }

  const cardStyle = {
    width: '400px',
    maxWidth: '100%',
    padding: '24px',
    border: 'none',
  }

  const formGroupStyle = {
    marginBottom: '1rem',
  }

  const sliderContainerStyle = {
    marginBottom: '1rem',
  }

  const sliderLabelStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  }

  // Toggle handler
  const handleToggleGeofence = () => {
    setShowGeofence((prevState) => !prevState)
  }

  // fetch vehicle data
  useEffect(() => {
    if (vehicleData) {
      setIndividualSalesMan(vehicleData[0])
      console.log(vehicleData[0])
    }
  }, [vehicleData])

  // Fetch address using vehicle coordinates
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const apiKey = 'huWGT6bXG3aRcdvLhkca' // Replace with your actual MapTiler API key
        const response = await axios.get(
          `https://api.maptiler.com/geocoding/${individualSalesMan?.longitude},${individualSalesMan?.latitude}.json?key=${apiKey}`,
        )
        if (response.data.features.length <= 5) {
          setAddress(response.data.features[0].place_name_en)
        } else {
          setAddress(response.data.features[1].place_name_en)
        }
      } catch (error) {
        console.error('Error fetching the address:', error)
        setAddress('Error fetching address')
      }
    }

    if (individualSalesMan?.latitude && individualSalesMan?.longitude) {
      fetchAddress()
    }
  }, [individualSalesMan])

  // NEW: Fetch geofence data for this vehicle
  const fetchGeofences = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/geofence/${deviceId}`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })

      // Process circle geofences
      const circleData = (data) => {
        return data
          .filter((item) => item.area.length === 1 && item.area[0].circle)
          .map((item) => {
            const match = item.area[0].circle.match(/Circle\(([\d.]+) ([\d.]+), ([\d.]+)\)/)
            if (match) {
              return {
                name: item.name,
                lat: parseFloat(match[1]), // Extract latitude
                lng: parseFloat(match[2]), // Extract longitude
                radius: parseFloat(match[3]), // Extract radius in meters
              }
            }
            return null
          })
          .filter(Boolean)
      }

      // Process polygon geofences
      const polygon = (data) => {
        return data
          .filter((item) => item.area.length > 1)
          .map((item) => {
            const coordinates = item.area.map((coord) => [coord.lat, coord.lng])
            if (coordinates) {
              return {
                name: item.name,
                coordinates,
              }
            }
          })
          .filter(Boolean)
      }

      console.log('Fetch GEOFENCE', response.data)
      console.log('FETCH GEOFENCE POLYGON', polygon(response.data))
      setGeofences(circleData(response.data))
      setPolygonData(polygon(response.data))
    } catch (error) {
      console.error('Error fetching geofences:', error)
    }
  }
  useEffect(() => {
    fetchGeofences()
  }, [deviceId])

  // Check if the vehicle is inside any geofence (circle or polygon)
  useEffect(() => {
    if (individualSalesMan) {
      const currentPoint = [individualSalesMan.latitude, individualSalesMan.longitude]
      const active = []

      // Check circles
      geofences.forEach((g) => {
        const center = [g.lat, g.lng]
        const distance = L.latLng(currentPoint).distanceTo(L.latLng(center))
        if (distance <= g.radius) {
          active.push(g.name)
        }
      })

      // Check polygons
      polygonData.forEach((p) => {
        if (pointInPolygon(currentPoint, p.coordinates)) {
          active.push(p.name)
        }
      })

      setActiveGeofences(active)
    }
  }, [individualSalesMan, geofences, polygonData])

  console.log('Active Geofences:', activeGeofences)
  console.log('SETTING GEOFENCE', geofences)

  const navigate = useNavigate()
  const iconImage = (item, category) => useGetVehicleIcon(item, category)
  const vehicleImage = (category, item) => useVehicleImage(category, item)
  const handleClickOnTrack = (vehicle) => {
    console.log('track clicked')
    navigate(`/history/${deviceId}/${category}/${name}`)
  }
  const [isSatelliteView, setIsSatelliteView] = useState(false)

  const toggleMapView = () => {
    setIsSatelliteView((prev) => !prev)
  }

  const handleLogout = () => {
    Cookies.remove('authToken')
    window.location.href = '/login'
  }

  const backToDashboard = () => {
    navigate(-1)
  }

  const dropdownItems = [
    {
      icon: MdDashboard,
      label: 'Back To Dashboard',
      onClick: () => backToDashboard(),
    },
    {
      icon: HiOutlineLogout,
      label: 'Logout',
      onClick: () => handleLogout(),
    },
  ]

  // Component to handle map click events
  function ClickHandler({ onClick }) {
    useMapEvents({
      click(e) {
        onClick(e.latlng)
        setClickMap(true)
      },
    })
    return null
  }

  // New function: Only sets the clicked position
  const handleMapClick = (latlng) => {
    console.log('Map clicked at:', latlng)
    setClickedPosition(latlng)
    // Optionally set a flag to show the popup form if needed
    setClickMap(true)
  }

  const handleAddGeofence = async () => {
    if (!clickedPosition) return

    const formData = {
      name: geofenceName,
      type: geofenceType,
      area: [{ circle: `Circle(${clickedPosition.lat} ${clickedPosition.lng}, ${radiusSlider})` }],
      deviceIds: [deviceId],
    }

    console.log('Form Data:', formData)
    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/geofence`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      toast.success('Geofence added successfully')
      fetchGeofences()
      // Reset form values after successful creation
      setGeofencesName('')
      setGeofencesType('')
      setRadiusSlider(0)
      setClickedPosition(null)
      setClickMap(false) // Hide the popup after adding the geofence
    } catch (error) {
      console.log(error.message)
    }
  }
  return (
    <>
      <Toaster />
      <div className="row gutter-0">
        <div className="col-12 position-relative">
          <div className="individualMap position-relative border border-5 ">
            <MapContainer
              center={[21.1458, 79.0882]} // Default center in case data isn't available
              zoom={13}
              style={{
                height: '87vh',
                marginTop: '7px',
                border: '1px solid black',
                borderRadius: '5px',
              }}
            >
              <div className="toggle-map-view" onClick={toggleMapView}>
                <FaSatellite />
              </div>
              <button
                title={autoFocusEnabled ? 'Disable auto-focus' : 'Enable auto-focus'}
                onClick={() => setAutoFocusEnabled(!autoFocusEnabled)}
                className="toggle-auto-focus-view btn"
                style={{ backgroundColor: autoFocusEnabled ? '#1976d2' : '#666' }}
              >
                🎯
              </button>

              <button
                className="btn toggle-geofence-view"
                onClick={() => setEnableAddGeofence(() => !enableAddGeofence)}
                title={enableAddGeofence ? 'Disable Add Geofence' : 'Enable Add Geofence'}
              >
                <BsFillGeoFill size={12} />
              </button>
              <TileLayer
                url={
                  isSatelliteView
                    ? 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' // Satellite View
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' // Normal View
                }
                attribution="&copy; Credence Tracker, HB Gadget Solutions Nagpur"
              />

              {/* Attach our click handler to the map */}
              {enableAddGeofence && (
                <>
                  <ClickHandler onClick={handleMapClick} />
                  {clickedPosition && (
                    <Marker
                      position={clickedPosition}
                      eventHandlers={{
                        click: () => setAutoFocusEnabled(false), // Disable autofocus on marker click
                      }}
                    >
                      <Popup style={popupStyle}>
                        <div className="row justify-content-center">
                          <div className="col-12" style={{ maxWidth: '400px' }}>
                            {clickMap && (
                              <div className="card" style={cardStyle}>
                                <div style={formGroupStyle}>
                                  <label className="form-label">Geofence Name</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={geofenceName}
                                    onChange={(e) => setGeofencesName(e.target.value)}
                                    placeholder="Enter geofence name"
                                  />
                                </div>

                                <div style={formGroupStyle}>
                                  <label className="form-label">Geofence Type</label>
                                  <select
                                    className="form-select"
                                    onChange={(e) => setGeofencesType(e.target.value)}
                                    value={geofenceType}
                                    style={{ fontSize: '15px' }}
                                  >
                                    <option value="" selected disabled>
                                      Select geofence type
                                    </option>
                                    {PlaceType.map((item, index) => (
                                      <option key={index} value={item.value}>
                                        {item.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div style={sliderContainerStyle}>
                                  <div style={sliderLabelStyle}>
                                    <label className="form-label mb-0">Radius</label>
                                    <span className="text-muted">{radiusSlider}m</span>
                                  </div>
                                  <input
                                    type="range"
                                    className="form-range"
                                    min="0"
                                    max="200"
                                    value={radiusSlider / 2}
                                    onChange={(e) => setRadiusSlider(Number(e.target.value) * 2)}
                                  />
                                </div>

                                <button
                                  onClick={() => {
                                    handleAddGeofence()
                                    setAutoFocusEnabled(true) // Enable autofocus after geofence submission
                                  }}
                                  className="btn btn-primary w-100"
                                >
                                  Add Geofence
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </>
              )}

              {clickedPosition && (
                <Circle
                  center={[clickedPosition.lat, clickedPosition.lng]}
                  radius={radiusSlider}
                  pathOptions={{
                    color: '#0a2d63', // Or apply dynamic logic if needed
                    fillColor: '#A1E3F9',
                    fillOpacity: 0.3,
                  }}
                />
              )}

              <button
                title={showGeofence ? 'Hide Geofence' : 'View Geofence'}
                onClick={handleToggleGeofence}
                className="geofence-button btn"
              >
                {showGeofence ? (
                  <EyeOff color="black" size={18} />
                ) : (
                  <Eye color="black" size={18} />
                )}
              </button>

              {/* Render Polygons with dynamic color */}
              {showGeofence &&
                polygonData.map((polygon, index) => (
                  <Polygon
                    key={index}
                    positions={polygon.coordinates}
                    pathOptions={{
                      color: activeGeofences.includes(polygon.name) ? 'red' : '#0a2d63',
                      fillColor: activeGeofences.includes(polygon.name) ? 'red' : '#A1E3F9',
                      fillOpacity: 0.3,
                    }}
                  >
                    <Popup>
                      <strong>{polygon.name}</strong>
                    </Popup>
                  </Polygon>
                ))}

              {/* Render Circles with dynamic color */}
              {showGeofence &&
                geofences.map((location, index) => (
                  <Circle
                    key={index}
                    center={[location.lat, location.lng]}
                    radius={location.radius} // Radius in meters
                    pathOptions={{
                      color: activeGeofences.includes(location.name) ? 'red' : '#0a2d63',
                      fillColor: activeGeofences.includes(location.name) ? 'red' : '#A1E3F9',
                      fillOpacity: 0.3,
                      weight: 1,
                    }}
                  >
                    <Popup>
                      <strong>{location.name}</strong> <br />
                      Radius: {location.radius}
                    </Popup>
                  </Circle>
                ))}

              <Draggable bounds="parent">
                <CCard className="mb-4 parametersContainer shadow" style={{ zIndex: '555' }}>
                  <CCardBody>
                    <div className="row">
                      <div className="col-7 mt-3">
                        <h6 className="fw-bold text-decoration-underline">
                          {name ? name : 'User Name'}
                        </h6>
                        <p>{address ? `${address}` : 'Address of User'}</p>
                      </div>
                      <div className="col-5">
                        <img
                          src={vehicleImage(category, individualSalesMan)}
                          className="nimg "
                          alt="vehicle"
                        />
                      </div>
                    </div>
                    <div className="row gap-3 justify-content-center">
                      <div className="col-2 text-center attribute shadow">
                        <strong>{`${individualSalesMan?.attributes?.ignition ? 'On' : 'Off'}`}</strong>
                        <br />
                        <p className="p-0 m-0">Ignition</p>
                      </div>
                      <div className="col-2 text-center attribute shadow">
                        <strong>{`${Math.round(individualSalesMan?.speed).toFixed(2)}`}</strong>
                        <small> km/h</small>
                        <br />
                        <p className="p-0 m-0">Speed</p>
                      </div>
                      <div className="col-2 text-center attribute shadow">
                        <strong>{`${Math.round(individualSalesMan?.attributes?.distance)}`}</strong>
                        <small> M</small>
                        <br />
                        <p className="p-0 m-0">Distance</p>
                      </div>
                      <div className="col-2 text-center attribute shadow">
                        <strong>{`${individualSalesMan?.attributes?.motion ? 'Yes' : 'No'}`}</strong>
                        <br />
                        <p className="p-0 m-0">Moving</p>
                      </div>
                      <div className="col-2 text-center attribute shadow">
                        <strong>{`${category}`}</strong>
                        <br />
                        <p className="p-0 m-0">
                          <small>Category</small>
                        </p>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </Draggable>
              {individualSalesMan && (
                <ReactLeafletDriftMarker
                  position={[individualSalesMan.latitude, individualSalesMan.longitude]}
                  icon={iconImage(individualSalesMan, category)}
                  duration={2000}
                >
                  <Popup>
                    <div className="toolTip">
                      <span style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                        <strong>{name ? name : 'User Name'}</strong>
                      </span>
                      <hr
                        style={{
                          width: '100%',
                          height: '3px',
                          marginBottom: '0px',
                          marginTop: '5px',
                          borderRadius: '5px',
                          backgroundColor: '#000',
                        }}
                      />
                      <div className="toolTipContent">
                        <div>
                          <strong>
                            <RxLapTimer size={17} color="#FF7A00" />
                          </strong>{' '}
                          {dayjs(individualSalesMan.lastUpdate).format('DD-MM-YYYY HH:mm')}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'start',
                            gap: '10px',
                          }}
                        >
                          <div>
                            <strong>
                              <IoMdSpeedometer size={17} color="#FF7A00" />
                            </strong>{' '}
                            {(individualSalesMan?.speed).toFixed(2)} km/h{' '}
                          </div>
                        </div>
                        <div>
                          <strong>
                            <HiOutlineStatusOnline size={17} color="#FF7A00" />
                          </strong>{' '}
                          {(() => {
                            const sp = individualSalesMan.speed
                            const ig = individualSalesMan.attributes.ignition
                            if (sp < 1 && ig === false) {
                              return 'Stopped'
                            }
                            if (sp < 2 && ig === true) {
                              return 'Idle'
                            }
                            if (sp > 2 && sp < 60 && ig === true) {
                              return 'Running'
                            }
                            if (sp > 60 && ig === true) {
                              return 'Over Speed'
                            } else {
                              return 'Inactive'
                            }
                          })()}
                        </div>

                        <span>
                          <strong>
                            <IoLocationSharp size={17} color="#FF7A00" />
                          </strong>
                          {address ? address : 'Loading...'}
                        </span>


                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                          }}
                        >
                          <button
                            className="btn"
                            style={{
                              width: '100%',
                              color: 'white',
                              fontSize: '0.8rem',
                              backgroundColor: '#000000',
                            }}
                            onClick={() => handleClickOnTrack(individualSalesMan)}
                          >
                            View History
                          </button>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </ReactLeafletDriftMarker>
              )}
              {/* Draw polyline based on path */}
              <Polyline ref={polylineRef} positions={path} color="blue" weight={3} />
              <MapController
                individualSalesMan={individualSalesMan}
                previousPosition={previousPosition}
                polylineRef={polylineRef}
                autoFocusEnabled={autoFocusEnabled}
              />
            </MapContainer>
          </div>
        </div>
      </div>
      <div className="position-fixed bottom-0 end-0 mb-5 m-3 z-5" style={{ zIndex: '1000' }}>
        <IconDropdown items={dropdownItems} />
      </div>
    </>
  )
}

export default IndividualTrack
