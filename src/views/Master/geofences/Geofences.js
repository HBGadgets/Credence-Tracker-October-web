import React, { useEffect, useState, useRef } from 'react'
import Cookies from 'js-cookie'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
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
  InputLabel,
  MenuItem,
  OutlinedInput,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
} from '@mui/material'
import { RiEdit2Fill } from 'react-icons/ri'
import { AiFillDelete, AiOutlineUserAdd } from 'react-icons/ai'
import ReactPaginate from 'react-paginate'
import Gmap from '../../Googlemap/Gmap'
import CloseIcon from '@mui/icons-material/Close'
import { GoogleMap, Marker, Polygon, useLoadScript, Circle } from '@react-google-maps/api'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import toast, { Toaster } from 'react-hot-toast'
import { IoMdAdd } from 'react-icons/io'
import * as XLSX from 'xlsx' // For Excel export
import jsPDF from 'jspdf' // For PDF export
import 'jspdf-autotable' // For table formatting in PDF
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'
import { auto, right } from '@popperjs/core'
import '../../../../src/app.css'
import {
  FaExpand,
  FaCompress,
  FaStop,
  FaPen,
  FaLocationArrow,
  FaLayerGroup,
  FaMap,
  FaSatellite,
} from 'react-icons/fa'
import { MdGpsFixed, MdPolyline } from 'react-icons/md'
import { IoAnalyticsOutline } from 'react-icons/io5'
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

