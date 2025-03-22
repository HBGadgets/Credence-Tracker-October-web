import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ReactPaginate from 'react-paginate'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { FaUserGroup } from 'react-icons/fa6'
import '../index.css'

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
  FormGroup,
  FormControlLabel,
  Checkbox,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Select,
  DialogTitle,
  DialogActions,
  Autocomplete,
  Chip,
} from '@mui/material'
import { RiEdit2Fill, RiAddBoxFill } from 'react-icons/ri'
import { AiFillDelete, AiOutlineUserAdd } from 'react-icons/ai'
import {
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
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
import CloseIcon from '@mui/icons-material/Close'
import {
  AccountCircle,
  ExpandMoreOutlined,
  LockOutlined,
  MailOutline,
  Phone,
} from '@mui/icons-material'

import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { IoMdAdd, IoMdAddCircle } from 'react-icons/io'
import toast, { Toaster } from 'react-hot-toast'
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'
import jsPDF from 'jspdf' // For PDF export
import 'jspdf-autotable' // For table formatting in PDF
import '../../../../src/app.css'
import SearchIcon from '@mui/icons-material/Search'
import { Eye, EyeOff } from 'lucide-react'
import { FaRegFilePdf, FaPrint } from 'react-icons/fa6'
import { PiMicrosoftExcelLogo } from 'react-icons/pi'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaArrowUp } from 'react-icons/fa'
import IconDropdown from '../../../components/ButtonDropdown'

const accessToken = Cookies.get('authToken')

const decodedToken = jwtDecode(accessToken)

