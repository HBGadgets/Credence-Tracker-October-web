/* eslint-disable prettier/prettier */
import React from 'react'
import LiveTrackingMap from './LiveTrackingComponent'
import { useParams } from 'react-router-dom'

const SharedLiveTrack = () => {
  const { token } = useParams()
  return <LiveTrackingMap token={token} />
}
export default SharedLiveTrack
