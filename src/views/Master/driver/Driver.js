import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Autocomplete } from '@mui/material'
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
  InputAdornment,
  FormControl,
} from '@mui/material'
import { Select, MenuItem } from '@mui/material'
import { RiEdit2Fill } from 'react-icons/ri'
import { AiFillDelete } from 'react-icons/ai'
import {
  CCardHeader,
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
  CRow,
  CCol,
  CCard,
  CCardBody,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import Loader from '../../../components/Loader/Loader'
import CloseIcon from '@mui/icons-material/Close'
import { MdConnectWithoutContact } from 'react-icons/md'
import { AiOutlineUpload } from 'react-icons/ai'
import ReactPaginate from 'react-paginate'
import Cookies from 'js-cookie'
import { AccountCircle, MailOutline, Phone } from '@mui/icons-material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import DialpadIcon from '@mui/icons-material/Dialpad'
import HomeIcon from '@mui/icons-material/Home'
import { IoMdAdd } from 'react-icons/io'
import toast, { Toaster } from 'react-hot-toast'
import * as XLSX from 'xlsx' // For Excel export
import jsPDF from 'jspdf' // For PDF export
import 'jspdf-autotable' // For table formatting in PDF
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'
import '../../../../src/app.css'
import SearchIcon from '@mui/icons-material/Search'
import IconDropdown from '../../../components/ButtonDropdown'
import { FaRegFilePdf, FaPrint } from 'react-icons/fa6'
import { PiMicrosoftExcelLogo } from 'react-icons/pi'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaArrowUp } from 'react-icons/fa'
import { jwtDecode } from 'jwt-decode'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const accessToken = Cookies.get('authToken')

const decodedToken = jwtDecode(accessToken)

