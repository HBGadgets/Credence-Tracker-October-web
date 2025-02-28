import React, { useState } from "react";
import { Box, Tabs, Tab, Modal, Button, TextField, Typography, IconButton } from "@mui/material";
import AllUser from "./allforms/AllUser";
import AllGroups from "./allforms/AllGroups";
import AllDriver from "./allforms/AllDriver";
import AddDeviceForm from "../devices/AddDeviceForm";
import AllDevice1 from "./allforms/AllDevice1";
import GroupIcon from '@mui/icons-material/Group';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CloseIcon from '@mui/icons-material/Close'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUserPoliceTie } from '@fortawesome/sharp-regular-svg-icons'; // Ensure this matches the icon set you need



function AllInOneForm({ open, handleClose, setOpen,
  style,
  token,
  fetchData,
  currentStep,
  steps,
  columns,
  formData,
  setFormData,
  users,
  groups,
  drivers,
  areas,
  models,
  categories,
  handleInputChange,
  handleNext,
  handleBack,
  handleYearSelection,
  setShowExpirationDropdown,

}) {
  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleNextStep = () => {
    setActiveTab((prevTab) => prevTab + 1);
  };
  const handleSkip = () => {
    setActiveTab((prevTab) => prevTab + 1);
  };

  const tabsStyling = {
    mb: 6,
    height: '48px',
    backgroundColor: 'grey',

    '& .MuiTab-root': {
      color: 'black',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      '&:hover': {
        color: 'black',
        backgroundColor: '#e0e0e0',
      },
      '&.Mui-selected': {
        color: 'white',
      },
    },
    '& .Mui-selected': {
      backgroundColor: '#00000066',
      fontWeight: 'bold',
    },
    '.MuiTabs-indicator': {
      backgroundColor: 'red', // Active tab underline color
      height: '4px', // Thickness of the indicator
    },
  };

  return (
    <Modal open={open} onClose={handleClose}  >
      <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: '72%', height: '94vh', bgcolor: "background.paper", borderRadius: 2, boxShadow: 24, p: 3, overflowY: 'auto', }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}><Typography variant="h6" gutterBottom style={{ textAlign: 'center' }}>

        </Typography>
          <IconButton onClick={handleClose} style={{ marginLeft: 'auto' }}>
            <CloseIcon />
          </IconButton>
        </div>


        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          //className="btn-secondary"
          sx={tabsStyling}
        >
          <Tab label="Groups" style={{ height: '100%', }} />
          <Tab label="Users" style={{ height: '100%', }}
          // icon={<FontAwesomeIcon icon="fa-sharp fa-regular fa-user-police-tie" />}
          />
          <Tab label="Vehicle" style={{ height: '100%', }} />
          <Tab label="Driver" style={{ height: '100%', }} />
        </Tabs>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <GroupForm handleSkip={handleSkip} handleNextStep={handleNextStep} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <UserForm handleSkip={handleSkip} handleNextStep={handleNextStep} />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <AllDevice1 handleSkip={handleSkip} handleNextStep={handleNextStep}
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
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <DriverForm handleSkip={handleSkip} handleNextStep={handleNextStep} handleClose={handleClose} />
        </TabPanel>


      </Box>
    </Modal>
  );
}

// TabPanel Component
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// Forms
const UserForm = ({ handleSkip, handleNextStep }) => (
  <AllUser handleSkip={handleSkip} handleNextStep={handleNextStep} />
);

const GroupForm = ({ handleSkip, handleNextStep }) => (
  <AllGroups handleSkip={handleSkip} handleNextStep={handleNextStep} />
);

const DeviceForm = ({ handleSkip, handleNextStep }) => (
  <AllDevice handleSkip={handleSkip} handleNextStep={handleNextStep} />
);

const DriverForm = ({ handleClose }) => (
  <AllDriver handleClose={handleClose} />
);

export default AllInOneForm;
