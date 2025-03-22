import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
  CTab,
  CTabContent,
  CTabList,
  CTabPanel,
  CTabs,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
  cilList,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons'

import Typography from '@mui/material/Typography'

import {
  filterAllVehicles,
  filterStoppedVehicles,
  filterIdleVehicles,
  filterRunningVehicles,
  filterOverspeedVehicles,
  filterInactiveVehicles,
  filterByCategory,
  filterByGroup,
  filterByGeofence,
  filterBySingleVehicle,
  selectDeviceNames,
  searchVehiclesByName,
} from '../features/LivetrackingDataSlice.js'
// import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import 'bootstrap/dist/css/bootstrap.min.css'
import './AppHeader.css'
import TableColumnVisibility from './TableColumnVisibility.js'
import NotificationDropdown from './header/NotificationDropdown.js'
import { io } from 'socket.io-client'
import notificationSound from '../../src/Google_Event.mp3'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import logo from 'src/assets/brand/logo.png'
import { setToggleSidebar } from '../features/navSlice.js'
import { FaAddressCard, FaChartBar, FaCog, FaHome } from 'react-icons/fa'
import { TbReportSearch } from 'react-icons/tb'
import { MdOutlineSupportAgent } from 'react-icons/md'
import { CircleUserRound } from 'lucide-react'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebar.sidebarShow)
  const { filteredVehicles } = useSelector((state) => state.liveFeatures)
  const toggle = useSelector((state) => state.navbar)
  // console.log(toggle, 'nave baajdasjdjasdkjashd')
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  useEffect(() => {
    switch (filter) {
      case 'stopped':
        dispatch(filterStoppedVehicles())
        break
      case 'idle':
        dispatch(filterIdleVehicles())
        break
      case 'running':
        dispatch(filterRunningVehicles())
        break
      case 'overspeed':
        dispatch(filterOverspeedVehicles())
        break
      case 'inactive':
        dispatch(filterInactiveVehicles())
        break
      case 'car':
        dispatch(filterByCategory('car'))
        break
      case 'bus':
        dispatch(filterByCategory('bus'))
        break
      case 'truck':
        dispatch(filterByCategory('truck'))
        break
      case 'tracktor':
        dispatch(filterByCategory('tracktor'))
      case 'jcb':
        dispatch(filterByCategory('jcb'))
        break
      case 'crean':
        dispatch(filterByCategory('crean'))
        break
      case 'motorcycle':
        dispatch(filterByCategory('motorcycle'))
        break
      case 'geofence_1':
        dispatch(filterByGeofence(1))
        break
      case 'group_1':
        dispatch(filterByGroup(1))
        break
      case 'vehicle_MH31FC7099':
        dispatch(filterBySingleVehicle('MH31FC7099'))
        break
      default:
        dispatch(filterAllVehicles())
        break
    }
  }, [filter, dispatch])

  useEffect(() => {
    dispatch(searchVehiclesByName(searchTerm)) // Dispatch the search action
  }, [searchTerm, dispatch])

  const deviceNames = useSelector(selectDeviceNames)
  const location = useLocation()

  // Check if the current page is the dashboard
  const isDashboard = location.pathname === '/dashboard'

  // ################### notification code is here ##########

  const token = Cookies.get('authToken')
  const decodedToken = token ? jwtDecode(token) : null
  const userId = decodedToken && decodedToken.id
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    console.log('Initializing socket connection...')
    const audio = new Audio(notificationSound)
    let socket

    if (userId) {
      // Only connect if we have a valid user ID
      try {
        socket = io(`${import.meta.env.VITE_API_URL}`, {
          transports: ['websocket'],
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
        })

        // Connection event handlers
        socket.on('connect', () => {
          console.log('Socket connected! ID:', socket.id)
          socket.emit('registerUser', userId)
        })

        socket.on('connect_error', (err) => {
          console.error('Connection error:', err.message)
        })

        socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason)
        })

        // Alert handler
        socket.on('alert', (data) => {
          console.log('Received alert:', data)
          audio.play()
          setNotifications((prev) => [...prev, data])
        })
      } catch (err) {
        console.error('Socket initialization error:', err)
      }
    } else {
      console.log('Skipping socket connection - no user ID')
    }

    return () => {
      if (socket) {
        console.log('Cleaning up socket connection')
        socket.disconnect()
      }
    }
  }, [userId]) // Only re-run if userId changes

  // Reducer of side bar nav open

  const handleHome = () => {
    dispatch({ type: 'set', sidebarShow: true })
    dispatch(
      setToggleSidebar({
        home: true,
        master: false,
        reports: false,
        expense: false,
        support: false,
      }),
    )
    if (toggle.home) {
      dispatch({ type: 'set', sidebarShow: !sidebarShow })
    }
  }
  const handleMaster = () => {
    dispatch({ type: 'set', sidebarShow: true })
    dispatch(
      setToggleSidebar({
        home: false,
        master: true,
        reports: false,
        expense: false,
        support: false,
      }),
    )
    if (toggle.master) {
      dispatch({ type: 'set', sidebarShow: !sidebarShow })
    }
  }
  const handleReports = () => {
    dispatch({ type: 'set', sidebarShow: true })
    dispatch(
      setToggleSidebar({
        home: false,
        master: false,
        reports: true,
        expense: false,
        support: false,
      }),
    )
    if (toggle.reports) {
      dispatch({ type: 'set', sidebarShow: !sidebarShow })
    }
  }

  const handleExpense = () => {
    if (role === 'superadmin') {
      // Ensure this variable is determined earlier in your code
      dispatch({ type: 'set', sidebarShow: true })
      dispatch(
        setToggleSidebar({
          home: false,
          master: false,
          reports: false,
          expense: true,
          support: false,
        }),
      )
      if (toggle.expense) {
        dispatch({ type: 'set', sidebarShow: !sidebarShow })
      }
    } else {
      console.log('Access denied: Only superadmin can access this functionality.')
    }
  }

  // Determine role based on token
  // const decodedToken1 = jwtDecode(token)
  let role
  if (decodedToken && decodedToken.superadmin === true) {
    role = 'superadmin'
  } else {
    role = 'user'
  }

  // const handleSupports = () => {
  //   dispatch({ type: 'set', sidebarShow: true })
  //   dispatch(setToggleSidebar({ home: false, master: false, reports: false, expense: false, support: true }))
  // }

  // #########################################################

  return (
    <CHeader position="sticky" className="p-0 darkBackground" ref={headerRef}>
      <CContainer className="border-bottom px-4 flex" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-30px' }}
        >
          {/* <CIcon icon={cilMenu} size="lg" /> */}
        </CHeaderToggler>
        <CHeaderNav className="d-none d-md-flex"></CHeaderNav>

        <CTabs className="ms-auto">
          <CTabList variant="underline"></CTabList>
        </CTabs>

        <style jsx>{`
          .nav-btn {
            padding: 10px 20px; /* Padding for the button */
            margin: 0 10px; /* Margin between buttons */
            background-color: white; /* Light white background color */
            color: #343a40; /* Dark gray text color */
            border: none; /* Light border color */
            border-radius: 5px; /* Rounded corners */
            font-size: 16px; /* Font size */
            cursor: pointer; /* Pointer cursor on hover */
            transition:
              background-color 0.3s ease,
              transform 0.2s ease,
              border-color 0.3s ease; /* Smooth transition */
            display: flex;
            align-items: center; /* Align icon and text */
            justify-content: center; /* Center the content */
          }

          .nav-btn .nav-icon {
            margin-right: 20px; /* Space between icon and text */
            font-size: 18px; /* Icon size */
          }

          .nav-btn:hover {
            background-color: #e2e6ea; /* Light gray background on hover */
            border-color: #ccc; /* Darker border color on hover */
            transform: scale(1.05); /* Slight scaling effect on hover */
          }

          .nav-btn:focus {
            outline: none; /* Remove focus outline */
          }

          .nav-btn:active {
            transform: scale(0.98); /* Slight shrink effect when active */
          }
        `}</style>

        <CHeaderNav className="ms-auto">
          <NotificationDropdown notifications={notifications} />
          <div className="vr mx-3 bg-white"></div>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
