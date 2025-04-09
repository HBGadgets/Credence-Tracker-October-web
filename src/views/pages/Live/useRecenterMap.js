/* eslint-disable prettier/prettier */
import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useMap } from 'react-leaflet'

export const RecenterMap = ({ lat, lng }) => {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng])
  }, [lat, lng])
  return null
}

RecenterMap.propTypes = {
  lat: PropTypes?.number.isRequired,
  lng: PropTypes?.number.isRequired,
}
