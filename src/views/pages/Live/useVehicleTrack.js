import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export const useVehicleTrack = (token) => {
  const [position, setPosition] = useState(null)
  const [timerCount, setTimerCount] = useState(0)
  const [showTimer, setShowTimer] = useState(false)
  const [tokenExpired, setTokenExpired] = useState(false) // <-- new state

  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_API_URL}`, {
      transports: ['websocket', 'polling'],
    })

    socket.emit('shared device token', token)

    socket.on('shared device data', (data) => {
      console.log('Received vehicle data:', data)
      setPosition(data)
      setTimerCount(5)
      setShowTimer(true)
    })

    socket.on('error', (err) => {
      console.error('Socket connection error:', err)
      // Check if the error message contains "Invalid token" or similar conditions
      if (err?.message?.toLowerCase().includes('invalid token')) {
        setTokenExpired(true)
      }
      setShowTimer(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [token])

  useEffect(() => {
    let interval
    if (showTimer && timerCount > 0) {
      interval = setInterval(() => {
        setTimerCount((prev) => prev - 1)
      }, 1000)
    } else if (timerCount === 0) {
      setShowTimer(false)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [showTimer, timerCount])

  return { position, timerCount, showTimer, tokenExpired }
}
