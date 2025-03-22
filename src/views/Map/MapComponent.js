import React, { useContext, useEffect, useState, memo, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-cluster'

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

// Create a separate component for PopupContent
const PopupContent = memo(function PopupContent({
  vehicle,
  newAddress,
  handleClickOnTrack,
  handleClickOnHistoryTrack,
}) {
  return (
    <div className="toolTip">
      <span style={{ textAlign: 'center', fontSize: '0.9rem' }}>
        <strong> {vehicle.name}</strong>
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
          </strong>
          {dayjs(vehicle.lastUpdate).format('YYYY-MM-DD HH:mm')}
        </div>
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'start', gap: '10px' }}
        >
          <div>
            <strong>
              <IoMdSpeedometer size={17} color="#FF7A00" />
            </strong>
            {vehicle.speed.toFixed(2)} km/h
          </div>
        </div>
        <div>
          <strong>
            <HiOutlineStatusOnline size={17} color="#FF7A00" />
          </strong>
          {(() => {
            const sp = vehicle.speed
            const ig = vehicle.attributes.ignition
            if (sp < 1 && ig === false) return 'Stopped'
            if (sp < 2 && ig === false) return 'Idle'
            if (sp > 2 && sp < 60 && ig === true) return 'Running'
            if (sp > 60 && ig === true) return 'Over Speed'
            return 'Inactive'
          })()}
        </div>
        <span>
          <strong>
            <IoLocationSharp size={17} color="#FF7A00" />
          </strong>
          {newAddress[vehicle.deviceId] || 'Loading...'}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
          }}
        >
          <button
            className="btn"
            style={{
              width: '100%',
              color: 'white',
              fontSize: '0.6rem',
              backgroundColor: '#000000',
            }}
            onClick={() => handleClickOnTrack(vehicle)}
          >
            Live Track
          </button>
          <button
            className="btn"
            style={{
              width: '100%',
              color: 'white',
              fontSize: '0.6rem',
              backgroundColor: '#000000',
            }}
            onClick={() => handleClickOnHistoryTrack(vehicle)}
          >
            History
          </button>
        </div>
      </div>
    </div>
  )
})

// Memoized Marker component
const VehicleMarker = memo(
  ({ vehicle, newAddress, handleClickOnTrack, handleClickOnHistoryTrack }) => {
    const icon = useGetVehicleIcon(vehicle, vehicle.category)

    return (
      <Marker position={[vehicle.latitude, vehicle.longitude]} icon={icon}>
        <Popup>
          <PopupContent
            vehicle={vehicle}
            newAddress={newAddress}
            handleClickOnTrack={handleClickOnTrack}
            handleClickOnHistoryTrack={handleClickOnHistoryTrack}
          />
        </Popup>
      </Marker>
    )
  },
)

const FlyToMapCenter = ({ mapCenter }) => {
  const map = useMap()

  useEffect(() => {
    if (mapCenter) {
      map.setView([mapCenter?.lat, mapCenter?.lng], mapCenter.zoom) // Fly to new coordinates
    }
  }, [mapCenter, map])

  return null
}

const MainMap = ({ filteredVehicles, mapCenter, markerRefs }) => {
  const { newAddress } = useSelector((state) => state.address)
  const navigate = useNavigate()

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

  // Keep only one useEffect for debugging
  useEffect(() => {
    // console.log('Filtered vehicles updated:', filteredVehicles)
  }, [filteredVehicles])

  return (
    <MapContainer
      center={[21.1458, 79.0882]}
      zoom={10}
      scrollWheelZoom={true}
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
        {filteredVehicles?.map((vehicle) => (
          <VehicleMarker
            key={vehicle.deviceId}
            vehicle={vehicle}
            newAddress={newAddress}
            handleClickOnTrack={handleClickOnTrack}
            handleClickOnHistoryTrack={handleClickOnHistoryTrack}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

VehicleMarker.displayName = 'VehicleMarker'

VehicleMarker.propTypes = {
  vehicle: PropTypes.shape({
    name: PropTypes.string.isRequired,
    lastUpdate: PropTypes.string.isRequired,
    speed: PropTypes.number.isRequired,
    attributes: PropTypes.shape({
      ignition: PropTypes.bool.isRequired,
    }).isRequired,
    category: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    deviceId: PropTypes.string.isRequired,
  }).isRequired,
  newAddress: PropTypes.object.isRequired,
  handleClickOnTrack: PropTypes.func.isRequired,
  handleClickOnHistoryTrack: PropTypes.func.isRequired,
}

export default MainMap
