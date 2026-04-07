import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  fetchMovies,
} from '../../services/api.js';
import {
  fetchTheaters,
  fetchShowtimes,
  createShowtime,
  updateShowtime,
  deleteShowtime,
} from '../../services/api.js';

const ShowtimeManager = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    movie: '',
    theater: '',
    showDate: '',
    showTime: '',
    price: '10',
  });
  const [editingId, setEditingId] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (!user || !token) {
      navigate('/');
    } else if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, token, navigate]);

  // Load movies, theaters, and existing showtimes
  useEffect(() => {
    const loadData = async () => {
      try {
        const [movieData, theaterData, showtimeData] = await Promise.all([
          fetchMovies(),
          fetchTheaters(token),
          fetchShowtimes(token),
        ]);
        setMovies(movieData);
        setTheaters(theaterData);
        setShowtimes(showtimeData);
      } catch (err) {
        setError(err.message);
      }
    };
    if (token) loadData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      movie: formData.movie,
      theater: formData.theater,
      showDate: formData.showDate,
      showTime: formData.showTime,
      price: Number(formData.price),
    };

    try {
      if (editingId) {
        await updateShowtime(editingId, payload, token);
        setEditingId(null);
      } else {
        await createShowtime(payload, token);
      }
      // Refresh list
      const data = await fetchShowtimes(token);
      setShowtimes(data);
      setFormData({ movie: '', theater: '', showDate: '', showTime: '', price: '10' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (st) => {
    setEditingId(st._id);
    setFormData({
      movie: st.movie?._id || '',
      theater: st.theater?._id || '',
      showDate: st.showDate || '',
      showTime: st.showTime || '',
      price: st.price || 10,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this showtime?')) return;
    try {
      await deleteShowtime(id, token);
      setShowtimes(showtimes.filter((st) => st._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ movie: '', theater: '', showDate: '', showTime: '', price: '10' });
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Schedule a Showtime</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{
        display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px', alignItems: 'flex-end',
      }}>
        <div>
          <label style={labelStyle}>Movie</label>
          <select
            required
            value={formData.movie}
            onChange={(e) => setFormData({ ...formData, movie: e.target.value })}
            style={{ padding: '8px', minWidth: '180px' }}
          >
            <option value="">-- Choose Movie --</option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>{m.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Theater</label>
          <select
            required
            value={formData.theater}
            onChange={(e) => setFormData({ ...formData, theater: e.target.value })}
            style={{ padding: '8px', minWidth: '160px' }}
          >
            <option value="">-- Choose Theater --</option>
            {theaters.map((t) => (
              <option key={t._id} value={t._id}>{t.name} ({t.totalSeats} seats)</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            required
            value={formData.showDate}
            onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
            style={{ padding: '8px' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Time</label>
          <input
            type="text"
            required
            placeholder="e.g. 7:00 PM"
            value={formData.showTime}
            onChange={(e) => setFormData({ ...formData, showTime: e.target.value })}
            style={{ padding: '8px', width: '120px' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Price ($)</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            style={{ padding: '8px', width: '80px' }}
          />
        </div>

        <button type="submit" style={{
          padding: '8px 20px', backgroundColor: editingId ? '#ffc107' : '#28a745',
          color: editingId ? 'black' : 'white', border: 'none', borderRadius: '4px',
          cursor: 'pointer', fontWeight: 'bold', height: '38px',
        }}>
          {editingId ? 'Update' : 'Create'}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancel} style={{
            padding: '8px 20px', backgroundColor: '#6c757d', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer', height: '38px',
          }}>
            Cancel
          </button>
        )}
      </form>

      {/* Existing Showtimes */}
      <h3>Existing Showtimes</h3>
      {showtimes.length === 0 ? (
        <p style={{ color: '#888' }}>No showtimes scheduled yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={thStyle}>Movie</th>
              <th style={thStyle}>Theater</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Seats Left</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map((st) => (
              <tr key={st._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{st.movie?.title || 'N/A'}</td>
                <td style={tdStyle}>{st.theater?.name || 'N/A'}</td>
                <td style={tdStyle}>{st.showDate}</td>
                <td style={tdStyle}>{st.showTime}</td>
                <td style={tdStyle}>${st.price}</td>
                <td style={tdStyle}>{st.availableSeats}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button onClick={() => handleEdit(st)} style={{
                    marginRight: '8px', padding: '4px 10px', backgroundColor: '#ffc107',
                    border: 'none', borderRadius: '4px', cursor: 'pointer',
                  }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(st._id)} style={{
                    padding: '4px 10px', backgroundColor: '#dc3545', color: 'white',
                    border: 'none', borderRadius: '4px', cursor: 'pointer',
                  }}>
                    Delete
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

const labelStyle = { display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: 'bold' };
const thStyle = { padding: '10px', textAlign: 'left', fontSize: '14px' };
const tdStyle = { padding: '10px', fontSize: '14px' };

export default ShowtimeManager;