/* eslint-disable prettier/prettier */
import React from 'react'
import { FaSatellite, FaStreetView } from 'react-icons/fa'
import PropTypes from 'prop-types'
import { TbTrafficLights, TbTrafficLightsOff } from 'react-icons/tb'
import './styles.css'

function MapFunctions({
  toggleMapView,
  autoFocusEnabled,
  setAutoFocusEnabled,
  showTraffic,
  setShowTraffic,
  individualSalesMan,
}) {
  return (
    <div className="map-controls">
      <button
        title="Toggle Satellite View"
        onClick={toggleMapView}
        className="map-control-button"
        aria-label="Toggle Satellite View"
      >
        <FaSatellite size={16} />
      </button>

      <button
        title={autoFocusEnabled ? 'Disable auto-focus' : 'Enable auto-focus'}
        onClick={() => setAutoFocusEnabled(!autoFocusEnabled)}
        className={`map-control-button ${autoFocusEnabled ? 'active' : ''}`}
        aria-label={autoFocusEnabled ? 'Disable auto-focus' : 'Enable auto-focus'}
      >
        <span role="img" aria-hidden="true">
          🎯
        </span>
      </button>

      <button
        onClick={() => setShowTraffic(!showTraffic)}
        className={`map-control-button ${showTraffic ? 'active' : ''}`}
        title="Toggle Traffic View"
        aria-label="Toggle Traffic View"
      >
        {showTraffic ? <TbTrafficLightsOff size={16} /> : <TbTrafficLights size={16} />}
      </button>

      <a
        className="map-control-button"
        href={`http://maps.google.com/maps?q=&layer=c&cbll=${individualSalesMan?.latitude},${individualSalesMan?.longitude}&cbp=11,0,0,0,0`}
        target="_blank"
        rel="noopener noreferrer"
        title="Street View"
        aria-label="Open in Street View"
      >
        <FaStreetView size={16} />
      </a>
    </div>
  )
}

export default MapFunctions

MapFunctions.propTypes = {
  toggleMapView: PropTypes.func.isRequired,
  isSatelliteView: PropTypes.bool.isRequired,
  autoFocusEnabled: PropTypes.bool.isRequired,
  setAutoFocusEnabled: PropTypes.func.isRequired,
  showTraffic: PropTypes.bool.isRequired,
  setShowTraffic: PropTypes.func.isRequired,
  individualSalesMan: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
}
