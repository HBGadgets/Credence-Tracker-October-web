import React, { useEffect, useState } from 'react'
import {
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
import ExcelJS from 'exceljs'
import Cookies from 'js-cookie'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // For table in PDF
import * as XLSX from 'xlsx'
import upLeft from 'src/direction/up-left-arrow.gif'
import upRight from 'src/direction/up-right-arrow.gif'
import downLeft from 'src/direction/down-left-arrow.gif'
import downRight from 'src/direction/down-right-arrow.gif'
import Loader from '../../../components/Loader/Loader'
import '../style/remove-gutter.css'
// import { saveAs } from 'file-saver';
import ignitionOff from 'src/status/power-off.png'
import ignitionOn from 'src/status/power-on.png'
import '../../../utils.css'
import { FaRegFilePdf, FaPrint } from 'react-icons/fa6'
import { PiMicrosoftExcelLogo } from 'react-icons/pi'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaArrowUp } from 'react-icons/fa'
import toast, { Toaster } from 'react-hot-toast'
import { jwtDecode } from 'jwt-decode'
import IconDropdown from '../../../components/ButtonDropdown'
import { saveAs } from 'file-saver'
import Page404 from '../../pages/page404/Page404'

const accessToken = Cookies.get('authToken')
const decodedToken = jwtDecode(accessToken)

