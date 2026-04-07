import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  fetchTheaters,
  createTheater,
  updateTheater,
  deleteTheater,
} from '../../services/api.js';

const TheaterManager = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [theaters, setTheaters] = useState([]);
  const [formData, setFormData] = useState({ name: '', totalSeats: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!user || !token) {
      navigate('/');
    } else if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, token, navigate]);

  // Load theaters
  useEffect(() => {
    const loadTheaters = async () => {
      try {
        const data = await fetchTheaters(token);
        setTheaters(data);
      } catch (err) {
        setError(err.message);
      }
    };
    if (token) loadTheaters();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: formData.name,
      totalSeats: Number(formData.totalSeats),
    };

    try {
      if (editingId) {
        await updateTheater(editingId, payload, token);
        setEditingId(null);
      } else {
        await createTheater(payload, token);
      }
      // Refresh list
      const data = await fetchTheaters(token);
      setTheaters(data);
      setFormData({ name: '', totalSeats: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (theater) => {
    setEditingId(theater._id);
    setFormData({ name: theater.name, totalSeats: theater.totalSeats });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this theater?')) return;
    try {
      await deleteTheater(id, token);
      setTheaters(theaters.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', totalSeats: '' });
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Manage Theaters</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap', alignItems: 'flex-end',
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Theater Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Theater A"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ padding: '8px', width: '200px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Total Seats</label>
          <input
            type="number"
            required
            min="1"
            placeholder="e.g. 100"
            value={formData.totalSeats}
            onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
            style={{ padding: '8px', width: '120px' }}
          />
        </div>
        <button type="submit" style={{
          padding: '8px 20px', backgroundColor: editingId ? '#ffc107' : '#28a745',
          color: editingId ? 'black' : 'white', border: 'none', borderRadius: '4px',
          cursor: 'pointer', fontWeight: 'bold', height: '38px',
        }}>
          {editingId ? 'Update' : 'Add Theater'}
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

      {/* Theater List */}
      {theaters.length === 0 ? (
        <p style={{ color: '#888' }}>No theaters yet. Add one above.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Total Seats</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {theaters.map((theater) => (
              <tr key={theater._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{theater.name}</td>
                <td style={{ padding: '12px' }}>{theater.totalSeats}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(theater)} style={{
                    marginRight: '8px', padding: '5px 12px', backgroundColor: '#ffc107',
                    border: 'none', borderRadius: '4px', cursor: 'pointer',
                  }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(theater._id)} style={{
                    padding: '5px 12px', backgroundColor: '#dc3545', color: 'white',
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

export default TheaterManager;