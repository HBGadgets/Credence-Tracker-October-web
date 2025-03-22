import { createSlice } from '@reduxjs/toolkit'
import { io } from 'socket.io-client'
import dayjs from 'dayjs'

// Define initial state
const initialState = {
  vehicles: [],
  filteredVehicles: [],
  singleVehicle: null,
  loading: true,
  error: null,
  deviceNames: [],
  activeFilter: null, // Added state to track the current active filter
}

// WebSocket connection logic
export const socket = io(`${import.meta.env.VITE_API_URL}`, {
  transports: ['websocket', 'polling'], // Specify transports (optional)
})

// Create the slice with filtering logic

const maxDiffInHours = 35

function timeDiffIsLessThan35Hours(lastUpdate) {
  const lastUpdateTime = dayjs(lastUpdate)
  const now = dayjs()
  return now.diff(lastUpdateTime, 'hour') <= maxDiffInHours
}
const liveFeaturesSlice = createSlice({
  name: 'liveFeatures',
  initialState,
  reducers: {
    // Handle updating vehicles with data from WebSocket
    setVehicles(state, action) {
      state.loading = true
      state.vehicles = action.payload

      // Reapply the active filter whenever vehicles are updated
      if (state.activeFilter) {
        // Reapply the active filter using the stored filter function

        state.loading = true
        state.filteredVehicles = state.activeFilter(state.vehicles)

        state.loading = false
      } else {
        // Default behavior: show all vehicles if no filter is active

        state.loading = true
        state.filteredVehicles = state.vehicles

        state.loading = false
      }

      // Set loading to false after 3 seconds
      // setTimeout(() => {
      // }, 3000)
    },

    // Handle WebSocket error
    setError(state, action) {
      state.loading = false
      state.error = action.payload
    },

    // Update logic for individual vehicle
    updateSingleVehicle(state, action) {
      const updatedVehicle = action.payload
      if (state.singleVehicle?.deviceId === updatedVehicle.deviceId) {
        state.singleVehicle = updatedVehicle
      }
    },

    // Selecting single vehicle
    setSingleVehicle(state, action) {
      state.loading = true
      const vehicleId = action.payload
      state.singleVehicle = state.vehicles.find((vehicle) => vehicle.deviceId === vehicleId)
      state.loading = false
    },

    // Filtering logic (e.g., stopped, idle, running vehicles)
    filterAllVehicles(state) {
      state.loading = true
      state.activeFilter = (vehicles) => vehicles // Store filter function
      state.filteredVehicles = state.activeFilter(state.vehicles)
      state.loading = false
    },
    filterStoppedVehicles(state) {
      state.loading = true
      state.activeFilter = (vehicles) =>
        vehicles.filter(
          (vehicle) =>
            vehicle.attributes.ignition === false &&
            vehicle.speed < 1 &&
            timeDiffIsLessThan35Hours(vehicle.lastUpdate),
        ) // Store filter function
      state.filteredVehicles = state.activeFilter(state.vehicles)
      state.loading = false
    },
    filterIdleVehicles(state) {
      state.loading = true
      state.activeFilter = (vehicles) =>
        vehicles.filter(
          (vehicle) =>
            vehicle.attributes.ignition === true &&
            vehicle.speed < 2 &&
            timeDiffIsLessThan35Hours(vehicle.lastUpdate),
        ) // Store filter function
      state.filteredVehicles = state.activeFilter(state.vehicles)
      state.loading = false
    },
    filterRunningVehicles(state) {
      state.loading = true
      state.activeFilter = (vehicles) =>
        vehicles.filter(
          (vehicle) =>
            vehicle.attributes.ignition === true &&
            vehicle.speed > 2 &&
            vehicle.speed < 60 &&
            timeDiffIsLessThan35Hours(vehicle.lastUpdate),
        ) // Store filter function
      state.filteredVehicles = state.activeFilter(state.vehicles)
      state.loading = false
    },
    filterOverspeedVehicles(state) {
      state.loading = true
      state.activeFilter = (vehicles) =>
        vehicles.filter(
          (vehicle) =>
            vehicle.attributes.ignition === true &&
            vehicle.speed > 60 &&
            timeDiffIsLessThan35Hours(vehicle.lastUpdate),
        ) // Store filter function
      state.filteredVehicles = state.activeFilter(state.vehicles)
      state.loading = false
    },
    filterInactiveVehicles(state) {
      state.loading = true
      state.activeFilter = (vehicles) => {
        const currentTime = new Date()

        return vehicles.filter((vehicle) => {
          const lastUpdate = new Date(vehicle.lastUpdate)
          const timeDifference = (currentTime - lastUpdate) / (1000 * 60 * 60) // time difference in hours
          return timeDifference > 35
        })
      }

      state.filteredVehicles = state.activeFilter(state.vehicles)
      state.loading = false
    },
    filterByCategory(state, action) {
      state.loading = true
      const cat = action.payload // Expecting just the category string
      // console.log('LIVE TRACKING SLICE', cat)
      if (cat === 'all') {
        state.activeFilter = (vehicles) => vehicles
      } else {
        state.activeFilter = (vehicles) =>
          vehicles.filter(
            (vehicle) => vehicle.category && vehicle.category.toLowerCase() === cat.toLowerCase(),
          )
      }
      state.filteredVehicles = state.activeFilter(state.vehicles)
      state.loading = false
    },

    filterByGroup(state, action) {
      state.loading = true
      state.activeFilter = (vehicles) =>
        vehicles.filter((vehicle) => vehicle.groupId === action.payload) // Store filter function
      state.filteredVehicles = state.activeFilter(state.vehicles)
      state.loading = false
    },
    filterByGeofence(state, action) {
      state.loading = true
      state.activeFilter = (vehicles) =>
        vehicles.filter(
          (vehicle) => vehicle.geofenceIds && vehicle.geofenceIds.includes(action.payload),
        ) // Store filter function
      state.filteredVehicles = state.activeFilter(state.vehicles)
      state.loading = false
    },
    filterBySingleVehicle(state, action) {
      state.loading = true
      state.activeFilter = (vehicles) =>
        vehicles.filter((vehicle) => vehicle.name === action.payload) // Store filter function
      state.filteredVehicles = state.activeFilter(state.vehicles)
      state.loading = false
    },
    searchVehiclesByName(state, action) {
      state.loading = true
      const searchTerm = action.payload.toLowerCase() // Convert to lowercase for case-insensitive search
      state.activeFilter = (vehicles) =>
        vehicles.filter((vehicle) => vehicle.name.toLowerCase().includes(searchTerm)) // Store filter function
      state.filteredVehicles = state.activeFilter(state.vehicles)
      state.loading = false
    },
    filterByDevices(state, action) {
      state.loading = true
      const devicesData = action.payload
      state.activeFilter = (vehicles) =>
        vehicles.filter((vehicle) =>
          devicesData.some((device) => device.deviceId == vehicle.deviceId),
        ) // Store filter function
      state.filteredVehicles = state.activeFilter(state.vehicles)
      state.loading = false
    },
    changeVehicles(state, action) {
      state.loading = true

      // Directly replace the filteredVehicles with the payload
      // assuming the payload contains the new list of filtered vehicles
      state.filteredVehicles = action.payload

      // Update the activeFilter to return the same list for consistency
      state.activeFilter = () => action.payload

      state.loading = false
    },
  },
})

