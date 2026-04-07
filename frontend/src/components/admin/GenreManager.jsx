import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchGenres, createGenre, deleteGenre } from '../../services/api.js';

const GenreManager = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [genres, setGenres] = useState([]);
  const [newGenreName, setNewGenreName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!user || !token) {
      navigate('/');
    } else if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, token, navigate]);

  // Load genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await fetchGenres();
        setGenres(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadGenres();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = newGenreName.trim();
    if (!trimmed) return;

    // Prevent duplicate names client-side (backend enforces it too via unique index)
    const alreadyExists = genres.some(
      (g) => g.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyExists) {
      setError(`"${trimmed}" already exists.`);
      return;
    }

    try {
      const created = await createGenre({ name: trimmed }, token);
      setGenres((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewGenreName('');
      setSuccess(`Genre "${created.name}" added.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete genre "${name}"? This will remove it from all movies.`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteGenre(id, token);
      setGenres((prev) => prev.filter((g) => g._id !== id));
      setSuccess(`Genre "${name}" deleted.`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user || user.role !== 'admin') return null;
  if (loading) return <p style={{ padding: '40px' }}>Loading genres...</p>;

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Manage Genres</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Genres are used to tag movies. Each movie can have multiple genres (many-to-many).
      </p>

      {error && (
        <p style={{ color: '#dc3545', backgroundColor: '#ffeaea', padding: '10px', borderRadius: '4px' }}>
          {error}
        </p>
      )}
      {success && (
        <p style={{ color: '#28a745', backgroundColor: '#eaffea', padding: '10px', borderRadius: '4px' }}>
          {success}
        </p>
      )}

      {/* Add Genre Form */}
      <form
        onSubmit={handleCreate}
        style={{ display: 'flex', gap: '10px', marginBottom: '30px', alignItems: 'flex-end' }}
      >
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            New Genre Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Sci-Fi"
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            style={{ padding: '8px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '8px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            height: '38px',
          }}
        >
          Add Genre
        </button>
      </form>

      {/* Genre List */}
      <h3 style={{ marginBottom: '12px' }}>Existing Genres ({genres.length})</h3>
      {genres.length === 0 ? (
        <p style={{ color: '#888' }}>No genres yet. Add one above.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={thStyle}>Name</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {genres.map((genre) => (
              <tr key={genre._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{genre.name}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(genre._id, genre.name)}
                    style={{
                      padding: '5px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
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

const thStyle = { padding: '10px', textAlign: 'left', fontSize: '14px' };
const tdStyle = { padding: '10px', fontSize: '14px' };

export default GenreManager;