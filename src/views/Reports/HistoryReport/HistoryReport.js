import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CRow,
  CFormLabel,
} from '@coreui/react'

import { fetchDevices } from '../../../features/deviceSlice.js'
import Loader from '../../../components/Loader/Loader'
import '../style/remove-gutter.css'
import HistoryMap from './HistoryMap'
import './HistoryReport.css'
import '../../../utils.css'

// Import react-select
import Select from 'react-select'

const HistoryReport = () => {
  const { deviceId: urlDeviceId, category, name } = useParams() // Retrieve params from URL
  const [fromDateTime, setFromDateTime] = useState('')
  const [toDateTime, setToDateTime] = useState('')
  const [deviceId, setDeviceId] = useState(urlDeviceId || '')
  const [fetch, setFetch] = useState(false)
  const [historyOn, setHistoryOn] = useState(false)

  const formatDate = (date) => {
    return date.toLocaleDateString('en-CA') // This formats as YYYY-MM-DD
  }

  const validateDateRange = (fromDate, toDate) => {
    const fromDateObj = new Date(fromDate)
    const toDateObj = new Date(toDate)
    const today = new Date()
    const diffInDays = (toDateObj - fromDateObj) / (1000 * 60 * 60 * 24)

    if (toDateObj > today) {
      alert('You cannot select a future date.')
      return false
    }

    if (diffInDays > 7) {
      alert('You cannot select a date range exceeding 7 days.')
      return false
    }

    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (fromDateTime === '' || toDateTime === '' || deviceId === '') {
      alert('Please fill all fields')
    } else if (validateDateRange(fromDateTime, toDateTime)) {
      setHistoryOn(true)
      setFetch(true)
    }
  }

  const dispatch = useDispatch()
  const { devices, loading } = useSelector((state) => state.devices)

  useEffect(() => {
    dispatch(fetchDevices())
  }, [dispatch])

  const handleDeviceChange = (selectedOption) => {
    setDeviceId(selectedOption ? selectedOption.value : '')
  }

  // Transform devices to the format react-select expects
  const deviceOptions = devices.map((device) => ({
    value: device.deviceId,
    label: device.name,
  }))

  return (
    <>
      <CRow className="justify-content-center gutter-0" style={{ overflow: 'hidden' }}>
        <CCol xs={12} className="px-4">
          <CCard className="p-0 mb-4 shadow-sm">
            <CCardBody>
              <HistoryMap
                fromDateTime={fromDateTime}
                toDateTime={toDateTime}
                deviceId={deviceId}
                fetch={fetch}
                setFetch={setFetch}
                historyOn={historyOn}
                setHistoryOn={setHistoryOn}
                category={category}
                name={name}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      {!historyOn ? (
        <CRow className="pt-3 gutter-0">
          <CCol xs={12} md={12} className="px-4">
            <CCard className="mb-4 p-0 shadow-lg rounded">
              <CCardHeader
                className="d-flex justify-content-between align-items-center text-white"
                style={{ backgroundColor: '#0a2d63' }}
              >
                <strong>History Report</strong>
              </CCardHeader>
              <CCardBody>
                <CForm style={{ display: 'flex', gap: '4rem' }} onSubmit={handleSubmit}>
                  <div style={{ width: '20rem' }}>
                    <CFormLabel htmlFor="fromDateTime">From Date-Time</CFormLabel>
                    <CFormInput
                      type="datetime-local"
                      id="fromDateTime"
                      value={fromDateTime}
                      onChange={(e) => setFromDateTime(e.target.value)}
                    />
                  </div>

                  <div style={{ width: '20rem' }}>
                    <CFormLabel htmlFor="toDateTime">To Date-Time</CFormLabel>
                    <CFormInput
                      type="datetime-local"
                      id="toDateTime"
                      value={toDateTime}
                      onChange={(e) => setToDateTime(e.target.value)}
                    />
                  </div>

                  {/* Searchable device select using react-select */}
                  <div style={{ width: '20rem' }}>
                    <CFormLabel htmlFor="device">Vehicles</CFormLabel>
                    <Select
                      id="device-select"
                      value={deviceOptions.find((device) => device.value === deviceId)}
                      onChange={handleDeviceChange}
                      options={deviceOptions}
                      placeholder="Select a Vehicle"
                      styles={{
                        menuList: (base) => ({
                          ...base,
                          maxHeight: '200px', // Restrict max height
                          overflowY: 'scroll', // Enable scrolling
                          '&::-webkit-scrollbar': {
                            width: '8px', // Scrollbar width
                          },
                          '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1', // Track color
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: '#888', // Scrollbar color
                            borderRadius: '4px',
                          },
                          '&::-webkit-scrollbar-thumb:hover': {
                            background: '#555', // Hover effect
                          },
                        }),
                      }}
                    />
                  </div>

                  <CButton
                    color="primary"
                    type="submit"
                    style={{
                      height: '2.5rem',
                      width: '10rem',
                      marginTop: '2rem',
                      backgroundColor: '#0a2d63',
                      marginLeft: '40px',
                    }}
                  >
                    Show
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      ) : (
        <CRow className="pt-3 gutter-0">
          <CCol xs={12} md={12} className="px-4">
            <CCard className="mb-4 p-0 shadow-lg rounded">
              <CCardHeader
                className="d-flex justify-content-between align-items-center text-white"
                style={{ backgroundColor: '#0a2d63' }}
              >
                <strong>History Report</strong>
              </CCardHeader>
              <CCardBody>
                <div className="text-center py-4">History data is not available</div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default HistoryReport
