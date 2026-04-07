import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '15px 40px',
      backgroundColor: '#333',
      color: 'white',
      alignItems: 'center',
    }}>
      <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
        🎬 MoviePass
      </Link>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/dashboard" style={linkStyle}>Movies</Link>
            <Link to="/my-bookings" style={linkStyle}>My Bookings</Link>

            {/* Admin-only link */}
            {user.role === 'admin' && (
              <Link to="/admin" style={{ color: 'gold', textDecoration: 'none', fontWeight: 'bold' }}>
                Admin Panel
              </Link>
            )}

            <span style={{ color: '#aaa', fontSize: '14px' }}>{user.username}</span>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '5px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const linkStyle = { color: 'white', textDecoration: 'none' };

export default Navbar;
