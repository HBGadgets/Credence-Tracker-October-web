import React, { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  // Stepper,
  // Step,
  // StepLabel,
  TextField,
  Typography,
  IconButton,
  Modal,
  InputAdornment
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { AiOutlinePlus } from 'react-icons/ai'
import { MdOutlineOnDeviceTraining } from "react-icons/md";


const EditDeviceModal = ({
  editModalOpen,
  handleModalClose,
  //currentStep,
  style,
  handleNext,
  handleBack,
  handleEditIconClick,
  handleEditSubmit,
  columns,
  formData,
  handleInputChange,
  users,
  groups,
  drivers,
  areas,
  models,
  categories,
  steps,
  handleExtendYearSelection,
  setShowExpirationDropdown,
  customExtendDate,
  setCustomExtendDate,
  setExtendedPasswordModel
}) => {

  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  return (
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
            <span role="img" aria-label="device">
              <MdOutlineOnDeviceTraining style={{ verticalAlign: 'text-top' }} />
            </span>{' '}
            Update Device
          </Typography>
          <IconButton onClick={handleModalClose}>
            <CloseIcon />
          </IconButton>
        </div>

        {/* Step-by-step form with progress indicator */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gridGap: '1rem 1.5rem' }}>
          {/* <Stepper activeStep={currentStep} className="mb-4" alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper> */}

          {/* Step 1: General Information */}
          {
            // currentStep === 0 &&
            columns.map((col) => {
              if (
                col.accessor === 'name' ||
                col.accessor === 'uniqueId' ||
                col.accessor === 'sim' ||
                col.accessor === 'speed' ||
                col.accessor === 'average'
              ) {
                return (
                  <TextField
                    key={col.accessor}
                    label={col.Header}
                    variant="outlined"
                    name={col.accessor}
                    value={formData[col.accessor] || ''}
                    onChange={handleInputChange}
                    fullWidth
                    sx={{ marginBottom: 2 }}
                  />
                )
              }
              return null
            })}

          {/* Step 2: Assign Device */}
          {
            // currentStep === 1 &&
            columns.map((col) => {
              if (col.accessor === 'users') {
                return (
                  <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                    <InputLabel>{col.Header}</InputLabel>
                    <Select
                      name={col.accessor}
                      value={formData[col.accessor] || []}
                      onChange={handleInputChange}
                      label={col.Header}
                      multiple
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
                      {users.map((user) => (
                        <MenuItem key={user._id} value={user._id}>
                          {user.username}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                )
              } else if (col.accessor === 'groups') {
                return (
                  <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                    <InputLabel>{col.Header}</InputLabel>
                    <Select
                      name={col.accessor}
                      value={formData[col.accessor] || []}
                      onChange={handleInputChange}
                      label={col.Header}
                      multiple
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
                      {groups.map((group) => (
                        <MenuItem key={group._id} value={group._id}>
                          {group.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )
              } else if (col.accessor === 'Driver') {
                return (
                  <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                    <InputLabel>{col.Header}</InputLabel>
                    <Select
                      name={col.accessor}
                      value={formData[col.accessor] || []}
                      onChange={handleInputChange}
                      label={col.Header}
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
                      <MenuItem value="">select driver...</MenuItem>
                      {drivers.map((driver) => (
                        <MenuItem key={driver._id} value={driver._id}>
                          {driver.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )
              } else if (col.accessor === 'geofences') {
                return (
                  <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                    <InputLabel>{col.Header}</InputLabel>
                    <Select
                      name={col.accessor}
                      value={formData[col.accessor] || []}
                      onChange={handleInputChange}
                      label={col.Header}
                      multiple
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
                      {areas.map((geofence) => (
                        <MenuItem key={geofence._id} value={geofence._id}>
                          {geofence.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )
              } else if (col.accessor === 'model') {
                return (
                  <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                    <InputLabel>{col.Header}</InputLabel>
                    <Select
                      name={col.accessor}
                      value={formData[col.accessor] || []}
                      onChange={handleInputChange}
                      label={col.Header}
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
                      {models.map((model) => (
                        <MenuItem key={model} value={model.modelName}>
                          {model.modelName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )
              } else if (col.accessor === 'category') {
                return (
                  <FormControl fullWidth sx={{ marginBottom: 2 }} key={col.accessor}>
                    <InputLabel>{col.Header}</InputLabel>
                    <Select
                      name={col.accessor}
                      value={formData[col.accessor] || []}
                      onChange={handleInputChange}
                      label={col.Header}
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
                      {categories.map((category) => (
                        <MenuItem key={category} value={category.categoryName}>
                          {category.categoryName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )
              }
              return null
            })}

          {/* Step 3: Installation and Expiration Dates */}
          {
            // currentStep === 2 &&
            columns.map((col) => {
              if (col.accessor === 'installationdate') {
                return (
                  <div >
                    {/* <label>Installation date: </label> */}
                    <TextField
                      key={col.accessor}
                      name={col.accessor}
                      label="Installation Date"
                      value={formData[col.accessor] || ''}
                      onChange={handleInputChange}
                      fullWidth
                      disabled
                    />
                  </div>
                )
              } else if (col.accessor === 'expirationdate') {
                return (
                  <div >
                    <TextField
                      key={col.accessor}
                      name={col.accessor}
                      label="Expiration Date"
                      value={formData[col.accessor]}
                      onChange={handleInputChange}
                      fullWidth
                      disabled
                    />
                  </div>
                )
              } else if (col.accessor === 'extenddate') {
                return (


                  <FormControl fullWidth >
                    <InputLabel id="extend-plan-label">Extend Plan</InputLabel>
                    <Select
                      labelId="extend-plan-label"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'custom') {
                          setShowCustomDatePicker(true); // Show the date picker for custom date
                          setShowExpirationDropdown(false);
                        } else {
                          setShowCustomDatePicker(false);
                          handleExtendYearSelection(parseInt(value));
                          setShowExpirationDropdown(false);
                        }
                      }}
                      fullWidth
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
                )
              }
              return null
            })}

          {showCustomDatePicker && (
            <FormControl fullWidth >
              {/* <input
                          type="date"
                          fullWidth
                          value={customExtendDate}
                          onChange={(e) => {setCustomExtendDate(e.target.value); setExtendedPasswordModel(true)} }// Store the selected date temporarily
                        /> */}

              <TextField
                type="date"
                label="Select Custom Extended Date:"
                variant="outlined"
                InputLabelProps={{
                  shrink: true, // Ensures the label doesn't overlap with the date input
                }}
                value={customExtendDate}
                onChange={(e) => { setCustomExtendDate(e.target.value); setExtendedPasswordModel(true) }}// Store the selected date temporarily


                fullWidth

              >

              </TextField>
            </FormControl>
          )}

          {/* Navigation buttons */}
          {/* <div className="d-flex justify-content-between" style={{ marginTop: '20px' }}>
            {currentStep > 0 && (
              <Button onClick={handleBack} variant="outlined">
                Back
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} variant="contained" color="primary">
                Next
              </Button>
            ) : (
              <Button onClick={handleEditSubmit} variant="contained" color="primary">
                Submit
              </Button>
            )}
          </div> */}

        </div>
        <button onClick={handleEditSubmit} variant="contained" className="btn btn-secondary" color="primary" style={{ marginTop: '2rem', width: '6rem', marginLeft: 'auto' }}>
          Submit
        </button>

      </Box>
    </Modal>
  )
}

export default EditDeviceModal
