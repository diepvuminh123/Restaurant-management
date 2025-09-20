import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Restaurant Management System</h1>
        <p>Tét render ạ hihi </p>
        <div className="menu-sections">
          <div className="section">
            <h2>Minh Vũ </h2>
            <p>Manage your restaurant menu items</p>
          </div>
          <div className="section">
            <h2>Huân Minh</h2>
            <p>Track and manage customer orders</p>
          </div>
          <div className="section">
            <h2>Quang Ngô</h2>
            <p>Manage table reservations and availability</p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
