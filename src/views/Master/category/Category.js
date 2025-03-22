import React, { useState, useEffect } from 'react'
import axios from 'axios'
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
  InputAdornment,
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
import 'jspdf-autotable' // For table formatting in PDF.
import CIcon from '@coreui/icons-react'
import CategoryIcon from '@mui/icons-material/Category'
import { cilSettings } from '@coreui/icons'
import '../../../../src/app.css'
import SearchIcon from '@mui/icons-material/Search'
import IconDropdown from '../../../components/ButtonDropdown'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { jwtDecode } from 'jwt-decode'
import { FaRegFilePdf, FaPrint } from 'react-icons/fa6'
import { PiMicrosoftExcelLogo } from 'react-icons/pi'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaArrowUp } from 'react-icons/fa'
import Page404 from '../../pages/page404/Page404'

const accessToken = Cookies.get('authToken')
const decodedToken = jwtDecode(accessToken)

const Category = () => {
  // Add these state variables at the top of the component
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [limit, setLimit] = useState(10)
  const [pageCount, setPageCount] = useState()
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const handleEditModalClose = () => {
    setFormData({})
    setEditModalOpen(false)
  }

  const handleAddModalClose = () => {
    setFormData({})
    setAddModalOpen(false)
  }

  const style = {
    position: 'absolute',
    top: '50%',
    borderRadius: '10px',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '35%',
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

  // ##################### getting data  ###################
  const fetchCategoryData = async (page = 1) => {
    const accessToken = Cookies.get('authToken')
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/category`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })

      if (response.data) {
        setData(response.data)
        setPageCount(response.data.totalPages)
        setLoading(false)
      }
    } catch (error) {
      setError(error.message)
      setLoading(false)
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
    }
  }

  // ##################### Filter data by search query #######################
  const filterCategory = () => {
    if (!searchQuery) {
      setFilteredData(data) // No query, show all drivers
    } else {
      const filtered = data.filter((category) =>
        category.categoryName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredData(filtered)
      setCurrentPage(1)
    }
  }

  useEffect(() => {
    fetchCategoryData()
  }, [])

  useEffect(() => {
    filterCategory(searchQuery)
  }, [data, searchQuery])

  const handlePageClick = (e) => {
    console.log(e.selected + 1)
    let page = e.selected + 1
    setCurrentPage(page)
    setLoading(true)
    fetchCategoryData(page)
  }

  // #########################################################################

  //  ####################  Add Group ###########################

  const handleAddCategory = async (e) => {
    e.preventDefault()
    console.log(formData)
    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/category`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 201) {
        toast.success('Category is created successfully')
        fetchCategoryData()
        setFormData({ name: '' })
        setAddModalOpen(false)
      }
    } catch (error) {
      setError(error.message)
      toast.error('An error occured')
      throw error.response ? error.response.data : new Error('An error occurred')
    }
  }

  // ###################################################################
  // ######################### Edit Group #########################

  const handleEditCategory = async (e) => {
    e.preventDefault()
    console.log(formData)
    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/category/${formData._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (response.status === 200) {
        toast.success('Cattegory is edited successfully')
        fetchCategoryData()
        setFormData({ name: '' })
        setEditModalOpen(false)
      }
    } catch (error) {
      setError(error.message)
      toast.error('An error occured')
      throw error.response ? error.response.data : new Error('An error occurred')
    }
  }

  const handleDeleteCategory = async (item) => {
    console.log(item)
    setEditModalOpen(true)
    setFormData({ ...item })
    console.log('this is before edit', formData)
  }

  // ###################################################################

  // ###################### Delete Group ##############################

  const deleteCategorySubmit = async (item) => {
    const confirmed = confirm('Do you want to delete this Category?')
    // If the user cancels, do nothing
    if (!confirmed) return

    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/category/${item._id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 200) {
        toast.error('category is deleted successfully')
        fetchCategoryData()
      }
    } catch (error) {
      setError(error.message)
      toast.error('An error occurred')
      throw error.response ? error.response.data : new Error('An error occurred')
    }
  }

  // /Excel download

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
          { header: 'Category Name', width: 25 },
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
      const worksheet = workbook.addWorksheet('Category Data')

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
        worksheet.mergeCells('A1:B1')

        // Report title
        const subtitleRow = worksheet.addRow(['Category Data'])
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
        worksheet.mergeCells('A2:B2')

        // Metadata (you can add more as required)
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

        // Add data rows from filteredData
        filteredData.forEach((item, index) => {
          const rowData = [
            index + 1,  // SN (Serial Number)
            item.categoryName || 'N/A',  // Category Name
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
        worksheet.mergeCells(`A${footerRow.number}:B${footerRow.number}`)
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
      const filename = `Category_Data_${new Date().toISOString().split('T')[0]}.xlsx`
      saveAs(blob, filename)
      toast.success('Excel file downloaded successfully')
    } catch (error) {
      console.error('Excel Export Error:', error)
      toast.error(error.message || 'Failed to export Excel file')
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

      const addMetadata = () => {
        const metadata = [
          { label: 'User:', value: decodedToken.username || 'N/A' },

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
      doc.text('Category Report', CONFIG.layout.margin, 35)

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

      // Replace this part with your table data
      const tableColumns = ['SN', 'Category Name']; // Define the headers
      const tableRows = filteredData.map((item, index) => {
        return [
          index + 1, // Serial Number
          item.categoryName || '--', // Category Name with fallback
        ]
      })

      // Generate table with full width
      const pageWidth = doc.internal.pageSize.width
      const tableMargin = CONFIG.layout.margin * 2
      const tableWidth = pageWidth - tableMargin

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
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
        },
        margin: { left: CONFIG.layout.margin, right: CONFIG.layout.margin },
        tableWidth: tableWidth, // Full width table
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
      const filename = `Category_Report_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF Export Error:', error)
      toast.error(error.message || 'Failed to export PDF')
    }
  }

  // Add this function after the state declarations
  const handleSort = (column) => {
    const isAsc = sortBy === column && sortOrder === 'asc'
    setSortOrder(isAsc ? 'desc' : 'asc')
    setSortBy(column)
  }

  // Add this computed value after the filter logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'categoryName') {
      const nameA = a.categoryName?.toLowerCase() || ''
      const nameB = b.categoryName?.toLowerCase() || ''
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    }
    return 0
  })
  //  ###############################################################

  // Dropdown items all handel here

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

  // all handel here

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

  if (error) return <Page404 />


  return (
    <div className="d-flex flex-column mx-md-3 mt-3 h-auto">
      <Toaster position="top-center" reverseOrder={false} />
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
              <strong>Category</strong>
              <div className="d-flex gap-3">
                <div className="input-group">
                  <InputBase
                    type="search"
                    className="form-control border"
                    style={{ height: '40px' }}
                    placeholder="Search for Category"
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
                    style={{ backgroundColor: '#0a2d63', width: '130px' }}
                  >
                    Add Category
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
                  style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}
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
                        SN
                      </CTableHeaderCell>

                      <CTableHeaderCell
                        className="text-center text-white sr-no table-cell"
                        style={{ backgroundColor: '#0a2d63', cursor: 'pointer' }}
                        onClick={() => handleSort('categoryName')}
                      >
                        Category Name
                        {sortBy === 'categoryName' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                      </CTableHeaderCell>

                      <CTableHeaderCell
                        className="text-center text-white sr-no table-cell"
                        style={{ backgroundColor: '#0a2d63' }}
                      >
                        Actions
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
                            {item.categoryName}
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
                              onClick={() => handleDeleteCategory(item)}
                            >
                              <RiEdit2Fill
                                style={{ fontSize: '20px', color: 'lightBlue', margin: '3px' }}
                              />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={() => deleteCategorySubmit(item)}
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
                        <CTableDataCell colSpan="3" className="text-center">
                          <div
                            className="d-flex flex-column justify-content-center align-items-center"
                            style={{ height: '200px' }}
                          >
                            <p className="mb-0 fw-bold">
                              "Oops! Looks like there's no Category available.
                              <br /> Maybe it's time to create some Categories!"
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
                                Add Category
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



      {pageCount > 1 && (
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
      )}

      {/* Add Modal */}

      <Modal
        open={addModalOpen}
        onClose={handleAddModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="d-flex justify-content-between">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add New Category
            </Typography>
            <IconButton
              // style={{ marginLeft: 'auto', marginTop: '-40px', color: '#aaa' }}
              onClick={handleAddModalClose}
            >
              <CloseIcon />
            </IconButton>
          </div>
          <DialogContent>
            <form onSubmit={handleAddCategory}>
              <FormControl style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <TextField
                  label="Category Name"
                  name="name"
                  value={formData.categoryName !== undefined ? formData.categoryName : ''}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon
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
              <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginTop: '20px' }}
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
              Edit Category
            </Typography>
            <IconButton
              // style={{ marginLeft: 'auto', marginTop: '-40px', color: '#aaa' }}
              onClick={handleEditModalClose}
            >
              <CloseIcon />
            </IconButton>
          </div>
          <DialogContent>
            <form onSubmit={handleEditCategory}>
              <FormControl style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <TextField
                  label="Category Name"
                  name="name"
                  value={formData.categoryName !== undefined ? formData.categoryName : ''}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon
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
              <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginTop: '20px' }}
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

export default Category
