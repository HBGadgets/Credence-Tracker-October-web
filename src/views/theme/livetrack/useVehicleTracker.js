import { useState, useEffect } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { socket } from '../../../features/LivetrackingDataSlice'
import Cookies from 'js-cookie'

const useVehicleTracker = (deviceId) => {
  const [vehicleData, setVehicleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timerCount, setTimerCount] = useState(0) // Timer count state
  const [showTimer, setShowTimer] = useState(false) // Timer visibility state
  const accessToken = Cookies.get('authToken')

  // useEffect(() => {
  //   let intervalId

  //   const fetchVehicleData = async () => {
  //     try {
  //       setLoading(true) // Set loading state to true before fetching
  //       const positionsAPI = `${import.meta.env.VITE_API_POSITION}/api/positions?deviceId=${deviceId}`
  //       const auth = {
  //         username: 'hbtrack',
  //         password: '123456@',
  //       }
  //       const response = await axios.get(positionsAPI, { auth })
  //       console.log('Length of positions API: ' + response.data[0])

  //       if (response.data) {
  //         setVehicleData(response.data) // Update state with fetched data
  //       } else {
  //         // setError('No vehicle data found') // Handle case where no data is returned
  //       }
  //     } catch (err) {
  //       // setError('Error fetching vehicle data: ' + err.message) // Set error state
  //     } finally {
  //       setLoading(false) // Set loading state to false after fetching
  //     }
  //   }

  //   fetchVehicleData()

  //   intervalId = setInterval(fetchVehicleData, 2500)

  //   return () => clearInterval(intervalId)
  // }, [deviceId])

  useEffect(() => {
    // Optionally, set the loading state initially.
    setLoading(true)

    // Create a socket connection to your backend.
    const socket = io(`${import.meta.env.VITE_API_URL}`, {
      transports: ['websocket', 'polling'],
    })

    // When the socket connects successfully.
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      socket.emit('credentials', accessToken)
    })

    setTimeout(() => {
      // Listen for the vehicleData event.
      socket.emit('deviceId', Number(deviceId))
      console.log('DEVICE ID', Number(deviceId))

      socket.on('single device data', (data) => {
        console.log('Received vehicle data:', data)
        setVehicleData([data])
        setTimerCount(5)
        setShowTimer(true)
      })
      // socket.on('testing live track', (data) => {
      //   console.log('Received vehicle data:', data)
      //   setVehicleData([data])
      // })
    }, 3000)

    // Listen for any connection errors.
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      setLoading(false)
      setShowTimer(false)
    })

    // Clean up the socket connection when the component unmounts or when deviceId changes.
    return () => {
      socket.disconnect()
    }
  }, [deviceId, setVehicleData, setLoading])

  useEffect(() => {
    let interval
    if (showTimer && timerCount > 0) {
      interval = setInterval(() => {
        setTimerCount((prev) => prev - 1)
      }, 1000)
    } else if (timerCount === 0) {
      setShowTimer(false) // Hide the timer when it reaches 0
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [showTimer, timerCount])

  return { vehicleData, loading, error, timerCount, showTimer }
}

export default useVehicleTracker
