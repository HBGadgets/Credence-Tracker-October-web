import React, { useContext, useEffect, useState, memo, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { MdHistory } from 'react-icons/md'
import { CiLocationArrow1 } from 'react-icons/ci'
import { FaSearchLocation } from 'react-icons/fa'
import { IoMdSpeedometer } from 'react-icons/io'
import { HiOutlineStatusOnline } from 'react-icons/hi'
import { RxLapTimer } from 'react-icons/rx'
import dayjs from 'dayjs'
import './map.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { IoLocationSharp } from 'react-icons/io5'
import { GiSpeedometer } from 'react-icons/gi'
import useGetVehicleIcon from '../Reports/HistoryReport/useGetVehicleIcon'
import PropTypes from 'prop-types'
import Sedan from '../../assets/PopupAssests/Sedan.svg'
import Time from '../../assets/PopupAssests/Time Span.svg'
import Speed from '../../assets/PopupAssests/Speed.svg'
import GasStation from '../../assets/PopupAssests/Gas Station.svg'
import MaskGroup from '../../assets/PopupAssests/Mask Group.svg'
import InternetAnenna from '../../assets/PopupAssests/Internet Antenna.svg'
import Wifi from '../../assets/PopupAssests/Wi-Fi.svg'
import PlaceMarker from '../../assets/PopupAssests/Place Marker.svg'
import Navigation from '../../assets/PopupAssests/Navigation.svg'
import TimeMachine from '../../assets/PopupAssests/Time Machine.svg'
const VehicleMarker = memo(
  ({ vehicle, address, handleClickOnTrack, handleClickOnHistoryTrack }) => {
    const icon = useGetVehicleIcon(vehicle, vehicle.category)

    // console.log('vehicle', vehicle)

    return (
      <Marker position={[vehicle.latitude, vehicle.longitude]} icon={icon}>
        <Popup>
          <PopupContent
            vehicle={vehicle}
            address={address}
            handleClickOnTrack={handleClickOnTrack}
            handleClickOnHistoryTrack={handleClickOnHistoryTrack}
          />
        </Popup>
      </Marker>
    )
  },
)

VehicleMarker.displayName = 'VehicleMarker'

const PopupContent = memo(({ vehicle, address, handleClickOnTrack, handleClickOnHistoryTrack }) => {
  const formatTimestamp = (utcTimestamp) => {
    return dayjs(utcTimestamp).add(5, 'hour').add(30, 'minute').format('YYYY-MM-DD hh:mm A')
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-2" style={{ border: '0' }}>
        <div style={{ paddingLeft: '10px' }}>
          <img src={Sedan} alt="Sedan" />
        </div>
        <div>
          <strong>{vehicle.name}</strong>
        </div>
      </div>
      <div>
        <div className="popupContentGrid mb-2">
          <div>
            <div className="d-flex align-items-center gap-2">
              <img src={Time} alt="Time" style={{ width: '20px', height: '20px' }} />
              {formatTimestamp(vehicle.lastUpdate)}
            </div>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <img src={GasStation} alt="Petrol" style={{ width: '20px', height: '20px' }} />
              {vehicle.fuelConsumption}
            </div>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <img src={MaskGroup} alt="Speed" style={{ width: '20px', height: '20px' }} />
              {vehicle.speed.toFixed(2)} km/h
            </div>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <img src={Speed} alt="Mileage" style={{ width: '20px', height: '20px' }} />
              {vehicle.speed.toFixed(2)} km/h
            </div>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <img src={InternetAnenna} alt="Mileage" style={{ width: '20px', height: '20px' }} />
              {vehicle.speed.toFixed(2)} km/h
            </div>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <img src={Wifi} alt="Mileage" style={{ width: '20px', height: '20px' }} />
              {vehicle.speed.toFixed(2)} km/h
            </div>
          </div>
        </div>
        <div>
          <div
            className="d-flex align-items-center gap-2 popupContentGrid"
            style={{ color: '#8E8E8E' }}
          >
            <img src={PlaceMarker} alt="Petrol" style={{ width: '20px', height: '20px' }} />
            {address || 'Loading...'}
          </div>
        </div>
      </div>
      <div>
        <ActionButtons
          onTrack={() => handleClickOnTrack(vehicle)}
          onHistory={() => handleClickOnHistoryTrack(vehicle)}
        />
      </div>
    </div>
  )
})

PopupContent.displayName = 'PopupContent'

PopupContent.propTypes = {
  vehicle: PropTypes.shape({
    name: PropTypes.string.isRequired,
    lastUpdate: PropTypes.string.isRequired,
    speed: PropTypes.number.isRequired,
    attributes: PropTypes.shape({
      ignition: PropTypes.bool.isRequired,
    }).isRequired,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }).isRequired,
  address: PropTypes.string,
  handleClickOnTrack: PropTypes.func.isRequired,
  handleClickOnHistoryTrack: PropTypes.func.isRequired,
}

const FlyToMapCenter = ({ mapCenter }) => {
  const map = useMap()

  useEffect(() => {
    if (mapCenter) {
      map.setView([mapCenter?.lat, mapCenter?.lng], mapCenter.zoom) // Fly to new coordinates
    }
  }, [mapCenter, map])

  return null
}

const MainMap = ({ filteredVehicles, mapCenter }) => {
  const { newAddress } = useSelector((state) => state.address)
  const navigate = useNavigate()

  const stableVehicles = useMemo(
    () => filteredVehicles,
    [JSON.stringify(filteredVehicles?.map((v) => v.deviceId))],
  )

  const handleClickOnTrack = useCallback(
    (vehicle) => {
      navigate(`/salesman/${vehicle.deviceId}/${vehicle.category}/${vehicle.name}`)
    },
    [navigate],
  )

  const handleClickOnHistoryTrack = useCallback(
    (vehicle) => {
      navigate(`/history/${vehicle.deviceId}/${vehicle.category}/${vehicle.name}`)
    },
    [navigate],
  )

  useEffect(() => {
    // console.log('filtered vehicle', filteredVehicles)
  }, [filteredVehicles])

  useEffect(() => {
    // console.log('filtered vehicle', filteredVehicles)
  }, [filteredVehicles])

  // const iconImage = (category, item) => useGetVehicleIcon(item, category)
  const iconImage = useMemo(() => (category, item) => useGetVehicleIcon(item, category), [])
  const getIcon = useCallback((category, item) => {
    return useGetVehicleIcon(item, category)
  }, [])

  return (
    <MapContainer
      center={[21.1458, 79.0882]}
      zoom={10}
      scrollWheelZoom={true}
      preferCanvas={true}
      style={{
        height: '550px',
        width: '100%',
        borderRadius: '15px',
        border: '2px solid gray',
        zIndex: '0',
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; Credence Tracker, HB Gadget Solutions Nagpur"
      />
      <FlyToMapCenter mapCenter={mapCenter} />
      <MarkerClusterGroup>
        {stableVehicles?.map((vehicle) => (
          <VehicleMarker
            key={vehicle.deviceId}
            vehicle={vehicle}
            address={newAddress[vehicle.deviceId]}
            handleClickOnTrack={handleClickOnTrack}
            handleClickOnHistoryTrack={handleClickOnHistoryTrack}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

const ActionButtons = ({ onTrack, onHistory }) => (
  <div style={buttonContainerStyle}>
    <Button
      onClick={onTrack}
      label={<img src={Navigation} style={{ width: '30px', height: '30px' }} />}
      title="Live Track" // Add tooltip text
    />
    <Button
      onClick={onHistory}
      label={<img src={TimeMachine} style={{ width: '30px', height: '30px' }} />}
      title="History Track" // Add tooltip text
    />
  </div>
)

const Button = ({ onClick, label, title }) => (
  <button
    style={buttonStyle}
    onClick={onClick}
    title={title} // Add title attribute here
  >
    {label}
  </button>
)

// Styles
const mapStyle = {
  height: '550px',
  width: '100%',
  borderRadius: '15px',
  border: '2px solid gray',
  zIndex: 0,
}

const hrStyle = {
  width: '100%',
  height: '3px',
  margin: '5px 0',
  borderRadius: '5px',
  backgroundColor: '#000',
}

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
  marginTop: '10px',
  marginBottom: '0px',
  marginLeft: '0px',
  marginRight: '0px',
  padding: '0px',
  width: '100%',
  backgroundColor: '#000000',
  borderBottomLeftRadius: '10px',
  borderBottomRightRadius: '10px',
}

const buttonStyle = {
  width: '100%',
  height: '30px',
  color: 'white',
  fontSize: '0.6rem',
  backgroundColor: '#000000',
  border: 'none',
  borderBottomLeftRadius: '10px',
  borderBottomRightRadius: '10px',
}

export default React.memo(MainMap)
