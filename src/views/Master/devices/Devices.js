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
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
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
import "../../../../src/app.css";


const Devices = () => {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false) // Modal for adding a new row
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
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

  const token = Cookies.get('authToken')
  const decodedToken = jwtDecode(token)

  const [currentStep, setCurrentStep] = useState(0)
  const steps = ['Device Info', 'Assign To', 'Subscription']
  const [filteredData, setFilteredData] = useState([])

  const [open, setOpen] = useState(false);
  const [customExtendDate, setCustomExtendDate] = useState('');


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
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

    console.log("currentItems", currentItems)
  }, [currentPage, limit, data])

  const handlePageClick = (event) => {
    setCurrentPage(event.selected)
  }

  const columns = [
    { Header: 'Device Id', accessor: '_id' },
    { Header: 'Device Name', accessor: 'name' }, // Maps to 'name'
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
        const password = '123456@'
        const authtoken = btoa(`${username}:${password}`)

        const [oldApiResponse, newApiResponse] = await Promise.all([
          axios.get(`http://63.142.251.13:8082/api/devices`, {
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
        const oldApiData = oldApiResponse.data  //.slice(900,901)
        const newApiData = newApiResponse.data.devices  //.slice(2857,2858)

        console.log('oldApiData: ', oldApiData)
        console.log('newApiData: ', newApiData)

        // const result = compareAndMerge(oldApiData, newApiData)
        // console.log(' merge data hai : ', result)
        //setData(result)

        const mergedResult = [];
        function compareAndMerge(oldApiData, newApiData) {
          // Normalize old and new data to keep the key names consistent
          newApiData.forEach(newItem => {
            const oldItem = oldApiData.find(item => item.id == newItem.deviceId);
            if (oldItem) {
              if (newItem.driver) {
                oldItem.Driver = newItem.driver;
                delete oldItem.driver;
              }
              mergedResult.push({ ...oldItem, ...newItem });
            } else {
              mergedResult.push(newItem);
            }
          });

          // Add remaining old data that wasn't in new data
          oldApiData.forEach(oldItem => {
            const newItem = newApiData.find(item => item.deviceId == oldItem.id);
            if (!newItem) {
              mergedResult.push(oldItem);
            }
          });

          return mergedResult;
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
          }))

          setData(deviceData)
        } else {
          console.error('Expected an array but got:', response.data)
          toast.error('Unexpected data format received.')
        }
      }
    } catch (error) {
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
      const filtered = data?.filter( //currentItems.filter
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
    if (event.key === "Enter") {
      handleSearch();
    }
  };

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
      const password = '123456@'
      const token1 = btoa(`${username}:${password}`)
      const oldPutApi = `http://63.142.251.13:8082/api/devices`
      const newPutApi = `${import.meta.env.VITE_API_URL}/device`
      const oldPostApi = `http://63.142.251.13:8082/api/devices`
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
      }

      if (formData.id && formData._id) {
        // Call both old PUT API and new PUT API
        // response1 = await axios.put(`${oldPutApi}/${formData.id}`, oldRow, {
        //   headers: {
        //     Authorization: `Basic ${token1}`,
        //     'Content-Type': 'application/json',
        //   },
        // })

        response2 = await axios.put(`${newPutApi}/${formData._id}`, newRow, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      } else if (formData.id && !formData._id) {
        // Call old PUT API and new POST API
        // response1 = await axios.put(`${oldPutApi}/${formData.id}`, oldRow, {
        //   headers: {
        //     Authorization: `Basic ${token1}`,
        //     'Content-Type': 'application/json',
        //   },
        // })

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
    const password = '123456@'
    const token1 = btoa(`${username}:${password}`)
    const oldDeleteApi = `http://63.142.251.13:8082/api/devices`
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
  // ######################  getting other field data ###############################
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

  const handleInputChange = (event) => {
    const { name, value } = event.target
    // console.log(`Selected value: ${value}`); // Log the selected value
    setFormData({
      ...formData,
      [name]: value,
    })
    console.log("Add device formData", formData)
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

  // const handleCheckPassword = () => {
  //   if (extendedPassword == myPassword) {
  //     setPasswordCheck(true)
  //     setExtendedPasswordModel(false)
  //     alert('Password is correct')

  //     // Now update the expiration date based on the selected plan (years)
  //     const ExpiryDate = formData.expirationdate
  //     if (ExpiryDate && extendedYear) {
  //       const expiry = new Date(ExpiryDate)
  //       const extendedDate = new Date(expiry.setFullYear(expiry.getFullYear() + extendedYear))
  //         .toISOString()
  //         .split('T')[0] // Format to yyyy-mm-dd

  //       // Now set the extended date
  //       setFormData({
  //         ...formData,
  //         extenddate: extendedDate,
  //         expirationdate: extendedDate,
  //       })

  //       setSelectedYears(null) // Reset the selected years after updating
  //     }
  //   } else {
  //     alert('Password is not correct')
  //   }
  // }
  // below is when we deal with custom date
  const handleCheckPassword = () => {
    if (extendedPassword === myPassword) {
      setPasswordCheck(true);
      setExtendedPasswordModel(false);
      alert('Password is correct');

      // Update the expiration date
      if (customExtendDate) {
        // Apply the custom date selected earlier
        setFormData({
          ...formData,
          extenddate: customExtendDate,
          expirationdate: customExtendDate,
        });
        setCustomExtendDate(null); // Clear the custom date state after applying
      } else if (formData.expirationdate && extendedYear) {
        // Apply year extension logic
        const expiry = new Date(formData.expirationdate);
        const extendedDate = new Date(
          expiry.setFullYear(expiry.getFullYear() + extendedYear)
        )
          .toISOString()
          .split('T')[0];

        setFormData({
          ...formData,
          extenddate: extendedDate,
          expirationdate: extendedDate,
        });
      }

      setSelectedYears(null); // Reset the selected years
    } else {
      alert('Password is not correct');
    }
  };



  // this is run when date is extended i edit mmodel
  const handleExtendYearSelection = (years) => {
    setExtendedYear(years) // new state to hold the selected number of years
    setExtendedPasswordModel(true)
  }

  const exportToExcel = () => {
    // Map filtered data into the format required for export
    const dataToExport = filteredData.map((item, rowIndex) => {
      const rowData = columns.slice(1).reduce((acc, column) => {
        const accessor = column.accessor

        // Handle specific columns based on the column's accessor
        if (accessor === 'groups') {
          acc[column.Header] =
            item.groups && item.groups.length > 0
              ? item.groups.map((group) => group.name).join(', ') // Join group names if there are multiple
              : 'N/A'
        } else if (accessor === 'geofences') {
          acc[column.Header] =
            item.geofences && item.geofences.length > 0
              ? item.geofences.map((geofence) => geofence.name).join(', ') // Join geofence names if there are multiple
              : 'N/A'
        } else if (accessor === 'users') {
          acc[column.Header] =
            item.users && item.users.length > 0
              ? item.users.map((user) => user.username).join(', ') // Join usernames if there are multiple
              : 'N/A'
        } else if (accessor === 'Driver') {
          acc[column.Header] = item.Driver?.name || 'N/A'
        } else if (accessor === 'device') {
          acc[column.Header] = item.device?.name || 'N/A'
        } else {
          acc[column.Header] = item[accessor] || 'N/A' // Fallback for other columns
        }

        return acc
      }, {})

      return { SN: rowIndex + 1, ...rowData } // Include row index as SN
    })

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Table Data')

    // Write the Excel file
    XLSX.writeFile(workbook, 'Devices_data.xlsx')
  }

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
    })

    // Define the table headers from the columns prop (skip the first one as per the UI logic)
    const tableColumn = ['SN', ...columns.slice(1).map((column) => column.Header)]

    // Build the table rows using the filteredData array
    const tableRows = filteredData.map((item, rowIndex) => {
      const rowData = columns.slice(1).map((column) => {
        const accessor = column.accessor

        // Handle specific columns and their logic
        if (accessor === 'groups') {
          return item.groups && item.groups.length > 0
            ? item.groups.map((group) => group.name).join(', ') // Join group names if there are multiple
            : 'N/A' // Return '0' if no groups are present
        } else if (accessor === 'geofences') {
          return item.geofences && item.geofences.length > 0
            ? item.geofences.map((geofence) => geofence.name).join(', ') // Join geofence names if there are multiple
            : 'N/A' // Return '0' if no geofences are present
        } else if (accessor === 'users') {
          return item.users && item.users.length > 0
            ? item.users.map((user) => user.username).join(', ') // Join usernames if there are multiple
            : 'N/A' // Return '0' if no users are present
        } else if (accessor === 'Driver') {
          return item.Driver?.name || 'N/A'
        } else if (accessor === 'device') {
          return item.device?.name || 'N/A'
        } else {
          return item[accessor] || 'N/A' // Fallback for other columns
        }
      })
      return [rowIndex + 1, ...rowData] // Include row index as the first element
    })

    // Generate the PDF using the autoTable plugin
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      autoSize: true, // Automatically adjust column width based on content
    })
    doc.save('Devices_data.pdf')
  }

  // console.log("pageCountttttttttttt",pageCount)
  console.log("data.lengthhhhhhhhhhhhhh", data)
  console.log("filteredDataaaaaaaaaaaaaa", filteredData)

  return (
    <div className="d-flex flex-column mx-md-3 mt-3 h-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="d-flex justify-content-between mb-2">
        <div>
          <h2>Devices</h2>
        </div>

        <div className="d-flex">
          <div className="me-3 d-none d-md-block">
            <input
              type="search"
              className="form-control"
              placeholder="search here...."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="me-3 d-none d-md-block" >
            <button
              onClick={handleSearch}
              variant="contained"
              className="btn btn-secondary"
            >
              Search
            </button>
          </div>
          {decodedToken.superadmin && (
            <div>
              {/* <button
                onClick={() => {
                  setAddModalOpen(true);
                  setFormData({
                    ...formData,
                    installationdate: new Date().toISOString().split('T')[0],
                  })
                }}
                variant="contained"
                className="btn btn-secondary"
              >
                Add Device
              </button> */}
              <button onClick={handleOpen}
                variant="contained"
                className="btn btn-secondary" >
                Add Device
              </button>
            </div>
          )}
        </div>
      </div>

      <TableContainer
        component={Paper}
        sx={{
          height: 'auto', // Set the desired height
          overflowX: 'auto', // Enable horizontal scrollbar
          overflowY: 'auto', // Enable vertical scrollbar if needed
          marginBottom: '10px',
          borderRadius: '10px',
          border: '1px solid black'
        }}
      >
        <CTable bordered align="middle" className="mb-2 borderless min-vh-25 rounded-top-3" hover responsive >
          <CTableHead style={{ fontFamily: "Roboto, sans-serif", fontSize: '14px', }} bordered align="middle" className="mb-2 border min-vh-25 rounded-top-3" hover responsive >
            <CTableRow style={{ height: '6vh', }} className="text-nowrap "  >
              <CTableHeaderCell className="text-center bg-body-secondary text-center sr-no table-cell" >
                <strong>SN</strong>
              </CTableHeaderCell >
              {columns.slice(1).map((column, index) => (
                <CTableHeaderCell key={index} className="text-center bg-body-secondary text-center sr-no table-cell" >
                  <strong>{column.Header}</strong>
                </CTableHeaderCell>
              ))}
              {decodedToken.superadmin ? (
                <CTableHeaderCell className="text-center bg-body-secondary text-center sr-no table-cell" >
                  <strong>Actions</strong>
                </CTableHeaderCell>
              ) : null}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {loading ? (
              <CTableRow key="loading" style={{ border: '1px soild black' }}>
                <CTableDataCell colSpan="16" className="text-center">
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
              filteredData?.map((item, index) => (
                <CTableRow key={item._id}>
                  <CTableDataCell style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#eeeeefc2", border: 'none' }}>{currentPage * limit + index + 1}</CTableDataCell>
                  {columns.slice(1).map((column) => (
                    <CTableDataCell key={column.accessor} className="text-center" style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#eeeeefc2", }} >
                      {column.accessor === 'groups' ? (
                        <CFormSelect
                          id="groups"
                          className=" text-center border-2"
                          style={{ width: '100px', backgroundColor: index % 2 === 0 ? "#ffffff" : "#eeeeefc2", }}
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
                          style={{ width: '120px', backgroundColor: index % 2 === 0 ? "#ffffff" : "#eeeeefc2", }}
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
                          style={{ width: '120px', backgroundColor: index % 2 === 0 ? "#ffffff" : "#eeeeefc2", }}
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
                        <div style={{ width: '120px' }}>{item[column.accessor]?.name || 'N/A'}</div>
                      ) : item[column.accessor] ? (
                        item[column.accessor]
                      ) : (
                        'N/A'
                      )}
                    </CTableDataCell>
                  ))}

                  {decodedToken.superadmin ? (
                    <CTableDataCell className="text-center d-flex" style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#eeeeefc2" }}>
                      <IconButton aria-label="edit" onClick={() => handleEditIconClick(item)}>
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
                    <p className="mb-0 fw-bold">"Oops! Looks like there's no device available."</p>
                  </div>
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>

      </TableContainer>

      <CDropdown className="position-fixed bottom-0 end-0 m-3">
        <CDropdownToggle
          color="secondary"
          style={{ borderRadius: '50%', padding: '10px', height: '48px', width: '48px' }}
        >
          <CIcon icon={cilSettings} />
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem onClick={exportToPDF}>PDF</CDropdownItem>
          <CDropdownItem onClick={exportToExcel}>Excel</CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
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
              pageCount={(searchQuery) ? Math.ceil(pageCount / limit) : Math.ceil(data.length / limit)} // Set based on the total pages from the API
              previousLabel="< previous"
              renderOnZeroPageCount={null}
              marginPagesDisplayed={2}
              containerClassName="pagination justify-content-center "
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
                { label: '20', value: '20' },
                { label: '50', value: '50' },
                { label: '100', value: '100' },
                { label: '500', value: '500' },
              ]}
            />
          </div>
        </div>
      </div>
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
      <AllInOneForm open={open} setOpen={setOpen} handleClose={handleClose} handleOpen={handleOpen}

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
