import React, { useState, useEffect } from 'react'

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'

import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import DialpadIcon from '@mui/icons-material/Dialpad'
import HomeIcon from '@mui/icons-material/Home'
import { FaCarAlt } from 'react-icons/fa'
import { MdOutlineOnDeviceTraining } from 'react-icons/md'
import { MdOutlinePermDeviceInformation } from 'react-icons/md'
import { IoSpeedometerSharp } from 'react-icons/io5'
import { MdOutlineShutterSpeed } from 'react-icons/md'
import { FaUserAlt } from 'react-icons/fa'
import { FaUserGroup } from 'react-icons/fa6'
import { GrUserPolice } from 'react-icons/gr'
import { FaLocationDot } from 'react-icons/fa6'
import { FaShapes } from 'react-icons/fa'
import { TbCategoryFilled } from 'react-icons/tb'
import { RiPassExpiredFill } from 'react-icons/ri'
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material'
import {
  Box,
  Typography,
  IconButton,
  Modal,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Autocomplete,
  InputAdornment,
  Checkbox,
} from '@mui/material'
import { AiOutlinePlus } from 'react-icons/ai'
import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdDevicesOther } from 'react-icons/md'
import Cookies from 'js-cookie'
import { grey } from '@mui/material/colors'

const AddDevice1 = ({
  handleSkip,
  handleNextStep,
  open,
  handleClose,
  style,
  token,
  fetchData,
  currentStep,
  steps,
  columns,
  formData,
  setFormData,
  // users,
  // groups,
  // drivers,
  // areas,
  // models,
  // categories,
  handleInputChange,
  handleNext,
  handleBack,
  handleYearSelection,
  setShowExpirationDropdown,
}) => {
  const [groups, setGroups] = useState([])
  const [users, setUsers] = useState([])
  const [drivers, setDrivers] = useState([])
  const [areas, setAreas] = useState([])
  const [models, setModels] = useState([])
  const [categories, setCategories] = useState([])
  const [customDateMode, setCustomDateMode] = useState(false)

  //const token = Cookies.get('authToken')
  //const decodedToken = jwtDecode(token)
  const CustomListbox = (props) => {
    return <ul {...props} style={{ maxHeight: '150px', overflowY: 'auto' }} />
  }

  useEffect(() => {
    setFormData({
      ...formData,
      installationdate: new Date().toISOString().split('T')[0],
    })
  }, [])

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

  const handleSaveAndNext = async () => {
    const oldapiUrl = `${import.meta.env.VITE_API_POSITION}/api/devices`
    const apiUrl = `${import.meta.env.VITE_API_URL}/device`

    const oldRow = {
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

    if (!newRow.name || !newRow.uniqueId || !newRow.sim) {
      toast.error('Please fill in all required fields.')
      return
    }

    try {
      const username = 'hbtrack'
      const password = '123456'
      const token1 = btoa(`${username}:${password}`)
      const oldresponse = await axios.post(oldapiUrl, oldRow, {
        headers: {
          Authorization: `Basic ${token1}`,
          'Content-Type': 'application/json',
        },
      })

      const response = await axios.post(apiUrl, newRow, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Raw response:', response)

      if (oldresponse.status === 200 && response.status === 201) {
        console.log('Record created successfully:')
        toast.success('Record created successfully')
        fetchData()
        setFormData({})
        handleNextStep()
      } else {
        const contentType = response.headers.get('content-type')
        let responseBody

        if (contentType && contentType.includes('application/json')) {
          responseBody = await response.json()
        } else {
          responseBody = await response.text()
        }

        console.error('Error Response:', responseBody)
        toast.error(`Unable to create record: ${responseBody.message || response.statusText}`)
      }
    } catch (error) {
      console.error('Error during POST request:', error)
      toast.error('Unable to create record')
    }
  }

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <Toaster />

      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gridGap: '1rem' }}>
        {columns.map((col) => {
          if (
            col.accessor === 'name' ||
            col.accessor === 'uniqueId' ||
            col.accessor === 'sim' ||
            col.accessor === 'speed' ||
            col.accessor === 'average'
          ) {
            const iconStyle = {
              fontSize: '1.3rem',
              color: 'rgb(51 51 51 / 73%);',
            }
            const getIcon = (accessor) => {
              switch (accessor) {
                case 'name':
                  return <FaCarAlt style={iconStyle} />
                case 'uniqueId':
                  return <MdOutlineOnDeviceTraining style={iconStyle} />
                case 'sim':
                  return <MdOutlinePermDeviceInformation style={iconStyle} />
                case 'speed':
                  return <IoSpeedometerSharp style={iconStyle} />
                case 'average':
                  return <MdOutlineShutterSpeed style={iconStyle} />
                default:
                  return null
              }
            }
            return (
              <TextField
                key={col.accessor}
                label={col.Header}
                variant="outlined"
                name={col.accessor}
                value={formData[col.accessor] || ''}
                onChange={handleInputChange}
                fullWidth
                required={['name', 'uniqueId', 'sim'].includes(col.accessor)} // Conditionally make the field required
                sx={{ marginBottom: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{getIcon(col.accessor)}</InputAdornment>
                  ),
                }}
              />
            )
          }
          return null
        })}

        {columns.map((col) => {
          if (col.accessor === 'users') {
            return (
              <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  id={`autocomplete-${col.accessor}`}
                  options={users}
                  getOptionLabel={(option) => option.username || ''}
                  value={users.filter((user) => formData[col.accessor]?.includes(user._id)) || []}
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: col.accessor,
                        value: newValue.map((user) => user._id),
                      },
                    });
                  }}
                  ListboxProps={{
                    sx: {
                      maxHeight: 200, // Restrict max height
                      overflowY: 'scroll', // Always show scrollbar
                      '&::-webkit-scrollbar': {
                        width: '8px', // Scrollbar width
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
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={col.Header}
                      placeholder="Search users..."
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <FaUserAlt
                                style={{
                                  fontSize: '1rem',
                                  color: 'rgb(51 51 51 / 73%)',
                                  marginRight: '0.5rem',
                                  marginLeft: '0.5rem',
                                }}
                              />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                />
              </FormControl>

            )
            //               return(
            //                 <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
            //   <Autocomplete
            //     disableCloseOnSelect
            //     multiple
            //     id={`autocomplete-${col.accessor}`}
            //     options={users}
            //     getOptionLabel={(option) => option.username || ''}
            //     value={users.filter((user) => formData[col.accessor]?.includes(user._id)) || []}
            //     onChange={(event, newValue) => {
            //       handleInputChange({
            //         target: {
            //           name: col.accessor,
            //           value: newValue.map((user) => user._id),
            //         },
            //       });
            //     }}
            //     ListboxComponent={CustomListbox}
            //     renderOption={(props, option, { selected }) => (
            //       <li {...props}>
            //         <Checkbox
            //           icon={<CheckBoxOutlineBlank />}
            //           checkedIcon={<CheckBox />}
            //           style={{ marginRight: 8 }}
            //           checked={selected}
            //         />
            //         {option.username}
            //       </li>
            //     )}
            //     isOptionEqualToValue={(option, value) => option._id === value._id}
            //     renderInput={(params) => (
            //       <TextField
            //         {...params}
            //         label={col.Header}
            //         placeholder="Search users..."
            //         variant="outlined"
            //         InputProps={{
            //           ...params.InputProps,
            //           startAdornment: (
            //             <>
            //               <InputAdornment position="start">
            //                 <FaUserAlt
            //                   style={{
            //                     fontSize: '1rem',
            //                     color: 'rgb(51 51 51 / 73%)',
            //                     marginRight: '0.5rem',
            //                     marginLeft: '0.5rem',
            //                   }}
            //                 />
            //               </InputAdornment>
            //               {params.InputProps.startAdornment}
            //             </>
            //           ),
            //         }}
            //       />
            //     )}
            //     renderTags={(selected, getTagProps) => {
            //       const displayedTags = selected.slice(0, 1); // Display the first selected option
            //       const extraCount = selected.length - 1; // Count of additional selections

            //       return (
            //         <>
            //           {displayedTags.map((option, index) => (
            //             <span
            //               key={option._id}
            //               {...getTagProps({ index })}
            //               style={{
            //                 backgroundColor: '#e0e0e0',
            //                 borderRadius: '4px',
            //                 margin: '2px',
            //                 display: 'inline-block',
            //               }}
            //             >
            //               {option.username}
            //             </span>
            //           ))}
            //           {extraCount > 0 && (
            //             <span
            //               style={{
            //                 backgroundColor: '#e0e0e0',
            //                 borderRadius: '4px',
            //                 margin: '2px',
            //                 display: 'inline-block',
            //               }}
            //             >
            //               +{extraCount}
            //             </span>
            //           )}
            //         </>
            //       );
            //     }}
            //   />
            // </FormControl>

            //               )
          } else if (col.accessor === 'groups') {
            return (
              <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                <Autocomplete
                  disableCloseOnSelect
                  multiple
                  id={`autocomplete-${col.accessor}`}
                  options={groups}
                  getOptionLabel={(option) => option.name || ''}
                  value={
                    groups.filter((group) => formData[col.accessor]?.includes(group._id)) || []
                  }
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: col.accessor,
                        value: newValue.map((group) => group._id),
                      },
                    });
                  }}
                  ListboxProps={{
                    sx: {
                      maxHeight: 200, // Restrict max height
                      overflowY: 'scroll', // Always show scrollbar
                      '&::-webkit-scrollbar': {
                        width: '8px', // Scrollbar width
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
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={col.Header}
                      placeholder="Search group..."
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <FaUserGroup
                                style={{
                                  fontSize: '1.3rem',
                                  color: 'rgb(51 51 51 / 73%)',
                                  marginRight: '0.5rem',
                                  marginLeft: '0.5rem',
                                }}
                              />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                />
              </FormControl>


              // <FormControl fullWidth sx={{ marginBottom: 2,  }} key={col.accessor}>
              //   <Autocomplete
              //     disableCloseOnSelect
              //     multiple
              //     id={`autocomplete-${col.accessor}`}
              //     options={groups}
              //     getOptionLabel={(option) => option.name || ''}
              //     value={
              //       groups.filter((group) => formData[col.accessor]?.includes(group._id)) || []
              //     }

              //     onChange={(event, newValue) => {
              //       handleInputChange({
              //         target: {
              //           name: col.accessor,
              //           value: newValue.map((group) => group._id),
              //         },
              //       });
              //     }}
              //     ListboxComponent={CustomListbox}
              //     renderOption={(props, option, { selected }) => (
              //       <li {...props}>
              //         <Checkbox
              //           icon={<CheckBoxOutlineBlank />}
              //           checkedIcon={<CheckBox />}
              //           style={{ marginRight: 8 }}
              //           checked={selected}
              //         />
              //         {option.name}
              //       </li>
              //     )}
              //     isOptionEqualToValue={(option, value) => option._id === value._id}
              //     renderInput={(params) => (
              //       <TextField
              //         {...params}
              //         label={col.Header}
              //         placeholder="Search group..."
              //         variant="outlined"
              //         InputProps={{
              //           ...params.InputProps,
              //           startAdornment: (
              //             <>
              //               <InputAdornment position="start">
              //                 <FaUserGroup
              //                   style={{
              //                     fontSize: '1.3rem',
              //                     color: 'rgb(51 51 51 / 73%)',
              //                     marginRight: '0.5rem',
              //                     marginLeft: '0.5rem',
              //                   }}
              //                 />
              //               </InputAdornment>
              //               {params.InputProps.startAdornment}
              //             </>
              //           )
              //         }}

              //       />
              //     )}
              //     renderTags={(selected, getTagProps) => {
              //       const displayedTags = selected.slice(0, 1); // Show only the first two tags
              //       const extraCount = selected.length - 1; // Count of remaining tags

              //       return (
              //         <>
              //           {displayedTags.map((option, index) => (
              //             <span
              //               key={option._id}
              //               {...getTagProps({ index })}
              //               style={{
              //                 backgroundColor: '#e0e0e0',
              //                 borderRadius: '4px',
              //                 //padding: '2px 8px',
              //                 margin: '2px',
              //                 display: 'inline-block',
              //               }}
              //             >
              //               {option.name}
              //             </span>
              //           ))}
              //           {extraCount > 0 && (
              //             <span
              //               style={{
              //                 backgroundColor: '#e0e0e0',
              //                 borderRadius: '4px',
              //                 //padding: '2px 8px',
              //                 margin: '2px',
              //                 display: 'inline-block',
              //               }}
              //             >
              //               +{extraCount}
              //             </span>
              //           )}
              //         </>
              //       );
              //     }}
              //   />
              // </FormControl>
            )
          } else if (col.accessor === 'Driver') {
            return (
              <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                <Autocomplete
                  id={`autocomplete-${col.accessor}`}
                  options={drivers}
                  getOptionLabel={(option) => option.name || ''}
                  value={drivers.find((driver) => driver._id === formData[col.accessor]) || null}
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: col.accessor,
                        value: newValue ? newValue._id : '',
                      },
                    })
                  }}
                  ListboxProps={{
                    sx: {
                      maxHeight: 200, // Restrict max height
                      overflowY: 'scroll', // Always show scrollbar
                      '&::-webkit-scrollbar': {
                        width: '8px', // Scrollbar width
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
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={col.Header}
                      placeholder="Search driver..."
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <GrUserPolice
                              style={{
                                fontSize: '1.1rem',
                                color: 'rgb(51 51 51 / 73%);',
                                marginLeft: '0.3rem',
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </FormControl>
            )
          } else if (col.accessor === 'geofences') {
            return (
              <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  id={`autocomplete-${col.accessor}`}
                  options={areas}
                  getOptionLabel={(option) => option.name || ''}
                  value={areas.filter((area) => formData[col.accessor]?.includes(area._id)) || []}
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: col.accessor,
                        value: newValue.map((area) => area._id),
                      },
                    })
                  }}
                  ListboxProps={{
                    sx: {
                      maxHeight: 200, // Restrict max height
                      overflowY: 'scroll', // Always show scrollbar
                      '&::-webkit-scrollbar': {
                        width: '8px', // Scrollbar width
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
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={col.Header}
                      placeholder="Search area..."
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <FaLocationDot
                                style={{
                                  fontSize: '1.3rem',
                                  color: 'rgb(51 51 51 / 73%)',
                                  marginRight: '0.5rem',
                                  marginLeft: '0.5rem',
                                }}
                              />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                />
              </FormControl>
            )
          } else if (col.accessor === 'model') {
            return (
              <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                <Autocomplete
                  id={`autocomplete-${col.accessor}`}
                  options={models}
                  getOptionLabel={(option) => option.modelName || ''}
                  value={models.find((model) => model.modelName === formData[col.accessor]) || null}
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: col.accessor,
                        value: newValue ? newValue.modelName : '',
                      },
                    })
                  }}
                  ListboxProps={{
                    sx: {
                      maxHeight: 200, // Restrict max height
                      overflowY: 'scroll', // Always show scrollbar
                      '&::-webkit-scrollbar': {
                        width: '8px', // Scrollbar width
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
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={col.Header}
                      placeholder="Search models..."
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <TbCategoryFilled
                              style={{
                                fontSize: '1.3rem',
                                color: 'rgb(51 51 51 / 73%);',
                                marginLeft: '0.3rem',
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </FormControl>
            )
          } else if (col.accessor === 'category') {
            return (
              <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                <Autocomplete
                  id={`autocomplete-${col.accessor}`}
                  options={categories}
                  getOptionLabel={(option) => option.categoryName || ''}
                  value={
                    categories.find(
                      (category) => category.categoryName === formData[col.accessor],
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: col.accessor,
                        value: newValue ? newValue.categoryName : '',
                      },
                    })
                  }}
                  ListboxProps={{
                    sx: {
                      maxHeight: 200, // Restrict max height
                      overflowY: 'scroll', // Always show scrollbar
                      '&::-webkit-scrollbar': {
                        width: '8px', // Scrollbar width
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
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={col.Header}
                      placeholder="Search categories..."
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaShapes
                              style={{
                                fontSize: '1.3rem',
                                color: 'rgb(51 51 51 / 73%);',
                                marginLeft: '0.3rem',
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </FormControl>
            )
          }
          return null
        })}

        {columns.map((col) => {
          if (col.accessor === 'installationdate') {
            return (
              <>
                {/* <label>Installation date: </label> */}
                <TextField
                  key={col.accessor}
                  type="date"
                  label="Installationdate"
                  name={col.accessor}
                  value={formData[col.accessor] || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </>
            )
          } else if (col.accessor === 'expirationdate') {
            // return (
            //   <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
            //     <InputLabel>Expiration Plans</InputLabel>
            //     <Select
            //       onChange={(e) => {
            //         handleYearSelection(parseInt(e.target.value))
            //         setShowExpirationDropdown(false)
            //       }}
            //       label="Expiration Options"
            //       startAdornment={
            //         <InputAdornment position="start">
            //           <RiPassExpiredFill style={{ fontSize: '1.3rem', color: 'rgb(51 51 51 / 73%)' }} />
            //         </InputAdornment>
            //       }
            //       sx={{
            //         display: 'flex',
            //         alignItems: 'center',
            //       }}
            //     >
            //       <MenuItem value={1}>1 Year</MenuItem>
            //       <MenuItem value={2}>2 Years</MenuItem>
            //       <MenuItem value={3}>3 Years</MenuItem>
            //     </Select>
            //   </FormControl>

            // )
            return (
              <>
                <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                  <InputLabel>Expiration Plans</InputLabel>
                  <Select
                    onChange={(e) => {
                      const value = e.target.value;

                      // Handle custom logic for the custom date option
                      if (value === 'custom') {
                        setShowExpirationDropdown(false); // Hide dropdown
                        setCustomDateMode(true); // Trigger custom date input mode
                      } else {
                        handleYearSelection(parseInt(value));
                        setShowExpirationDropdown(false); // Reset dropdown state
                        setCustomDateMode(false); // Reset custom date mode
                      }
                    }}
                    label="Expiration Options"
                    startAdornment={
                      <InputAdornment position="start">
                        <RiPassExpiredFill
                          style={{ fontSize: '1.3rem', color: 'rgb(51 51 51 / 73%)' }}
                        />
                      </InputAdornment>
                    }
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 200, // Restrict max height
                          overflowY: 'scroll', // Always show scrollbar
                          '&::-webkit-scrollbar': {
                            width: '8px', // Scrollbar width
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
                    <MenuItem value={1}>1 Year</MenuItem>
                    <MenuItem value={2}>2 Years</MenuItem>
                    <MenuItem value={3}>3 Years</MenuItem>
                    <MenuItem value="custom">Custom Date</MenuItem>
                  </Select>
                </FormControl>

                {customDateMode && (
                  <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <TextField
                      label="Select Expiration Date"
                      type="date"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        setFormData({
                          ...formData,
                          expirationdate: selectedDate, // Directly set expiration date
                        });
                      }}
                    />
                  </FormControl>
                )}

              </>
            )
          }
          return null
        })}
      </div>
      <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem' }}>
        <button onClick={handleSkip} variant="contained" className="btn btn-secondary">
          Skip
        </button>
        <button
          onClick={handleSaveAndNext}
          variant="contained"
          className="btn btn-secondary"
          style={{ marginLeft: '1rem' }}
        >
          Save and Next
        </button>
      </div>
    </div>
  )
}

export default AddDevice1
