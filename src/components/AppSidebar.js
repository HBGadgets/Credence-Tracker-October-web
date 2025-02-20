import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CHeaderToggler,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import logo from 'src/assets/brand/logo.png'
import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config
import navigation from '../_nav'

// auth purpose
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import { cilDelete, cilMenu } from '@coreui/icons'

// const getUserRole = () => {
//   const navigate = useNavigate()
//   const token = Cookies.get('authToken');
//   let role;

//   if (token) {
//     console.log("token hai yaha")
//     const decodedToken = jwtDecode(token);
//     if(decodedToken.superadmin == true){
//       role ='superadmin';
//     }else{
//       role = "user";
//     }
//   }else{
//     navigate('/login');
//   }

//   return role; // Default role if no token
// };

const getUserRole = (token) => {
  if (token) {
    const decodedToken = jwtDecode(token)
    return decodedToken.superadmin ? 'superadmin' : 'user'
  }
  return null // No token means no role
}

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebar.sidebarShow)

  const navigate = useNavigate()

  const [decodedToken, setDecodedToken] = useState(null)
  const [navigatingNav, setNavigatingNav] = useState(null)
  const token = Cookies.get('authToken')

  const toggle = useSelector((state) => state.navbar)

  useEffect(() => {
    if (!token) {
      navigate('/login')
    } else {
      const decoded = jwtDecode(token)
      setDecodedToken(decoded)

      const role = getUserRole(token)
      if (role) {
        setNavigatingNav(navigation(role, decoded))
      }
    }
  }, [token, navigate])

  return (
    <CSidebar
      className="border-end"
      // style={{marginTop:"5%"}}
      style={{ backgroundColor: '#0a2d63' }}
      fontcolor="rgb(0,0,0)"
      colorScheme="dark"
      position="fixed"
      unfoldable={sidebarShow}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="borderless-bottom">
        <CSidebarBrand to="/dashboard">
          <img src={logo} alt="Logo" className="sidebar-brand-full" height={50} width={200} />

          {/* <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} /> */}
          <img src={logo} alt="Logo" className="sidebar-brand-narrow" height={25} width={60} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      {navigatingNav && <AppSidebarNav items={navigatingNav} />}
      <CSidebarFooter className="border-top d-none d-lg-flex">
        {/* <CTooltip content="Close">
          <CSidebarToggler
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
            // onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
          />
        </CTooltip> */}

        {/* <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          // style={{ marginInlineStart: '200px' }}
        >
          <CIcon icon={cilDelete} size="xl" />
        </CHeaderToggler> */}
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
