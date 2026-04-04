import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchMovies,
  createMovie,
  deleteMovie,
  updateMovie,
} from '../services/api.js';

function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [newMovieDescription, setNewMovieDescription] = useState('');
  const [newMovieDuration, setNewMovieDuration] = useState('');
  const [error, setError] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user || !token) {
      navigate('/');
    }
  }, [user, token, navigate]);

  // Fetch movies from backend on load
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await fetchMovies();
        setMovies(data);
      } catch (err) {
        setError(err.message);
      }
    };
    loadMovies();
  }, []);

  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!newMovieTitle || !newMovieDescription || !newMovieDuration) return;
    try {
      const movieData = {
        title: newMovieTitle,
        description: newMovieDescription,
        duration: Number(newMovieDuration),
      };
      const savedMovie = await createMovie(movieData, token);
      setMovies([...movies, savedMovie]);
      setNewMovieTitle('');
      setNewMovieDescription('');
      setNewMovieDuration('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMovie = async (id) => {
    try {
      await deleteMovie(id, token);
      setMovies(movies.filter((movie) => movie._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const startEditing = (movie) => {
    setEditingId(movie._id);
    setEditTitle(movie.title);
    setEditDescription(movie.description);
    setEditDuration(movie.duration);
  };

  const handleUpdateMovie = async (id) => {
    try {
      const updatedData = {
        title: editTitle,
        description: editDescription,
        duration: Number(editDuration),
      };
      const updatedMovie = await updateMovie(id, updatedData, token);
      setMovies(movies.map((m) => (m._id === id ? updatedMovie : m)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return null;

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>MoviePass Dashboard</h1>
      <p>Welcome, {user.username} ({user.role})</p>
      <hr />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* ADMIN PANEL */}
      {user.role === 'admin' && (
        <section style={{
          backgroundColor: '#fff3cd',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
        }}>
          <h2>Admin Panel: Add New Movie</h2>
          <form onSubmit={handleAddMovie} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Movie Title"
              value={newMovieTitle}
              onChange={(e) => setNewMovieTitle(e.target.value)}
              style={{ padding: '8px' }}
            />
            <input
              type="text"
              placeholder="Description"
              value={newMovieDescription}
              onChange={(e) => setNewMovieDescription(e.target.value)}
              style={{ padding: '8px' }}
            />
            <input
              type="number"
              placeholder="Duration (min)"
              value={newMovieDuration}
              onChange={(e) => setNewMovieDuration(e.target.value)}
              style={{ padding: '8px' }}
            />
            <button type="submit" style={{ padding: '8px 20px', cursor: 'pointer' }}>
              Add Movie
            </button>
          </form>
        </section>
      )}

      {/* MOVIE DISPLAY */}
      <section>
        <h2>Now Playing</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {movies.map((movie) => (
            <div key={movie._id} style={{
              border: '1px solid #ccc',
              padding: '15px',
              borderRadius: '8px',
              width: '250px',
            }}>
              {editingId === movie._id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{ width: '100%', marginBottom: '5px', padding: '4px' }}
                  />
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{ width: '100%', marginBottom: '5px', padding: '4px' }}
                  />
                  <input
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    style={{ width: '100%', marginBottom: '5px', padding: '4px' }}
                  />
                  <button
                    onClick={() => handleUpdateMovie(movie._id)}
                    style={{
                      width: '100%',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px',
                      cursor: 'pointer',
                      marginBottom: '5px',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      width: '100%',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h3>{movie.title}</h3>
                  <p>{movie.description}</p>
                  <p>{movie.duration} min</p>

                  <button style={{
                    width: '100%',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                  }}>
                    Book Ticket
                  </button>

                  {user.role === 'admin' && (
                    <>
                      <button
                        onClick={() => startEditing(movie)}
                        style={{
                          width: '100%',
                          backgroundColor: '#ffc107',
                          color: 'black',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px',
                          cursor: 'pointer',
                          marginBottom: '5px',
                        }}
                      >
                        Edit Movie
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(movie._id)}
                        style={{
                          width: '100%',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete Movie
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;