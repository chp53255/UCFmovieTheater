import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user || !token) {
      navigate('/');
    } else if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, token, navigate]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Admin Control Panel</h1>
      <p>Select an option below to manage the cinema.</p>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '30px',
        flexWrap: 'wrap',
      }}>
        <div style={cardStyle}>
          <h3>Theaters</h3>
          <p>Add, edit, or remove cinema screens.</p>
          <Link to="/admin/theaters" style={buttonStyle}>Manage Theaters</Link>
        </div>

        <div style={cardStyle}>
          <h3>Showtimes</h3>
          <p>Assign movies to theaters and schedule times.</p>
          <Link to="/admin/showtimes" style={buttonStyle}>Manage Showtimes</Link>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  border: '1px solid #ddd',
  padding: '20px',
  borderRadius: '8px',
  width: '250px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
};

const buttonStyle = {
  display: 'inline-block',
  marginTop: '10px',
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '4px',
};

export default AdminDashboard;