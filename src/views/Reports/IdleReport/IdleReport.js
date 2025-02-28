import React, { useEffect, useMemo, useState } from 'react'
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
  CTooltip,
} from '@coreui/react'
import Select from 'react-select'
import Cookies from 'js-cookie'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // For table in PDF
import * as XLSX from 'xlsx'
import idel from 'src/status/idel.png'
import ignitionOff from 'src/status/power-off.png'
import ignitionOn from 'src/status/power-on.png'
import Loader from '../../../components/Loader/Loader'
import '../style/remove-gutter.css'
import '../../../utils.css'
import idels from 'src/status/idel.png'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import IconDropdown from '../../../components/ButtonDropdown'
import { FaRegFilePdf, FaPrint } from 'react-icons/fa6'
import { PiMicrosoftExcelLogo } from 'react-icons/pi'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaArrowUp } from 'react-icons/fa'
import toast, { Toaster } from 'react-hot-toast'
import { jwtDecode } from 'jwt-decode'
const accessToken = Cookies.get('authToken')
const decodedToken = jwtDecode(accessToken)

const SearchIdeal = ({
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
  const [showDateInputs, setShowDateInputs] = useState(false)
  const [selectedU, setSelectedU] = useState()
  const [selectedG, setSelectedG] = useState()
  // State to manage button text
  const [buttonText, setButtonText] = useState('SHOW NOW')
  const [isDropdownOpen, setDropdownOpen] = useState(false) // State to manage dropdown visibility

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
            console.log('Selected user:', selectedUser)
            getGroups(selectedUser)
          }}
          placeholder="Choose a user..."
          isLoading={loading} // Show a loading spinner while fetching users
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
          placeholder="Choose a group..."
          isLoading={loading} // Show a loading spinner while fetching groups
        />

        <CFormFeedback invalid>Please provide a valid Vehilce.</CFormFeedback>
      </CCol>

      <CCol md={2}>
        <CFormLabel htmlFor="devices">Vehicles</CFormLabel>
        <Select
          id="devices"
          options={
            devices.length > 0
              ? devices.map((device) => ({ value: device.deviceId, label: device.name }))
              : [{ value: '', label: 'Loading vehilces...', isDisabled: true }]
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
        />

        <CFormFeedback invalid>Please provide a valid vehicle.</CFormFeedback>
      </CCol>

      <CCol md={2}>
        <CFormLabel htmlFor="periods">Periods</CFormLabel>
        <Select
          id="periods"
          options={[
            { value: '', label: 'Choose a period...' },
            { value: 'Today', label: 'Today' },
            { value: 'Yesterday', label: 'Yesterday' },
            { value: 'This Week', label: 'This Week' },
            { value: 'Previous Week', label: 'Previous Week' },
            { value: 'This Month', label: 'This Month' },
            { value: 'Previous Month', label: 'Previous Month' },
            { value: 'Custom', label: 'Custom' },
          ]}
          value={formData.Periods ? { value: formData.Periods, label: formData.Periods } : null}
          onChange={(selectedOption) => handlePeriodChange(selectedOption?.value)}
          placeholder="Choose a period..."
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
              style={{ backgroundColor: '#0a2d63' }}
              type="button"
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

const ShowIdeal = ({
  apiData,
  selectedColumns,
  selectedDeviceName,
  statusLoading,
  selectedGroupName,
  selectedUserName,
  selectedFromDate,
  selectedToDate,
  selectedPeriod,
}) => {

  const [sortConfig, setSortConfig] = useState({ key: 'idleStartTime', direction: 'asc' })
  const [dataWithAddresses, setDataWithAddresses] = useState([])
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa', selectedUserName)

  // Address api code

  const addressCache = {};

  const getAddressFromLatLng = async (latitude, longitude, rowId) => {
    const cacheKey = `${latitude},${longitude}`;
    if (addressCache[cacheKey]) {
      return addressCache[cacheKey]; // Return cached result
    }

    const apiKey = 'CWVeoDxzhkO07kO693u0';
    const url = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const features = response.data.features;

      if (features && features.length > 0) {
        const address = features[0].place_name;
        addressCache[cacheKey] = address; // Cache the result
        return address;
      } else {
        return 'Address not found';
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Address not found';
    }
  };




  // Function to map over API data and fetch addresses
  const mapDataWithAddress = async () => {
    if (!apiData || apiData.length === 0) return apiData;

    const updatedData = await Promise.all(
      apiData.map(async (row) => {
        if (row.idleArray && row.idleArray.length > 0) {
          const updatedNestedData = await Promise.all(
            row.idleArray.map(async (nestedRow) => {
              // Check if latitude and longitude exist and address is not already present
              if (nestedRow.latitude && nestedRow.longitude && !nestedRow.address) {
                const latitude = nestedRow.latitude;
                const longitude = nestedRow.longitude;

                const address = await getAddressFromLatLng(latitude, longitude);
                console.log("Fetched address:", address);
                return {
                  ...nestedRow,
                  address,
                };
              }
              return nestedRow;
            })
          );
          return { ...row, idleArray: updatedNestedData };
        }
        return row;
      })
    );

    return updatedData;
  };


  // Fetch addresses when apiData changes
  useEffect(() => {
    const fetchDataWithAddresses = async () => {
      const updatedData = await mapDataWithAddress();
      setDataWithAddresses(updatedData);
      console.log("updatedddddeded", updatedData)
    };

    if (apiData && apiData.length > 0) {
      fetchDataWithAddresses();
    }
  }, [apiData]);


  // Flatten the data
  const enhancedFlattenedData = useMemo(() => {
    if (!dataWithAddresses) return [];

    return dataWithAddresses.flatMap(
      (row, rowIndex) =>
        row.idleArray?.map((idle, nestedIndex) => ({
          ...idle,
          parentRow: row,
          vehicleName: row.device?.name || selectedDeviceName || '--',
          deviceId: row.deviceId || '--',
          rowIndex: rowIndex + 1,
          nestedIndex: nestedIndex + 1,
          durationSeconds: (new Date(idle.idleEndTime) - new Date(idle.idleStartTime)) / 1000,
        })) || []
    );
  }, [dataWithAddresses, selectedDeviceName]);

  const columnKeyMap = {
    'Start Time': 'idleStartTime',
    Duration: 'duration',
    Location: 'address',
    'Co-ordinates': 'location',
    'End Time': 'idleEndTime',
  }

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Sorted data
  const sortedFlattenedData = React.useMemo(() => {
    const data = [...enhancedFlattenedData]

    if (!sortConfig.key) return data

    return data.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      // Handle missing values gracefully
      if (aValue === undefined || bValue === undefined) return 0

      switch (sortConfig.key) {
        case 'idleStartTime': // Corrected key
        case 'idleEndTime': // Corrected key
          return sortConfig.direction === 'asc'
            ? new Date(aValue) - new Date(bValue)
            : new Date(bValue) - new Date(aValue)

        case 'durationSeconds':
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue

        default:
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue)
          }
          return 0
      }
    })
  }, [enhancedFlattenedData, sortConfig])

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
      if (!Array.isArray(sortedFlattenedData) || sortedFlattenedData.length === 0) {
        throw new Error('No data available for Excel export')
      }

      // Configuration constants and style settings
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

      // Build the Excel columns dynamically:
      // Fixed columns first, then dynamic columns based on selectedColumns.
      // Adjust column widths as needed.
      const fixedColumns = [
        { header: 'SN', width: 8 },
        { header: 'Vehicle Name', width: 25 },
      ]
      const dynamicColumns = selectedColumns.map((col) => {
        let width = 20
        if (col === 'Duration') {
          width = 20
        } else if (col === 'Location') {
          width = 35
        } else if (col === 'Co-ordinates') {
          width = 25
        } else if (col === 'Start Time') {
          width = 25
        } else if (col === 'End Time') {
          width = 25
        }
        return { header: col, width }
      })

      // Combined columns array
      const excelColumns = [...fixedColumns, ...dynamicColumns]
      const totalColumns = excelColumns.length

      // Helper functions for formatting data
      const formatExcelDate = (dateString, useArrival = true) => {
        if (!dateString) return '--'
        const date = new Date(dateString)
        if (isNaN(date)) return '--'
        // Adjust time by subtracting 5 hours and 30 minutes as in your table
        date.setHours(date.getHours() - 5, date.getMinutes() - 30)
        return date.toLocaleString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      }

      // Initialize workbook and worksheet using ExcelJS
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Idle Report')

      // Add title and metadata at the top of the sheet
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
        // Merge cells from A1 to the last column
        worksheet.mergeCells(1, 1, 1, totalColumns)

        // Report title row
        const subtitleRow = worksheet.addRow(['Idle Report'])
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
        worksheet.mergeCells(2, 1, 2, totalColumns)

        // Metadata rows
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
          `Selected Vehicle: ${selectedDeviceName || '--'}`,
        ])
        worksheet.addRow([`Generated: ${new Date().toLocaleString()}`])
        worksheet.addRow([]) // Spacer row
      }

      // Add the data table with header and data rows
      const addDataTable = () => {
        // Build the header row using the dynamically built excelColumns array
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

        // Loop over each row in sortedFlattenedData and add data rows
        sortedFlattenedData.forEach((item, index) => {
          const rowData = []
          // Fixed first column: serial number
          rowData.push(index + 1)
          // Fixed second column: Vehicle Name
          rowData.push(item.vehicleName || '--')

          // Process each dynamic column in the order of selectedColumns
          selectedColumns.forEach((column) => {
            let cellValue = '--'
            switch (column) {
              case 'Start Time': {
                if (item.idleStartTime) {
                  const formattedDate = new Date(item.idleStartTime).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  cellValue = formattedDate;
                } else {
                  cellValue = '--';
                }
                break
              }
              case 'Duration': {
                // Convert seconds into HH:MM:SS
                if (item.durationSeconds != null) {
                  cellValue = new Date(item.durationSeconds * 1000).toISOString().substr(11, 8)
                }
                break
              }
              case 'Location': {
                cellValue = item.address || item.location || '--'
                break
              }
              case 'Co-ordinates': {
                cellValue = item.latitude && item.longitude
                  ? `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`
                  : '--';
                break
              }
              case 'Start Time': {
                cellValue = formatExcelDate(item.arrivalTime)
                break
              }
              case 'End Time': {
                if (item.idleEndTime) {
                  const formattedDate = new Date(item.idleEndTime).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  cellValue = formattedDate;
                } else {
                  cellValue = '--';
                }
                break
              }
              default: {
                cellValue = '--'
              }
            }
            rowData.push(cellValue)
          })

          // Add the row and style each cell
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

        // Set the column widths based on our dynamically built excelColumns array
        worksheet.columns = excelColumns.map((col) => ({
          width: col.width,
          style: { alignment: { horizontal: 'left' } },
        }))
      }

      // Add footer with copyright text
      const addFooter = () => {
        worksheet.addRow([]) // Spacer
        const footerRow = worksheet.addRow([CONFIG.company.copyright])
        footerRow.font = { italic: true }
        worksheet.mergeCells(
          `A${footerRow.number}:${String.fromCharCode(64 + totalColumns)}${footerRow.number}`,
        )
      }

      // Build the document
      addHeaderSection()
      addDataTable()
      addFooter()

      // Generate the Excel file and trigger the download
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const filename = `Idle_Report_${new Date().toISOString().split('T')[0]}.xlsx`
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
      if (!Array.isArray(sortedFlattenedData) || sortedFlattenedData.length === 0) {
        throw new Error('No data available for PDF export');
      }

      // Constants and configuration
      const CONFIG = {
        colors: {
          primary: [10, 45, 99],  // Company primary color
          secondary: [70, 70, 70],  // Secondary color for text
          accent: [0, 112, 201],  // Accent color for highlights
          border: [220, 220, 220],  // Border color
          background: [249, 250, 251],  // Background color
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
      };

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Helper functions for color application
      const applyPrimaryColor = () => {
        doc.setFillColor(...CONFIG.colors.primary);
        doc.setTextColor(...CONFIG.colors.primary);
      };

      const applySecondaryColor = () => {
        doc.setTextColor(...CONFIG.colors.secondary);
      };

      const addHeader = () => {
        // Company logo and name
        doc.setFillColor(...CONFIG.colors.primary);
        doc.rect(CONFIG.company.logo.x, CONFIG.company.logo.y, CONFIG.company.logo.size, CONFIG.company.logo.size, 'F');
        doc.setFont(CONFIG.fonts.primary, 'bold');
        doc.setFontSize(16);
        doc.text(CONFIG.company.name, 28, 21);

        // Header line
        doc.setDrawColor(...CONFIG.colors.primary);
        doc.setLineWidth(0.5);
        doc.line(CONFIG.layout.margin, 25, doc.internal.pageSize.width - CONFIG.layout.margin, 25);
      };

      const addMetadata = () => {
        const metadata = [
          { label: 'User:', value: decodedToken.username || 'N/A' },
          { label: 'Selected User:', value: selectedUserName || 'N/A' },
          { label: 'Group:', value: selectedGroupName || 'N/A' },
          {
            label: 'Date Range:', value: selectedFromDate && selectedToDate
              ? `${selectedFromDate} - ${selectedToDate}`
              : getDateRangeFromPeriod(selectedPeriod)
          },
          { label: 'Vehicle:', value: selectedDeviceName || 'N/A' },
        ];


        doc.setFontSize(10);
        doc.setFont(CONFIG.fonts.primary, 'bold');

        let yPosition = 45;
        const xPosition = CONFIG.layout.margin;
        const lineHeight = CONFIG.layout.lineHeight;

        metadata.forEach((item) => {
          doc.text(`${item.label} ${item.value.toString()}`, xPosition, yPosition);
          yPosition += lineHeight;
        });
      };

      const addFooter = () => {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);

          // Footer line
          doc.setDrawColor(...CONFIG.colors.border);
          doc.setLineWidth(0.5);
          doc.line(
            CONFIG.layout.margin,
            doc.internal.pageSize.height - 15,
            doc.internal.pageSize.width - CONFIG.layout.margin,
            doc.internal.pageSize.height - 15
          );

          // Copyright text
          doc.setFontSize(9);
          applySecondaryColor();
          doc.text(
            `© ${CONFIG.company.name}`,
            CONFIG.layout.margin,
            doc.internal.pageSize.height - 10
          );

          // Page number
          const pageNumber = `Page ${i} of ${pageCount}`;
          const pageNumberWidth = doc.getTextWidth(pageNumber);
          doc.text(
            pageNumber,
            doc.internal.pageSize.width - CONFIG.layout.margin - pageNumberWidth,
            doc.internal.pageSize.height - 10
          );
        }
      };

      // Helper function to format dates
      const formatDateTime = (dateString) => {
        if (!dateString) return '--';
        const date = new Date(dateString);
        if (isNaN(date)) return '--';
        date.setHours(date.getHours() - 5, date.getMinutes() - 30);
        return date.toLocaleString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      };

      // Build dynamic table columns
      const pdfColumns = ['SN', 'Vehicle Name', ...selectedColumns];

      // Build table rows from sortedFlattenedData
      const tableRows = sortedFlattenedData.map((item, index) => {
        const rowData = [];
        // Fixed first column: serial number
        rowData.push(index + 1);
        // Fixed second column: Vehicle Name
        rowData.push(item.vehicleName || '--');

        // Dynamic columns based on selectedColumns array
        selectedColumns.forEach((column) => {
          let cellValue = '--';
          switch (column) {
            case 'Start Time':
              if (item.idleStartTime) {
                const formattedDate = new Date(item.idleStartTime).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                cellValue = formattedDate;
              } else {
                cellValue = '--';
              }
              break;
            case 'Duration':
              cellValue = item.duration || '--';
              break;
            case 'Location':
              cellValue = item.address || item.location || '--';
              break;
            case 'Co-ordinates':
              cellValue = item.latitude && item.longitude
                ? `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`
                : '--';
              break;

            case 'End Time':
              if (item.idleEndTime) {
                const formattedDate = new Date(item.idleEndTime).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                cellValue = formattedDate;
              } else {
                cellValue = '--';
              }
              break;
            default:
              cellValue = '--';
          }
          rowData.push(cellValue);
        });

        return rowData;
      });

      // Optional: Define dynamic column styles (set widths, etc.)
      const dynamicColumnStyles = {};
      dynamicColumnStyles[0] = { cellWidth: 20 };
      dynamicColumnStyles[1] = { cellWidth: 70 };
      selectedColumns.forEach((col, i) => {
        const colIndex = i + 2;
        if (col === 'Start Time') {
          dynamicColumnStyles[colIndex] = { cellWidth: 35 };
        } else if (col === 'Location') {
          dynamicColumnStyles[colIndex] = { cellWidth: 35 };
        } else if (col === 'Co-ordinates') {
          dynamicColumnStyles[colIndex] = { cellWidth: 35 };
        } else if (col === 'Duration') {
          dynamicColumnStyles[colIndex] = { cellWidth: 35 };
        } else if (col === 'End Time') {
          dynamicColumnStyles[colIndex] = { cellWidth: 35 };
        }
        else {
          dynamicColumnStyles[colIndex] = { cellWidth: 35 };
        }
      });

      // Main document creation
      addHeader();

      // Title and generated date
      doc.setFontSize(24);
      doc.setFont(CONFIG.fonts.primary, 'bold');
      doc.text('Idle Report', CONFIG.layout.margin, 35);

      const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const dateText = `Generated: ${currentDate}`;
      applySecondaryColor();
      doc.setFontSize(10);
      doc.text(
        dateText,
        doc.internal.pageSize.width - CONFIG.layout.margin - doc.getTextWidth(dateText),
        21
      );

      addMetadata();

      // Generate table using autoTable with dynamic header and rows
      doc.autoTable({
        startY: 65,
        head: [pdfColumns],
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
        columnStyles: dynamicColumnStyles,
        margin: { left: CONFIG.layout.margin, right: CONFIG.layout.margin },
        didDrawPage: (data) => {
          // Add header on subsequent pages if needed
          if (doc.getCurrentPageInfo().pageNumber > 1) {
            doc.setFontSize(15);
            doc.setFont(CONFIG.fonts.primary, 'bold');
            doc.text('Idle Report', CONFIG.layout.margin, 10);
          }
        },
      });

      addFooter();

      // Save PDF
      const filename = `Idle_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error(error.message || 'Failed to export PDF');
    }
  };

  // Handel buttons
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

      <CTable bordered className="custom-table">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell style={{ backgroundColor: '#0a2d63', color: 'white' }}>
              SN
            </CTableHeaderCell>
            <CTableHeaderCell style={{ backgroundColor: '#0a2d63', color: 'white' }}>
              Vehicle Name
            </CTableHeaderCell>
            <CTableHeaderCell style={{ backgroundColor: '#0a2d63', color: 'white' }}>
              Vehicle Status
            </CTableHeaderCell>
            {selectedColumns.map((column, index) => (
              <CTableHeaderCell
                key={index}
                style={{
                  backgroundColor: '#0a2d63',
                  color: 'white',
                  cursor: columnKeyMap[column] ? 'pointer' : 'default',
                }}
                onClick={() => columnKeyMap[column] && handleSort(columnKeyMap[column])}
              >
                {column}
                {sortConfig.key === columnKeyMap[column] && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </CTableHeaderCell>
            ))}
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {statusLoading ? (
            <CTableRow style={{ position: 'relative' }}>
              <CTableDataCell
                colSpan={selectedColumns.length + 3}
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
          ) : !statusLoading && sortedFlattenedData.length > 0 ? (
            sortedFlattenedData.map((item, index) => (
              <CTableRow key={`${item.deviceId}-${index}`} className="custom-row">
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{item.vehicleName || '--'}</CTableDataCell>
                <CTableDataCell style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img
                    src={idels}
                    alt="Vehicle Status"
                    title="Idle"
                    style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                  />
                </CTableDataCell>
                {selectedColumns.map((column, colIndex) => (
                  <CTableDataCell key={colIndex}>
                    {(() => {
                      switch (column) {
                        case 'Start Time':
                          return item.idleStartTime
                            ? new Date(item.idleStartTime).toLocaleString('en-GB', { timeZone: 'UTC', hour12: false })
                            : '--';
                        case 'End Time':
                          return item.idleEndTime
                            ? new Date(item.idleEndTime).toLocaleString('en-GB', { timeZone: 'UTC', hour12: false })
                            : '--';
                        case 'Duration':
                          return item.duration || '--';
                        case 'Location':
                          return item.address || 'No Address Found...';
                        case 'Co-ordinates':
                          return item.latitude && item.longitude
                            ? `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`
                            : '--';
                        case 'Vehicle Status':
                          return item.speed !== undefined && item.speed === 0 ? 'Idle' : 'Moving';
                        case 'Total Duration':
                          return item.durationSeconds
                            ? new Date(item.durationSeconds * 1000).toISOString().substr(11, 8)
                            : '--';
                        default:
                          return '--';
                      }
                    })()}
                  </CTableDataCell>
                ))}
              </CTableRow>
            ))
          ) : (
            !statusLoading && (
              <CTableRow>
                <CTableDataCell colSpan={selectedColumns.length + 3} style={{ textAlign: 'center', fontStyle: 'italic' }}>
                  No data available
                </CTableDataCell>
              </CTableRow>
            )
          )}
        </CTableBody>

      </CTable>

      <div className="position-fixed bottom-0 end-0 mb-5 m-3 z-5">
        <IconDropdown items={dropdownItems} />
      </div>
    </>

  )
}

const Ideal = () => {
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
  const [showMap, setShowMap] = useState(false) //show mapping data
  const accessToken = Cookies.get('authToken')
  const [statusLoading, setStatusLoading] = useState(false)
  const [columns] = useState(['Start Time', 'Duration', 'Location', 'Co-ordinates', 'End Time'])

  const [selectedColumns, setSelectedColumns] = useState([])
  const token = Cookies.get('authToken') //

  const [apiData, setApiData] = useState() //data from api

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

        // After setting the users, find the selected user based on formData.User
        const selectedUser = usersData.find((user) => user.userId === formData.User);
        const selectedUserName = selectedUser ? selectedUser.username : ''
        setSelectedUserName(selectedUserName)
        console.log('Selected User:', selectedUserName)
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
    console.log('DataAll', formData)

    // Convert the dates to ISO format if they're provided
    const fromDate = formData.FromDate ? new Date(formData.FromDate).toISOString() : ''
    const toDate = formData.ToDate
      ? new Date(
        new Date(formData.ToDate).setHours(23, 59, 59, 999) + (5 * 60 + 30) * 60000,
      ).toISOString()
      : ''

    const body = {
      deviceId: formData.Devices, // Use the device ID from the form data
      period: formData.Periods, // Use the selected period from the form data
      FromDate: fromDate,
      ToDate: toDate,
    }

    // console.log(token);
    // console.log(body);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/idleSummary?deviceIds=${body.deviceId}&period=${body.period}&from=${body.FromDate}&to=${body.ToDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Replace with your actual token
            'Content-Type': 'application/json',
          },
        },
      )

      // console.log(response.data.deviceDataByStatus[0]);

      console.log('All Idles reports')

      if (response.status == 200) {
        setApiData(response.data.data)
        setStatusLoading(false)
        console.log(response.data.data)
        console.log('done in all')
        console.log(response.data.data)
      }

      // Assuming the data returned is what you want to display in the table
      console.log('Form submitted with data:', body)
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
              style={{ backgroundColor: '#0a2d63' }}
            >
              <strong>Idle Report</strong>
            </CCardHeader>
            <CCardBody>
              <SearchIdeal
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
                <strong>
                  All Idle Report List {selectedDeviceName && `for ${selectedDeviceName}`}
                </strong>
              </CCardHeader>
              <CCardBody>
                <ShowIdeal
                  apiData={apiData}
                  selectedDeviceName={selectedDeviceName}
                  selectedColumns={selectedColumns}
                  statusLoading={statusLoading}
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

export default Ideal
