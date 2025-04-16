import React from 'react'
import L from 'leaflet' // Import L for Leaflet methods
import busredSvg from '../../../assets/AllTopViewVehicle/Top R.svg'
import busyellowSvg from '../../../assets/AllTopViewVehicle/Top Y.svg'
import busgreenSvg from '../../../assets/AllTopViewVehicle/Top G.svg'
import busorangeSvg from '../../../assets/AllTopViewVehicle/Top O.svg'
import busgraySvg from '../../../assets/AllTopViewVehicle/Top Grey.svg'
import busblueSvg from '../../../assets/AllTopViewVehicle/Top B.svg'

import carredSvg from '../../../assets/AllTopViewVehicle/Car-R.svg'
import caryellowSvg from '../../../assets/AllTopViewVehicle/Car-Y.svg'
import cargreenSvg from '../../../assets/AllTopViewVehicle/Car-G.svg'
import carorangeSvg from '../../../assets/AllTopViewVehicle/Car-O.svg'
import cargraySvg from '../../../assets/AllTopViewVehicle/Car-Grey.svg'
import carblueSvg from '../../../assets/AllTopViewVehicle/Car-B.svg'

import tractorredSvg from '../../../assets/AllTopViewVehicle/Tractor-R.svg'
import tractoryellowSvg from '../../../assets/AllTopViewVehicle/Tractor-Y.svg'
import tractorgreenSvg from '../../../assets/AllTopViewVehicle/Tractor-G.svg'
import tractororangeSvg from '../../../assets/AllTopViewVehicle/Tractor-O.svg'
import tractorgraySvg from '../../../assets/AllTopViewVehicle/Tractor-Grey.svg'
import tractorblueSvg from '../../../assets/AllTopViewVehicle/Tractor-B.svg'

import autoredSvg from '../../../assets/AllTopViewVehicle/Auto-R.svg'
import autoyellowSvg from '../../../assets/AllTopViewVehicle/Auto-Y.svg'
import autogreenSvg from '../../../assets/AllTopViewVehicle/Auto-G.svg'
import autoorangeSvg from '../../../assets/AllTopViewVehicle/Auto-O.svg'
import autograySvg from '../../../assets/AllTopViewVehicle/Auto-Grey.svg'
import autoblueSvg from '../../../assets/AllTopViewVehicle/Auto-B.svg'

import jcbredSvg from '../../../assets/AllTopViewVehicle/JCB-R.svg'
import jcbyellowSvg from '../../../assets/AllTopViewVehicle/JCB-Y.svg'
import jcbgreenSvg from '../../../assets/AllTopViewVehicle/JCB-G.svg'
import jcborangeSvg from '../../../assets/AllTopViewVehicle/JCB-O.svg'
import jcbgraySvg from '../../../assets/AllTopViewVehicle/JCB-GREY.svg'
import jcbblueSvg from '../../../assets/AllTopViewVehicle/JCB-B.svg'

import truckredSvg from '../../../assets/AllTopViewVehicle/Truck-R.svg'
import truckyellowSvg from '../../../assets/AllTopViewVehicle/Truck-Y.svg'
import truckgreenSvg from '../../../assets/AllTopViewVehicle/Truck-G.svg'
import truckorangeSvg from '../../../assets/AllTopViewVehicle/Truck-O.svg'
import truckgraySvg from '../../../assets/AllTopViewVehicle/Truck-Grey.svg'
import truckblueSvg from '../../../assets/AllTopViewVehicle/Truck-B.svg'
import dayjs from 'dayjs'

