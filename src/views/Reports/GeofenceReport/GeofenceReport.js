import React, { useEffect, useState } from 'react'
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
} from '@coreui/react'
import Select from 'react-select'
import Cookies from 'js-cookie'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'
import * as XLSX from 'xlsx' // For Excel export
import jsPDF from 'jspdf' // For PDF export
import { saveAs } from 'file-saver'
import autoTable from 'jspdf-autotable'
import { auto } from '@popperjs/core'
import Loader from '../../../components/Loader/Loader'
import '../style/remove-gutter.css'
import '../../../utils.css'
import { IoSearchSharp } from 'react-icons/io5'
import { IconButton, InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { FaRegFilePdf, FaPrint } from 'react-icons/fa6'
import { PiMicrosoftExcelLogo } from 'react-icons/pi'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaArrowUp } from 'react-icons/fa'
import toast, { Toaster } from 'react-hot-toast'
import { jwtDecode } from 'jwt-decode'
import ExcelJS from 'exceljs'
import IconDropdown from '../../../components/ButtonDropdown'
const accessToken = Cookies.get('authToken')
const decodedToken = jwtDecode(accessToken)

const SearchGeofence = ({
  formData,
  handleInputChange,
  handleSubmit,
  users,
  getGroups,
  groups,
  devices,
  loading,
  getDevices,
  setShowMap,
  handlePutName,
}) => {
  const [validated, setValidated] = useState(false)
  const [showDateInputs, setShowDateInputs] = useState(false) // State to manage button text
  const [buttonText, setButtonText] = useState('SHOW NOW')
  const [isDropdownOpen, setDropdownOpen] = useState(false) // State to manage dropdown visibility
  const [selectedU, setSelectedU] = useState()
  const [selectedG, setSelectedG] = useState()

  // For username show in pdf
  const [putName, setPutName] = useState('')

  useEffect(() => {
    handlePutName(putName)
  }, [putName])

  const allDevicesOption = { value: 'all', label: 'All Vehicles' } // Define an option for "All Devices"

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
    console.log('handle submit ke pass hu')
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
    } else {
      event.preventDefault()
      handleSubmit()
      setShowMap(true) // Show the map
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
            console.log('Selected user:', selectedUser)
            getGroups(selectedUser)
          }}
          isLoading={loading} // Optionally show a loading spinner
          placeholder="Choose a user..."
        />
        <CFormFeedback invalid>Please provide a valid user.</CFormFeedback>
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

        <CFormFeedback invalid>Please provide a valid group.</CFormFeedback>
      </CCol>

      <CCol md={3}>
        <CFormLabel htmlFor="devices">Vehicles</CFormLabel>
        <Select
          id="devices"
          isMulti
          options={[
            allDevicesOption,
            ...devices.map((device) => ({ value: device.deviceId, label: device.name })),
          ]}
          onChange={(selectedOptions) => {
            // Step 2: Check if "All Devices" is selected
            if (selectedOptions.some((option) => option.value === 'all')) {
              // If "All Devices" is selected, select all device IDs
              const allDeviceIds = devices.map((device) => device.deviceId)
              handleInputChange('Devices', allDeviceIds) // Store all device IDs
            } else {
              // Otherwise, store the selected device IDs
              const selectedDeviceIds = selectedOptions.map((option) => option.value)
              handleInputChange('Devices', selectedDeviceIds)
            }
          }}
          placeholder="Choose Vehicles..."
          isClearable={true}
        />
        <CFormFeedback invalid>Please provide valid vehicles.</CFormFeedback>
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
              style={{ backgroundColor: '#0a2d63' }}
              type="submit"
              onClick={() => handleDropdownClick('SHOW NOW')}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </CCol>
    </CForm>
  )
}

