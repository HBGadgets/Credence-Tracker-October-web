/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export const useVehicleTrack = (token) => {
  const [position, setPosition] = useState(null)
  const [timerCount, setTimerCount] = useState(0) // Timer count state
  const [showTimer, setShowTimer] = useState(false) // Timer visibility state

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

    // socket.on('testing live track', (data) => {
    //   console.log('Testing Live Track Received vehicle data:', data)
    //   setPosition(data)
    //   setTimerCount(5)
    //   setShowTimer(true)
    // })

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      setLoading(false)
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
      setShowTimer(false) // Hide the timer when it reaches 0
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [showTimer, timerCount])

  return { position, timerCount, showTimer }
}
