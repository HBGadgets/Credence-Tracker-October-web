import { CButton } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Scrollbars } from 'react-custom-scrollbars-2'
import { FaBars, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import './SlidingSideMenu.css'
import axios from 'axios'
import { MdOutlineRefresh } from 'react-icons/md'
import { FaUpload, FaDownload } from 'react-icons/fa'
import { FaRoad, FaClock } from 'react-icons/fa6'
import { GiDuration } from 'react-icons/gi'
import { IoLocationSharp } from 'react-icons/io5'
import { BiSolidShow } from 'react-icons/bi'
import { FaArrowRightLong } from 'react-icons/fa6'
import { BiHide } from 'react-icons/bi'
import { IoMdCheckmarkCircle } from 'react-icons/io'

dayjs.extend(duration)

// Format duration into days/hours/minutes/seconds
const formatDuration = (milliseconds) => {
  const d = dayjs.duration(milliseconds)
  return `${d.days()}d ${d.hours()}h ${d.minutes()}m ${d.seconds()}s`
}

// #####################################################################///
// This Shudesh Previous Code for stopages data calculation

// // Process and calculate additional data fields
// const processStopData = (stopData) => {
//   return stopData.map((stop, index, array) => {
//     const previousStop = array[index - 1]
//     const nextStop = array[index + 1]
//     const arrivalTime = dayjs(stop.arrivalTime)
//     const departureTime = stop.departureTime
//       ? dayjs(stop.departureTime)
//       : nextStop?.arrivalTime
//         ? dayjs(nextStop.arrivalTime)
//         : null

//     const durationFromPrevious = previousStop
//       ? arrivalTime.diff(dayjs(previousStop.departureTime))
//       : 0

//     const haltTime = departureTime ? departureTime.diff(arrivalTime) : null
//     const latitude = stop.latitude
//     const longitude = stop.longitude

//     const obj = {
//       ...stop,
//       departureTime: departureTime?.toISOString() || null,
//       distanceFromPrevious: previousStop ? stop.distance - previousStop.distance : 0,
//       durationFromPrevious: formatDuration(durationFromPrevious),
//       haltTime: haltTime ? formatDuration(haltTime) : 'N/A',
//     }

//     console.log('object hai yee', obj)
//     return obj
//   })
// }
// ######################################################################################################

// this is new calculation for stopages data Rohit

const toRadians = (degree) => (degree * Math.PI) / 180

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = toRadians(lat1)
  const φ2 = toRadians(lat2)
  const Δφ = toRadians(lat2 - lat1)
  const Δλ = toRadians(lon2 - lon1)

  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

const processStopData = (stopData) => {
  return stopData.map((stop, index, array) => {
    const previousStop = array[index - 1]
    const nextStop = array[index + 1]
    const arrivalTime = dayjs(stop.arrivalTime)
    const departureTime = stop.departureTime
      ? dayjs(stop.departureTime)
      : nextStop?.arrivalTime
        ? dayjs(nextStop.arrivalTime)
        : null

    const durationFromPrevious = previousStop
      ? arrivalTime.diff(dayjs(previousStop.departureTime))
      : 0

    const haltTime = departureTime ? departureTime.diff(arrivalTime) : null

    // Calculate distance from the previous stop in kilometers
    const distanceFromPrevious = previousStop
      ? calculateDistance(
          stop.latitude,
          stop.longitude,
          previousStop.latitude,
          previousStop.longitude,
        ) / 1000 // Convert meters to kilometers
      : 0

    const obj = {
      ...stop,
      departureTime: departureTime?.toISOString() || null,
      distanceFromPrevious: distanceFromPrevious.toFixed(2), // Distance in KM, rounded to 2 decimals
      durationFromPrevious: formatDuration(durationFromPrevious),
      haltTime: haltTime ? formatDuration(haltTime) : 'N/A',
    }

    console.log('object hai yee', obj)
    return obj
  })
}

// stopages data fetching function
const fetchAddress = async (latitude, longitude) => {
  try {
    const apiKey = 'CWVeoDxzhkO07kO693u0'
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}`,
    )
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`)

    const data = await response.json()

    // Correcting the response structure
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name || 'Address not found'
    } else {
      return 'Address not found'
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return 'Error fetching address'
  }
}

