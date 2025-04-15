import React, { useContext, useState, useEffect, useRef } from 'react'
import classNames from 'classnames'
import { FixedSizeList as List } from 'react-window'

import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CHeaderNav,
  CHeaderToggler,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  useColorModes,
} from '@coreui/react'
import './DashCon.css'
import { Paper, TableContainer } from '@mui/material'

import { useDispatch, useSelector } from 'react-redux'
import {
  filterAllVehicles,
  filterIdleVehicles,
  filterInactiveVehicles,
  filterOverspeedVehicles,
  filterRunningVehicles,
  filterStoppedVehicles,
  initializeSocket,
  socket,
  selectDeviceNames,
  searchVehiclesByName,
  filterBySingleVehicle,
  filterByCategory,
  filterByDevices,
  setVehicles,
  changeVehicles,
  filterNewVehicles,
} from '../../features/LivetrackingDataSlice.js'
import { fetchDevices } from '../../features/deviceSlice.js'
import { setNewAddress } from '../../features/addressSlice.js'

import MainMap from '../Map/MapComponent'
import { PiEngineFill } from 'react-icons/pi'
import { MdGpsFixed, MdGpsNotFixed } from 'react-icons/md'
import { IoIosArrowDown, IoMdBatteryCharging } from 'react-icons/io'
import { LuRefreshCw } from 'react-icons/lu'
import { IoMdSearch } from 'react-icons/io'

// ================================CAR==================================
import carGreen from '../../assets/vehicleList/Car/carGreen.svg'
import carRed from '../../assets/vehicleList/Car/carRed.svg'
import carYellow from '../../assets/vehicleList/Car/carYellow.svg'
import carOrange from '../../assets/vehicleList/Car/carOrange.svg'
import carGray from '../../assets/vehicleList/Car/carGray.svg'
import carBlue from '../../assets/vehicleList/Car/Blue.svg'
import white from '../../assets/vehicleList/Car/white.svg'

//==============================BIKE========================================
import bikeGreen from '../../assets/vehicleList/Bike/bikeGreen.svg'
import bikeRed from '../../assets/vehicleList/Bike/bikeRed.svg'
import bikeYellow from '../../assets/vehicleList/Bike/bikeYellow.svg'
import bikeOrange from '../../assets/vehicleList/Bike/bikeOrange.svg'
import bikeGray from '../../assets/vehicleList/Bike/bikeGray.svg'

import busGreen from '../../assets/vehicleList/Bus/busGreen.svg'
import busRed from '../../assets/vehicleList/Bus/busRed.svg'
import busOrange from '../../assets/vehicleList/Bus/busOrange.svg'
import busYellow from '../../assets/vehicleList/Bus/busYellow.svg'
import busGray from '../../assets/vehicleList/Bus/busGray.svg'

//==============================TRUCK========================================
import truckGreen from '../../assets/vehicleList/Truck/truckGreen.svg'
import truckRed from '../../assets/vehicleList/Truck/truckRed.svg'
import truckYellow from '../../assets/vehicleList/Truck/truckYellow.svg'
import truckOrange from '../../assets/vehicleList/Truck/truckOrange.svg'
import truckGray from '../../assets/vehicleList/Truck/truckGray.svg'

//==============================CRANE========================================
import craneGreen from '../../assets/vehicleList/Crane/craneGreen.svg'
import craneRed from '../../assets/vehicleList/Crane/craneRed.svg'
import craneYellow from '../../assets/vehicleList/Crane/craneYellow.svg'
import craneOrange from '../../assets/vehicleList/Crane/craneOrange.svg'
import craneGray from '../../assets/vehicleList/Crane/craneGray.svg'

//==============================JCB========================================
import jcbGreen from '../../assets/vehicleList/JCB/jcbGreen.svg'
import jcbRed from '../../assets/vehicleList/JCB/jcbRed.svg'
import jcbYellow from '../../assets/vehicleList/JCB/jcbYellow.svg'
import jcbOrange from '../../assets/vehicleList/JCB/jcbOrange.svg'
import jcbGray from '../../assets/vehicleList/JCB/jcbGray.svg'

//==============================AUTO========================================
import autoGreen from '../../assets/vehicleList/Auto/autoGreen.svg'
import autoRed from '../../assets/vehicleList/Auto/autoRed.svg'
import autoYellow from '../../assets/vehicleList/Auto/autoYellow.svg'
import autoOrange from '../../assets/vehicleList/Auto/autoOrange.svg'
import autoGray from '../../assets/vehicleList/Auto/autoGray.svg'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
dayjs.extend(duration)
import Cookies from 'js-cookie'
import ReactPaginate from 'react-paginate'
import axios from 'axios'
import '../../app.css'
import { NavLink, useLocation } from 'react-router-dom'
import TableColumnVisibility from '../../components/TableColumnVisibility.js'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
import Sidenew from '../../components/Sidenew.js'
import Select from 'react-select'
import { getUsers, getGroups, getDevices, getTimeDifference } from './dashApi.js'
import zIndex from '@mui/material/styles/zIndex.js'
import StatusButtons from './StatusButtons.js'
import VehicleCategory from './VehicleCategory.jsx'

