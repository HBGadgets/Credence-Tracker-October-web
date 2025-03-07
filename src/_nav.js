// ################################### NEW CODE CHANGE FOR SIDEBAR ################################################//

import React, { useEffect, useState } from 'react'
import { IoLocationOutline } from 'react-icons/io5'
import { BsFillSignStopFill, BsWindowFullscreen } from 'react-icons/bs'
import { BsChatDots } from 'react-icons/bs'
import { FaAddressCard, FaCar, FaHistory, FaRegEdit, FaRoute, FaStopwatch, FaUserAlt } from 'react-icons/fa'
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia'
import { TbReport } from 'react-icons/tb'
import { BiLogOutCircle } from 'react-icons/bi'
import { FaCarOn, FaUserGroup } from 'react-icons/fa6'
import { GrHostMaintenance, GrUserWorker } from 'react-icons/gr'
import { IoMdNotifications } from 'react-icons/io'
import { MdEventNote, MdOutlineCategory, MdOutlineSpaceDashboard, MdSensors } from 'react-icons/md'
import { TbCategory } from 'react-icons/tb'
import { GiPathDistance } from 'react-icons/gi'
import { TbReportAnalytics } from 'react-icons/tb'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { RiPinDistanceFill } from 'react-icons/ri'
import { PiMapPinAreaFill } from 'react-icons/pi'
import { BiSupport } from 'react-icons/bi'
import { TicketCheck } from 'lucide-react'
import { icon } from 'leaflet'

