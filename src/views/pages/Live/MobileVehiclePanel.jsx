/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ChevronUp, ChevronDown, MapPin, Clock, Zap, Activity, Car } from 'lucide-react'

const MobileVehiclePanel = ({ position, address }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!position) return null

  return (
    <div className={`mobile-vehicle-panel ${isExpanded ? 'expanded' : ''}`}>
      <div className="panel-handle" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="handle-bar"></div>
        <div className="vehicle-meta">
          <div className="vehicle-id">
            {position?.name || 'Vehicle'}
            <span className="update-time">
              Last Update: {''}
              {position?.lastUpdate
                ? new Date(position.lastUpdate).toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short',
                  })
                : 'N/A'}
            </span>
          </div>
        </div>
        {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </div>

      <div className="panel-content">
        <div className="location-info">
          <MapPin size={16} className="icon" />
          <p>{address || 'Location unavailable'}</p>
        </div>

        <div className="stats-grid">
          <div className={`stat-item ${position?.attributes?.ignition ? 'active' : 'inactive'}`}>
            <Zap size={15} className="stat-icon" />
            <div className="stat-label">Ignition</div>
            <div className="stat-value">{position?.attributes?.ignition ? 'On' : 'Off'}</div>
          </div>

          <div className="stat-item">
            <Activity size={20} className="stat-icon" />
            <div className="stat-label">Speed</div>
            <div className="stat-value">
              {Math.round(position?.speed).toFixed(0)} <small>km/h</small>
            </div>
          </div>

          <div className="stat-item">
            <MapPin size={20} className="stat-icon" />
            <div className="stat-label">Distance</div>
            <div className="stat-value">
              {Math.round(position?.todayDistance)} <small>KM</small>
            </div>
          </div>

          <div className={`stat-item ${position?.attributes?.motion ? 'active' : 'inactive'}`}>
            <Car size={20} className="stat-icon" />
            <div className="stat-label">Moving</div>
            <div className="stat-value">{position?.attributes?.motion ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {isExpanded && (
          <div className="extended-info">
            <div className="info-row">
              <Car size={16} className="icon" />
              <div>
                <span className="info-label">Category</span>
                <p className="info-value">{position?.category || 'Unknown'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
MobileVehiclePanel.propTypes = {
  position: PropTypes.object.isRequired,
  address: PropTypes.string,
}

export default MobileVehiclePanel
