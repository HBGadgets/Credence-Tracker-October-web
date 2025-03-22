// ##################################### New Alerts With address ################################################### //

import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CFormLabel,
  CTableRow,
} from '@coreui/react'
import { Pagination } from 'react-bootstrap'
import Select from 'react-select'
import {
  Paper,
  TableContainer,
  IconButton,
  InputBase,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
// import '../../../utils.css'
import SearchIcon from '@mui/icons-material/Search'
import { useParams } from 'react-router-dom'
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
import Loader from '../../../components/Loader/Loader'

const accessToken = Cookies.get('authToken')
const decodedToken = jwtDecode(accessToken)

const Alerts = () => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const { deviceId: urlDeviceId, category, name } = useParams() // Retrieve params from URL
  const [deviceId, setDeviceId] = useState(urlDeviceId || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [notificationIDs, setNotificationIDs] = useState()
  const [filteredData, setFilteredData] = useState([])
  const [devices, setDevices] = useState([])
  const [filterDevice, setFilterDevice] = useState('') // State for device filter
  const [filterType, setFilterType] = useState('') // State for selected filter
  const [currentPage, setCurrentPage] = useState(1) // Current page number
  const [rowsPerPage, setRowsPerPage] = useState(20) // Rows per page
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const accessToken = Cookies.get('authToken')
  const [selectedD, setSelectedD] = useState()
  const [error, setError] = useState(null)

  const notificationTypes = [
    'deviceMoving',
    'ignitionOn',
    'ignitionOff',
    'deviceStopped',
    'geofenceExited',
    'geofenceEntered',
    'speedLimitExceeded',
    'statusOnline',
    'statusOffline',
    'statusUnknown',
    'deviceActive',
    'deviceInactive',
    'fuelDrop',
    'fuelIncrease',
    'alarm',
    'maintenanceRequired',
  ]

  const getDevices = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/device`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const newApiData = response.data.devices
      const deviceNames = newApiData.map((device) => device.name)
      setDevices(deviceNames)
      setLoading(false)
    } catch (error) {
      setError(error.message)
      console.error('Error fetching data:', error)
      // setLoading(false)
    }
  }

  // Transform devices to the format react-select expects
  const deviceOptions = devices.map((device) => ({
    value: device,
    label: device,
  }))

  const fetchNotificationData = async (page = 1) => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/notifications?page=${page}&limit=1000`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })

      if (response.data) {
        const deviceIds = response.data.notifications.map(
          (notification) => notification.deviceId.deviceId,
        )
        setNotificationIDs(deviceIds)
        getAlerts(deviceIds)
        console.log(deviceIds)
      }
    } catch (error) {
      setError(error.message)
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
    }
  }

  useEffect(() => {
    fetchNotificationData()
    getDevices()
  }, [rowsPerPage, filterDevice, filterType, searchQuery])

  const getAlerts = async (deviceIds) => {

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/alerts?deviceIds=${deviceIds}&limit=1000&types=`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })

      if (response.data.alerts) {
        // Fetch addresses for each alert
        const updatedData = await Promise.all(
          response.data.alerts.map(async (alert) => {
            const address = await getAddressFromLatLng(alert.location[1], alert.location[0])
            return { ...alert, address } // Append address to the alert
          }),
        )
        setData(updatedData)
        setLoading(false)
      }
    } catch (error) {
      // setLoading(false)
      setError(error.message)
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
    }
  }

  // Function to get address from latitude and longitude
  const getAddressFromLatLng = async (latitude, longitude) => {
    const apiKey = 'CWVeoDxzhkO07kO693u0';
    // const url = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}`
    try {
      const response = await axios.get(url);
      const address = response.data?.features?.[0]?.place_name || 'Address not found'; // ✅ Updated to match MapTiler's response structure
      return address;
    } catch (error) {
      console.error('Error fetching address: ', error);
      return 'Address not found';
    }
  };


  // Filter data whenever filterType or searchQuery changes
  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        (!filterType || item.type === filterType) &&
        (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.message?.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    setFilteredData(filtered)
  }, [filterType, searchQuery, data])

  // pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }
  // Handle change of rows per page
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value))
    setCurrentPage(1) // Reset to first page when changing rows per page
  }

  const handleDeviceChange = (selectedOption) => {
    setDeviceId(selectedOption ? selectedOption.value : '')
    setFilterDevice(selectedOption)
  }

  console.log(devices)

  const columnKeyMap = {
    'Device Name': 'name',
    Notification: 'type',
    Location: 'address',
    Message: 'message',
    'Date/Time': 'eventTime',
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
    const data = [...filteredData]
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (sortConfig.key === 'eventTime') {
          return sortConfig.direction === 'asc'
            ? new Date(aValue) - new Date(bValue)
            : new Date(bValue) - new Date(aValue)
        }

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      })
    }
    return data
  }, [filteredData, sortConfig])

  // Calculate paginated data
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Function to export table data to Excel
  // Function to export table data to Excel (Alerts and Events)
  const exportToExcel = async () => {
    try {
      // Filter the table data using the same logic as in the table
      const filteredData = paginatedData.filter((item) => {
        const query = searchQuery.toLowerCase()
        return (
          item.name?.toLowerCase().includes(query) ||
          item.type?.toLowerCase().includes(query) ||
          item.address?.toLowerCase().includes(query) ||
          item.message?.toLowerCase().includes(query)
        )
      })

      // Validate data before proceeding
      if (!Array.isArray(filteredData) || filteredData.length === 0) {
        throw new Error('No data available for Excel export')
      }

      // Excel configuration for Alerts and Events
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
          { header: 'Device Name', width: 25 },
          { header: 'Notification', width: 25 },
          { header: 'Location', width: 35 },
          { header: 'Message', width: 35 },
          { header: 'Date/Time', width: 25 },
        ],
        company: {
          name: 'Credence Tracker',
          copyright: `© ${new Date().getFullYear()} Credence Tracker`,
        },
      }

      // Helper function to format event date/time (same as the table display)
      const formatExcelDate = (dateString) => {
        if (!dateString) return '--'
        const date = new Date(dateString)
        return isNaN(date)
          ? '--'
          : date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
      }

      // Initialize workbook and worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Alerts and Events Report')

      // Add title and metadata header section
      const addHeaderSection = () => {
        // Company title
        const titleRow = worksheet.addRow([CONFIG.company.name])
        titleRow.font = { ...CONFIG.styles.titleFont, color: { argb: CONFIG.styles.textColor } }
        titleRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: CONFIG.styles.primaryColor },
        }
        titleRow.alignment = { horizontal: 'center' }
        worksheet.mergeCells('A1:F1')

        // Report title
        const subtitleRow = worksheet.addRow(['Alerts and Events Report'])
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
        worksheet.mergeCells('A2:F2')

        // Metadata (customize these as needed)
        worksheet.addRow([`Generated by: ${decodedToken.username || 'N/A'}`])

        worksheet.addRow([`Generated: ${new Date().toLocaleString()}`])
        worksheet.addRow([]) // Spacer row
      }

      // Add data table section
      const addDataTable = () => {
        // Add column headers using CONFIG.columns
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

        // Add data rows from the filtered data
        filteredData.forEach((item, index) => {
          const rowData = [
            index + 1,
            item.name || '--',
            item.type || '--',
            item.address || '--',
            item.message || '--',
            formatExcelDate(item.eventTime),
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

        // Set column widths and basic alignment
        worksheet.columns = CONFIG.columns.map((col) => ({
          width: col.width,
          style: { alignment: { horizontal: 'left' } },
        }))
      }

      // Add footer section (if desired)
      const addFooter = () => {
        worksheet.addRow([]) // Spacer
        const footerRow = worksheet.addRow([CONFIG.company.copyright])
        footerRow.font = { italic: true }
        worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`)
      }

      // Build the Excel document
      addHeaderSection()
      addDataTable()
      addFooter()

      // Generate and save the file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const filename = `Alerts_and_Events_Report_${new Date().toISOString().split('T')[0]}.xlsx`
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
      // Filter data to match the Alerts and Events table display
      const filteredData = paginatedData.filter((item) => {
        const query = searchQuery.toLowerCase()
        return (
          item.name?.toLowerCase().includes(query) ||
          item.type?.toLowerCase().includes(query) ||
          item.address?.toLowerCase().includes(query) ||
          item.message?.toLowerCase().includes(query)
        )
      })

      // Validate data before proceeding
      if (!Array.isArray(filteredData) || filteredData.length === 0) {
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
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Helper functions for colors
      const applyPrimaryColor = () => {
        doc.setFillColor(...CONFIG.colors.primary)
        doc.setTextColor(...CONFIG.colors.primary)
      }

      const applySecondaryColor = () => {
        doc.setTextColor(...CONFIG.colors.secondary)
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

      // Header: Company logo, name, and header line
      const addHeader = () => {
        // Company logo
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

        // Header line
        doc.setDrawColor(...CONFIG.colors.primary)
        doc.setLineWidth(0.5)
        doc.line(CONFIG.layout.margin, 25, doc.internal.pageSize.width - CONFIG.layout.margin, 25)
      }

      // Metadata block below the header
      const addMetadata = () => {
        const metadata = [
          { label: 'User:', value: decodedToken.username || 'N/A' },
          // { label: 'Device:', value: selectedDeviceName || 'N/A' },
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

      // Footer with copyright and page numbers
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

      // Main document creation
      addHeader()

      // Report title and current date
      doc.setFontSize(24)
      doc.setFont(CONFIG.fonts.primary, 'bold')
      doc.text('Alerts and Events Report', CONFIG.layout.margin, 35)

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

      // Prepare table data: Columns and Rows
      const tableColumns = ['SN', 'Device Name', 'Notification', 'Location', 'Message', 'Date/Time']

      const tableRows = filteredData.map((item, index) => [
        index + 1,
        item.name || '--',
        item.type || '--',
        item.address || '--',
        item.message || '--',
        formatDate(item.eventTime),
      ])

      // Generate table using autoTable
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
          3: { cellWidth: 35 },
          4: { cellWidth: 35 },
          5: { cellWidth: 25 },
        },
        margin: { left: CONFIG.layout.margin, right: CONFIG.layout.margin },
        didDrawPage: (data) => {
          // Add header on subsequent pages if needed
          if (doc.getCurrentPageInfo().pageNumber > 1) {
            doc.setFontSize(15)
            doc.setFont(CONFIG.fonts.primary, 'bold')
            doc.text('Alerts and Events Report', CONFIG.layout.margin, 10)
          }
        },
      })

      addFooter()

      // Save the PDF
      const filename = `Alerts_and_Events_Report_${new Date().toISOString().split('T')[0]}.pdf`
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

  // if (loading) return <Loader />
  if (error) return <Page404 />

  return (
    <div className="d-flex flex-column mx-md-3 mt-3 h-auto">
      <Toaster />
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Alerts and Events</strong>
              <div className="d-flex gap-3" style={{ width: '100%', maxWidth: '800px' }}>
                <div style={{ width: '500px' }}>
                  <Select
                    id="device-select"
                    value={deviceOptions.find((device) => device.value === deviceId)}
                    onChange={handleDeviceChange}
                    options={deviceOptions}
                    placeholder="Select a Vehicles"
                    style={{ height: '40px' }}
                  />
                </div>

                {/** Notification Types Dropdown */}
                <select
                  className="form-select"
                  style={{
                    width: '150px',
                    borderRadius: '4px',
                    height: '40px',
                  }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {notificationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                {/** Rows Per Page Dropdown */}
                <select
                  className="form-select"
                  style={{
                    width: '200px',
                    borderRadius: '4px',
                    height: '40px',
                  }}
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                >
                  <option value={20}>20 rows</option>
                  <option value={50}>50 rows</option>
                  <option value={200}>200 rows</option>
                  <option value={500}>500 rows</option>
                </select>

                {/** Search Bar */}
                <div className="input-group">
                  <InputBase
                    type="search"
                    className="form-control border"
                    style={{
                      borderRadius: '4px 0 0 4px',
                      height: '40px',
                    }}
                    placeholder="Search for Device"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <IconButton
                    className="bg-white border"
                    style={{
                      borderRadius: '0 4px 4px 0',
                      borderLeft: 'none',
                      height: '40px',
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </div>
              </div>
            </CCardHeader>

            <TableContainer
              component={Paper}
              sx={{
                height: 'auto',
                overflowX: 'auto',
                overflowY: 'auto',
                // marginBottom: '10px',
                // borderRadius: '5px',
                // border: '1px solid black',
              }}
            >
              <CCardBody>
                <CTable
                  className="mb-0 border rounded-4"
                  style={{ fontSize: '14px' }}
                  bordered
                  align="middle"
                  hover
                  responsive
                >
                  <CTableHead className="text-nowrap">
                    <CTableRow className="bg-body-tertiary">
                      <CTableHeaderCell
                        className="text-center text-white text-center sr-no table-cell"
                        style={{ backgroundColor: '#0a2d63' }}
                      >
                        SN
                      </CTableHeaderCell>
                      {['Vehicles Name', 'Notification', 'Location', 'Message', 'Date/Time'].map(
                        (column) => (
                          <CTableHeaderCell
                            key={column}
                            className="text-center text-white text-center sr-no table-cell"
                            style={{
                              backgroundColor: '#0a2d63',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleSort(column)}
                          >
                            {column}
                            {sortConfig.key === columnKeyMap[column] && (
                              <span> {sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </CTableHeaderCell>
                        ),
                      )}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {loading ? (
                      <CTableRow>
                        <CTableDataCell colSpan="8" className="text-center">
                          <div className="text-nowrap mb-2 text-center w-">
                            <p className="card-text placeholder-glow">
                              <span className="placeholder col-12" />
                            </p>
                            <p className="card-text placeholder-glow">
                              <span className="placeholder col-12" />
                            </p>
                            <p className="card-text placeholder-glow">
                              <span className="placeholder col-12" />
                            </p>
                            <p className="card-text placeholder-glow">
                              <span className="placeholder col-12" />
                            </p>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ) : paginatedData.length > 0 ? (
                      paginatedData
                        .filter((item) => {
                          const query = searchQuery.toLowerCase()
                          return (
                            item.name?.toLowerCase().includes(query) || // Filter by name
                            item.type?.toLowerCase().includes(query) || // Filter by type
                            item.address?.toLowerCase().includes(query) || // Filter by address
                            item.message?.toLowerCase().includes(query) // Filter by message
                          )
                        })
                        ?.map((item, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell
                              style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                              className="text-center ps-4"
                            >
                              {(currentPage - 1) * rowsPerPage + index + 1}
                            </CTableDataCell>
                            <CTableDataCell
                              style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                              className="text-center ps-4"
                            >
                              {item.name}
                            </CTableDataCell>
                            <CTableDataCell
                              style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                              className="text-center"
                            >
                              {item.type}
                            </CTableDataCell>
                            <CTableDataCell
                              style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                              className="text-center"
                            >
                              {item.address || 'Fetching...'}
                            </CTableDataCell>
                            <CTableDataCell
                              style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                              className="text-center"
                            >
                              {item.message}
                            </CTableDataCell>
                            <CTableDataCell
                              style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                              className="text-center pe-4"
                            >
                              {' '}
                              {new Date(item.eventTime).toLocaleString('en-IN', {
                                timeZone: 'Asia/Kolkata',
                                hour12: false, // Use 24-hour format
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </CTableDataCell>
                          </CTableRow>
                        ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="8" className="text-center">
                          <div
                            className="d-flex flex-column justify-content-center align-items-center"
                            style={{ height: '200px' }}
                          >
                            <p className="mb-0 fw-bold">"No Alerts are Available"</p>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </TableContainer>
          </CCard>
        </CCol>
      </CRow>

      {/* Pagination */}
      <div className="mt-3 d-flex flex-column align-items-center justify-content-center">
        {/* Top: Page Navigation Buttons */}
        <Pagination>
          <Pagination.Prev
            onClick={() => handlePageChange((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          />

          {/* Add "First" and ellipsis if current page is far from the first page */}
          {currentPage > 3 && (
            <>
              <Pagination.Item onClick={() => handlePageChange(1)}>1</Pagination.Item>
              {currentPage > 4 && <Pagination.Ellipsis disabled />}
            </>
          )}

          {/* Display pages around the current page */}
          {Array.from({ length: 5 }, (_, i) => {
            const page = currentPage - 2 + i
            if (page > 0 && page <= totalPages) {
              return (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => handlePageChange(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </Pagination.Item>
              )
            }
            return null
          })}

          {/* Add ellipsis and "Last" if current page is far from the last page */}
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && <Pagination.Ellipsis disabled />}
              <Pagination.Item onClick={() => handlePageChange(totalPages)}>
                {totalPages}
              </Pagination.Item>
            </>
          )}

          <Pagination.Next
            onClick={() => handlePageChange((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          />
        </Pagination>

        {/* Bottom: Showing Entries */}
        <div className="d-flex justify-content-center align-items-center ">
          <div>
            <p className="mb-3">
              Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
              {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}{' '}
              entries
            </p>
          </div>
        </div>
      </div>
      <div className="position-fixed bottom-0 end-0 mb-5 m-3 z-5">
        <IconDropdown items={dropdownItems} />
      </div>
    </div>
  )
}

export default Alerts
