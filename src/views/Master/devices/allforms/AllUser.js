import React, { useState, useEffect } from 'react'
import { TextField, Typography, Accordion, AccordionSummary, AccordionDetails, InputAdornment, FormControlLabel, Checkbox, FormGroup, Button, FormControl, InputLabel, Select, Box, Autocomplete } from '@mui/material'
import { AccountCircle, MailOutline, Phone, LockOutlined, ExpandMoreOutlined } from '@mui/icons-material'
import Cookies from 'js-cookie'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { FaUserGroup } from "react-icons/fa6";
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';

import { jwtDecode } from 'jwt-decode'
function AllUser({ handleNextStep, handleSkip }) {
  const [isSuperAdmin, setSuperAdmin] = useState(false)
  const [availablePermissions, setAvailablePermissions] = useState({})
  const [token, setToken] = useState('')
  const [groups, setGroups] = useState([])
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
      geofence: false,
      maintenance: false,
      status: false,
      distance: false,
      history: false,
      sensor: false,
      idle: false,
      alerts: false,
      vehicle: false,
      geofenceReport: false,
    },
    isAdmin: false,
  })

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
  // to limit no of list items so that list should always open downwards
  const CustomListbox = (props) => {
    return (
      <ul {...props} style={{ maxHeight: '150px', overflowY: 'auto' }} />
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked,
      },
    }));
  };
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

  // Additional logic for permissions and state management can go here
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
    fetchGroups();
  }, [])

  const handleSaveAndNext = async (e) => {
    e.preventDefault()
    const dataToSubmit = {
      username: formData.username,
      mobile: formData.mobile,
      email: formData.email,
      password: formData.password,
      groupsAssigned: formData.groups,
      ...formData.permissions,
    }
    console.log("data to submit in alluser", dataToSubmit);


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

        //setCurrentStep(0)
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
            history: false,
            sensor: false,
            idle: false,
            alerts: false,
            vehicle: false,
          },
          isAdmin: false,
        })
        handleNextStep()
      } else {
        toast.error(`Error: ${response.status} - ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error during submission:', error)
      let errorMessage = 'An error occurred'
      toast.error(`Error: ${error.response}`)

      if (error.response) {
        errorMessage = error.response.data.message || error.response.data || 'An error occurred'
      } else if (error.request) {
        errorMessage = 'Network error: Please try again later'
      }

      toast.error(errorMessage)
    }
  }



  return (
    <div>
      <form >
        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gridGap: '1rem' }}>
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
            type="email"
            variant="outlined"
            name="email"
            value={formData.email !== undefined ? formData.email : ''}
            onChange={handleInputChange}
            sx={{ marginBottom: '10px' }}
            fullWidth
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
            type="phone"
            value={formData.mobile !== undefined ? formData.mobile : ''}
            onChange={handleInputChange}
            sx={{ marginBottom: '10px' }}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
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

          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <Autocomplete
              disableCloseOnSelect
              multiple
              options={groups}
              getOptionLabel={(option) => option.name || ''}
              value={
                groups.filter((group) => formData.groups?.includes(group._id)) || []
              }
              onChange={(event, newValue) => {
                handleInputChange({
                  target: {
                    name: "groups",
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
                  label="groups"
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



          {/* <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <Autocomplete
              disableCloseOnSelect
              multiple
              options={groups}
              getOptionLabel={(option) => option.name || ''}
              value={
                groups.filter((group) => formData.groups?.includes(group._id)) || []
              }
              onChange={(event, newValue) => {
                handleInputChange({
                  target: {
                    name: 'groups',
                    value: newValue.map((group) => group._id),
                  },
                });
              }}
              ListboxComponent={CustomListbox}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlank />}
                    checkedIcon={<CheckBox />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.name}
                </li>
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Groups"
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
              renderTags={(selected, getTagProps) => {
                const displayedTags = selected.slice(0, 1); // Display only the first selected option
                const extraCount = selected.length - 1; // Count of additional selections

                return (
                  <>
                    {displayedTags.map((option, index) => (
                      <span
                        key={option._id}
                        {...getTagProps({ index })}
                        style={{
                          backgroundColor: '#e0e0e0',
                          borderRadius: '4px',
                          margin: '2px',
                          display: 'inline-block',
                        }}
                      >
                        {option.name}
                      </span>
                    ))}
                    {extraCount > 0 && (
                      <span
                        style={{
                          backgroundColor: '#e0e0e0',
                          borderRadius: '4px',
                          margin: '2px',
                          display: 'inline-block',
                        }}
                      >
                        +{extraCount}
                      </span>
                    )}
                  </>
                );
              }}
            />
          </FormControl> */}

        </div>

        <div className="mt-3">
          {/* Permissions Step */}
          <Typography sx={{ color: '#333', fontWeight: 'bold', marginTop: '15px' }}>
            <span role="img" aria-label="permissions">
              🔒
            </span>{' '}
            Permissions
          </Typography>

          {/* render the admin togle for only admin */}
          {true && (
            <FormControlLabel
              sx={{ color: 'black' }}
              control={<Checkbox checked={formData.isAdmin} onChange={handleAdminToggle} />}
              label="Admin (Select all permissions)"
            />
          )}

          {true ? (
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
                        'idle',
                        'status',
                        'distance',
                        'alerts',
                        'vehicle',
                        'sensor',
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
                          'idle',
                          'status',
                          'distance',
                          'alerts',
                          'vehicle',
                          'sensor',
                          'geofenceReport',
                        ].filter((permission) => availablePermissions[permission])
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
        <div style={{ position: "absolute", bottom: "1.5rem", right: "1.5rem" }}>
          {/* <Button variant="contained" color="primary" type="button" onClick={handleSkip}>
      Skip
    </Button>
    <Button variant="contained" color="primary" type="button" onClick={handleSaveAndNext}>
      Save and Next
    </Button> */}
          <button

            onClick={handleSkip}
            variant="contained"
            className="btn btn-secondary"
          >
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
      </form>
    </div>
  )
}

export default AllUser









