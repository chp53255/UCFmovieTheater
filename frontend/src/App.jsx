import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

import TheaterManager from './components/admin/TheaterManager.jsx';
import ShowtimeManager from './components/admin/ShowtimeManager.jsx';
import BookingList from './components/user/BookingList.jsx';
import ShowtimePicker from './components/user/ShowtimePicker.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/theaters" element={<TheaterManager />} />
          <Route path="/admin/showtimes" element={<ShowtimeManager />} />

          {/* User */}
          <Route path="/my-bookings" element={<BookingList />} />
          <Route path="/movie/:id/showtimes" element={<ShowtimePicker />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