const SearchStop = ({
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
            console.log('Selected userDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDd:', selectedUser)
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
              ? [{ value: '', label: 'Loading Vehicles...', isDisabled: true }]
              : devices?.length > 0
                ? devices.map((device) => ({ value: device.deviceId, label: device.name }))
                : [{ value: '', label: 'No Vehicles in this Group', isDisabled: true }]
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

        <CFormFeedback invalid>Please provide a valid Vehicles.</CFormFeedback>
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

const StopTable = ({
  apiData,
  selectedDeviceName,
  selectedColumns,
  statusLoading,
  selectedGroupName,
  selectedUserName,
  selectedFromDate,
  selectedToDate,
  selectedPeriod,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [locationData, setLocationData] = useState({})

  // Function to convert latitude and longitude into a location name

  // API Key
  const apiKey = 'CWVeoDxzhkO07kO693u0';

  let i = 0
  // Function to fetch location names using MapTiler API
  const fetchLocationName = async (lat, lng, rowId) => {
    const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const features = response.data.features;

      // Extract all location names into an array
      const locationNames = features.length > 0
        ? features.map((feature) => feature?.place_name || 'Unknown Location')
        : ['Unknown Location'];

      setLocationData((prevState) => ({
        ...prevState,
        [rowId]: locationNames, // Store array of locations with rowId
      }));

      sortedData[i].location = locationNames
      i++


      console.log("Fetched Addresses:", locationNames);
    } catch (error) {
      console.error('Error fetching location names:', error);
      setLocationData((prevState) => ({
        ...prevState,
        [rowId]: ['Error fetching location'],
      }));
    }
  };

  // Fetch location data when apiData changes
  useEffect(() => {
    if (apiData?.finalDeviceDataByStopage?.length > 0) {
      apiData.finalDeviceDataByStopage.forEach((row) => {
        if (row.latitude && row.longitude && !locationData[row.id]) {
          fetchLocationName(row.latitude, row.longitude, row.id);
        }
      });
    }
  }, [apiData]);  // Removed locationData to prevent infinite loop


  // Function to export table data to Excel

  const columnKeyMap = {
    'Start Time': 'arrivalTime',
    'End Time': 'departureTime',
    Speed: 'speed',
    Ignition: 'ignition',
    Direction: 'course',
  }

  // Sorting the data
  const sortedData = React.useMemo(() => {
    if (!apiData?.finalDeviceDataByStopage) return [];
    const data = [...apiData.finalDeviceDataByStopage];

    if (sortConfig.key) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        switch (sortConfig.key) {
          case 'arrivalTime':
          case 'departureTime': {
            const aDate = new Date(aValue);
            const bDate = new Date(bValue);
            return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
          }
          case 'speed':
          case 'course':
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          case 'ignition': {
            const aBool = aValue ? 1 : 0;
            const bBool = bValue ? 1 : 0;
            return sortConfig.direction === 'asc' ? aBool - bBool : bBool - aBool;
          }
          default:
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }
      });
    }
    return data;
  }, [apiData, sortConfig]);

  console.log('SORTED DATA:', sortedData)

  // EXPORT TO EXCEL FUNCTION
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
          ...selectedColumns.map((column) => ({ header: column, width: 25 })),
        ],
        company: {
          name: 'Credence Tracker',
          copyright: `© ${new Date().getFullYear()} Credence Tracker`,
        },
      }

      // Helper functions for formatting
      const formatExcelDate = (dateString) => {
        if (!dateString) return '--'
        const date = new Date(dateString)
        return isNaN(date) ? '--' : date.toLocaleString('en-GB')
      }

      const formatCoordinates = (lat, lon) => {
        if (lat == null || lon == null) return 'Fetching location...'
        return `${parseFloat(lat).toFixed(5)}, ${parseFloat(lon).toFixed(5)}`
      }

      // Helper function to get a cell's value based on column name
      const getColumnValue = (row, column, rowIndex) => {
        switch (column) {
          case 'Speed':
            // Assuming row.speed is in km/h already; otherwise, multiply by 3.6
            return row.speed != null ? row.speed.toFixed(2) + ' km/h' : '--'

          case 'Ignition':
            // Excel cannot render images so we output text
            return row.ignition === true ? 'ON' : 'OFF'

          case 'Direction':
            // Determine direction based on row.course
            if (row.course == null) return '--'
            if (row.course > 0 && row.course < 90) return 'North East'
            if (row.course >= 90 && row.course < 180) return 'North West'
            if (row.course >= 180 && row.course < 270) return 'South West'
            return 'South East'

          case 'Location':
            // Use locationData if available, otherwise show a default message.
            return locationData && locationData[rowIndex]
              ? locationData[rowIndex]
              : 'Fetching location...'

          case 'Co-ordinates':
            return row.latitude && row.longitude
              ? formatCoordinates(row.latitude, row.longitude)
              : 'Fetching location...'

          case 'Start Time': {
            if (!row.arrivalTime) return '--'
            // Adjusting the time as per your UI logic: subtract 5 hours and 30 minutes
            const arrival = new Date(row.arrivalTime)
            arrival.setHours(arrival.getHours() - 5, arrival.getMinutes() - 30)
            return arrival.toLocaleString([], {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          }

          case 'End Time': {
            if (!row.departureTime) return '--'
            // Adjusting the time as per your UI logic: subtract 5 hours and 30 minutes
            const departure = new Date(row.departureTime)
            departure.setHours(departure.getHours() - 5, departure.getMinutes() - 30)
            return departure.toLocaleString([], {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          }

          case 'Device Name':
            return row.device && row.device.name ? row.device.name : '--'

          default:
            return '--'
        }
      }

      // Initialize workbook and worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Status Report')

      // Add header section (company title, report title, and metadata)
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
        const subtitleRow = worksheet.addRow(['Stop Report'])
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

        // Add data rows based on sortedData
        sortedData.forEach((row, index) => {
          // Build the row array: first two cells then one for each selected column
          const rowData = [
            index + 1, // SN
            selectedDeviceName || '--', // Vehicle Name
            ...selectedColumns.map((col) => getColumnValue(row, col, index)),
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

        // Set column widths and default alignment
        worksheet.columns = CONFIG.columns.map((col) => ({
          width: col.width,
          style: { alignment: { horizontal: 'left' } },
        }))
      }

      // Add footer with copyright
      const addFooter = () => {
        worksheet.addRow([]) // Spacer row
        const footerRow = worksheet.addRow([CONFIG.company.copyright])
        footerRow.font = { italic: true }
        // Merge across all columns (assuming A to L covers the entire width)
        worksheet.mergeCells(`A${footerRow.number}:L${footerRow.number}`)
      }

      // Build the Excel document
      addHeaderSection()
      addDataTable()
      addFooter()

      // Generate and save file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const filename = `Stop_Report_${new Date().toISOString().split('T')[0]}.xlsx`
      saveAs(blob, filename)
      toast.success('Excel file downloaded successfully')
    } catch (error) {
      console.error('Excel Export Error:', error)
      toast.error(error.message || 'Failed to export Excel file')
    }
  }

  // Export to pdf function
  const exportToPDF = () => {
    try {
      if (!Array.isArray(sortedData) || sortedData.length === 0) {
        throw new Error('No data available for PDF export')
      }

      // Configuration constants
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

      // Create the document (landscape A4)
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
        // Draw company logo (as a filled square)
        doc.setFillColor(...CONFIG.colors.primary)
        doc.rect(
          CONFIG.company.logo.x,
          CONFIG.company.logo.y,
          CONFIG.company.logo.size,
          CONFIG.company.logo.size,
          'F',
        )

        // Company name text
        doc.setFont(CONFIG.fonts.primary, 'bold')
        doc.setFontSize(16)
        doc.text(CONFIG.company.name, 28, 21)

        // Draw header line
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
        const xPosition = CONFIG.layout.margin
        const lineHeight = CONFIG.layout.lineHeight

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

      // Helper functions to format values
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

      const formatCoordinates = (lat, lon) => {
        if (lat == null || lon == null) return 'Fetching location...'
        return `${parseFloat(lat).toFixed(5)}, ${parseFloat(lon).toFixed(5)}`
      }

      // Prepare table data
      // Build headers: SN, Vehicle Name, and the dynamic selected columns.
      const headers = ['SN', 'Vehicle Name', ...selectedColumns.map((col) => col)]
      const tableRows = []

      // Process each data row
      sortedData.forEach((row, index) => {
        const rowData = [index + 1, selectedDeviceName || '--']

        selectedColumns.forEach((column) => {
          // Apply similar formatting as in your table rendering
          switch (column) {
            case 'Start Time':
              rowData.push(new Date(row.arrivalTime).toLocaleString())
              break
            case 'End Time':
              rowData.push(new Date(row.departureTime).toLocaleString())
              break
            case 'Speed':
              rowData.push(row.speed ? `${row.speed.toFixed(2)} km/h` : '--')
              break
            case 'Ignition':
              rowData.push(row.ignition ? 'ON' : 'OFF')
              break
            case 'Direction':
              // Determine direction based on course value
              if (row.course == null) {
                rowData.push('--')
              } else if (row.course < 90 && row.course > 0) {
                rowData.push('North East')
              } else if (row.course > 90 && row.course < 180) {
                rowData.push('North West')
              } else if (row.course > 180 && row.course < 270) {
                rowData.push('South West')
              } else {
                rowData.push('North East')
              }
              break
            case 'Location':
              rowData.push(
                locationData && locationData[row.id]
                  ? locationData[row.id]
                  : 'Fetching location...',
              )
              break
            case 'Co-ordinates':
              rowData.push(
                row.latitude && row.longitude
                  ? `${parseFloat(row.latitude).toFixed(5)}, ${parseFloat(row.longitude).toFixed(5)}`
                  : 'Fetching location...',
              )
              break
            default:
              rowData.push('--')
          }
        })

        tableRows.push(rowData)
      })

      // Add header, metadata, and title
      addHeader()

      // Title and generation date
      doc.setFontSize(24)
      doc.setFont(CONFIG.fonts.primary, 'bold')
      doc.text('Stop Report', CONFIG.layout.margin, 35)

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

      // Create the table using autoTable
      autoTable(doc, {
        startY: 65,
        head: [headers],
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
        margin: { left: CONFIG.layout.margin, right: CONFIG.layout.margin },
        didDrawPage: (data) => {
          // Add header on subsequent pages if needed
          if (doc.getCurrentPageInfo().pageNumber > 1) {
            doc.setFontSize(15)
            doc.setFont(CONFIG.fonts.primary, 'bold')
            doc.text('Stop Report', CONFIG.layout.margin, 10)
          }
        },
      })

      addFooter()

      // Save the PDF file
      const filename = `Stop_Report_${new Date().toISOString().split('T')[0]}.pdf`
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


  console.log("sortedDataaaaaaaaaaaaaaaaaaaaaaaa", sortedData)

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
            sortedData.map((row, rowIndex) => (
              <CTableRow key={row.id || rowIndex} className="custom-row">
                <CTableDataCell style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}>
                  {rowIndex + 1}
                </CTableDataCell>
                <CTableDataCell style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}>
                  {selectedDeviceName}
                </CTableDataCell>

                {selectedColumns.map((column, index) => (
                  <CTableDataCell
                    key={index}
                    style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                  >
                    {column === 'Speed' ? (
                      `${row.speed?.toFixed(2) || '0.00'} km/h`
                    ) : column === 'Ignition' ? (
                      row.ignition ? (
                        <img src={ignitionOn} alt="on" title="Running" width="40" height="40" />
                      ) : (
                        <img src={ignitionOff} alt="off" title="Stopped" width="40" height="40" />
                      )
                    ) : column === 'Direction' ? (
                      (() => {
                        if (row.course < 90) {
                          return (
                            <>
                              <img src={upRight} alt="NE" width="30" height="25" />
                              <span>North East</span>
                            </>
                          );
                        } else if (row.course < 180) {
                          return (
                            <>
                              <img src={upLeft} alt="NW" width="30" height="25" />
                              <span>North West</span>
                            </>
                          );
                        } else if (row.course < 270) {
                          return (
                            <>
                              <img src={downLeft} alt="SW" width="30" height="25" />
                              <span>South West</span>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <img src={downRight} alt="SE" width="30" height="25" />
                              <span>South East</span>
                            </>
                          );
                        }
                      })()

                    ) : column === 'Location' ? (
                      row.location && row.location.length > 0 ? (
                        <tr key={row.id}>
                          <td>{row.location[0]}</td>  {/* Showing only the first location */}
                        </tr>
                      ) : (
                        <tr>
                          <td>Fetching location...</td>
                        </tr>
                      )

                    ) : column === 'Co-ordinates' ? (
                      row.latitude && row.longitude
                        ? `${row.latitude}, ${row.longitude}`
                        : 'Fetching coordinates...'
                    ) : column === 'Start Time' ? (
                      new Date(new Date(row.arrivalTime).getTime() - (5 * 60 + 30) * 60000).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric', // Changed to full year (yyyy)
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false, // 24-hour format
                      })
                    ) : column === 'End Time' ? (
                      new Date(new Date(row.departureTime).getTime() - (5 * 60 + 30) * 60000).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric', // Ensures full year (yyyy)
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false, // Ensures 24-hour format
                      })
                    ) : column === 'Device Name' ? (
                      row.device?.name || '--'
                    ) : (
                      '--'
                    )}
                  </CTableDataCell>
                ))}
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell
                colSpan={selectedColumns.length + 3}
                style={{
                  backgroundColor: '#f8f9fa',
                  color: '#6c757d',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '16px',
                }}
              >
                No data available for {selectedDeviceName}
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

const Stops = () => {
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
  const [error, setError] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [columns] = useState([
    'Start Time',
    'Ignition',
    'Speed',
    'Direction',
    'Location',
    'Co-ordinates',
    'End Time',
  ])
  const [selectedColumns, setSelectedColumns] = useState([])
  const [showMap, setShowMap] = useState(false) //show mapping data
  const accessToken = Cookies.get('authToken')
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
    } catch (error) {
      setError(error.message)
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
        const usersData = response.data.users // Get the users from response
        setUsers(usersData) // Update the state with users
        setLoading(false)
        console.log('Users fetched successfully.')

        // After setting the users, find the selected user based on formData.User
        const selectedUser = usersData.find((user) => user.userId === formData.User)
        const selectedUserName = selectedUser ? selectedUser.username : ''
        setSelectedUserName(selectedUserName)
        console.log('Selected User:', selectedUserName)
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
    console.log(formData)
    // Convert the dates to ISO format if they're provided
    const fromDate = formData.FromDate ? new Date(formData.FromDate).toISOString() : ''
    const toDate = formData.ToDate ? new Date(formData.ToDate).toISOString() : ''
    const body = {
      deviceId: formData.Devices, // Use the device ID from the form data
      // period: formData.Periods, // Use the selected period from the form data
      FromDate: fromDate,
      ToDate: toDate,
    }
    console.log(accessToken)
    // console.log(body);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/history/device-stopage?deviceId=${body.deviceId}&from=${body.FromDate}&to=${body.ToDate}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      )
      // console.log(response.data.deviceDataByTrips[0]);
      if (response.status == 200) {
        setApiData(response.data)
        setStatusLoading(false)
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
  const selectedFromDate = formData.FromDate ? new Date(formData.FromDate).toLocaleDateString() : ''
  const selectedToDate = formData.ToDate ? new Date(formData.ToDate).toLocaleDateString() : ''
  const selectedPeriod = formData.Periods || ''

  console.log('Selected From Date:', selectedFromDate)
  console.log('Selected To Date:', selectedToDate)
  console.log('Selected Period:', selectedPeriod)

  if (error) return <Page404 />


  return (
    <div>
      <CRow className="pt-3 gutter-0">
        <CCol xs={12} md={12} className="px-4">
          <CCard className="mb-4 p-0 shadow-lg rounded">
            <CCardHeader
              className="d-flex justify-content-between align-items-center text-white"
              style={{ backgroundColor: '#0a2d63' }}
            >
              <strong>Stop Report</strong>
            </CCardHeader>
            <CCardBody>
              <SearchStop
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                users={users}
                getGroups={getGroups}
                groups={groups}
                getDevices={getDevices}
                loading={loading}
                devices={devices}
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
                <strong>All Stop List {selectedDeviceName && `for ${selectedDeviceName}`} </strong>
                {/* <CFormInput
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '250px' }}
                /> */}
              </CCardHeader>
              <CCardBody>
                <StopTable
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
    </div>
  )
}
export default Stops
