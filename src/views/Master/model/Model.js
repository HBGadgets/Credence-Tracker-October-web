import React, { useState, useEffect } from 'react'
import { RiEdit2Fill } from 'react-icons/ri'
import { AiFillDelete } from 'react-icons/ai'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import Cookies from 'js-cookie' // Importing js-cookie for managing cookies
import {
  TableContainer,
  Paper,
  IconButton,
  Typography,
  TextField,
  Button,
  Modal,
  Box,
  FormControl,
  InputAdornment,
  InputBase,
} from '@mui/material'
import {
  CTable,
  CTableBody,
  CTableRow,
  CTableHead,
  CTableHeaderCell,
  CTableDataCell,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
} from '@coreui/react'
import Loader from '../../../components/Loader/Loader'
import toast, { Toaster } from 'react-hot-toast'
import { IoMdAdd } from 'react-icons/io'
import * as XLSX from 'xlsx' // For Excel export
import jsPDF from 'jspdf' // For PDF export
import 'jspdf-autotable' // For table formatting in PDF
import CIcon from '@coreui/icons-react'
import ViewComfyIcon from '@mui/icons-material/ViewComfy'
import { cilSettings } from '@coreui/icons'
import '../../../../src/app.css'
import SearchIcon from '@mui/icons-material/Search'
import IconDropdown from '../../../components/ButtonDropdown'
import { FaRegFilePdf, FaPrint } from 'react-icons/fa6'
import { PiMicrosoftExcelLogo } from 'react-icons/pi'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaArrowUp } from 'react-icons/fa'

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

import { jwtDecode } from 'jwt-decode'
import Page404 from '../../pages/page404/Page404'
const accessToken = Cookies.get('authToken')
const decodedToken = jwtDecode(accessToken)