const addAddressesToData = async (data) => {
  const updatedData = await Promise.all(
    data.map(async (stop) => {
      const address = await fetchAddress(stop.latitude, stop.longitude)
      return { ...stop, address }
    }),
  )
  return updatedData
}

const SlidingSideMenu = ({
  stopData,
  mapRef,
  setIsPlaying,
  originalPositions,
  setPositions,
  trips,
  setCurrentPositionIndex,
  toggleStopages,
  showStopages,
  handleFilterData,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [processedData, setProcessedData] = useState([])
  const [address, setAddress] = useState([])
  const [stopPage, setStopPage] = useState(true)
  const [tripPage, setTripPage] = useState(false)
  const [tripData, setTripData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const processAndSetData = async () => {
      const processed = processStopData(stopData?.finalDeviceDataByStopage)
      const withAddresses = await addAddressesToData(processed)
      setProcessedData(withAddresses)
    }

    if (stopData) {
      processAndSetData()
    }
  }, [stopData])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleMenuBack = () => {
    setIsOpen(false)
  }
  const handleStopDiv = (latitude, longitude) => {
    setIsPlaying(false)
    const mapInstance = mapRef.current // Access Leaflet Map instance
    mapInstance.setView([latitude, longitude], 14) // New York coordinates
  }

  const filterPositionsByTrip = (trip) => {
    console.log('originalPositions ', originalPositions)
    const filteredPositions = originalPositions.filter((pos) => {
      const posTime = new Date(pos.createdAt).getTime()
      const tripStartTime = new Date(trip.startTime).getTime()
      const tripEndTime = new Date(trip.endTime).getTime()
      return posTime >= tripStartTime && posTime <= tripEndTime
    })

    handleFilterData(filteredPositions)

    console.log('filteredPositions ', filteredPositions)
    setPositions(filteredPositions)
    setCurrentPositionIndex(0)
  }

  // Trip data fetching function
  const fetchAddress = async (vehicleId, longitude, latitude) => {
    try {
      const apiKey = 'CWVeoDxzhkO07kO693u0' // Replace with your MapTiler API key
      const response = await axios.get(
        `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}`,
      )
      const address =
        response.data.features.length <= 5
          ? response.data.features[0]?.place_name_en || 'Address not available'
          : response.data.features[1]?.place_name_en || 'Address not available'
      return address // Make sure to return the address
    } catch (error) {
      console.error('Error fetching the address:', error)
      return 'Error fetching address' // Return a default message if error occurs
    }
  }

  useEffect(() => {
    const fetchTripData = async () => {
      setLoading(true)
      try {
        const enrichedData = await Promise.all(
          trips.map(async (trip) => {
            try {
              const startAddress = await fetchAddress(
                trip.vehicleId,
                trip.startLongitude,
                trip.startLatitude,
              )
              const endAddress = await fetchAddress(
                trip.vehicleId,
                trip.endLongitude,
                trip.endLatitude,
              )

              return {
                ...trip,
                startAddress, // Assign the fetched address to trip
                endAddress, // Assign the fetched address to trip
                duration: new Date(trip.endTime) - new Date(trip.startTime),
              }
            } catch (error) {
              console.error('Error fetching trip data:', error)
            }
          }),
        )
        setTripData(enrichedData)
      } catch (error) {
        console.error('Error processing trip data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTripData()
  }, [trips])

  const handleStopPage = () => {
    setStopPage(true)
    setTripPage(false)
  }

  const handleTripPage = () => {
    setStopPage(false) // Fixed typo here
    setTripPage(true)
  }

  const handleIntialTrip = () => {
    setPositions(originalPositions)
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleMenu}
        style={{
          position: 'absolute',
          top: '20px',
          right: '0px',
          zIndex: 1000,
          backgroundColor: 'black',
          color: 'white',
          border: 'none',
          fontSize: '21px',
          cursor: 'pointer',
          opacity: isOpen ? '0' : '1',
          pointerEvents: isOpen ? 'none' : 'all',
          transition: 'right 0.3s ease-in-out, opacity 0.3s ease-in-out',
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: '50%',
          borderBottomLeftRadius: '50%',
        }}
      >
        <FaBars />
      </button>

      {/* Sliding Menu */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: isOpen ? '0' : '-350px', // Smooth sliding effect
          height: '80%',
          width: '300px',
          backgroundColor: '#f8f9fa',
          boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
          transition: 'right 0.3s ease-in-out, opacity 0.3s ease-in-out', // Smooth transitions
          zIndex: 9999,
          overflow: 'hidden',
          opacity: isOpen ? '1' : '0', // Fades out when closing
          pointerEvents: isOpen ? 'all' : 'none', // Prevents interaction when hidden
          borderRadius: '6px',
          border: '2px solid gray',
        }}
      >
        <Scrollbars style={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
          <div
            className="control-trips table-responsive"
            style={{
              padding: '10px 20px',
              fontSize: '18px',
              fontWeight: 'bold',
              position: 'sticky',
              top: '0',
              backgroundColor: '#d9d9d9',
            }}
          >
            <CButton
              color="success"
              onClick={handleStopPage}
              className="custom-button"
              style={{
                height: '2rem',
                width: '5rem',
                padding: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem', // Optional, to align horizontally as well
              }}
            >
              Stopages
            </CButton>
            <CButton
              color="primary"
              className="custom-button"
              onClick={handleTripPage}
              style={{
                height: '2rem',
                width: '4rem',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center', // Optional, to align horizontally as well
              }}
            >
              Trips
            </CButton>
            <CButton
              color="danger"
              onClick={handleMenuBack}
              className="custom-button"
              style={{
                height: '2rem',
                width: '4rem',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center', // Optional, to align horizontally as well
              }}
            >
              <FaArrowRightLong />
            </CButton>
          </div>
          <div style={{ padding: '8px', marginRight: '10px', zIndex: 9999 }}>
            {stopPage ? (
              <>
                <div className="table-responsive">
                  {/* <hr className="divider" /> */}

                  <div className="summary-header">
                    <div className="summary-box">
                      <div className="label">Total Stops</div>
                      <div className="value">{processedData?.length ?? 0}</div>
                    </div>

                    <div className="summary-box">
                      <div className="label">Total Distance</div>
                      <div className="value">
                        {(
                          tripData?.reduce((total, trip) => {
                            const distance = parseFloat(trip?.distance?.split(' ')[0] || 0)
                            return distance > 0 ? total + distance : total
                          }, 0) || 0
                        ).toFixed(2)}{' '}
                        km
                      </div>
                    </div>

                    <CButton
                      color={showStopages ? 'primary' : 'success'}
                      onClick={toggleStopages}
                      className="toggle-button"
                      title={showStopages ? 'View Stopages' : 'Hide Stopages'}
                    >
                      {showStopages ? <BiSolidShow /> : <BiHide />}
                    </CButton>
                  </div>

                  <hr className="divider" />

                  {processedData.map((stop, index) => (
                    <div key={index} className="stop-card">
                      <h4 className="stop-title"> {index + 1} Stop Details</h4>
                      <hr className="divider" />

                      <div className="stop-info">
                        <div className="info-item">
                          <FaClock className="icon" />
                          <div>
                            <span className="info-label">Arrival</span>
                            <p className="info-value">
                              {dayjs(stop?.arrivalTime).format('MMM D, YYYY • h:mm A')}
                            </p>
                          </div>
                        </div>

                        <div className="info-item">
                          <FaCalendarAlt className="icon" />
                          <div>
                            <span className="info-label">Departure</span>
                            <p className="info-value">
                              {dayjs(stop?.departureTime).format('MMM D, YYYY • h:mm A')}
                            </p>
                          </div>
                        </div>

                        <hr className="divider" />

                        <div className="info-item">
                          <FaClock className="icon" />
                          <div>
                            <span className="info-label">Dur. from Previous Stop</span>
                            <p className="info-value">{stop?.durationFromPrevious}</p>
                          </div>
                        </div>

                        <div className="info-item">
                          <FaRoad className="icon" />
                          <div>
                            <span className="info-label">Dist. from Previous Stop:</span>
                            <p className="info-value">{stop?.distanceFromPrevious} km</p>
                          </div>
                        </div>

                        <div className="info-item">
                          <FaClock className="icon" />
                          <div>
                            <span className="info-label">Halt Time</span>
                            <p className="info-value">{stop?.haltTime}</p>
                          </div>
                        </div>

                        <hr className="divider" />

                        <div className="info-item">
                          <FaMapMarkerAlt className="icon" />
                          <div>
                            <span className="info-label">Location</span>
                            <p className="info-value">
                              {stop?.address || 'Loading address...'}
                              <br />
                              <span className="location-sub">
                                {stop?.city}, {stop?.state}, {stop?.country}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* <hr className="divider" /> */}

                <div className="summary-header table-responsive">
                  <div className="summary-box">
                    <div className="label">Total Trips</div>
                    <div className="value">
                      {tripData?.filter((trip) => {
                        const distance = parseFloat(trip?.distance?.split(' ')[0] || 0)
                        return distance > 1
                      }).length || 0}
                    </div>
                  </div>

                  <div className="summary-box">
                    <div className="label">Total Distance</div>
                    <div className="value">
                      {(
                        tripData?.reduce((total, trip) => {
                          const distance = parseFloat(trip?.distance?.split(' ')[0] || 0)
                          return distance > 0 ? total + distance : total
                        }, 0) || 0
                      ).toFixed(2)}{' '}
                      km
                    </div>
                  </div>

                  <CButton
                    color="primary"
                    onClick={handleIntialTrip}
                    className="toggle-button"
                    title="Refresh"
                  >
                    <MdOutlineRefresh />
                  </CButton>
                </div>

                <hr className="divider" />

                {tripData
                  .filter((trip) => parseFloat(trip?.distance?.split(' ')[0]) > 1)
                  .map((trip, index) => (
                    <div
                      key={index}
                      className="trip-card"
                      onClick={() => filterPositionsByTrip(trip)}
                    >
                      <div className="trip-header">
                        <div className="indicator-container">
                          <div className="dot green"></div>
                          <div className="dashed-line"></div>
                          <div className="dot red"></div>
                        </div>

                        <div className="trip-details">
                          <div className="time-address">
                            <div className="time">
                              {dayjs(trip?.startTime)
                                .subtract(5, 'hour')
                                .subtract(30, 'minute')
                                .format('DD/MM/YYYY HH:mm:ss')}
                            </div>
                            <div className="address">
                              {trip?.startAddress || 'Loading address...'}
                            </div>
                          </div>

                          <div className="time-address">
                            <div className="time">
                              {dayjs(trip?.endTime)
                                .subtract(5, 'hour')
                                .subtract(30, 'minute')
                                .format('DD/MM/YYYY HH:mm:ss')}
                            </div>
                            <div className="address">
                              {trip?.endAddress || 'Loading address...'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="metrics">
                        <div className="metric-box">
                          <div className="label">Running</div>
                          <div className="value">{formatDuration(trip?.duration)}</div>
                        </div>
                        <div className="metric-box">
                          <div className="label">Distance</div>
                          <div className="value">{trip?.distance}</div>
                        </div>
                        <div className="metric-box">
                          <div className="label">Avg. Speed (km/h)</div>
                          <div className="value">{(trip?.avgSpeed * 1.6).toFixed(2)}</div>
                        </div>
                        <div className="metric-box">
                          <div className="label">Max. Speed (km/h)</div>
                          <div className="value">{(trip?.maxSpeed || 'N/A').toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        </Scrollbars>
      </div>
    </>
  )
}

export default SlidingSideMenu
