/* eslint-disable prettier/prettier */
import React from 'react'
import { RefreshCw } from 'lucide-react'
import PropTypes from 'prop-types'

function TimerPopup({ timerCount }) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(5px)',
        color: 'black',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '8px 25px',
        borderRadius: '10px',
        zIndex: 1000,
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
      }}
    >
      <RefreshCw
        style={{
          animation: 'spin 1s linear infinite',
        }}
        size={15}
      />
      <style>
        {`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
      </style>
      Refresh in {timerCount} seconds
    </div>
  )
}

export default TimerPopup

TimerPopup.propTypes = {
  timerCount: PropTypes.number.isRequired,
}
