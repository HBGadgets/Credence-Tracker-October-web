/* eslint-disable prettier/prettier */
import React from 'react'
import Loader from '../../../components/Loader2/Loader2'
import logo from '../../../assets/brand/logo.png'

export const LoaderComponent = () => {
  return (
    <>
      <Loader />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src={logo} style={{ width: '200px' }} alt="logo" />
      </div>
    </>
  )
}
