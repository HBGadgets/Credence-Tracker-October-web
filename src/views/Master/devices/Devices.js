import React, { useState, useEffect } from 'react'
import axios from 'axios'
import AllInOneForm from './AllInOneForm'

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
  Step,
  Stepper,
  StepLabel,
} from '@mui/material'
import { RiEdit2Fill, RiAddBoxFill } from 'react-icons/ri'
import { AiFillDelete, AiOutlinePlus } from 'react-icons/ai'
import SearchIcon from '@mui/icons-material/Search'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormSelect,
  CHeaderNav,
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
import CloseIcon from '@mui/icons-material/Close'
import Cookies from 'js-cookie'
import { IoMdAdd } from 'react-icons/io'
import ReactPaginate from 'react-paginate'
import { Label } from '@mui/icons-material'
import toast, { Toaster } from 'react-hot-toast'
import { jwtDecode } from 'jwt-decode'
import * as XLSX from 'xlsx' // For Excel export
import jsPDF from 'jspdf' // For PDF export
import 'jspdf-autotable' // For table formatting in PDF
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'
import AddDeviceModal from './AddDeviceForm'
import EditDeviceModal from './EditDeviceForm'
import '../../../../src/app.css'
import { getDevices, getGroups, getUsers, Selector } from '../../dashboard/dashApi'
import { default as Sselect } from 'react-select'
import '../index.css'
import './Devices.css'
import { LuRefreshCw } from 'react-icons/lu'
import IconDropdown from '../../../components/ButtonDropdown'
import { FaRegFilePdf, FaPrint } from 'react-icons/fa6'
import { PiMicrosoftExcelLogo } from 'react-icons/pi'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaArrowUp } from 'react-icons/fa'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import Page404 from '../../pages/page404/Page404'

const accessToken = Cookies.get('authToken')

const decodedToken = jwtDecode(accessToken)