const Model = () => {
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [formData, setFormData] = useState({})
  const [currentItemId, setCurrentItemId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const token = Cookies.get('authToken') //

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  }

  // #### GET ####

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/model?search=${searchQuery}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setData(response.data.models) // Set to response.data.models
      setFilteredData(response.data.models) // Set to response.data.models
      console.log('Fetched Data: ', response.data.models) // Log the fetched data
    } catch (error) {
      setError(error.response.data.message)
      console.error('Error fetching data:', error.response ? error.response.data : error.message)
      setFilteredData([]) // Ensure it's set to an array on error
    } finally {
      setLoading(false) // Stop loading once data is fetched
    }
  }

  // ##################### Filter data by search query #######################
  const filterModels = () => {
    if (!searchQuery) {
      setFilteredData(data) // No query, show all drivers
    } else {
      const filtered = data.filter((model) =>
        model.modelName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredData(filtered)
    }
  }

  useEffect(() => {
    fetchData()
  }, [searchQuery])

  useEffect(() => {
    filterModels(searchQuery)
  }, [data, searchQuery])

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase()
    setSearchQuery(value)
    filterData(value)
  }

  const filterData = (query) => {
    const lowerCaseQuery = query.toLowerCase()
    const filtered = data.filter((item) => item.modelName.toLowerCase().includes(lowerCaseQuery))
    setFilteredData(filtered)
  }

  const handleAddModalOpen = () => {
    setAddModalOpen(true)
    setFormData({})
  }

  const handleAddModalClose = () => setAddModalOpen(false)

  const handleEditModalOpen = (item) => {
    setFormData({ modelName: item.modelName })
    setCurrentItemId(item._id)
    setEditModalOpen(true)
  }

  const handleEditModalClose = () => setEditModalOpen(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  //  #### POST #####
  const handleAddSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/model`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      setData((prevData) => [...prevData, response.data])
      setFilteredData((prevFilteredData) => [...prevFilteredData, response.data])
      handleAddModalClose()
      fetchData() // Optional: Fetch fresh data

      toast.success('Successfully Added Model!') // Show success alert
    } catch (error) {
      setError(error.message)
      console.error('Error adding category:', error)
      toast.error(error.response.data.error) // Show error alert
    }
  }

  // #### PUT EDIT ####
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!currentItemId) return

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/model/${currentItemId}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setData((prevData) =>
        prevData.map((item) => (item._id === currentItemId ? response.data : item)),
      )
      setFilteredData((prevFilteredData) =>
        prevFilteredData.map((item) => (item._id === currentItemId ? response.data : item)),
      )
      handleEditModalClose()
      fetchData() // Optional: Fetch fresh data
      toast.success('Successfully Edited Model!') // Show success alert
    } catch (error) {
      setError(error.message)
      console.error('Error updating category:', error)
      toast.error(error.response.data.error) // Show error alert
    }
  }

  // ### DELETE ####
  const handleDeleteSelected = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/model/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        setFilteredData(filteredData.filter((item) => item._id !== id))
        toast.error('Record deleted successfully')
      } catch (error) {
        setError(error.response.data.error)
        console.error('Error deleting record:', error)
        toast.error(error.response.data.error)
      }
    }
  }

  // PDF download
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

      const addMetadata = () => {
        const metadata = [{ label: 'User:', value: decodedToken.username || 'N/A' }]

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

      // Main document creation
      addHeader()

      // Title and date
      doc.setFontSize(24)
      doc.setFont(CONFIG.fonts.primary, 'bold')
      doc.text('Model Report', CONFIG.layout.margin, 35)

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

      // Add Metadata (including Username)
      addMetadata()

      // Table data preparation
      const tableColumns = ['SN', 'Model Name']

      const tableRows = filteredData.map((item, rowIndex) => {
        return [
          rowIndex + 1, // Serial Number
          item.modelName || '--', // Model Name
        ]
      })

      // Generate the table
      doc.autoTable({
        startY: 55, // Start below the metadata
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
          1: { cellWidth: 'auto' }, // Auto-adjust column width
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
      const filename = `Model_Report_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF Export Error:', error)
      toast.error(error.message || 'Failed to export PDF')
    }
  }

  // Excel Download

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
          { header: 'Model Name', width: 25 },
          // Add any other necessary columns here
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

      // Initialize workbook and worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Model Data Report')

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
        const subtitleRow = worksheet.addRow(['Model Data Report'])
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
        worksheet.addRow([`Username: ${decodedToken.username || 'N/A'}`]) // Add the username
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

        // Add data rows from filteredData
        const tableData = filteredData.map((item, index) => ({
          SN: index + 1,
          'Model Name': item.modelName || '--',
        }))

        tableData.forEach((rowData) => {
          const dataRow = worksheet.addRow(Object.values(rowData))
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
      const filename = `Model_Data_Report_${new Date().toISOString().split('T')[0]}.xlsx`
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

  // Add after filterData function
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'modelName') {
      const nameA = a.modelName?.toLowerCase() || ''
      const nameB = b.modelName?.toLowerCase() || ''
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    }
    return 0
  })

  // Download toggle dropdown
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

  // COndition of handel all the dropdown items
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

  if (error === 'Model already exists') {
    return <Page404 />
  }

  return (
    <div className="d-flex flex-column mx-md-3 mt-3 h-auto">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Header and Add Category button */}

      {/* Table */}
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader className="grand d-flex justify-content-between align-items-center">
              <strong>Model</strong>
              <div className="d-flex gap-3 justify-content-center align-items-center">
                <div className="input-group">
                  <InputBase
                    type="search"
                    className="form-control border"
                    style={{ height: '40px' }}
                    placeholder="Search for Model"
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
                <button
                  onClick={handleAddModalOpen} // Open add modal on button click
                  variant="contained"
                  className="btn text-white"
                  style={{ backgroundColor: '#0a2d63', width: '160px' }}
                >
                  Add Model
                </button>
              </div>
            </CCardHeader>
            <TableContainer
              component={Paper}
              sx={{
                height: 'auto', // Set the desired height
                overflowX: 'auto', // Enable horizontal scrollbar
                overflowY: 'auto', // Enable vertical scrollbar if needed
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
                        className="text-center text-white sr-no table-cell"
                        style={{ backgroundColor: '#0a2d63' }}
                      >
                        <strong>SN</strong>
                      </CTableHeaderCell>

                      <CTableHeaderCell
                        className="text-center text-white sr-no table-cell"
                        style={{ backgroundColor: '#0a2d63', cursor: 'pointer' }}
                        onClick={() => handleSort('modelName')}
                      >
                        <strong>Model Name</strong>
                        {sortBy === 'modelName' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                      </CTableHeaderCell>

                      <CTableHeaderCell
                        className="text-center text-white sr-no table-cell"
                        style={{ backgroundColor: '#0a2d63' }}
                      >
                        <strong>Actions</strong>
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {loading ? (
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
                    ) : filteredData.length > 0 ? (
                      sortedData.map((item, index) => (
                        <CTableRow key={item._id}>
                          <CTableDataCell
                            className="text-center  p-0"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {index + 1}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center  p-0"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {item.modelName}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center  p-0"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {/* Row layout for the icons */}
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                gap: '10px',
                              }}
                            >
                              <IconButton
                                aria-label="edit"
                                onClick={() => handleEditModalOpen(item)}
                              >
                                <RiEdit2Fill
                                  style={{ fontSize: '20px', color: 'lightBlue', margin: '3px' }}
                                />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                onClick={() => handleDeleteSelected(item._id)}
                                sx={{ color: 'red' }}
                              >
                                <AiFillDelete
                                  style={{ fontSize: '20px', color: 'red', margin: '3px' }}
                                />
                              </IconButton>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="2" className="text-center">
                          <div
                            className="d-flex flex-column justify-content-center align-items-center"
                            style={{ height: '200px' }}
                          >
                            <p className="mb-0 fw-bold">
                              "Oops! Looks like there's No Model available.
                              <br /> Maybe it's time to create new Model!"
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
                                Add Model
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

      <div className="position-fixed bottom-0 end-0 mb-5 m-3 z-5">
        <IconDropdown items={dropdownItems} />
      </div>

      {/* Add Modal */}
      <Modal open={addModalOpen} onClose={handleAddModalClose}>
        <Box sx={style}>
          <div className="d-flex justify-content-between">
            <Typography variant="h6">Add New Model</Typography>
            <IconButton onClick={handleAddModalClose}>
              <CloseIcon />
            </IconButton>
          </div>
          <form onSubmit={handleAddSubmit}>
            <FormControl style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <TextField
                name="modelName"
                value={formData.modelName || ''}
                onChange={handleInputChange}
                label="Model Name"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ViewComfyIcon
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
              <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginTop: '20px' }}
              >
                Add
              </Button>
            </FormControl>
          </form>
        </Box>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModalOpen} onClose={handleEditModalClose}>
        <Box sx={style}>
          <div className="d-flex justify-content-between">
            <Typography variant="h6">Edit Model</Typography>
            <IconButton onClick={handleEditModalClose}>
              <CloseIcon />
            </IconButton>
          </div>
          <form onSubmit={handleEditSubmit}>
            <FormControl style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <TextField
                name="modelName"
                value={formData.modelName || ''}
                onChange={handleInputChange}
                label="Model Name"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ViewComfyIcon
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
              <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginTop: '20px' }}
              >
                Update
              </Button>
            </FormControl>
          </form>
        </Box>
      </Modal>
    </div>
  )
}

export default Model
