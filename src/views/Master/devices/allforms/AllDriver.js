import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Autocomplete, } from "@mui/material";
import Cookies from 'js-cookie'
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DialpadIcon from '@mui/icons-material/Dialpad';
import toast, { Toaster } from 'react-hot-toast'

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
  InputAdornment,
  FormControl,
} from '@mui/material'
import {
  AccountCircle,
  MailOutline,
  Phone,
} from '@mui/icons-material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
const AllDriver = ({ handleClose }) => {

  const [formData, setFormData] = useState({})

  const [devices, setDevices] = useState([]);
  const token = Cookies.get('authToken'); //


  useEffect(() => {
    const fetchDevices = async () => {
      console.log("fetch device me aaya hu...");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/device`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },

        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        const mappedDevices = data.devices.map((device) => ({
          deviceId: device.deviceId,
          name: device.name,
        }));

        setDevices(mappedDevices); // Assuming the data returned contains device info
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchDevices();
  }, []);
  // dropdown list should open downwards
  const CustomListbox = (props) => {
    return (
      <ul {...props} style={{ maxHeight: '150px', overflowY: 'auto' }} />
    );
  };

  // const handleInputChange = (e) => {
  //     const { name, value } = e.target;
  //     setFormData({
  //       ...formData,
  //       [name]: value
  //     });
  //   };
  const handleAddDriver = async (e) => {
    e.preventDefault()
    console.log("formData", formData)
    //  // Validation checks
    //  if (!validatePhone(formData.phone)) {
    //   toast.error("Invalid phone number. It should be 10 digits.");
    //   return;
    // }
    // if (!validateEmail(formData.email)) {
    //   toast.error("Invalid email format.");
    //   return;
    // }
    // if (!validateLicenseNumber(formData.licenseNumber)) {
    //   toast.error("Invalid license number. It should be alphanumeric and up to 15 characters.");
    //   return;
    // }
    // if (!validateAadharNumber(formData.aadharNumber)) {
    //   toast.error("Invalid Aadhar number. It should be exactly 12 digits.");
    //   return;

    try {
      const accessToken = Cookies.get('authToken')
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/driver`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status == 200) {
        toast.success('Driver is created successfully')
        //fetchDriverData()
        setFormData({})

        handleClose()
      }
    } catch (error) {
      toast.error("This didn't work.")
      throw error.response ? error.response.data : new Error('An error occurred')

    }
  }
  return (
    <div >
      <form style={{ display: 'flex', justifyContent: "flex-end", flexDirection: "column", }}>
        <FormControl style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gridGap: '3rem 1rem' }}>
          <TextField
            label="Driver Name"
            name="name"
            value={formData.name !== undefined ? formData.name : ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            label="Mobile No."
            name="mobile"
            value={formData.phone !== undefined ? formData.phone : ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            label="Email"
            name="email"
            value={formData.email !== undefined ? formData.email : ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutline />
                </InputAdornment>
              ),
            }}
          />

          <Autocomplete
            options={devices} // List of devices
            getOptionLabel={(option) => option.name} // Defines the label for each option
            //onChange={(event, value) => setSelectedDevice(value)}
            onChange={(event, value) => setFormData({ ...formData, deviceId: value.deviceId })} // Handle selection
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
                label="Select or Search Vehicle"
                placeholder='Start typing to search'
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <DirectionsCarIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
                fullWidth
              />
            )}
            filterOptions={(options, state) =>
              options.filter((option) =>
                option.name.toLowerCase().includes(state.inputValue.toLowerCase())
              )
            }
            isOptionEqualToValue={(option, value) => option.deviceId === value?.deviceId}
          />

          <TextField
            label='Licence No.'
            name="lic"
            value={formData.licenseNumber !== undefined ? formData.licenseNumber : ""}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TextSnippetIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label='Aadhar No.'
            name="aadhar"
            value={formData.aadharNumber !== undefined ? formData.aadharNumber : ""}
            onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DialpadIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label='Address'
            name="Address"
            value={formData.address !== undefined ? formData.address : ""}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}

            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HomeIcon />
                </InputAdornment>
              ),
            }}
          />
        </FormControl>


      </form>
      <button
        variant="contained"
        className='btn btn-secondary'
        onClick={handleAddDriver}
        type="submit"
        style={{ marginTop: '20px', marginLeft: "auto", position: 'absolute', bottom: '1.5rem', right: '1.5rem' }}
      >
        Submit
      </button>
    </div>
  )
}
export default AllDriver;