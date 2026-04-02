import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, you'd clear the user session here
    navigate('/');
  };

  return (
    <nav style={{
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '15px 40px', 
      backgroundColor: '#333', 
      color: 'white',
      alignItems: 'center'
    }}>
      {/* Clicking the Logo should also take you to the Dashboard if logged in */}
      <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
        🎬 MoviePass
      </Link>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
        
        {/* We keep Register here for now, but ensure Register.js has a way back to Login! */}
        <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>        
        
        <button 
          onClick={handleLogout}
          style={{ 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            padding: '5px 15px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold' 
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;