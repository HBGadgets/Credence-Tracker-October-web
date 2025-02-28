import React from 'react'
import { useState, useEffect, useMemo } from 'react'
import Select, { components } from 'react-select'
import Cookies from 'js-cookie'
import axios from 'axios'
import dayjs from 'dayjs'

const accessToken = Cookies.get('authToken') // Replace with your token

export const getUsers = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  console.log('serssss', response.data.users)
  return response.data.users
}

export const getGroups = async (userId) => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/group/${userId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.data.groupsAssigned || response.data.groups
}

export const getDevices = async (groupId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/device/getDeviceByGroup/${groupId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  console.log(
    'response.data===================================================================',
    response.data,
  )
  return response.data.data
}

export const Selector = ({ setFilteredData, filteredData, fillDevices }) => {
  const [selectedOptions, setSelectedOptions] = useState([])

  // Initialize deviceOptions with the filteredData
  const deviceOptions = fillDevices.map((device) => ({
    label: device.name,
    value: device.deviceId,
  }))

  // Add a "Select All" option
  const selectAllOption = {
    label: 'Select All',
    value: 'select_all',
  }

  const handleChange = (selected) => {
    if (selected.some((option) => option.value === 'select_all')) {
      // If "Select All" is selected, select all options
      if (selectedOptions.length === deviceOptions.length) {
        setSelectedOptions([])
        setFilteredData(filteredData) // Show all data
      } else {
        setSelectedOptions(deviceOptions)
        setFilteredData(fillDevices) // Filter to all devices
      }
    } else {
      // Otherwise, update the selected options and filtered data
      setSelectedOptions(selected)

      if (selected && selected.length > 0) {
        const selectedDeviceIds = selected.map((option) => option.value)
        const filtered = fillDevices.filter((device) => selectedDeviceIds.includes(device.deviceId))
        setFilteredData(filtered)
      } else {
        setFilteredData(filteredData) // Show all data
      }
    }
  }

  return (
    <div>
      <Select
        className="particularFilter"
        options={[selectAllOption, ...deviceOptions]} // Include "Select All" at the top
        isMulti
        value={selectedOptions}
        onChange={handleChange}
        placeholder="Select Vehicles"
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: '4px',
          }),
          option: (base, state) => ({
            ...base,
            color: state.isSelected ? 'white' : 'black',
            backgroundColor: state.isSelected ? '#6a1b9a' : 'white',
          }),
        }}
      />
    </div>
  )
}

export function getTimeDifference(timestamp) {
  const now = dayjs()
  const time = dayjs(timestamp)
  const diffInMilliseconds = now.diff(time) // Difference in milliseconds

  // Calculate days, hours, and minutes
  const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60))

  // Format the difference in a human-readable format
  let timeDifference = ''
  if (days >= 0) {
    timeDifference += `${days}D `
  }
  if (hours >= 0) {
    timeDifference += `${hours}H `
  }
  if (minutes >= 0) {
    timeDifference += `${minutes}M`
  }

  return timeDifference.trim() || 'Just now'
}
