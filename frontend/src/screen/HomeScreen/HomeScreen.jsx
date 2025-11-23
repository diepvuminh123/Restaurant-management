import React from 'react'
import './HomeScreen.css'
import QuickBooking from './QuickBooking/QuickBooking'
import HomeScreenHeader from '../../component/HomeScreenHeader/HomeScreenHeader'
import HomeScreenFooter from '../../component/HomeScreenFooter/HomeScreenFooter'
const HomeScreen = () => {
  return (
    <div className="HomeScreen">
      <HomeScreenHeader />
      <QuickBooking />
      <HomeScreenFooter />
    </div>
  )
}

export default HomeScreen
