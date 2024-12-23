import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CRow,
  CFormLabel,
  CFormFeedback,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CTooltip,
} from '@coreui/react'
import Select from 'react-select'
import Cookies from 'js-cookie'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilSettings } from '@coreui/icons'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // For table in PDF
import * as XLSX from 'xlsx';
import idel from "src/status/idel.png";
import ignitionOff from "src/status/power-off.png";
import ignitionOn from "src/status/power-on.png";
import Loader from '../../../components/Loader/Loader'
import '../style/remove-gutter.css';

const SearchIdeal = ({
  formData,
  handleInputChange,
  handleSubmit,
  users,
  groups,
  getGroups,
  loading,
  devices,
  getDevices,
  columns,
  showMap,
  setShowMap,
}) => {
  const [validated, setValidated] = useState(false)
  const [showDateInputs, setShowDateInputs] = useState(false)
  const [selectedU, setSelectedU] = useState();
  const [selectedG, setSelectedG] = useState();
  // State to manage button text
  const [buttonText, setButtonText] = useState('SHOW NOW')
  const [isDropdownOpen, setDropdownOpen] = useState(false) // State to manage dropdown visibility

  const handleFormSubmit = (event) => {
    const form = event.currentTarget
    console.log('handle submit ke pass hu')
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
    } else {
      event.preventDefault()
      handleSubmit()
      setShowMap(true) //Show the mapping
    }
    setValidated(true)
  }

  const handlePeriodChange = (value) => {
    handleInputChange('Periods', value)
    setShowDateInputs(value === 'Custom')
  }

  // Function to handle dropdown item clicks
  const handleDropdownClick = (text) => {
    setButtonText(text) // Change button text based on the clicked item
    setDropdownOpen(false) // Close the dropdown after selection
    handleSubmit() // Submit form
    setShowMap(true) // Show the map when form is valid and submitted
  }
  // Function to toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev)
  }

  return (
    <CForm
      className="row g-3 needs-validation"
      noValidate
      validated={validated}
      onSubmit={handleFormSubmit}
    >
      <CCol md={3}>
        <CFormLabel htmlFor="devices">User</CFormLabel>
        {/* <CFormSelect
          id="user"
          required
          value={selectedU}
          onChange={(e) => {
            const selectedUser = e.target.value;
            setSelectedU(selectedUser)
            console.log("Selected user:", selectedUser);
            getGroups(selectedUser);
          }}
        >
          <option value="">Choose a user...</option>
          {loading ? (<option>Loading Users...</option>) : (
            users?.length > 0 ? (
              users?.map((user) => (
                <option key={user._id} value={user._id}>{user.username}</option>
              ))
            ) : (
              <option disabled>No Users in this Account</option>
            )
          )
          }
        </CFormSelect> */}
        <Select
          id="user"
          options={
            loading
              ? [{ value: '', label: 'Loading Users...', isDisabled: true }]
              : users?.length > 0
                ? users.map((user) => ({ value: user._id, label: user.username }))
                : [{ value: '', label: 'No Users in this Account', isDisabled: true }]
          }
          value={selectedU ? { value: selectedU, label: users.find((user) => user._id === selectedU)?.username } : null}
          onChange={(selectedOption) => {
            const selectedUser = selectedOption?.value;
            setSelectedU(selectedUser);
            console.log('Selected user:', selectedUser);
            getGroups(selectedUser);
          }}
          placeholder="Choose a user..."
          isLoading={loading} // Show a loading spinner while fetching users
        />

      </CCol>
      <CCol md={2}>
        <CFormLabel htmlFor="devices">Groups</CFormLabel>
        {/* <CFormSelect
          id="group"
          required
          value={selectedG}
          onChange={(e) => {
            const selectedGroup = e.target.value;
            setSelectedG(selectedGroup);
            console.log("Selected Group ID:", selectedGroup);
            getDevices(selectedGroup);
          }}
        >
          <option value="">Choose a group...</option>

          {loading ? (<option>Loading Groups...</option>) : (
            groups?.length > 0 ? (
              groups?.map((group) => (
                <option key={group._id} value={group._id}>{group.name}</option>
              ))
            ) : (
              <option disabled>No Groups in this User</option>
            )
          )
          }
        </CFormSelect> */}
        <Select
          id="group"
          options={
            loading
              ? [{ value: '', label: 'Loading Groups...', isDisabled: true }]
              : groups?.length > 0
                ? groups.map((group) => ({ value: group._id, label: group.name }))
                : [{ value: '', label: 'No Groups in this User', isDisabled: true }]
          }
          value={selectedG ? { value: selectedG, label: groups.find((group) => group._id === selectedG)?.name } : null}
          onChange={(selectedOption) => {
            const selectedGroup = selectedOption?.value;
            setSelectedG(selectedGroup);
            console.log('Selected Group ID:', selectedGroup);
            getDevices(selectedGroup);
          }}
          placeholder="Choose a group..."
          isLoading={loading} // Show a loading spinner while fetching groups
        />

        <CFormFeedback invalid>Please provide a valid device.</CFormFeedback>
      </CCol>

      <CCol md={2}>
        <CFormLabel htmlFor="devices">Devices</CFormLabel>
        {/* <CFormSelect
          id="devices"
          required
          value={formData.Devices}
          onChange={(e) => handleInputChange('Devices', e.target.value)}
        >
          <option value="">Choose a device...</option>
          {devices.length > 0 ? (
            devices.map((device) => (
              <option key={device.id} value={device.deviceId}>
                {device.name}
              </option>
            ))
          ) : (
            <option disabled>Loading devices...</option>
          )}
        </CFormSelect> */}
        <Select
          id="devices"
          options={
            devices.length > 0
              ? devices.map((device) => ({ value: device.deviceId, label: device.name }))
              : [{ value: '', label: 'Loading devices...', isDisabled: true }]
          }
          value={formData.Devices ? { value: formData.Devices, label: devices.find((device) => device.deviceId === formData.Devices)?.name } : null}
          onChange={(selectedOption) => handleInputChange('Devices', selectedOption?.value)}
          placeholder="Choose a device..."
        />

        <CFormFeedback invalid>Please provide a valid device.</CFormFeedback>
      </CCol>

      <CCol md={2}>
        <CFormLabel htmlFor="periods">Periods</CFormLabel>
        {/* <CFormSelect
          id="periods"
          required
          value={formData.Periods}
          onChange={(e) => handlePeriodChange(e.target.value)}
        >
          <option value="">Choose a period...</option>
          <option value="Today">Today</option>
          <option value="Yesterday">Yesterday</option>
          <option value="This Week">This Week</option>
          <option value="Previous Week">Previous Week</option>
          <option value="This Month">This Month</option>
          <option value="Previous Month">Previous Month</option>
          <option value="Custom">Custom</option>
        </CFormSelect> */}
        <Select
          id="periods"
          options={[
            { value: '', label: 'Choose a period...' },
            { value: 'Today', label: 'Today' },
            { value: 'Yesterday', label: 'Yesterday' },
            { value: 'This Week', label: 'This Week' },
            { value: 'Previous Week', label: 'Previous Week' },
            { value: 'This Month', label: 'This Month' },
            { value: 'Previous Month', label: 'Previous Month' },
            { value: 'Custom', label: 'Custom' },
          ]}
          value={formData.Periods ? { value: formData.Periods, label: formData.Periods } : null}
          onChange={(selectedOption) => handlePeriodChange(selectedOption?.value)}
          placeholder="Choose a period..."
        />

        <CFormFeedback invalid>Please select a valid period.</CFormFeedback>
      </CCol>

      <CCol md={3}>
        <CFormLabel htmlFor="columns">Columns</CFormLabel>
        <Select
          isMulti
          id="columns"
          options={[
            { value: 'all', label: 'All Columns' }, // Add "All Columns" option
            ...columns.map((column) => ({ value: column, label: column })),
          ]}
          value={
            formData.Columns.length === columns.length
              ? [{ value: 'all', label: 'All Columns' }] // Show "All Columns" if all columns are selected
              : formData.Columns.map((column) => ({ value: column, label: column }))
          }
          onChange={(selectedOptions) => {
            if (selectedOptions.find((option) => option.value === 'all')) {
              // If "All Columns" is selected, select all available columns
              handleInputChange('Columns', columns)
            } else {
              // Otherwise, update formData.Columns with selected values
              handleInputChange(
                'Columns',
                selectedOptions.map((option) => option.value),
              )
            }
          }}
        />
        <CFormFeedback invalid>Please select at least one column.</CFormFeedback>
      </CCol>

      {showDateInputs && (
        <>
          <CCol md={4}>
            <CFormLabel htmlFor="fromDate">From Date</CFormLabel>
            <CFormInput
              type="date"
              id="fromDate"
              value={formData.FromDate}
              onChange={(e) => handleInputChange('FromDate', e.target.value)}
              required
            />
            <CFormFeedback invalid>Please provide a valid from date.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="toDate">To Date</CFormLabel>
            <CFormInput
              type="date"
              id="toDate"
              value={formData.ToDate}
              onChange={(e) => handleInputChange('ToDate', e.target.value)}
              required
            />
            <CFormFeedback invalid>Please provide a valid to date.</CFormFeedback>
          </CCol>
        </>
      )}

      <CCol xs={12}>
        <div className="d-flex justify-content-end">
          <div className="btn-group">
            <button
              className="btn btn-secondary "
              type="button"
              onClick={() => handleDropdownClick('SHOW NOW')}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </CCol>
    </CForm>
  )
}

