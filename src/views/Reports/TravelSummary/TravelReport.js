import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CRow,
  CFormLabel,
  CFormFeedback,
  CTooltip,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CPagination,
  CPaginationItem,
  CTab,
  CCollapse,
} from '@coreui/react'
import { Plus, Minus } from 'lucide-react'
import Select from 'react-select'
import Cookies from 'js-cookie'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilSettings, cilChevronBottom, cilChevronRight } from '@coreui/icons'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { auto } from '@popperjs/core'
import idel from 'src/status/idel.png'
import ignitionOff from 'src/status/power-off.png'
import ignitionOn from 'src/status/power-on.png'
import Loader from '../../../components/Loader/Loader'
import '../style/remove-gutter.css'
import '../../../utils.css'
import IconDropdown from '../../../components/ButtonDropdown'
import { color } from 'framer-motion'
import { FaRegFilePdf, FaPrint } from 'react-icons/fa6'
import { PiMicrosoftExcelLogo } from 'react-icons/pi'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaArrowUp } from 'react-icons/fa'
import toast, { Toaster } from 'react-hot-toast'
import { jwtDecode } from 'jwt-decode'
import { ContentPasteOffOutlined } from '@mui/icons-material'
const accessToken = Cookies.get('authToken')

const decodedToken = jwtDecode(accessToken)

import PropTypes from 'prop-types'
import Page404 from '../../pages/page404/Page404'

const SearchTravel = ({
  formData,
  handleInputChange,
  handleSubmit,
  users,
  groups,
  getGroups,
  selectedGroupName,
  devices,
  loading,
  getDevices,
  columns,
  showMap,
  setShowMap,
  handlePutName,
}) => {
  const [validated, setValidated] = useState(false)
  const [showDateInputs, setShowDateInputs] = useState(false)
  const [buttonText, setButtonText] = useState('SHOW NOW')
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [selectedU, setSelectedU] = useState()
  const [selectedG, setSelectedG] = useState()

  // For username show in pdf
  const [putName, setPutName] = useState('')

  useEffect(() => {
    handlePutName(putName)
  }, [putName])

  const handleFormSubmit = (event) => {
    const form = event.currentTarget
    console.log('handle submit ke pass hu')
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
    } else {
      event.preventDefault()
      handleSubmit()
      setShowMap(true) //Show the mapping
    }
    setValidated(true)
  }

  const handlePeriodChange = (value) => {
    handleInputChange('Periods', value)
    setShowDateInputs(value === 'Custom')
  }

  // Function to handle dropdown item clicks
  const handleDropdownClick = (text) => {
    setButtonText(text) // Change button text based on the clicked item
    setDropdownOpen(false) // Close the dropdown after selection
    handleSubmit() // Submit form
    setShowMap(true) // Show the map when form is valid and submitted
  }
  // Function to toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev)
  }

  return (
    <CForm
      className="row g-3 needs-validation"
      noValidate
      validated={validated}
      onSubmit={handleFormSubmit}
    >
      <CCol md={3}>
        <CFormLabel htmlFor="devices">User</CFormLabel>
        <Select
          id="user"
          isClearable
          options={
            loading
              ? [{ value: '', label: 'Loading Users...', isDisabled: true }]
              : users?.length > 0
                ? users.map((user) => ({ value: user._id, label: user.username }))
                : [{ value: '', label: 'No Users in this Account', isDisabled: true }]
          }
          value={
            selectedU
              ? { value: selectedU, label: users.find((user) => user._id === selectedU)?.username }
              : null
          }
          // In SearchTravel's User Select component
          onChange={(selectedOption) => {
            const selectedUser = selectedOption?.value
            const username = selectedOption?.label
            setSelectedU(selectedUser)
            handlePutName(username) // Update parent state
            getGroups(selectedUser)
          }}
          isLoading={loading} // Optionally show a loading spinner
          placeholder="Choose a user..."
        />
      </CCol>
      <CCol md={2}>
        <CFormLabel htmlFor="devices">Groups</CFormLabel>
        <Select
          id="group"
          isClearable
          options={
            loading
              ? [{ value: '', label: 'Loading Groups...', isDisabled: true }]
              : groups?.length > 0
                ? groups.map((group) => ({ value: group._id, label: group.name }))
                : [{ value: '', label: 'No Groups in this User', isDisabled: true }]
          }
          value={
            selectedG
              ? { value: selectedG, label: groups.find((group) => group._id === selectedG)?.name }
              : null
          }
          onChange={(selectedOption) => {
            const selectedGroup = selectedOption?.value
            setSelectedG(selectedGroup)
            console.log('Selected Group ID:', selectedGroup)
            getDevices(selectedGroup)
          }}
          isLoading={loading} // Optionally show a loading spinner
          placeholder="Choose a group..."
        />
        <CFormFeedback invalid>Please provide a valid Vehilces.</CFormFeedback>
      </CCol>

      <CCol md={2}>
        <CFormLabel htmlFor="devices">Vehicles</CFormLabel>
        <CFormSelect
          id="devices"
          required
          value={formData.Devices}
          onChange={(e) => handleInputChange('Devices', e.target.value)}
        >
          <option value="">Choose a Vehilces...</option>
          {loading ? (
            <option disabled>Loading vehicles...</option>
          ) : devices?.length > 0 ? (
            devices?.map((device) => (
              <option key={device.id} value={device.deviceId}>
                {device.name}
              </option>
            ))
          ) : (
            <option disabled>No Vehilces in this Group</option>
          )}
        </CFormSelect>
        <CFormFeedback invalid>Please provide a valid vehicle.</CFormFeedback>
      </CCol>
      <CCol md={2}>
        <CFormLabel htmlFor="periods">Period</CFormLabel>
        <Select
          id="periods"
          options={[
            { value: '', label: 'Choose a period...', isDisabled: true },
            { value: 'Today', label: 'Today' },
            { value: 'Yesterday', label: 'Yesterday' },
            { value: 'This Week', label: 'This Week' },
            { value: 'Previous Week', label: 'Previous Week' },
            { value: 'This Month', label: 'This Month' },
            { value: 'Previous Month', label: 'Previous Month' },
            { value: 'Custom', label: 'Custom' },
          ]}
          value={formData.Periods ? { value: formData.Periods, label: formData.Periods } : null}
          onChange={(selectedOption) => handlePeriodChange(selectedOption.value)}
          placeholder="Choose a period..." // Displayed when no value is selected
        />

        <CFormFeedback invalid>Please select a valid period.</CFormFeedback>
      </CCol>
      <CCol md={3}>
        <CFormLabel htmlFor="columns">Columns</CFormLabel>
        <Select
          isMulti
          id="columns"
          options={[
            { value: 'all', label: 'All Columns' }, // Add "All Columns" option
            ...columns.map((column) => ({ value: column, label: column })),
          ]}
          value={
            formData.Columns.length === columns.length
              ? [{ value: 'all', label: 'All Columns' }] // Show "All Columns" if all columns are selected
              : formData.Columns.map((column) => ({ value: column, label: column }))
          }
          onChange={(selectedOptions) => {
            if (selectedOptions.find((option) => option.value === 'all')) {
              // If "All Columns" is selected, select all available columns
              handleInputChange('Columns', columns)
            } else {
              // Otherwise, update formData.Columns with selected values
              handleInputChange(
                'Columns',
                selectedOptions.map((option) => option.value),
              )
            }
          }}
          styles={{
            control: (base) => ({
              ...base,
              maxHeight: '40px', // Ensures the height is applied
            }),
            valueContainer: (base) => ({
              ...base,
              maxHeight: '20px', // Ensures the height is applied
              overflowY: 'auto',
            }),
          }}
        />
        <CFormFeedback invalid>Please select at least one column.</CFormFeedback>
      </CCol>
      {showDateInputs && (
        <>
          <CCol md={4}>
            <CFormLabel htmlFor="fromDate">From Date</CFormLabel>
            <CFormInput
              type="date"
              id="fromDate"
              value={formData.FromDate}
              onChange={(e) => handleInputChange('FromDate', e.target.value)}
              required
            />
            <CFormFeedback invalid>Please provide a valid from date.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="toDate">To Date</CFormLabel>
            <CFormInput
              type="date"
              id="toDate"
              value={formData.ToDate}
              onChange={(e) => handleInputChange('ToDate', e.target.value)}
              required
            />
            <CFormFeedback invalid>Please provide a valid to date.</CFormFeedback>
          </CCol>
        </>
      )}
      <CCol xs={12}>
        <div className="d-flex justify-content-end">
          <div className="btn-group">
            <button
              className="btn text-white"
              type="button"
              onClick={() => handleDropdownClick('SHOW NOW')}
              style={{ backgroundColor: '#0a2d63' }}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </CCol>
    </CForm>
  )
}

