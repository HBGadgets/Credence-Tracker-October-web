import React, { useEffect, useState } from 'react'
import { Pagination } from 'react-bootstrap'
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import Select from 'react-select'
import Cookies from 'js-cookie'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // For table in PDF
import * as XLSX from 'xlsx'
import Loader from '../../../components/Loader/Loader'
import '../style/remove-gutter.css'
import '../../../utils.css'
import IconDropdown from '../../../components/ButtonDropdown'
import { FaRegFilePdf, FaPrint } from 'react-icons/fa6'
import { PiMicrosoftExcelLogo } from 'react-icons/pi'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaArrowUp } from 'react-icons/fa'
import toast, { Toaster } from 'react-hot-toast'
import { jwtDecode } from 'jwt-decode'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import Page404 from '../../pages/page404/Page404'

const accessToken = Cookies.get('authToken')
const decodedToken = jwtDecode(accessToken)

const SearchTrip = ({
  formData,
  handleInputChange,
  handleSubmit,
  users,
  groups,
  getGroups,
  loading,
  devices,
  getDevices,
  columns,
  showMap,
  setShowMap,
  handlePutName,
}) => {
  const [validated, setValidated] = useState(false)
  const [buttonText, setButtonText] = useState('SHOW NOW')
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [selectedU, setSelectedU] = useState()
  const [selectedG, setSelectedG] = useState()

  // For username show in pdf
  const [putName, setPutName] = useState('')

  useEffect(() => {
    handlePutName(putName)
  }, [putName])

  // Date conversion function to convert the given date to the desired format
  const convertToDesiredFormat = (inputDate) => {
    const date = new Date(inputDate) // Create a Date object with the given input

    // Get the timezone offset in minutes and convert to milliseconds
    const timezoneOffset = date.getTimezoneOffset() * 60000

    // Adjust the date object to local time by subtracting the offset
    const localDate = new Date(date.getTime() - timezoneOffset)

    // Convert to ISO string format and append the +00:00 offset
    const formattedDate = localDate.toISOString().replace('Z', '+00:00')

    console.log('Original Date:', date)
    console.log('Local Adjusted Date:', localDate)
    console.log('Formatted Date:', formattedDate)

    return formattedDate
  }

  // Modify the existing handleInputChange function to include the format conversion
  const handleDateChange = (field, value) => {
    const formattedDate = convertToDesiredFormat(value) // Convert the input date
    handleInputChange(field, formattedDate) // Call the input change handler
    console.log('Formatted Date:', formattedDate) // Log the formatted date
  }

  const handleFormSubmit = (event) => {
    const form = event.currentTarget
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
    } else {
      event.preventDefault()
      handleSubmit()
      setShowMap(true) //Show data mapping
    }
    setValidated(true)
  }

  // Function to handle dropdown item clicks
  const handleDropdownClick = (text) => {
    setButtonText(text) // Change button text based on the clicked item
    setDropdownOpen(false) // Close the dropdown after selection
    handleSubmit() // Submit form
    setShowMap(true) // Show the map data
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
      <CCol md={2}>
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
            console.log('Selected user:', selectedUser)
            getGroups(selectedUser)
          }}
          placeholder="Choose a user..."
          isLoading={loading} // Show a loading spinner while fetching users
        />
      </CCol>
      <CCol md={2}>
        <CFormLabel htmlFor="devices">Groups</CFormLabel>
        {/* <CFormSelect
          id="group"
          required
          value={selectedG}
          onChange={(e) => {
            const selectedGroup = e.target.value;
            setSelectedG(selectedGroup);
            console.log("Selected Group ID:", selectedGroup);
            getDevices(selectedGroup);
          }}
        >
          <option value="">Choose a group...</option>

          {loading ? (<option>Loading Groups...</option>) : (
            groups?.length > 0 ? (
              groups?.map((group) => (
                <option key={group._id} value={group._id}>{group.name}</option>
              ))
            ) : (
              <option disabled>No Groups in this User</option>
            )
          )
          }
        </CFormSelect> */}
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
          placeholder="Choose a group..."
          isLoading={loading} // Show a loading spinner while fetching groups
        />

        <CFormFeedback invalid>Please provide a valid device.</CFormFeedback>
      </CCol>
      <CCol md={2}>
        <CFormLabel htmlFor="devices">Vehicles</CFormLabel>
        {/* <CFormSelect
          id="devices"
          required
          value={formData.Devices}
          onChange={(e) => handleInputChange('Devices', e.target.value)}
        >
          <option value="">Choose a device...</option>
          {loading ? (
            <option>Loading devices...</option>
          ) : devices?.length > 0 ? (
            devices?.map((device) => (
              <option key={device.id} value={device.deviceId}>
                {device.name}
              </option>
            ))
          ) : (
            <option disabled>No Device in this Group</option>
          )}
        </CFormSelect> */}
        <Select
          id="devices"
          options={
            loading
              ? [{ value: '', label: 'Loading Vehilces...', isDisabled: true }]
              : devices?.length > 0
                ? devices.map((device) => ({ value: device.deviceId, label: device.name }))
                : [{ value: '', label: 'No Vehilces in this Group', isDisabled: true }]
          }
          value={
            formData.Devices
              ? {
                  value: formData.Devices,
                  label: devices.find((device) => device.deviceId === formData.Devices)?.name,
                }
              : null
          }
          onChange={(selectedOption) => handleInputChange('Devices', selectedOption?.value)}
          placeholder="Choose a Vehicles..."
          isLoading={loading} // Show a loading spinner while fetching devices
        />

        <CFormFeedback invalid>Please provide a valid vehicles.</CFormFeedback>
      </CCol>

      <CCol md={2}>
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
        <CFormFeedback invalid>Please select at least one column.</CFormFeedback>
      </CCol>

      {/* Date Inputs for From Date and To Date */}

      <CCol md={2}>
        <CFormLabel htmlFor="fromDate">From Date</CFormLabel>
        <CFormInput
          type="datetime-local"
          id="fromDate"
          value={formData.FromDate ? formData.FromDate.slice(0, 16) : ''} // Display local datetime value
          onChange={(e) => handleDateChange('FromDate', e.target.value)} // Use handleDateChange for conversion
          required
        />
        <CFormFeedback invalid>Please provide a valid from date.</CFormFeedback>
      </CCol>

      <CCol md={2}>
        <CFormLabel htmlFor="toDate">To Date</CFormLabel>
        <CFormInput
          type="datetime-local"
          id="toDate"
          value={formData.ToDate ? formData.ToDate.slice(0, 16) : ''} // Display local datetime value
          onChange={(e) => handleDateChange('ToDate', e.target.value)} // Use handleDateChange for conversion
          required
        />
        <CFormFeedback invalid>Please provide a valid to date.</CFormFeedback>
      </CCol>

      <CCol xs={12}>
        <div className="d-flex justify-content-end">
          <div className="btn-group">
            <button
              className="btn text-white"
              type="submit"
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

