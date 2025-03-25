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

const VehicleMarker = memo(
  ({ vehicle, address, handleClickOnTrack, handleClickOnHistoryTrack }) => {
    const icon = useGetVehicleIcon(vehicle, vehicle.category)

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

// Create a separate component for PopupContent
const PopupContent = memo(({ vehicle, address, handleClickOnTrack, handleClickOnHistoryTrack }) => (
  <div className="toolTip">
    <span style={{ textAlign: 'center', fontSize: '0.9rem' }}>
      <strong>{vehicle.name}</strong>
    </span>
    <hr style={hrStyle} />
    <div className="toolTipContent">
      <DetailItem
        icon={<RxLapTimer />}
        text={dayjs(vehicle.lastUpdate).format('YYYY-MM-DD HH:mm')}
      />
      <SpeedDetail speed={vehicle.speed} />
      <StatusDetail speed={vehicle.speed} ignition={vehicle.attributes.ignition} />
      <DetailItem icon={<IoLocationSharp />} text={address || 'Loading...'} />
      <ActionButtons
        onTrack={() => handleClickOnTrack(vehicle)}
        onHistory={() => handleClickOnHistoryTrack(vehicle)}
      />
    </div>
  </div>
))

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
    console.log('filtered vehicle', filteredVehicles)
  }, [filteredVehicles])

  useEffect(() => {
    console.log('filtered vehicle', filteredVehicles)
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

const DetailItem = ({ icon, text }) => (
  <div>
    <strong>{React.cloneElement(icon, { size: 17, color: '#FF7A00' })}</strong>
    {text}
  </div>
)

const SpeedDetail = ({ speed }) => (
  <div>
    <strong>
      <GiSpeedometer size={17} color="#FF7A00" />
    </strong>
    {speed.toFixed(2)} km/h
  </div>
)

const StatusDetail = ({ speed, ignition }) => {
  const status = useMemo(() => {
    if (speed < 1 && !ignition) return 'Stopped'
    if (speed < 2 && !ignition) return 'Idle'
    if (speed > 2 && speed < 60 && ignition) return 'Running'
    if (speed > 60 && ignition) return 'Over Speed'
    return 'Inactive'
  }, [speed, ignition])

  return (
    <div>
      <strong>
        <HiOutlineStatusOnline size={17} color="#FF7A00" />
      </strong>
      {status}
    </div>
  )
}

const ActionButtons = ({ onTrack, onHistory }) => (
  <div style={buttonContainerStyle}>
    <Button 
      onClick={onTrack} 
      label={<CiLocationArrow1 size={14} />} 
      title="Live Track"  // Add tooltip text
    />
    <Button 
      onClick={onHistory} 
      label={<MdHistory size={14} />} 
      title="History Track"  // Add tooltip text
    />
  </div>
)

const Button = ({ onClick, label, title }) => (
  <button 
    className="btn" 
    style={buttonStyle} 
    onClick={onClick}
    title={title}  // Add title attribute here
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
  width: '100%',
}

const buttonStyle = {
  width: '100%',
  color: 'white',
  fontSize: '0.6rem',
  backgroundColor: '#000000',
}

export default React.memo(MainMap)
