import React, { useEffect, useRef, useState } from 'react'
// import { Edit, Copy, Trash, Share } from 'lucide-react'
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
} from '@coreui/react'
import Select from 'react-select'
import Cookies from 'js-cookie'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilSettings, cilChevronBottom } from '@coreui/icons'
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

const SearchStatus = ({
  formData,
  handleInputChange,
  handleSubmit,
  users,
  groups,
  getGroups,
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
          onChange={(selectedOption) => {
            const selectedUser = selectedOption?.value
            setSelectedU(selectedUser)
            setPutName(selectedOption.label)
            console.log('putNameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee:', putName)
            console.log('Selected userDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDd:', selectedUser)
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

        <CFormFeedback invalid>Please provide a valid device.</CFormFeedback>
      </CCol>
      <CCol md={2}>
        <CFormLabel htmlFor="devices">Devices</CFormLabel>
        <CFormSelect
          id="devices"
          required
          value={formData.Devices}
          onChange={(e) => handleInputChange('Devices', e.target.value)}
        >
          <option value="">Choose a device...</option>
          {loading ? (
            <option disabled>Loading devices...</option>
          ) : devices?.length > 0 ? (
            devices?.map((device) => (
              <option key={device.id} value={device.deviceId}>
                {device.name}
              </option>
            ))
          ) : (
            <option disabled>No Device in this Group</option>
          )}
        </CFormSelect>

        <CFormFeedback invalid>Please provide a valid device.</CFormFeedback>
      </CCol>
      <CCol md={2}>
        <CFormLabel htmlFor="periods">Period</CFormLabel>
        {/* <CFormSelect
          id="periods"
          required
          value={formData.Periods}
          onChange={(e) => handlePeriodChange(e.target.value)}
        >
          <option value="" disabled>Choose a period...</option>
          <option value="Today">Today</option>
          <option value="Yesterday">Yesterday</option>
          <option value="This Week">This Week</option>
          <option value="Previous Week">Previous Week</option>
          <option value="This Month">This Month</option>
          <option value="Previous Month">Previous Month</option>
          <option value="Custom">Custom</option>
        </CFormSelect> */}
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
        />
        {/* <Select
  id="columns"
  options={[
    { value: 'all', label: 'All Columns' }, // Add "All Columns" option
    ...columns.map((column) => ({ value: column, label: column })),
  ]}
  value={
    formData.Columns.length === 1 && formData.Columns[0] === 'all'
      ? { value: 'all', label: 'All Columns' } // Show "All Columns" if selected
      : formData.Columns.length === 1
      ? { value: formData.Columns[0], label: formData.Columns[0] }
      : null
  }
  onChange={(selectedOption) => {
    if (selectedOption.value === 'all') {
      // If "All Columns" is selected, set formData.Columns to 'all'
      handleInputChange('Columns', ['all']);
    } else {
      // Otherwise, set formData.Columns to the selected column
      handleInputChange('Columns', [selectedOption.value]);
    }
  }}
/> */}

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

const ShowStatus = ({
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
  const [itemsPerPage, setItemsPerPage] = useState(10) // Default to 10 rows
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [addressData, setAddressData] = useState({})
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa', selectedUserName)
  const [newAddressData, setnewAddressData] = useState()
  // Function to get address based on latitude and longitude using Nominatim API
  const getAddress = async (latitude, longitude) => {
    try {
      const apiKey = 'CWVeoDxzhkO07kO693u0' // Replace with your actual MapTiler API key
      const response = await axios.get(
        `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}`,
      )

      if (response.data && response.data.features && response.data.features.length > 0) {
        const address = response.data.features[0].place_name
        console.log('Fetched address:', address) // Debugging: log the address
        return address // Return place_name from the features array
      } else {
        console.error('Error fetching address: No data found')
        return 'Address not available'
      }
    } catch (error) {
      console.error('Error:', error.message)
      return 'Address not available'
    }
  }

  useEffect(() => {
    const fetchAddresses = async () => {
      // Fetch all addresses concurrently
      const promises = apiData.data.map(async (data) => {
        // Split the startLocation and endLocation strings into latitudes and longitudes
        const [startLat, startLon] = data.startLocation
          ? data.startLocation.split(',').map((coord) => coord.trim())
          : [null, null]
        const [endLat, endLon] = data.endLocation
          ? data.endLocation.split(',').map((coord) => coord.trim())
          : [null, null]
        // Fetch the start and end addresses only if coordinates are valid
        const startAddress =
          startLat && startLon ? await getAddress(startLat, startLon) : 'Invalid start location'
        const endAddress =
          endLat && endLon ? await getAddress(endLat, endLon) : 'Invalid end location'
        // Store the addresses in the addressData state
        return {
          ouid: data.ouid,
          startAddress: startAddress || 'Address not found',
          endAddress: endAddress || 'Address not found',
        }
      })
      // Wait for all promises to resolve
      const results = await Promise.all(promises)
      // Update the addressData state with the fetched addresses
      results.forEach((result) => {
        setnewAddressData({
          startAddress: result.startAddress,
          endAddress: result.endAddress,
        })
      })
      console.log('Updated addressData:', newAddressData) // Debugging: log addressData
      setAddressData(newAddressData)
    }
    if (apiData?.data?.length > 0) {
      fetchAddresses()
    }
  }, [apiData])
  if (newAddressData) {
    console.log(newAddressData)
  }

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortOrder === 'asc'
    setSortOrder(isAsc ? 'desc' : 'asc')
    setSortBy(column)
  }

  const sortedData = [...(apiData?.data || [])].sort((a, b) => {
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

    switch (selectedPeriod) {
      case 'Today':
        fromDate = new Date()
        toDate = new Date()
        break
      case 'Yesterday':
        fromDate = new Date()
        fromDate.setDate(today.getDate() - 1)
        toDate = new Date(fromDate)
        break
      case 'This Week':
        fromDate = new Date(today)
        const dayOfWeek = today.getDay() // 0 (Sunday) to 6 (Saturday)
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert Sunday to previous Monday
        fromDate.setDate(today.getDate() - daysSinceMonday) // Start from Monday of this week
        toDate = new Date() // Ends at today's date
        break
      case 'Previous Week':
        fromDate = new Date(today)
        const prevWeekDayOfWeek = today.getDay()
        const daysSinceLastMonday = prevWeekDayOfWeek === 0 ? 7 : prevWeekDayOfWeek // Ensure previous Monday calculation
        fromDate.setDate(today.getDate() - daysSinceLastMonday - 6) // Start of previous week (Monday)
        toDate = new Date(fromDate)
        toDate.setDate(fromDate.getDate() + 6) // End of previous week (Sunday)
        break
      case 'This Month':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
        toDate = new Date()
        break
      case 'Previous Month':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        toDate = new Date(today.getFullYear(), today.getMonth(), 0)
        break
      default:
        return 'N/A'
    }

    // Format dates as DD-MM-YYYY
    const formattedFromDate = `${fromDate.getDate().toString().padStart(2, '0')}-${(fromDate.getMonth() + 1).toString().padStart(2, '0')}-${fromDate.getFullYear()}`
    const formattedToDate = `${toDate.getDate().toString().padStart(2, '0')}-${(toDate.getMonth() + 1).toString().padStart(2, '0')}-${toDate.getFullYear()}`
    return ` ${formattedFromDate} To ${formattedToDate}`
  }

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
        columns: [
          { header: 'SN', width: 8 },
          { header: 'Vehicle Name', width: 25 },
          { header: 'Vehicle Status', width: 20 },
          { header: 'Start Date Time', width: 25 },
          { header: 'Start Address', width: 35 },
          { header: 'Start Coordinates', width: 25 },
          { header: 'End Date Time', width: 25 },
          { header: 'End Address', width: 35 },
          { header: 'End Coordinates', width: 25 },
          { header: 'Total Distance', width: 20 },
          { header: 'Duration', width: 20 },
          { header: 'Maximum Speed', width: 20 },
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
        return isNaN(date) ? '--' : date.toLocaleString('en-GB')
      }

      const formatCoordinates = (coords) => {
        if (!coords) return '--'
        const [lat, lon] = coords.split(',').map((coord) => parseFloat(coord.trim()).toFixed(5))
        return lat && lon ? `${lat}, ${lon}` : '--'
      }

      // Initialize workbook and worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Status Report')

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
        const subtitleRow = worksheet.addRow(['Status Report'])
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
              : getDateRangeFromPeriod(selectedPeriod)
          }`,
          `Selected Vehicle: ${selectedDeviceName || '--'}`,
        ])
        worksheet.addRow([`Generated: ${new Date().toLocaleString()}`])
        worksheet.addRow([]) // Spacer
      }

      // Add data table
      const addDataTable = () => {
        // Add column headers
        const headerRow = worksheet.addRow(CONFIG.columns.map((c) => c.header))
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
        sortedData.forEach((item, index) => {
          const rowData = [
            index + 1,
            selectedDeviceName || '--',
            item.vehicleStatus?.toString() ?? '--',
            formatExcelDate(item.startDateTime),
            newAddressData?.startAddress || '--',
            formatCoordinates(item.startLocation),
            formatExcelDate(item.endDateTime),
            newAddressData?.endAddress || '--',
            formatCoordinates(item.endLocation),
            typeof item.distance === 'number' ? `${(item.distance / 1000).toFixed(2)} km` : '--',
            item.time?.toString() ?? '--',
            typeof item.maxSpeed === 'number' ? `${item.maxSpeed} km/h` : '--',
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
        worksheet.columns = CONFIG.columns.map((col) => ({
          width: col.width,
          style: { alignment: { horizontal: 'left' } },
        }))
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
      addFooter()

      // Generate and save file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const filename = `Status_Report_${new Date().toISOString().split('T')[0]}.xlsx`
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

      // Helper functions
      const applyPrimaryColor = () => {
        doc.setFillColor(...CONFIG.colors.primary)
        doc.setTextColor(...CONFIG.colors.primary)
      }

      const applySecondaryColor = () => {
        doc.setTextColor(...CONFIG.colors.secondary)
      }

      const addHeader = () => {
        // Company logo and name
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

        // Header line
        doc.setDrawColor(...CONFIG.colors.primary)
        doc.setLineWidth(0.5)
        doc.line(CONFIG.layout.margin, 25, doc.internal.pageSize.width - CONFIG.layout.margin, 25)
      }

      const addMetadata = () => {
        const metadata = [
          { label: 'User:', value: decodedToken.username || 'N/A' },
          { label: 'Selected User:', value: selectedUserName || 'N/A' },
          { label: 'Group:', value: selectedGroupName || 'N/A' },
          { label: 'Date Range:', value: `${selectedFromDate} To ${selectedToDate}` },
          { label: 'Vehicle:', value: selectedDeviceName || 'N/A' },
        ]

        doc.setFontSize(10)
        doc.setFont(CONFIG.fonts.primary, 'bold')

        let yPosition = 45
        const xPosition = 15
        const lineHeight = 6

        metadata.forEach((item) => {
          doc.text(`${item.label} ${item.value.toString()}`, xPosition, yPosition)
          yPosition += lineHeight
        })
      }

      const addFooter = () => {
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)

          // Footer line
          doc.setDrawColor(...CONFIG.colors.border)
          doc.setLineWidth(0.5)
          doc.line(
            CONFIG.layout.margin,
            doc.internal.pageSize.height - 15,
            doc.internal.pageSize.width - CONFIG.layout.margin,
            doc.internal.pageSize.height - 15,
          )

          // Copyright text
          doc.setFontSize(9)
          applySecondaryColor()
          doc.text(
            `© ${CONFIG.company.name}`,
            CONFIG.layout.margin,
            doc.internal.pageSize.height - 10,
          )

          // Page number
          const pageNumber = `Page ${i} of ${pageCount}`
          const pageNumberWidth = doc.getTextWidth(pageNumber)
          doc.text(
            pageNumber,
            doc.internal.pageSize.width - CONFIG.layout.margin - pageNumberWidth,
            doc.internal.pageSize.height - 10,
          )
        }
      }

      const formatDate = (dateString) => {
        if (!dateString) return '--'
        const date = new Date(dateString)
        return isNaN(date)
          ? '--'
          : date
              .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
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

      // Title and date
      doc.setFontSize(24)
      doc.setFont(CONFIG.fonts.primary, 'bold')
      doc.text('Status Report', CONFIG.layout.margin, 35)

      const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      const dateText = `Generated: ${currentDate}`
      applySecondaryColor()
      doc.setFontSize(10)
      doc.text(
        dateText,
        doc.internal.pageSize.width - CONFIG.layout.margin - doc.getTextWidth(dateText),
        21,
      )

      addMetadata()

      // Table data preparation
      const tableColumns = [
        'SN',
        'Vehicle Name',
        'Vehicle Status',
        'Start Date Time',
        'Start Address',
        'Start Coordinates',
        'End Date Time',
        'End Address',
        'End Coordinates',
        'Total Distance',
        'Duration',
        'Maximum Speed',
      ]

      const tableRows = sortedData.map((item, index) => [
        index + 1,
        selectedDeviceName || '--',
        item.vehicleStatus?.toString() || '--',
        formatDate(item.startDateTime),
        newAddressData?.startAddress || '--',
        formatCoordinates(item.startLocation),
        formatDate(item.endDateTime),
        newAddressData?.endAddress || '--',
        formatCoordinates(item.endLocation),
        typeof item.distance === 'number' ? `${(item.distance / 1000).toFixed(2)} km` : '--',
        item.time?.toString() || '--',
        typeof item.maxSpeed === 'number' ? `${item.maxSpeed} km/h` : '--',
      ])

      // Generate table
      doc.autoTable({
        startY: 65,
        head: [tableColumns],
        body: tableRows,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          halign: 'center',
          lineColor: CONFIG.colors.border,
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: CONFIG.colors.primary,
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: CONFIG.colors.background,
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 22 },
          2: { cellWidth: 22 },
          4: { cellWidth: 35 },
          5: { cellWidth: 25 },
          7: { cellWidth: 35 },
          9: { cellWidth: 20 },
          10: { cellWidth: 20 },
          11: { cellWidth: 20 },
        },
        margin: { left: CONFIG.layout.margin, right: CONFIG.layout.margin },
        didDrawPage: (data) => {
          // Add header on subsequent pages
          if (doc.getCurrentPageInfo().pageNumber > 1) {
            doc.setFontSize(15)
            doc.setFont(CONFIG.fonts.primary, 'bold')
            doc.text('Status Report', CONFIG.layout.margin, 10)
          }
        },
      })

      addFooter()

      // Save PDF
      const filename = `Status_Report_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
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

  return (
    <>
      {/**TABLE */}
      <Toaster />
      <CTable
        bordered
        className="custom-table table-container"
        style={{ overflowX: auto }}
        responsive
      >
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell
              style={{ backgroundColor: '#0a2d63', color: 'white', width: '70px' }}
              className="text-center"
            >
              SN
            </CTableHeaderCell>
            <CTableHeaderCell
              style={{
                minWidth: '170px',
                backgroundColor: '#0a2d63',
                color: 'white',
                cursor: 'pointer',
              }}
              className="text-center"
              onClick={() => handleSort('Vehicle Name')}
            >
              Vehicle Name
              {sortBy === 'Vehicle Name' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
            </CTableHeaderCell>
            {selectedColumns.map((column, index) => (
              <CTableHeaderCell
                key={index}
                style={{
                  backgroundColor: '#0a2d63',
                  color: 'white',
                  cursor: 'pointer',
                  minWidth: '170px',
                }}
                className="text-center"
                onClick={() => handleSort(column)}
              >
                {column}
                {sortBy === column && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </CTableHeaderCell>
            ))}
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
          ) : currentItems && currentItems.length > 0 ? (
            currentItems.map((row, rowIndex) => (
              <CTableRow key={row.id} className="custom-row">
                <CTableDataCell
                  style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                  className="text-center align-middle"
                >
                  {rowIndex + 1}
                </CTableDataCell>
                <CTableDataCell
                  style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                  className="text-center align-middle"
                >
                  {selectedDeviceName}
                </CTableDataCell>
                {/* Dynamically render table cells based on selected columns */}
                {selectedColumns.map((column, index) => (
                  <>
                    <CTableDataCell
                      key={index}
                      style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                      className="text-center align-middle"
                    >
                      {column === 'Vehicle Status' ? (
                        row.vehicleStatus === 'Idle' ? (
                          <>
                            <CTooltip content="Idle">
                              <img
                                src={idel}
                                alt="idle"
                                width="40"
                                height="40"
                                style={{ marginRight: '10px' }}
                              />
                              {/* <span>Idle</span> */}
                            </CTooltip>
                          </>
                        ) : row.vehicleStatus === 'Ignition Off' ? (
                          <>
                            <CTooltip content="Ignition Off">
                              <img
                                src={ignitionOff}
                                alt="off"
                                width="40"
                                height="40"
                                style={{ marginRight: '10px' }}
                              />
                              {/* <span>Ignition Off</span> */}
                            </CTooltip>
                          </>
                        ) : row.vehicleStatus === 'Ignition On' ? (
                          <>
                            <CTooltip content="Ignition On">
                              <img
                                src={ignitionOn}
                                alt="on"
                                width="40"
                                height="40"
                                style={{ marginRight: '10px' }}
                              />
                              {/* <span>Ignition On</span> */}
                            </CTooltip>
                          </>
                        ) : row.vehicleStatus === 'Overspeed' ? (
                          <>
                            <CTooltip content="Ignition On">
                              <img
                                src={ignitionOn}
                                alt="on"
                                width="40"
                                height="40"
                                style={{ marginRight: '10px' }}
                              />
                              {/* <span>Ignition On</span> */}
                            </CTooltip>
                          </>
                        ) : null
                      ) : column === 'Start Date Time' ? (
                        `${row.startDateTime.slice(0, 10)} , ${row.startDateTime.slice(11, 16)}`
                      ) : column === 'Start Address' ? (
                        newAddressData?.startAddress || 'Fetching...'
                      ) : column === 'End Date Time' ? (
                        `${row.endDateTime.slice(0, 10)} , ${row.endDateTime.slice(11, 16)}`
                      ) : column === 'Distance' ? (
                        row.distance
                      ) : column === 'Total Distance' ? (
                        (row.distance / 1000).toFixed(2) + ' km'
                      ) : column === 'Maximum Speed' ? (
                        row.maxSpeed + ' km'
                      ) : column === 'End Address' ? (
                        newAddressData?.endAddress || 'Fetching...'
                      ) : column === 'Vehicle Status' ? (
                        row.vehicleStatus
                      ) : column === 'Duration' ? (
                        row.time
                      ) : // : column === 'Average Speed'
                      //   ? row.averageSpeed
                      column === 'Start Coordinates' ? (
                        `${parseFloat(row.startLocation.split(',')[0]).toFixed(5)}, ${parseFloat(row.startLocation.split(',')[1]).toFixed(5)}`
                      ) : column === 'End Coordinates' ? (
                        `${parseFloat(row.endLocation.split(',')[0]).toFixed(5)}, ${parseFloat(row.endLocation.split(',')[1]).toFixed(5)}`
                      ) : (
                        '--'
                      )}
                    </CTableDataCell>
                  </>
                ))}
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell
                colSpan={selectedColumns.length + 1}
                style={{
                  backgroundColor: '#f8f9fa', // Light gray background
                  color: '#6c757d', // Darker text color
                  fontStyle: 'italic', // Italic font style
                  padding: '16px', // Extra padding for emphasis
                  textAlign: 'center', // Center the text
                  border: '1px dashed #dee2e6', // Dashed border to highlight it
                }}
              >
                No data available {selectedDeviceName}
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {/* Rows Per Page Dropdown */}
      <CRow className="my-3">
        <CCol xs={12} className="d-flex justify-content-end">
          <CDropdown aria-label="Rows per page selector">
            <CDropdownToggle color="secondary" className="d-flex align-items-center">
              {itemsPerPage === Infinity ? 'All' : itemsPerPage}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={() => handleItemsPerPageChange(10)}>10 rows</CDropdownItem>
              <CDropdownItem onClick={() => handleItemsPerPageChange(15)}>15 rows</CDropdownItem>
              <CDropdownItem onClick={() => handleItemsPerPageChange(25)}>25 rows</CDropdownItem>
              <CDropdownItem onClick={() => handleItemsPerPageChange(50)}>50 rows</CDropdownItem>
              <CDropdownItem onClick={() => handleItemsPerPageChange(100)}>100 rows</CDropdownItem>
              <CDropdownItem onClick={() => handleItemsPerPageChange(200)}>200 rows</CDropdownItem>
              <CDropdownItem onClick={() => handleItemsPerPageChange(500)}>500 rows</CDropdownItem>
              <CDropdownItem onClick={() => handleItemsPerPageChange(Infinity)}>
                All rows
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CRow>

      {!statusLoading && (
        <CRow className="my-3">
          <CCol xs={6} className="d-flex align-items-center">
            <span className="text-muted small">
              Showing {indexOfFirstItem + 1 || ''} to {Math.min(indexOfLastItem, sortedData.length)}{' '}
              of {sortedData.length} entries
            </span>
          </CCol>
          <div className="d-flex justify-content-center">
            {/* Existing pagination code */}
            {sortedData.length > itemsPerPage && (
              <CPagination align="end" aria-label="Table pagination">
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  style={{ cursor: 'pointer' }}
                >
                  Previous
                </CPaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <CPaginationItem
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                    aria-current={page === currentPage ? 'page' : undefined}
                    style={{ cursor: 'pointer' }}
                  >
                    {page}
                  </CPaginationItem>
                ))}
                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  style={{ cursor: 'pointer' }}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            )}
          </div>
        </CRow>
      )}

      <div className="position-fixed bottom-0 end-0 mb-5 m-3 z-5">
        <IconDropdown items={dropdownItems} />
      </div>
    </>
  )
}

const Status = () => {
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
  const [showMap, setShowMap] = useState(false) //show mapping data
  const [columns] = useState([
    'Vehicle Status',
    'Start Date Time',
    'Start Address',
    'Start Coordinates',
    'End Date Time',
    'End Address',
    'End Coordinates',
    'Total Distance',
    'Duration',
    // 'Total KM',
    'Maximum Speed',
    // 'Distance',
  ])
  const [selectedColumns, setSelectedColumns] = useState([])
  const token = Cookies.get('authToken') //
  const [apiData, setApiData] = useState() //data from api
  const [statusLoading, setStatusLoading] = useState(false)
  const [putName, setPutName] = useState('')

  useEffect(() => {
    console.log('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', putName)
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
      console.error('Error fetching data:', error)
      setDevices([])
      setLoading(false)
      throw error // Re-throw the error for further handling if needed
    }
  }

  const selectedGroup = groups.find((group) => group.groupId === formData.Groups)
  const selectedGroupName = selectedGroup ? selectedGroup.name : ''

  const getGroups = async (selectedUser = '') => {
    setLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/group/${selectedUser}`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
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

      // After setting groups, find the selected group
      const selectedGroup = groups.find((group) => group.groupId === formData.Groups)
      const selectedGroupName = selectedGroup ? selectedGroup.name : ''
      console.log('Selected Group:', selectedGroupName)
    } catch (error) {
      setLoading(false)
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
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
        console.log('Users fetched successfully.')

        // After users are set, update selectedUserName based on formData.User
        const selectedUser = users.find((user) => user.userId === formData.User)
        const selectedUserName = selectedUser ? selectedUser.username : ''
        setSelectedUserName(selectedUserName)
        console.log('Selected Userrerrrrrrrrrrrrrrrrrrrrrrrrrrrrrr:', selectedUserName)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    getUser()
    getGroups()
  }, [])

  const handleInputChange = (name, value) => {
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
    console.log('DataAll', formData)

    // If fromDate and toDate are set, format them, otherwise use an empty string
    const fromDate = formData.FromDate ? new Date(formData.FromDate).toISOString() : ''
    const toDate = formData.ToDate ? new Date(formData.ToDate).toISOString() : ''

    const body = {
      deviceId: formData.Devices, // Use the device ID from the form data
      period: formData.Periods, // Use the selected period from the form data
      FromDate: fromDate,
      ToDate: toDate,
    }
    console.log(token)

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/status?deviceId=${body.deviceId}&period=${body.period}&fromDate=${body.FromDate}&toDate=${body.ToDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      if (response.status == 200) {
        console.log(response.data.data)
        setApiData(response.data)
        setStatusLoading(false)
      }
    } catch (error) {
      setStatusLoading(false)
      console.error('Error submitting form:', error)
    }
  }

  // Example of extracting values similar to `selectedGroup`
  const selectedFromDate = formData.FromDate ? new Date(formData.FromDate).toLocaleDateString() : ''
  const selectedToDate = formData.ToDate ? new Date(formData.ToDate).toLocaleDateString() : ''
  const selectedPeriod = formData.Periods || ''

  console.log('Selected From Date:', selectedFromDate)
  console.log('Selected To Date:', selectedToDate)
  console.log('Selected Period:', selectedPeriod)

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
              <strong>Status Report</strong>
            </CCardHeader>
            <CCardBody>
              <SearchStatus
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
                  <strong>Status Report {selectedDeviceName && `for ${selectedDeviceName}`}</strong>{' '}
                  {/* Show the device name here */}
                  {/* <CFormInput
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '250px' }}
                  /> */}
                </CCardHeader>
                <CCardBody>
                  <ShowStatus
                    formData={formData}
                    apiData={apiData}
                    statusLoading={statusLoading}
                    selectedDeviceName={selectedDeviceName}
                    selectedColumns={selectedColumns}
                    selectedGroupName={selectedGroupName}
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
export default Status
