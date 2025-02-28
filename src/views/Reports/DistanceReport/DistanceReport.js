import React, { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

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
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

import jsPDF from 'jspdf' // For PDF export
import autoTable from 'jspdf-autotable'
import { auto } from '@popperjs/core'
import Loader from '../../../components/Loader/Loader'
import '../style/remove-gutter.css'
import { IconButton, InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import toast, { Toaster } from 'react-hot-toast'
import IconDropdown from '../../../components/ButtonDropdown'
import { FaRegFilePdf, FaPrint } from 'react-icons/fa6'
import { PiMicrosoftExcelLogo } from 'react-icons/pi'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaArrowUp } from 'react-icons/fa'

const accessToken = Cookies.get('authToken')
const decodedToken = jwtDecode(accessToken)

const SearchDistance = ({
  formData,
  handleInputChange,
  handleSubmit,
  users,
  getGroups,
  groups,
  devices,
  loading,
  getDevices,
  columns,
  showMap,
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

  const allDevicesOption = { value: 'all', label: 'All Vehilces' } // Define an option for "All Devices"
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
            console.log('Selected user:', selectedUser)
            getGroups(selectedUser)
          }}
          placeholder="Choose a user..." // Displayed when no value is selected
          isLoading={loading} // Optional loading spinner
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
          placeholder="Choose a group..." // Displayed when no value is selected
          isLoading={loading} // Shows a loading spinner during fetching
        />

        <CFormFeedback invalid>Please provide a valid device.</CFormFeedback>
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
          placeholder="Choose Vehilces..."
          isClearable={true}
        />
        <CFormFeedback invalid>Please provide valid Vehicles.</CFormFeedback>
      </CCol>
      {/* Date Inputs for From Date and To Date */}
      <CCol md={2}>
        <CFormLabel htmlFor="fromDate">From Date</CFormLabel>
        <CFormInput
          type="date"
          id="fromDate"
          // value={formData.FromDate ? formData.FromDate.slice(0, 16) : ''} // Display local datetime value
          onChange={(e) => handleDateChange('FromDate', e.target.value)} // Use handleDateChange for conversion
          required
        />
        <CFormFeedback invalid>Please provide a valid from date.</CFormFeedback>
      </CCol>
      <CCol md={2}>
        <CFormLabel htmlFor="toDate">To Date</CFormLabel>
        <CFormInput
          type="date"
          id="toDate"
          // value={formData.ToDate ? formData.ToDate.slice(0, 16) : ''} // Display local datetime value
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

const ShowDistance = ({
  apiData,
  distanceLoading,
  selectedColumns,
  allDates,
  devices,
  searchQuery,
  selectedGroupName,
  selectedUserName,
  selectedFromDate,
  selectedToDate,
  selectedDeviceName,
}) => {
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [addressData, setAddressData] = useState({})
  const [newAddressData, setnewAddressData] = useState()

  console.log('devicessssssssssasdadwssss', devices) // Devices Lists

  // Function to get address based on latitude and longitude using Nominatim API
  const getAddress = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      )
      if (response.data) {
        console.log('Fetched address:', response.data.display_name) // Debugging: log the address
        return response.data.display_name // Return display_name
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

  allDates && console.log('yaha bhi sahi hai dates', allDates)

  const calculateTotalDistance = (row) => {
    return allDates.reduce((total, date) => {
      const distance = parseFloat(row[date]) || 0 // Convert to float and handle 'undefined' values
      return total + distance
    }, 0) // Initial total is 0
  }

  const findDeviceName = (deviceId) => {
    const device = devices.find((d) => d.deviceId === deviceId.toString())
    return device ? device.name : 'Unknown Device'
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
          ...allDates.map((date) => ({ header: date, width: 20 })),
          { header: 'Total Distance', width: 20 },
        ],
        company: {
          name: 'Credence Tracker',
          copyright: `© ${new Date().getFullYear()} Credence Tracker`,
        },
      }

      // Initialize workbook and worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Distance Report')

      // Add header section
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
        worksheet.mergeCells(`A1:${String.fromCharCode(65 + CONFIG.columns.length - 1)}1`)

        // Report title
        const subtitleRow = worksheet.addRow(['Distance Report'])
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
        worksheet.mergeCells(`A2:${String.fromCharCode(65 + CONFIG.columns.length - 1)}2`)

        // Metadata
        worksheet.addRow([`User: ${decodedToken.username || 'N/A'}`])
        worksheet.addRow([`Selected User: ${selectedUserName || 'N/A'}`])
        worksheet.addRow([`Group: ${selectedGroupName || 'N/A'}`])
        worksheet.addRow([`Date Range: ${selectedFromDate} To ${selectedToDate}`])
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
        sortedData.forEach((row, index) => {
          const rowData = [
            index + 1,
            findDeviceName(row.deviceId),
            ...allDates.map((date) => (row[date] ? `${row[date]} km` : '0 km')),
            `${calculateTotalDistance(row).toFixed(2)} km`,
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
        worksheet.mergeCells(
          `A${footerRow.number}:${String.fromCharCode(65 + CONFIG.columns.length - 1)}${footerRow.number}`,
        )
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
      const filename = `Distance_Report_${new Date().toISOString().split('T')[0]}.xlsx`
      saveAs(blob, filename)
      toast.success('Excel file downloaded successfully')
    } catch (error) {
      console.error('Excel Export Error:', error)
      toast.error(error.message || 'Failed to export Excel file')
    }
  }

  // Export to PDF function
  const exportToPDF = () => {
    try {
      if (!Array.isArray(sortedData) || sortedData.length === 0) {
        throw new Error('No data available for PDF export')
      }

      const CONFIG = {
        colors: {
          primary: [10, 45, 99],
          secondary: [70, 70, 70],
          accent: [0, 112, 201],
          border: [220, 220, 220],
          background: [249, 250, 251],
        },
        company: { name: 'Credence Tracker', logo: { x: 15, y: 15, size: 8 } },
        layout: { margin: 15, pagePadding: 15, lineHeight: 6 },
        fonts: {
          primary: 'helvetica',
          secondary: 'courier',
        },
      }

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const applySecondaryColor = () => {
        doc.setTextColor(...CONFIG.colors.secondary)
      }

      const addHeader = () => {
        //Company logo and name
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

      // Main document creation
      addHeader()

      // Title and date
      doc.setFontSize(24)
      doc.setFont(CONFIG.fonts.primary, 'bold')
      doc.text('Distance Report', CONFIG.layout.margin, 35)

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
      const tableColumns = ['SN', 'Vehicle Name', ...allDates, 'Total Distance']
      const tableRows = sortedData.map((row, index) => [
        index + 1,
        findDeviceName(row.deviceId),
        ...allDates.map((date) => (row[date] ? `${row[date]} km` : '0 km')),
        `${calculateTotalDistance(row).toFixed(2)} km`,
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
          0: { cellWidth: 10 }, // SN column
          1: { cellWidth: 30 }, // Vehicle Name
          [tableColumns.length - 1]: { cellWidth: 25 }, // Total Distance
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
      doc.save(`Distance_Report_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF Export Error:', error)
      toast.error(error.message || 'Failed to export PDF')
    }
  }

  // Filter logic
  const filteredData =
    apiData?.data?.filter((row) => {
      const deviceName = findDeviceName(row.deviceId)?.toLowerCase() || ''
      const searchTerm = searchQuery.toLowerCase()

      // Check if the searchQuery matches the device name or any other relevant fields
      return deviceName.includes(searchTerm)
    }) || []

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortOrder === 'asc'
    setSortOrder(isAsc ? 'desc' : 'asc')
    setSortBy(column)
  }

  // Add this sorting logic after the filteredData declaration
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0

    // Helper function to get comparable values
    const getValue = (row) => {
      switch (sortBy) {
        case 'Vehicle':
          return findDeviceName(row.deviceId).toLowerCase()
        case 'Total Distance':
          return calculateTotalDistance(row)
        default:
          return 0
      }
    }

    const aValue = getValue(a)
    const bValue = getValue(b)

    // Handle string or number comparison
    if (typeof aValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    } else {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }
  })

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
      <div style={{ overflowX: 'auto', maxWidth: '100%' }} className="gutter-0">
        <CTable bordered className="custom-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell
                style={{
                  width: '70px',
                  minWidth: '70px',
                  backgroundColor: '#0a2d63',
                  color: 'white',
                }}
                className="text-center"
              >
                Sr No.
              </CTableHeaderCell>
              <CTableHeaderCell
                style={{
                  backgroundColor: '#0a2d63',
                  color: 'white',
                  cursor: 'pointer', // Add pointer cursor
                }}
                className="text-center"
                onClick={() => handleSort('Vehicle')} // Add click handler
              >
                Vehicles Name
                {sortBy === 'Vehicle' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </CTableHeaderCell>
              {/* Dynamically render table headers based on selected columns */}

              {allDates?.map((date, index) => (
                <CTableHeaderCell
                  key={index}
                  style={{
                    width: '110px',
                    minWidth: '110px',
                    backgroundColor: '#0a2d63',
                    color: 'white',
                  }}
                  className="text-center"
                >
                  {date}
                </CTableHeaderCell>
              ))}
              <CTableHeaderCell
                style={{
                  width: '70px',
                  minWidth: '150px',
                  backgroundColor: '#0a2d63',
                  color: 'white',
                  cursor: 'pointer', // Add pointer cursor
                }}
                onClick={() => handleSort('TotalDistance')} // Add click handler
                className="text-center"
              >
                Total Distance
                {sortBy === 'TotalDistance' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {distanceLoading ? (
              <CTableRow style={{ position: 'relative' }}>
                <CTableDataCell
                  colSpan={allDates.length + 3}
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
              sortedData.map((row, rowIndex) => (
                <CTableRow key={row.deviceId} className="custom-row">
                  <CTableDataCell
                    style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                    className="text-center"
                  >
                    {rowIndex + 1}
                  </CTableDataCell>
                  <CTableDataCell
                    style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                    className="text-center"
                  >
                    {findDeviceName(row.deviceId)}
                  </CTableDataCell>

                  {/* Dynamically render table cells based on the date range */}
                  {allDates.map((date, index) => (
                    <CTableDataCell
                      key={index}
                      style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                      className="text-center"
                    >
                      {/* Check if the date exists in the row, otherwise print '0' */}
                      {row[date] !== undefined ? `${row[date]} km` : '0 km'}
                    </CTableDataCell>
                  ))}
                  <CTableDataCell
                    style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                    className="text-center"
                  >
                    {calculateTotalDistance(row).toFixed(2)}
                    <span> km</span>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell
                  colSpan={allDates.length + 3}
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
      </div>

      <div className="position-fixed bottom-0 end-0 mb-5 m-3 z-5">
        <IconDropdown items={dropdownItems} />
      </div>
    </>
  )
}

const Distance = () => {
  const [formData, setFormData] = useState({
    Devices: [],
    Details: '',
    Periods: '',
    FromDate: '',
    ToDate: '',
    Columns: [],
  }) // Change Devices to an array
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState()
  const [groups, setGroups] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(false)
  const accessToken = Cookies.get('authToken')
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
    'Driver Name',
    'Driver Phone No.',
  ])
  const [selectedColumns, setSelectedColumns] = useState([])
  const token = Cookies.get('authToken') //
  const [apiData, setApiData] = useState() //data from api
  const [distanceLoading, setDistanceLoading] = useState(false)

  const [allDates, setAllDates] = useState([])
  const formatDate = (date) => {
    return date.toLocaleDateString('en-CA') // This formats as YYYY-MM-DD
  }

  useEffect(() => {
    // Function to generate an array of dates between startDate and endDate
    const generateDateArray = (start, end) => {
      const arr = []
      let currentDate = new Date(start)
      const lastDate = new Date(end)

      while (currentDate <= lastDate) {
        arr.push(formatDate(new Date(currentDate))) // Format date and add to array
        currentDate.setDate(currentDate.getDate() + 1) // Increment date by one day
      }

      return arr
    }

    // Ensure the dates are valid and create the date array
    if (formData.FromDate && formData.ToDate) {
      const dates = generateDateArray(formData.FromDate, formData.ToDate)
      setAllDates(dates)
      console.log('All formatted dates: ', dates)
    }
  }, [formData.FromDate, formData.ToDate])

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
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })

      if (response.data) {
        const fetchedUsers = response.data.users
        setUsers(fetchedUsers) // Update the state with fetched users

        // Use fetchedUsers directly to find the selected user
        const selectedUser = fetchedUsers.find((user) => user.userId === formData.User)
        const selectedUserName = selectedUser ? selectedUser.username : ''
        setSelectedUserName(selectedUserName)

        console.log('Selected User:', selectedUserName)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false) // Ensure loading state is reset in case of success or failure
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
    setDistanceLoading(true)
    console.log('DataAll', formData)
    // For FromDate: Set time to 00:00:00 (start of the day)
    const fromDate = formData.FromDate
      ? new Date(
        new Date(formData.FromDate).setHours(0, 0, 0, 0) + (5 * 60 + 30) * 60000
      ).toISOString()
      : '';

    // For ToDate: Set time to 23:59:59.999 (end of the day) and adjust for UTC+5:30
    const toDate = formData.ToDate
      ? new Date(
        new Date(formData.ToDate).setHours(23, 59, 59, 999) + (5 * 60 + 30) * 60000
      ).toISOString()
      : '';


    const body = {
      deviceIds: formData.Devices, // Convert array to comma-separated string
      // period: formData.Periods,
      startDate: fromDate,
      endDate: toDate,
    }
    console.log(token)
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/reports/distance`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.status === 200) {
        console.log(response.data.data)
        setApiData(response.data)
        setDistanceLoading(false)
      }
    } catch (error) {
      setDistanceLoading(false)
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
              style={{ backgroundColor: '#0a2d63' }}
            >
              <strong>Distance Report</strong>
            </CCardHeader>
            <CCardBody>
              <SearchDistance
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
        <CRow className="justify-content-center mt-4 gutter-0">
          <CCol xs={12} className="px-4">
            <CCard className="p-0 mb-4 shadow-sm">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <strong>
                  All Distance Report List {selectedDeviceName && `for ${selectedDeviceName}`}
                </strong>{' '}
                {/* Show the device name here */}
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
                <ShowDistance
                  apiData={apiData}
                  distanceLoading={distanceLoading}
                  allDates={allDates}
                  devices={devices}
                  selectedColumns={selectedColumns}
                  searchQuery={searchQuery}
                  selectedDeviceName={selectedDeviceName}
                  selectedGroupName={selectedGroupName}
                  selectedUserName={putName}
                  selectedFromDate={selectedFromDate}
                  selectedToDate={selectedToDate}
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}
export default Distance
