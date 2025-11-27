import React from 'react'
import './HomeScreen.css'
import QuickBooking from './QuickBooking/QuickBooking'
import HomeScreenHeader from '../../component/HomeScreenHeader/HomeScreenHeader'
import HomeScreenFooter from '../../component/HomeScreenFooter/HomeScreenFooter'
const HomeScreen = ({ user, onLogout }) => {
  return (
    <div className="HomeScreen">
      <HomeScreenHeader user={user} onLogout={onLogout} />
      <QuickBooking />
      <HomeScreenFooter />
    </div>
  )
}

export default HomeScreen