const Driver = () => {
  // Add these state variables at the top of the component
  const [sortBy, setSortBy] = useState(null)
  const [sortOrder, setSortOrder] = useState('asc')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [limit, setLimit] = useState(10)
  const [pageCount, setPageCount] = useState()
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const handleEditModalClose = () => {
    setEditModalOpen(false)
    setFormData({})
  }
  const handleAddModalClose = () => {
    setAddModalOpen(false)
    setFormData({})
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    bgcolor: 'background.paper',
    color: 'black',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  }

  //validation Functions

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/
    return phone ? phoneRegex.test(phone) : true // Allow empty phone
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return email ? emailRegex.test(email) : true // Allow empty email
  }

  const validateLicenseNumber = (licenseNumber) => {
    const licenseRegex = /^[A-Za-z0-9]/ // Adjust the length as needed
    return licenseNumber ? licenseRegex.test(licenseNumber) : true // Allow empty license number
  }

  const validateAadharNumber = (aadharNumber) => {
    const aadharRegex = /^[0-9]/
    return aadharNumber ? aadharRegex.test(aadharNumber) : true // Allow empty Aadhar
  }

  // ##################### getting data  ###################
  const fetchDriverData = async (page = 1) => {
    const accessToken = Cookies.get('authToken')
    const url = `${import.meta.env.VITE_API_URL}/driver?page=${page}&limit=${limit}&search=${searchQuery}`

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })

      if (response.data.drivers) {
        setData(response.data.drivers)
        setPageCount(response.data.pagination.totalPages)
        console.log(response.data.drivers)
        console.log(response.data.pagination.totalPages)
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
    }
  }

  // ##################### Filter data by search query #######################
  const filterDrivers = () => {
    if (!searchQuery) {
      setFilteredData(data) // No query, show all drivers
    } else {
      const filtered = data.filter(
        (driver) =>
          driver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(driver?.phone)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(driver?.email)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver?.device?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(driver?.licenseNumber)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(driver?.aadharNumber)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver?.address?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredData(filtered)
      setCurrentPage(1)
    }
  }

  useEffect(() => {
    fetchDriverData()
  }, [limit, searchQuery])

  useEffect(() => {
    filterDrivers(searchQuery)
  }, [data, searchQuery])

  const handlePageClick = (e) => {
    console.log(e.selected + 1)
    let page = e.selected + 1
    setCurrentPage(page)
    setLoading(true)
    fetchDriverData(page)
  }

  // #########################################################################

  //  ####################  Add Group ###########################

  const handleAddDriver = async (e) => {
    e.preventDefault()
    console.log('formData', formData)
    // Validation checks
    if (!validatePhone(formData.phone)) {
      toast.error('Invalid phone number. It should be 10 digits.')
      return
    }
    if (!validateEmail(formData.email)) {
      toast.error('Invalid email format.')
      return
    }
    if (!validateLicenseNumber(formData.licenseNumber)) {
      toast.error('Invalid license number. It should be alphanumeric and up to 15 characters.')
      return
    }
    if (!validateAadharNumber(formData.aadharNumber)) {
      toast.error('Invalid Aadhar number. It should be exactly 12 digits.')
      return
    }
    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/driver`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status == 200) {
        toast.success('Driver is created successfully')
        fetchDriverData()
        setFormData({ name: '' })
        setAddModalOpen(false)
      }
    } catch (error) {
      toast.error("This didn't work.")
      throw error.response ? error.response.data : new Error('An error occurred')
    }
  }

  // ###################################################################
  // ######################### Edit Group #########################

  const EditDriverSubmit = async (e) => {
    e.preventDefault()
    console.log(formData)
    // Validation checks
    if (!validatePhone(formData.phone)) {
      toast.error('Invalid phone number. It should be 10 digits.')
      return
    }
    if (!validateEmail(formData.email)) {
      toast.error('Invalid email format.')
      return
    }
    if (!validateLicenseNumber(formData.licenseNumber)) {
      toast.error('Invalid license number. It should be alphanumeric and up to 15 characters')
      return
    }
    if (!validateAadharNumber(formData.aadharNumber)) {
      toast.error('Invalid Aadhar number. It should be exactly 12 digits.')
      return
    }
    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/Driver/${formData._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (response.status === 200) {
        toast.success('Driver is edited successfully')
        fetchDriverData()
        setFormData({ name: '' })
        setEditModalOpen(false)
      }
    } catch (error) {
      toast.error("This didn't work.")
      throw error.response ? error.response.data : new Error('An error occurred')
    }
  }

  const handleEditDriver = async (item) => {
    console.log(item)
    setEditModalOpen(true)
    setFormData({ ...item })
    console.log('this is before edit', formData)
  }
  useEffect(() => {
    console.log('Updated formData:', formData)
  }, [formData]) // This runs whenever `formData` changes.

  // ###################################################################

  // ###################### Delete Group ##############################

  const deleteDriverSubmit = async (item) => {
    const confirmed = confirm('Do you want to delete this Driver?')
    // If the user cancels, do nothing
    if (!confirmed) return
    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/Driver/${item._id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 200) {
        toast.error('Driver is deleted successfully')
        fetchDriverData()
      }
    } catch (error) {
      toast.error('An error occurred')
      throw error.response ? error.response.data : new Error('An error occurred')
    }
  }

  const [fomData, setFomData] = useState({})
  const [devices, setDevices] = useState([])
  const token = Cookies.get('authToken') //

  useEffect(() => {
    const fetchDevices = async () => {
      console.log('fetch device me aaya hu...')
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/device`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        console.log(data)
        const mappedDevices = data.devices.map((device) => ({
          deviceId: device.deviceId,
          name: device.name,
        }))

        setDevices(mappedDevices) // Assuming the data returned contains device info
      } catch (error) {
        console.error('Error fetching devices:', error)
      }
    }

    fetchDevices()
  }, [])

  // EXCEL DOWNLOAD

  const exportToExcel = async () => {
    try {
      // Validate data before proceeding
      if (!Array.isArray(sortedData) || sortedData.length === 0) {
        throw new Error('No data available for Excel export');
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
          { header: 'Driver Name', width: 25 },
          { header: 'Mobile No.', width: 20 },
          { header: 'Email', width: 30 },
          { header: 'Vehicle No.', width: 20 },
          { header: 'Lic. No.', width: 20 },
          { header: 'Aadhar No.', width: 20 },
          { header: 'Address', width: 35 },
        ],
        company: {
          name: 'Credence Tracker',
          copyright: `© ${new Date().getFullYear()} Credence Tracker`,
        },
      };

      // Initialize workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Drivers Data');

      // Add title and metadata
      const addHeaderSection = () => {
        // Company title
        const titleRow = worksheet.addRow([CONFIG.company.name]);
        titleRow.font = { ...CONFIG.styles.titleFont, color: { argb: 'FFFFFFFF' } };
        titleRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: CONFIG.styles.primaryColor },
        };
        titleRow.alignment = { horizontal: 'center' };
        worksheet.mergeCells('A1:I1');

        // Report title
        const subtitleRow = worksheet.addRow(['Drivers Data Report']);
        subtitleRow.font = {
          ...CONFIG.styles.titleFont,
          size: 14,
          color: { argb: CONFIG.styles.textColor },
        };
        subtitleRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: CONFIG.styles.secondaryColor },
        };
        subtitleRow.alignment = { horizontal: 'center' };
        worksheet.mergeCells('A2:I2');

        // Metadata
        worksheet.addRow([`Generated by: ${decodedToken.username || 'N/A'}`]);
        worksheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
        worksheet.addRow([]); // Spacer
      };

      // Add data table
      const addDataTable = () => {
        // Add column headers
        const headerRow = worksheet.addRow(CONFIG.columns.map((c) => c.header));
        headerRow.eachCell((cell) => {
          cell.font = { ...CONFIG.styles.headerFont, color: { argb: CONFIG.styles.textColor } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: CONFIG.styles.primaryColor },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: CONFIG.styles.borderStyle },
            bottom: { style: CONFIG.styles.borderStyle },
            left: { style: CONFIG.styles.borderStyle },
            right: { style: CONFIG.styles.borderStyle },
          };
        });

        // Add data rows
        sortedData.forEach((item, index) => {
          const rowData = [
            index + 1, // Serial Number
            item.name || 'N/A',
            item.phone || 'N/A',
            item.email || 'N/A',
            item.vehicleName || 'N/A',
            item.licenseNumber || 'N/A',
            item.aadharNumber || 'N/A',
            item.address || 'N/A',
          ];

          const dataRow = worksheet.addRow(rowData);
          dataRow.eachCell((cell) => {
            cell.font = CONFIG.styles.dataFont;
            cell.border = {
              top: { style: CONFIG.styles.borderStyle },
              bottom: { style: CONFIG.styles.borderStyle },
              left: { style: CONFIG.styles.borderStyle },
              right: { style: CONFIG.styles.borderStyle },
            };
          });
        });

        // Set column widths
        worksheet.columns = CONFIG.columns.map((col) => ({
          width: col.width,
          style: { alignment: { horizontal: 'left' } },
        }));
      };

      // Add footer
      const addFooter = () => {
        worksheet.addRow([]); // Spacer
        const footerRow = worksheet.addRow([CONFIG.company.copyright]);
        footerRow.font = { italic: true };
        worksheet.mergeCells(`A${footerRow.number}:I${footerRow.number}`);
      };

      // Build the document
      addHeaderSection();
      addDataTable();
      addFooter();

      // Generate and save file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const filename = `Drivers_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, filename);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Excel Export Error:', error);
      toast.error(error.message || 'Failed to export Excel file');
    }
  };


  // pdf download

  const exportToPDF = () => {
    try {
      if (!Array.isArray(filteredData) || filteredData.length === 0) {
        throw new Error('No data available for PDF export')
      }

      const CONFIG = {
        colors: {
          primary: [10, 45, 99],
          secondary: [70, 70, 70],
          border: [220, 220, 220],
          alternateRow: [245, 245, 245],
        },
        company: {
          name: 'Credence Tracker',
          logo: { x: 15, y: 15, size: 8 },
        },
        layout: {
          margin: 10,
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

      const applySecondaryColor = () => {
        doc.setTextColor(...CONFIG.colors.secondary)
      }

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
        doc.setFontSize(18)
        doc.text(CONFIG.company.name, CONFIG.layout.margin + 15, 20)

        // Header Line
        doc.setDrawColor(...CONFIG.colors.primary)
        doc.setLineWidth(0.5)
        doc.line(CONFIG.layout.margin, 25, doc.internal.pageSize.width - CONFIG.layout.margin, 25)
      }

      const addFooter = () => {
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setFontSize(9)
          applySecondaryColor()

          doc.setDrawColor(...CONFIG.colors.border)
          doc.line(
            CONFIG.layout.margin,
            doc.internal.pageSize.height - 12,
            doc.internal.pageSize.width - CONFIG.layout.margin,
            doc.internal.pageSize.height - 12,
          )

          doc.text(
            `© ${CONFIG.company.name}`,
            CONFIG.layout.margin,
            doc.internal.pageSize.height - 8
          )

          const pageNumber = `Page ${i} of ${pageCount}`
          doc.text(
            pageNumber,
            doc.internal.pageSize.width - CONFIG.layout.margin - doc.getTextWidth(pageNumber),
            doc.internal.pageSize.height - 8
          )
        }
      }

      // Title & Metadata
      addHeader()
      doc.setFontSize(20)
      doc.setFont(CONFIG.fonts.primary, 'bold')
      doc.text('Drivers Report', CONFIG.layout.margin, 35)

      const generatedBy = `Generated By: ${decodedToken.username || 'N/A'}`
      applySecondaryColor()
      doc.setFontSize(11)
      doc.text(generatedBy, CONFIG.layout.margin, 42)

      // 🗓️ Generated Date at Top Right Corner
      const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      const dateText = `Generated Date: ${currentDate}`

      // ✅ Positioning it at the top right corner
      doc.setFontSize(11)
      doc.text(
        dateText,
        doc.internal.pageSize.width - CONFIG.layout.margin - doc.getTextWidth(dateText),
        15 // Top position near the header
      )

      // Full-Width Table
      const tableColumns = [
        'SN',
        'Driver Name',
        'Mobile No.',
        'Email',
        'Vehicle No.',
        'License No.',
        'Aadhar No.',
        'Address',
      ]

      const tableRows = filteredData.map((item, index) => [
        index + 1,
        item.name || '--',
        item.phone || '--',
        item.email || '--',
        item.vehicleName || '--',
        item.licenseNumber || '--',
        item.aadharNumber || '--',
        item.address || '--',
      ])

      doc.autoTable({
        startY: 50,
        head: [tableColumns],
        body: tableRows,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: 'center',
          lineColor: CONFIG.colors.border,
          lineWidth: 0.1,
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: CONFIG.colors.primary,
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: CONFIG.colors.alternateRow,
        },
        tableWidth: 'auto',
        margin: { left: CONFIG.layout.margin, right: CONFIG.layout.margin },
      })

      addFooter()

      const filename = `Drivers_Report_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF Export Error:', error)
      toast.error(error.message || 'Failed to export PDF')
    }
  }


  // Add sorting handler function
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  // Add sorted data calculation
  const sortedData = React.useMemo(() => {
    const dataToSort = [...filteredData]
    if (!sortBy) return dataToSort

    return dataToSort.sort((a, b) => {
      const valueA = a[sortBy]?.toString().toLowerCase() || ''
      const valueB = b[sortBy]?.toString().toLowerCase() || ''

      if (sortBy === 'phone' || sortBy === 'aadharNumber') {
        // Numeric comparison
        return sortOrder === 'asc'
          ? Number(valueA) - Number(valueB)
          : Number(valueB) - Number(valueA)
      }

      // String comparison
      return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    })
  }, [filteredData, sortBy, sortOrder])

  //  ###############################################################

  // Dropdown items for download icons

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

  // Handel all dropdown

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


  return (
    <div className="d-flex flex-column mx-md-3 mt-3 h-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="mb-2 d-md-none">
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
            <CCardHeader className="d-flex justify-content-between">
              <strong>Driver</strong>
              <div className="d-flex gap-3">
                {/* <div className="me-3 d-none d-md-block">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search for Driver"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div> */}
                <div className="input-group">
                  <InputBase
                    type="search"
                    className="form-control border"
                    style={{ height: '40px' }}
                    placeholder="Search for Drivers"
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
                    className="btn btn-secondary"
                    style={{ background: '#0a2d63', width: '120px' }}
                  >
                    Add Driver
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
                <CTable bordered align="middle" className="mb-0 border" hover responsive>
                  <CTableHead className="text-nowrap">
                    <CTableRow className="bg-body-tertiary">
                      {/* SN (non-sortable) */}
                      <CTableHeaderCell
                        className="text-center text-white"
                        style={{ background: '#0a2d63' }}
                      >
                        <strong>SN</strong>
                      </CTableHeaderCell>

                      {/* Driver Name */}
                      <CTableHeaderCell
                        className="text-center text-white"
                        style={{ background: '#0a2d63', cursor: 'pointer' }}
                        onClick={() => handleSort('name')}
                      >
                        <strong>
                          Driver Name
                          {sortBy === 'name' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                        </strong>
                      </CTableHeaderCell>

                      {/* Mobile No. */}
                      <CTableHeaderCell
                        className="text-center text-white"
                        style={{ background: '#0a2d63', cursor: 'pointer' }}
                        onClick={() => handleSort('phone')}
                      >
                        <strong>
                          Mobile No.
                          {sortBy === 'phone' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                        </strong>
                      </CTableHeaderCell>

                      {/* Email */}
                      <CTableHeaderCell
                        className="text-center text-white"
                        style={{ background: '#0a2d63', cursor: 'pointer' }}
                        onClick={() => handleSort('email')}
                      >
                        <strong>
                          Email
                          {sortBy === 'email' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                        </strong>
                      </CTableHeaderCell>

                      {/* Vehicle no. */}
                      <CTableHeaderCell
                        className="text-center text-white"
                        style={{ background: '#0a2d63', cursor: 'pointer' }}
                        onClick={() => handleSort('vehicleName')}
                      >
                        <strong>
                          Vehicle no.
                          {sortBy === 'vehicleName' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                        </strong>
                      </CTableHeaderCell>

                      {/* Lic. No. */}
                      <CTableHeaderCell
                        className="text-center text-white"
                        style={{ background: '#0a2d63', cursor: 'pointer' }}
                        onClick={() => handleSort('licenseNumber')}
                      >
                        <strong>
                          Lic. No.
                          {sortBy === 'licenseNumber' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                        </strong>
                      </CTableHeaderCell>

                      {/* Aadhar No. */}
                      <CTableHeaderCell
                        className="text-center text-white"
                        style={{ background: '#0a2d63', cursor: 'pointer' }}
                        onClick={() => handleSort('aadharNumber')}
                      >
                        <strong>
                          Aadhar No.
                          {sortBy === 'aadharNumber' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                        </strong>
                      </CTableHeaderCell>

                      {/* Address */}
                      <CTableHeaderCell
                        className="text-center text-white"
                        style={{ background: '#0a2d63', cursor: 'pointer' }}
                        onClick={() => handleSort('address')}
                      >
                        <strong>
                          Address
                          {sortBy === 'address' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                        </strong>
                      </CTableHeaderCell>

                      {/* Actions (non-sortable) */}
                      <CTableHeaderCell
                        className="text-center text-white"
                        style={{ background: '#0a2d63' }}
                      >
                        <strong>Actions</strong>
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody style={{ fontSize: '14px' }}>
                    {loading ? (
                      <CTableRow>
                        <CTableDataCell colSpan="10" className="text-center">
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
                    ) : sortedData.length > 0 ? (
                      sortedData.map((item, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell
                            className="text-center"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {(currentPage - 1) * limit + index + 1}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {item.name}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {item.phone}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {item.email ? item.email : 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {item.vehicleName}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {item.licenseNumber}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {item.aadharNumber}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {item.address ? item.address : 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center d-flex"
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                            }}
                          >
                            <IconButton aria-label="edit" onClick={() => handleEditDriver(item)}>
                              <RiEdit2Fill
                                style={{ fontSize: '20px', color: 'lightBlue', margin: '5.3px' }}
                              />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={() => deleteDriverSubmit(item)}
                            >
                              <AiFillDelete
                                style={{ fontSize: '20px', color: 'red', margin: '5.3px' }}
                              />
                            </IconButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="9" className="text-center">
                          <div
                            className="d-flex flex-column justify-content-center align-items-center"
                            style={{ height: '200px' }}
                          >
                            <p className="mb-0 fw-bold">
                              "Oops! Looks like there's nobody here yet.
                              <br /> Maybe it's time to invite some drivers!"
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
                                Add Driver
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

      {/* Icon dropdown download icons */}

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
              pageCount={Math.ceil(sortedData.length / limit)} // Set based on the total pages from the API
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
                { label: 'ALL', value: sortedData.length },
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
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              style={{ paddingLeft: '26px' }}
            >
              Add New Driver
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
              onSubmit={handleAddDriver}
              style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column' }}
            >
              <FormControl
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto auto auto',
                  gridGap: '3rem 1rem',
                }}
              >
                <TextField
                  label="Driver Name"
                  name="name"
                  value={formData.name !== undefined ? formData.name : ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Mobile No."
                  name="mobile"
                  value={formData.phone !== undefined ? formData.phone : ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email !== undefined ? formData.email : ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutline />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* <TextField
                  select 
                  label="Vehicle List" 
                  name="vehicle no."
                  value={fomData.deviceId}
                  onChange={(e) => setFomData({ ...fomData, deviceId: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DirectionsCarIcon />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth 
                >
                  {devices.length > 0 ? (
                    devices.map((device) => (
                      <MenuItem key={device.deviceId} value={device.deviceId}> 
                        {device.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No devices available</MenuItem>
                  )}
                </TextField> */}

                <Autocomplete
                  options={devices} // List of devices
                  getOptionLabel={(option) => option.name} // Defines the label for each option
                  onChange={(event, value) =>
                    setFormData({ ...formData, deviceId: value?.deviceId })
                  } // Handle selection
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select or Search Vehicle"
                      placeholder="Start typing to search"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <DirectionsCarIcon />
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
                      option.name.toLowerCase().includes(state.inputValue.toLowerCase())
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


                <TextField
                  label="Licence No."
                  name="lic"
                  value={formData.licenseNumber !== undefined ? formData.licenseNumber : ''}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TextSnippetIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Aadhar No."
                  name="aadhar"
                  value={formData.aadharNumber !== undefined ? formData.aadharNumber : ''}
                  onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DialpadIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Address"
                  name="Address"
                  value={formData.address !== undefined ? formData.address : ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
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
              Edit Group
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
              onSubmit={EditDriverSubmit}
              style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column' }}
            >
              <FormControl
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto auto auto',
                  gridGap: '3rem 1rem',
                }}
              >
                <TextField
                  label="Driver Name"
                  name="name"
                  value={formData.name !== undefined ? formData.name : ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <TextField
                  label="Mobile No."
                  name="mobile"
                  value={formData.phone !== undefined ? formData.phone : ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email !== undefined ? formData.email : ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                {/* <TextField
                  select 
                  label="Vehicle List" 
                  name="vehicle no."
                  value={fomData.deviceId}
                  onChange={(e) => setFomData({ ...fomData, deviceId: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DirectionsCarIcon />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth 
                >
                  {devices.length > 0 ? (
                    devices.map((device) => (
                      <MenuItem key={device.id} value={device.name}> 
                        {device.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No devices available</MenuItem>
                  )}
                </TextField> */}
                <Autocomplete
                  options={devices} // List of devices
                  getOptionLabel={(option) => option.name}
                  // Defines the label for each option
                  value={devices.find((device) => device.name == formData.vehicleName) || null}
                  onChange={(event, value) =>
                    setFormData({ ...formData, deviceId: value.deviceId })
                  } // Handle selection
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select or Search Vehicle"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <DirectionsCarIcon />
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

                <TextField
                  label="Lic No."
                  name="lic"
                  value={formData.licenseNumber !== undefined ? formData.licenseNumber : ''}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
                <TextField
                  label="Aadhar No."
                  name="aadhar"
                  value={formData.aadharNumber !== undefined ? formData.aadharNumber : ''}
                  onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                />
                <TextField
                  label="Address"
                  name="Address"
                  value={formData.address !== undefined ? formData.address : ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </FormControl>
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
    </div>
  )
}

export default Driver
