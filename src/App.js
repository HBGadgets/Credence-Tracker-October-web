import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { Provider, useSelector, useDispatch } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import Loader from './components/Loader/Loader'
import RaiseTicket from './views/forms/help-support/RaiseTicket'
import SharedLiveTrack from './views/pages/Live/SharedLiveTrack'
const HelpSupp = React.lazy(() => import('./views/forms/help-support/HelpSupp'))
const GettingStarted = React.lazy(
  () => import('./components/articles/gettingStarted/GettingStarted'),
)
const GettingStartedForAcc = React.lazy(
  () => import('./components/articles/gettingStarted/GettingStartedForAcc'),
)
const GettingStartedForUser = React.lazy(
  () => import('./components/articles/gettingStarted/GettindStartedForUser'),
)
const TheBasicsOfCredence = React.lazy(
  () => import('./components/articles/gettingStarted/TheBasicsOfCredence'),
)
const NavigatingCredence = React.lazy(
  () => import('./components/articles/artcle/NavigatingCredence'),
)

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[0])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[1]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // device data load when app is loaded

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-5 text-center">
            <Loader />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route path="*" name="Home" element={<DefaultLayout />} />
          <Route path="/HelpSupp" element={<HelpSupp />} />
          <Route path="/HelpSupp/Getting-started" element={<GettingStarted />} />
          <Route
            path="/HelpSupp/Getting-started/For-Accounts-Admins"
            element={<GettingStartedForAcc />}
          />
          <Route path="/HelpSupp/Getting-started/For-User" element={<GettingStartedForUser />} />
          <Route path="/HelpSupp/The-Basics-Of-Credence" element={<TheBasicsOfCredence />} />
          <Route path="/HelpSupp/Navigating-Credence" element={<NavigatingCredence />} />
          <Route path="/HelpSupp/Raise-Ticket" element={<RaiseTicket />} />
          <Route path="/shared/live-track/token/:token" element={<SharedLiveTrack />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
