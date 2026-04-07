import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchBookings, deleteBooking } from '../../services/api.js';

const BookingList = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) {
      navigate('/');
    }
  }, [user, token, navigate]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchBookings(token);
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadBookings();
  }, [token]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await deleteBooking(bookingId, token);
      setBookings(bookings.filter((b) => b._id !== bookingId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p style={{ padding: '40px' }}>Loading your bookings...</p>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>My Bookings</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {bookings.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px', border: '2px dashed #ddd',
          borderRadius: '12px', backgroundColor: '#fafafa',
        }}>
          <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎟️</div>
          <h3 style={{ color: '#555' }}>No bookings yet.</h3>
          <p style={{ color: '#888', marginBottom: '20px' }}>
            You haven't reserved any tickets. Ready for a movie night?
          </p>
          <Link to="/dashboard" style={{
            padding: '12px 24px', backgroundColor: '#007bff', color: 'white',
            textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold',
          }}>
            Explore Movies
          </Link>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={thStyle}>Movie</th>
              <th style={thStyle}>Theater</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Seats</th>
              <th style={thStyle}>Total</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>
                  <strong>{booking.showtime?.movie?.title || 'N/A'}</strong>
                </td>
                <td style={tdStyle}>{booking.showtime?.theater?.name || 'N/A'}</td>
                <td style={tdStyle}>{booking.showtime?.showDate || 'N/A'}</td>
                <td style={tdStyle}>{booking.showtime?.showTime || 'N/A'}</td>
                <td style={tdStyle}>{booking.seats?.join(', ') || 'N/A'}</td>
                <td style={tdStyle}>${booking.totalPrice?.toFixed(2) || '0.00'}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button
                    onClick={() => handleCancel(booking._id)}
                    style={{
                      padding: '6px 14px', backgroundColor: '#dc3545', color: 'white',
                      border: 'none', borderRadius: '4px', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const thStyle = { padding: '12px', textAlign: 'left', fontSize: '14px' };
const tdStyle = { padding: '12px', fontSize: '14px' };

export default BookingList;