const Devices = () => {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false) // Modal for adding a new row
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [limit, setLimit] = useState(20)
  const [currentItems, setCurrentItems] = useState([])

  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const [extendedPasswordModel, setExtendedPasswordModel] = useState(false)
  const myPassword = '123456'
  const [extendedPassword, setExtendedPassword] = useState()
  const [passwordCheck, setPasswordCheck] = useState(false)
  const [extendedYear, setExtendedYear] = useState(null)

  const [groups, setGroups] = useState([])
  const [users, setUsers] = useState([])
  const [drivers, setDrivers] = useState([])
  const [areas, setAreas] = useState([])
  const [models, setModels] = useState([])
  const [categories, setCategories] = useState([])
  const [keyFeature, setKeyFeature] = useState()

  const token = Cookies.get('authToken')
  const decodedToken = jwtDecode(token)

  const [currentStep, setCurrentStep] = useState(0)
  const steps = ['Device Info', 'Assign To', 'Subscription']
  const [filteredData, setFilteredData] = useState([])

  const [open, setOpen] = useState(false)
  const [customExtendDate, setCustomExtendDate] = useState('')

  const [selectedUsername, setSelectedUsername] = useState('') // State for username
  const [selectedGroupName, setSelectedGroupName] = useState('') // State for group name
  const [devices, setDevices] = useState([]) // Initialize devices as an empty array

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleModalClose = () => {
    setEditModalOpen(false)
    setAddModalOpen(false)
    setExtendedPasswordModel(false)
    setCurrentStep(0)
    setFormData({})
  }

  // Go to the next step
  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  // Go to the previous step
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  // pagination code
  useEffect(() => {
    const currentI = data.slice(currentPage * limit, (currentPage + 1) * limit)
    setCurrentItems(currentI)

    console.log('currentItems', currentItems)
  }, [currentPage, limit, data])

  const handlePageClick = (event) => {
    setCurrentPage(event.selected)
  }

  const columns = [
    { Header: 'Device Id', accessor: '_id' },
    { Header: 'Vehicles  Name', accessor: 'name' }, // Maps to 'name'
    { Header: 'IMEI No.', accessor: 'uniqueId' }, // Maps to 'uniqueId'
    { Header: 'Sim', accessor: 'sim' }, // Maps to 'sim'
    { Header: 'Speed', accessor: 'speed' }, // Maps to 'speed'
    { Header: 'Average', accessor: 'average' }, // Maps to 'average'
    { Header: 'Users', accessor: 'users' },
    { Header: 'Groups', accessor: 'groups' },
    { Header: 'Driver', accessor: 'Driver' },
    { Header: 'Geofences', accessor: 'geofences' },
    { Header: 'Model', accessor: 'model' }, // Maps to 'model'
    { Header: 'Category', accessor: 'category' }, // Maps to 'category'
    { Header: 'Installation Date', accessor: 'installationdate' }, // Maps to 'installationdate'
    { Header: 'Expiration', accessor: 'expirationdate' }, // Maps to 'expirationdate'
    { Header: 'Extend Date', accessor: 'extenddate' },
    { Header: 'Key Feature', accessor: 'keyFeature' },
  ]

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '66%',
    height: '82vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto', // Enable vertical scrolling
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    margintop: '8px',
  }
  /* Replace -ms-high-contrast with forced-colors */

  const handleEditDateInputChange = (e) => {
    const { name, value } = e.target
    setExtendedPasswordModel(true)

    if (passwordCheck) {
      setFormData((prevData) => ({ ...prevData, [name]: value }))
    }
  }

  const [rows, setRows] = useState([])

  // ###################### Fetch device Data ######################

  function compareAndMerge(oldApi, newApi) {
    const oldApiMap = {}
    const mergedData = []

    // Create a map for old API devices using uniqueId for quick lookup
    oldApi.forEach((oldDevice) => {
      oldApiMap[oldDevice.uniqueId] = oldDevice
    })

    // Iterate over new API devices and merge with old API if a match is found
    newApi.forEach((newDevice) => {
      const matchingOldDevice = oldApiMap[newDevice.uniqueId]

      if (matchingOldDevice) {
        // Merge old and new API data
        mergedData.push({
          id: matchingOldDevice.id,
          _id: newDevice._id,
          name: matchingOldDevice.name || newDevice.name,
          uniqueId: matchingOldDevice.uniqueId,
          sim: newDevice.sim || matchingOldDevice.phone,
          speed: newDevice.speed || '',
          average:
            newDevice.average ||
            (matchingOldDevice.attributes ? matchingOldDevice.attributes.avg111111 : ''),
          users: newDevice.users || [],
          groups: newDevice.groups || [],
          driver: newDevice.Driver || null,
          geofences: newDevice.geofences || [],
          model: matchingOldDevice.model || newDevice.model,
          category: matchingOldDevice.category || newDevice.category,
          installationDate: newDevice.installationdate || null,
          expirationDate: newDevice.expirationdate || null,
          extendDate: newDevice.extenddate || null,
          lastUpdate: newDevice.lastUpdate || matchingOldDevice.lastUpdate,
          keyFeature: newDevice.keyFeature,
        })

        // Remove the old device from the map, so it's not added again later
        delete oldApiMap[newDevice.uniqueId]
      } else {
        // If no matching old device, add the new device directly
        mergedData.push({
          _id: newDevice._id,
          name: newDevice.name,
          uniqueId: newDevice.uniqueId,
          sim: newDevice.sim,
          speed: newDevice.speed || '',
          average: newDevice.average || '',
          users: newDevice.users || [],
          groups: newDevice.groups || [],
          driver: newDevice.Driver || null,
          geofences: newDevice.geofences || [],
          model: newDevice.model,
          category: newDevice.category,
          installationDate: newDevice.installationdate || null,
          expirationDate: newDevice.expirationdate || null,
          extendDate: newDevice.extenddate || null,
          lastUpdate: newDevice.lastUpdate || null,
          keyFeature: newDevice.keyFeature,
        })
      }
    })

    // Add any remaining old devices that were not matched by new API
    Object.values(oldApiMap).forEach((oldDevice) => {
      mergedData.push({
        id: oldDevice.id,
        name: oldDevice.name,
        uniqueId: oldDevice.uniqueId,
        sim: oldDevice.phone,
        speed: '', // Old API doesn't have speed info
        average: oldDevice.attributes ? oldDevice.attributes.avg111111 : '',
        users: [],
        groups: [],
        driver: null,
        geofences: [],
        model: oldDevice.model,
        category: oldDevice.category,
        installationDate: null,
        expirationDate: null,
        extendDate: null,
        lastUpdate: oldDevice.lastUpdate,
      })
    })

    return mergedData
  }

  const fetchData = async () => {
    setLoading(true) // Start loading
    try {
      if (decodedToken.superadmin) {
        const username = 'hbtrack'
        const password = '123456'
        const authtoken = btoa(`${username}:${password}`)

        const [oldApiResponse, newApiResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_POSITION}/api/devices`, {
            headers: {
              Authorization: `Basic ${authtoken}`,
            },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/device`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        // Process responses if needed
        const oldApiData = oldApiResponse.data //.slice(900,901)
        const newApiData = newApiResponse.data.devices //.slice(2857,2858)

        console.log('oldApiData: ', oldApiData)
        console.log('newApiData: ', newApiData)

        const mergedResult = []
        function compareAndMerge(oldApiData, newApiData) {
          // Normalize old and new data to keep the key names consistent
          newApiData.forEach((newItem) => {
            const oldItem = oldApiData.find((item) => item.id == newItem.deviceId)
            if (oldItem) {
              if (newItem.driver) {
                oldItem.Driver = newItem.driver
                delete oldItem.driver
              }
              mergedResult.push({ ...oldItem, ...newItem })
            } else {
              mergedResult.push(newItem)
            }
          })

          // Add remaining old data that wasn't in new data
          oldApiData.forEach((oldItem) => {
            const newItem = newApiData.find((item) => item.deviceId == oldItem.id)
            if (!newItem) {
              mergedResult.push(oldItem)
            }
          })

          return mergedResult
        }
        compareAndMerge(oldApiData, newApiData)
        console.log(' merge data hai : ', mergedResult)
        setData(mergedResult)
      } else {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/device`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Access the devices array from the response
        if (response.data && Array.isArray(response.data.devices)) {
          const deviceData = response.data.devices.map((device) => ({
            _id: device._id || 'N/A',
            name: device.name || 'N/A',
            uniqueId: device.uniqueId || 'N/A',
            sim: device.sim || 'N/A', //
            speed: device.speed || 'N/A',
            average: device.average || 'N/A',
            model: device.model || 'N/A',
            category: device.category || 'N/A',
            Driver: device.Driver || 'N/A',
            installationdate: device.installationdate || 'N/A',
            expirationdate: device.expirationdate || 'N/A',
            extenddate: device.extenddate || 'N/A',
            groups: device.groups || [],
            users: device.users || [],
            geofences: device.geofences || [],
            keyFeature: device.keyFeature,
          }))

          setData(deviceData)
        } else {
          setError(error.message)
          console.error('Expected an array but got:', response.data)
          toast.error('Unexpected data format received.')
        }
      }
    } catch (error) {
      setError(error.message)
      console.error('Fetch data error:', error)
      toast.error('An error occurred while fetching data.')
    } finally {
      setLoading(false) // Stop loading once data is fetched
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ##################### Filter data by search query #######################

  const [pageCount, setPageCount] = useState(0)
  const filterDevices = () => {
    if (!searchQuery) {
      setFilteredData(currentItems)
    }
    if (searchQuery) {
      const filtered = data?.filter(
        //currentItems.filter
        (device) =>
          device.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.uniqueId?.includes(searchQuery) ||
          device.sim?.includes(searchQuery) ||
          device.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.category?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      // a = filtered.length
      setPageCount(filtered.length)
      const filteredByPage = filtered.slice(currentPage * limit, (currentPage + 1) * limit)
      setFilteredData(filteredByPage)
    }
  }

  const handleSearch = () => {
    filterDevices(searchQuery)
  }

  // KEYBOARD EVENT HANDLER
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  useEffect(() => {
    if (searchQuery == '') {
      filterDevices(searchQuery)
    }
    if (searchQuery) {
      filterDevices(searchQuery)
    }
  }, [currentItems, searchQuery, currentPage, limit])

  // #########################  Edit Device API function #######################

  const handleEditIconClick = (row) => {
    console.log(row)
    setFormData({
      ...row,
      name: row.name,
      uniqueId: row.uniqueId,
      speed: row.speed,
      sim: row.sim,
      model: row.model,
      installationdate: row.installationdate,
      extenddate: row.extenddate,
      expirationdate: row.expirationdate,
      category: row.category,
      average: row.average,
      Driver: row.Driver?._id,
      geofences: row.geofences?.map((geo) => geo._id),
      groups: row.groups?.map((group) => group._id),
      users: row.users?.map((user) => user._id),
      keyFeature: row.keyFeature,
    })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    console.log('Data to submit:', formData)

    try {
      // API call
      const accessToken = Cookies.get('authToken')
      const username = 'hbtrack'
      const password = '123456'
      const token1 = btoa(`${username}:${password}`)
      const oldPutApi = `${import.meta.env.VITE_API_POSITION}/api/devices`
      const newPutApi = `${import.meta.env.VITE_API_URL}/device`
      const oldPostApi = `${import.meta.env.VITE_API_POSITION}/api/devices`
      const newPostApi = `${import.meta.env.VITE_API_URL}/device`
      let response1
      let response2

      const oldRow = {
        id: formData.id,
        name: formData.name || '',
        uniqueId: formData.uniqueId ? formData.uniqueId.trim() : '',
        phone: formData.sim || '',
        model: formData.model || '',
        category: formData.category || '',
      }
      const newRow = {
        name: formData.name || '',
        uniqueId: formData.uniqueId ? formData.uniqueId.trim() : '',
        sim: formData.sim || '',
        groups: Array.isArray(formData.groups) ? formData.groups : [],
        users: Array.isArray(formData.users) ? formData.users : [],
        Driver: formData.Driver || '',
        speed: formData.speed || '',
        average: formData.average || '',
        geofences: Array.isArray(formData.geofences) ? formData.geofences : [],
        model: formData.model || '',
        category: formData.category || '',
        installationdate: formData.installationdate || '',
        expirationdate: formData.expirationdate || '',
        extenddate: formData.extenddate || '',
        keyFeature: formData.keyFeature,
      }

      if (formData.id && formData._id) {
        response2 = await axios.put(`${newPutApi}/${formData._id}`, newRow, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      } else if (formData.id && !formData._id) {
        response2 = await axios.post(newPostApi, newRow, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      } else if (!formData.id && formData._id) {
        // Call old POST API and new PUT API
        response1 = await axios.post(oldPostApi, oldRow, {
          headers: {
            Authorization: `Basic ${token1}`,
            'Content-Type': 'application/json',
          },
        })

        response2 = await axios.put(`${newPutApi}/${formData._id}`, newRow, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      }

      toast.success('User is edited successfully')
      setEditModalOpen(false)
      fetchData()
      setLoading(false)

      setFormData({})
    } catch (error) {
      console.error('Error during submission:', error)
      let errorMessage = 'An error occurred'

      toast.error(errorMessage)
    }
  }

  // ########################################################################
  // ######################## Delete Device API function #######################

  const handleDeleteSelected = async (item) => {
    console.log(item)
    const confirmed = window.confirm('Are you sure you want to delete this record?')
    if (!confirmed) return

    const accessToken = Cookies.get('authToken')
    const username = 'hbtrack'
    const password = '123456'
    const token1 = btoa(`${username}:${password}`)
    const oldDeleteApi = `${import.meta.env.VITE_API_POSITION}/api/devices`
    const newDeleteApi = `${import.meta.env.VITE_API_URL}/device`
    let response1
    let response2

    try {
      if (item.id && item._id) {
        response1 = await axios.delete(`${oldDeleteApi}/${item.id}`, {
          headers: {
            Authorization: `Basic ${token1}`,
            'Content-Type': 'application/json',
          },
        })

        response2 = await axios.delete(`${newDeleteApi}/${item._id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (response1.status == 204 && response2.status == 200) {
          toast.error('Record deleted successfully')
          fetchData()
        }
      } else if (item.id && !item._id) {
        response1 = await axios.delete(`${oldDeleteApi}/${item.id}`, {
          headers: {
            Authorization: `Basic ${token1}`,
            'Content-Type': 'application/json',
          },
        })

        if (response1.status == 204) {
          toast.error('Record deleted successfully')
          fetchData()
        }
      } else if (!item.id && item._id) {
        response2 = await axios.delete(`${newDeleteApi}/${item._id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (response2.status == 200) {
          toast.error('Record deleted successfully')
          fetchData()
        }
      }
    } catch (error) {
      console.error('Error during DELETE request:', error)
      toast.error('Unable to delete record. Please check the console for more details.')
    }
  }

  // ######################################################################
  // ######################  Getting other field data ###############################
  useEffect(() => {
    const fetchUsers = async () => {
      console.log('Fetching users...')
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log('Fetched users:', response.data)

        // Checking if response contains the expected structure
        if (response.data && Array.isArray(response.data.users)) {
          setUsers(response.data.users) // Correct mapping
        } else {
          console.error('Unexpected response structure:', response.data)
        }
      } catch (error) {
        console.error('Fetch users error:', error)
        toast.error('An error occurred while fetching users.')
      }
    }

    const fetchGroups = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/group`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.json()
        console.log('groups: ', data.groups)
        setGroups(data.groups) // Assuming the API returns { groups: [...] }
      } catch (error) {
        setError(error.message)
        console.log(error)
      }
    }

    const fetchAreasData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/geofence`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.json()
        if (data.geofences) {
          setAreas(data.geofences)
        }
      } catch (error) {
        console.error('Error fetching areas data:', error)
      }
    }

    const fetchDrivers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/driver`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response && response.data) {
          setDrivers(response.data.drivers) // Set the driver data from the API response
        }
      } catch (error) {
        console.error('Error fetching drivers:', error)
      }
    }

    const fetchModels = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/model`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response?.data?.models) {
          setModels(response.data.models) // Store the fetched models in state
        }
      } catch (error) {
        console.error('Error fetching models:', error)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/category`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response?.data) {
          setCategories(response.data) // Store the fetched categories in state
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchUsers()
    fetchGroups()
    fetchAreasData()
    fetchDrivers()
    fetchModels()
    fetchCategories()
  }, [])

  // ################################################################
  // Handle input

  const handleInputChange = (event) => {
    const { name, value } = event.target
    // console.log(`Selected value: ${value}`); // Log the selected value
    setFormData({
      ...formData,
      [name]: value,
    })
    console.log('Add device formData', formData)
  }

  // Handle year selection for expiration date

  const [showExpirationDropdown, setShowExpirationDropdown] = useState(false)

  // Handle year selection and calculate expiration date based on the number of years selected
  const handleYearSelection = (years) => {
    const installationDate = formData.installationdate

    console.log('installation hai ye ', installationDate)

    if (installationDate) {
      const installation = new Date(installationDate)
      const expirationDate = new Date(installation.setFullYear(installation.getFullYear() + years))
        .toISOString()
        .split('T')[0] // Format to yyyy-mm-dd

      setFormData({
        ...formData,
        expirationdate: expirationDate,
      })
    }
  }

  // below is when we deal with custom date
  const handleCheckPassword = () => {
    if (extendedPassword === myPassword) {
      setPasswordCheck(true)
      setExtendedPasswordModel(false)
      alert('Password is correct')

      // Update the expiration date
      if (customExtendDate) {
        // Apply the custom date selected earlier
        setFormData({
          ...formData,
          extenddate: customExtendDate,
          expirationdate: customExtendDate,
        })
        setCustomExtendDate(null) // Clear the custom date state after applying
      } else if (formData.expirationdate && extendedYear) {
        // Apply year extension logic
        const expiry = new Date(formData.expirationdate)
        const extendedDate = new Date(expiry.setFullYear(expiry.getFullYear() + extendedYear))
          .toISOString()
          .split('T')[0]

        setFormData({
          ...formData,
          extenddate: extendedDate,
          expirationdate: extendedDate,
        })
      }

      setSelectedYears(null) // Reset the selected years
    } else {
      alert('Password is not correct')
    }
  }

  // this is run when date is extended i edit mmodel
  const handleExtendYearSelection = (years) => {
    setExtendedYear(years) // new state to hold the selected number of years
    setExtendedPasswordModel(true)
  }

  // console.log("pageCountttttttttttt",pageCount)
  console.log('data.lengthhhhhhhhhhhhhh', data)
  console.log('filteredDataaaaaaaaaaaaaa offf devicessssssssssssssssssss', filteredData)

  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [fillLoading, setFillLoading] = useState(false)
  const [fillUsers, setFillUsers] = useState([])
  const [fillGroups, setFillGroups] = useState([])
  const [fillDevices, setFillDevices] = useState([])

  // Generic Fetch Handler
  const fetchFillData = async (fetchFunction, setData, params = null) => {
    setFillLoading(true)
    try {
      const data = await fetchFunction(params)
      setData(data)
    } catch (error) {
      console.error(`Error fetching data:`, error)
    } finally {
      setFillLoading(false)
    }
  }

  useEffect(() => {
    fetchFillData(getUsers, setFillUsers)
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchFillData(getGroups, setFillGroups, selectedUser)
    }
  }, [selectedUser])

  useEffect(() => {
    if (selectedGroup) {
      const fetchDevicesAndFilter = async () => {
        try {
          const devicesData = await getDevices(selectedGroup)
          setFillDevices(devicesData)

          setDevices(devicesData)
          setFilteredData(devicesData)
          // const finalData = filteredData.filter((vehicle) =>
          //   devicesData.some((device) => device.deviceId === vehicle.deviceId),
          // )
          console.log('Fetched Devices:', devicesData)
        } catch (error) {
          console.error('Error fetching devices:', error)
        }
      }
      fetchDevicesAndFilter()
    }
  }, [selectedGroup])
  console.log('fill devices', fillDevices)

  useEffect(() => {
    const fetchDevices = async () => {
      if (!selectedGroup) {
        setFillDevices([]) // Reset if no group is selected
        return
      }

      try {
        const devicesData = await getDevices(selectedGroup)
        setFillDevices(devicesData) // Set only relevant devices
        console.log('Filtered Devices for Group:', devicesData)
      } catch (error) {
        console.error('Error fetching devices:', error)
      }
    }

    fetchDevices()
  }, [selectedGroup]) // Runs when selectedGroup changes

  // Get selected device name safely
  const selectedDevice = devices.find((device) => device.deviceId === formData.Devices)
  const selectedDeviceName = selectedDevice ? selectedDevice.name : ''

  useEffect(() => {
    console.log('Selected Vehicle Name:', selectedDeviceName)
  }, [selectedDeviceName]) // Log when the selected device changes

  // Dropdown icons downloads section

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

  // dropdown handel section

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

  // Export to Excel
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
        company: {
          name: 'Credence Tracker',
          copyright: `© ${new Date().getFullYear()} Credence Tracker`,
        },
      }

      // Create table columns (header row) based on your columns data
      const tableColumn = ['SN', ...columns.slice(1).map((column) => column.Header)]

      // Create table rows from filteredData
      const tableRows = filteredData.map((item, rowIndex) => {
        const rowData = columns.slice(1).map((column) => {
          const accessor = column.accessor

          // Handle specific columns based on the column's accessor
          if (accessor === 'groups') {
            return item.groups?.map((group) => group.name).join(', ') || 'N/A'
          } else if (accessor === 'geofences') {
            return item.geofences?.map((geofence) => geofence.name).join(', ') || 'N/A'
          } else if (accessor === 'users') {
            return item.users?.map((user) => user.username).join(', ') || 'N/A'
          } else if (accessor === 'Driver') {
            return item.Driver?.name || 'N/A'
          } else if (accessor === 'device') {
            return item.device?.name || 'N/A'
          } else {
            return item[accessor] || 'N/A'
          }
        })
        return [rowIndex + 1, ...rowData] // Add SN column
      })

      // Initialize workbook and worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Vehicle Report')

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
        worksheet.mergeCells('A1:I1')

        // Report title
        const subtitleRow = worksheet.addRow(['Vehicle Report'])
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
        worksheet.mergeCells('A2:I2')

        // Metadata
        worksheet.addRow([`Generated by: ${decodedToken.username || 'N/A'}`])
        worksheet.addRow([`Generated: ${new Date().toLocaleString()}`])
        worksheet.addRow([]) // Spacer
      }

      // Add data table
      const addDataTable = () => {
        // Add column headers
        const headerRow = worksheet.addRow(tableColumn)
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
        tableRows.forEach((rowData) => {
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
        worksheet.columns = tableColumn.map((col, index) => ({
          width: index === 0 ? 8 : 20, // First column (SN) is narrower
          style: { alignment: { horizontal: 'left' } },
        }))
      }

      // Add footer
      const addFooter = () => {
        worksheet.addRow([]) // Spacer
        const footerRow = worksheet.addRow([CONFIG.company.copyright])
        footerRow.font = { italic: true }
        worksheet.mergeCells(`A${footerRow.number}:I${footerRow.number}`)
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
      const filename = `Vehicles_Report_${new Date().toISOString().split('T')[0]}.xlsx`
      saveAs(blob, filename)
      toast.success('Excel file downloaded successfully')
    } catch (error) {
      console.error('Excel Export Error:', error)
      toast.error(error.message || 'Failed to export Excel file')
    }
  }

  // Export to PDF
  const exportToPDF = () => {
    try {
      // Validate data before proceeding
      // if (!Array.isArray(sortedData) || sortedData.length === 0) {
      //   throw new Error('No data available for PDF export');
      // }

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
      doc.text('Vehicle Report', CONFIG.layout.margin, 35)

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

      // Replace this part with the tableColumn and tableRows logic from the original code
      const tableColumn = ['SN', ...columns.slice(1).map((column) => column.Header)]
      const tableRows = filteredData.map((item, rowIndex) => {
        const rowData = columns.slice(1).map((column) => {
          const accessor = column.accessor
          if (accessor === 'groups') {
            return item.groups?.map((group) => group.name).join(', ') || 'N/A'
          } else if (accessor === 'geofences') {
            return item.geofences?.map((geofence) => geofence.name).join(', ') || 'N/A'
          } else if (accessor === 'users') {
            return item.users?.map((user) => user.username).join(', ') || 'N/A'
          } else if (accessor === 'Driver') {
            return item.Driver?.name || 'N/A'
          } else if (accessor === 'device') {
            return item.device?.name || 'N/A'
          } else {
            return item[accessor] || 'N/A'
          }
        })
        return [rowIndex + 1, ...rowData]
      })

      // Generate the table
      doc.autoTable({
        startY: 50,
        head: [tableColumn],
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
          4: { cellWidth: 15 },
          5: { cellWidth: 15 },
          7: { cellWidth: 15 },
          9: { cellWidth: 20 },
          10: { cellWidth: 15 },
          11: { cellWidth: 15 },
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
      const filename = `Vehicle_Report_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF Export Error:', error)
      toast.error(error.message || 'Failed to export PDF')
    }
  }

  const handleClearFilter = () => {
    setFilteredData(data) // Reset to show all data
    setSearchQuery('') // Clear the search query field
    setCurrentPage(0) // Reset pagination
    setSelectedUser('') // Clear the selected user
    setSelectedUsername('')
    setSelectedGroup('') // Clear the selected group
    setSelectedGroupName('')
    setFormData('')
  }

  if (error) return <Page404 />

  return (
    <div className="d-flex flex-column mx-md-3 mt-3 h-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="d-flex gap- justify-content-end gap-3  mb-2">
        <div className="d-flex">
          <div
            className="ms-2 p-0 me-1 refresh"
            onClick={() => {
              window.location.reload()
            }}
          >
            <LuRefreshCw className="refreshIcon" />
          </div>
        </div>
      </div>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader className="grand d-flex justify-content-between align-items-center">
              <strong>Vehicles</strong>
              <div className="d-flex flex-wrap align-items-center gap-3">
                <div className="d-flex flex-wrap gap-3">
                  <Sselect
                    id="user-select"
                    options={fillUsers.map((user) => ({
                      value: user._id,
                      label: user.username,
                    }))}
                    placeholder="Select a User"
                    value={
                      selectedUser
                        ? {
                            value: selectedUser,
                            label: users?.find((user) => user._id === selectedUser)?.username || '',
                          }
                        : null
                    }
                    onChange={(selectedOption) => {
                      const selectedUserId = selectedOption?.value || null
                      const selectedUsernameValue =
                        selectedOption?.label ||
                        users?.find((user) => user._id === selectedUserId)?.username ||
                        ''

                      // Set selected user
                      setSelectedUser(selectedUserId)
                      setSelectedUsername(selectedUsernameValue)

                      // Reset selected group when user changes
                      setSelectedGroup(null)
                      setSelectedGroupName('')
                    }}
                    isLoading={fillLoading}
                    isClearable
                  />

                  <Sselect
                    style={{
                      zIndex: '1000',
                      maxWidth: '10rem',
                    }}
                    id="group-select"
                    placeholder="Select Group(s)"
                    options={[
                      { value: 'select_all', label: 'Select All' },
                      ...fillGroups?.map((group) => ({
                        value: group._id,
                        label: group.name,
                      })),
                    ]}
                    value={
                      selectedGroup?.length
                        ? selectedGroup.map((groupId) => {
                            const group = groups.find((g) => g._id === groupId)
                            return {
                              value: groupId,
                              label: group?.name || '',
                            }
                          })
                        : []
                    }
                    onChange={(selectedOptions) => {
                      if (!selectedOptions || selectedOptions.length === 0) {
                        setSelectedGroup([])
                        setSelectedGroupName('')
                        console.log('Group selection cleared')
                        return
                      }

                      const isSelectAllSelected = selectedOptions.some(
                        (opt) => opt.value === 'select_all',
                      )

                      if (isSelectAllSelected) {
                        const allGroupIds = fillGroups.map((group) => group._id)
                        const allGroupNames = fillGroups.map((group) => group.name).join(', ')

                        setSelectedGroup(allGroupIds)
                        setSelectedGroupName(allGroupNames)

                        console.log('All Groups Selected')
                      } else {
                        const selectedGroupIds = selectedOptions.map((opt) => opt.value)
                        const selectedGroupNames = selectedOptions
                          .map((opt) => opt.label)
                          .join(', ')

                        setSelectedGroup(selectedGroupIds)
                        setSelectedGroupName(selectedGroupNames)

                        console.log('Selected Group IDs:', selectedGroupIds)
                        console.log('Selected Group Names:', selectedGroupNames)
                      }
                    }}
                    isLoading={fillLoading}
                    isClearable
                    isMulti
                  />

                  <Selector
                    className="particularFilter"
                    setFilteredData={setFilteredData}
                    filteredData={filteredData}
                    fillDevices={
                      devices?.filter((device) =>
                        device.groups?.some(
                          (groupId) => selectedGroup?.includes(String(groupId)), // ensure match by type
                        ),
                      ) || []
                    }
                    onChange={(selectedDeviceId) => {
                      if (!devices || devices.length === 0) {
                        console.warn('Devices list is empty or undefined')
                        return
                      }

                      setFormData((prev) => ({ ...prev, Devices: selectedDeviceId }))

                      const selectedDevice = devices.find(
                        (device) => device.deviceId === selectedDeviceId,
                      )

                      if (selectedDevice) {
                        console.log('Selected Device ID:', selectedDeviceId)
                        console.log('Selected Device Name:', selectedDevice.name)
                      } else {
                        console.warn('Selected device not found in the list')
                      }
                    }}
                  />
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="me-3 d-none d-md-block">
                    <div className="input-group">
                      <InputBase
                        type="search"
                        className="form-control border"
                        style={{ height: '40px' }}
                        placeholder="Search for Vehicles"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <IconButton
                        className="bg-white rounded-end border disable"
                        style={{ height: '40px' }}
                        onClick={handleSearch}
                      >
                        <SearchIcon />
                      </IconButton>
                    </div>
                  </div>

                  <button
                    className="btn text-white"
                    style={{ backgroundColor: '#0a2d63' }}
                    onClick={handleClearFilter}
                  >
                    Clear Filter
                  </button>

                  {decodedToken.superadmin && (
                    <button
                      onClick={handleOpen}
                      className="btn text-white"
                      style={{ backgroundColor: '#0a2d63' }}
                    >
                      Add Vehicle
                    </button>
                  )}
                </div>
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
                  bordered
                  align="middle"
                  className="mb-2 border min-vh-25 rounded-top-3"
                  hover
                  responsive
                >
                  <CTableHead
                    bordered
                    align="middle"
                    className="mb-2 border min-vh-25 rounded-top-3"
                    hover
                    responsive
                  >
                    <CTableRow style={{ height: '6vh' }} className="text-nowrap ">
                      <CTableHeaderCell
                        className="text-center text-center text-white sr-no table-cell"
                        style={{ backgroundColor: '#0a2d63' }}
                      >
                        <strong>SN</strong>
                      </CTableHeaderCell>
                      {columns.slice(1).map((column, index) => (
                        <CTableHeaderCell
                          key={index}
                          className="text-center text-center text-white sr-no table-cell"
                          style={{ backgroundColor: '#0a2d63' }}
                        >
                          <strong>{column.Header}</strong>
                        </CTableHeaderCell>
                      ))}
                      {decodedToken.superadmin ? (
                        <CTableHeaderCell
                          className="text-center text-center text-white sr-no table-cell"
                          style={{ backgroundColor: '#0a2d63' }}
                        >
                          <strong>Actions</strong>
                        </CTableHeaderCell>
                      ) : null}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody style={{ fontSize: '14px' }}>
                    {loading ? (
                      <CTableRow key="loading" style={{ border: '1px soild black' }}>
                        <CTableDataCell colSpan="18" className="text-center">
                          <div className="text-nowrap mb-2 text-center">
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
                      filteredData?.map((item, index) => (
                        <CTableRow key={item._id}>
                          <CTableDataCell
                            style={{
                              backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                              border: 'none',
                            }}
                          >
                            {currentPage * limit + index + 1}
                          </CTableDataCell>
                          {columns.slice(1).map((column) => (
                            <CTableDataCell
                              key={column.accessor}
                              className="text-center"
                              style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                            >
                              {column.accessor === 'groups' ? (
                                <CFormSelect
                                  id="groups"
                                  className=" text-center border-2"
                                  style={{
                                    width: '100px',
                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                  }}
                                  value=""
                                >
                                  <option>{item.groups?.length || '0'}</option>
                                  {Array.isArray(item.groups) &&
                                    item.groups.map((group) => (
                                      <option key={group._id} value={group._id}>
                                        {group.name || 'undefine group'}
                                      </option>
                                    ))}
                                </CFormSelect>
                              ) : column.accessor === 'geofences' ? (
                                <CFormSelect
                                  id="geofence"
                                  className=" text-center border-2"
                                  style={{
                                    width: '120px',
                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                  }}
                                  value=""
                                >
                                  <option value="">{item.geofences?.length || '0'}</option>
                                  {Array.isArray(item.geofences) &&
                                    item.geofences.map((geofence, index) => (
                                      <option key={index} value={geofence._id}>
                                        {geofence.name}
                                      </option>
                                    ))}
                                </CFormSelect>
                              ) : column.accessor === 'users' ? (
                                <CFormSelect
                                  id="users"
                                  className=" text-center border-2"
                                  style={{
                                    width: '120px',
                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                  }}
                                  value=""
                                >
                                  <option value="">{item.users?.length || '0'}</option>
                                  {Array.isArray(item.users) &&
                                    item.users.map((user) => (
                                      <option key={user._id} value={user._id}>
                                        {user.username}
                                      </option>
                                    ))}
                                </CFormSelect>
                              ) : column.accessor === 'Driver' ? (
                                <div style={{ width: '120px' }}>
                                  {item[column.accessor]?.name || 'N/A'}
                                </div>
                              ) : item[column.accessor] ? (
                                item[column.accessor]
                              ) : (
                                'N/A'
                              )}
                            </CTableDataCell>
                          ))}

                          {decodedToken.superadmin ? (
                            <CTableDataCell
                              className="text-center d-flex"
                              style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                            >
                              <IconButton
                                aria-label="edit"
                                onClick={() => handleEditIconClick(item)}
                              >
                                <RiEdit2Fill
                                  style={{ fontSize: '20px', color: 'lightBlue', margin: '5.3px' }}
                                />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                onClick={() => handleDeleteSelected(item)}
                                sx={{ marginRight: '10px', color: 'red' }}
                              >
                                <AiFillDelete style={{ fontSize: '20px' }} />
                              </IconButton>
                            </CTableDataCell>
                          ) : null}
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="15" className="text-center">
                          <div
                            className="d-flex flex-column justify-content-center align-items-center"
                            style={{ height: '200px' }}
                          >
                            <p className="mb-0 fw-bold">
                              "Oops! Looks like there's no device available."
                            </p>
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

      {/* DropDown icons download section */}

      <div className="position-fixed bottom-0 end-0 mb-5 m-3 z-5">
        <IconDropdown items={dropdownItems} />
      </div>

      {/* pagination */}

      <div className="d-flex justify-content-center align-items-center">
        <div className="d-flex">
          {/* Pagination */}
          <div className="me-3">
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={
                searchQuery ? Math.ceil(pageCount / limit) : Math.ceil(data.length / limit)
              }
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

          {/* Items Per Page Selector */}
          <div style={{ width: '90px' }}>
            <CFormSelect
              aria-label="Select items per page"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              options={[
                { label: '20', value: '20' },
                { label: '50', value: '50' },
                { label: '100', value: '100' },
                { label: '500', value: '500' },
                { label: 'All', value: data.length }, // Dynamically set "All" to total data length
              ]}
            />
          </div>
        </div>
      </div>
      {/* </div> */}
      {addModalOpen && (
        <AddDeviceModal
          open={addModalOpen}
          handleClose={handleModalClose}
          style={style}
          token={token}
          fetchData={fetchData}
          currentStep={currentStep}
          steps={steps}
          columns={columns}
          formData={formData}
          users={users}
          groups={groups}
          drivers={drivers}
          areas={areas}
          models={models}
          categories={categories}
          handleInputChange={handleInputChange}
          handleNext={handleNext}
          handleBack={handleBack}
          handleYearSelection={handleYearSelection}
          setShowExpirationDropdown={setShowExpirationDropdown}
          selectedUsername={selectedUsername}
        />
      )}
      <EditDeviceModal
        editModalOpen={editModalOpen}
        handleModalClose={handleModalClose}
        currentStep={currentStep}
        style={style}
        handleNext={handleNext}
        handleBack={handleBack}
        handleEditIconClick={handleEditIconClick}
        handleEditSubmit={handleEditSubmit}
        columns={columns}
        formData={formData}
        handleInputChange={handleInputChange}
        users={users}
        groups={groups}
        drivers={drivers}
        areas={areas}
        models={models}
        categories={categories}
        steps={steps}
        handleExtendYearSelection={handleExtendYearSelection}
        setShowExpirationDropdown={setShowExpirationDropdown}
        customExtendDate={customExtendDate}
        setCustomExtendDate={setCustomExtendDate}
        setExtendedPasswordModel={setExtendedPasswordModel}
      />

      <Modal open={extendedPasswordModel} onClose={handleModalClose}>
        <Box sx={style} style={{ height: '30%' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <Typography variant="h6">Enter Password</Typography>
            <IconButton onClick={() => setExtendedPasswordModel(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Conditional rendering based on col.accessor */}
          <input
            type="password"
            name=""
            id=""
            value={extendedPassword}
            onChange={(e) => setExtendedPassword(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckPassword}
            sx={{ marginTop: 2 }}
          >
            Submit
          </Button>
        </Box>
      </Modal>
      <AllInOneForm
        open={open}
        setOpen={setOpen}
        handleClose={handleClose}
        handleOpen={handleOpen}
        style={style}
        token={token}
        fetchData={fetchData}
        currentStep={currentStep}
        steps={steps}
        columns={columns}
        formData={formData}
        setFormData={setFormData}
        users={users}
        groups={groups}
        drivers={drivers}
        areas={areas}
        models={models}
        categories={categories}
        handleInputChange={handleInputChange}
        handleNext={handleNext}
        handleBack={handleBack}
        handleYearSelection={handleYearSelection}
        setShowExpirationDropdown={setShowExpirationDropdown}
      />
    </div>
  )
}

export default Devices
