import { useState, useEffect } from 'react'
import axios from 'axios'

const useVehicleTracker = (deviceId) => {
  const [vehicleData, setVehicleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let intervalId

    const fetchVehicleData = async () => {
      try {
        setLoading(true) // Set loading state to true before fetching
        const positionsAPI = `http://63.142.251.13:8082/api/positions?deviceId=${deviceId}`
        const auth = {
          username: 'hbtrack',
          password: '123456@',
        }
        const response = await axios.get(positionsAPI, { auth })
        console.log('Length of positions API: ' + response.data[0])

        if (response.data) {
          setVehicleData(response.data) // Update state with fetched data
        } else {
          // setError('No vehicle data found') // Handle case where no data is returned
        }
      } catch (err) {
        // setError('Error fetching vehicle data: ' + err.message) // Set error state
      } finally {
        setLoading(false) // Set loading state to false after fetching
      }
    }

    fetchVehicleData()

    intervalId = setInterval(fetchVehicleData, 2500)

    return () => clearInterval(intervalId)
  }, [deviceId])

  return { vehicleData, loading, error } 
}

export default useVehicleTracker
