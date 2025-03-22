import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import useHistoryData from './useHistoryData'
import ReactLeafletDriftMarker from 'react-leaflet-drift-marker'
import DriftMarker from 'react-leaflet-drift-marker'
import { IoMdPause, IoMdPlay } from 'react-icons/io'
import { FaForward, FaBackward } from 'react-icons/fa'
import { FaSatellite } from 'react-icons/fa6'
import { CButton } from '@coreui/react'
import useStoppageTimes from './useStoppageTimes.js'
import useVehicleImage from './useVehicleImage.js'
import useGetVehicleIcon from './useGetVehicleIcon.js'
import location from '../../../assets/location.svg'
import HistoryLoader from './HistoryLoader.js'
import { MdOutlineKeyboardDoubleArrowUp } from 'react-icons/md'
import ReactDOMServer from 'react-dom/server'
import { Line } from 'react-chartjs-2'
import redFlag from '../../../assets/red-flag-svgrepo-com.svg'
import greenFlag from '../../../assets/green.svg'
import {
  Chart as ChartJS,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js'
import { Scrollbars } from 'react-custom-scrollbars-2'
import SlidingSideMenu from './SlidingSideMenu'
import axios from 'axios'

// Register Chart.js components
ChartJS.register(LineElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement)

const createNumberedIcon = (number) => {
  return L.divIcon({
    className: 'custom-marker', // Optional custom class for styling
    html: `
      <div style="position: relative; width: 42px; height: 42px;">
        <img src="${location}" alt="location" style="width: 100%; height: 100%;" />
        <div style="
          position: absolute;
    top: 33%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: bold;
    color: black;
    text-shadow: 0 0 2px black;
    background-color: white !important;
    border-radius: 50%;
    border: 1px solid black;
    width: 48%;
    display: flex
;
    align-items: center;
    justify-content: center;
        ">
          ${number}
        </div>
      </div>
    `,
    iconSize: [32, 32], // Size of the icon
    iconAnchor: [16, 32], // Anchor point
    popupAnchor: [0, -32], // Popup position
  })
}
const redFlagIcon = L.icon({
  iconUrl: redFlag, // Path to your custom icon (e.g., PNG or SVG)
  iconSize: [32, 32], // Size of the icon
  iconAnchor: [16, 32], // Anchor point of the icon (where the marker is placed)
  popupAnchor: [0, -32], // Popup position relative to the icon
})
const greenFlagIcon = L.icon({
  iconUrl: greenFlag, // Path to your custom icon (e.g., PNG or SVG)
  iconSize: [32, 32], // Size of the icon
  iconAnchor: [16, 32], // Anchor point of the icon (where the marker is placed)
  popupAnchor: [0, -32], // Popup position relative to the icon
})
const HistoryMap = ({
  fromDateTime,
  toDateTime,
  deviceId,
  fetch,
  setFetch,
  historyOn,
  setHistoryOn,
  category,
  name,
}) => {
  const { data, loading } = useHistoryData(
    `${import.meta.env.VITE_API_URL}/history/device-history-playback`,
    { deviceId, from: fromDateTime, to: toDateTime },
    fetch,
  )
  const { data: stopData } = useHistoryData(
    `${import.meta.env.VITE_API_URL}/history/device-stopage`,
    { deviceId, from: fromDateTime, to: toDateTime },
    fetch,
  )
  const { data: tripData } = useHistoryData(
    `${import.meta.env.VITE_API_URL}/history/show-only-device-trips-startingpoint-endingpoint`,
    { deviceId, from: fromDateTime, to: toDateTime },
    fetch,
  )

  console.log('PLAYBACK DATA######################################', data)
  console.log(
    'TRIP DATA ######################################################################',
    tripData,
  )
  // console.log('return data' + stopData)
  // console.log(
  //   'HISTORY PLAY BACK DATE######################################################################################',
  //   fromDateTime,
  // )
  // console.log(
  //   'HISTORY PLAY BACK DATE######################################################################################',
  //   toDateTime,
  // )
  const [positions, setPositions] = useState([])
  const [stopages, setStopages] = useState(stopData?.finalDeviceDataByStopage || [])
  const [showStopages, setShowStopages] = useState(true)
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(2)
  const [zoomLevel, setZoomLevel] = useState(14)
  const [progress, setProgress] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [trips, setTrips] = useState([])
  const [totalTrips, setTotalTrips] = useState(0)
  const [longestTrip, setLongestTrip] = useState(null)
  const [startAddress, setStartAddress] = useState('')
  const [endAddress, setEndAddress] = useState('')
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [prevhoveredIndex, setPrevHoveredIndex] = useState(null)
  const [originalPositions, setOriginalPositions] = useState([])
  const [filteredPositions, setFilteredPositions] = useState([])

  const mapRef = useRef()
  useEffect(() => {
    if (tripData?.finalTrip) {
      setTrips(tripData.finalTrip)
      setTotalTrips(tripData.finalTrip.length)
      findLongestTrip(tripData.finalTrip)
    }
  }, [tripData])

  const findLongestTrip = (tripData) => {
    if (!tripData.length) return
    let longest = tripData[0]
    for (const trip of tripData) {
      const durationInMinutes = convertDurationToMinutes(trip.duration)
      const longestDurationInMinutes = convertDurationToMinutes(longest.duration)
      if (durationInMinutes > longestDurationInMinutes) {
        longest = trip
      }
    }
    setLongestTrip(longest)
    fetchAddress(longest.startLatitude, longest.startLongitude, setStartAddress)
    fetchAddress(longest.endLatitude, longest.endLongitude, setEndAddress)
  }

  const convertDurationToMinutes = (duration) => {
    const [hours, minutes] = duration.split(/h|m/).map((item) => parseInt(item.trim()) || 0)
    return hours * 60 + minutes
  }

  const fetchAddress = async (latitude, longitude, setAddress) => {
    const apiKey = 'CWVeoDxzhkO07kO693u0' // Replace with your MapTiler API key
    const addressUrl = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}`

    try {
      const response = await axios.get(addressUrl)
      const results = response.data?.features

      if (results && results.length > 0) {
        // Extract the relevant part for place/area and pincode
        console.log(results)
        const place = results[0]?.text || '' // Place/Area
        const pincode =
          results[0]?.context?.find((item) => item.id.startsWith('postal_code'))?.text ||
          'Unknown Pincode'

        setAddress(`${place}, ${pincode}`)
      } else {
        setAddress('Address not available')
      }
    } catch (error) {
      console.error('Error fetching address:', error)
      setAddress('Unable to fetch address')
    }
  }
  const fetchAddressStop = async (latitude, longitude) => {
    const apiKey = 'CWVeoDxzhkO07kO693u0' // Replace with your MapTiler API key
    const addressUrl = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}`

    try {
      const response = await axios.get(addressUrl)
      const results = response.data?.features

      if (results && results.length > 0) {
        // Extract the relevant part for place/area and pincode
        console.log(results)
        const place = results[0]?.text || 'Unknown Place'
        const pincode =
          results[0]?.context?.find((item) => item.id.startsWith('postal_code'))?.text ||
          'Unknown Pincode'

        return `${place}, ${pincode}`
      } else {
        return 'Address not available'
      }
    } catch (error) {
      console.error('Error fetching address:', error)
      return 'Unable to fetch address'
    }
  }

  // Calculate haversine distance
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degree) => (degree * Math.PI) / 180
    const R = 6371 // Earth's radius in km

    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in km
  }

  console.log(data, 'BEFORE DEVICEHISTORY DATA#############################################')
  // Filter data using useMemo for optimization
  // const filteredData = useMemo(() => {
  //   if (!data?.deviceHistory?.length) return []
  //   return data.deviceHistory.reduce((acc, current, i) => {
  //     if (
  //       i === 0 ||
  //       haversineDistance(
  //         acc[acc.length - 1].latitude,
  //         acc[acc.length - 1].longitude,
  //         current.latitude,
  //         current.longitude,
  //       ) >= 0.5
  //     ) {
  //       acc.push(current)
  //     }
  //     return acc
  //   }, [])
  // }, [data])

  const handleFilterData = (positions) => {
    setFilteredPositions(positions)
  }

  // Filter data using useMemo for optimization
  const filteredData = useMemo(() => {
    if (!data?.deviceHistory?.length) return []
    return data.deviceHistory
  }, [data])

  console.log(filteredData, 'AFTER DEVICEHISTORY DATA#############################################')

  // Update positions when data changes
  useEffect(() => {
    if (filteredData.length > 0) {
      setPositions(filteredData)
      setOriginalPositions(filteredData)
      setIsPlaying(true) // Start animation as soon as data is fetched
    }
  }, [filteredData])

  useEffect(() => {
    if (stopData?.finalDeviceDataByStopage?.length > 0) {
      setStopages(stopData.finalDeviceDataByStopage)
    }
  }, [stopData])

  // Create polyline data
  const poly = useMemo(() => positions.map((item) => [item.latitude, item.longitude]), [positions])

  const handleGraphHover = (index) => {
    if (!isPlaying) setIsPlaying(false)

    setHoveredIndex(index)
    setCurrentPositionIndex(index)
    if (isPlaying) setIsPlaying(true)
  }

  const handleGraphLeave = () => {
    setHoveredIndex(null)
    setIsPlaying(true)
    setCurrentPositionIndex(prevhoveredIndex)
  }

  const speedData = positions?.map((pos) => pos.speed) || []
  const labels = positions?.map((_, index) => index) || []

  const ChartData = useMemo(
    () => ({
      labels: positions.map((_, index) => index),
      datasets: [
        {
          label: 'Speed',
          data: positions.map((pos) => pos.speed.toFixed(2)),
          borderColor: 'rgba(31, 116, 38, 0.5)',
          backgroundColor: 'rgba(95, 237, 51, 0.5)',
          cubicInterpolationMode: 'monotone',
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 8,
          borderWidth: 2,
        },
      ],
    }),
    [positions],
  )

  const ChartOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          title: { display: true, text: 'Position Index' },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: 'Speed (km/h)' },
          grid: { drawBorder: false },
        },
      },
      plugins: {
        tooltip: {
          enabled: true,
          intersect: false,
          mode: 'index',
          callbacks: {
            label: (tooltipItem) => `Speed: ${tooltipItem.raw} km/h`,
          },
        },
        crosshair: {
          line: {
            color: 'rgba(0, 0, 0, 0.5)',
            width: 1,
          },
        },
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
      onHover: (event, chartElement) => {
        if (chartElement.length) {
          const index = chartElement[0].index
          setPrevHoveredIndex(currentPositionIndex)
          handleGraphHover(index)
        } else {
          handleGraphLeave()
        }
      },
    }),
    [positions, currentPositionIndex],
  )

  // console.log(poly)

  // Playback animation logic
  const [segmentProgress, setSegmentProgress] = useState(0)
  const startTimeRef = useRef(null)
  useEffect(() => {
    if (isPlaying && positions.length > 1) {
      const baseDuration = 650 // base duration in ms for one segment
      const duration = baseDuration / speed // adjust duration based on speed
      let animationFrame

      const animate = (timestamp) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp
        }
        const elapsed = timestamp - startTimeRef.current
        const t = Math.min(elapsed / duration, 1)
        setSegmentProgress(t)
        if (t < 1) {
          animationFrame = requestAnimationFrame(animate)
        } else {
          setCurrentPositionIndex((prev) => (prev + 1) % positions.length)
          setSegmentProgress(0)
          startTimeRef.current = null
          animationFrame = requestAnimationFrame(animate)
        }
      }

      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    }
  }, [isPlaying, currentPositionIndex, positions, speed])

  useEffect(() => {
    if (positions.length > 1) {
      const overallProgress =
        ((currentPositionIndex + segmentProgress) / (positions.length - 1)) * 100
      setProgress(overallProgress)
    }
  }, [currentPositionIndex, segmentProgress, positions.length])

  // Compute the current marker position using linear interpolation
  const currentMarkerPosition = useMemo(() => {
    if (positions.length === 0) return [0, 0]
    if (positions.length === 1) return [positions[0].latitude, positions[0].longitude]

    const validIndex = currentPositionIndex % positions.length
    const current = positions[validIndex]
    const next = positions[(validIndex + 1) % positions.length]

    console.log('currentPositionIndex:', currentPositionIndex, 'validIndex:', validIndex)
    console.log('current:', current, 'next:', next)

    const lerp = (start, end, t) => start + (end - start) * t
    const lat = lerp(current.latitude, next.latitude, segmentProgress)
    const lng = lerp(current.longitude, next.longitude, segmentProgress)
    return [lat, lng]
  }, [currentPositionIndex, segmentProgress, positions])

  console.log(
    'POSITIONS####################################################################',
    currentMarkerPosition,
  )

  const handlePlayPause = () => setIsPlaying((prev) => !prev)

  const handleForward = () =>
    setCurrentPositionIndex((prevIndex) => Math.min(prevIndex + 10, positions.length - 1))

  const handleBackward = () => setCurrentPositionIndex((prevIndex) => Math.max(prevIndex - 10, 0))

  const handleZoomChange = (level) => setZoomLevel(level)

  const MapZoomController = () => {
    const map = useMap()
    const [lastPosition, setLastPosition] = useState(null)

    useEffect(() => {
      if (positions.length > 0) {
        const currentPosition = positions[currentPositionIndex]
        if (
          !lastPosition ||
          Math.abs(currentPosition?.latitude - lastPosition?.latitude) > 0.001 ||
          Math.abs(currentPosition?.longitude - lastPosition?.longitude) > 0.001
        ) {
          // Only update the view if the position has changed significantly
          if ((currentPosition?.latitude, currentPosition?.longitude)) {
            map.setView([currentPosition?.latitude, currentPosition?.longitude])
            setLastPosition(currentPosition)
          }
        }
      }
    }, [currentPositionIndex, zoomLevel, map, positions, lastPosition])

    return null
  }

  const handleBack = (e) => {
    window.location.reload()
  }
  const toggleStopages = (e) => {
    e.preventDefault()
    if (fetch && !loading && (!stopages || stopages.length === 0))
      return alert('This vehicles has not taken any stop in this time period.')
    setShowStopages((prev) => !prev)
    console.log('These are the stopages==================' + JSON.stringify(stopages))
  }
  // NOT  IN  USE
  const arrowPositions = useMemo(() => {
    return poly.slice(1).map((pos, index) => {
      const [lat1, lon1] = poly[index]
      const [lat2, lon2] = pos

      // Calculate angle for rotation
      const angle = Math.atan2(lat2 - lat1, lon2 - lon1) * (180 / Math.PI)
      return { lat: lat2, lon: lon2, angle }
    })
  }, [poly])

  // USEABLE CODE
  const { longestStop, shortestStop, longestDuration, shortestDuration } =
    useStoppageTimes(stopages)

  const [isDataAvailable, setIsDataAvailable] = useState(fetch && stopages.length > 0)

  useEffect(() => {
    setIsDataAvailable(fetch && stopages.length > 0)
  }, [fetch, stopages, loading])

  const [longestStopAddress, setLongestStopAddress] = useState('')
  const [shortestStopAddress, setShortestStopAddress] = useState('')

  useEffect(() => {
    const fetchAddresses = async () => {
      if (isDataAvailable) {
        const longestStopAddress = await fetchAddressStop(
          longestStop?.latitude,
          longestStop?.longitude,
        )
        setLongestStopAddress(longestStopAddress)

        const shortestStopAddress = await fetchAddressStop(
          shortestStop?.latitude,
          shortestStop?.longitude,
        )
        setShortestStopAddress(shortestStopAddress)
      }
    }

    fetchAddresses()
  }, [isDataAvailable, longestStop, shortestStop])

  const iconImage = useGetVehicleIcon(positions[currentPositionIndex], category)
  const vehicleImage = useVehicleImage(category, positions[currentPositionIndex])

  const renderMarkers = () => {
    return positions
      .filter((_, index) => index % 4 === 0) // Skip every 5th point
      .map((point, index) => {
        // Create a custom icon with the course rotation
        const rotation = point.course // Assuming course is an angle in degrees
        const iconHtml = ReactDOMServer.renderToString(<MdOutlineKeyboardDoubleArrowUp />) // Convert React icon to string

        const icon = L.divIcon({
          html: `<div style="transform: rotate(${rotation}deg); font-size: 18px; font-weight: 900; color:#fff;">${iconHtml}</div>`, // Use the string icon
          className: 'custom-icon', // Optional: style the icon if needed
        })

        return (
          <Marker key={index} position={[point.latitude, point.longitude]} icon={icon}>
            <Popup>
              {`Lat: ${point.latitude}, Long: ${point.longitude}, Course: ${point.course}`}
            </Popup>
          </Marker>
        )
      })
  }

  const [totalDistance, setTotalDistance] = useState(0)

  useEffect(() => {
    if (positions.length > 1 && currentPositionIndex > 0) {
      let accumulatedDistance = 0
      // Ensure we do not exceed the last valid index
      const lastIndex = Math.min(currentPositionIndex, positions.length - 1)
      // Loop from index 1 to lastIndex (inclusive)
      for (let i = 1; i <= lastIndex; i++) {
        const prev = positions[i - 1]
        const current = positions[i]
        // Check if both previous and current positions exist
        if (prev && current) {
          accumulatedDistance += haversineDistance(
            prev.latitude,
            prev.longitude,
            current.latitude,
            current.longitude,
          )
        }
      }
      setTotalDistance(accumulatedDistance)
    }
  }, [currentPositionIndex, positions])

  const [isSatelliteView, setIsSatelliteView] = useState(false)

  const toggleMapView = () => {
    setIsSatelliteView((prev) => !prev)
  }
  return (
    <div className="individualMap position-relative">
      <div className="graphAndMap" style={{ width: '100%' }}>
        <MapContainer
          ref={mapRef}
          center={
            filteredData && positions && currentPositionIndex
              ? [
                positions[currentPositionIndex]?.latitude,
                positions[currentPositionIndex]?.longitude,
              ]
              : [21.1458, 79.0882]
          }
          zoom={zoomLevel}
          scrollWheelZoom={true}
          dragging={true}
          style={{
            position: 'relative',
            height: '400px',
            width: '100%',
            borderRadius: '15px',
            border: '2px solid gray',
          }}
        >
          <div className="toggle-map-view" onClick={toggleMapView}>
            <FaSatellite />
          </div>
          <MapZoomController />
          <TileLayer
            url={
              isSatelliteView
                ? 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
                : // Satellite View
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' // Normal View
            }
            attribution="&copy; Credence Tracker, HB Gadget Solutions Nagpur"
          />
          {positions.length > 0 && (
            <>
              <Polyline
                positions={poly}
                color="blue"
                weight={7}
                opacity={0.6}
                arrowheads={{
                  size: '15px',
                  frequency: 'endonly',
                  fill: true,
                  color: 'white', // Arrow color set to white
                }}
              />
              {renderMarkers()}
              <DriftMarker
                // position={[
                //   positions[currentPositionIndex]?.latitude,
                //   positions[currentPositionIndex]?.longitude,
                // ]}
                position={currentMarkerPosition}
                duration={190}
                keepAtCenter
                icon={iconImage}
              >
                <Popup>
                  {/* {`Vehicle at ${positions[currentPositionIndex]?.latitude}, ${positions[currentPositionIndex]?.longitude}`} */}
                  {`Vehicle at ${currentMarkerPosition[0]}, ${currentMarkerPosition[1]}`}
                </Popup>
              </DriftMarker>
            </>
          )}

          {positions.length > 0 && positions[0]?.latitude && positions[0].longitude && (
            <>
              {/* Marker for the starting position */}
              {positions[0]?.latitude && positions[0]?.longitude && (
                <Marker
                  position={[positions[0].latitude, positions[0].longitude]}
                  icon={greenFlagIcon}
                >
                  <Popup>
                    <div>
                      <p>
                        <strong>Speed:</strong> {stop?.speed || 'N/A'}
                      </p>
                      <p>
                        <strong>Arrival Time:</strong>{' '}
                        {stop?.arrivalTime ? new Date(stop.arrivalTime).toLocaleString() : 'N/A'}
                      </p>
                      <p>
                        <strong>Departure Time:</strong>{' '}
                        {stop?.departureTime
                          ? new Date(stop.departureTime).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Marker for the ending position */}
              {positions[positions.length - 1]?.latitude &&
                positions[positions.length - 1]?.longitude && (
                  <Marker
                    position={[
                      positions[positions.length - 1]?.latitude,
                      positions[positions.length - 1]?.longitude,
                    ]}
                    icon={redFlagIcon}
                  >
                    <Popup>
                      <div>
                        <p>
                          <strong>Speed:</strong> {stop?.speed || 'N/A'}
                        </p>
                        <p>
                          <strong>Arrival Time:</strong>{' '}
                          {stop?.arrivalTime ? new Date(stop?.arrivalTime).toLocaleString() : 'N/A'}
                        </p>
                        <p>
                          <strong>Departure Time:</strong>{' '}
                          {stop?.departureTime
                            ? new Date(stop?.departureTime).toLocaleString()
                            : 'N/A'}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}
            </>
          )}

          {showStopages &&
            stopages &&
            stopages.map((stop, index) => (
              <Marker
                key={index}
                position={[stop?.latitude, stop?.longitude]}
                icon={createNumberedIcon(index)}
                iconAnchor={[12, 41]}
                popupAnchor={[1, -34]}
                shadowAnchor={[10, 41]}
              >
                <Popup>
                  <div>
                    <p>
                      <strong>Speed:</strong> {stop?.speed}
                    </p>
                    <p>
                      <strong>Arrival Time:</strong> {new Date(stop?.arrivalTime).toLocaleString()}
                    </p>
                    <p>
                      <strong>Departure Time:</strong>{' '}
                      {stop.departureTime ? new Date(stop?.departureTime).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
        {historyOn && positions.length > 0 && (
          <>
            <div className="infoNav" style={{ height: '60px', width: '100%' }}>
              <div className="info-img">
                <img src={vehicleImage} alt="Car icon" className="vehicle" />
                <p className="name">{name}</p>
              </div>

              <div className="divide fixedWidth">
                <div className="bolder">Speed : </div>
                <div className="lighter">
                  {fetch && positions
                    ? Math.round(positions[currentPositionIndex]?.speed)
                    : '0'}{' '}
                  km/hr
                </div>
              </div>

              <div className="divide">
                <div className="bolder">Ignition: </div>
                <div className="lighter">
                  {fetch && positions
                    ? positions[currentPositionIndex]?.attributes?.ignition
                      ? 'On'
                      : 'Off'
                    : 'Off'}
                </div>
              </div>
              <div className="divide fixedWidth">
                <div className="bolder">Distance: </div>
                <div className="lighter">
                  {fetch && positions ? `${totalDistance.toFixed(2)} Km` : '0 Km'}
                </div>
              </div>

              <div className="controls">
                <div className="center">
                  <div className="pro">
                    <div onClick={handleBackward}>
                      <FaBackward />
                    </div>
                    <div onClick={handlePlayPause}>{isPlaying ? <IoMdPause /> : <IoMdPlay />}</div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => {
                        const newIndex = Math.floor((positions.length * e.target.value) / 100)
                        setCurrentPositionIndex(newIndex)
                        setProgress(e.target.value)
                      }}
                    />
                    <div onClick={handleForward}>
                      <FaForward />
                    </div>
                    <div className={`zoom-control ${isExpanded ? 'expanded' : ''}`}>
                      <select
                        value={speed}
                        className="speed-toggle"
                        onChange={(e) => setSpeed(Number(e.target.value))}
                      >
                        <option value={2}>1x</option>
                        <option value={4}>2x</option>
                        <option value={6}>3x</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <CButton
                color={showStopages ? 'primary' : 'success'}
                onClick={(e) => toggleStopages(e)}
                style={{
                  height: '2.1rem',
                  width: '10rem',
                  fontSize: '1rem',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center', // Ensures text contrast
                }}
              >
                {showStopages ? 'Hide Stopages' : 'Show Stopages'}
              </CButton>
              <CButton
                color="danger"
                onClick={handleBack}
                style={{
                  height: '2.1rem',
                  width: '4rem',
                  fontSize: '1rem',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center', // Ensures text contrast
                }}
              >
                Back
              </CButton>
            </div>

            <div style={{ height: '140px', width: '100%' }}>
              <Line key={positions.length} data={ChartData} options={ChartOptions} />
            </div>
          </>
        )}
      </div>

      {loading && <HistoryLoader />}

      {historyOn && (
        <div>
          <SlidingSideMenu
            stopData={stopData}
            mapRef={mapRef}
            setIsPlaying={setIsPlaying}
            originalPositions={originalPositions}
            setPositions={setPositions}
            positions={positions}
            trips={trips}
            setCurrentPositionIndex={setCurrentPositionIndex}
            toggleStopages={toggleStopages}
            showStopages={showStopages}
            handleFilterData={handleFilterData}
          />
        </div>
      )}
    </div>
  )
}

export default HistoryMap