const _nav = (role, decodedToken) => {
  let devices,
    users,
    driver,
    groups,
    geofence,
    notification,
    maintenance,
    category,
    model,
    status,
    distance,
    history,
    stop,
    travel,
    idle,
    trips,
    sensor,
    alerts,
    // vehicle,
    geofenceReport
  console.log(decodedToken)

  if (role != 'superadmin') {
    ; ({
      devices,
      users,
      driver,
      groups,
      geofence,
      notification,
      maintenance,
      category,
      model,
      status,
      distance,
      history,
      stop,
      travel,
      trips,
      idle,
      // sensor,
      alerts,
      // vehicle,
      geofenceReport,
    } = decodedToken.user)
  }

  return [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: (
        <div style={{ display: 'flex', alignItems: 'center' }} title="Dashboard">
          <MdOutlineSpaceDashboard
            color="#FFFFFF"
            style={{ marginRight: '15px', fontSize: '30px' }}
          />
        </div>
      ),
    },
    ...(role == 'superadmin'
      ? [
        {
          component: CNavTitle,
          name: 'All Menu',
        },
        {
          component: CNavGroup,
          name: 'Master',

          icon: (
            <div style={{ display: 'flex', alignItems: 'center' }} title="Master">
              <FaAddressCard
                color="#FFFFFF"
                style={{ marginRight: '15px', fontSize: '27px' }}
              />
            </div>
          ),

          items: [
            {
              component: CNavItem,
              name: 'Vehicles',

              to: '/devices',
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaCar style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Users',

              to: '/users',
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaUserAlt style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Group',

              to: '/group',
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaUserGroup style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Geofences',
              to: '/geofences',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PiMapPinAreaFill style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Driver',
              to: '/driver',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <GrUserWorker style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Notifications',
              to: '/notifications',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IoMdNotifications style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Maintenance',
              to: '/maintenance',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <GrHostMaintenance style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Category',
              to: '/category',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <MdOutlineCategory style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Model',
              to: '/model',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TbCategory style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            // {
            //   component: CNavItem,
            //   name: 'Answer Ticket',
            //   to: '/answer-ticket',
            //   icon: (
            //     <div style={{ display: 'flex', alignItems: 'center' }}>
            //       <TicketCheck style={{ marginRight: '15px', fontSize: '25px' }} />
            //     </div>
            //   ),
            // },
          ],
        },
        {
          component: CNavGroup,
          name: 'Report',

          icon: (
            <div style={{ display: 'flex', alignItems: 'center' }} title="Reports">
              <TbReport color="#FFFFFF" style={{ marginRight: '15px', fontSize: '30px' }} />
            </div>
          ),
          items: [
            {
              component: CNavItem,
              name: 'Status Reports',
              to: '/statusreports',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TbReportAnalytics style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Distance Reports',
              to: '/distancereports',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <GiPathDistance style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'History',
              to: '/history',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaHistory style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Stops',
              to: '/stops',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <BsFillSignStopFill style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Travel Summary',
              to: '/travelsreport',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaRoute style={{ marginRight: '15px', fontSize: '25px' }} />
                </div >
              ),
            },
            {
              component: CNavItem,
              name: 'Trips Report',
              to: '/tripsreport',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <RiPinDistanceFill style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Idle Report',
              to: '/idlereport',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaStopwatch style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            // {
            //   component: CNavItem,
            //   name: 'Sensor Reports',
            //   to: '/sensorreports',

            //   icon: (
            //     <div style={{ display: 'flex', alignItems: 'center' }}>
            //       <MdSensors style={{ marginRight: '15px', fontSize: '25px' }} />
            //     </div>
            //   ),
            // },
            {
              component: CNavItem,
              name: 'Alerts/Events',
              to: '/alerts-events',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <MdEventNote style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            // {
            //   component: CNavItem,
            //   name: 'Vehicle Reports',
            //   to: '/vehiclereport',

            //   icon: (
            //     <div style={{ display: 'flex', alignItems: 'center' }}>
            //       <FaCarOn style={{ marginRight: '15px', fontSize: '25px' }} />
            //     </div>
            //   ),
            // },
            {
              component: CNavItem,
              name: 'Geofence Report',
              to: '/geofencereport',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PiMapPinAreaFill style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
          ],
        },
        {
          component: CNavGroup,
          name: 'Supports',

          icon: (
            <div style={{ display: 'flex', alignItems: 'center' }} title="Expense Management">
              <BiSupport color="#FFFFF" style={{ marginRight: '15px', fontSize: '30px' }} />
            </div>
          ),
          items: [
            // { component: CNavItem, name: 'Invoice', to: '/invoice' },
            // { component: CNavItem, name: 'PO', to: '/po' },
            // { component: CNavItem, name: 'Inventory', to: '/inventory-management' },
            {
              component: CNavItem,
              name: 'Raise Ticket',
              to: '/raise-ticket',
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TicketCheck style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            {
              component: CNavItem,
              name: 'Answered Ticket',
              to: '/answer-ticket',
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TicketCheck style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
          ],
        },
      ]
      : [
        {
          component: CNavTitle,
          name: 'All Menu',
        },
        (devices || users || groups || geofence || driver || notification || maintenance) && {
          component: CNavGroup,
          name: 'Master',
          visible: true, // This can be a boolean or controlled by a state.
          icon: (
            <div
              style={{ display: 'flex', alignItems: 'center', color: '#FFFFF' }}
              title="Master"
            >
              <LiaFileInvoiceDollarSolid style={{ marginRight: '15px', fontSize: '30px' }} />
            </div>
          ),
          items: [
            devices && {
              component: CNavItem,
              name: 'Vehicles',
              to: '/devices',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaCar style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            users && {
              component: CNavItem,
              name: 'Users',
              to: '/users',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaUserAlt style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            groups && {
              component: CNavItem,
              name: 'Group',
              to: '/group',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaUserGroup style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            geofence && {
              component: CNavItem,
              name: 'Geofences',
              to: '/geofences',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PiMapPinAreaFill style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            driver && {
              component: CNavItem,
              name: 'Driver',
              to: '/driver',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <GrUserWorker style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            notification && {
              component: CNavItem,
              name: 'Notifications',
              to: '/notifications',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IoMdNotifications style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            maintenance && {
              component: CNavItem,
              name: 'Maintenance',
              to: '/maintenance',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <GrHostMaintenance style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
          ].filter(Boolean),
        },
        (status ||
          distance ||
          history ||
          stop ||
          travel ||
          idle ||
          trips ||
          alerts ||
          dayreport ||
          vehicle ||
          geofenceReport) && {
          component: CNavGroup,
          name: 'Report',
          visible: true, // This can be a boolean or controlled by a state.
          icon: (
            <div
              style={{ display: 'flex', alignItems: 'center', color: '#FFFFF' }}
              title="Report"
            >
              <TbReport style={{ marginRight: '15px', fontSize: '30px' }} />
            </div>
          ),
          items: [
            status && {
              component: CNavItem,
              name: 'Status Reports',
              to: '/statusreports',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TbReportAnalytics style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            distance && {
              component: CNavItem,
              name: 'Distance Reports',
              to: '/distancereports',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <GiPathDistance style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            history && {
              component: CNavItem,
              name: 'History',
              to: '/history',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaHistory style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            stop && {
              component: CNavItem,
              name: 'Stops',
              to: '/stops',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <BsFillSignStopFill style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            travel && {
              component: CNavItem,
              name: 'Travels Summary',
              to: '/travelsreport',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <RiPinDistanceFill style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            trips && {
              component: CNavItem,
              name: 'Trips Report',
              to: '/tripsreport',

              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <RiPinDistanceFill style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            idle && {
              component: CNavItem,
              name: 'Idle Report',
              to: '/idlereport',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaStopwatch style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            alerts && {
              component: CNavItem,
              name: 'Alerts/Events',
              to: '/alerts-events',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <MdEventNote style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
            geofenceReport && {
              component: CNavItem,
              name: 'Geofence Report',
              to: '/geofencereport',
              visible: true, // This can be a boolean or controlled by a state.
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PiMapPinAreaFill style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
          ].filter(Boolean),
        },
        {
          component: CNavGroup,
          name: 'Supports',
          visible: true, // This can be a boolean or controlled by a state.
          icon: (
            <div
              style={{ display: 'flex', alignItems: 'center', color: '#FFFFF' }}
              title="Expense Management"
            >
              <BiSupport style={{ marginRight: '15px', fontSize: '30px' }} />
            </div>
          ),
          items: [
            {
              component: CNavItem,
              name: 'Raise Ticket',
              to: '/raise-ticket',
              icon: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TicketCheck style={{ marginRight: '15px', fontSize: '25px' }} />
                </div>
              ),
            },
          ],
        },
      ].filter(Boolean)),
    // {
    //   component: CNavItem,
    //   name: 'Chat Bot',
    //   to: '/chatbot',
    //   icon: (
    //     <div style={{ display: 'flex', alignItems: 'center', color: '#FFFFF' }}>
    //       <BsChatDots color="#FFFFF" style={{ marginRight: '15px', fontSize: '30px' }} />
    //     </div>
    //   ),
    // },
    // {
    //   component: CNavItem,
    //   name: 'Help & Support',
    //   to: '/h&s',
    //   icon: (
    //     <div style={{ display: 'flex', alignItems: 'center', color: '#FF7A00' }}>
    //       <BiSupport color="#FF7A00" style={{ marginRight: '15px', fontSize: '30px' }} />
    //     </div>
    //   ),
    // },
  ]
}

export default _nav