// WebSocket event listeners
export const initializeSocket = (credentials) => (dispatch) => {
  if (!credentials) {
    console.error('initializeSocket: credentials are undefined or null')
    return
  }

  let convertedCredentialsIntoObject
  try {
    // convertedCredentialsIntoObject = JSON.parse(credentials)
    // Device show has per user
    convertedCredentialsIntoObject = credentials
    // console.log('Converted credentials:', convertedCredentialsIntoObject)
  } catch (error) {
    // console.error('Failed to parse credentials:', error.message)
    return
  }

  // Handle connection event
  socket.on('connect', () => {
    // console.log('Connected to the socket server')
  })

  // Handle disconnection event
  socket.on('disconnect', () => {
    // console.log('Disconnected from the socket server')
  })

  // Listen for live vehicle data
  socket.emit('credentials', convertedCredentialsIntoObject)
  socket.on('all device data', (data) => {
    // console.log(data)
    dispatch(liveFeaturesSlice.actions.setVehicles(data))
  })

  // Listen for errors
  socket.on('error', (error) => {
    console.error('Socket error:', error)
    dispatch(liveFeaturesSlice.actions.setError(error))
  })

  // Example of emitting an event to the server
  socket.emit('client-message', { message: 'Hello from client!' })
}

// Export the actions
export const {
  setVehicles,
  setError,
  filterAllVehicles,
  filterStoppedVehicles,
  filterIdleVehicles,
  filterRunningVehicles,
  filterOverspeedVehicles,
  filterInactiveVehicles,
  filterByCategory,
  filterByGroup,
  filterByGeofence,
  filterBySingleVehicle,
  searchVehiclesByName,
  setSingleVehicle,
  updateSingleVehicle,
  filterByDevices,
  vehicles,
  changeVehicles,
} = liveFeaturesSlice.actions

export const selectDeviceNames = (state) => state.liveFeatures.deviceNames

// Export the reducer
export default liveFeaturesSlice.reducer