const ShowIdeal = ({ apiData, selectedColumns, selectedDeviceName, statusLoading }) => {
  const [dataWithAddresses, setDataWithAddresses] = useState([])

  // Function to get address from latitude and longitude
  const getAddressFromLatLng = async (latitude, longitude) => {
    // const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`

    try {
      const response = await axios.get(url)
      const address = response.data?.display_name || 'Address not found'
      return address
    } catch (error) {
      console.error('Error fetching address: ', error)
      return 'Address not found'
    }
  }

  // Function to map over API data and fetch addresses
  const mapDataWithAddress = async () => {
    if (!apiData || apiData.length === 0) return apiData

    const updatedData = await Promise.all(
      apiData.map(async (row) => {
        if (row.data && row.data.length > 0) {
          const updatedNestedData = await Promise.all(
            row.data.map(async (nestedRow) => {
              if (nestedRow.location) {
                const [latitude, longitude] = nestedRow.location.split(',')
                const address = await getAddressFromLatLng(latitude.trim(), longitude.trim())
                return { ...nestedRow, address } // Attach address to nestedRow
              }
              return nestedRow
            }),
          )
          return { ...row, data: updatedNestedData }
        }
        return row
      }),
    )

    return updatedData
  }

  useEffect(() => {
    const fetchDataWithAddresses = async () => {
      const updatedData = await mapDataWithAddress()
      setDataWithAddresses(updatedData)
    }

    fetchDataWithAddresses()
  }, [apiData])

  // PDF Download Function
  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ['SN', 'Vehicle Name', ...selectedColumns];
    const tableRows = [];

    dataWithAddresses.forEach((row, rowIndex) => {
      row.data.forEach((nestedRow, nestedIndex) => {
        const rowData = [
          rowIndex + 1, // Serial Number
          row.device?.name || selectedDeviceName || '--', // Fetch Vehicle Name
          ...selectedColumns.map((column) => {
            if (column === 'Vehicle Status') return nestedRow.vehicleStatus;
            if (column === 'Duration')
              return new Date(nestedRow.durationSeconds * 1000).toISOString().substr(11, 8);
            if (column === 'Location') return nestedRow.address || nestedRow.location;
            if (column === 'Start Time')
              return new Date(
                new Date(nestedRow.arrivalTime).setHours(
                  new Date(nestedRow.arrivalTime).getHours() - 5,
                  new Date(nestedRow.arrivalTime).getMinutes() - 30,
                ),
              ).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
            if (column === 'End Time')
              return new Date(
                new Date(nestedRow.departureTime).setHours(
                  new Date(nestedRow.departureTime).getHours() - 5,
                  new Date(nestedRow.departureTime).getMinutes() - 30,
                ),
              ).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
            if (column === 'Total Duration')
              return new Date(row.totalDurationSeconds * 1000).toISOString().substr(11, 8);
            return '--';
          }),
        ];
        tableRows.push(rowData);
      });
    });

    // Generate the table with borders
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: {
        lineWidth: 0.5, // Set thickness of inner borders
        lineColor: [0, 0, 0], // Set color for borders (black)
        halign: 'center', // Horizontal alignment for text in cells
        valign: 'middle', // Vertical alignment for text in cells
      },
      tableLineWidth: 0.5, // Set thickness for outer borders
      tableLineColor: [0, 0, 0], // Set outer border color (black)
      margin: { top: 10 }, // Adjust top margin if necessary
    });

    doc.save(`${selectedDeviceName || 'Idle_Report'}.pdf`);
  };


  // Excel Download Function
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      dataWithAddresses.flatMap((row, rowIndex) => {
        return row.data.map((nestedRow, nestedIndex) => {
          const rowData = {
            SN: rowIndex + 1,
            'Vehicle Name': row.device?.name || selectedDeviceName || '--', // Map Vehicle Name
          };

          selectedColumns.forEach((column) => {
            if (column === 'Vehicle Status') rowData['Vehicle Status'] = nestedRow.vehicleStatus;
            if (column === 'Duration')
              rowData['Duration'] = new Date(nestedRow.durationSeconds * 1000)
                .toISOString()
                .substr(11, 8);
            if (column === 'Location') rowData['Location'] = nestedRow.address || nestedRow.location;
            if (column === 'Start Time')
              rowData['Start Time'] = new Date(
                new Date(nestedRow.arrivalTime).setHours(
                  new Date(nestedRow.arrivalTime).getHours() - 5,
                  new Date(nestedRow.arrivalTime).getMinutes() - 30,
                ),
              ).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
            if (column === 'End Time')
              rowData['End Time'] = new Date(
                new Date(nestedRow.departureTime).setHours(
                  new Date(nestedRow.departureTime).getHours() - 5,
                  new Date(nestedRow.departureTime).getMinutes() - 30,
                ),
              ).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
            if (column === 'Total Duration')
              rowData['Total Duration'] = new Date(row.totalDurationSeconds * 1000)
                .toISOString()
                .substr(11, 8);
          });

          return rowData;
        });
      }),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'IdealData');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedDeviceName || 'Idle_Report'}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <CTable bordered className="custom-table">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>SN</CTableHeaderCell>
            <CTableHeaderCell>Vehicle Name</CTableHeaderCell>
            {selectedColumns.map((column, index) => (
              <CTableHeaderCell key={index}>{column}</CTableHeaderCell>
            ))}
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {/* Condition for Loading State */}
          {statusLoading ? (
            <CTableRow style={{ position: 'relative' }}>
              <CTableDataCell
                colSpan={selectedColumns.length + 2}
                style={{
                  backgroundColor: '#f8f9fa',
                  color: '#6c757d',
                  fontStyle: 'italic',
                  padding: '16px',
                  textAlign: 'center',
                  border: '1px dashed #dee2e6',
                  height: '100px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Loader />
                </div>
              </CTableDataCell>
            </CTableRow>
          ) : dataWithAddresses?.length > 0 ? (
            // Condition for dataWithAddresses
            dataWithAddresses.map((row, rowIndex) =>
              row.data?.length > 0 ? (
                row.data.map((nestedRow, nestedIndex) => (
                  <CTableRow key={`${row.deviceId}-${nestedIndex}`} className="custom-row">
                    <CTableDataCell
                      style={{
                        backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                      }}
                    >
                      {rowIndex + 1}
                    </CTableDataCell>
                    <CTableDataCell
                      style={{
                        backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                      }}
                    >
                      {selectedDeviceName}
                    </CTableDataCell>

                    {/* Dynamically render table cells based on selected columns */}
                    {selectedColumns.map((column, index) => (
                      <CTableDataCell
                        key={index}
                        style={{
                          backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#eeeeefc2',
                        }}
                      >
                        {(() => {
                          switch (column) {
                            case 'Vehicle Status':
                              return nestedRow.vehicleStatus === 'Idle' ? (
                                <CTooltip content="Idle">
                                  <img
                                    src={idel}
                                    alt="idle"
                                    width="40"
                                    height="40"
                                    style={{ marginRight: '10px' }}
                                  />
                                </CTooltip>
                              ) : nestedRow.vehicleStatus === 'Ignition Off' ? (
                                <CTooltip content="Ignition Off">
                                  <img
                                    src={ignitionOff}
                                    alt="off"
                                    width="40"
                                    height="40"
                                    style={{ marginRight: '10px' }}
                                  />
                                </CTooltip>
                              ) : nestedRow.vehicleStatus === 'Ignition On' ? (
                                <CTooltip content="Ignition On">
                                  <img
                                    src={ignitionOn}
                                    alt="on"
                                    width="40"
                                    height="40"
                                    style={{ marginRight: '10px' }}
                                  />
                                </CTooltip>
                              ) : null;

                            case 'Duration':
                              return new Date(nestedRow.durationSeconds * 1000)
                                .toISOString()
                                .substr(11, 8);

                            case 'Location':
                              return nestedRow.address || nestedRow.location;

                            case 'Start Time':
                              return new Date(
                                new Date(nestedRow.arrivalTime).setHours(
                                  new Date(nestedRow.arrivalTime).getHours() - 5,
                                  new Date(nestedRow.arrivalTime).getMinutes() - 30
                                )
                              ).toLocaleString([], {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              });

                            case 'End Time':
                              return new Date(
                                new Date(nestedRow.departureTime).setHours(
                                  new Date(nestedRow.departureTime).getHours() - 5,
                                  new Date(nestedRow.departureTime).getMinutes() - 30
                                )
                              ).toLocaleString([], {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              });

                            case 'Total Duration':
                              return new Date(row.totalDurationSeconds * 1000)
                                .toISOString()
                                .substr(11, 8);

                            default:
                              return '--';
                          }
                        })()}
                      </CTableDataCell>
                    ))}
                  </CTableRow>
                ))
              ) : (
                <CTableRow key={`${row.deviceId}-empty`}>
                  <CTableDataCell
                    colSpan={selectedColumns.length + 2}
                    style={{
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d',
                      fontStyle: 'italic',
                      padding: '16px',
                      textAlign: 'center',
                      border: '1px dashed #dee2e6',
                    }}
                  >
                    No data available for {selectedDeviceName}
                  </CTableDataCell>
                </CTableRow>
              )
            )
          ) : (
            // Condition when no data is available
            <CTableRow>
              <CTableDataCell
                colSpan={selectedColumns.length + 2}
                style={{
                  backgroundColor: '#f8f9fa',
                  color: '#6c757d',
                  fontStyle: 'italic',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                No data available
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      <CDropdown className="position-fixed bottom-0 end-0 m-3">
        <CDropdownToggle
          color="secondary"
          style={{ borderRadius: '50%', padding: '10px', height: '48px', width: '48px' }}
        >
          <CIcon icon={cilSettings} />
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem onClick={downloadPDF}>PDF</CDropdownItem>
          <CDropdownItem onClick={downloadExcel}>Excel</CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </>
  )
}

const Ideal = () => {
  const [formData, setFormData] = useState({
    Devices: '',
    Details: '',
    Periods: '',
    FromDate: '',
    ToDate: '',
    Columns: [],
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState();
  const [groups, setGroups] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false) //show mapping data
  const accessToken = Cookies.get('authToken')
  const [statusLoading, setStatusLoading] = useState(false)
  const [columns] = useState([
    // 'OUID',
    'Vehicle Status',
    'Start Time',
    'Duration',
    'Location',
    'End Time',
    'Total Duration',
  ])

  const [selectedColumns, setSelectedColumns] = useState([])
  const token = Cookies.get('authToken') //

  const [apiData, setApiData] = useState() //data from api

  // Get the selected device name from the device list based on formData.Devices
  const selectedDevice = devices.find((device) => device.deviceId === formData.Devices)
  const selectedDeviceName = selectedDevice ? selectedDevice.name : ''

  const getDevices = async (selectedGroup) => {
    const accessToken = Cookies.get('authToken')
    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/device/getDeviceByGroup/${selectedGroup}`,
        {
          headers: {
            Authorization: 'Bearer ' + accessToken,
          },
        },
      )
      if (response.data.success) {
        setDevices(response.data.data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setDevices([])
      setLoading(false)
      throw error // Re-throw the error for further handling if needed
    }
  }

  const getGroups = async (selectedUser = "") => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/group/${selectedUser}`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })
      if (response.data.groupsAssigned) {
        setGroups(response.data.groupsAssigned)
        setLoading(false);
        console.log("perticular user ke groups")
      } else if (response.data.groups) {
        setGroups(response.data.groups)
        setLoading(false);
        console.log("all groups")
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching data:', error)
      throw error // Re-throw the error for further handling if needed
    }
  }
  const getUser = async () => {
    setLoading(true);
    setGroups([]);
    setDevices([]);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      })
      if (response.data) {
        setUsers(response.data.users)
        setLoading(false);
        console.log("yaha tak thik hai")
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      throw error
      setLoading(false);
    }
  }

  useEffect(() => {
    getUser();
    getGroups();
  }, [])

  const handleInputChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))

    if (name === 'Columns') {
      setSelectedColumns(value)
    }
  }

  const handleSubmit = async () => {
    setStatusLoading(true);
    console.log('DataAll', formData)

    // Convert the dates to ISO format if they're provided
    const fromDate = formData.FromDate ? new Date(formData.FromDate).toISOString() : ''
    const toDate = formData.ToDate ? new Date(formData.ToDate).toISOString() : ''

    const body = {
      deviceId: formData.Devices, // Use the device ID from the form data
      period: formData.Periods, // Use the selected period from the form data
      FromDate: fromDate,
      ToDate: toDate,
    }

    // console.log(token);
    // console.log(body);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/idleSummary?deviceIds=${body.deviceId}&period=${body.period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Replace with your actual token
            'Content-Type': 'application/json',
          },
        },
      )

      // console.log(response.data.deviceDataByStatus[0]);

      console.log('All Status reports')

      if (response.status == 200) {
        console.log(response.data.data)
        console.log('done in all')
        console.log(response.data.data)
        setApiData(response.data.data)
        setStatusLoading(false)
      }

      // Assuming the data returned is what you want to display in the table
      console.log('Form submitted with data:', body)
    } catch (error) {
      setStatusLoading(false)
      console.error('Error submitting form:', error)
    }
  }

  return (
    <>
      <CRow className="pt-3 gutter-0">
        <CCol xs={12} md={12} className="px-4">
          <CCard className="mb-4 p-0 shadow-lg rounded">
            <CCardHeader className="d-flex justify-content-between align-items-center bg-secondary text-white">
              <strong>Idle Report</strong>
            </CCardHeader>
            <CCardBody>
              <SearchIdeal
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                users={users}
                getGroups={getGroups}
                groups={groups}
                getDevices={getDevices}
                devices={devices}
                loading={loading}
                showMap={showMap}
                setShowMap={setShowMap}
                columns={columns}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {showMap && (
        <CRow className="justify-content-center mt-4 gutter-0">
          <CCol xs={12} className="px-4">
            <CCard className="p-0 mb-4 shadow-sm">
              <CCardHeader className="d-flex justify-content-between align-items-center bg-secondary text-white">
                <strong>
                  All Idle Report List {selectedDeviceName && `for ${selectedDeviceName}`}
                </strong>
                {/* <CFormInput
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '250px' }}
                /> */}
              </CCardHeader>
              <CCardBody>
                <ShowIdeal
                  apiData={apiData}
                  selectedDeviceName={selectedDeviceName}
                  selectedColumns={selectedColumns}
                  statusLoading={statusLoading}
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default Ideal
