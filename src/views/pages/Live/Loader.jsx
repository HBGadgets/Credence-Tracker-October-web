/* eslint-disable prettier/prettier */
import React from 'react'
import Loader from '../../../components/Loader2/Loader2'
import logo from '../../../assets/brand/logo.png'

export const LoaderComponent = () => {
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
