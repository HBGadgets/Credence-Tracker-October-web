/* eslint-disable prettier/prettier */
import React from 'react'
import { IoMdSpeedometer } from 'react-icons/io'
import { HiOutlineStatusOnline, HiOutlineShare } from 'react-icons/hi'
import { RxLapTimer } from 'react-icons/rx'
import { IoLocationSharp } from 'react-icons/io5'
import dayjs from 'dayjs'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import { MdHistory } from 'react-icons/md'
import { FaStreetView } from 'react-icons/fa6'

function PopupContent({ individualSalesMan, address, handleClickOnTrack }) {
  const handleShareLocation = async () => {
    if (!individualSalesMan?.latitude || !individualSalesMan?.longitude) {
      toast.error('Location not available')
      return
    }

    const mapsUrl = `https://www.google.com/maps?q=${individualSalesMan.latitude},${individualSalesMan.longitude}`
    const shareData = {
      title: 'Current Location',
      text: `Check out this location: ${address}`,
      url: mapsUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(mapsUrl)
        toast.success('Link copied to clipboard!')
      }
    } catch (err) {
      console.error('Error sharing:', err)
      if (!navigator.share) {
        toast.error('Failed to copy link')
      }
    }
  }

  return (
    <>
      <div className="toolTip">
        <span style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          <strong>{individualSalesMan?.name || 'User Name'}</strong>
        </span>
        <hr
          style={{
            width: '100%',
            height: '3px',
            marginBottom: '0px',
            marginTop: '5px',
            borderRadius: '5px',
            backgroundColor: '#000',
          }}
        />
        <div className="toolTipContent">
          <div>
            <strong>
              <RxLapTimer size={17} color="#FF7A00" />
            </strong>{' '}
            {dayjs(individualSalesMan?.lastUpdate).format('DD-MM-YYYY HH:mm')}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'start',
              gap: '10px',
            }}
          >
            <div>
              <strong>
                <IoMdSpeedometer size={17} color="#FF7A00" />
              </strong>{' '}
              {(individualSalesMan?.speed || 0).toFixed(2)} km/h{' '}
            </div>
          </div>
          <div>
            <strong>
              <HiOutlineStatusOnline size={17} color="#FF7A00" />
            </strong>{' '}
            {(() => {
              const sp = individualSalesMan?.speed || 0
              const ig = individualSalesMan?.attributes?.ignition
              if (sp < 1 && ig === false) return 'Stopped'
              if (sp < 2 && ig === true) return 'Idle'
              if (sp > 2 && sp < 60 && ig === true) return 'Running'
              if (sp > 60 && ig === true) return 'Over Speed'
              return 'Inactive'
            })()}
          </div>

          <span>
            <strong>
              <IoLocationSharp size={17} color="#FF7A00" />
            </strong>{' '}
            {address}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <button
              className="btn"
              style={{
                flex: 1,
                color: 'white',
                fontSize: '0.8rem',
                backgroundColor: '#000000',
              }}
              onClick={() => handleClickOnTrack(individualSalesMan)}
              title="View Playback History"
            >
              <MdHistory size={14} />
            </button>

            <button
              className="btn"
              style={{
                flex: 1,
                color: 'white',
                fontSize: '0.8rem',
                backgroundColor: '#000000',
              }}
              onClick={handleShareLocation}
              title="Share Location"
            >
              <HiOutlineShare size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

PopupContent.propTypes = {
  individualSalesMan: PropTypes.object.isRequired,
  address: PropTypes.string.isRequired,
  handleClickOnTrack: PropTypes.func.isRequired,
}

export default PopupContent
