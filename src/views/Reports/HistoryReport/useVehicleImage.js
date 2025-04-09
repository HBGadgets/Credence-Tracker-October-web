import { useMemo } from 'react'

// Image data organized by vehicle type and color
import carGreen from '../../../assets/vehicleList/Car/carGreen.svg'
import carRed from '../../../assets/vehicleList/Car/carRed.svg'
import carYellow from '../../../assets/vehicleList/Car/carYellow.svg'
import carOrange from '../../../assets/vehicleList/Car/carOrange.svg'
import carGray from '../../../assets/vehicleList/Car/carGray.svg'
import carBlue from '../../../assets/vehicleList/Car/Blue.svg'

import bikeGreen from '../../../assets/vehicleList/Bike/bikeGreen.svg'
import bikeRed from '../../../assets/vehicleList/Bike/bikeRed.svg'
import bikeYellow from '../../../assets/vehicleList/Bike/bikeYellow.svg'
import bikeOrange from '../../../assets/vehicleList/Bike/bikeOrange.svg'
import bikeGray from '../../../assets/vehicleList/Bike/bikeGray.svg'

import busGreen from '../../../assets/vehicleList/Bus/busGreen.svg'
import busRed from '../../../assets/vehicleList/Bus/busRed.svg'
import busYellow from '../../../assets/vehicleList/Bus/busYellow.svg'
import busOrange from '../../../assets/vehicleList/Bus/busOrange.svg'
import busGray from '../../../assets/vehicleList/Bus/busGray.svg'

import truckGreen from '../../../assets/vehicleList/Truck/truckGreen.svg'
import truckRed from '../../../assets/vehicleList/Truck/truckRed.svg'
import truckYellow from '../../../assets/vehicleList/Truck/truckYellow.svg'
import truckOrange from '../../../assets/vehicleList/Truck/truckOrange.svg'
import truckGray from '../../../assets/vehicleList/Truck/truckGray.svg'

import craneGreen from '../../../assets/vehicleList/Crane/craneGreen.svg'
import craneRed from '../../../assets/vehicleList/Crane/craneRed.svg'
import craneYellow from '../../../assets/vehicleList/Crane/craneYellow.svg'
import craneOrange from '../../../assets/vehicleList/Crane/craneOrange.svg'
import craneGray from '../../../assets/vehicleList/Crane/craneGray.svg'

import jcbGreen from '../../../assets/vehicleList/JCB/jcbGreen.svg'
import jcbRed from '../../../assets/vehicleList/JCB/jcbRed.svg'
import jcbYellow from '../../../assets/vehicleList/JCB/jcbYellow.svg'
import jcbOrange from '../../../assets/vehicleList/JCB/jcbOrange.svg'
import jcbGray from '../../../assets/vehicleList/JCB/jcbGray.svg'

import autoGreen from '../../../assets/vehicleList/Auto/autoGreen.svg'
import autoRed from '../../../assets/vehicleList/Auto/autoRed.svg'
import autoYellow from '../../../assets/vehicleList/Auto/autoYellow.svg'
import autoOrange from '../../../assets/vehicleList/Auto/autoOrange.svg'
import autoGray from '../../../assets/vehicleList/Auto/autoGray.svg'
import dayjs from 'dayjs'

// Image map to organize vehicle type and color associations
const imageMap = {
  car: {
    red: carRed,
    green: carGreen,
    yellow: carYellow,
    orange: carOrange,
    gray: carGray,
    blue: carBlue,
  },
  bike: {
    red: bikeRed,
    green: bikeGreen,
    yellow: bikeYellow,
    orange: bikeOrange,
    gray: bikeGray,
  },
  truck: {
    red: truckRed,
    green: truckGreen,
    yellow: truckYellow,
    orange: truckOrange,
    gray: truckGray,
  },
  auto: {
    red: autoRed,
    green: autoGreen,
    yellow: autoYellow,
    orange: autoOrange,
    gray: autoGray,
  },
  jcb: {
    red: jcbRed,
    green: jcbGreen,
    yellow: jcbYellow,
    orange: jcbOrange,
    gray: jcbGray,
  },
  crane: {
    red: craneRed,
    green: craneGreen,
    yellow: craneYellow,
    orange: craneOrange,
    gray: craneGray,
  },
  tractor: {
    red: craneRed,
    green: craneGreen,
    yellow: craneYellow,
    orange: craneOrange,
    gray: craneGray,
  },
  bus: {
    red: busRed,
    green: busGreen,
    yellow: busYellow,
    orange: busOrange,
    gray: busGray,
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
    case 'bike':
      return 'bike'
    case 'BIKE':
      return 'bike'
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

const useVehicleImage = (category, item) => {
  const cate = getCategory(category?.toLowerCase()) // Assuming getCategory is a helper function

  // Determine the category-specific image map (memoized)
  const images = useMemo(() => imageMap[cate] || imageMap.car, [cate])

  let image = images.gray // Default to gray image if category is not found

  if (item && item.attributes) {
    const { ignition } = item.attributes
    const speed = item.speed || 0
    const isActive = timeDiffIsLessThan35Hours(item.lastUpdate)
    const status = item.status || 'online' // Default to online if missing

    // 1. Offline status (highest priority)
    if (status === 'offline') {
      image = images.blue || imageMap.car.blue
    }
    // 2. Inactive (online but old update)
    else if (!isActive) {
      image = images.gray
    }
    // 3. Overspeed
    else if (ignition && speed > 60) {
      image = images.orange
    }
    // 4. Stopped (ignition off + low speed)
    else if (!ignition && speed < 1) {
      image = images.red
    }
    // 5. Running
    else if (ignition && speed > 2 && speed <= 60) {
      image = images.green
    }
    // 6. Idle
    else if (ignition && speed <= 2) {
      image = images.yellow
    }
  }

  return image
}

export default useVehicleImage
