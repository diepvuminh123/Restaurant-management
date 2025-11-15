import React from 'react'
import LoginForm from '../../component/LoginForm/LoginForm'
import './LoginScreen.css'
import WelcomeBoard from '../../component/WelcomeBoard/WelcomeBoard'
export default function LoginScreen() {
  return(
    <div className="loginScreen">
      <div className="loginContainer">
        <LoginForm />
      </div>
      <WelcomeBoard />
      
    </div>
  )
}