const Dashboard = () => {
  const dispatch = useDispatch()
  // const credentials = Cookies.get('crdntl')
  const credentials = Cookies.get('authToken') //For devices show has per users
  const { vehicles, filteredVehicles, loading } = useSelector((state) => state.liveFeatures)
  const { devices: deviceList } = useSelector((state) => state.devices)

  const { newAddress } = useSelector((state) => state.address)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [filter, setFilter] = useState('all')
  const [address, setAddress] = useState({})
  const mapRef = useRef(null)
  const [mapCenter, setMapCenter] = useState({ lat: 21.1458, lng: 79.0882, zoom: 10 })

  // pagination code
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 10
  const pageCount = Math.ceil(filteredVehicles.length / itemsPerPage)

  const handlePageClick = (event) => {
    setCurrentPage(event.selected)
  }

  // Fetch live vehicles when the component mounts
  useEffect(() => {
    if (!credentials) {
      console.error('Error: credentials are undefined or empty')
      return
    }

    try {
      // JSON.parse(credentials) // Quick validation to ensure credentials are valid JSON
      dispatch(initializeSocket(credentials))
    } catch (error) {
      console.error('Invalid credentials format:', error.message)
    }

    return () => {
      if (socket) {
        socket.off('all device data')
      }
    }
  }, [])

  const maxDiffInHours = 35

  function timeDiffIsLessThan35Hours(lastUpdate) {
    const lastUpdateTime = dayjs(lastUpdate)
    const now = dayjs()
    return now.diff(lastUpdateTime, 'hour') <= maxDiffInHours
  }

  const stoppedVehiclesCount = useSelector(
    (state) =>
      state.liveFeatures.vehicles.filter(
        (vehicle) =>
          vehicle.attributes.ignition === false &&
          vehicle.speed < 1 &&
          timeDiffIsLessThan35Hours(vehicle.lastUpdate),
      ).length,
  )
  const runningVehiclesCount = useSelector(
    (state) =>
      state.liveFeatures.vehicles.filter(
        (vehicle) =>
          vehicle.attributes.ignition === true &&
          vehicle.speed > 2 &&
          vehicle.speed < 60 &&
          timeDiffIsLessThan35Hours(vehicle.lastUpdate),
      ).length,
  )
  const inactiveVehiclesCount = useSelector(
    (state) =>
      state.liveFeatures.vehicles.filter(
        (vehicle) => !timeDiffIsLessThan35Hours(vehicle.lastUpdate) && vehicle.status === 'online',
      ).length,
  )

  const allVehiclesCount = useSelector((state) => state.liveFeatures.vehicles.length)

  const idleVehiclesCount = useSelector(
    (state) =>
      state.liveFeatures.vehicles.filter(
        (vehicle) =>
          vehicle.attributes.ignition === true &&
          vehicle.speed < 2 &&
          timeDiffIsLessThan35Hours(vehicle.lastUpdate),
      ).length,
  )
  const overspeedVehiclesCount = useSelector(
    (state) =>
      state.liveFeatures.vehicles.filter(
        (vehicle) =>
          vehicle.attributes.ignition === true &&
          vehicle.speed > 60 &&
          timeDiffIsLessThan35Hours(vehicle.lastUpdate),
      ).length,
  )
  const newVehicleCount = useSelector(
    (state) => state.liveFeatures.vehicles.filter((vehicle) => vehicle.status === 'offline').length,
  )

  const [expandedRow, setExpandedRow] = useState(null)

  const getCategory = (category) => {
    const cat = (category || '').toLowerCase()
    switch (cat) {
      case 'car':
        return 'car'
      case 'bus':
        return 'bus'
      case 'truck':
        return 'truck'
      case 'bike':
        return 'bike'
      case 'auto':
        return 'auto'
      case 'tractor':
        return 'tractor'
      case 'jcb':
        return 'jcb'
      case 'crane':
        return 'crane'
      default:
        return 'car'
    }
  }

  const selectImage = (category, item) => {
    const cate = getCategory(category)
    const imageMap = {
      car: {
        red: carRed,
        green: carGreen,
        yellow: carYellow,
        orange: carOrange,
        gray: carGray,
        blue: carBlue,
      },
      bike: {
        red: bikeRed,
        green: bikeGreen,
        yellow: bikeYellow,
        orange: bikeOrange,
        gray: bikeGray,
      },
      truck: {
        red: truckRed,
        green: truckGreen,
        yellow: truckYellow,
        orange: truckOrange,
        gray: truckGray,
      },
      auto: {
        red: autoRed,
        green: autoGreen,
        yellow: autoYellow,
        orange: autoOrange,
        gray: autoGray,
      },
      jcb: { red: jcbRed, green: jcbGreen, yellow: jcbYellow, orange: jcbOrange, gray: jcbGray },
      crane: {
        red: craneRed,
        green: craneGreen,
        yellow: craneYellow,
        orange: craneOrange,
        gray: craneGray,
      },
      tractor: {
        red: craneRed,
        green: craneGreen,
        yellow: craneYellow,
        orange: craneOrange,
        gray: craneGray,
      }, // duplicate of crane
      bus: { red: busRed, green: busGreen, yellow: busYellow, orange: busOrange, gray: busGray },
    }

    const defaultImage = imageMap[cate]?.gray || carGray

    // Safety check
    if (!item || !item.attributes) {
      return defaultImage
    }

    const ignition = item.attributes.ignition
    const speed = item.speed || 0
    const isRecent = timeDiffIsLessThan35Hours(item.lastUpdate)

    if (item.status === 'offline') {
      return imageMap[cate]?.blue || carBlue
    }

    if (!ignition && speed < 1) {
      return imageMap[cate]?.red || carRed
    }

    if (ignition && speed > 60) {
      return imageMap[cate]?.orange || carOrange
    }

    if (ignition && speed > 2 && speed <= 60) {
      return imageMap[cate]?.green || carGreen
    }

    if (ignition && speed <= 2) {
      return imageMap[cate]?.yellow || carYellow
    }

    return defaultImage
  }

  const navigate = useNavigate()
  const handleClickOnTrack = (vehicle) => {
    navigate(`/salesman/${vehicle.deviceId}/${vehicle.category}/${vehicle.name}`)
  }
  const handleClickOnHistory = (vehicle) => {
    navigate(`/history/${vehicle.deviceId}/${vehicle.category}/${vehicle.name}`)
  }

  const visibleColumns = useSelector((state) => state.columnVisibility)

  const fetchAddress = async (vehicleId, longitude, latitude) => {
    try {
      const apiKey = 'huWGT6bXG3aRcdvLhkca' // Replace with your actual MapTiler API key
      const response = await axios.get(
        `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}`,
      )

      const address =
        response.data.features.length <= 5
          ? response.data.features[0].place_name_en
          : response.data.features[1].place_name_en

      setAddress((prevAddresses) => ({
        ...prevAddresses,
        [vehicleId]: address, // Update the specific vehicle's address
      }))
    } catch (error) {
      // console.error('Error fetching the address:', error)
      setAddress((prevAddresses) => ({
        ...prevAddresses,
        [vehicleId]: 'Error fetching address',
      }))
    }
  }

  const setNewAddressForRedux = (address) => {
    if (address) {
      dispatch(setNewAddress(address))
    }
  }

  useEffect(() => {
    setNewAddressForRedux(address)
  }, [address])

  useEffect(() => {
    filteredVehicles.forEach((vehicle) => {
      if (vehicle?.deviceId && vehicle.longitude && vehicle.latitude && !address[vehicle.id]) {
        // Fetch address only if it's not already fetched for this vehicle
        fetchAddress(vehicle.deviceId, vehicle.longitude, vehicle.latitude)
      }
    })
  }, [filteredVehicles])

  const headerRef = useRef()
  // const { filteredVehicles1 } = useSelector((state) => state.liveFeatures)
  const [filter1, setFilter1] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  useEffect(() => {
    switch (filter1) {
      case 'car':
        dispatch(filterByCategory('car'))
        break
      case 'bus':
        dispatch(filterByCategory('bus'))
        break
      case 'truck':
        dispatch(filterByCategory('truck'))
        break
      case 'tractor':
        dispatch(filterByCategory('tractor'))
        break
      case 'jcb':
        dispatch(filterByCategory('jcb'))
        break
      case 'crane':
        dispatch(filterByCategory('crane'))
        break
      case 'bike':
        dispatch(filterByCategory('bike'))
        break
      default:
        dispatch(filterAllVehicles())
        break
    }
  }, [filter1, dispatch])

  useEffect(() => {
    dispatch(searchVehiclesByName(searchTerm)) // Dispatch the search action
  }, [searchTerm, dispatch])

  // const deviceNames = useSelector(selectDeviceNames)
  const location = useLocation()

  // Check if the current page is the dashboard
  const isDashboard = location.pathname === '/dashboard'
  const markerRefs = useRef({})
  const handleRowClick = (lat, lng, index) => {
    setMapCenter({ lat, lng, zoom: 20 }) // Update map center
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth' }) // Scroll to map
    }

    const markerRef = markerRefs.current[index]

    markerRef?.openPopup() // Open popup if marker reference exists
  }

  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [sloading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [devices, setDevices] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const usersData = await getUsers()
        setUsers(usersData)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // Fetch Groups when User is Selected
  useEffect(() => {
    if (selectedUser) {
      const fetchGroups = async () => {
        setLoading(true)
        try {
          const groupsData = await getGroups(selectedUser)
          setGroups(groupsData)
        } catch (error) {
          console.error('Error fetching groups:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchGroups()
    }
  }, [selectedUser])

  // Fetch Devices when Group is Selected
  useEffect(() => {
    if (selectedGroup) {
      const fetchDevices = async () => {
        setLoading(true)
        try {
          const devicesData = await getDevices(selectedGroup)
          setDevices(devicesData)
          // Filter vehicles based on deviceId in filteredVehicles

          dispatch(filterByDevices(devicesData))
        } catch (error) {
          console.error('Error fetching devices:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchDevices()
    }
  }, [selectedGroup])

  const [firstLoad, setFirstLoad] = useState(true) // To track the first load

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      // Assuming no devices fetched for demonstration, set devices to empty array
      setFirstLoad(false)
    }, 2000) // Simulate a 2-second delay for fetching data
  }, [])

  const [devicesWithoutPositions, setDevicesWithoutPositions] = useState([])

  // sorting login
  const getSortValue = (item, key) => {
    switch (key) {
      case 'vehicle':
        return item.category
      case 'deviceName':
        return item.name
      case 'address':
        return address[item.deviceId] || ''
      case 'lastUpdate':
        return new Date(item.lastUpdate)
      case 'cd':
        return getTimeDifference(item.lastUpdate)
      case 'sp':
        return item.speed
      case 'distance':
        return item.attributes.distance
      case 'fuelConsumption':
        return item.fuelConsumption
      case 'td':
        return item.TD
      case 'sat':
        return item.attributes.sat
      case 'ig':
        return item.attributes.ignition ? 1 : 0
      case 'gps':
        return item.valid ? 1 : 0
      case 'power':
        return item.attributes.charge ? 1 : 0
      default:
        return ''
    }
  }

  const sortedVehicles = React.useMemo(() => {
    if (!sortConfig.key) return filteredVehicles
    const sortableItems = [...filteredVehicles]
    sortableItems.sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key)
      const bValue = getSortValue(b, sortConfig.key)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }
    })
    return sortableItems
  }, [filteredVehicles, sortConfig])

  // Update currentVehicles to use sortedVehicles
  const currentVehicles = sortedVehicles.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  )

  // Add handleSort function
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  console.log('filtered devices', filteredVehicles)

  return (
    <>
      {/* <WidgetsDropdown className="mb-4" /> */}
      <CRow className="gutter-0">
        <CCol xs>
          <CCard style={{ borderRadius: '0px' }}>
            <CCardBody className="content mt-4">
              {/* <hr className="mt-0 mb-0" /> */}
              {/* <CRow>
            <CCol sm={7} className="d-none d-md-block"></CCol>
          </CRow> */}
              <CRow className="justify-content-around my-3 mb-2">
                {/* All Vehicles */}
                <CCol
                  xs={12}
                  md={1}
                  xl={2}
                  className="count-col mb-2"
                  style={{ width: '6rem !important' }}
                >
                  <div
                    className="vehicle-card all-vehicles"
                    onClick={() => dispatch(filterAllVehicles())}
                  >
                    <div className="vehicle-info">
                      <div className="vehicle-type text-muted">
                        <strong>All</strong>
                      </div>
                      <div className="vehicle-count fs-4 fw-bold">{allVehiclesCount}</div>
                    </div>
                    <div className="vehicle-icon">
                      <img style={{ width: '3.5rem' }} src={white} alt="All Vehicles" />
                    </div>
                  </div>
                </CCol>

                {/* Running Vehicles */}
                <CCol
                  xs={12}
                  md={1}
                  xl={2}
                  className="count-col mb-2"
                  style={{ width: '6rem !important' }}
                >
                  <div
                    className="vehicle-card running-vehicles"
                    onClick={() => dispatch(filterRunningVehicles())}
                  >
                    <div className="vehicle-info">
                      <div className="vehicle-type text-muted">
                        <strong>Running</strong>
                      </div>
                      <div className="vehicle-count fs-4 fw-bold">{runningVehiclesCount}</div>
                    </div>
                    <div className="vehicle-icon">
                      <img style={{ width: '3.5rem' }} src={carGreen} alt="Running Vehicles" />
                    </div>
                  </div>
                </CCol>

                {/* Stopped Vehicles */}
                <CCol
                  xs={12}
                  md={1}
                  xl={2}
                  className="count-col mb-2"
                  style={{ width: '6rem !important' }}
                >
                  <div
                    className="vehicle-card stopped-vehicles"
                    onClick={() => dispatch(filterStoppedVehicles())}
                  >
                    <div className="vehicle-info">
                      <div className="vehicle-type text-muted">
                        <strong>Stopped</strong>
                      </div>
                      <div className="vehicle-count fs-4 fw-bold">{stoppedVehiclesCount}</div>
                    </div>
                    <div className="vehicle-icon">
                      <img style={{ width: '3.5rem' }} src={carRed} alt="Stopped Vehicles" />
                    </div>
                  </div>
                </CCol>

                {/* Idle Vehicles */}
                <CCol
                  xs={12}
                  md={1}
                  xl={2}
                  className="count-col mb-2"
                  style={{ width: '6rem !important' }}
                >
                  <div
                    className="vehicle-card idle-vehicles"
                    onClick={() => dispatch(filterIdleVehicles())}
                  >
                    <div className="vehicle-info">
                      <div className="vehicle-type text-muted">
                        <strong>Idle</strong>
                      </div>
                      <div className="vehicle-count fs-4 fw-bold">{idleVehiclesCount}</div>
                    </div>
                    <div className="vehicle-icon">
                      <img style={{ width: '3.5rem' }} src={carYellow} alt="Idle Vehicles" />
                    </div>
                  </div>
                </CCol>

                {/* Overspeed Vehicles */}
                <CCol
                  xs={12}
                  md={1}
                  xl={2}
                  className="count-col mb-2"
                  style={{ width: '6rem !important' }}
                >
                  <div
                    className="vehicle-card overspeed-vehicles"
                    onClick={() => dispatch(filterOverspeedVehicles())}
                  >
                    <div className="vehicle-info">
                      <div className="vehicle-type text-muted">
                        <strong>OverSpeed</strong>
                      </div>
                      <div className="vehicle-count fs-4 fw-bold">{overspeedVehiclesCount}</div>
                    </div>
                    <div className="vehicle-icon">
                      <img style={{ width: '3.5rem' }} src={carOrange} alt="Overspeed Vehicles" />
                    </div>
                  </div>
                </CCol>

                {/* Inactive Vehicles */}
                <CCol
                  xs={12}
                  md={1}
                  xl={2}
                  className="count-col mb-2"
                  style={{ width: '6rem !important' }}
                >
                  <div
                    className="vehicle-card inactive-vehicles"
                    onClick={() => dispatch(filterInactiveVehicles())}
                  >
                    <div className="vehicle-info">
                      <div className="vehicle-type text-muted">
                        <strong>Inactive</strong>
                      </div>
                      <div className="vehicle-count fs-4 fw-bold">{inactiveVehiclesCount}</div>
                    </div>
                    <div className="vehicle-icon">
                      <img style={{ width: '3.5rem' }} src={carGray} alt="Inactive Vehicles" />
                    </div>
                  </div>
                </CCol>

                {/* New Vehicles */}
                <CCol
                  xs={12}
                  md={1}
                  xl={2}
                  className="count-col mb-1"
                  style={{ width: '6rem !important' }}
                >
                  <div
                    className="vehicle-card new-vehicles"
                    onClick={() => dispatch(filterNewVehicles())}
                  >
                    <div className="vehicle-info">
                      <div className="vehicle-type text-muted">
                        <strong>New</strong>
                      </div>
                      <div className="vehicle-count fs-4 fw-bold">{newVehicleCount}</div>
                    </div>
                    <div className="vehicle-icon">
                      <img style={{ width: '3.5rem' }} src={carBlue} alt="New Vehicles" />
                    </div>
                  </div>
                </CCol>
              </CRow>
              <MainMap
                filteredVehicles={filteredVehicles}
                mapCenter={mapCenter}
                markerRefs={markerRefs}
              />
              {/* <Sidenew/> */}
              {/* <div className="mb-5"></div> */}
              {/* <br /> */}

              {/* <hr />
              <br /> */}

              {/**************************************************************************************************************** */}

              {/**TABLE */}
              <CRow>
                <CCol xs>
                  <CCard className="mb-4 mt-4">
                    <CCardHeader>
                      {isDashboard && (
                        <div
                          className="d-flex flex-row flex-wrap justify-content-between"
                          ref={mapRef}
                        >
                          {/* First Filter - Status */}
                          <CHeaderNav className="ms-1 p-0 me-3">
                            <Select
                              className="z-3"
                              id="user-select"
                              options={users.map((user) => ({
                                value: user._id,
                                label: user.username,
                              }))}
                              placeholder="Select User"
                              value={
                                selectedUser
                                  ? {
                                      value: selectedUser,
                                      label: users.find((user) => user._id === selectedUser)
                                        ?.username,
                                    }
                                  : null
                              }
                              onChange={(selectedOption) =>
                                setSelectedUser(selectedOption?.value || null)
                              }
                              isLoading={sloading}
                              isClearable
                            />
                          </CHeaderNav>

                          {/* Group Select */}
                          <CHeaderNav className="ms-1 p-0 me-3">
                            <Select
                              className="z-3"
                              id="group-select"
                              options={groups?.map((group) => ({
                                value: group._id,
                                label: group.name,
                              }))}
                              value={
                                selectedGroup
                                  ? {
                                      value: selectedGroup,
                                      label: groups.find((group) => group._id === selectedGroup)
                                        ?.name,
                                    }
                                  : null
                              }
                              onChange={(selectedOption) =>
                                setSelectedGroup(selectedOption?.value || null)
                              }
                              isLoading={sloading}
                              placeholder="Select a Group"
                              isClearable
                            />
                          </CHeaderNav>
                          {/* </div> */}

                          {/* Filtered Vehicles */}
                          {/* Second Filter - Category */}

                          <VehicleCategory filter1={filter1} setFilter1={setFilter1} />

                          <CHeaderNav className="ms-2 p-0 me-3">
                            <TableColumnVisibility />
                          </CHeaderNav>

                          {/* Search Field */}
                          <CHeaderNav className="ms-2 p-0 me-3">
                            <form
                              className="d-flex searchBar"
                              role="search"
                              style={{ right: '0px' }}
                              onSubmit={(e) => e.preventDefault()} // Prevent page refresh
                            >
                              <input
                                className="form-control input"
                                type="text"
                                placeholder="Search vehicles by name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search"
                              />
                              <button className="btn btn-outline searchBtn" type="submit">
                                <IoMdSearch className="searchIcon" style={{ color: '#fff' }} />
                              </button>
                            </form>
                          </CHeaderNav>

                          {/* Table Column Visibility */}

                          <CHeaderNav
                            className="ms-2 p-0 me-3 refresh"
                            onClick={() => {
                              window.location.reload()
                            }}
                          >
                            <LuRefreshCw />
                          </CHeaderNav>
                        </div>
                      )}
                    </CCardHeader>
                    <TableContainer
                      component={Paper}
                      sx={{
                        height: 'auto', // Set the desired height

                        // overflowX: 'auto', // Enable horizontal scrollbar
                        // overflowY: 'auto', // Enable vertical scrollbar if needed
                        // marginBottom: '10px',
                        // borderRadius: '10px',
                        // border: '1px solid black',
                      }}
                    >
                      <CCardBody>
                        <CTable
                          bordered
                          className="my-2 border vehiclesTable mt-0"
                          hover
                          responsive
                        >
                          <CTableHead
                            className="text-nowrap"
                            style={{
                              position: 'sticky',
                              top: 0,
                              zIndex: 1,
                              backgroundColor: '#f8f9fa',
                            }}
                          >
                            <CTableRow>
                              {visibleColumns.srNo && (
                                <CTableHeaderCell
                                  className="text-center sr-no table-cell"
                                  style={{
                                    position: 'sticky',
                                    top: 0,
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  Sr No.
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.vehicle && (
                                <CTableHeaderCell
                                  className="text-center vehicle table-cell"
                                  onClick={() => handleSort('vehicle')}
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  Vehicle{' '}
                                  {sortConfig.key === 'vehicle' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.deviceName && (
                                <CTableHeaderCell
                                  className="text-center device-name table-cell"
                                  onClick={() => handleSort('deviceName')}
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  Device Name
                                  {sortConfig.key === 'deviceName' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.address && (
                                <CTableHeaderCell
                                  className="text-center address table-cell"
                                  onClick={() => handleSort('address')}
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    width: '25%',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  Address
                                  {sortConfig.key === 'address' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.lastUpdate && (
                                <CTableHeaderCell
                                  onClick={() => handleSort('lastUpdate')}
                                  className="text-center last-update table-cell"
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    width: '25%',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  &nbsp;&nbsp;Last Update&nbsp;&nbsp;
                                  {sortConfig.key === 'lastUpdate' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.cd && (
                                <CTableHeaderCell
                                  onClick={() => handleSort('cd')}
                                  className="text-center current-delay table-cell"
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; C/D
                                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                  {sortConfig.key === 'cd' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.sp && (
                                <CTableHeaderCell
                                  onClick={() => handleSort('sp')}
                                  className="text-center speed table-cell"
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  Sp
                                  {sortConfig.key === 'sp' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.distance && (
                                <CTableHeaderCell
                                  onClick={() => handleSort('distance')}
                                  className="text-center distance table-cell"
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  Distance
                                  {sortConfig.key === 'distance' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.fuelConsumption && (
                                <CTableHeaderCell
                                  onClick={() => handleSort('fuelConsumption')}
                                  className="text-center distance table-cell"
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  Fuel Consumption
                                  {sortConfig.key === 'fuelConsumption' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.td && (
                                <CTableHeaderCell
                                  onClick={() => handleSort('td')}
                                  className="text-center total-distance table-cell"
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  T/D
                                  {sortConfig.key === 'td' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.sat && (
                                <CTableHeaderCell
                                  onClick={() => handleSort('sat')}
                                  className="text-center satellite table-cell"
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  GPS
                                  {sortConfig.key === 'sat' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.ig && (
                                <CTableHeaderCell
                                  onClick={() => handleSort('ig')}
                                  className="text-center ignition table-cell"
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  Ig
                                  {sortConfig.key === 'ig' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.gps && (
                                <CTableHeaderCell
                                  onClick={() => handleSort('gps')}
                                  className="text-center gps table-cell"
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  GSM
                                  {sortConfig.key === 'gps' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              {visibleColumns.power && (
                                <CTableHeaderCell
                                  onClick={() => handleSort('power')}
                                  className="text-center power table-cell"
                                  style={{
                                    cursor: 'pointer',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#0a2d63',
                                    color: 'white',
                                  }}
                                >
                                  Power
                                  {sortConfig.key === 'power' &&
                                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </CTableHeaderCell>
                              )}
                              <CTableHeaderCell
                                className="text-center status table-cell"
                                style={{
                                  position: 'sticky',
                                  top: 0,
                                  width: '15%',
                                  background: '#0a2d63',
                                  color: 'white',
                                }}
                              >
                                Track
                              </CTableHeaderCell>
                              <CTableHeaderCell
                                className="text-center status table-cell"
                                style={{
                                  position: 'sticky',
                                  top: 0,
                                  width: '15%',
                                  background: '#0a2d63',
                                  color: 'white',
                                }}
                              >
                                History
                              </CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>

                          <CTableBody>
                            {firstLoad ? (
                              // Show skeleton loader while vehicles are loading
                              <CTableRow>
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
                            ) : filteredVehicles.length > 0 ? (
                              currentVehicles.map((item, index) => (
                                <CTableRow
                                  key={index}
                                  className={`table-row collapsed trans`}
                                  onClick={() =>
                                    handleRowClick(item.latitude, item.longitude, index)
                                  }
                                >
                                  {/* Sr No. */}
                                  {visibleColumns.srNo && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                      className="text-center sr-no table-cell"
                                    >
                                      {currentPage * itemsPerPage + index + 1}
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.vehicle && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                      className="text-center vehicle table-cell"
                                    >
                                      <div>
                                        {(() => {
                                          // const device = salesman.find((device) => device.id === item.deviceId)
                                          return (
                                            <img
                                              src={item && selectImage(item.category, item)}
                                              className="dashimg upperdata"
                                              alt="vehicle"
                                            />
                                          )
                                        })()}
                                      </div>
                                      {expandedRow === index && (
                                        <>
                                          <hr />
                                          {(() => {
                                            // const device = salesman.find(
                                            //   (device) => device.id === item.deviceId,
                                            // )
                                            return (
                                              <div className="upperdata">
                                                {item ? item.category : 'Currently Not Available'}
                                              </div>
                                            )
                                          })()}
                                        </>
                                      )}
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.deviceName && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                      className="device-name table-cell n text-center"
                                    >
                                      {(() => {
                                        // const device = salesman.find((device) => device.id === item.deviceId)
                                        if (item && item.name) {
                                          const nameParts = item.name.split(' ')
                                          const firstWord = nameParts[0]
                                          const remainingWords = nameParts.slice(1).join(' ') // Join remaining words

                                          return (
                                            <>
                                              <div className="upperdata">
                                                <div>{firstWord}</div>{' '}
                                                {/* First word on the first line */}
                                                {remainingWords && <div>{remainingWords}</div>}{' '}
                                                {/* Remaining words on the second line if present */}
                                              </div>
                                              {expandedRow === index && (
                                                <>
                                                  <hr />
                                                  <div>
                                                    <PiEngineFill />
                                                  </div>
                                                </>
                                              )}
                                            </>
                                          )
                                        }
                                        return <div className="upperdata">Unknown</div>
                                      })()}
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.address && (
                                    <CTableDataCell
                                      className="text-center address table-cell"
                                      style={{
                                        minWidth: '500px',
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                    >
                                      <span
                                        className="upperdata"
                                        style={{ fontSize: '1rem', textWrap: 'auto' }}
                                      >
                                        {newAddress[item.deviceId] || 'Loading...'}
                                      </span>
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.lastUpdate && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                      className="text-center last-update table-cell"
                                    >
                                      {(() => {
                                        // const device = salesman.find((device) => device.id === item.deviceId)
                                        if (item && item.lastUpdate) {
                                          const date = dayjs(item.lastUpdate).format('YYYY/MM/DD') // Format date
                                          const time = dayjs(item.lastUpdate).format('HH:mm:ss') // Format time
                                          return (
                                            <div className="upperdata ld">
                                              <div>{date}</div> {/* Date on one line */}
                                              <div>{time}</div> {/* Time on the next line */}
                                            </div>
                                          )
                                        }
                                        return <div>N/A</div>
                                      })()}
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.cd && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                        fontSize: '0.9rem',
                                      }}
                                      className="text-center cd current-delay table-cell"
                                    >
                                      {(() => {
                                        // const device = salesman.find((device) => device.id === item.deviceId)
                                        if (item && item.lastUpdate) {
                                          return <div>{getTimeDifference(item.lastUpdate)}</div> // Default if no device or lastUpdate
                                        }
                                        return null // You can add a fallback element or return null if you want nothing to show when the condition is false.
                                      })()}
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.sp && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                      className="text-center sp speed table-cell"
                                    >
                                      <div className="upperdata">{`${Math.round(item.speed)} kmph`}</div>
                                      {expandedRow === index && (
                                        <>
                                          <hr />
                                          <div>
                                            <PiEngineFill />
                                          </div>
                                        </>
                                      )}
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.distance && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                      className="text-center d distance table-cell"
                                    >
                                      {`${Math.round(item.attributes.distance)} km`}
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.fuelConsumption && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                      className="text-center d distance table-cell"
                                    >
                                      {`${item.fuelConsumption} Litre`}
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.td && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                      className="text-center td total-distance table-cell"
                                    >
                                      {`${Math.round(item.TD)} km`}
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.sat && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                      className="text-center satelite table-cell"
                                    >
                                      <div
                                        style={{ position: 'relative', display: 'inline-block' }}
                                      >
                                        <MdGpsNotFixed style={{ fontSize: '1.6rem' }} />{' '}
                                        {/* Adjust icon size as needed */}
                                        <span
                                          style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '49%',
                                            transform: 'translate(-50%, -50%)',
                                            fontSize: '0.8rem', // Adjust text size
                                            color: 'black',
                                            fontWeight: 'bold',
                                          }}
                                        >
                                          {item.attributes.sat}
                                        </span>
                                      </div>
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.ig && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                      className="text-center ignition table-cell"
                                    >
                                      {(() => {
                                        const { ignition } = item.attributes

                                        let iconColor = 'gray' // Default color
                                        let iconText = 'N/A' // Default text

                                        if (ignition) {
                                          iconColor = 'green'
                                          iconText = 'On'
                                        } else if (ignition === false) {
                                          iconColor = 'red'
                                          iconText = 'Off'
                                        }

                                        return (
                                          <div style={{ color: iconColor, fontSize: '1.1rem' }}>
                                            <PiEngineFill />
                                          </div>
                                        )
                                      })()}
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.gps && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                      className="text-center gps table-cell"
                                    >
                                      <div style={{ fontSize: '1.1rem' }}>
                                        {item.valid ? (
                                          <MdGpsFixed style={{ color: 'green' }} />
                                        ) : (
                                          <MdGpsFixed style={{ color: 'red' }} />
                                        )}
                                      </div>
                                    </CTableDataCell>
                                  )}
                                  {visibleColumns.power && (
                                    <CTableDataCell
                                      style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                      }}
                                      className="text-center power table-cell"
                                    >
                                      {(() => {
                                        const power = item.attributes.charge

                                        let iconColor = 'gray' // Default color
                                        let iconText = 'N/A' // Default text

                                        if (power) {
                                          iconColor = 'green'
                                          iconText = 'On'
                                        } else if (power === false) {
                                          iconColor = 'red'
                                          iconText = 'Off'
                                        }

                                        return (
                                          <div style={{ color: iconColor, fontSize: '1.2rem' }}>
                                            <IoMdBatteryCharging />
                                          </div>
                                        )
                                      })()}
                                    </CTableDataCell>
                                  )}
                                  <CTableDataCell
                                    style={{
                                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                    }}
                                    className="text-center status table-cell"
                                  >
                                    <button
                                      className="btn shadow-sm"
                                      style={{
                                        backgroundColor: '#000000',
                                        fontSize: '1rem',
                                        color: 'white',
                                      }}
                                      onClick={() => handleClickOnTrack(item)}
                                    >
                                      Live Track
                                    </button>
                                  </CTableDataCell>
                                  <CTableDataCell
                                    style={{
                                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                    }}
                                    className="text-center status table-cell"
                                  >
                                    <button
                                      className="btn shadow-sm"
                                      style={{
                                        backgroundColor: '#000000',
                                        fontSize: '1rem',
                                        color: 'white',
                                      }}
                                      onClick={() => handleClickOnHistory(item)}
                                    >
                                      View History
                                    </button>
                                  </CTableDataCell>
                                </CTableRow>
                              ))
                            ) : (
                              <CTableRow>
                                <CTableDataCell colSpan="15" className="text-center">
                                  <div className="text-nowrap mb-2 text-center">
                                    <strong>No Vehicles Found....</strong>
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
              <div className="table-container" style={{ overflowY: 'auto' }}>
                <div
                  style={{
                    height: 'auto',
                    overflowX: 'auto',
                    overflowY: 'auto',
                    marginBottom: '10px',
                    borderRadius: '5px',
                    border: '1px solid black',
                  }}
                >
                  {/**TABLE HEADER NAV BAR */}
                </div>

                {/**PAGINATION */}
                <div className="mt-3">
                  {' '}
                  {/* Adds margin to the right of pagination */}
                  <ReactPaginate
                    breakLabel="..."
                    nextLabel="next >"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={5}
                    pageCount={pageCount} // Total number of pages
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
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