const ShowGeofence = ({
  statusLoading,
  apiData,
  selectedColumns,
  columns,
  devices,
  searchQuery,
  selectedDeviceName,
  selectedGroupName,
  selectedUserName,
  selectedFromDate,
  selectedToDate,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [addressCache, setAddressCache] = useState({}) // Cache addresses to avoid multiple API calls

  console.log('devicessssssssssasdadwssss', devices) // Devices list

  // if (!apiData) return <><Loader></>; // Show loading state
  // if (!Array.isArray(apiData) || apiData.length === 0) return <div>No Data Available</div>;

  const renderColumnData = (data, column) => {
    switch (column) {
      case 'Name':
        return data.name
      case 'Type':
        return data.type
      case 'Message':
        return data.message
      case 'Location':
        const [lat, lng] = data.location || []
        if (!lat || !lng) return 'Coordinates not available'

        const key = `${lat},${lng}`
        if (addressCache[key]) {
          return addressCache[key] // Return cached address
        }

        // Fetch address asynchronously and update cache
        getAddressFromLatLng(lat, lng).then((address) => {
          setAddressCache((prev) => ({ ...prev, [key]: address }))
        })

        return 'Fetching address...' // Temporary placeholder
      case 'Created At':
        return new Date(data.createdAt).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false, // Use 24-hour format
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      default:
        return '-'
    }
  }

  // Address convertor

  const getAddressFromLatLng = async (latitude, longitude) => {
    const apiKey = 'CWVeoDxzhkO07kO693u0';
    const url = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}`; // ✅ MapTiler URL

    try {
      const response = await axios.get(url);

      // ✅ Extract the address from MapTiler's API response
      const address = response.data?.features?.[0]?.place_name || 'Address not found';

      return address;
    } catch (error) {
      console.error('Error fetching address: ', error.message);
      return 'Address not found';
    }
  };


  // ###################

  const findDeviceName = (deviceId) => {
    const device = devices.find((d) => d.deviceId === deviceId.toString())
    return device ? device.name : 'Unknown Device'
  }

  // Search vehicle in result portion for fillteraion

  const filteredData = (Array.isArray(apiData) ? apiData : []).filter((data) => {
    // Loop through each column in selectedColumns (or use default columns if no selected columns)
    return (selectedColumns.length > 0 ? selectedColumns : columns).some((col) => {
      // Get the value of the current column for this row
      const cellValue = renderColumnData(data, col).toString().toLowerCase()

      // Check if the cell value contains the search query (case-insensitive)
      return cellValue.includes(searchQuery.toLowerCase())
    })
  })

  // Column to data key mapping
  const columnKeyMap = {
    Name: 'name',
    Type: 'type',
    Message: 'message',
    Location: 'location',
    'Created At': 'createdAt',
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
    if (!filteredData) return []
    const data = [...filteredData]

    if (sortConfig.key) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        // Handle date sorting
        if (sortConfig.key === 'createdAt') {
          return sortConfig.direction === 'asc'
            ? new Date(aValue) - new Date(bValue)
            : new Date(bValue) - new Date(aValue)
        }

        // Handle string sorting
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        return 0
      })
    }
    return data
  }, [filteredData, sortConfig])

  // Function to export table data to Excel
  const exportToExcel = async () => {
    try {
      // Validate data before proceeding
      if (!Array.isArray(sortedData) || sortedData.length === 0) {
        throw new Error('No data available for Excel export')
      }

      // Configuration constants for styling and company information
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
        company: {
          name: 'Credence Tracker',
          copyright: `© ${new Date().getFullYear()} Credence Tracker`,
        },
      }

      // Helper functions to format date and coordinates (if needed)
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
      const worksheet = workbook.addWorksheet('Geofence Report')

      // Add header section with company and report info
      const addHeaderSection = () => {
        // Company title row
        const titleRow = worksheet.addRow([CONFIG.company.name])
        titleRow.font = { ...CONFIG.styles.titleFont, color: { argb: 'FFFFFFFF' } }
        titleRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: CONFIG.styles.primaryColor },
        }
        titleRow.alignment = { horizontal: 'center' }
        worksheet.mergeCells('A1:' + String.fromCharCode(65 + (dynamicColumnCount() + 1)) + '1')

        // Report subtitle
        const subtitleRow = worksheet.addRow(['Geofence Report'])
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
        worksheet.mergeCells('A2:' + String.fromCharCode(65 + (dynamicColumnCount() + 1)) + '2')

        // Additional metadata (adjust according to your available variables)
        worksheet.addRow([`Generated by: ${decodedToken.username || 'N/A'}`])
        worksheet.addRow([
          `User: ${selectedUserName || 'N/A'}`,
          `Group: ${selectedGroupName || 'N/A'}`,
        ])
        worksheet.addRow([
          `Date Range: ${selectedFromDate && selectedToDate
            ? `${selectedFromDate} - ${selectedToDate}`
            : getDateRangeFromPeriod(selectedPeriod)
          }`,
        ])
        worksheet.addRow([`Generated: ${new Date().toLocaleString()}`])
        worksheet.addRow([]) // Spacer row
      }

      // Calculate how many columns will be in the export.
      // This is used for merging header cells.
      const dynamicColumnCount = () => {
        // First column is always SN, then the rest come from selectedColumns (if any) or fallback to columns array.
        return (selectedColumns && selectedColumns.length > 0 ? selectedColumns : columns).length
      }

      // Add the data table section with the same columns and data as the UI table
      const addDataTable = () => {
        // Determine which columns to export: use the dynamic ones if available
        const exportColumns =
          selectedColumns && selectedColumns.length > 0 ? selectedColumns : columns

        // Build header row: first column is SN, then the other columns
        const headerRowValues = ['SN', ...exportColumns]
        const headerRow = worksheet.addRow(headerRowValues)
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

        // Add the data rows – use the same data transformation as the UI table
        sortedData.forEach((data, index) => {
          // Start with the serial number
          const rowData = [index + 1]
          // Then push each cell value based on renderColumnData (assumed to be the same function used in the table)
          exportColumns.forEach((col) => {
            // If you need to handle special formatting per column,
            // you could replicate any extra logic here (for example, date formatting).
            // Otherwise, simply call your renderColumnData function.
            rowData.push(renderColumnData(data, col))
          })

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

        // Optionally, set a width for each column (adjust as needed)
        // The first column (SN) width
        worksheet.getColumn(1).width = 8
        // Other columns: you could set a default width or customize based on the header
        exportColumns.forEach((col, i) => {
          worksheet.getColumn(i + 2).width = 25 // Adjust width as desired
        })
      }

      // Add a footer row with company copyright info
      const addFooter = () => {
        worksheet.addRow([]) // Spacer
        const footerRow = worksheet.addRow([CONFIG.company.copyright])
        footerRow.font = { italic: true }
        // Merge footer across all columns (SN + dynamic columns)
        const lastColLetter = String.fromCharCode(65 + dynamicColumnCount())
        worksheet.mergeCells(`A${footerRow.number}:${lastColLetter}${footerRow.number}`)
      }

      // Build the document
      addHeaderSection()
      addDataTable()
      addFooter()

      // Generate and save the file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const filename = `Geofence_Report_${new Date().toISOString().split('T')[0]}.xlsx`
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

      // Constants and configuration (same as before)
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

      // Use the same columns as your table:
      // If selectedColumns is non-empty, use it; otherwise, use the full columns list.
      const tableColumns = selectedColumns && selectedColumns.length > 0 ? selectedColumns : columns

      // Build the PDF columns: Always include SN as the first column.
      const pdfColumns = ['SN', ...tableColumns]

      // Mapping for column widths (adjust as needed)
      // You can still provide custom widths for known columns.
      const columnWidths = {
        SN: 10,
        'Vehicle Name': 22,
        'Vehicle Status': 22,
        'Start Date Time': 25,
        'Start Address': 35,
        'Start Coordinates': 25,
        'End Date Time': 25,
        'End Address': 35,
        'End Coordinates': 25,
        'Total Distance': 20,
        Duration: 20,
        'Maximum Speed': 20,
      }

      // Build column styles based on pdfColumns.
      const autoTableColumnStyles = {}
      pdfColumns.forEach((col, index) => {
        if (columnWidths[col]) {
          autoTableColumnStyles[index] = { cellWidth: columnWidths[col] }
        }
      })

      // Helper function to build row data for the PDF.
      // It uses the same renderColumnData function as your table.
      const getRowData = (item, index) => {
        // Start with serial number
        const row = [index + 1]
        // For every column that appears in the table, render its data.
        tableColumns.forEach((col) => {
          // Call your existing renderColumnData function.
          // If it returns a React element, you may need to extract the text,
          // so ensure that it returns a string or a value that can be rendered in the PDF.
          const cellData = renderColumnData(item, col)
          row.push(cellData || '--')
        })
        return row
      }

      // Initialize jsPDF document (landscape orientation, A4, mm)
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Helper functions to apply colors
      const applyPrimaryColor = () => {
        doc.setFillColor(...CONFIG.colors.primary)
        doc.setTextColor(...CONFIG.colors.primary)
      }

      const applySecondaryColor = () => {
        doc.setTextColor(...CONFIG.colors.secondary)
      }

      // Add header (company logo, name, and a line)
      const addHeader = () => {
        // Company logo (here represented by a filled rectangle)
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

        // Header line across the page
        doc.setDrawColor(...CONFIG.colors.primary)
        doc.setLineWidth(0.5)
        doc.line(CONFIG.layout.margin, 25, doc.internal.pageSize.width - CONFIG.layout.margin, 25)
      }

      // Add metadata (user, group, date range, vehicle, etc.)
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
        const xPosition = CONFIG.layout.margin
        const lineHeight = CONFIG.layout.lineHeight

        metadata.forEach((item) => {
          doc.text(`${item.label} ${item.value.toString()}`, xPosition, yPosition)
          yPosition += lineHeight
        })
      }

      // Add footer with copyright text and page numbers
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

      // Build the PDF document
      addHeader()

      // Title and generated date information
      doc.setFontSize(24)
      doc.setFont(CONFIG.fonts.primary, 'bold')
      doc.text('Geofence Report', CONFIG.layout.margin, 35)

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

      // Prepare table data:
      // Build table rows by mapping sortedData through our getRowData helper.
      const tableRows = sortedData.map((item, index) => getRowData(item, index))

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
        columnStyles: autoTableColumnStyles,
        margin: { left: CONFIG.layout.margin, right: CONFIG.layout.margin },
        didDrawPage: (data) => {
          // On subsequent pages, add a small header
          if (doc.getCurrentPageInfo().pageNumber > 1) {
            doc.setFontSize(15)
            doc.setFont(CONFIG.fonts.primary, 'bold')
            doc.text('Geofence Report', CONFIG.layout.margin, 10)
          }
        },
      })

      addFooter()

      // Save the PDF file
      const filename = `Geofence_Report_${new Date().toISOString().split('T')[0]}.pdf`
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
      <Toaster />
      <CTable bordered className="custom-table" style={{ overflowX: 'auto' }}>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell style={{ backgroundColor: '#0a2d63', color: 'white' }}>
              SN
            </CTableHeaderCell>
            {(selectedColumns.length > 0 ? selectedColumns : columns).map((col, index) => (
              <CTableHeaderCell
                key={index}
                style={{
                  backgroundColor: '#0a2d63',
                  color: 'white',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort(col)}
              >
                {col}
                {sortConfig.key === columnKeyMap[col] && (
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
                colSpan={selectedColumns.length + 6}
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
            sortedData.map((data, index) => (
              <CTableRow key={index}>
                <CTableDataCell
                  style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                >
                  {index + 1}
                </CTableDataCell>
                {selectedColumns.length > 0
                  ? selectedColumns.map((col, colIndex) => (
                    <CTableDataCell
                      key={colIndex}
                      style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                    >
                      {renderColumnData(data, col)}
                    </CTableDataCell>
                  ))
                  : columns.map((col, colIndex) => (
                    <CTableDataCell
                      key={colIndex}
                      style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                    >
                      {renderColumnData(data, col)}
                    </CTableDataCell>
                  ))}
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell
                colSpan={selectedColumns.length + 6}
                style={{
                  backgroundColor: '#f8f9fa', // Light gray background
                  color: '#6c757d', // Darker text color
                  fontStyle: 'italic', // Italic font style
                  padding: '16px', // Extra padding for emphasis
                  textAlign: 'center', // Center the text
                  border: '1px dashed #dee2e6', // Dashed border to highlight it
                }}
              >
                No data available
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      <div className="position-fixed bottom-0 end-0 mb-5 m-3 z-5">
        <IconDropdown items={dropdownItems} />
      </div>
    </>
  )
}

const GeofenceReports = () => {
  const [formData, setFormData] = useState({
    Devices: [],
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
  const [showMap, setShowMap] = useState(false)

  const [columns] = useState(['Name', 'Type', 'Message', 'Location', 'Created At'])
  const [selectedColumns, setSelectedColumns] = useState([])
  const [apiData, setApiData] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const accessToken = Cookies.get('authToken')
  const token = Cookies.get('authToken')

  const [selectedUserName, setSelectedUserName] = useState('')
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
          headers: { Authorization: `Bearer ${accessToken}` },
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
        headers: { Authorization: `Bearer ${accessToken}` },
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
      setLoading(false)
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
    }
  }

  const getUser = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        headers: { Authorization: `Bearer ${accessToken}` },
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
      console.error('Error fetching data:', error)
      throw error
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
    const body = {
      deviceId: formData.Devices,
      fromDate: formData.FromDate ? new Date(formData.FromDate).toISOString() : null,
      toDate: formData.ToDate ? new Date(formData.ToDate).toISOString() : null,
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/reports/geofence-by-time-range`,
        body,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      console.log('API response data:', response.data) // Debug log
      setApiData(response.data.data) // Ensure response.data is an array or contains reports
      setStatusLoading(false)
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
    <div>
      <CRow className="pt-3 gutter-0">
        <CCol xs={12} md={12} className="px-4">
          <CCard className="mb-4 p-0 shadow-lg rounded">
            <CCardHeader
              className="d-flex justify-content-between align-items-center text-white"
              style={{ backgroundColor: '#0a2d63' }}
            >
              <strong>Geofence Report</strong>
            </CCardHeader>
            <CCardBody>
              <SearchGeofence
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                users={users}
                getGroups={getGroups}
                groups={groups}
                getDevices={getDevices}
                devices={devices}
                loading={loading}
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
        <CRow className="justify-content-center mt-4 gutter-0">
          <CCol xs={12} className="px-4">
            <CCard className="p-0 mb-4 shadow-sm">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <strong>Geofence Report Results</strong>
                <div className="input-group" style={{ width: '300px' }}>
                  <CFormInput
                    placeholder="Search for Vehicle Number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <IconButton
                    className="bg-white rounded-end border disable"
                    style={{ height: '40px' }}
                  >
                    <SearchIcon />
                  </IconButton>
                </div>
              </CCardHeader>
              <CCardBody>
                <ShowGeofence
                  apiData={apiData}
                  selectedColumns={selectedColumns}
                  columns={columns}
                  devices={devices}
                  statusLoading={statusLoading}
                  searchQuery={searchQuery} // Passing searchQuery to ShowGeofence
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
    </div>
  )
}

export default GeofenceReports
