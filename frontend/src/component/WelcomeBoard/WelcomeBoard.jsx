import React from 'react'
import { PICTURES } from '../../constants/asset/picture'
import { ICONS } from '../../constants/asset/icon'

export default function WelcomeBoard() {
  return (
    <div className="welcomeBoard">
      <img src={PICTURES.RESTAURANT} alt="Welcome" />
      <div className="introduction">
      <h1>Chào mừng đến với nền tảng nhà hàng của chúng tôi</h1>
      <h2><img src={ICONS.TICK} alt="Tick" />Đặt bàn trực tuyến nhanh chóng và dễ dàng</h2>
      <h2><img src={ICONS.TICK} alt="Tick" />Xem thực đơn và đặt món trước</h2>
      <h2><img src={ICONS.TICK} alt="Tick" />Tích điểm thưởng và nhận ưu đãi đặc biệt</h2>
      <h2><img src={ICONS.TICK} alt="Tick" />Theo dõi lịch sử đơn hàng và đánh giá</h2>
      </div>
    </div>
  )
}
