/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

export const useFetchHistory = (url, { period, from, to, deviceId }, fetch) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      console.log('fetching start at his data')
      if (fetch) {
        setLoading(true)
        setError(null)

        try {
          // Retrieve the token from cookies
          const accessToken = Cookies.get('authToken')
          if (!accessToken) {
            throw new Error('Authentication token not found')
          }

          // Set up the query parameters
          const convertToISTWithOffset = (date) => {
            if (!date) return null // Handle null or undefined dates
            const utcDate = new Date(date) // Parse the date
            const istOffset = 5.5 * 60 * 60 * 1000 // Offset for IST in milliseconds (+5:30 hours)
            const istDate = new Date(utcDate.getTime() + istOffset) // Add IST offset
            const isoStringWithIST = istDate.toISOString() // Replace 'Z' with '+05:30'
            return isoStringWithIST // Return the formatted string
          }

          const params = {
            period,
            from: convertToISTWithOffset(from), // Convert `from` to UTC with offset
            to: convertToISTWithOffset(to), // Convert `to` to UTC with offset
            deviceId,
          }

          const response = await axios.post(
            url,
            {
              period,
              from: convertToISTWithOffset(from),
              to: convertToISTWithOffset(to),
              deviceId,
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            },
          )
          console.log('fetching stop at his data')

          if (response.status === 200) {
            setData(response.data)
            console.log(response.data)
          } else {
            throw new Error(`Error: ${response.status}`)
          }
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [url, period, from, to, deviceId, fetch])

  return { data, loading, error }
}
