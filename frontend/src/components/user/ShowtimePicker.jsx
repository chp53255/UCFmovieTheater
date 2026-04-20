import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  fetchShowtimesByMovie,
  createBooking,
} from '../../services/api.js';

const ShowtimePicker = () => {
  const { id } = useParams(); // Movie ID from URL
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Track selected seats per showtime
  const [selectedSeats, setSelectedSeats] = useState({});

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) {
      navigate('/');
    }
  }, [user, token, navigate]);

  useEffect(() => {
    const loadShowtimes = async () => {
      try {
        const data = await fetchShowtimesByMovie(id, token);
        setShowtimes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadShowtimes();
  }, [id, token]);

  // Generate seat labels like A1, A2, ... B1, B2, etc.
  const generateSeatLabels = (total) => {
    const seats = [];
    const rows = 'ABCDEFGHIJ';
    const seatsPerRow = 10;
    for (let i = 0; i < total && i < rows.length * seatsPerRow; i++) {
      const row = rows[Math.floor(i / seatsPerRow)];
      const num = (i % seatsPerRow) + 1;
      seats.push(`${row}${num}`);
    }
    return seats;
  };

  const toggleSeat = (showtimeId, seat) => {
    setSelectedSeats((prev) => {
      const current = prev[showtimeId] || [];
      if (current.includes(seat)) {
        return { ...prev, [showtimeId]: current.filter((s) => s !== seat) };
      }
      return { ...prev, [showtimeId]: [...current, seat] };
    });
  };

  const handleBook = async (showtimeId) => {
    const seats = selectedSeats[showtimeId] || [];
    if (seats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    try {
      await createBooking({ showtime: showtimeId, seats }, token);
      alert('Booking confirmed!');
      navigate('/my-bookings');
    } catch (err) {
      alert(err.message || 'Booking failed.');
    }
  };

  if (loading) return <p style={{ padding: '40px' }}>Loading showtimes...</p>;

  // Get movie title from the first showtime's populated movie
  const movieTitle = showtimes.length > 0 ? showtimes[0].movie?.title : 'Movie';

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Book Tickets for {movieTitle}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {showtimes.length === 0 ? (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px' }}>
          <p>No showtimes available for this movie yet. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
          {showtimes.map((st) => {
            const chosen = selectedSeats[st._id] || [];
            return (
              <div key={st._id} style={showtimeCardStyle}>
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ margin: '0 0 4px 0' }}>{st.theater?.name || 'Unknown Theater'}</h3>
                  <p style={{ color: '#666', margin: '0' }}>
                    {st.showDate} at {st.showTime} — ${st.price}/ticket
                  </p>
                  <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0 0' }}>
                    {st.availableSeats} seats available
                  </p>
                </div>

                {/* Simple seat count selector for quick booking */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    Seats selected: {chosen.length}
                    {chosen.length > 0 && (
                      <span style={{ fontWeight: 'normal', color: '#666' }}>
                        {' '}({chosen.join(', ')}) — Total: ${(chosen.length * st.price).toFixed(2)}
                      </span>
                    )}
                  </label>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px', maxWidth: '400px',
                  }}>
                    {generateSeatLabels(Math.min(st.theater?.totalSeats || 50, 100)).map((seat) => (
                      <button
                        key={seat}
                        type="button"
                        onClick={() => toggleSeat(st._id, seat)}
                        style={{
                          width: '36px', height: '28px', fontSize: '11px',
                          border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer',
                          backgroundColor: chosen.includes(seat) ? '#2ecc71' : '#f8f9fa',
                          color: chosen.includes(seat) ? 'white' : '#333',
                        }}
                      >
                        {seat}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleBook(st._id)}
                  disabled={chosen.length === 0}
                  style={{
                    ...bookButtonStyle,
                    opacity: chosen.length === 0 ? 0.5 : 1,
                    cursor: chosen.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Confirm & Book {chosen.length > 0 ? `(${chosen.length} seat${chosen.length > 1 ? 's' : ''})` : ''}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const showtimeCardStyle = {
  padding: '20px',
  border: '1px solid #eee',
  borderRadius: '10px',
  backgroundColor: '#fff',
  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
};

const bookButtonStyle = {
  padding: '10px 24px',
  backgroundColor: '#2ecc71',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontWeight: 'bold',
  fontSize: '14px',
};

export default ShowtimePicker;
