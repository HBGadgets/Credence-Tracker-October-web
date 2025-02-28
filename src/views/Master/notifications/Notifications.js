import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Autocomplete, InputAdornment, Chip, Checkbox } from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import { CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material'
import ListItemText from '@mui/material/ListItemText'
import GroupIcon from '@mui/icons-material/Group'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Popper from '@mui/material/Popper'
import {
  TableContainer,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
  Typography,
  Button,
  InputBase,
  Modal,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material'
import { RiEdit2Fill } from 'react-icons/ri'
import { AiFillDelete } from 'react-icons/ai'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CHeaderNav,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import Loader from '../../../components/Loader/Loader'
import CloseIcon from '@mui/icons-material/Close'
import { MdConnectWithoutContact } from 'react-icons/md'
import { AiOutlineUpload } from 'react-icons/ai'
import ReactPaginate from 'react-paginate'
import Cookies from 'js-cookie'
import { IoMdAdd } from 'react-icons/io'
import toast, { Toaster } from 'react-hot-toast'
import * as XLSX from 'xlsx' // For Excel export
import jsPDF from 'jspdf' // For PDF export
import 'jspdf-autotable' // For table formatting in PDF
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'
import '../../../../src/app.css'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import IconDropdown from '../../../components/ButtonDropdown'
import SearchIcon from '@mui/icons-material/Search'
import { FaRegFilePdf, FaPrint } from 'react-icons/fa6'
import { PiMicrosoftExcelLogo } from 'react-icons/pi'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaArrowUp } from 'react-icons/fa'
import { jwtDecode } from 'jwt-decode'


const accessToken = Cookies.get('authToken')

const decodedToken = jwtDecode(accessToken)

const notificationTypes = [
  'statusOnline',
  'statusOffline',
  'statusUnknown',
  'deviceActive',
  'deviceInactive',
  'deviceMoving',
  'deviceStopped',
  'speedLimitExceeded',
  'ignitionOn',
  'ignitionOff',
  'fuelDrop',
  'fuelIncrease',
  'geofenceEntered',
  'geofenceExited',
  'alarm',
  'maintenanceRequired',
]

const Notification = () => {
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [limit, setLimit] = useState(10)
  const [pageCount, setPageCount] = useState()
  const accessToken = Cookies.get('authToken')
  const [filteredData, setFilteredData] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState()
  const [devices, setDevices] = useState([])
  const [selectedDevices, setSelectedDevices] = useState([])
  const [selectedNotificationTypes, setSelectedNotificationTypes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [devicesAlreadyAdded, setDevicesAlreadyAdded] = useState([])

  const handleEditModalClose = () => setEditModalOpen(false)
  const handleAddModalClose = () => {
    setAddModalOpen(false)
    setSelectedDevices([])
    setDevices([])
  }

  const CustomListbox = (props) => {
    return <ul {...props} style={{ maxHeight: '200px', overflowY: 'auto' }} />
  }

  const style = {
    position: 'absolute',
    top: '50%',
    borderRadius: '10px',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto', // Enable vertical scrolling
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    marginTop: '8px',
  }

  const getGroups = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/group`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })
      if (response.data) {
        setGroups(response.data.groups)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
    }
  }

  useEffect(() => {
    getGroups()
  }, [limit])

  // ##################### getting data  ###################
  const fetchNotificationData = async (page = 1) => {
    const url = `${import.meta.env.VITE_API_URL}/notifications?page=${page}&limit=${limit}&search=${searchQuery}`

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })

      if (response.data) {
        setData(response.data.notifications)
        setPageCount(response.data.totalPages)
        console.log(response.data.notifications)
        console.log(response.data.totalPages)
        setLoading(false)
        const filtereddevices = response.data.notifications.map((item) => item.deviceId.name)
        setDevicesAlreadyAdded(filtereddevices)
        console.log(('setdevicesalreadyadded', devicesAlreadyAdded))
      }
    } catch (error) {
      setLoading(false)
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
    }
  }

  // ##################### Filter data by search query #######################
  const filterNotifications = () => {
    if (!searchQuery) {
      setFilteredData(data) // No query, show all drivers
    } else {
      // const filtered = data.filter(
      //   (notification) =>
      //     notification.deviceId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      //     notification.type?.name.toLowerCase().includes(searchQuery.toLowerCase())
      // );

      //changed the code as it was getting crashed while searching
      const filtered = data.filter((notification) => {
        const deviceName = notification.deviceId?.name || '' // Default to empty string if undefined
        const typeName = notification.type?.name || '' // Default to empty string if undefined

        return (
          deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          typeName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      setFilteredData(filtered)
      setCurrentPage(1)
    }
  }
  const getDevices = async (selectedGroup) => {
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
        console.log('alreadyaddeddevices in setdevices', devicesAlreadyAdded)

        setDevices(response.data.data)
        console.log('devices es form me aa rhi he', devices)
      } else {
        setDevices([])
      }
    } catch (error) {
      setDevices([])
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
    }
  }

  useEffect(() => {
    fetchNotificationData()
  }, [searchQuery])

  useEffect(() => {
    filterNotifications(searchQuery)
  }, [data, searchQuery])

  const handlePageClick = (e) => {
    console.log(e.selected + 1)
    let page = e.selected + 1
    setCurrentPage(page)
    setLoading(true)
    fetchNotificationData(page)
  }

  // #########################################################################

  //  ####################  Add Notification ###########################

  const handleAddNotification = async (e) => {
    e.preventDefault()
    console.log(formData)
    const selectedDevicesArray = selectedDevices.map((device) => device._id)

    const FormDataObj = {
      deviceId: selectedDevicesArray,
      type: selectedNotificationTypes,
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/notifications`,
        FormDataObj,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.status === 201) {
        toast.success('Successfully Notification Created!')
        fetchNotificationData()
        setFormData({})
        setSelectedDevices([])
        setSelectedNotificationTypes([])
        setAddModalOpen(false)
      }
    } catch (error) {
      throw error.response ? error.response.data : new Error('An error occurred')
    }
  }

  // ###################################################################
  // ######################### Edit Group #########################

  const handleEditNotification = async (e) => {
    e.preventDefault()
    console.log('formData in editnotification', formData)
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/notifications/${formData._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (response.status === 200) {
        toast.success('Successfully Notification Updated!')
        fetchNotificationData()
        setFormData({})
        setSelectedDevices([])
        setSelectedNotificationTypes([])
        setEditModalOpen(false)
      }
    } catch (error) {
      throw error.response ? error.response.data : new Error('An error occurred')
    }
  }

  const handleClickNotification = async (item) => {
    console.log(item)
    setEditModalOpen(true)
    setFormData({ ...item })
    console.log('this is before edit', formData)
  }

  // ###################################################################

  // ###################### Delete Group ##############################

  const handleDeleteNotification = async (item) => {
    const confirmed = confirm('Do you want to delete this notification')
    // added the logic If the user cancels, do nothing
    if (!confirmed) return
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/notifications/${item._id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (response.status === 200) {
        toast.error('Successfully Notification Deleted!')
        fetchNotificationData()
      }
    } catch (error) {
      throw error.response ? error.response.data : new Error('An error occurred')
    }
  }

  useEffect(() => {
    console.log('this is form data...', formData)
  }, [formData])

  //  ###############################################################

  // Pdf Download

  const exportToPDF = () => {
    try {
      if (!Array.isArray(filteredData) || filteredData.length === 0) {
        throw new Error('No data available for PDF export')
      }

      // Configuration Settings
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

      // Add Header
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

      // Add Footer
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
          doc.setTextColor(...CONFIG.colors.secondary)
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

      // Add Metadata (Including Generated By and Generated Date)
      const addMetadata = () => {
        const generatedBy = decodedToken?.username || 'N/A'
        const generatedDate = new Date().toLocaleDateString('en-GB')

        const metadata = [{ label: 'Generated By:', value: generatedBy }]

        // Add "Generated Date" to top-right corner
        doc.setFontSize(10)
        doc.setFont(CONFIG.fonts.primary, 'normal')
        const generatedDateWidth = doc.getTextWidth(`Generated Date: ${generatedDate}`)
        doc.text(
          `Generated Date: ${generatedDate}`,
          doc.internal.pageSize.width - CONFIG.layout.margin - generatedDateWidth,
          21,
        )

        // Add other metadata
        let yPosition = 45
        const xPosition = 15
        const lineHeight = 6

        metadata.forEach((item) => {
          doc.text(`${item.label} ${item.value.toString()}`, xPosition, yPosition)
          yPosition += lineHeight
        })
      }

      // Main Document Structure
      addHeader()

      doc.setFontSize(24)
      doc.setFont(CONFIG.fonts.primary, 'bold')
      doc.text('Devices Notifications Report', CONFIG.layout.margin, 35)

      addMetadata()

      // Table Data Preparation
      const tableColumns = ['SN', 'Device Name', 'Notifications']
      const tableRows = filteredData.map((item, index) => [
        index + 1,
        item.deviceId?.name || '--',
        item.type || '--',
      ])

      // Adjust Column Widths
      const pageWidth = doc.internal.pageSize.width
      const columnWidths = [10, 20, 100]
      const totalWidth = columnWidths.reduce((acc, width) => acc + width, 0)
      const remainingWidth = pageWidth - 2 * CONFIG.layout.margin
      const scaleFactor = remainingWidth / totalWidth

      // Generate Table
      doc.autoTable({
        startY: 65,
        head: [tableColumns],
        body: tableRows,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 4,
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
          0: { cellWidth: columnWidths[0] * scaleFactor },
          1: { cellWidth: columnWidths[1] * scaleFactor },
          2: { cellWidth: columnWidths[2] * scaleFactor },
        },
        margin: { left: CONFIG.layout.margin, right: CONFIG.layout.margin },
      })

      addFooter()

      // Save PDF
      const filename = `Notifications_Report_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF Export Error:', error)
      toast.error(error.message || 'Failed to export PDF')
    }
  }
  // Excel download

  const exportToExcel = async () => {
    try {
      // Validate data before proceeding
      if (!Array.isArray(filteredData) || filteredData.length === 0) {
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
          { header: 'Device Name', width: 25 },
          { header: 'Notification Type', width: 20 },

          // Add more columns based on the properties you want to include from filteredData
        ],
        company: {
          name: 'Credence Tracker',
          copyright: `© ${new Date().getFullYear()} Credence Tracker`,
        },
      }

      // Initialize workbook and worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Notification Report')

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
        worksheet.mergeCells('A1:E1') // Adjust merge range based on number of columns

        // Report title
        const subtitleRow = worksheet.addRow(['Notification Report'])
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
        worksheet.mergeCells('A2:E2') // Adjust merge range based on number of columns

        // Metadata
        worksheet.addRow([`Generated by: ${decodedToken.username || 'N/A'}`])
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

        // Add data rows (loop through filteredData and add all properties)
        filteredData.forEach((item, index) => {
          const rowData = [
            index + 1, // SN
            item.deviceId?.name || 'N/A', // Device Name
            item.type || 'N/A', // Notification Type

            // Add more properties here as needed
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
        worksheet.mergeCells(`A${footerRow.number}:E${footerRow.number}`) // Adjust merge range based on number of columns
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
      const filename = `Notification_Report_${new Date().toISOString().split('T')[0]}.xlsx`
      saveAs(blob, filename)
      toast.success('Excel file downloaded successfully')
    } catch (error) {
      console.error('Excel Export Error:', error)
      toast.error(error.message || 'Failed to export Excel file')
    }
  }


  // SORTING LOGIC
  const handleSort = (column) => {
    const isAsc = sortBy === column && sortOrder === 'asc'
    setSortOrder(isAsc ? 'desc' : 'asc')
    setSortBy(column)
  }

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0

    if (sortBy === 'deviceName') {
      const nameA = a.deviceId?.name?.toLowerCase() || ''
      const nameB = b.deviceId?.name?.toLowerCase() || ''
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    } else if (sortBy === 'notificationCount') {
      const countA = a.type?.length || 0
      const countB = b.type?.length || 0
      return sortOrder === 'asc' ? countA - countB : countB - countA
    }
    return 0
  })

  // Dropdown items for icons modal

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
    <div className="d-flex flex-column mx-md-3 mt-3 h-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="d-flex justify-content-between mb-2"></div>
      <div className="d-md-none mb-2">
        <input
          type="search"
          className="form-control"
          placeholder="search here..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader className="grand d-flex justify-content-between align-items-center">
              <strong>Notification</strong>
              <div className="d-flex gap-3">
                {/* <div className="me-3 d-none d-md-block">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search for Notifications"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div> */}
                <div className="input-group">
                  <InputBase
                    type="search"
                    className="form-control border"
                    style={{ height: '40px' }}
                    placeholder="Search for Vehicles"
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
                <div>
                  <button
                    onClick={() => setAddModalOpen(true)}
                    variant="contained"
                    className="btn text-white"
                    style={{ backgroundColor: '#0a2d63', width: '150px' }}
                  >
                    Add Notifications
                  </button>
                </div>
              </div>
            </CCardHeader>
            <TableContainer
              component={Paper}
              sx={{
                height: 'auto', // Set the desired height
                overflowX: 'auto', // Enable horizontal scrollbar
                overflowY: 'auto', // Enable vertical scrollbar if needed
                // marginBottom: '10px',
                // borderRadius: '10px',
                // border: '1px solid black',
              }}
            >
              <CCardBody>
                <CTable
                  style={{ fontSize: '14px' }}
                  bordered
                  align="middle"
                  className="mb-2 border min-vh-25 rounded-top-3"
                  hover
                  responsive
                >
                  <CTableHead className="text-nowrap">
                    <CTableRow>
                      <CTableHeaderCell
                        className=" text-center text-white text-center sr-no table-cell"
                        style={{ backgroundColor: '#0a2d63' }}
                      >
                        <strong>SN</strong>
                      </CTableHeaderCell>
                      <CTableHeaderCell
                        className="text-center text-white sr-no table-cell"
                        style={{ backgroundColor: '#0a2d63', cursor: 'pointer' }}
                        onClick={() => handleSort('deviceName')}
                      >
                        <strong>Vehicles Name</strong>
                        {sortBy === 'deviceName' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                      </CTableHeaderCell>

                      <CTableHeaderCell
                        className="text-center text-white sr-no table-cell"
                        style={{ backgroundColor: '#0a2d63', cursor: 'pointer' }}
                        onClick={() => handleSort('notificationCount')}
                      >
                        <strong>Notification</strong>
                        {sortBy === 'notificationCount' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                      </CTableHeaderCell>

                      <CTableHeaderCell
                        className=" text-center text-white text-center sr-no table-cell"
                        style={{ backgroundColor: '#0a2d63' }}
                      >
                        <strong>Actions</strong>
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {loading ? (
                      <>
                        <CTableRow>
                          <CTableDataCell colSpan="4" className="text-center">
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
                      </>
                    ) : filteredData.length > 0 ? (
                      sortedData?.map((item, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell
                            className="text-center p-0"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {(currentPage - 1) * limit + index + 1}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center p-0"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {item.deviceId?.name}
                          </CTableDataCell>
                          {/* <CTableDataCell className="text-center p-0">{item.channel}</CTableDataCell> */}
                          <CTableDataCell
                            className="text-center p-0 "
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            <CFormSelect
                              id="type"
                              value=""
                              className=" text-center border-2 "
                              style={{ width: '130px', margin: '0 auto' }}
                            >
                              <option value="">{item.type.length}</option>
                              {Array.isArray(item.type) &&
                                item.type.map((typ) => (
                                  <option key={typ} value={typ}>
                                    {typ}
                                  </option>
                                ))}
                            </CFormSelect>
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center d-flex p-0"
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                            }}
                          >
                            <IconButton
                              aria-label="edit"
                              onClick={() => handleClickNotification(item)}
                            >
                              <RiEdit2Fill
                                style={{ fontSize: '20px', color: 'lightBlue', margin: '3px' }}
                              />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={() => handleDeleteNotification(item)}
                            >
                              <AiFillDelete
                                style={{ fontSize: '20px', color: 'red', margin: '3px' }}
                              />
                            </IconButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="4" className="text-center">
                          <div
                            className="d-flex flex-column justify-content-center align-items-center"
                            style={{ height: '200px' }}
                          >
                            <p className="mb-0 fw-bold">
                              "Oops! Looks like there's no Notification you have created yet.
                              <br /> Maybe it's time to create new Notification!"
                            </p>
                            <div>
                              <button
                                onClick={() => setAddModalOpen(true)}
                                variant="contained"
                                className="btn btn-primary m-3 text-white"
                              >
                                <span>
                                  <IoMdAdd className="fs-5" />
                                </span>{' '}
                                Create Notification
                              </button>
                            </div>
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

      {/* download icon */}

      <div className="position-fixed bottom-0 end-0 mb-5 m-3 z-5">
        <IconDropdown items={dropdownItems} />
      </div>


      <div className="d-flex justify-content-center align-items-center">
        <div className="d-flex">
          {/* Pagination */}
          <div className="me-3">
            {' '}
            {/* Adds margin to the right of pagination */}
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={pageCount} // Set based on the total pages from the API
              previousLabel="< previous"
              renderOnZeroPageCount={null}
              marginPagesDisplayed={2}
              containerClassName="pagination justify-content-center"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              activeClassName="active"
            />
          </div>
          {/* Form Control */}
          <div style={{ width: '90px' }}>
            <CFormSelect
              aria-label="Default select example"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              options={[
                { label: '10', value: '10' },
                { label: '50', value: '50' },
                { label: '500', value: '500' },
                { label: 'ALL', value: '' },
              ]}
            />
          </div>
        </div>
      </div>
      <Modal
        open={addModalOpen}
        onClose={handleAddModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="d-flex justify-content-between">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add New Notification
            </Typography>
            <IconButton
              // style={{ marginLeft: 'auto', marginTop: '-40px', color: '#aaa' }}
              onClick={handleAddModalClose}
            >
              <CloseIcon />
            </IconButton>
          </div>
          <DialogContent>
            <form
              onSubmit={handleAddNotification}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {/* <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <InputLabel>Select Group</InputLabel>
                <Select
                  name="groups"
                  onChange={(e) => getDevices(e.target.value)}
                  label="select group..."
                >
                  {groups.map((group) => (
                    <MenuItem key={group._id} value={group._id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> */}
              {/* <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <InputLabel>Devices</InputLabel>
                <Select
                  name="devices"
                  value={formData.deviceId || []}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                  label="Select Devices..."
                  multiple
                >
                  {devices.length > 0 ? (
                    devices?.map((device) => (
                      <MenuItem key={device._id} value={device._id}>
                        {device.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem>No device available</MenuItem>
                  )}
                </Select>
              </FormControl> */}
              {/* <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <InputLabel>Notification Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type || []}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Select Notification Type..."
                  multiple
                >
                  {notificationTypes.map((Ntype) => (
                    <MenuItem key={Ntype} value={Ntype}>
                      {Ntype}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> */}
              <FormControl fullWidth sx={{ marginBottom: 4 }}>
                <Autocomplete
                  options={groups} // List of devices
                  getOptionLabel={(option) => option.name} // Defines the label for each option
                  //onChange={(event, value) => setSelectedDevice(value)}
                  onChange={(event, value) => {
                    console.log('value in autocomplete group', value)

                    getDevices(value._id)
                  }} // Handle selection
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select group...."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <GroupIcon
                                sx={{
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(0, 0, 0, 0.54)',
                                  color: 'white',
                                  padding: '5px',
                                  fontSize: '28px',
                                }}
                              />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                      fullWidth
                    />
                  )}
                  filterOptions={(options, state) =>
                    options.filter((option) =>
                      option.name.toLowerCase().includes(state.inputValue.toLowerCase()),
                    )
                  }
                  isOptionEqualToValue={(option, value) => option.deviceId === value?.deviceId}
                  ListboxProps={{
                    sx: {
                      maxHeight: 200, // Restrict max height
                      overflowY: 'scroll', // Always show scrollbar
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
                    },
                  }}
                />
              </FormControl>
              <FormControl fullWidth sx={{ marginBottom: 4 }}>
                <Autocomplete
                  multiple
                  options={devices} // List of devices
                  disableCloseOnSelect
                  getOptionLabel={(option) => option.name} // Defines the label for each option
                  onChange={(event, newValue) => {
                    console.log('value in auto devices', newValue)

                    setSelectedDevices(newValue)
                  }}
                  ListboxProps={{
                    sx: {
                      maxHeight: 200, // Restrict max height
                      overflowY: 'scroll', // Always show scrollbar
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
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select devices..."
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <DirectionsCarIcon
                                sx={{
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(0, 0, 0, 0.54)',
                                  color: 'white',
                                  padding: '5px',
                                  fontSize: '28px',
                                }}
                              />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  // renderOption={(props, option, { selected }) => (
                  //   <li {...props}>
                  //     <Checkbox
                  //       style={{ marginRight: 8 }}
                  //       checked={selected}
                  //     />
                  //     <ListItemText primary={option.name} />
                  //   </li>

                  // )}
                  renderOption={(props, option, { selected }) => {
                    const isDisabled = devicesAlreadyAdded.includes(option.name)
                    {
                      ; (() =>
                        console.log(
                          'Logging inside JSX:',
                          devicesAlreadyAdded,
                          'isDisabled',
                          isDisabled,
                        ))()
                    } // Check if option.name is in devicesAlreadyAdded
                    return (
                      <li
                        {...props}
                      // aria-disabled={isDisabled}
                      >
                        <Checkbox
                          style={{ marginRight: 8 }}
                          checked={selected}
                        //disabled={isDisabled} // Disable the checkbox if condition is met
                        />
                        <ListItemText
                          primary={option.name}
                        // style={{
                        //   textDecoration: isDisabled ? "line-through" : "none", // Optional: Style disabled options
                        //   color: isDisabled ? "gray" : "inherit",
                        // }}
                        />
                      </li>
                    )
                  }}
                  filterOptions={(options, state) =>
                    options.filter((option) =>
                      option.name.toLowerCase().includes(state.inputValue.toLowerCase()),
                    )
                  }
                  isOptionEqualToValue={(option, value) => option.deviceId === value?.deviceId}
                />
              </FormControl>

              <Autocomplete
                multiple
                options={['All', ...notificationTypes]} // Include "All" dynamically
                disableCloseOnSelect
                getOptionLabel={(option) => option}
                value={selectedNotificationTypes}
                onChange={(event, newValue) => {
                  if (newValue.includes('All')) {
                    if (selectedNotificationTypes.length === notificationTypes.length) {
                      // Deselect all
                      setSelectedNotificationTypes([])
                    } else {
                      // Select all options except "All"
                      setSelectedNotificationTypes(notificationTypes)
                    }
                  } else {
                    setSelectedNotificationTypes(newValue)
                  }
                }}
                ListboxComponent={CustomListbox}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlank />}
                      checkedIcon={<CheckBox />}
                      style={{ marginRight: 8 }}
                      checked={
                        option === 'All'
                          ? selectedNotificationTypes.length === notificationTypes.length
                          : selected
                      }
                    />
                    {option}
                  </li>
                )}
                ListboxProps={{
                  sx: {
                    maxHeight: 200, // Restrict max height
                    overflowY: 'scroll', // Always show scrollbar
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
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Select Notifications"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <NotificationsIcon
                              sx={{
                                borderRadius: '50%',
                                backgroundColor: 'rgba(0, 0, 0, 0.54)',
                                color: 'white',
                                padding: '5px',
                                fontSize: '28px',
                              }}
                            />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginTop: '20px', marginLeft: 'auto' }}
              >
                Submit
              </Button>
            </form>
          </DialogContent>
        </Box>
      </Modal>

      {/* edit model */}
      <Modal
        open={editModalOpen}
        onClose={handleEditModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="d-flex justify-content-between">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Edit Notification
            </Typography>
            <IconButton
              // style={{ marginLeft: 'auto', marginTop: '-40px', color: '#aaa' }}
              onClick={handleEditModalClose}
            >
              <CloseIcon />
            </IconButton>
          </div>
          <DialogContent>
            <form
              onSubmit={handleEditNotification}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <FormControl style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <TextField
                  label="Device"
                  name="device"
                  value={formData.deviceId?.name !== undefined ? formData.deviceId?.name : ''}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DirectionsCarIcon
                          sx={{
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 0, 0, 0.54)',
                            color: 'white',
                            padding: '5px',
                            fontSize: '28px',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
              {/* <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <InputLabel>Notification Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type || []}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Select Notification Type..."
                  multiple
                >
                  {notificationTypes.map((Ntype) => (
                    <MenuItem key={Ntype} value={Ntype}>
                      {Ntype}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> */}

              <FormControl fullWidth sx={{ marginBottom: 2, marginTop: 5 }}>
                <InputLabel>Notification Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type || []}
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected.includes("All")) {
                      if (formData.type?.length === notificationTypes.length) {
                        // Deselect all if "All" is selected
                        setFormData({ ...formData, type: [] });
                      } else {
                        // Select all options
                        setFormData({ ...formData, type: notificationTypes });
                      }
                    } else {
                      // Regular update
                      setFormData({ ...formData, type: selected });
                    }
                  }}
                  input={
                    <OutlinedInput
                      startAdornment={
                        <InputAdornment position="start">
                          <NotificationsIcon
                            sx={{
                              borderRadius: "50%",
                              backgroundColor: "rgba(0, 0, 0, 0.54)",
                              color: "white",
                              padding: "5px",
                              fontSize: "28px",
                            }}
                          />
                        </InputAdornment>
                      }
                      label="Notification Type"
                    />
                  }
                  label="Select Notification Type..."
                  multiple
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 200, // Restrict max height
                        overflowY: "scroll", // Always show scrollbar
                        "&::-webkit-scrollbar": {
                          width: "8px", // Scrollbar width
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "#f1f1f1", // Track color
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "#888", // Scrollbar color
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          background: "#555", // Hover effect
                        },
                      },
                    },
                  }}
                >
                  {/* "All" Option */}
                  <MenuItem value="All">
                    <Checkbox checked={formData.type?.length === notificationTypes.length} />
                    <ListItemText primary="All" />
                  </MenuItem>

                  {/* Individual Notification Types */}
                  {notificationTypes.map((Ntype) => (
                    <MenuItem key={Ntype} value={Ntype}>
                      <Checkbox checked={formData.type?.includes(Ntype)} />
                      <ListItemText primary={Ntype} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginTop: '20px', marginLeft: 'auto' }}
              >
                Edit
              </Button>
            </form>
          </DialogContent>
        </Box>
      </Modal>
    </div>
  )
}

export default Notification
