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

    setTimeout(() => {
      socket.emit(
        'shared device token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6Njc4OCwiaWF0IjoxNzQ0MTk3MzQ5LCJleHAiOjE3NDQzMjk1OTl9.-a0uzNuiPsm54o-I9sqOe-zmxyHmGLJ55tQUH7Gy5q4',
      )

      socket.on('testing live track', (data) => {
        console.log('Received vehicle data:', data)
        setPosition(data)
        setTimerCount(5)
        setShowTimer(true)
      })
    }, 3000)

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