const TripTable = ({
  apiData,
  selectedColumns,
  statusLoading,
  selectedDeviceName,
  selectedGroupName,
  selectedUserName,
  selectedFromDate,
  selectedToDate,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [addressData, setAddressData] = useState({})
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa', selectedUserName)

  // Function to get address based on latitude and longitude using Nominatim API
  const getAddress = async (latitude, longitude) => {
    try {
      const apiKey = 'CWVeoDxzhkO07kO693u0'
      const response = await axios.get(
        `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}`,
      )

      if (response.data?.features?.length > 0) {
        const address = response.data.features[0].place_name
        console.log('Fetched address:', address)
        return address
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
      const newAddressData = {}

      const promises = apiData.finalTrip.map(async (trip) => {
        const tripKey = `${trip.deviceId}-${trip.startTime}` // Unique key for each trip

        if (!addressData[tripKey]) {
          const [startAddress, endAddress] = await Promise.all([
            getAddress(trip.startLatitude, trip.startLongitude),
            getAddress(trip.endLatitude, trip.endLongitude),
          ])

          newAddressData[tripKey] = { startAddress, endAddress }
        } else {
          newAddressData[tripKey] = addressData[tripKey] // Use cached data if available
        }
      })

      await Promise.all(promises)
      setAddressData((prev) => ({ ...prev, ...newAddressData }))
    }

    if (apiData?.finalTrip?.length > 0) {
      fetchAddresses()
    }
  }, [apiData])

  const columnKeyMap = {
    'Start Time': 'startTime',
    'End Time': 'endTime',
    Distance: 'distance',
    // 'Total Distance': 'totalDistance',
    'Maximum Speed': 'maxSpeed',
    'Average Speed': 'avgSpeed',
    Duration: 'duration',
    'Start Address': 'startAddress',
    'End Address': 'endAddress',
  }

  // Sorting handler
  const handleSort = (columnLabel) => {
    const sortKey = columnKeyMap[columnLabel]
    if (!sortKey) return

    let direction = 'asc'
    if (sortConfig.key === sortKey && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key: sortKey, direction })
  }

  // Sorted data
  const sortedData = React.useMemo(() => {
    if (!apiData?.finalTrip) return []
    const data = [...apiData.finalTrip]

    if (sortConfig.key) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        // Handle different data types
        switch (sortConfig.key) {
          case 'startTime':
          case 'endTime':
            return sortConfig.direction === 'asc'
              ? new Date(aValue) - new Date(bValue)
              : new Date(bValue) - new Date(aValue)

          case 'distance':
          // case 'totalDistance':
          case 'maxSpeed':
          case 'avgSpeed':
            return sortConfig.direction === 'asc'
              ? parseFloat(aValue) - parseFloat(bValue)
              : parseFloat(bValue) - parseFloat(aValue)

          case 'duration':
            const aDuration = parseInt(aValue.replace(' mins', ''))
            const bDuration = parseInt(bValue.replace(' mins', ''))
            return sortConfig.direction === 'asc' ? aDuration - bDuration : bDuration - aDuration

          default:
            if (typeof aValue === 'string') {
              return sortConfig.direction === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue)
            }
            return 0
        }
      })
    }
    return data
  }, [apiData, sortConfig])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem)

  // Function to export table data to Excel
  const exportToExcel = async () => {
    try {
      // Validate that there is data
      if (!Array.isArray(sortedData) || sortedData.length === 0) {
        throw new Error('No data available for Excel export')
      }

      // Configuration constants for styling
      const CONFIG = {
        styles: {
          primaryColor: 'FF0A2D63', // Company blue
          secondaryColor: 'FF6C757D', // Secondary header color
          textColor: 'FFFFFFFF', // White text for headers
          borderStyle: 'thin',
          titleFont: { bold: true, size: 16 },
          headerFont: { bold: true, size: 12 },
          dataFont: { size: 11 },
        },
        company: {
          name: 'Credence Tracker',
          copyright: `© ${new Date().getFullYear()} Credence Tracker`,
        },
      }

      // Build the Excel columns based on your table.
      // First two columns are fixed: SN and Device.
      const excelColumns = [
        { header: 'SN', width: 8 },
        { header: 'Device', width: 25 },
      ]

      // Map selected columns to Excel columns.
      // You can adjust widths as needed.
      selectedColumns.forEach((col) => {
        let width = 20 // default width
        if (col === 'Start Time' || col === 'End Time') {
          width = 25
        } else if (col === 'Start Address' || col === 'End Address') {
          width = 35
        } else if (col === 'Start Co-ordinates' || col === 'End Co-ordinates') {
          width = 25
        } else if (col === 'Driver' || col === 'Device Name') {
          width = 25
        }
        excelColumns.push({ header: col, width })
      })

      // Initialize workbook and worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Trip Report')

      // Helper: add header section (company name, report title, and metadata)
      const addHeaderSection = () => {
        // Company title row
        const titleRow = worksheet.addRow([CONFIG.company.name])
        titleRow.font = { ...CONFIG.styles.titleFont, color: { argb: CONFIG.styles.textColor } }
        titleRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: CONFIG.styles.primaryColor },
        }
        titleRow.alignment = { horizontal: 'center' }
        // Merge cells from column A to the last column
        worksheet.mergeCells(1, 1, 1, excelColumns.length)

        // Report title row
        const reportTitle = worksheet.addRow(['Trip Report'])
        reportTitle.font = {
          ...CONFIG.styles.titleFont,
          size: 14,
          color: { argb: CONFIG.styles.textColor },
        }
        reportTitle.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: CONFIG.styles.secondaryColor },
        }
        reportTitle.alignment = { horizontal: 'center' }
        worksheet.mergeCells(2, 1, 2, excelColumns.length)

        // Metadata rows (customize as needed)
        worksheet.addRow([`Generated by: ${decodedToken.username || 'N/A'}`])
        worksheet.addRow([
          `User: ${selectedUserName || 'N/A'}`,
          `Group: ${selectedGroupName || 'N/A'}`,
        ])
        worksheet.addRow([
          `Date Range: ${
            selectedFromDate && selectedToDate
              ? `${new Date(selectedFromDate).toLocaleDateString('en-GB')} - ${new Date(selectedToDate).toLocaleDateString('en-GB')}`
              : getDateRangeFromPeriod(selectedPeriod)
          }`,
          `Selected Vehicle: ${selectedDeviceName || '--'}`,
        ])
        worksheet.addRow([`Generated: ${new Date().toLocaleString()}`])
        worksheet.addRow([]) // Spacer
      }

      // Add data table: header row and data rows
      const addDataTable = () => {
        // Add header row using the dynamic excelColumns
        const headerRow = worksheet.addRow(excelColumns.map((col) => col.header))
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

        // Loop through each row of data
        sortedData.forEach((row, rowIndex) => {
          const rowData = []
          // First cell: serial number
          rowData.push(rowIndex + 1)
          // Second cell: Device (assuming row.name holds the device value)
          rowData.push(row.name)

          // For each dynamic column, compute the cell value similar to your table rendering
          selectedColumns.forEach((column) => {
            let cellValue = '--'
            switch (column) {
              case 'Start Time': {
                const date = new Date(row.startTime)
                // Adjust time as in your table logic (subtracting 5 hours and 30 minutes)
                date.setHours(date.getHours() - 5, date.getMinutes() - 30)
                cellValue = date.toLocaleString([], {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })
                break
              }
              case 'End Time': {
                const date = new Date(row.endTime)
                date.setHours(date.getHours() - 5, date.getMinutes() - 30)
                cellValue = date.toLocaleString([], {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })
                break
              }
              case 'Distance': {
                cellValue = row.distance ?? '--'
                break
              }
              // case 'Total Distance': {
              //   cellValue = row.totalDistance ?? '--'
              //   break
              // }
              case 'Maximum Speed': {
                cellValue =
                  typeof row.maxSpeed === 'number' ? `${row.maxSpeed.toFixed(2)} km/h` : '--'
                break
              }
              case 'Average Speed': {
                cellValue =
                  typeof row.avgSpeed === 'number' ? `${row.avgSpeed.toFixed(2)} km/h` : '--'
                break
              }
              case 'Duration': {
                cellValue = row.duration ?? '--'
                break
              }
              case 'Start Address': {
                cellValue =
                  (addressData &&
                    addressData[row.deviceId] &&
                    addressData[row.deviceId].startAddress) ||
                  'Fetching...'
                break
              }
              case 'Start Co-ordinates': {
                if (row.startLatitude && row.startLongitude) {
                  cellValue = `${row.startLatitude}, ${row.startLongitude}`
                } else {
                  cellValue = 'Fetching Co-ordinates...'
                }
                break
              }
              case 'End Address': {
                cellValue =
                  (addressData &&
                    addressData[row.deviceId] &&
                    addressData[row.deviceId].endAddress) ||
                  'Fetching...'
                break
              }
              case 'End Co-ordinates': {
                if (row.endLatitude && row.endLongitude) {
                  cellValue = `${row.endLatitude}, ${row.endLongitude}`
                } else {
                  cellValue = 'Fetching Co-ordinates...'
                }
                break
              }
              case 'Driver': {
                cellValue = row.driverName || '--'
                break
              }
              case 'Device Name': {
                cellValue = (row.device && row.device.name) || '--'
                break
              }
              default: {
                cellValue = '--'
              }
            }
            rowData.push(cellValue)
          })

          // Add the row to the worksheet and apply border styling
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

        // Set column widths from our excelColumns definition
        worksheet.columns = excelColumns.map((col) => ({
          width: col.width,
          style: { alignment: { horizontal: 'left' } },
        }))
      }

      // Add a footer (if desired)
      const addFooter = () => {
        worksheet.addRow([]) // Spacer
        const footerRow = worksheet.addRow([CONFIG.company.copyright])
        footerRow.font = { italic: true }
        worksheet.mergeCells(footerRow.number, 1, footerRow.number, excelColumns.length)
      }

      // Build the document sections
      addHeaderSection()
      addDataTable()
      addFooter()

      // Generate and save the file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const filename = `Trip_Report_${new Date().toISOString().split('T')[0]}.xlsx`
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

      // Create the jsPDF document
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Helper functions for color
      const applyPrimaryColor = () => {
        doc.setFillColor(...CONFIG.colors.primary)
        doc.setTextColor(...CONFIG.colors.primary)
      }
      const applySecondaryColor = () => {
        doc.setTextColor(...CONFIG.colors.secondary)
      }

      // Header: company logo, name and header line
      const addHeader = () => {
        // Draw a simple rectangle as logo placeholder
        doc.setFillColor(...CONFIG.colors.primary)
        doc.rect(
          CONFIG.company.logo.x,
          CONFIG.company.logo.y,
          CONFIG.company.logo.size,
          CONFIG.company.logo.size,
          'F',
        )
        // Company name
        doc.setFont(CONFIG.fonts.primary, 'bold')
        doc.setFontSize(16)
        doc.text(CONFIG.company.name, 28, 21)
        // Draw a horizontal line below the header
        doc.setDrawColor(...CONFIG.colors.primary)
        doc.setLineWidth(0.5)
        doc.line(CONFIG.layout.margin, 25, doc.internal.pageSize.width - CONFIG.layout.margin, 25)
      }

      // Metadata: additional info below header
      const addMetadata = () => {
        const metadata = [
          { label: 'User:', value: decodedToken.username || 'N/A' },
          { label: 'Selected User:', value: selectedUserName || 'N/A' },
          { label: 'Group:', value: selectedGroupName || 'N/A' },
          {
            label: 'Date Range:',
            value:
              selectedFromDate && selectedToDate
                ? `${new Date(selectedFromDate).toLocaleDateString()} To ${new Date(selectedToDate).toLocaleDateString()}`
                : '--',
          },
          { label: 'Vehicle:', value: selectedDeviceName || 'N/A' },
        ]

        doc.setFontSize(10)
        doc.setFont(CONFIG.fonts.primary, 'bold')

        let yPosition = 45
        const xPosition = CONFIG.layout.margin
        const lineHeight = CONFIG.layout.lineHeight

        metadata.forEach((item) => {
          doc.text(`${item.label} ${item.value.toString()}`, xPosition, yPosition)
          yPosition += lineHeight
        })
      }

      // Footer: add footer line, copyright and page number on each page
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

      // Helper to format date and time (subtracting 5 hours and 30 minutes as per your HTML table)
      const formatDateTime = (dateString) => {
        if (!dateString) return '--'
        const date = new Date(dateString)
        if (isNaN(date)) return '--'
        // Adjust the time (subtract 5 hours and 30 minutes)
        date.setHours(date.getHours() - 5, date.getMinutes() - 30)
        return date.toLocaleString([], {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      }

      // Helper to format coordinates from latitude and longitude
      const formatCoordinates = (lat, lon) => {
        if (lat == null || lon == null) return 'Fetching Co-ordinates...'
        return `${parseFloat(lat).toFixed(5)}, ${parseFloat(lon).toFixed(5)}`
      }

      // ==========================
      // Build the table dynamically
      // ==========================
      // Build the header columns: fixed first two columns + dynamic ones from selectedColumns
      const pdfColumns = ['SN', 'Device', ...selectedColumns]

      // Build table rows using sortedData
      const tableRows = sortedData.map((row, index) => {
        const rowData = []
        // First column: serial number
        rowData.push(index + 1)
        // Second column: Device (assuming row.name holds the device value)
        rowData.push(row.name)

        // For each dynamic column, determine the value
        selectedColumns.forEach((column) => {
          let cellValue = '--'
          switch (column) {
            case 'Start Time': {
              cellValue = formatDateTime(row.startTime)
              break
            }
            case 'End Time': {
              cellValue = formatDateTime(row.endTime)
              break
            }
            case 'Distance': {
              cellValue = row.distance != null ? row.distance.toString() : '--'
              break
            }
            // case 'Total Distance': {
            //   cellValue = row.totalDistance != null ? row.totalDistance.toString() : '--'
            //   break
            // }
            case 'Maximum Speed': {
              cellValue =
                typeof row.maxSpeed === 'number' ? `${row.maxSpeed.toFixed(2)} km/h` : '--'
              break
            }
            case 'Average Speed': {
              cellValue =
                typeof row.avgSpeed === 'number' ? `${row.avgSpeed.toFixed(2)} km/h` : '--'
              break
            }
            case 'Duration': {
              cellValue = row.duration ? row.duration.toString() : '--'
              break
            }
            case 'Start Address': {
              cellValue =
                (addressData &&
                  addressData[row.deviceId] &&
                  addressData[row.deviceId].startAddress) ||
                'Fetching...'
              break
            }
            case 'Start Co-ordinates': {
              cellValue =
                row.startLatitude && row.startLongitude
                  ? formatCoordinates(row.startLatitude, row.startLongitude)
                  : 'Fetching Co-ordinates...'
              break
            }
            case 'End Address': {
              cellValue =
                (addressData &&
                  addressData[row.deviceId] &&
                  addressData[row.deviceId].endAddress) ||
                'Fetching...'
              break
            }
            case 'End Co-ordinates': {
              cellValue =
                row.endLatitude && row.endLongitude
                  ? formatCoordinates(row.endLatitude, row.endLongitude)
                  : 'Fetching Co-ordinates...'
              break
            }
            case 'Driver': {
              cellValue = row.driverName || '--'
              break
            }
            case 'Device Name': {
              cellValue = (row.device && row.device.name) || '--'
              break
            }
            default: {
              cellValue = '--'
            }
          }
          rowData.push(cellValue)
        })

        return rowData
      })

      // Optional: Define dynamic column styles based on the column name
      const dynamicColumnStyles = {}
      // The first two columns (indexes 0 and 1) are fixed
      dynamicColumnStyles[0] = { cellWidth: 10 }
      dynamicColumnStyles[1] = { cellWidth: 22 }
      selectedColumns.forEach((col, i) => {
        // Actual column index in the table is i+2
        const colIndex = i + 2
        if (col === 'Start Time' || col === 'End Time') {
          dynamicColumnStyles[colIndex] = { cellWidth: 25 }
        } else if (col === 'Start Address' || col === 'End Address') {
          dynamicColumnStyles[colIndex] = { cellWidth: 35 }
        } else if (col === 'Start Co-ordinates' || col === 'End Co-ordinates') {
          dynamicColumnStyles[colIndex] = { cellWidth: 25 }
        } else if (
          col === 'Distance' ||
          // col === 'Total Distance' ||
          col === 'Maximum Speed' ||
          col === 'Average Speed' ||
          col === 'Duration'
        ) {
          dynamicColumnStyles[colIndex] = { cellWidth: 20 }
        } else if (col === 'Driver' || col === 'Device Name') {
          dynamicColumnStyles[colIndex] = { cellWidth: 25 }
        } else {
          dynamicColumnStyles[colIndex] = { cellWidth: 20 }
        }
      })

      // ==========================
      // Build the main document
      // ==========================
      addHeader()

      // Title and generated date
      doc.setFontSize(24)
      doc.setFont(CONFIG.fonts.primary, 'bold')
      doc.text('Trip Report', CONFIG.layout.margin, 35)

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

      // Generate table using autoTable
      doc.autoTable({
        startY: 65,
        head: [pdfColumns],
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
        columnStyles: dynamicColumnStyles,
        margin: { left: CONFIG.layout.margin, right: CONFIG.layout.margin },
        didDrawPage: (data) => {
          // Add header text on subsequent pages if needed
          if (doc.getCurrentPageInfo().pageNumber > 1) {
            doc.setFontSize(15)
            doc.setFont(CONFIG.fonts.primary, 'bold')
            doc.text('Trip Report', CONFIG.layout.margin, 10)
          }
        },
      })

      addFooter()

      // Save the PDF file
      const filename = `Trip_Report_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF Export Error:', error)
      toast.error(error.message || 'Failed to export PDF')
    }
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
      <CTable bordered className="custom-table">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell style={{ backgroundColor: '#0a2d63', color: 'white' }}>
              SN
            </CTableHeaderCell>
            <CTableHeaderCell style={{ backgroundColor: '#0a2d63', color: 'white' }}>
              Vehicle Name
            </CTableHeaderCell>
            {selectedColumns.map((column, index) => (
              <CTableHeaderCell
                key={index}
                style={{
                  backgroundColor: '#0a2d63',
                  color: 'white',
                  cursor: columnKeyMap[column] ? 'pointer' : 'default',
                }}
                onClick={() => handleSort(column)}
              >
                {column}
                {sortConfig.key === columnKeyMap[column] && (
                  <span> {sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
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
          ) : sortedData.length > 0 ? (
            currentItems.map((row, rowIndex) => (
              <CTableRow key={`${row.deviceId}-${row.startTime}`} className="custom-row">
                <CTableDataCell
                  style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                >
                  {indexOfFirstItem + rowIndex + 1}
                </CTableDataCell>
                <CTableDataCell
                  style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                >
                  {row.name}
                </CTableDataCell>

                {/* Your dynamic column rendering remains unchanged */}
                {selectedColumns.map((column, index) => (
                  <CTableDataCell
                    key={index}
                    style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                  >
                    {(() => {
                      switch (column) {
                        case 'Start Time':
                          return row.startTime
                            ? new Date(row.startTime).toLocaleString('en-GB', {
                                timeZone: 'UTC',
                                hour12: false,
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '--'
                        case 'End Time':
                          return row.endTime
                            ? new Date(row.endTime).toLocaleString('en-GB', {
                                timeZone: 'UTC',
                                hour12: false,
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '--'
                        case 'Distance':
                          return row.distance
                        case 'Maximum Speed':
                          return `${row.maxSpeed.toFixed(2)} km/h`
                        case 'Average Speed':
                          return `${row.avgSpeed.toFixed(2)} km/h`
                        case 'Duration':
                          return row.duration
                        case 'Start Address':
                          const startKey = `${row.deviceId}-${row.startTime}`
                          return addressData[startKey]?.startAddress || 'Fetching...'
                        case 'Start Co-ordinates':
                          return row.startLatitude && row.startLongitude
                            ? `${row.startLatitude}, ${row.startLongitude}`
                            : 'Fetching Co-ordinates...'
                        case 'End Address':
                          const endKey = `${row.deviceId}-${row.startTime}`
                          return addressData[endKey]?.endAddress || 'Fetching...'
                        case 'End Co-ordinates':
                          return row.endLatitude && row.endLongitude
                            ? `${row.endLatitude}, ${row.endLongitude}`
                            : 'Fetching Co-ordinates...'
                        case 'Driver':
                          return row.driverName
                        case 'Device Name':
                          return row.device?.name || '--'
                        default:
                          return '--'
                      }
                    })()}
                  </CTableDataCell>
                ))}
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell
                colSpan={selectedColumns.length + 2}
                style={{
                  backgroundColor: '#f8f9fa',
                  color: '#6c757d',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '16px',
                }}
              >
                No data available
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {sortedData.length > itemsPerPage && (
        <div className="d-flex justify-content-center my-3">
          <Pagination>
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            />
            {Array.from({ length: Math.ceil(sortedData.length / itemsPerPage) }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={currentPage === Math.ceil(sortedData.length / itemsPerPage)}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(sortedData.length / itemsPerPage)),
                )
              }
            />
          </Pagination>
        </div>
      )}

      <CDropdown className="mb-2">
        <CDropdownToggle color="secondary">{itemsPerPage} rows</CDropdownToggle>
        <CDropdownMenu>
          {[10, 25, 50, 100, Infinity].map((count) => (
            <CDropdownItem
              key={count}
              onClick={() => {
                setItemsPerPage(count)
                setCurrentPage(1)
              }}
            >
              {count === Infinity ? 'All' : `${count} rows`}
            </CDropdownItem>
          ))}
        </CDropdownMenu>
      </CDropdown>

      <div className="position-fixed bottom-0 end-0 mb-5 m-3 z-5">
        <IconDropdown items={dropdownItems} />
      </div>
    </>
  )
}

const Trips = () => {
  const accessToken = Cookies.get('authToken')
  const [formData, setFormData] = useState({
    Devices: '',
    Details: '',
    Periods: '',
    FromDate: '',
    ToDate: '',
    Columns: [],
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState()
  const [groups, setGroups] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [columns] = useState([
    'Start Time',
    'Start Address',
    'Start Co-ordinates',
    'Distance',
    'Average Speed',
    'Maximum Speed',
    // 'Total Distance',
    'End Time',
    'End Address',
    'End Co-ordinates',
  ])
  const [selectedColumns, setSelectedColumns] = useState([])
  const [showMap, setShowMap] = useState(false) //show mapping data
  const token = Cookies.get('authToken') //token
  const [error, setError] = useState(null)

  const [apiData, setApiData] = useState() //data from api

  const [selectedUserName, setSelectedUserName] = useState('')
  const [putName, setPutName] = useState('')

  const handlePutName = (name) => {
    setPutName(name)
    console.log('putName', putName)
  }

  useEffect(() => {
    console.log('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', putName)
  }, [putName])

  // Get the selected device name from the device list based on formData.Devices
  const selectedDevice = devices.find((device) => device.deviceId === formData.Devices)
  const selectedDeviceName = selectedDevice ? selectedDevice.name : ''

  const getDevices = async (selectedGroup) => {
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
        console.log('perticular user ke groups')
      } else if (response.data.groups) {
        setGroups(response.data.groups)
        setLoading(false)
        console.log('all groups')
      }
      // After setting groups, find the selected group
      const selectedGroup = groups.find((group) => group.groupId === formData.Groups)
      const selectedGroupName = selectedGroup ? selectedGroup.name : ''
      console.log('Selected Group:', selectedGroupName)
    } catch (error) {
      setError(error.message)
      setLoading(false)
      console.error('Error fetching data:', error)
      throw error
    }
  }

  const getUser = async () => {
    setLoading(true)
    setGroups([])
    setDevices([])
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })
      if (response.data) {
        setUsers(response.data.users)
        setLoading(false)
        console.log('yaha tak thik hai')

        // After users are set, update selectedUserName based on formData.User
        const selectedUser = users.find((user) => user.userId === formData.User)
        const selectedUserName = selectedUser ? selectedUser.username : ''
        setSelectedUserName(selectedUserName)
        console.log('Selected Userrerrrrrrrrrrrrrrrrrrrrrrrrrrrrrr:', selectedUserName)
      }
    } catch (error) {
      setLoading(false)
      console.error('Error fetching data:', error)
      throw error
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

  // const handleSubmit = () => {
  //   console.log('Form submitted with data:', formData);
  // };

  const handleSubmit = async () => {
    setStatusLoading(true)
    // Convert the dates to ISO format if they're provided
    const fromDate = formData.FromDate ? new Date(formData.FromDate).toISOString() : ''
    const toDate = formData.ToDate ? new Date(formData.ToDate).toISOString() : ''

    const body = {
      deviceId: formData.Devices, // Use the device ID from the form data
      FromDate: fromDate,
      ToDate: toDate,
    }

    // console.log(formData)
    // console.log(token)
    // // console.log(body);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/history/show-only-device-trips-startingpoint-endingpoint?deviceId=${body.deviceId}&from=${body.FromDate}&to=${body.ToDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      // console.log(response.data.deviceDataByTrips[0]);

      if (response.status == 200) {
        setApiData(response.data)
        setStatusLoading(false)
        console.log(response.data.finalTrip)
      }

      // Assuming the data returned is what you want to display in the table
      console.log('Form submitted with data:', body)
    } catch (error) {
      setError(error.message)
      setStatusLoading(false)
      console.error('Error submitting form:', error)
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

  // fix this error in the upcoming update
  // if (error) return <Page404 />

  return (
    <>
      <Toaster />
      <CRow className="pt-3 gutter-0">
        <CCol xs={12} md={12} className="px-4">
          <CCard className="mb-4 p-0 shadow-lg rounded">
            <CCardHeader
              className="d-flex justify-content-between align-items-center text-white"
              style={{ backgroundColor: '#0a2d63' }}
            >
              <strong>Trips Report</strong>
            </CCardHeader>
            <CCardBody>
              <SearchTrip
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                users={users}
                getGroups={getGroups}
                groups={groups}
                devices={devices}
                loading={loading}
                getDevices={getDevices}
                columns={columns}
                showMap={showMap}
                setShowMap={setShowMap}
                handlePutName={handlePutName}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {showMap && (
        <CRow className="justify-content-center mt-4 gutter-0">
          <CCol xs={12} className="px-4">
            <CCard className="p-0 mb-4 shadow-sm">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <strong>Trips Data {selectedDeviceName && `for ${selectedDeviceName}`}</strong>
                {/* <CFormInput
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '250px' }}
                /> */}
              </CCardHeader>
              <CCardBody>
                <TripTable
                  apiData={apiData}
                  selectedColumns={selectedColumns}
                  statusLoading={statusLoading}
                  selectedDeviceName={selectedDeviceName}
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
      )}
    </>
  )
}

export default Trips