const Users = () => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  // somthing for testing
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [limit, setLimit] = useState(10)
  const [pageCount, setPageCount] = useState()
  // const [currentStep, setCurrentStep] = useState(0)
  // const steps = ['Personal Info', 'Permissions']
  const [isSuperAdmin, setSuperAdmin] = useState(false)
  const [filteredData, setFilteredData] = useState([])
  const [groups, setGroups] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [token, setToken] = useState('')
  const [searchQueryGroupField, setSearchQueryGroupField] = useState('')

  // Go to the next step
  // const handleNext = () => {
  //   setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  // }

  // // Go to the previous step
  // const handleBack = () => {
  //   setCurrentStep((prev) => Math.max(prev - 1, 0))
  // }

  // Passwords Visibility
  const [visiblePassword, setVisiblePassword] = useState(null) // Track the ID of the user whose password is visible

  // Toggle password visibility for a specific user
  const togglePasswordVisibility = (index) => {
    setVisiblePassword(visiblePassword === index ? null : index) // Show password if it's hidden, hide if it's visible
  }

  const handleModalClose = () => {
    // setFormData({})
    setFormData({
      username: '',
      email: '',
      mobile: '',
      password: '',
      permissions: {
        notification: false,
        devices: false,
        driver: false,
        groups: false,
        category: false,
        model: false,
        users: false,
        report: false,
        stop: false,
        travel: false,
        geofence: false,
        maintenance: false,
        status: false,
        distance: false,
        trips: false,
        history: false,
        idle: false,
        alerts: false,
      },
      isAdmin: false,
    })
    setEditModalOpen(false)
    setAddModalOpen(false)
    //setCurrentStep(0)
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '75%',
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

  // ###############get users ###################
  const fetchUserData = async (page = 1) => {
    const accessToken = Cookies.get('authToken')
    const url = `${import.meta.env.VITE_API_URL}/user?page=${page}&limit=${limit}&search=${searchQuery}`

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })

      if (response.data.users) {
        setData(response.data.users)
        setPageCount(response.data.totalPages)
        console.log(response.data.users)
        console.log(response.data.totalPages)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
    }
  }

  const fetchGroups = async () => {
    const accessToken = Cookies.get('authToken')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/group`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
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

  useEffect(() => {
    fetchGroups()
  }, [])

  // ##################### Filter data by search query #######################
  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredData(data) // No query, show all drivers
    } else {
      const filtered = data.filter(
        (user) =>
          user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user?.mobile?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredData(filtered)
      setCurrentPage(1)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [limit, searchQuery])

  useEffect(() => {
    filterUsers(searchQuery)
  }, [data, searchQuery])

  const handlePageClick = (e) => {
    console.log(e.selected + 1)
    let page = e.selected + 1
    setCurrentPage(page)
    setLoading(true)
    fetchUserData(page)
  }

  // ########################## Add User Form #########################
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    groupsAssigned: [],
    permissions: {
      notification: false,
      devices: false,
      driver: false,
      groups: false,
      users: false,
      report: false,
      stop: false,
      travel: false,
      trips: false,
      geofence: false,
      maintenance: false,
      status: false,
      distance: false,
      history: false,
      idle: false,
      alerts: false,
      geofenceReport: false,
    },
    isAdmin: false,
  })

  const [availablePermissions, setAvailablePermissions] = useState({})

  // Decode token and extract available permissions
  useEffect(() => {
    const token = Cookies.get('authToken')
    if (token) {
      const decodedToken = jwtDecode(token)
      setToken(decodedToken)
      if (decodedToken.superadmin == true) {
        setSuperAdmin(true)
      } else {
        const userPermissions = decodedToken.user || {}

        // Filter permissions from the token
        const filteredPermissions = {}
        Object.keys(formData.permissions).forEach((key) => {
          if (userPermissions[key] === true) {
            filteredPermissions[key] = true
          }
        })

        setAvailablePermissions(filteredPermissions)
      }
    }
  }, [])

  // Handle input changes
  // const handleInputChange = (e) => {
  //   const { name, value } = e.target

  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }))

  //   console.log('this is value: ', formData)
  // }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Check if the field is "mobile" and ensure only numeric values with a max length of 10
    if (name === "mobile") {
      if (/^\d{0,10}$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    console.log('this is value: ', name, value);
  };


  // Handle permission changes
  const handlePermissionChange = (e) => {
    const { name, checked } = e.target
    setFormData((prev) => {
      const updatedPermissions = {
        ...prev.permissions,
        [name]: checked,
      }

      // If all permissions are checked, set isAdmin to true
      const allPermissionsChecked = Object.values(updatedPermissions).every(
        (permission) => permission,
      )

      return {
        ...prev,
        permissions: updatedPermissions,
        isAdmin: allPermissionsChecked,
      }
    })
  }

  // Handle Admin toggle
  const handleAdminToggle = (e) => {
    const isAdmin = e.target.checked
    setFormData((prev) => ({
      ...prev,
      isAdmin,
      permissions: Object.keys(prev.permissions).reduce((acc, key) => {
        acc[key] = isAdmin // Select/unselect all based on admin toggle
        return acc
      }, {}),
    }))
  }

  // Handle form submission
  const handleSubmit = async () => {

    const dataToSubmit = {
      username: formData.username,
      mobile: formData.mobile,
      email: formData.email,
      password: formData.password,
      groupsAssigned: formData.groupsAssigned,
      ...formData.permissions,
    }

    try {
      console.log('dekhte hai')
      const accessToken = Cookies.get('authToken')
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user`, dataToSubmit, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 201) {
        toast.success('User is created successfully')
        fetchUserData()
        setAddModalOpen(false)
        setFormData({
          username: '',
          email: '',
          mobile: '',
          password: '',
          permissions: {
            notification: false,
            devices: false,
            driver: false,
            groups: false,
            category: false,
            model: false,
            users: false,
            report: false,
            stop: false,
            travel: false,
            trips: false,
            geofence: false,
            maintenance: false,
            status: false,
            distance: false,
            history: false,
            idle: false,
            alerts: false,
            geofenceReport: false,
          },
          isAdmin: false,
        })
      } else {
        toast.error(`Error: ${response.status} - ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error during submission:', error)
      let errorMessage = 'An error occurred'

      if (error.response) {
        errorMessage = 'Password filed is missing'
      } else if (error.request) {
        errorMessage = 'Network error: Please try again later'
      }

      toast.error(errorMessage)
    }
  }
  // #############################################

  // ####################  edit user  ############################

  const handleEditUser = (userData) => {
    console.log(userData)
    setEditModalOpen(true)
    setFormData({
      id: userData._id,
      username: userData.username,
      email: userData.email,
      mobile: userData.mobile,
      groupsAssigned: userData.groupsAssigned,
      permissions: {
        notification: userData.notification,
        devices: userData.devices,
        driver: userData.driver, // userData uses 'driver' instead of 'drivers'
        groups: userData.groups,
        // category: userData.category,
        // model: userData.model,
        users: userData.users,
        report: userData.report,
        stop: userData.stop,
        travel: userData.travel,
        trips: userData.trips,
        geofence: userData.geofence,
        maintenance: userData.maintenance,
        status: userData.status,
        distance: userData.distance,
        history: userData.history,
        idle: userData.idle,
        alerts: userData.alerts,
        geofenceReport: userData.geofenceReport,
      },
      isAdmin: userData.isAdmin || false, // Assuming there is an isAdmin field
    })
    console.log('this is before edit', formData)
  }

  const EditUserSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const dataToSubmit = {
      id: formData.id,
      username: formData.username,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password,
      groupsAssigned: formData.groupsAssigned,
      ...formData.permissions,
    }

    console.log('Data to submit:', dataToSubmit) // Log the data to be submitted

    try {
      // API call
      const accessToken = Cookies.get('authToken')

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/user/${dataToSubmit.id}`,
        dataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      // Check if the response status is in the 2xx range
      if (response.status === 200) {
        toast.success('User is edited successfully')
        setEditModalOpen(false)
        //setCurrentStep(0)
        fetchUserData()
        setLoading(false)

        setFormData({
          username: '',
          email: '',
          mobile: '',
          password: '',
          permissions: {
            notification: false,
            devices: false,
            driver: false,
            groups: false,
            category: false,
            model: false,
            users: false,
            report: false,
            stop: false,
            travel: false,
            trips: false,
            geofence: false,
            maintenance: false,
            status: false,
            distance: false,
            history: false,
            idle: false,
            alerts: false,
            geofenceReport: false,
          },
          isAdmin: false,
        })
      } else {
        // Handle other response statuses
        toast.error(`Error: ${response.status} - ${response.statusText}`)
        setLoading(false)
      }
    } catch (error) {
      // Handle error from the server or network error
      console.error('Error during submission:', error) // Log the error for debugging
      let errorMessage = 'An error occurred'

      // Check if the error response exists
      if (error.response) {
        // If the server responded with a status other than 2xx
        errorMessage = error.response.data.message || error.response.data || 'An error occurred'
      } else if (error.request) {
        // If the request was made but no response was received
        errorMessage = 'Network error: Please try again later'
      }

      // Show an alert with the error message
      toast.error(errorMessage)
    }
  }

  //  ######################### delete user #########################

  const deleteUserSubmit = async (item) => {
    // Show a confirmation dialog
    const confirmed = confirm('Do you want to delete this user?')

    // If the user cancels, do nothing
    if (!confirmed) return

    console.log(item)
    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/user/${item._id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 200) {
        toast.error('Successfully deleted User!')
        fetchUserData()
      }
    } catch (error) {
      // Handle the error
      console.error(error.response ? error.response.data : 'An error occurred')
    }
  }


  // add group

  // State to manage dialog and new group name
  const [openNewGroupDialog, setOpenNewGroupDialog] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  // Function to handle opening the "Add New Group" dialog
  const handleNewGroup = () => {
    setOpenNewGroupDialog(true)
  }

  // Function to fetch the list of groups (GET request)
  const fetchGroupsData = async () => {
    const accessToken = Cookies.get('authToken') // Retrieve the stored access token
    try {
      // Making a GET request to fetch groups from the API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/group`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      console.log('Fetched groups: ', data.groups)
      setGroups(data.groups) // Update the groups state with fetched data
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('Failed to fetch groups')
    }
  }

  // Function to handle the API call for adding a new group (POST request)
  const createNewGroup = async () => {
    console.log('Save button clicked')

    // Check if the new group name is valid (not empty or just spaces)
    if (newGroupName.trim()) {
      try {
        const accessToken = Cookies.get('authToken') // Get the access token from cookies

        // Sending a POST request to create the new group
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/group`,
          { name: newGroupName },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        )

        if (response.status === 201) {
          toast.success('Group created successfully')

          // Fetch updated list of groups after creating a new one
          await fetchGroupsData() // Fetch groups to refresh the list

          // Reset dialog and input field after success
          setOpenNewGroupDialog(false)
          setNewGroupName('')
        }
      } catch (error) {
        console.error('Error creating group:', error)
        toast.error('An error occurred while creating the group')
      }
    } else {
      // Show a warning if the group name is empty
      toast.warn('Group name cannot be empty')
    }
  }

  // Using useEffect to fetch the groups list when the component mounts
  useEffect(() => {
    fetchGroups()
  }, [])

  // SORTING LOGIC
  const getSortValue = (item, key) => {
    switch (key) {
      case 'name':
        return item.username?.toLowerCase() || ''
      case 'email':
        return item.email?.toLowerCase() || ''
      case 'mobile':
        return item.mobile || ''
      case 'password':
        return item.password || ''
      default:
        return ''
    }
  }

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData
    const sortedItems = [...filteredData].sort((a, b) => {
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
    return sortedItems
  }, [filteredData, sortConfig])

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  //  ####################################################

  // Dropdown download options icons
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

  // all handel of drowpdown icons

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


  // Excel and pdf download

  const exportToExcel = async () => {
    try {
      // Validate data before proceeding
      if (!Array.isArray(filteredData) || filteredData.length === 0) {
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
          { header: 'Name', width: 25 },
          { header: 'Email', width: 35 },
          { header: 'Mobile No.', width: 15 },
          { header: 'Master Permissions', width: 35 },
          { header: 'Reports Permissions', width: 35 },
        ],
        company: {
          name: 'Credence Tracker',
          copyright: `© ${new Date().getFullYear()} Credence Tracker`,
        },
      };

      // Helper function to format permissions
      const formatPermissions = (permissionsList, item) => {
        return permissionsList.filter((p) => item[p]).join(', ') || 'N/A';
      };

      // Initialize workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users Report');

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
        worksheet.mergeCells('A1:F1');

        // Report title
        const subtitleRow = worksheet.addRow(['Users Report']);
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
        worksheet.mergeCells('A2:F2');

        // Metadata (Generated by, Generated Date Time)
        worksheet.addRow([`Generated by: ${decodedToken.username || 'N/A'}`]);
        worksheet.addRow([`Generated Date Time: ${new Date().toLocaleString()}`]);
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
        filteredData.forEach((item, index) => {
          const masterPermissions = formatPermissions(
            ['users', 'groups', 'devices', 'geofence', 'driver', 'notification', 'maintenance'],
            item
          );
          const reportsPermissions = formatPermissions(
            ['history', 'stop', 'travel', 'trips', 'status', 'distance', 'idle', 'alerts', 'geofenceReport'],
            item
          );

          const rowData = [
            index + 1, // SN
            item.username || '--', // Name
            item.email || '--', // Email
            item.mobile || 'N/A', // Mobile No.
            masterPermissions, // Master Permissions
            reportsPermissions, // Reports Permissions
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
        worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);
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
      const filename = `Users_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, filename);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Excel Export Error:', error);
      toast.error(error.message || 'Failed to export Excel file');
    }
  };

  // PDF CODE

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
      doc.text('Users Report', CONFIG.layout.margin, 35)

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

      // Table data preparation (replacing with your data)
      const tableColumns = [
        'SN',
        'Name',
        'Email',
        'Mobile No.',
        'Master Permissions',
        'Reports Permissions',
      ]

      const tableRows = filteredData?.map((row, rowIndex) => [
        rowIndex + 1,
        row.username || '--',
        row.email || '--',
        row.mobile || 'N/A',
        ['users', 'groups', 'devices', 'geofence', 'driver', 'notification', 'maintenance']
          .filter((permission) => row[permission])
          .join(', ') || 'N/A',
        [
          'history',
          'stop',
          'travel',
          'trips',
          'status',
          'distance',
          'idle',
          'sensor',
          'alerts',
          'vehicle',
          'geofenceReport',
        ]
          .filter((permission) => row[permission])
          .join(', ') || 'N/A',
      ])

      // Calculate column widths dynamically based on content
      const availableWidth = doc.internal.pageSize.width - 2 * CONFIG.layout.margin

      // Set a fixed width for the first column (minimized width)
      const firstColWidth = 10 // in mm, adjust this value if needed

      // Calculate width for the remaining columns
      const remainingColumns = tableColumns.length - 1
      const otherColsWidth = (availableWidth - firstColWidth) / remainingColumns

      // Define column widths: first column gets the minimized width and the rest share the remaining space
      const columnWidths = [firstColWidth, ...new Array(remainingColumns).fill(otherColsWidth)]

      // Generate table with dynamic width for columns
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
        columnStyles: tableColumns.reduce((acc, col, index) => {
          acc[index] = { cellWidth: columnWidths[index] }
          return acc
        }, {}),
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
      const filename = `Users_Report_${new Date().toISOString().split('T')[0]}.pdf`
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
      <div>
        <div className="d-flex justify-content-between mb-2">
          <div>{/* <h3>Users</h3> */}</div>

          <div className="d-flex">
            {/* <div className="me-3 d-none d-md-block">
              <input
                type="search"
                className="form-control"
                placeholder="search here...."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div> */}
          </div>
        </div>
        <div className="mb-2 d-md-none">
          <input
            type="search"
            className="form-control"
            placeholder="search here...."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* <div className="flex-grow-1 rounded-3 overflow-hidden" style={{ border: '1px solid black' }}> */}

      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader className="grand d-flex justify-content-between align-items-center">
              <strong>USERS</strong>
              <div className="d-flex">
                {/* <div className="me-3 d-none d-md-block">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search for Users"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div> */}
                <div className="me-3 d-none d-md-block">
                  <div className="input-group">
                    <InputBase
                      type="search"
                      className="form-control border"
                      style={{ height: '40px' }}
                      placeholder="Search for Users"
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
                </div>
                <div>
                  <button
                    onClick={() => setAddModalOpen(true)}
                    variant="contained"
                    className="btn text-white"
                    style={{ backgroundColor: '#0a2d63' }}
                  >
                    Add User
                  </button>
                </div>
              </div>
            </CCardHeader>
            <TableContainer
              component={Paper}
              sx={{
                height: 'auto',
                overflowX: 'auto',
                overflowY: 'auto',
                // marginBottom: '10px',
                // borderRadius: '5px',
                // border: '1px solid black',
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
                  <CTableHead className="text-nowrap ">
                    <CTableRow>
                      <CTableHeaderCell
                        className=" text-center table-cell"
                        style={{ backgroundColor: '#0a2d63', color: 'white' }}
                      >
                        <strong>SN</strong>
                      </CTableHeaderCell>
                      <CTableHeaderCell
                        className=" text-center table-cell"
                        style={{ backgroundColor: '#0a2d63', color: 'white', cursor: 'pointer' }}
                        onClick={() => handleSort('name')}
                      >
                        <strong>Name</strong>
                        {sortConfig.key === 'name' &&
                          (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                      </CTableHeaderCell>
                      <CTableHeaderCell
                        className="text-center table-cell"
                        style={{ backgroundColor: '#0a2d63', color: 'white', cursor: 'pointer' }}
                        onClick={() => handleSort('email')}
                      >
                        <strong>Email</strong>
                        {sortConfig.key === 'email' &&
                          (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                      </CTableHeaderCell>
                      <CTableHeaderCell
                        className="text-center table-cell"
                        style={{ backgroundColor: '#0a2d63', color: 'white', cursor: 'pointer' }}
                        onClick={() => handleSort('mobile')}
                      >
                        <strong>Mobile No.</strong>
                        {sortConfig.key === 'mobile' &&
                          (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                      </CTableHeaderCell>
                      <CTableHeaderCell
                        className=" text-center table-cell"
                        style={{ backgroundColor: '#0a2d63', color: 'white' }}
                      >
                        <strong>Master Permissions</strong>
                      </CTableHeaderCell>
                      <CTableHeaderCell
                        className=" text-center table-cell"
                        style={{ backgroundColor: '#0a2d63', color: 'white' }}
                      >
                        <strong>Reports Permissions</strong>
                      </CTableHeaderCell>

                      <CTableHeaderCell
                        className="text-center table-cell"
                        style={{ backgroundColor: '#0a2d63', color: 'white', cursor: 'pointer' }}
                        onClick={() => handleSort('password')}
                      >
                        <strong>Password</strong>
                        {sortConfig.key === 'password' &&
                          (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                      </CTableHeaderCell>

                      <CTableHeaderCell
                        className=" text-center table-cell"
                        style={{ backgroundColor: '#0a2d63', color: 'white' }}
                      >
                        <strong>Actions</strong>
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody>
                    {loading ? (
                      <CTableRow>
                        <CTableDataCell colSpan="8" className="text-center">
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
                        <CTableRow key={index} className="p-0" style={{ fontSize: '13px' }}>
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
                            {item.username}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center p-0"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {item.email}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-center p-0"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {item.mobile || 'N/A'}
                          </CTableDataCell>

                          {/* Master Column */}
                          <CTableDataCell
                            className="text-center "
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            <CFormSelect
                              id="periods"
                              value=""
                              className=" text-center"
                              style={{
                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                fontSize: '14px',
                              }}
                            >
                              <option value="">Master</option>
                              {[
                                'users',
                                'groups',
                                'devices',
                                'geofence',
                                'driver',
                                'notification',
                                'maintenance',
                              ].map(
                                (permission) =>
                                  item[permission] && (
                                    <option key={permission} value={permission}>
                                      {permission.charAt(0).toUpperCase() + permission.slice(1)}
                                    </option>
                                  ),
                              )}
                            </CFormSelect>
                          </CTableDataCell>

                          {/* Reports Column */}
                          <CTableDataCell
                            className="align-items-center "
                            style={{
                              backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                              fontSize: '14px',
                            }}
                          >
                            <CFormSelect
                              id="periods"
                              value=""
                              className="text-center border-2"
                              style={{
                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                                fontSize: '14px',
                              }}
                            >
                              <option value="">Reports</option>
                              {[
                                'history',
                                'stop',
                                'travel',
                                'trips',
                                'status',
                                'distance',
                                'idle',
                                'alerts',
                                'geofenceReport',
                              ].map(
                                (permission) =>
                                  item[permission] && (
                                    <option key={permission} value={permission}>
                                      {permission.charAt(0).toUpperCase() + permission.slice(1)}
                                    </option>
                                  ),
                              )}
                            </CFormSelect>
                          </CTableDataCell>

                          <CTableDataCell
                            className="text-center p-0"
                            style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2' }}
                          >
                            {/* Conditionally render the password */}
                            {visiblePassword === index ? item.password : '••••••••••'}{' '}
                            {/* Show password or placeholder */}
                            {/* Button to toggle visibility of a particular user's password */}
                            <button
                              onClick={() => togglePasswordVisibility(index)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '5px',
                              }}
                            >
                              {/* Eye icon - You can use any icon library like Font Awesome or Material Icons */}
                              {visiblePassword === index ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                          </CTableDataCell>

                          <CTableDataCell
                            className="text-center d-flex "
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: index % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                            }}
                          >
                            {/* <IconButton aria-label="edit" onClick={() => handleEditUser(item)}>
                      <RiEdit2Fill
                        style={{ fontSize: '20px', color: 'lightBlue', margin: '2px' }}
                      />
                    </IconButton>
                 
                    <IconButton aria-label="delete" onClick={() => deleteUserSubmit(item)}>
                      <AiFillDelete style={{ fontSize: '20px', color: 'red', margin: '2px' }} />
                    </IconButton> */}
                            {/* //----Added logic to hide the edit and delete option for login user itself. */}
                            {isSuperAdmin && (
                              <CTableDataCell
                                className="text-center d-flex p-0"
                                style={{ justifyContent: 'center', alignItems: 'center' }}
                              >
                                <IconButton aria-label="edit" onClick={() => handleEditUser(item)}>
                                  <RiEdit2Fill
                                    style={{ fontSize: '20px', color: 'lightBlue', margin: '2px' }}
                                  />
                                </IconButton>
                                <IconButton
                                  aria-label="delete"
                                  onClick={() => deleteUserSubmit(item)}
                                >
                                  <AiFillDelete
                                    style={{ fontSize: '20px', color: 'red', margin: '2px' }}
                                  />
                                </IconButton>
                              </CTableDataCell>
                            )}
                            {!isSuperAdmin && item.username == token.user.username && (
                              <CTableDataCell
                                className="text-center d-flex p-0"
                                style={{ justifyContent: 'center', alignItems: 'center' }}
                              >
                                <IconButton aria-label="edit">
                                  <RiEdit2Fill
                                    style={{
                                      fontSize: '20px',
                                      color: 'transparent',
                                      margin: '2px',
                                    }}
                                  />
                                </IconButton>
                                <IconButton aria-label="delete">
                                  <AiFillDelete
                                    style={{
                                      fontSize: '20px',
                                      color: 'transparent',
                                      margin: '2px',
                                      pointerEvents: 'none',
                                    }}
                                  />
                                </IconButton>
                              </CTableDataCell>
                            )}
                            {!isSuperAdmin && item.username != token.user.username && (
                              <CTableDataCell
                                className="text-center d-flex p-0"
                                style={{ justifyContent: 'center', alignItems: 'center' }}
                              >
                                <IconButton aria-label="edit" onClick={() => handleEditUser(item)}>
                                  <RiEdit2Fill
                                    style={{ fontSize: '20px', color: 'lightBlue', margin: '2px' }}
                                  />
                                </IconButton>
                                <IconButton
                                  aria-label="delete"
                                  onClick={() => deleteUserSubmit(item)}
                                >
                                  <AiFillDelete
                                    style={{ fontSize: '20px', color: 'red', margin: '2px' }}
                                  />
                                </IconButton>
                              </CTableDataCell>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="7" className="text-center">
                          <div
                            className="d-flex flex-column justify-content-center align-items-center"
                            style={{ height: '200px' }}
                          >
                            <p className="mb-0 fw-bold">
                              "Oops! Looks like there's nobody here yet.
                              <br /> Maybe it's time to invite some awesome users!"
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
                                Add User
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

      {/* download dropdown option icon */}

      <div className="position-fixed bottom-0 end-0 mb-5 m-3 z-5">
        <IconDropdown items={dropdownItems} />
      </div>


      <br />

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
              activeLinkClassName="text-white" // Active page text color (optional)
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
                { label: 'ALL', value: '' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ADD MODAL CART */}

      <Modal open={addModalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            ...style,
            backgroundColor: '#f7f9fc',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            padding: '30px',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold', fontSize: '24px' }}>
              <span role="img" aria-label="user">
                <AiOutlineUserAdd className="fs-2" />
              </span>{' '}
              Add User
            </Typography>
            <IconButton onClick={handleModalClose}>
              <CloseIcon />
            </IconButton>
          </div>
          <div>
            <div
              className="mt-3"
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto auto',
                gridGap: '0.7rem 1.5rem',
              }}
            >
              {/* Personal Info Step */}
              <TextField
                label="User Name"
                variant="outlined"
                name="username"
                value={formData.username !== undefined ? formData.username : ''}
                onChange={handleInputChange}
                sx={{ marginBottom: '10px' }}
                fullWidth
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
                label="Email Address"
                type="email" // Ensures email input format
                variant="outlined"
                name="email"
                value={formData.email !== undefined ? formData.email : ''}
                onChange={handleInputChange}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))} // Mark as touched when leaving field
                sx={{ marginBottom: '10px' }}
                fullWidth
                error={formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)} // Only validates if input exists
                helperText={
                  formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                    ? "Enter a valid email address"
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline />
                    </InputAdornment>
                  ),
                }}
              />


              <TextField
                label="Mobile Number"
                variant="outlined"
                name="mobile"
                type="tel" // "tel" for better mobile support
                value={formData.mobile !== undefined ? formData.mobile : ''}
                onChange={handleInputChange}
                sx={{ marginBottom: '10px' }}
                fullWidth
                error={formData.mobile.length > 0 && formData.mobile.length !== 10} // Red border if not 10 digits
                helperText={formData.mobile.length > 0 && formData.mobile.length !== 10 ? "Mobile number must be 10 digits" : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  maxLength: 10, // Restrict input to 10 characters
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }}
              />


              <TextField
                label="Password"
                variant="outlined"
                name="password"
                type="password"
                value={formData.password !== undefined ? formData.password : ''}
                onChange={handleInputChange}
                sx={{ marginBottom: '10px' }}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  ),
                }}
              />


              <Autocomplete
                multiple
                id="groups-assigned"
                options={[{ _id: 'new', name: 'Add New Group' }, ...groups]}
                getOptionLabel={(option) => option.name}
                value={groups.filter((group) => formData.groupsAssigned?.includes(group._id)) || []}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                onChange={(event, value) => {
                  const isNewGroupSelected = value.some((item) => item._id === 'new');
                  if (isNewGroupSelected) {
                    const updatedValues = value.filter((item) => item._id !== 'new');
                    handleInputChange({
                      target: {
                        name: 'groupsAssigned',
                        value: updatedValues.map((item) => item._id),
                      },
                    });
                    handleNewGroup();
                  } else {
                    handleInputChange({
                      target: {
                        name: 'groupsAssigned',
                        value: value.map((item) => item._id),
                      },
                    });
                  }
                }}
                componentsProps={{
                  paper: {
                    sx: {
                      maxHeight: 200, // Adjust height to prevent forced reflows
                      overflowY: "overlay", // Ensures a non-intrusive scrollbar
                      scrollBehavior: "smooth", // Enables smooth scrolling
                      "&::-webkit-scrollbar": {
                        width: "6px", // Slightly smaller for smoothness
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "rgba(0,0,0,0.3)", // Light background for smooth feel
                        borderRadius: "4px",
                        "&:hover": {
                          background: "rgba(0,0,0,0.5)", // Slightly darken on hover
                        },
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "transparent", // Keeps UI clean
                      },
                    },
                  },
                }}

                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Groups"
                    placeholder="Search or select groups"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <FaUserGroup
                              style={{
                                fontSize: "1.3rem",
                                color: "rgb(51 51 51 / 73%)",
                                marginRight: "0.5rem",
                                marginLeft: "0.5rem",
                              }}
                            />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      fontStyle: option._id === "new" ? "italic" : "normal",
                    }}
                  >
                    {option._id === "new" && <IoMdAddCircle style={{ marginRight: 8 }} />}
                    {option.name}
                  </Box>
                )}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip key={option._id} label={option.name} {...getTagProps({ index })} />
                  ))
                }
              />


              {/* // Dialog for creating a new group */}
              <Dialog open={openNewGroupDialog} onClose={() => setOpenNewGroupDialog(false)}>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogContent>
                  <TextField
                    label="Group Name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    fullWidth
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenNewGroupDialog(false)}>Cancel</Button>
                  <Button
                    onClick={() => {
                      createNewGroup()
                      setOpenNewGroupDialog(false) // Close the dialog after saving
                    }}
                    disabled={!newGroupName.trim()}
                  >
                    Save
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
            {/* )} */}

            {/* {currentStep === 1 && ( */}
            <div className="mt-3">
              {/* Permissions Step */}
              <Typography sx={{ color: '#333', fontWeight: 'bold', marginTop: '15px' }}>
                <span role="img" aria-label="permissions">
                  🔒
                </span>{' '}
                Permissions
              </Typography>

              {/* render the admin togle for only admin */}
              {isSuperAdmin && (
                <FormControlLabel
                  sx={{ color: 'black' }}
                  control={<Checkbox checked={formData.isAdmin} onChange={handleAdminToggle} />}
                  label="Admin (Select all permissions)"
                />
              )}

              {isSuperAdmin ? (
                <div className="row w-100">
                  <div className="col">
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                        Master
                      </AccordionSummary>
                      <AccordionDetails>
                        <FormGroup sx={{ color: 'black' }}>
                          {[
                            'users',
                            'groups',
                            'devices',
                            'geofence',
                            'driver',
                            'maintenance',
                            'notification',
                          ].map((permission) => (
                            <FormControlLabel
                              key={permission}
                              control={
                                <Checkbox
                                  name={permission}
                                  checked={formData.permissions[permission]}
                                  onChange={handlePermissionChange}
                                />
                              }
                              label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                            />
                          ))}
                        </FormGroup>
                      </AccordionDetails>
                    </Accordion>
                  </div>

                  <div className="col">
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                        Reports-add-admin
                      </AccordionSummary>
                      <AccordionDetails>
                        <FormGroup sx={{ color: 'black' }}>
                          {[
                            'history',
                            'stop',
                            'travel',
                            'trips',
                            'idle',
                            'status',
                            'distance',
                            'alerts',
                            'geofenceReport',
                          ].map((permission) => (
                            <FormControlLabel
                              key={permission}
                              control={
                                <Checkbox
                                  name={permission}
                                  checked={formData.permissions[permission]}
                                  onChange={handlePermissionChange}
                                />
                              }
                              label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                            />
                          ))}
                        </FormGroup>
                      </AccordionDetails>
                    </Accordion>
                  </div>
                </div>
              ) : (
                Object.keys(availablePermissions).length > 0 && (
                  <div className="row w-100">
                    <div className="col">
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                          Master
                        </AccordionSummary>
                        <AccordionDetails>
                          <FormGroup sx={{ color: 'black' }}>
                            {[
                              'users',
                              'groups',
                              'devices',
                              'geofence',
                              'driver',
                              'maintenance',
                              'notification',
                            ]
                              .filter((permission) => availablePermissions[permission])
                              .map((permission) => (
                                <FormControlLabel
                                  key={permission}
                                  control={
                                    <Checkbox
                                      name={permission}
                                      checked={formData.permissions[permission]}
                                      onChange={handlePermissionChange}
                                    />
                                  }
                                  label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                                />
                              ))}
                          </FormGroup>
                        </AccordionDetails>
                      </Accordion>
                    </div>

                    <div className="col">
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                          Reports-add-user
                        </AccordionSummary>
                        <AccordionDetails>
                          <FormGroup sx={{ color: 'black' }}>
                            {[
                              'history',
                              'stop',
                              'travel',
                              'trips',
                              'idle',
                              'status',
                              'distance',
                              'alerts',
                              'geofenceReport',
                            ]
                              .filter((permission) => availablePermissions[permission])
                              .map((permission) => (
                                <FormControlLabel
                                  key={permission}
                                  control={
                                    <Checkbox
                                      name={permission}
                                      checked={formData.permissions[permission]}
                                      onChange={handlePermissionChange}
                                    />
                                  }
                                  label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                                />
                              ))}
                          </FormGroup>
                        </AccordionDetails>
                      </Accordion>
                    </div>
                  </div>
                )
              )}
            </div>
            {/* )} */}

            {/* Navigation buttons */}
            <div className="d-flex justify-content-between" style={{ marginTop: '20px' }}>
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                style={{ marginLeft: 'auto' }}
              >
                Submit
              </Button>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Edit model */}

      <Modal open={editModalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            ...style,
            backgroundColor: '#f7f9fc',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            padding: '30px',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold', fontSize: '24px' }}>
              <span role="img" aria-label="user">
                <AiOutlineUserAdd className="fs-2" />
              </span>{' '}
              Update User
            </Typography>
            <IconButton onClick={handleModalClose}>
              <CloseIcon />
            </IconButton>
          </div>

          {/* Step-by-step form with progress indicator */}
          <div>
            {/* <Stepper activeStep={currentStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper> */}

            {/* {currentStep === 0 && ( */}
            <div
              className="mt-3"
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto auto',
                gridGap: '0.7rem 1.5rem',
              }}
            >
              {/* Personal Info Step */}
              <TextField
                label="User Name"
                variant="outlined"
                name="username"
                type="text"
                value={formData.username !== undefined ? formData.username : ''}
                onChange={handleInputChange}
                sx={{ marginBottom: '10px' }}
                fullWidth
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
                label="Email Address"
                type="email" // Ensures email input format
                variant="outlined"
                name="email"
                value={formData.email !== undefined ? formData.email : ''}
                onChange={handleInputChange}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))} // Mark as touched when leaving field
                sx={{ marginBottom: '10px' }}
                fullWidth
                error={formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)} // Only validates if input exists
                helperText={
                  formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                    ? "Enter a valid email address"
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Mobile Number"
                variant="outlined"
                name="mobile"
                type="tel" // "tel" for better mobile support
                value={formData.mobile !== undefined ? formData.mobile : ''}
                onChange={handleInputChange}
                sx={{ marginBottom: '10px' }}
                fullWidth
                error={formData.mobile.length > 0 && formData.mobile.length !== 10} // Red border if not 10 digits
                helperText={formData.mobile.length > 0 && formData.mobile.length !== 10 ? "Mobile number must be 10 digits" : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  maxLength: 10, // Restrict input to 10 characters
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }}
              />

              <TextField
                label="Password"
                variant="outlined"
                name="password"
                type="password"
                value={formData.password !== undefined ? formData.password : ''}
                onChange={handleInputChange}
                sx={{ marginBottom: '10px' }}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth sx={{ marginBottom: 2 }} key={'group'}>
                <InputLabel>{'Group'}</InputLabel>
                <Select
                  name="groupsAssigned"
                  value={formData.groupsAssigned || []}
                  onChange={handleInputChange}
                  label={'Groups'}
                  multiple
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 200, // Restrict max height
                        overflowY: 'scroll', // Always show scrollbar
                        '&::-webkit-scrollbar': {
                          width: '6px', // Scrollbar width
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
                    },
                  }}
                >
                  {groups?.map((group) => (
                    <MenuItem key={group._id} value={group._id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

            </div>
            {/* )} */}

            {/* {currentStep === 1 && ( */}
            <div className="mt-3">
              {/* Permissions Step */}
              <Typography sx={{ color: '#333', fontWeight: 'bold', marginTop: '15px' }}>
                <span role="img" aria-label="permissions">
                  🔒
                </span>{' '}
                Permissions
              </Typography>

              {isSuperAdmin && (
                <FormControlLabel
                  sx={{ color: 'black' }}
                  control={<Checkbox checked={formData.isAdmin} onChange={handleAdminToggle} />}
                  label="Admin (Select all permissions)"
                />
              )}

              <div className="row w-100">
                <div className="col">
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreOutlined />}>Master</AccordionSummary>
                    <AccordionDetails>
                      {isSuperAdmin ? (
                        <FormGroup sx={{ color: 'black' }}>
                          {[
                            'users',
                            'groups',
                            'devices',
                            'geofence',
                            'driver',
                            'maintenance',
                            'notification',
                          ].map((permission) => (
                            <FormControlLabel
                              key={permission}
                              control={
                                <Checkbox
                                  name={permission}
                                  checked={formData.permissions[permission]}
                                  onChange={handlePermissionChange}
                                />
                              }
                              label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                            />
                          ))}
                        </FormGroup>
                      ) : (
                        <FormGroup sx={{ color: 'black' }}>
                          {[
                            'users',
                            'groups',
                            'devices',
                            'geofence',
                            'driver',
                            'maintenance',
                            'notification',
                          ]
                            .filter((permission) => availablePermissions[permission])
                            .map((permission) => (
                              <FormControlLabel
                                key={permission}
                                control={
                                  <Checkbox
                                    name={permission}
                                    checked={formData.permissions[permission]}
                                    onChange={handlePermissionChange}
                                  />
                                }
                                label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                              />
                            ))}
                        </FormGroup>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </div>

                <div className="col">
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreOutlined />}>Reports</AccordionSummary>
                    {/* //added logic of giving permissions of reports to only which are allowed */}
                    <AccordionDetails>
                      {isSuperAdmin ? (
                        <FormGroup sx={{ color: 'black' }}>
                          {[
                            'history',
                            'stop',
                            'travel',
                            'trips',
                            'idle',
                            'status',
                            'distance',
                            'alerts',
                            'geofenceReport',
                          ].map((permission) => (
                            <FormControlLabel
                              key={permission}
                              control={
                                <Checkbox
                                  name={permission}
                                  checked={formData.permissions[permission]}
                                  onChange={handlePermissionChange}
                                />
                              }
                              label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                            />
                          ))}
                        </FormGroup>
                      ) : (
                        <FormGroup sx={{ color: 'black' }}>
                          {[
                            'history',
                            'stop',
                            'travel',
                            'trips',
                            'idle',
                            'status',
                            'distance',
                            'alerts',
                            'geofenceReport',
                          ]
                            .filter((permission) => availablePermissions[permission])
                            .map((permission) => (
                              <FormControlLabel
                                key={permission}
                                control={
                                  <Checkbox
                                    name={permission}
                                    checked={formData.permissions[permission]}
                                    onChange={handlePermissionChange}
                                  />
                                }
                                label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                              />
                            ))}
                        </FormGroup>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </div>
              </div>
            </div>
            {/* )} */}

            {/* Navigation buttons */}
            <div className="d-flex justify-content-between" style={{ marginTop: '20px' }}>
              {/* {currentStep > 0 && (
                <Button onClick={handleBack} variant="outlined">
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} variant="contained" color="primary">
                  Next
                </Button>
              ) : (
                <Button onClick={EditUserSubmit} variant="contained" color="primary">
                  Submit
                </Button>
              )} */}
              <Button
                onClick={EditUserSubmit}
                variant="contained"
                color="primary"
                style={{ marginLeft: 'auto' }}
              >
                Submit
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default Users