const mapIcons = {
  bus: {
    red: busredSvg,
    yellow: busyellowSvg,
    green: busgreenSvg,
    orange: busorangeSvg,
    gray: busgraySvg,
    blue: busblueSvg,
  },
  car: {
    red: carredSvg,
    yellow: caryellowSvg,
    green: cargreenSvg,
    orange: carorangeSvg,
    gray: cargraySvg,
    blue: carblueSvg,
  },
  tractor: {
    red: tractorredSvg,
    yellow: tractoryellowSvg,
    green: tractorgreenSvg,
    orange: tractororangeSvg,
    gray: tractorgraySvg,
    blue: tractorblueSvg,
  },
  auto: {
    red: autoredSvg,
    yellow: autoyellowSvg,
    green: autogreenSvg,
    orange: autoorangeSvg,
    gray: autograySvg,
    blue: autoblueSvg,
  },
  jcb: {
    red: jcbredSvg,
    yellow: jcbyellowSvg,
    green: jcbgreenSvg,
    orange: jcborangeSvg,
    gray: jcbgraySvg,
    blue: jcbblueSvg,
  },
  truck: {
    red: truckredSvg,
    yellow: truckyellowSvg,
    green: truckgreenSvg,
    orange: truckorangeSvg,
    gray: truckgraySvg,
    blue: truckblueSvg,
  },
  default: {
    red: carredSvg,
    yellow: caryellowSvg,
    green: cargreenSvg,
    orange: carorangeSvg,
    gray: cargraySvg,
    blue: carblueSvg,
  },
}
const getCategory = (category) => {
  switch (category) {
    case 'car':
      return 'car'
    case 'bus':
      return 'bus'
    case 'truck':
      return 'truck'
    case 'motorcycle':
      return 'bike' // Adjusted to match the imageMap key
    case 'auto':
      return 'auto'
    case 'tractor':
      return 'crane'
    case 'jcb':
      return 'jcb'
    default:
      return 'car' // Default case
  }
}

const maxDiffInHours = 35

function timeDiffIsLessThan35Hours(lastUpdate) {
  const lastUpdateTime = dayjs(lastUpdate)
  const now = dayjs()
  return now.diff(lastUpdateTime, 'hour') <= maxDiffInHours
}

const useGetVehicleIcon = (vehicle, cat) => {
  const category = getCategory(cat?.toLowerCase())
  const selectedCategory = mapIcons[category] || mapIcons['default']

  if (!vehicle || !vehicle.attributes) {
    const iconUrl = selectedCategory?.gray || mapIcons.default.gray
    return createDivIcon(iconUrl, 0)
  }

  const ignition = vehicle.attributes.ignition
  const speed = Number(vehicle.speed || 0)
  const course = Number(vehicle.course || 0)
  const lat = Number(vehicle.latitude || 0)
  const lng = Number(vehicle.longitude || 0)
  const lastUpdate = vehicle.lastUpdate || ''
  const isRecent = timeDiffIsLessThan35Hours(lastUpdate)
  const status = vehicle.status || 'online'

  let iconUrl

  // 🔵 New/uninstalled → lat/lng is 0
  if (lat === 0 && lng === 0) {
    iconUrl = selectedCategory?.blue || mapIcons.default.blue
  }
  // ⚫ Inactive → offline and last update > 35h
  else if (status === 'offline' && !isRecent) {
    iconUrl = selectedCategory?.gray || mapIcons.default.gray
  }
  // 🔴 Stopped → ignition off or false, speed < 1
  else if ((!ignition || ignition === false) && speed < 1) {
    iconUrl = selectedCategory?.red || mapIcons.default.red
  }
  // 🟠 Overspeed
  else if (ignition && speed > 60) {
    iconUrl = selectedCategory?.orange || mapIcons.default.orange
  }
  // 🟢 Running
  else if (ignition && speed > 2 && speed <= 60) {
    iconUrl = selectedCategory?.green || mapIcons.default.green
  }
  // 🟡 Idle
  else if (ignition && speed <= 2) {
    iconUrl = selectedCategory?.yellow || mapIcons.default.yellow
  }
  // Default fallback
  else {
    iconUrl = selectedCategory?.gray || mapIcons.default.gray
  }

  return createDivIcon(iconUrl, course)
}

// Helper function to create the div icon
const createDivIcon = (iconUrl, course) => {
  return L.divIcon({
    html: `<img src="${iconUrl}" style="transform: rotate(${course}deg); width: 48px; height: 48px;" />`,
    iconSize: [48, 48],
    iconAnchor: [24, 24], // Anchor at the center
    popupAnchor: [0, -24], // Popup above the icon
    className: '', // No additional styling
  })
}

export default useGetVehicleIcon