const Geofences = () => {
  const [deviceData, setDeviceData] = useState()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [limit, setLimit] = useState(8)
  const [pageCount, setPageCount] = useState()
  const [currentStep, setCurrentStep] = useState(0)
  const steps = ['Select Geofence', 'Geofence Info']
  const [filteredData, setFilteredData] = useState([])
  const [centerMap, setCenterMap] = useState({ latitude: 0, longitude: 0 })
  const [area, setArea] = useState('') // Area format for geofence
  const [selectedLocation, setSelectedLocation] = useState({ lat: 21.1458, lng: 79.0882 })

  // Google map search map code
  const [searchQuery1, setSearchQuery1] = useState('') // Search query state

  const apiKey = 'CWVeoDxzhkO07kO693u0' // Replace with your actual MapTiler API key

  const handleSearch = async () => {
    if (!searchQuery1) return
    try {
      const response = await axios.get(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery1)}.json?key=${apiKey}`,
      )

      const data = response.data

      if (data.features.length > 0) {
        const { center } = data.features[0] // MapTiler returns [longitude, latitude]
        const location = { lat: center[1], lng: center[0] } // Convert to {lat, lng}

        // Set location and polygon coordinates
        setSelectedLocation(location)
        setPolygonCoords([{ lat: location.lat, lng: location.lng }])

        // Generate the area logic
        const generatedArea = `Circle(${location.lat} ${location.lng}, ${radius})`
        setArea(generatedArea)

        console.log('Generated Area:', generatedArea)
        alert('Location and area successfully set!')
      } else {
        alert('Location not found! Please enter a valid location.')
      }
    } catch (error) {
      console.error('Error fetching location:', error)
    }
  }

  const handleEditModalClose = () => {
    setCurrentStep(0)
    setFormData({})
    setEditModalOpen(false)
    setIsDrawing(false)
    setPolygonCoords([])
    setRadius(false)
    setSelectedDevices([])
  }

  const handleAddModalClose = () => {
    setCurrentStep(0)
    setFormData({})
    setAddModalOpen(false)
    setIsDrawing(false)
    setPolygonCoords([])
    setRadius(null)
    setSelectedDevices([])
  }

  const [deviceOptions, setDeviceOptions] = useState()
  const [currentPage, setCurrentPage] = useState(1)
  // const [currentItemId, setCurrentItemId] = useState(null);

  // Go to the next step
  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  // Go to the previous step
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const PlaceType = [
    { value: 'ATM', label: 'ATM' },
    { value: 'Airport', label: 'Airport' },
    { value: 'Bank', label: 'Bank' },
    { value: 'Beach', label: 'Beach' },
    { value: 'Bus_Stop', label: 'Bus Stop' },
    { value: 'Restaurant', label: 'Restaurant' },
    { value: 'Dairy', label: 'Dairy' },
    { value: 'District', label: 'District' },
    { value: 'Facility', label: 'Facility' },
    { value: 'Factory', label: 'Factory' },
    { value: 'Fuel_Station', label: 'Fuel Station' },
    { value: 'Highway_point', label: 'Highway Point' },
    { value: 'Home', label: 'Home' },
    { value: 'Hospital', label: 'Hospital' },
    { value: 'Hotel', label: 'Hotel' },
    { value: 'Mosque', label: 'Mosque' },
    { value: 'Office', label: 'Office' },
    { value: 'Other', label: 'Other' },
    { value: 'Police_Station', label: 'Police Station' },
    { value: 'Post_Office', label: 'Post Office' },
    { value: 'Railway_Station', label: 'Railway Station' },
    { value: 'Recycle_Station', label: 'Recycle Station' },
    { value: 'School', label: 'School' },
    { value: 'Traffic_Signal', label: 'Traffic Signal' },
    { value: 'State_Border', label: 'State Border' },
    { value: 'Sub_Division', label: 'Sub Division' },
    { value: 'Temple', label: 'Temple' },
    { value: 'Theater', label: 'Theater' },
    { value: 'Theme_Park', label: 'Theme Park' },
    { value: 'Toll_Gate', label: 'Toll Gate' },
    { value: 'Tunnel', label: 'Tunnel' },
    { value: 'University', label: 'University' },
    { value: 'Way_Bridge', label: 'Way Bridge' },
    { value: 'Sensative_Points', label: 'Sensitive Points' },
    { value: 'Dumping_Yard', label: 'Dumping Yard' },
    { value: 'Mine', label: 'Mine' },
    { value: 'No_POI_Report', label: 'No POI Report' },
    { value: 'Entry_Restriction', label: 'Entry Restriction' },
    { value: 'Tyre_Shop', label: 'Tyre Shop' },
    { value: 'Workshop', label: 'Workshop' },
    { value: 'Yard', label: 'Yard' },
    { value: 'Parking_Place', label: 'Parking Place' },
    { value: 'Driver_Home', label: 'Driver Home' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Puspakom', label: 'Puspakom' },
    { value: 'Exit_Restriction', label: 'Exit Restriction' },
    { value: 'Gurudwara', label: 'Gurudwara' },
    { value: 'Church', label: 'Church' },
    { value: 'Distributor', label: 'Distributor' },
    { value: 'State', label: 'State' },
    { value: 'WaterFall', label: 'WaterFall' },
    { value: 'Depot', label: 'Depot' },
    { value: 'Terminal', label: 'Terminal' },
    { value: 'Port', label: 'Port' },
  ]

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40%',
    height: auto,
    BorderRadius: '10px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto', // Enable vertical scrolling
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    marginTop: '8px',
  }
  if (deviceData) {
    console.log('hey bro this is device data : ', deviceData)
  } else {
    console.log('abe yaar device data nh hai')
  }

  const [selectedDevices, setSelectedDevices] = useState([])

  const handleDeviceChange = (selected) => {
    setSelectedDevices(selected)
  }

  // ############ map code #################################

  const [polygonCoords, setPolygonCoords] = useState([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapType, setMapType] = useState('roadmap') // Default map type
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false) // Controls the layer menu visibility

  const toggleLayerMenu = () => setIsLayerMenuOpen(!isLayerMenuOpen)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  // Load Google Maps API
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAvHHoPKPwRFui0undeEUrz00-8w6qFtik', // Replace with your API key
  })

  const [isDrawing, setIsDrawing] = useState(false) // To track whether the user is drawing
  const [radius, setRadius] = useState(null) // Initial radius in meters (500 meters)

  // Handler for clicks on the map
  const onMapClick = (event) => {
    if (isDrawing) {
      // Add new point to the polygon when clicked
      setRadius(null)
      const newCoords = [...polygonCoords, { lat: event.latLng.lat(), lng: event.latLng.lng() }]
      setPolygonCoords(newCoords)
    }
    if (!isDrawing) {
      // Add new point to the polygon when clicked
      const latlong = [polygonCoords[polygonCoords.length - 1]]
      setPolygonCoords([...latlong])
      // const newCoords = [...polygonCoords, { lat: event.latLng.lat(), lng: event.latLng.lng() }];
      setPolygonCoords((polygonCoords) =>
        polygonCoords.map((item) => ({
          ...item,
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        })),
      )
      // setPolygonCoords(newCoords);
    }
    // Update the selected location with the clicked position
    setSelectedLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() })
  }

  const toggleDrawing = () => {
    setIsDrawing((prev) => !prev) // Toggle between drawing and stopping
  }

  // Start drawing mode
  const startDrawing = () => {
    setIsDrawing(true) // Enable drawing mode
  }

  // Stop drawing mode
  const stopDrawing = () => {
    setIsDrawing(false) // Disable drawing mode
  }

  // const onMapClick = (event) => {
  //   const newCoords = {
  //     lat: event.latLng.lat(),
  //     lng: event.latLng.lng(),
  //   }
  //   setPolygonCoords((prev) => [...prev, newCoords]) // Add new coordinates to the polygon
  //   setSelectedLocation(newCoords)
  // }

  // Handle radius input change
  const handleRadiusChange = (e) => {
    const newRadius = e.target.value === '' ? null : Number(e.target.value) // Handle empty input
    if (newRadius === null || newRadius >= 0) {
      if (polygonCoords.length > 1) {
        const latlong = [polygonCoords[polygonCoords.length - 1]]
        // console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLL CCCCCCCCCCCCC", latlong);

        setPolygonCoords(latlong)
      }
      setRadius(newRadius)
      console.log('Circle ka radiusssssssssssssssss', newRadius)
      console.log('polygonCoordsssssssssssssssssssss', polygonCoords)
    }
  }

  if (polygonCoords) {
    console.log('this is selected points', polygonCoords)
    console.log('Radiusssssssscc', radius)
  }

  // ######################### get geofences ##############################################
  const fetchGeofenceData = async (page = 1) => {
    const accessToken = Cookies.get('authToken')
    const url = `${import.meta.env.VITE_API_URL}/geofence?page=${page}&limit=${limit}&search=${searchQuery}`

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })

      if (response.data.geofences) {
        setData(response.data.geofences)
        setPageCount(response.data.pagination.totalPages)
        console.log(response.data.geofences)
        console.log(response.data.pagination.totalPages)
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
    }
  }

  const fetchDeviceData = async () => {
    const token = Cookies.get('authToken')
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/device`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    if (response.data) {
      setDeviceData(response.data)

      setDeviceOptions(
        response.data.devices?.map((device) => ({
          value: device.deviceId,
          label: device.name,
        })),
      )
    }
  }

  useEffect(() => {
    fetchDeviceData()
  }, [])

  // ##################### Filter data by search query #######################
  const filterGeofences = () => {
    if (!searchQuery) {
      setFilteredData(data) // No query, show all drivers
    } else {
      const filtered = data.filter(
        (geofences) =>
          //fixed app crash on geofence search

          String(geofences?.name)?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
          String(geofences?.type)?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
          String(geofences?.deviceIds)?.toLowerCase().includes(searchQuery?.toLowerCase()),
        //     geofences.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        //     geofences.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        //     geofences.deviceIds.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredData(filtered)
      console.log('Geofence detailsssssssssssssssss', filtered)
    }
  }

  useEffect(() => {
    fetchGeofenceData()
  }, [limit, searchQuery])

  useEffect(() => {
    filterGeofences(searchQuery)
  }, [data, searchQuery])

  const handlePageClick = (e) => {
    console.log(e.selected + 1)
    let page = e.selected + 1
    setCurrentPage(page)
    setLoading(true)
    fetchGeofenceData(page)
  }

  // ################ add geofence #########################################

  const handleAddGeofence = async (e) => {
    e.preventDefault()
    console.log('formData', formData)
    let updatedFormData
    if (polygonCoords.length == 1) {
      updatedFormData = {
        ...formData,
        area: [{ circle: `Circle(${polygonCoords[0].lat} ${polygonCoords[0].lng}, ${radius})` }], // Add your polygonCoords here
        deviceIds: selectedDevices.map((device) => device.value),
      }
    } else {
      updatedFormData = {
        ...formData,
        area: polygonCoords, // Add your polygonCoords here
        deviceIds: selectedDevices.map((device) => device.value),
      }
    }

    console.log('this is updated formdata: ', updatedFormData)

    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/geofence`,
        updatedFormData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.status == 201) {
        toast.success('Geofence is created successfully')
        fetchGeofenceData()
        setFormData({})
        setPolygonCoords([])
        setSelectedDevices([])
        setAddModalOpen(false)
        setIsDrawing(false)
        setRadius(null)
        // setSelectedLocation({})
      }
    } catch (error) {
      toast.error(error.response.data.message)
      throw error.response ? error.response.data.message : new Error('An error occurred')
    }
  }

  // ###########################################################################
  // ######################  Edit Geofence ###################################

  const EditGeofenceSubmit = async (e) => {
    e.preventDefault()
    console.log('FormData before submission:', formData)

    // Construct the edited data - extract device IDs correctly
    const editedData = {
      ...formData,
      area:
        selectedLocation?.lat && selectedLocation?.lng
          ? [{ circle: `Circle(${selectedLocation.lat} ${selectedLocation.lng}, ${radius})` }]
          : polygonCoords,
      deviceIds: selectedDevices.map((device) =>
        // Handle both string and object device.value formats
        typeof device.value === 'object' ? device.value.id : device.value,
      ),
    }

    console.log('Formatted Geofence Data:', editedData)

    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/Geofence/${formData._id}`,
        editedData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.status === 200) {
        toast.success('Geofence updated successfully!')
        fetchGeofenceData()
        // Reset states
        setFormData({})
        setPolygonCoords([])
        setSelectedDevices([])
        setSelectedLocation(null)
        setCurrentStep(0)
        setArea('')
        setIsDrawing(false)
        setRadius(500)
        setEditModalOpen(false)
      }
    } catch (error) {
      console.error('Update error:', error.response || error)
      toast.error(error.response?.data?.message || 'Update failed')
    }
  }

  const handleEditGeofence = async (item) => {
    console.log('Geofence item to edit:', item)

    // Open the edit modal
    setEditModalOpen(true)

    // Set form data with the existing item
    setFormData({ ...item })

    setSelectedLocation({ lat: item.area[0].lat, lng: item.area[0].lng })
    setPolygonCoords(item.area || []) // Populate polygon coordinates if present

    // Handle polygon coordinates and area extraction
    if (item.area?.length > 0) {
      const area = item.area[0]
      setArea(area.circle || '')

      // Extract lat, lng, and radius from the 'circle' string
      const circleMatch = area.circle.match(/Circle\(([\d.-]+) ([\d.-]+), ([\d.-]+)\)/)

      if (circleMatch) {
        const [_, lat, lng, radius] = circleMatch
        const parsedLat = parseFloat(lat)
        const parsedLng = parseFloat(lng)
        const parsedRadius = parseFloat(radius)

        // Set selected location and radius
        setSelectedLocation({ lat: parsedLat, lng: parsedLng, radius: parsedRadius })
        setRadius(parsedRadius)
        setPolygonCoords([{ lat: parsedLat, lng: parsedLng }]) // If needed for display
      } else {
        console.error('Invalid circle format:', area.circle)
        setSelectedLocation({})
        setRadius(null)
        setPolygonCoords([])
      }
    } else {
      setArea('')
      setSelectedLocation({})
      setRadius(null)
      setPolygonCoords([])
    }

    // Map device IDs to react-select format
    const formattedDevices = (item.deviceIds || []).map((deviceId) => {
      const matchingDevice = deviceOptions.find((device) => device.value === deviceId)
      return matchingDevice || { value: deviceId, label: deviceId.name || deviceId }
    })

    setSelectedDevices(formattedDevices)
    console.log('Formatted devices:', formattedDevices)
  }

  // #########################################################################

  // ######################## Delete Geofence ################################

  const deleteGeofenceSubmit = async (item) => {
    const confirmed = confirm('Do you want to delete this Geofence?')
    if (!confirmed) return

    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/Geofence/${item._id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 200) {
        toast.error('Geofence is deleted successfully')

        // Optimistic update
        setData((prev) => prev.filter((geo) => geo._id !== item._id))

        // Fetch updated data
        fetchGeofenceData()
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred'
      toast.error(errorMessage)
    }
  }

  // Show Co-ordinates of Polyline and circle centroid of lat lng

  function calculateCentroid(polygon) {
    let totalLatitude = 0
    let totalLongitude = 0
    const numVertices = polygon.length

    if (polygon.length == 1) {
      const match = polygon[0].circle.match(/Circle\(([\d.-]+) ([\d.-]+),/)
      console.log('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', match)
      if (match) {
        totalLatitude = parseFloat(match[1])
        totalLongitude = parseFloat(match[2])
      } else {
        return null
      }
    } else {
      polygon.forEach((point) => {
        totalLatitude += point.lat
        totalLongitude += point.lng
      })
    }

    console.log('AAAAAAAAAAAAAAAAAAAAAAAAA', totalLatitude, totalLongitude)

    return {
      latitude: totalLatitude / numVertices,
      longitude: totalLongitude / numVertices,
    }
  }

  const [polydata, setPolyData] = useState()
  const handleRowClick = (polygon) => {
    setPolyData(polygon)
    console.log('this is polygon', polygon)
    const centroid = calculateCentroid(polygon)
    console.log('this is centroid', centroid)

    setCenterMap(centroid)
  }

  //  ###############################################################

  // handel download icon dropdown

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

  // handel dropdown icon download section

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

  // Export data to Excel

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
          { header: 'Geofence Name', width: 25 },
          { header: 'Type', width: 20 },
          { header: 'Vehicles', width: 35 },
        ],
        company: {
          name: 'Credence Tracker',
          copyright: `© ${new Date().getFullYear()} Credence Tracker`,
        },
      }

      // Helper function to format the vehicles list
      const formatVehicles = (devices) => {
        if (!devices || devices.length === 0) return 'N/A'
        return devices.map((device) => device.name).join(', ')
      }

      // Initialize workbook and worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Geofence Data')

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
        worksheet.mergeCells('A1:D1')

        // Report title
        const subtitleRow = worksheet.addRow(['Geofence Data'])
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
        worksheet.mergeCells('A2:D2')

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

        // Add data rows
        filteredData.forEach((item, index) => {
          const rowData = [
            index + 1,
            item.name || 'N/A', // Geofence Name
            item.type || 'N/A', // Type
            formatVehicles(item.deviceIds), // Vehicles
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
        worksheet.mergeCells(`A${footerRow.number}:D${footerRow.number}`)
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
      const filename = `Geofence_Data_${new Date().toISOString().split('T')[0]}.xlsx`
      saveAs(blob, filename)
      toast.success('Excel file downloaded successfully')
    } catch (error) {
      console.error('Excel Export Error:', error)
      toast.error(error.message || 'Failed to export Excel file')
    }
  }

  // Export data to PDF

  const exportToPDF = () => {
    try {
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

      // Title and date
      addHeader()
      doc.setFontSize(24)
      doc.setFont(CONFIG.fonts.primary, 'bold')
      doc.text('Geofences Reports', CONFIG.layout.margin, 35)

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
      const tableColumns = ['SN', 'Geofence Name', 'Type', 'Vehicles']

      const tableRows = filteredData.map((item, index) => [
        index + 1, // Serial Number
        item.name || '--', // Geofence Name
        item.type || '--', // Type
        item.deviceIds.map((device) => device.name).join(', ') || 'N/A', // Vehicles
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
          3: { cellWidth: 60 }, // Adjust width for the "Vehicles" column
        },
        margin: { left: CONFIG.layout.margin, right: CONFIG.layout.margin },
        didDrawPage: (data) => {
          // Add header on subsequent pages
          if (doc.getCurrentPageInfo().pageNumber > 1) {
            doc.setFontSize(15)
            doc.setFont(CONFIG.fonts.primary, 'bold')
            doc.text('Geofences Reports', CONFIG.layout.margin, 10)
          }
        },
      })

      addFooter()

      // Save PDF
      const filename = `Geofences_Report_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF Export Error:', error)
      toast.error(error.message || 'Failed to export PDF')
    }
  }

  return (
    <div className="d-flex flex-column mx-md-3 mt-3 h-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="d-md-none mb-2">
        <input
          type="search"
          className="form-control"
          placeholder="search Geofence Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="row">
        <div className="col-12 col-md-6 position-relative">
          <CRow>
            <CCol xs>
              <CCard>
                <CCardHeader className="grand d-flex justify-content-between align-items-center">
                  <strong>Geofences</strong>
                  <div className="d-flex">
                    <div className="me-3 d-none d-md-block">
                      <input
                        type="search"
                        className="form-control"
                        placeholder="Search Geofence Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    {/* Action buttons */}
                    <div className="d-flex align-items-center">
                      <button
                        onClick={() => setAddModalOpen(true)}
                        className="btn btn-secondary me-2"
                      >
                        Add Geofence
                      </button>
                    </div>
                  </div>
                </CCardHeader>
                <CCardBody>
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
                    <CTable
                      style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}
                      bordered
                      align="middle"
                      className="mb-2 min-vh-25"
                      hover
                      responsive
                    >
                      <CTableHead className="text-nowrap">
                        <CTableRow className="bg-body-tertiary">
                          <CTableHeaderCell
                            className="text-center text-white"
                            style={{ background: '#0a2d63' }}
                          >
                            <strong>SN</strong>
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="text-center text-white"
                            style={{ background: '#0a2d63' }}
                          >
                            <strong>Geofence Name</strong>
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="text-center text-white"
                            style={{ background: '#0a2d63' }}
                          >
                            <strong>Type</strong>
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="text-center text-white"
                            style={{ background: '#0a2d63' }}
                          >
                            <strong>Vehicles</strong>
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="text-center text-white"
                            style={{ background: '#0a2d63' }}
                          >
                            <strong>Actions</strong>
                          </CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {loading ? (
                          <CTableRow>
                            <CTableDataCell colSpan="5" className="text-center">
                              <div className="text-nowrap mb-2" style={{ width: '240px' }}>
                                <p className="placeholder-glow">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className="placeholder col-8" />
                                  ))}
                                </p>
                              </div>
                            </CTableDataCell>
                          </CTableRow>
                        ) : filteredData.length > 0 ? (
                          filteredData.map((item, index) => (
                            <CTableRow key={index} onClick={() => handleRowClick(item.area)}>
                              <CTableDataCell
                                className="text-center"
                                style={{
                                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                }}
                              >
                                {(currentPage - 1) * limit + index + 1}
                              </CTableDataCell>
                              <CTableDataCell
                                className="text-center"
                                style={{
                                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                }}
                              >
                                {item.name}
                              </CTableDataCell>
                              <CTableDataCell
                                className="text-center"
                                style={{
                                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                }}
                              >
                                {item.type}
                              </CTableDataCell>
                              <CTableDataCell
                                className="text-center"
                                style={{
                                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                }}
                              >
                                <CFormSelect
                                  id="geofence"
                                  value=""
                                  className="text-center"
                                  style={{
                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                  }}
                                >
                                  <option value="">{item.deviceIds.length || '0'}</option>
                                  {Array.isArray(item.deviceIds) &&
                                    item.deviceIds.map((device, i) => (
                                      <option key={i} value={device.name}>
                                        {device.name}
                                      </option>
                                    ))}
                                </CFormSelect>
                              </CTableDataCell>
                              <CTableDataCell
                                className="text-center d-flex justify-content-center align-items-center"
                                style={{
                                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                }}
                              >
                                <IconButton
                                  aria-label="edit"
                                  onClick={() => handleEditGeofence(item)}
                                >
                                  <RiEdit2Fill
                                    style={{
                                      fontSize: '20px',
                                      color: 'lightBlue',
                                      margin: '3px',
                                    }}
                                  />
                                </IconButton>
                                <IconButton
                                  aria-label="delete"
                                  onClick={() => deleteGeofenceSubmit(item)}
                                >
                                  <AiFillDelete
                                    style={{
                                      fontSize: '20px',
                                      color: 'red',
                                      margin: '3px',
                                    }}
                                  />
                                </IconButton>
                              </CTableDataCell>
                            </CTableRow>
                          ))
                        ) : (
                          <CTableRow>
                            <CTableDataCell colSpan="5" className="text-center">
                              <div
                                className="d-flex flex-column justify-content-center align-items-center"
                                style={{ height: '200px' }}
                              >
                                <p className="mb-0 fw-bold">
                                  "Oops! Looks like there's No Geofence Created.
                                  <br /> Maybe it's time to Create New Geofence!"
                                </p>
                                <button
                                  onClick={() => setAddModalOpen(true)}
                                  className="btn btn-primary m-3 text-white"
                                >
                                  <IoMdAdd className="fs-5" /> Create Geofence
                                </button>
                              </div>
                            </CTableDataCell>
                          </CTableRow>
                        )}
                      </CTableBody>
                    </CTable>
                  </TableContainer>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

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
        </div>
        <div className="col-12 col-md-6">
          <div style={{ flex: 1 }}>
            <Gmap data={data} centerMap={centerMap} polydata={polydata} />
          </div>
          <div
            className="d-flex justify-content-end align-items-center"
            style={{
              position: 'fixed', // Fixed to ensure it stays in the viewport
              bottom: '10px', // Distance from the bottom of the viewport
              right: '10px', // Distance from the right of the viewport
              zIndex: 1000, // Ensures it stays above other elements
            }}
          >
            {/* Dropdown Menu icon download */}

            <div className="position-fixed bottom-3 end-0 mb-5 m-3 z-5">
              <IconDropdown items={dropdownItems} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}

      <Modal open={addModalOpen} onClose={handleAddModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f7f9fc',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: 0, // Optional: Remove border-radius for a true fullscreen look
            padding: '30px',
            overflow: 'auto', // Handle content overflow
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Typography
              variant="h5"
              sx={{
                color: '#2c3e50',
                fontWeight: 'bold',
                fontSize: '26px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span role="img" aria-label="user">
                <AiOutlineUserAdd className="fs-2" />
              </span>{' '}
              Add New Geofence
            </Typography>
            <IconButton onClick={handleAddModalClose}>
              <CloseIcon style={{ color: '#2c3e50' }} />
            </IconButton>
          </div>

          {/* All content in a single step */}
          <div className="mt-3">
            {/* Google Map */}
            {isLoaded ? (
              <div>
                {!isDrawing ? (
                  <div className="d-flex flex-row gap-3 ms-3">
                    {/* Set Circle Radius Section */}
                    <div className="d-flex flex-column mb-3">
                      <label className="fw-medium text-dark">Set Circle Radius (in meters)</label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="number"
                          value={radius}
                          onChange={handleRadiusChange}
                          min="1"
                          max="500"
                          className="form-control w-100"
                        />
                        <input
                          type="range"
                          value={radius}
                          onChange={handleRadiusChange}
                          min="1"
                          max="500"
                          className="form-range w-100"
                        />
                      </div>
                    </div>

                    {/* Search Location Section */}
                    <div className="d-flex flex-column mb-3 ms-3">
                      <label className="fw-medium">Search Location name</label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="text"
                          placeholder="Enter location name"
                          value={searchQuery1}
                          onChange={(e) => setSearchQuery1(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSearch()
                            }
                          }}
                          className="form-control w-100"
                        />
                        <button onClick={handleSearch} className="btn btn-primary">
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex">
                    <div style={{ marginBottom: '10px', marginLeft: '15px' }}>
                      <label style={{ fontWeight: '500', color: '#2c3e50' }}>
                        Set Circle Radius (in meters):{' '}
                      </label>
                      <input
                        type="number"
                        value={radius}
                        disabled
                        onChange={handleRadiusChange} // Handle radius input change
                        min="1"
                        style={{
                          marginLeft: '10px',
                          padding: '8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                )}

                <GoogleMap
                  mapContainerStyle={{
                    width: '100%',
                    height: isFullscreen ? '100vh' : '500px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                  }}
                  center={selectedLocation} // Map centers on the selected location
                  zoom={13}
                  onClick={onMapClick} // Set new center on map click
                  options={{
                    fullscreenControl: false, // Enable fullscreen button
                    mapTypeId: mapType, // Dynamic map type
                  }}
                >
                  {/* Fullscreen Toggle Button */}
                  <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 1,
                        backgroundColor: 'white',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                        borderRadius: '10px',
                      }}
                    >
                      <IconButton
                        onClick={toggleFullscreen}
                        color="primary"
                        style={{ padding: '10px' }}
                      >
                        {isFullscreen ? <FaCompress size={24} /> : <FaExpand size={24} />}
                      </IconButton>
                    </div>
                  </Tooltip>

                  {/* Start Drawing Button */}
                  <Tooltip title={isDrawing ? 'Stop Drawing Polyline' : 'Start Drawing Polyine'}>
                    <div
                      style={{
                        position: 'absolute',
                        top: '80px', // Space the buttons vertically
                        right: '10px',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <IconButton
                        onClick={toggleDrawing} // Toggle between start and stop drawing
                        color={isDrawing ? 'secondary' : 'primary'} // Change button color based on state
                        style={{
                          backgroundColor: 'white',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                          padding: '10px',
                        }}
                      >
                        {isDrawing ? <FaStop size={20} /> : <IoAnalyticsOutline size={20} />}{' '}
                        {/* Ternary operator */}
                      </IconButton>
                    </div>
                  </Tooltip>

                  {/* My Location Button */}
                  <Tooltip title="Use My Location">
                    <div
                      style={{
                        position: 'absolute',
                        top: '130px',
                        right: '10px',
                        zIndex: 1,
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const { latitude, longitude } = position.coords
                              setSelectedLocation({ lat: latitude, lng: longitude })
                            },
                            (error) => {
                              console.error('Error fetching location:', error)
                            },
                          )
                        }}
                        color="primary"
                        style={{
                          backgroundColor: 'white',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                          padding: '10px',
                        }}
                      >
                        <MdGpsFixed size={20} />
                      </IconButton>
                    </div>
                  </Tooltip>

                  {/* Layer Control */}
                  <Tooltip title="Layer Control">
                    <div
                      style={{
                        position: 'absolute',
                        top: '180px',
                        right: '9px',
                        zIndex: 1,
                        borderRadius: '8px',
                      }}
                    >
                      <IconButton
                        onClick={toggleLayerMenu}
                        color="primary"
                        style={{
                          backgroundColor: 'white',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                          padding: '10px',
                        }}
                      >
                        <FaLayerGroup size={20} />
                      </IconButton>
                      {isLayerMenuOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '50px',
                            right: '0px',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <Tooltip title="Roadmap">
                            <IconButton
                              onClick={() => setMapType('roadmap')}
                              color={mapType === 'roadmap' ? 'primary' : 'default'}
                              style={{
                                backgroundColor: mapType === 'roadmap' ? '#3498db' : 'white',
                                color: mapType === 'roadmap' ? 'white' : 'black',
                                padding: '10px',
                              }}
                            >
                              <FaMap size={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Satellite View">
                            <IconButton
                              onClick={() => setMapType('satellite')}
                              color={mapType === 'satellite' ? 'primary' : 'default'}
                              style={{
                                backgroundColor: mapType === 'satellite' ? '#3498db' : 'white',
                                color: mapType === 'satellite' ? 'white' : 'black',
                                padding: '10px',
                              }}
                            >
                              <FaSatellite size={20} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </Tooltip>

                  {/* Drawing the polygon if coordinates are available */}
                  {polygonCoords.length > 0 && (
                    <Polygon
                      paths={polygonCoords}
                      options={{
                        fillColor: 'rgba(53, 223, 81, 0.5)',
                        fillOpacity: 0.5,
                        strokeColor: '#2980b9',
                        strokeOpacity: 1,
                        strokeWeight: 2,
                      }}
                    />
                  )}

                  {/* Marker at the selected location (used for both polygon and circle center) */}
                  <Marker position={selectedLocation} />

                  {/* Circle drawn at selected location */}
                  <Circle
                    center={selectedLocation} // Circle's center is the selected location
                    radius={radius} // Circle radius in meters
                    options={{
                      fillColor: 'rgba(53, 223, 81, 0.5)',
                      fillOpacity: 0.5,
                      strokeColor: '#2980b9',
                      strokeOpacity: 1,
                      strokeWeight: 2,
                    }}
                  />
                </GoogleMap>
              </div>
            ) : (
              <div>Loading Google Maps...</div>
            )}

            {/* Form Fields */}
            <div
              className="mt-4"
              style={{
                backgroundColor: '#ffffff', // Light background
                padding: '20px',
                borderRadius: '10px', // Rounded corners
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow
                border: '1px solid #e0e0e0', // Optional border
              }}
            >
              {/* Geofence Name Input */}
              <TextField
                fullWidth
                label="Geofence Name"
                name="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                sx={{
                  marginBottom: '20px', // Add spacing below the input
                  '& .MuiInputLabel-root': {
                    color: '#34495e', // Label color
                    fontWeight: 'bold',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#dfe6e9', // Border color
                    },
                    '&:hover fieldset': {
                      borderColor: '#3498db', // Border color on hover
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3498db', // Border color when focused
                    },
                  },
                }}
              />

              {/* Select Place Type */}
              <Select
                placeholder="Select Place Type..."
                value={PlaceType.find((option) => option.value === formData.type) || ""}
                onChange={(selectedOption) =>
                  setFormData({ ...formData, type: selectedOption ? selectedOption.value : "" })
                }
                options={PlaceType}
                styles={{
                  container: (base) => ({
                    ...base,
                    marginTop: "20px",
                    marginBottom: "20px",
                  }),
                  control: (base) => ({
                    ...base,
                    borderColor: "#dfe6e9", // Border color
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#3498db", // Border color on hover
                    },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#7f8c8d", // Placeholder color
                    fontWeight: "500",
                  }),
                  menuList: (base) => ({
                    ...base,
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
                  }),
                }}
              />


              {/* Select Devices */}
              <Select
                isMulti
                options={deviceOptions}
                onChange={handleDeviceChange}
                value={selectedDevices}
                placeholder="Select Vehicles"
                styles={{
                  container: (base) => ({
                    ...base,
                    marginBottom: '20px', // Add spacing below the dropdown
                  }),
                  control: (base) => ({
                    ...base,
                    borderColor: '#dfe6e9', // Border color
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: '#3498db', // Border color on hover
                    },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: '#7f8c8d', // Placeholder color
                    fontWeight: '500',
                  }),
                  menuList: (base) => ({
                    ...base,
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
                  }),
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="d-flex justify-content-end" style={{ marginTop: '20px' }}>
            <Button onClick={handleAddGeofence} variant="contained" color="primary">
              Submit
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Editi Modal */}
      <Modal
        open={editModalOpen}
        onClose={handleEditModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f7f9fc',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: 0, // Optional: Remove border-radius for a true fullscreen look
            padding: '30px',
            overflow: 'auto', // Handle content overflow
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Typography id="modal-modal-title" variant="h5" component="h2">
              Edit New Geofence
            </Typography>
            <IconButton onClick={handleEditModalClose}>
              <CloseIcon />
            </IconButton>
          </div>

          {/* Google Map */}
          <div className="mt-3">
            {isLoaded ? (
              <div>
                <div className="d-flex flex-row gap-3 ms-3">
                  {/* Set Circle Radius Section */}
                  <div className="d-flex flex-column mb-3">
                    <label className="fw-medium text-dark">Set Circle Radius (in meters)</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="number"
                        value={radius}
                        onChange={handleRadiusChange}
                        min="1"
                        max="500"
                        className="form-control w-100"
                      />
                      <input
                        type="range"
                        value={radius}
                        onChange={handleRadiusChange}
                        min="1"
                        max="500"
                        className="form-range w-100"
                      />
                    </div>
                  </div>

                  {/* Search Location Section */}
                  <div className="d-flex flex-column mb-3 ms-3">
                    <label className="fw-medium">Search Location name</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter location name"
                        value={searchQuery1}
                        onChange={(e) => setSearchQuery1(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch()
                          }
                        }}
                        className="form-control w-100"
                      />
                      <button onClick={handleSearch} className="btn btn-primary">
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                <GoogleMap
                  mapContainerStyle={{
                    width: '100%',
                    height: isFullscreen ? '100vh' : '500px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                  }}
                  center={selectedLocation}
                  zoom={13}
                  onClick={onMapClick}
                  options={{
                    fullscreenControl: false, // Enable fullscreen button
                    mapTypeId: mapType, // Dynamic map type
                  }}
                >
                  {/* Fullscreen Toggle Button */}
                  <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 1,
                        backgroundColor: 'white',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <IconButton
                        onClick={toggleFullscreen}
                        color="primary"
                        style={{ padding: '10px' }}
                      >
                        {isFullscreen ? <FaCompress size={24} /> : <FaExpand size={24} />}
                      </IconButton>
                    </div>
                  </Tooltip>

                  {/* Start Drawing Button */}
                  <Tooltip title={isDrawing ? 'Stop Drawing Polyline' : 'Start Drawing Polyline'}>
                    <div
                      style={{
                        position: 'absolute',
                        top: '80px', // Space the buttons vertically
                        right: '10px',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <IconButton
                        onClick={toggleDrawing} // Toggle between start and stop drawing
                        color={isDrawing ? 'secondary' : 'primary'} // Change button color based on state
                        style={{
                          backgroundColor: 'white',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                          padding: '10px',
                        }}
                      >
                        {isDrawing ? <FaStop size={20} /> : <IoAnalyticsOutline size={20} />}{' '}
                        {/* Ternary operator */}
                      </IconButton>
                    </div>
                  </Tooltip>

                  {/* My Location Button */}
                  <Tooltip title="Use My Location">
                    <div
                      style={{
                        position: 'absolute',
                        top: '130px',
                        right: '10px',
                        zIndex: 1,
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const { latitude, longitude } = position.coords
                              setSelectedLocation({ lat: latitude, lng: longitude })
                            },
                            (error) => {
                              console.error('Error fetching location:', error)
                            },
                          )
                        }}
                        color="primary"
                        style={{
                          backgroundColor: 'white',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                          padding: '10px',
                        }}
                      >
                        <MdGpsFixed size={20} />
                      </IconButton>
                    </div>
                  </Tooltip>

                  {/* Layer Control */}
                  <Tooltip title="Layer Control">
                    <div
                      style={{
                        position: 'absolute',
                        top: '180px',
                        right: '9px',
                        zIndex: 1,
                        borderRadius: '8px',
                      }}
                    >
                      <IconButton
                        onClick={toggleLayerMenu}
                        color="primary"
                        style={{
                          backgroundColor: 'white',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                          padding: '10px',
                        }}
                      >
                        <FaLayerGroup size={20} />
                      </IconButton>
                      {isLayerMenuOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '50px',
                            right: '0px',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <Tooltip title="Roadmap">
                            <IconButton
                              onClick={() => setMapType('roadmap')}
                              color={mapType === 'roadmap' ? 'primary' : 'default'}
                              style={{
                                backgroundColor: mapType === 'roadmap' ? '#3498db' : 'white',
                                color: mapType === 'roadmap' ? 'white' : 'black',
                                padding: '10px',
                              }}
                            >
                              <FaMap size={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Satellite View">
                            <IconButton
                              onClick={() => setMapType('satellite')}
                              color={mapType === 'satellite' ? 'primary' : 'default'}
                              style={{
                                backgroundColor: mapType === 'satellite' ? '#3498db' : 'white',
                                color: mapType === 'satellite' ? 'white' : 'black',
                                padding: '10px',
                              }}
                            >
                              <FaSatellite size={20} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </Tooltip>

                  {/* Drawing the polygon if coordinates are available */}
                  {polygonCoords.length > 0 && (
                    <Polygon
                      paths={polygonCoords}
                      options={{
                        fillColor: 'rgba(53, 223, 81, 0.5)',
                        fillOpacity: 0.5,
                        strokeColor: '#2980b9',
                        strokeOpacity: 1,
                        strokeWeight: 2,
                      }}
                    />
                  )}

                  {/* Marker at the selected location (used for both polygon and circle center) */}
                  <Marker position={selectedLocation} />

                  {/* Circle drawn at selected location */}
                  <Circle
                    center={selectedLocation} // Circle's center is the selected location
                    radius={radius} // Circle radius in meters
                    options={{
                      fillColor: 'rgba(53, 223, 81, 0.5)',
                      fillOpacity: 0.5,
                      strokeColor: '#2980b9',
                      strokeOpacity: 1,
                      strokeWeight: 2,
                    }}
                  />
                </GoogleMap>
              </div>
            ) : (
              <div>Loading Google Maps...</div>
            )}
          </div>

          {/* Form Fields */}
          <div
            className="mt-4"
            style={{
              backgroundColor: '#ffffff', // Light background
              padding: '20px',
              borderRadius: '10px', // Rounded corners
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow
              border: '1px solid #e0e0e0', // Optional border
            }}
          >
            {/* Geofence Name Input */}
            <TextField
              fullWidth
              label="Geofence Name"
              name="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              sx={{
                marginBottom: '20px', // Add spacing below the input
                '& .MuiInputLabel-root': {
                  color: '#34495e', // Label color
                  fontWeight: 'bold',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#dfe6e9', // Border color
                  },
                  '&:hover fieldset': {
                    borderColor: '#3498db', // Border color on hover
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3498db', // Border color when focused
                  },
                },
              }}
            />

            {/* Select Place Type */}
            <Select
              placeholder="Select Place Type..."
              value={PlaceType.find((option) => option.value === formData.type) || ''}
              onChange={(selectedOption) =>
                setFormData({ ...formData, type: selectedOption ? selectedOption.value : '' })
              }
              options={PlaceType}
              styles={{
                container: (base) => ({
                  ...base,
                  marginBottom: '20px', // Add spacing below the dropdown
                }),
                control: (base) => ({
                  ...base,
                  borderColor: '#dfe6e9', // Border color
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#3498db', // Border color on hover
                  },
                }),
                placeholder: (base) => ({
                  ...base,
                  color: '#7f8c8d', // Placeholder color
                  fontWeight: '500',
                }),
                menuList: (base) => ({
                  ...base,
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
                }),
              }}
            />

            {/* Select Devices */}
            <Select
              isMulti
              options={deviceOptions}
              onChange={handleDeviceChange}
              value={selectedDevices}
              placeholder="Select Vehicles"
              styles={{
                container: (base) => ({
                  ...base,
                  marginBottom: '20px', // Add spacing below the dropdown
                }),
                control: (base) => ({
                  ...base,
                  borderColor: '#dfe6e9', // Border color
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#3498db', // Border color on hover
                  },
                }),
                placeholder: (base) => ({
                  ...base,
                  color: '#7f8c8d', // Placeholder color
                  fontWeight: '500',
                }),
                menuList: (base) => ({
                  ...base,
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
                }),
              }}
            />
          </div>

          {/* Submit Button */}
          <div className="d-flex justify-content-end" style={{ marginTop: '20px' }}>
            <Button variant="contained" color="primary" onClick={EditGeofenceSubmit}>
              Submit
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default Geofences
