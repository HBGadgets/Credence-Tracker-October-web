/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import Loader from '../../../components/Loader2/Loader2'
import logo from '../../../assets/brand/logo.png'

export const LoaderComponent = ({ tokenExpired }) => {
  useEffect(() => {
    if (tokenExpired) {
      alert('Your session has expired.')
      // Optionally redirect or show login UI
      window.location.href = '/login'
    }
  }, [tokenExpired])

  console.log('token expired', tokenExpired)

  return (
    <>
      <Loader />
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <img src={logo} alt="logo" style={{ width: '100%', maxWidth: '150px', height: 'auto' }} />
      </div>
    </>
  )
}
