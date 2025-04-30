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
  CFormSelect,
} from '@coreui/react'
import { fetchDevices } from '../../../features/deviceSlice.js'
import Loader from '../../../components/Loader/Loader'
import '../style/remove-gutter.css'
import HistoryMap from './HistoryMap'
import './HistoryReport.css'
import '../../../utils.css'
import Select from 'react-select'

const HistoryReport = () => {
  const params = useParams()
  const urlDeviceId = params.deviceId
  const category = params.category
  const travelDeviceId = params.travelDeviceId
  const fromDate = params.fromDate
  const toDate = params.toDate
  const [fromDateTime, setFromDateTime] = useState(fromDate || '')
  const [toDateTime, setToDateTime] = useState(toDate || '')
  const [period, setPeriod] = useState('')
  const [deviceId, setDeviceId] = useState(urlDeviceId || travelDeviceId || '')
  const [fetch, setFetch] = useState(false)
  const [historyOn, setHistoryOn] = useState(false)
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false)

  const dispatch = useDispatch()
  const { devices = [], loading } = useSelector((state) => ({
    devices: state.devices.devices || [],
    loading: state.devices.loading,
  }))

  const selectedDevice = devices.find((device) => device.deviceId === deviceId) || {}
  const deviceName = selectedDevice.name || ''

  const deviceOptions = devices.map((device) => ({
    value: device.deviceId,
    label: device.name,
  }))

  // Set period to Custom if travel parameters exist
  useEffect(() => {
    if (travelDeviceId) {
      setPeriod('Custom')
    }
  }, [travelDeviceId])

  // Auto-submit when travel parameters are present
  useEffect(() => {
    if (travelDeviceId && fromDate && toDate && !hasAutoSubmitted) {
      const timer = setTimeout(() => {
        if (period === 'Custom' && deviceId && fromDateTime && toDateTime) {
          const { fromDate, toDate } = normalizeToFromDates(fromDateTime)
          setFromDateTime(fromDate)
          setToDateTime(toDate)
          handleAutoSubmit()
          setHasAutoSubmitted(true)
        }
      }, 500) // Short delay to ensure state updates
      return () => clearTimeout(timer)
    }
  }, [period, deviceId, fromDateTime, toDateTime, hasAutoSubmitted])

  // Normalize to correct date format
  const normalizeToFromDates = (isoDateStr) => {
    const date = new Date(isoDateStr)
    if (isNaN(date)) throw new Error('Invalid date')

    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    const normalizedFrom = new Date(`${dateStr}T00:01:00.100Z`)
    const normalizedTo = new Date(`${dateStr}T23:59:59.000Z`)

    return {
      fromDate: normalizedFrom.toISOString(),
      toDate: normalizedTo.toISOString(),
    }
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

  const handleAutoSubmit = () => {
    const isCustomPeriod = period === 'Custom'

    if (!period || !deviceId || (isCustomPeriod && (!fromDateTime || !toDateTime))) return

    if (isCustomPeriod && !validateDateRange(fromDateTime, toDateTime)) return

    setHistoryOn(true)
    setFetch(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const isCustomPeriod = period === 'Custom'
    const missingFields = []

    if (!period) missingFields.push('period')
    if (isCustomPeriod && !fromDateTime) missingFields.push('from date-time')
    if (isCustomPeriod && !toDateTime) missingFields.push('to date-time')
    if (!deviceId) missingFields.push('vehicle')

    if (missingFields.length > 0) {
      alert(`Please fill the following fields: ${missingFields.join(', ')}`)
      return
    }

    if (isCustomPeriod) {
      const { fromDate, toDate } = normalizeToFromDates(fromDateTime)
      setFromDateTime(fromDate)
      setToDateTime(toDate)
      if (!validateDateRange(fromDate, toDate)) return
    }

    setHistoryOn(true)
    setFetch(true)
  }

  const handleDeviceChange = (selectedOption) => {
    setDeviceId(selectedOption ? selectedOption.value : '')
  }

  useEffect(() => {
    dispatch(fetchDevices())
  }, [dispatch])

  return (
    <>
      <CRow className="justify-content-center gutter-0" style={{ overflow: 'hidden' }}>
        <CCol xs={12} className="px-4">
          <CCard className="p-0 mb-4 shadow-sm">
            <CCardBody>
              <HistoryMap
                period={period}
                fromDateTime={fromDateTime}
                toDateTime={toDateTime}
                deviceId={deviceId}
                fetch={fetch}
                setFetch={setFetch}
                historyOn={historyOn}
                setHistoryOn={setHistoryOn}
                category={category}
                name={deviceName}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      {!historyOn && (
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
                    <CFormLabel htmlFor="period">Select Date Range</CFormLabel>
                    <CFormSelect
                      id="period"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                    >
                      <option value="">Select a period</option>
                      <option value="Today">Today</option>
                      <option value="Yesterday">Yesterday</option>
                      <option value="Last Seven Days">Last Seven Days</option>
                      <option value="Custom">Custom</option>
                    </CFormSelect>
                  </div>

                  {period === 'Custom' && (
                    <>
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
                    </>
                  )}

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
                          maxHeight: '200px',
                          overflowY: 'scroll',
                          '&::-webkit-scrollbar': { width: '8px' },
                          '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                          '&::-webkit-scrollbar-thumb': {
                            background: '#888',
                            borderRadius: '4px',
                          },
                          '&::-webkit-scrollbar-thumb:hover': { background: '#555' },
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
      )}
    </>
  )
}

export default HistoryReport