const ShowSummary = ({
  statusLoading,
  apiData,
  selectedDeviceName,
  selectedColumns,
  selectedGroupName,
  selectedUserName,
  selectedFromDate,
  selectedToDate,
  selectedPeriod,
}) => {
  const [expandedRows, setExpandedRows] = useState([])
  const [itemsPerPage, setItemsPerPage] = useState(10) // Default to 10 rows
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa', selectedUserName)
  const [newAddressData, setnewAddressData] = useState()

  const toggleRow = (vehicleName) => {
    setExpandedRows((prev) =>
      prev.includes(vehicleName)
        ? prev.filter((name) => name !== vehicleName)
        : [...prev, vehicleName],
    )
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '--'

    const date = new Date(dateString)

    return isNaN(date)
      ? '--'
      : date.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false, // 24-hour format
          timeZone: 'UTC', // Adjust based on your requirement
        })
  }

  // Transform apiData to match reportData structure
  const reportData =
    apiData?.reportData?.map((vehicle) => ({
      name: selectedDeviceName,
      distance: vehicle.distance,
      running: vehicle.running || '--',
      idle: vehicle.idle || '--',
      stop: vehicle.stop || '--',
      maxSpeed: vehicle.maxSpeed,
      avgSpeed: vehicle.avgSpeed,
      startLat: vehicle.startLat,
      startLong: vehicle.startLong,
      endLat: vehicle.endLat,
      endLog: vehicle.endLong,
      dayWiseTrips: vehicle.dayWiseTrips || [], // Adjust based on your API structure
    })) || []

  const [addressData, setAddressData] = useState([])

  // Address converter fetch location

  const getAddress = async (latitude, longitude) => {
    try {
      const apiKey = 'CWVeoDxzhkO07kO693u0' // Replace with your actual MapTiler API key
      const response = await axios.get(
        `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}`,
      )

      if (response.data?.features?.length > 0) {
        const address = response.data.features[0].place_name
        return address
      } else {
        return 'Address not available'
      }
    } catch (error) {
      console.error('Error:', error.message)
      return 'Address not available'
    }
  }

  useEffect(() => {
    const fetchAddresses = async () => {
      const promises = apiData.reportData.map(async (vehicle) => {
        // Fetch start and end addresses for the vehicle
        const startAddress = await getAddress(vehicle.startLat, vehicle.startLong)
        const endAddress = await getAddress(vehicle.endLat, vehicle.endLong)

        // Fetch addresses for dayWiseTrips
        const tripsWithAddresses = await Promise.all(
          vehicle.dayWiseTrips.map(async (trip) => {
            const tripStartAddress = await getAddress(trip.startLatitude, trip.startLongitude)
            const tripEndAddress = await getAddress(trip.endLatitude, trip.endLongitude)
            return { ...trip, startAddress: tripStartAddress, endAddress: tripEndAddress }
          }),
        )

        return { ...vehicle, startAddress, endAddress, dayWiseTrips: tripsWithAddresses }
      })

      const updatedData = await Promise.all(promises)
      setAddressData(updatedData) // Update state with the addresses
      setnewAddressData(updatedData)
    }

    if (apiData?.reportData?.length > 0) {
      fetchAddresses()
    }
  }, [apiData])

  if (newAddressData) {
    console.log('adressss new wala', newAddressData)
  }

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortOrder === 'asc'
    setSortOrder(isAsc ? 'desc' : 'asc')
    setSortBy(column)
  }

  const sortedData = [...(apiData?.reportData || [])].sort((a, b) => {
    if (!sortBy) return 0

    // Extract values for comparison based on the column
    const getValue = (row, column) => {
      switch (column) {
        case 'Vehicle Name':
          return selectedDeviceName
        case 'Vehicle Status':
          return row.vehicleStatus
        case 'Start Date Time':
          return new Date(row.startDateTime)
        case 'End Date Time':
          return new Date(row.endDateTime)
        case 'Distance':
        case 'Total Distance':
          return row.distance
        case 'Maximum Speed':
          return row.maxSpeed
        // case 'Total KM':
        //   return row.totalKm
        case 'Duration':
          return row.time
        default:
          return row[column]
      }
    }

    const aValue = getValue(a, sortBy)
    const bValue = getValue(b, sortBy)

    // Compare values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    } else {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }
  })
  // Calculate pagination boundaries
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem)

  // Function to get date range based on selectedPeriod
  const getDateRangeFromPeriod = (selectedPeriod) => {
    const today = new Date()
    let fromDate, toDate

    // Helper function to convert UTC to IST
    const convertToIST = (date) => {
      const utcDate = new Date(date)
      utcDate.setHours(utcDate.getHours() - 5) // Add 5 hours for IST
      utcDate.setMinutes(utcDate.getMinutes() - 30) // Add 30 minutes for IST
      return utcDate
    }

    const convertToIST1 = (date) => {
      const utcDate = new Date(date)
      utcDate.setHours(utcDate.getHours())
      utcDate.setMinutes(utcDate.getMinutes())
      return utcDate
    }

    switch (selectedPeriod) {
      case 'Today':
        fromDate = new Date()
        fromDate.setHours(0, 1, 1, 1) // Start of today (midnight UTC)
        fromDate = convertToIST1(fromDate) // Convert to IST
        toDate = new Date()
        toDate.setHours(23, 59, 59, 999) // End of today (just before midnight UTC)
        toDate = convertToIST1(toDate) // Convert to IST
        break
      case 'Yesterday':
        fromDate = new Date()
        fromDate.setDate(today.getDate() - 1) // Move to yesterday
        fromDate.setHours(0, 0, 0, 0) // Start of yesterday (midnight UTC)
        fromDate = convertToIST1(fromDate) // Convert to IST
        toDate = new Date(fromDate)
        toDate.setHours(23, 59, 59, 999) // End of yesterday (just before midnight UTC)
        toDate = convertToIST1(toDate) // Convert to IST
        break
      case 'This Week':
        fromDate = new Date(today)
        const dayOfWeek = today.getDay() // 0 (Sunday) to 6 (Saturday)
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert Sunday to previous Monday
        fromDate.setDate(today.getDate() - daysSinceMonday) // Start from Monday of this week
        fromDate = convertToIST1(fromDate) // Convert to IST
        toDate = new Date() // Ends at today's date
        toDate = convertToIST1(toDate) // Convert to IST
        break
      case 'Previous Week':
        fromDate = new Date(today)
        const prevWeekDayOfWeek = today.getDay()
        const daysSinceLastMonday = prevWeekDayOfWeek === 0 ? 7 : prevWeekDayOfWeek // Ensure previous Monday calculation
        fromDate.setDate(today.getDate() - daysSinceLastMonday - 6) // Start of previous week (Monday)
        fromDate = convertToIST1(fromDate) // Convert to IST
        toDate = new Date(fromDate)
        toDate.setDate(fromDate.getDate() + 6) // End of previous week (Sunday)
        toDate = convertToIST1(toDate) // Convert to IST
        break
      case 'This Month':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
        fromDate = convertToIST1(fromDate) // Convert to IST
        toDate = new Date()
        toDate = convertToIST1(toDate) // Convert to IST
        break
      case 'Previous Month':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        fromDate = convertToIST1(fromDate) // Convert to IST
        toDate = new Date(today.getFullYear(), today.getMonth(), 0)
        toDate = convertToIST1(toDate) // Convert to IST
        break
      default:
        return 'N/A'
    }

    // Convert dates to ISO string format (YYYY-MM-DDTHH:mm:ss.sssZ)
    const formattedFromDate = fromDate.toISOString()
    const formattedToDate = toDate.toISOString()

    return `from: ${formattedFromDate} to: ${formattedToDate}`
  }

  const getDateRangeFromPeriods = (selectedPeriod) => {
    const today = new Date()
    let fromDate, toDate

    // Helper function to convert UTC to IST
    const convertToIST = (date) => {
      const utcDate = new Date(date)
      utcDate.setHours(utcDate.getHours() - 5) // Add 5 hours for IST
      utcDate.setMinutes(utcDate.getMinutes() - 30) // Add 30 minutes for IST
      return utcDate
    }

    const convertToIST1 = (date) => {
      const utcDate = new Date(date)
      utcDate.setHours(utcDate.getHours())
      utcDate.setMinutes(utcDate.getMinutes())
      return utcDate
    }

    switch (selectedPeriod) {
      case 'Today':
        fromDate = new Date()
        fromDate.setHours(0, 1, 1, 1) // Start of today (midnight UTC)
        fromDate = convertToIST1(fromDate) // Convert to IST
        toDate = new Date()
        toDate.setHours(23, 59, 59, 999) // End of today (just before midnight UTC)
        toDate = convertToIST(toDate) // Convert to IST
        break
      case 'Yesterday':
        fromDate = new Date()
        fromDate.setDate(today.getDate() - 1) // Move to yesterday
        fromDate.setHours(0, 0, 0, 0) // Start of yesterday (midnight UTC)
        fromDate = convertToIST1(fromDate) // Convert to IST
        toDate = new Date(fromDate)
        toDate.setHours(23, 59, 59, 999) // End of yesterday (just before midnight UTC)
        toDate = convertToIST1(toDate) // Convert to IST
        break
      case 'This Week':
        fromDate = new Date(today)
        const dayOfWeek = today.getDay() // 0 (Sunday) to 6 (Saturday)
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert Sunday to previous Monday
        fromDate.setDate(today.getDate() - daysSinceMonday) // Start from Monday of this week
        fromDate = convertToIST1(fromDate) // Convert to IST
        toDate = new Date() // Ends at today's date
        toDate = convertToIST1(toDate) // Convert to IST
        break
      case 'Previous Week':
        fromDate = new Date(today)
        const prevWeekDayOfWeek = today.getDay()
        const daysSinceLastMonday = prevWeekDayOfWeek === 0 ? 7 : prevWeekDayOfWeek // Ensure previous Monday calculation
        fromDate.setDate(today.getDate() - daysSinceLastMonday - 6) // Start of previous week (Monday)
        fromDate = convertToIST1(fromDate) // Convert to IST
        toDate = new Date(fromDate)
        toDate.setDate(fromDate.getDate() + 6) // End of previous week (Sunday)
        toDate = convertToIST1(toDate) // Convert to IST
        break
      case 'This Month':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
        fromDate = convertToIST1(fromDate) // Convert to IST
        toDate = new Date()
        toDate = convertToIST1(toDate) // Convert to IST
        break
      case 'Previous Month':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        fromDate = convertToIST1(fromDate) // Convert to IST
        toDate = new Date(today.getFullYear(), today.getMonth(), 0)
        toDate = convertToIST1(toDate) // Convert to IST
        break
      default:
        return 'N/A'
    }

    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0') // Month is 0-indexed
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    }
    // Convert dates to ISO string format (YYYY-MM-DDTHH:mm:ss.sssZ)
    const formattedFromDate = formatDate(fromDate)
    const formattedToDate = formatDate(toDate)

    return `${formattedFromDate} to ${formattedToDate}`
  }
  console.log('Sorted DATA', sortedData)

  // Function to export table data to Excel
  const exportToExcel = async () => {
    try {
      // Validate data before proceeding
      if (!Array.isArray(sortedData) || sortedData.length === 0) {
        throw new Error('No data available for Excel export')
      }

      // Configuration constants
      const CONFIG = {
        styles: {
          primaryColor: 'FF0A2D63', // Company blue
          secondaryColor: 'FF6C757D', // Gray for secondary headers
          textColor: 'FFFFFFFF', // White text for headers
          borderStyle: 'thin',
          titleFont: { bold: true, size: 16 },
          headerFont: { bold: true, size: 12 },
          dataFont: { size: 11 },
        },
        travelSummaryColumns: [
          { header: 'SN', width: 8 },
          { header: 'Vehicle Number', width: 25 },
          { header: 'Start Address', width: 20 },
          { header: 'Start Co-ordinate', width: 20 },
          { header: 'Total Distance', width: 25 },
          { header: 'Running Time', width: 25 },
          { header: 'Idle Time', width: 25 },
          { header: 'Stop Time', width: 25 },
          { header: 'End Address', width: 35 },
          { header: 'End Co-ordinate', width: 20 },
          { header: 'Maximum Speed', width: 20 },
          { header: 'Average Speed', width: 20 },
        ],
        daywiseSummaryColumn: [
          { header: 'SN', width: 8 },
          { header: 'Report Date', width: 25 },
          { header: 'Ignition Start', width: 25 },
          { header: 'Start Location', width: 25 },
          { header: 'Start Co-ordinate', width: 25 },
          { header: 'Distance', width: 25 },
          { header: 'Running', width: 25 },
          { header: 'Idle', width: 25 },
          { header: 'Stop', width: 25 },
          { header: 'Total Working Hours', width: 25 },
          { header: 'Max. Speed(km/h)', width: 25 },
          { header: 'Avg. Speed(km/h)', width: 25 },
          { header: 'End Location', width: 25 },
          { header: 'End Co-ordinate', width: 25 },
          { header: 'Ignition Stop', width: 25 },
        ],
        company: {
          name: 'Credence Tracker',
          copyright: `© ${new Date().getFullYear()} Credence Tracker`,
        },
      }

      // Helper functions
      const formatExcelDate = (dateString) => {
        if (!dateString) return '--'

        const date = new Date(dateString)

        return isNaN(date)
          ? '--'
          : date
              .toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false, // 24-hour format
                timeZone: 'UTC', // Adjust based on your requirement
              })
              .replace(',', '') // Remove comma for clean output
      }

      const formatCoordinates = (coords) => {
        if (!coords) return '--'
        const [lat, lon] = coords.split(',').map((coord) => parseFloat(coord.trim()).toFixed(5))
        return lat && lon ? `${lat}, ${lon}` : '--'
      }

      // Initialize workbook and worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Travel Summary')

      // Add title and metadata
      const addHeaderSection = () => {
        // Company title
        const titleRow = worksheet.addRow([CONFIG.company.name])
        titleRow.font = { ...CONFIG.styles.titleFont, color: { argb: 'FFFFFFFF' } }
        titleRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: CONFIG.styles.primaryColor },
        }
        titleRow.alignment = { horizontal: 'center' }
        worksheet.mergeCells('A1:L1')

        // Report title
        const subtitleRow = worksheet.addRow(['Travel Summary'])
        subtitleRow.font = {
          ...CONFIG.styles.titleFont,
          size: 14,
          color: { argb: CONFIG.styles.textColor },
        }
        subtitleRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: CONFIG.styles.secondaryColor },
        }
        subtitleRow.alignment = { horizontal: 'center' }
        worksheet.mergeCells('A2:L2')

        // Metadata
        worksheet.addRow([`Generated by: ${decodedToken.username || 'N/A'}`])
        worksheet.addRow([
          `User: ${selectedUserName || 'N/A'}`,
          `Group: ${selectedGroupName || 'N/A'}`,
        ])
        worksheet.addRow([
          `Date Range: ${
            selectedFromDate && selectedToDate
              ? `${selectedFromDate} - ${selectedToDate}`
              : getDateRangeFromPeriods(selectedPeriod)
          }`,
          `Selected Vehicle: ${selectedDeviceName || '--'}`,
        ])
        worksheet.addRow([`Generated: ${new Date().toLocaleString()}`])
        worksheet.addRow([]) // Spacer
      }

      // Add data table
      const addDataTable = () => {
        // Add column headers
        const headerRow = worksheet.addRow(CONFIG.travelSummaryColumns.map((c) => c.header))
        headerRow.eachCell((cell) => {
          cell.font = { ...CONFIG.styles.headerFont, color: { argb: CONFIG.styles.textColor } }
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: CONFIG.styles.primaryColor },
          }
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
          cell.border = {
            top: { style: CONFIG.styles.borderStyle },
            bottom: { style: CONFIG.styles.borderStyle },
            left: { style: CONFIG.styles.borderStyle },
            right: { style: CONFIG.styles.borderStyle },
          }
        })

        // Add data rows
        addressData.forEach((item, index) => {
          const rowData = [
            index + 1,
            item.name || '--', // Replacing selectedDeviceName with item.name for consistency
            item.startAddress || '--', // Same as PDF
            formatCoordinates(`${item.startLat}, ${item.startLong}`),
            typeof item.distance === 'string' ? `${item.distance} km` : '--', // Adjusted to string check like PDF
            item.running || '--', // Added to match PDF
            item.idle || '--', // Added to match PDF
            item.stop || '--', // Added to match PDF
            item.endAddress || '--', // Same as PDF
            formatCoordinates(`${item.endLat}, ${item.endLong}`),
            typeof item.maxSpeed === 'number' ? `${item.maxSpeed.toFixed(2)} km/h` : '--', // Consistent formatting
            typeof item.avgSpeed === 'number' ? `${item.avgSpeed.toFixed(2)} km/h` : '--', // Added to match PDF
          ]

          const dataRow = worksheet.addRow(rowData)
          dataRow.eachCell((cell) => {
            cell.font = CONFIG.styles.dataFont
            cell.border = {
              top: { style: CONFIG.styles.borderStyle },
              bottom: { style: CONFIG.styles.borderStyle },
              left: { style: CONFIG.styles.borderStyle },
              right: { style: CONFIG.styles.borderStyle },
            }
          })
        })

        // Set column widths
        worksheet.columns = CONFIG.travelSummaryColumns.map((col) => ({
          width: col.width,
          style: { alignment: { horizontal: 'left' } },
        }))
      }

      // Add day-wise summary
      // Add day-wise summary
      const addDaywiseSummary = () => {
        addressData.forEach((item, vehicleIndex) => {
          if (!item.dayWiseTrips || item.dayWiseTrips.length === 0) return

          // Title row for the day-wise summary for the current vehicle
          const titleRow = worksheet.addRow([`Day-wise Summary - ${item.name}`])
          titleRow.font = {
            ...CONFIG.styles.titleFont,
            size: 14,
            color: { argb: CONFIG.styles.textColor },
          }
          titleRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: CONFIG.styles.secondaryColor },
          }
          titleRow.alignment = { horizontal: 'center' }
          worksheet.mergeCells(`A${titleRow.number}:L${titleRow.number}`)

          // Add header row for the day-wise summary table with the Credence Tracker background
          const headerRow = worksheet.addRow(CONFIG.daywiseSummaryColumn.map((col) => col.header))
          headerRow.eachCell((cell) => {
            cell.font = { ...CONFIG.styles.headerFont, color: { argb: CONFIG.styles.textColor } }
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: CONFIG.styles.primaryColor }, // same background as Credence Tracker headers
            }
            cell.alignment = { vertical: 'middle', horizontal: 'center' }
            cell.border = {
              top: { style: CONFIG.styles.borderStyle },
              bottom: { style: CONFIG.styles.borderStyle },
              left: { style: CONFIG.styles.borderStyle },
              right: { style: CONFIG.styles.borderStyle },
            }
          })

          // Build day-wise data rows
          const daywiseRows = item.dayWiseTrips.map((trip, index) => [
            index + 1,
            trip.date || '--',
            formatExcelDate(trip.startTime),
            trip.startAddress || '--',
            formatCoordinates(`${trip.startLatitude}, ${trip.startLongitude}`),
            trip.distance || '--',
            trip.runningTime || '--',
            trip.idleTime || '--',
            trip.stopTime || '--',
            trip.workingHours || '--',
            typeof trip.maxSpeed === 'number' ? `${trip.maxSpeed.toFixed(2)} km/h` : '--',
            typeof trip.avgSpeed === 'number' ? `${trip.avgSpeed.toFixed(2)} km/h` : '--',
            trip.endAddress || '--',
            formatCoordinates(`${trip.endLatitude}, ${trip.endLongitude}`),
            formatExcelDate(trip.endTime),
          ])

          // Add each day-wise data row with default data styling
          daywiseRows.forEach((row) => {
            const dataRow = worksheet.addRow(row)
            dataRow.eachCell((cell) => {
              cell.font = CONFIG.styles.dataFont
              cell.border = {
                top: { style: CONFIG.styles.borderStyle },
                bottom: { style: CONFIG.styles.borderStyle },
                left: { style: CONFIG.styles.borderStyle },
                right: { style: CONFIG.styles.borderStyle },
              }
            })
          })
        })
      }

      // Add footer
      const addFooter = () => {
        worksheet.addRow([]) // Spacer
        const footerRow = worksheet.addRow([CONFIG.company.copyright])
        footerRow.font = { italic: true }
        worksheet.mergeCells(`A${footerRow.number}:L${footerRow.number}`)
      }

      // Build the document
      addHeaderSection()
      addDataTable()
      addDaywiseSummary()
      addFooter()

      // Generate and save file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const filename = `Travels_Report_${new Date().toISOString().split('T')[0]}.xlsx`
      saveAs(blob, filename)
      toast.success('Excel file downloaded successfully')
    } catch (error) {
      console.error('Excel Export Error:', error)
      toast.error(error.message || 'Failed to export Excel file')
    }
  }

  // Function to export table data to PDF
  const exportToPDF = () => {
    try {
      // Validate data before proceeding
      if (!Array.isArray(sortedData) || sortedData.length === 0) {
        throw new Error('No data available for PDF export')
      }

      // Constants and configuration
      const CONFIG = {
        colors: {
          primary: [10, 45, 99],
          secondary: [70, 70, 70],
          accent: [0, 112, 201],
          border: [220, 220, 220],
          background: [249, 250, 251],
        },
        company: {
          name: 'Credence Tracker',
          logo: { x: 15, y: 15, size: 8 },
        },
        layout: {
          margin: 15,
          pagePadding: 15,
          lineHeight: 6,
        },
        fonts: {
          primary: 'helvetica',
          secondary: 'courier',
        },
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Helper function to apply secondary color
      const applySecondaryColor = () => {
        doc.setTextColor(...CONFIG.colors.secondary)
      }

      // Add header with logo, company name, and line
      const addHeader = () => {
        doc.setFillColor(...CONFIG.colors.primary)
        doc.rect(
          CONFIG.company.logo.x,
          CONFIG.company.logo.y,
          CONFIG.company.logo.size,
          CONFIG.company.logo.size,
          'F',
        )
        doc.setFont(CONFIG.fonts.primary, 'bold')
        doc.setFontSize(16)
        doc.text(CONFIG.company.name, 28, 21)

        doc.setDrawColor(...CONFIG.colors.primary)
        doc.setLineWidth(0.5)
        doc.line(CONFIG.layout.margin, 25, doc.internal.pageSize.width - CONFIG.layout.margin, 25)
      }

      // New vertical metadata function: each item is printed on its own line
      const addMetadataVertical = () => {
        // Starting y position for the metadata block
        let yPosition = 45
        const startX = 15 // Fixed x position for labels

        // Define your metadata items
        const metadata = [
          { label: 'User:', value: decodedToken.username || 'N/A' },
          { label: 'Selected User:', value: selectedUserName || 'N/A' },
          { label: 'Group:', value: selectedGroupName || 'N/A' },
          {
            label: 'Date Range:',
            value:
              selectedFromDate && selectedToDate
                ? `${selectedFromDate} To ${selectedToDate}`
                : getDateRangeFromPeriods(selectedPeriod),
          },
          { label: 'Vehicle:', value: selectedDeviceName || 'N/A' },
        ]

        // Set the font size for metadata
        doc.setFontSize(10)

        // Iterate over metadata items and print each on its own line
        metadata.forEach((item) => {
          // Draw the label in bold at the fixed x position
          doc.setFont(CONFIG.fonts.primary, 'bold')
          doc.text(item.label, startX, yPosition)

          // Draw the value in normal font, offset by 25mm
          doc.setFont(CONFIG.fonts.primary, 'normal')
          doc.text(item.value.toString(), startX + 25, yPosition)

          // Increase the y position for the next metadata item
          yPosition += 6
        })
      }

      // Add generated date at the top-right corner
      const addGeneratedDate = () => {
        const currentDate = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })

        doc.setFontSize(10)
        applySecondaryColor()

        // Align the date to the top right corner
        const pageWidth = doc.internal.pageSize.width
        const dateText = `Generated Date: ${currentDate}`
        const textWidth = doc.getTextWidth(dateText)

        doc.text(dateText, pageWidth - CONFIG.layout.margin - textWidth, 20)
      }

      // Add footer with page number and company copyright
      const addFooter = () => {
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setDrawColor(...CONFIG.colors.border)
          doc.setLineWidth(0.5)
          doc.line(
            CONFIG.layout.margin,
            doc.internal.pageSize.height - 15,
            doc.internal.pageSize.width - CONFIG.layout.margin,
            doc.internal.pageSize.height - 15,
          )
          doc.setFontSize(9)
          applySecondaryColor()
          doc.text(
            `© ${CONFIG.company.name}`,
            CONFIG.layout.margin,
            doc.internal.pageSize.height - 10,
          )

          const pageNumber = `Page ${i} of ${pageCount}`
          const pageNumberWidth = doc.getTextWidth(pageNumber)
          doc.text(
            pageNumber,
            doc.internal.pageSize.width - CONFIG.layout.margin - pageNumberWidth,
            doc.internal.pageSize.height - 10,
          )
        }
      }

      // Helper functions to format date and coordinates
      const formatDate = (dateString) => {
        if (!dateString) return '--'
        const date = new Date(dateString)
        return isNaN(date)
          ? '--'
          : date
              .toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'UTC',
              })
              .replace(',', '')
      }

      const formatCoordinates = (coords) => {
        if (!coords) return '--'
        const [lat, lon] = coords.split(',').map((coord) => parseFloat(coord.trim()))
        return `${lat?.toFixed(5) ?? '--'}, ${lon?.toFixed(5) ?? '--'}`
      }

      // Main document creation
      addHeader()
      doc.setFontSize(24)
      doc.setFont(CONFIG.fonts.primary, 'bold')
      doc.text('Travel Summary', CONFIG.layout.margin, 35)

      // Use vertical metadata layout
      addMetadataVertical()

      addGeneratedDate()

      // Table columns for Vehicle Summary
      const tableColumns = [
        'SN',
        'Vehicle',
        'Start Address',
        'Start Co-ordinate',
        'Total Distance',
        'Running',
        'Idle',
        'Stop',
        'End Address',
        'End Co-ordinate',
        'Max. Speed (km/h)',
        'Avg. Speed (km/h)',
      ]

      // Table columns for Daywise Summary
      const daywiseSummaryColumn = [
        'SN',
        'Report Date',
        'Ignition Start',
        'Start Location',
        'Start Co-ordinate',
        'Distance',
        'Running',
        'Idle',
        'Stop',
        'Total Working Hours',
        'Max. Speed (km/h)',
        'Avg. Speed (km/h)',
        'End Location',
        'End Co-ordinate',
        'Ignition Stop',
      ]

      // Table Rows for Vehicle Summary
      const tableRows = addressData.map((item, index) => [
        index + 1,
        item.name || '--',
        item.startAddress || '--', // ✅ Corrected
        formatCoordinates(`${item.startLat}, ${item.startLong}`),
        typeof item.distance === 'string' ? `${item.distance} km` : '--',
        item.running || '--',
        item.idle || '--',
        item.stop || '--',
        item.endAddress || '--', // ✅ Corrected
        formatCoordinates(`${item.endLat}, ${item.endLong}`),
        typeof item.maxSpeed === 'number' ? `${item.maxSpeed.toFixed(2)} km/h` : '--',
        typeof item.avgSpeed === 'number' ? `${item.avgSpeed.toFixed(2)} km/h` : '--',
        item.dayWiseTrips?.reduce((acc, trip) => acc + ` ${trip.workingHours}`, '') || '--',
      ])

      // Add Vehicle Summary Table using autoTable
      doc.autoTable({
        startY: 65,
        head: [tableColumns],
        body: tableRows,
        theme: 'grid',
        styles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [10, 45, 99],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 245, 250],
        },
      })

      // Add Daywise Summary Table for each vehicle (if available)
      const addDaywiseSummaryTable = () => {
        if (!sortedData || sortedData.length === 0) return
        let yPosition = doc.lastAutoTable.finalY + 10

        addressData.forEach((item) => {
          if (!item.dayWiseTrips || item.dayWiseTrips.length === 0) return
          doc.setFontSize(12)
          doc.setFont(CONFIG.fonts.primary, 'bold')
          doc.text(`Day-wise Summary - ${item.name}`, CONFIG.layout.margin, yPosition)
          yPosition += 8

          const daywiseRows = item.dayWiseTrips.map((trip, index) => [
            index + 1,
            trip.date || '--',
            formatDate(trip.startTime) || '--',
            trip.startAddress || '--', // ✅ Correct usage
            formatCoordinates(`${trip.startLatitude}, ${trip.startLongitude}`),
            trip.distance || '--',
            trip.runningTime || '--',
            trip.idleTime || '--',
            trip.stopTime || '--',
            trip.workingHours || '--',
            `${trip.maxSpeed?.toFixed(2) ?? '--'} km/h`,
            `${trip.avgSpeed?.toFixed(2) ?? '--'} km/h`,
            trip.endAddress || '--', // ✅ Correct usage
            formatCoordinates(`${trip.endLatitude}, ${trip.endLongitude}`),
            formatDate(trip.endTime) || '--',
          ])

          doc.autoTable({
            startY: yPosition,
            head: [daywiseSummaryColumn],
            body: daywiseRows,
            theme: 'grid',
            styles: {
              fillColor: [255, 255, 255],
              textColor: [0, 0, 0],
            },
            headStyles: {
              fillColor: [10, 45, 99],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
            },
            alternateRowStyles: {
              fillColor: [240, 245, 250],
            },
          })

          yPosition = doc.lastAutoTable.finalY + 10
        })
      }

      addDaywiseSummaryTable()
      addFooter()

      // Save the PDF
      doc.save(`Travel_Summary_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF Export Error:', error)
      toast.error(error.message || 'Failed to export PDF')
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage) // Update rows per page
    setCurrentPage(1) // Reset to first page
  }

  const handleLogout = () => {
    Cookies.remove('authToken')
    window.location.href = '/login'
  }

  const handlePageUp = () => {
    window.scrollTo({
      top: 0, // Scroll up by one viewport height
      behavior: 'smooth', // Smooth scrolling effect
    })
  }

  const handlePrintPage = () => {
    // Add the landscape style to the page temporarily
    const style = document.createElement('style')
    style.innerHTML = `
      @page {
        size: landscape;
      }
    `
    document.head.appendChild(style)

    // Zoom out for full content
    document.body.style.zoom = '50%'

    // Print the page
    window.print()

    // Remove the landscape style and reset zoom after printing
    document.head.removeChild(style)
    document.body.style.zoom = '100%'
  }

  const dropdownItems = [
    {
      icon: FaRegFilePdf,
      label: 'Download PDF',
      onClick: () => exportToPDF(),
    },
    {
      icon: PiMicrosoftExcelLogo,
      label: 'Download Excel',
      onClick: () => exportToExcel(),
    },
    {
      icon: FaPrint,
      label: 'Print Page',
      onClick: () => handlePrintPage(),
    },
    {
      icon: HiOutlineLogout,
      label: 'Logout',
      onClick: () => handleLogout(),
    },
    {
      icon: FaArrowUp,
      label: 'Scroll To Top',
      onClick: () => handlePageUp(),
    },
  ]

  console.log('REPORTED DATA', reportData)
  return (
    <>
      <Toaster />

      <CCard className="mb-4">
        <CCardBody>
          <CTable hover responsive bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', width: '50px' }}
                ></CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', color: 'white' }}
                >
                  SN
                </CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', color: 'white' }}
                >
                  Vehicle Number
                </CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', color: 'white' }}
                >
                  Start Address
                </CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', color: 'white' }}
                >
                  Start Co-ordinate
                </CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', color: 'white' }}
                >
                  Total Distance
                </CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', color: 'white' }}
                >
                  Running Time
                </CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', color: 'white' }}
                >
                  Idle Time
                </CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', color: 'white' }}
                >
                  Stop Time
                </CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', color: 'white' }}
                >
                  End Address
                </CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', color: 'white' }}
                >
                  End Co-ordinate
                </CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', color: 'white' }}
                >
                  Max Speed
                </CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ background: '#0a2d63', color: 'white' }}
                >
                  Avg Speed
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {statusLoading ? (
                <CTableRow style={{ position: 'relative' }}>
                  <CTableDataCell
                    colSpan={selectedColumns.length + 2}
                    style={{
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d',
                      fontStyle: 'italic',
                      padding: '16px',
                      textAlign: 'center',
                      border: '1px dashed #dee2e6',
                      height: '100px',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <Loader />
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ) : (
                addressData.map((vehicle, index) => (
                  <React.Fragment key={vehicle.name}>
                    <CTableRow>
                      <CTableDataCell className="text-center">
                        <CButton
                          className="border-0" // Reduce padding
                          style={{
                            width: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onClick={() => toggleRow(vehicle.name)}
                        >
                          {expandedRows.includes(vehicle.name) ? (
                            <div className="rounded-circle bg-danger d-flex align-items-center justify-content-center">
                              <Minus color="white" size={15} /> {/* Reduce icon size */}
                            </div>
                          ) : (
                            <div className="rounded-circle bg-success d-flex align-items-center justify-content-center">
                              <Plus color="white" size={15} /> {/* Reduce icon size */}
                            </div>
                          )}
                        </CButton>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">{index + 1}</CTableDataCell>
                      <CTableDataCell className="text-center">{vehicle.name}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        {vehicle.startAddress || 'Loading Address...'}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {`${vehicle.startLat} ${vehicle.startLong}`}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">{vehicle.distance} KM</CTableDataCell>
                      <CTableDataCell className="text-center">{vehicle.running}</CTableDataCell>
                      <CTableDataCell className="text-center">{vehicle.idle}</CTableDataCell>
                      <CTableDataCell className="text-center">{vehicle.stop}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        {vehicle.endAddress || 'Loading Address...'}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {`${vehicle.endLat} ${vehicle.endLong}`}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {vehicle.maxSpeed !== null && vehicle.maxSpeed !== undefined
                          ? vehicle.maxSpeed.toFixed(2)
                          : 'N/A'}{' '}
                        km/h
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {vehicle.avgSpeed !== null && vehicle.avgSpeed !== undefined
                          ? vehicle.avgSpeed.toFixed(2)
                          : 'N/A'}{' '}
                        km/h
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell colSpan={13} className="p-0">
                        <CCollapse visible={expandedRows.includes(vehicle.name)}>
                          <CCard className="m-3">
                            <CCardBody>
                              <CTable hover responsive bordered>
                                <CTableHead>
                                  <CTableRow>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{ background: '#0a2d63', color: 'white' }}
                                    >
                                      SN
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      Report Date
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      Ignition Start
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      Start Location
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      Start Co-ordinate
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      Distance
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      Running
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      Idle
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      Stop
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '200px',
                                      }}
                                    >
                                      Total Working Hours
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      Max. Speed(km/h)
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      Avg. Speed(km/h)
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      End Location
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      End Co-ordinate
                                    </CTableHeaderCell>
                                    <CTableHeaderCell
                                      className="text-center"
                                      style={{
                                        background: '#0a2d63',
                                        color: 'white',
                                        minWidth: '120px',
                                      }}
                                    >
                                      Ignition Stop
                                    </CTableHeaderCell>
                                  </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                  {vehicle.dayWiseTrips.map((trip, index) => (
                                    <CTableRow key={index}>
                                      <CTableDataCell className="text-center">
                                        {index + 1}
                                      </CTableDataCell>{' '}
                                      {/**SN */}
                                      {/**Report Date */}
                                      <CTableDataCell className="text-center">
                                        {new Date(trip.date).toLocaleDateString('en-GB', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                        })}
                                      </CTableDataCell>
                                      {/**Ignition Start*/}
                                      <CTableDataCell className="text-center">
                                        {formatDateTime(trip.startTime)}
                                      </CTableDataCell>
                                      {/**Start Locations */}
                                      <CTableDataCell className="text-center">
                                        {trip.startAddress}
                                      </CTableDataCell>
                                      <CTableDataCell className="text-center">
                                        {`${trip.startLatitude}, ${trip.startLongitude}`}
                                      </CTableDataCell>
                                      {/**Distance */}
                                      <CTableDataCell className="text-center">
                                        {trip.distance}
                                      </CTableDataCell>
                                      {/**Running */}
                                      <CTableDataCell className="text-center">
                                        {trip.runningTime}
                                      </CTableDataCell>
                                      {/**Idle */}
                                      <CTableDataCell className="text-center">
                                        {trip.idleTime}
                                      </CTableDataCell>
                                      {/**Stop */}
                                      <CTableDataCell className="text-center">
                                        {trip.stopTime}
                                      </CTableDataCell>
                                      {/**Working hours */}
                                      <CTableDataCell className="text-center">
                                        {trip.workingHours}
                                      </CTableDataCell>
                                      {/**Max Speed */}
                                      <CTableDataCell className="text-center">
                                        {trip.maxSpeed !== null && trip.maxSpeed !== undefined
                                          ? trip.maxSpeed.toFixed(2)
                                          : 'N/A'}
                                      </CTableDataCell>
                                      {/**Avg KM */}
                                      <CTableDataCell className="text-center">
                                        {trip.avgSpeed !== null && trip.avgSpeed !== undefined
                                          ? trip.avgSpeed.toFixed(2)
                                          : 'N/A'}
                                      </CTableDataCell>
                                      {/**End Location */}
                                      <CTableDataCell className="text-center">
                                        {trip.endAddress}
                                      </CTableDataCell>
                                      <CTableDataCell className="text-center">
                                        {`${trip.endLatitude}, ${trip.endLongitude}`}
                                      </CTableDataCell>
                                      {/**Ignition Stop */}
                                      <CTableDataCell className="text-center">
                                        {formatDateTime(trip.endTime)}
                                      </CTableDataCell>
                                    </CTableRow>
                                  ))}
                                </CTableBody>
                              </CTable>
                            </CCardBody>
                          </CCard>
                        </CCollapse>
                      </CTableDataCell>
                    </CTableRow>
                  </React.Fragment>
                ))
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
        <div className="d-flex justify-content-center align-items-center">
          <CPagination align="center">
            <CPaginationItem
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </CPaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <CPaginationItem
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </CPaginationItem>
            ))}
            <CPaginationItem
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </CPaginationItem>
          </CPagination>
        </div>
      </CCard>
      <div className="position-fixed bottom-0 end-0 mb-5 m-3 z-5">
        <IconDropdown items={dropdownItems} />
      </div>
    </>
  )
}

const TravelReport = () => {
  const [formData, setFormData] = useState({
    Devices: '',
    Details: '',
    Periods: '',
    FromDate: '',
    ToDate: '',
    Columns: [],
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [selectedUserName, setSelectedUserName] = useState('')
  const [groups, setGroups] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showMap, setShowMap] = useState(false) //show mapping data
  const [columns] = useState([
    'Vehicle',
    'Start Address',
    'Start Co-ordinate',
    'Total Distance',
    'Running',
    'Idle',
    'Stop',
    'End Address',
    'End Co-ordinate',
    'Max. Speed (km/h)',
    'Avg. Speed (km/h)',
  ])
  const [daywiseSummaryColumn] = useState([
    'Report Date',
    'Ignition Start',
    'Start Location',
    'Start Co-ordinate',
    'Distance',
    'Running',
    'Idle',
    'Stop',
    'Total Working Hours',
    'Max. Speed (km/h)',
    'Avg. Speed (km/h)',
    'End Location',
    'End Co-ordinate',
    'Ignition Stop',
  ])
  const [selectedColumns, setSelectedColumns] = useState([])
  const token = Cookies.get('authToken')
  const [apiData, setApiData] = useState()
  const [statusLoading, setStatusLoading] = useState(false)
  const [putName, setPutName] = useState('')

  useEffect(() => {
    console.log('BHAIYAAAAAAAA PUTTTTT HOOOOOO GAYAAAAAAAAA', putName)
  }, [putName])

  // Get the selected device name from the device list based on formData.Devices
  const selectedDevice = devices.find((device) => device.deviceId === formData.Devices)
  const selectedDeviceName = selectedDevice ? selectedDevice.name : ''

  const handlePutName = (name) => {
    setPutName(name)
    console.log('putName', putName)
  }

  const getDevices = async (selectedGroup) => {
    const accessToken = Cookies.get('authToken')
    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/device/getDeviceByGroup/${selectedGroup}`,
        {
          headers: {
            Authorization: 'Bearer ' + accessToken,
          },
        },
      )
      if (response.data.success) {
        setDevices(response.data.data)
        setLoading(false)
      }
    } catch (error) {
      setError(error.message)
      console.log('Error fetching data:', error)
      setDevices([])
      setLoading(false)
      throw error
    }
  }

  const selectedGroup = groups.find((group) => group.groupId === formData.Groups)
  const selectedGroupName = selectedGroup ? selectedGroup.name : ''

  // Function to get date range based on selectedPeriod
  const getDateRangeFromPeriod = (selectedPeriod) => {
    const today = new Date()
    let fromDate, toDate

    // Helper function to convert UTC to IST
    const convertToIST = (date) => {
      const utcDate = new Date(date)
      utcDate.setHours(utcDate.getHours() - 5) // Add 5 hours for IST
      utcDate.setMinutes(utcDate.getMinutes() - 30) // Add 30 minutes for IST
      return utcDate
    }

    // Helper function to convert UTC to IST
    const convertToIST1 = (date) => {
      const utcDate = new Date(date)
      utcDate.setHours(utcDate.getHours()) // Convert UTC to IST
      utcDate.setMinutes(utcDate.getMinutes())
      return utcDate
    }

    switch (selectedPeriod) {
      case 'Today':
        fromDate = new Date(today)
        fromDate.setHours(0, 1, 1, 0) // Start at 00:01:01
        fromDate = convertToIST1(fromDate)

        toDate = new Date(today)
        toDate.setHours(23, 59, 0, 0) // End at 23:59:00
        toDate = convertToIST1(toDate)
        break

      case 'Yesterday':
        fromDate = new Date(today)
        fromDate.setDate(today.getDate() - 1)
        fromDate.setHours(0, 1, 1, 0)
        fromDate = convertToIST1(fromDate)

        toDate = new Date(fromDate)
        toDate.setHours(23, 59, 0, 0)
        toDate = convertToIST1(toDate)
        break

      case 'This Week':
        fromDate = new Date(today)
        const dayOfWeek = today.getDay()
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        fromDate.setDate(today.getDate() - daysSinceMonday)
        fromDate.setHours(0, 1, 1, 0)
        fromDate = convertToIST1(fromDate)

        toDate = new Date()
        toDate.setHours(23, 59, 0, 0)
        toDate = convertToIST1(toDate)
        break

      case 'Previous Week':
        fromDate = new Date(today)
        const prevWeekDayOfWeek = today.getDay()
        const daysSinceLastMonday = prevWeekDayOfWeek === 0 ? 7 : prevWeekDayOfWeek
        fromDate.setDate(today.getDate() - daysSinceLastMonday - 6)
        fromDate.setHours(0, 1, 1, 0)
        fromDate = convertToIST1(fromDate)

        toDate = new Date(fromDate)
        toDate.setDate(fromDate.getDate() + 6)
        toDate.setHours(23, 59, 0, 0)
        toDate = convertToIST1(toDate)
        break

      case 'This Month':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
        fromDate.setHours(0, 1, 1, 0)
        fromDate = convertToIST1(fromDate)

        toDate = new Date()
        toDate.setHours(23, 59, 0, 0)
        toDate = convertToIST1(toDate)
        break

      case 'Previous Month':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        fromDate.setHours(0, 1, 1, 0)
        fromDate = convertToIST1(fromDate)

        toDate = new Date(today.getFullYear(), today.getMonth(), 0)
        toDate.setHours(23, 59, 0, 0)
        toDate = convertToIST1(toDate)
        break

      default:
        return 'N/A'
    }

    // Convert dates to UTC format (YYYY-MM-DDTHH:mm:ss.sssZ)
    // const toUTCString = (date) => date.toISOString();

    return `${fromDate}&to=${toDate}`
  }

  const getGroups = async (selectedUser = ' ') => {
    setLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/group/${selectedUser}`, {
        headers: { Authorization: 'Bearer ' + accessToken },
      })
      if (response.data.groupsAssigned) {
        setGroups(response.data.groupsAssigned)
        setLoading(false)
        console.log('Perticular user ke groups')
      } else if (response.data.groups) {
        setGroups(response.data.groups)
        setLoading(false)
        console.log('All groups')
      }
    } catch (error) {
      setError(error.message)
      setLoading(false)
      toast.error('Failed to load groups')
    }
  }

  const getUser = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })
      if (response.data) {
        setUsers(response.data.users)
        setLoading(false)
        console.log('User fetch successfully')

        // After users are set, update selectedUserName based on formData.User
        const selectedUser = users.find((user) => user.userId === formData.User)
        const selectedUserName = selectedUser ? selectedUser.username : ''
        setSelectedUserName(selectedUserName)
        console.log('Selected Userrerrrrrrrrrrrrrrrrrrrrrrrrrrrrrr:', selectedUserName)
      }
    } catch (error) {
      console.log('Error fetching data: ', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    getUser()
    getGroups()
  }, [])

  // Function to convert to IST and format as datetime-local value
  const convertToIST = (date) => {
    const dateObj = new Date(date)
    const istOffset = 5.5 * 60 // IST is UTC + 5:30
    dateObj.setMinutes(dateObj.getMinutes() + istOffset)

    // Format the date to datetime-local string (yyyy-MM-ddTHH:mm)
    return dateObj.toISOString().slice(0, 16)
  }

  const handleInputChange = (name, value) => {
    // Convert value to IST before updating state
    // if (name === 'FromDate' || name === 'ToDate') {
    //   value = convertToIST(value);
    // }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))

    if (name === 'Columns') {
      setSelectedColumns(value)
    }
  }

  const handleSubmit = async () => {
    setStatusLoading(true)
    try {
      console.log(
        'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
        formData.Devices,
        formData.FromDate,
        formData.ToDate,
        formData.Periods,
      )

      // Ensure 'date' is defined correctly
      let date = ''
      if (formData.FromDate && formData.ToDate) {
        date = `${selectedFromDate}&to=${selectedToDate}`
      } else {
        date = getDateRangeFromPeriod(formData.Periods)
        // Ensure that if the period function returns 'N/A', it doesn't break the API call
        if (date === 'N/A') {
          throw new Error('Invalid date range')
        }
      }

      console.log(date, 'DATE HAI YE')

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/travel-summary-report?deviceIds=${formData.Devices}&from=${date}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (response.data) {
        setApiData(response.data) // Store API response
        setStatusLoading(false)
      }
    } catch (error) {
      setError(error.message)
      setStatusLoading(false)
      toast.error('Failed to fetch data')
      console.log(
        'get data of search in get api check',
        `${import.meta.env.VITE_API_URL}/reports/travel-summary-report?deviceIds=${formData.Devices}&from=${date}`,
      )
    }
  }

  // Example of extracting values similar to `selectedGroup`
  const selectedFromDate = formData.FromDate
    ? new Date(
        new Date(formData.FromDate).setHours(0, 0, 0, 0) + (5 * 60 + 30) * 60000,
      ).toISOString()
    : ''
  const selectedToDate = formData.ToDate
    ? new Date(
        new Date(formData.ToDate).setHours(23, 59, 59, 999) + (5 * 60 + 30) * 60000,
      ).toISOString()
    : ''

  const selectedPeriod = formData.Periods || ''

  console.log('Selected From Date:', selectedFromDate)
  console.log('Selected To Date:', selectedToDate)
  console.log('Selected Period:', selectedPeriod)

  console.log('API Data:', apiData)

  if (error) return <Page404 />

  return (
    <>
      <CRow className="pt-3 gutter-0">
        <CCol xs={12} md={12} className="px-4">
          <CCard className="mb-4 p-0 shadow-lg rounded">
            <CCardHeader
              className="d-flex justify-content-between align-items-center text-white"
              style={{
                background: '#0a2d63',
                color: 'white',
              }}
            >
              <strong>Travel Summary</strong>
            </CCardHeader>
            <CCardBody>
              <SearchTravel
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                users={users}
                getGroups={getGroups}
                groups={groups}
                getDevices={getDevices}
                loading={loading}
                devices={devices}
                showMap={showMap}
                setShowMap={setShowMap}
                columns={columns}
                daywiseSummaryColumn={daywiseSummaryColumn}
                handlePutName={handlePutName}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      {showMap && (
        <>
          <CRow className="justify-content-center mt-4 gutter-0">
            <CCol xs={12} className="px-4">
              <CCard className="p-0 mb-4 shadow-sm">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <strong>
                    Travel Summary {selectedDeviceName && `for ${selectedDeviceName}`}
                  </strong>{' '}
                </CCardHeader>
                <CCardBody>
                  <ShowSummary
                    formData={formData}
                    apiData={apiData}
                    statusLoading={statusLoading}
                    selectedDeviceName={selectedDeviceName}
                    selectedColumns={selectedColumns}
                    selectedGroupName={selectedGroupName}
                    daywiseSummaryColumn={daywiseSummaryColumn}
                    selectedUserName={putName}
                    selectedFromDate={selectedFromDate}
                    selectedToDate={selectedToDate}
                    selectedPeriod={selectedPeriod}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </>
  )
}

SearchTravel.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  groups: PropTypes.array.isRequired,
  getGroups: PropTypes.func.isRequired,
  devices: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  getDevices: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  showMap: PropTypes.bool.isRequired,
  setShowMap: PropTypes.func.isRequired,
  handlePutName: PropTypes.func.isRequired,
}

export default TravelReport
