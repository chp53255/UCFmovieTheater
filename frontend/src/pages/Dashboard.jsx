import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchMovies,
  createMovie,
  deleteMovie,
  updateMovie,
  fetchGenres,
} from '../services/api.js';

function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState('');

  // Add movie state
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [newMovieDescription, setNewMovieDescription] = useState('');
  const [newMovieDuration, setNewMovieDuration] = useState('');
  const [newMovieGenres, setNewMovieGenres] = useState([]);

  // Edit movie state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editGenres, setEditGenres] = useState([]);

  // Filter state
  const [filterGenre, setFilterGenre] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user || !token) {
      navigate('/');
    }
  }, [user, token, navigate]);

  // Fetch movies and genres on load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [movieData, genreData] = await Promise.all([
          fetchMovies(),
          fetchGenres(),
        ]);
        setMovies(movieData);
        setGenres(genreData);
      } catch (err) {
        setError(err.message);
      }
    };
    loadData();
  }, []);

  // Toggle genre selection for add form
  const toggleNewGenre = (genreId) => {
    setNewMovieGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  // Toggle genre selection for edit form
  const toggleEditGenre = (genreId) => {
    setEditGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!newMovieTitle || !newMovieDescription || !newMovieDuration) return;
    try {
      const movieData = {
        title: newMovieTitle,
        description: newMovieDescription,
        duration: Number(newMovieDuration),
        genres: newMovieGenres,
      };
      const savedMovie = await createMovie(movieData, token);
      // Refetch to get populated genres
      const updatedMovies = await fetchMovies();
      setMovies(updatedMovies);
      setNewMovieTitle('');
      setNewMovieDescription('');
      setNewMovieDuration('');
      setNewMovieGenres([]);
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
    // Extract genre IDs from populated genre objects
    setEditGenres(movie.genres.map((g) => g._id));
  };

  const handleUpdateMovie = async (id) => {
    try {
      const updatedData = {
        title: editTitle,
        description: editDescription,
        duration: Number(editDuration),
        genres: editGenres,
      };
      await updateMovie(id, updatedData, token);
      // Refetch to get populated genres
      const updatedMovies = await fetchMovies();
      setMovies(updatedMovies);
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter movies by selected genre
  const filteredMovies = filterGenre
    ? movies.filter((movie) =>
        movie.genres.some((g) => g._id === filterGenre)
      )
    : movies;

  if (!user) return null;

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
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
          <form onSubmit={handleAddMovie}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Movie Title"
                value={newMovieTitle}
                onChange={(e) => setNewMovieTitle(e.target.value)}
                style={{ padding: '8px', flex: '1', minWidth: '150px' }}
              />
              <input
                type="text"
                placeholder="Description"
                value={newMovieDescription}
                onChange={(e) => setNewMovieDescription(e.target.value)}
                style={{ padding: '8px', flex: '2', minWidth: '200px' }}
              />
              <input
                type="number"
                placeholder="Duration (min)"
                value={newMovieDuration}
                onChange={(e) => setNewMovieDuration(e.target.value)}
                style={{ padding: '8px', width: '120px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Genres:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                {genres.map((genre) => (
                  <button
                    type="button"
                    key={genre._id}
                    onClick={() => toggleNewGenre(genre._id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      border: '1px solid #ccc',
                      backgroundColor: newMovieGenres.includes(genre._id)
                        ? '#007bff'
                        : '#f8f9fa',
                      color: newMovieGenres.includes(genre._id) ? 'white' : 'black',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" style={{
              padding: '8px 20px',
              cursor: 'pointer',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '15px',
            }}>
              Add Movie
            </button>
          </form>
        </section>
      )}

      {/* GENRE FILTER */}
      <section style={{ marginBottom: '20px' }}>
        <h2>Now Playing</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
          <button
            onClick={() => setFilterGenre('')}
            style={{
              padding: '5px 14px',
              borderRadius: '20px',
              border: '1px solid #ccc',
              backgroundColor: filterGenre === '' ? '#333' : '#f8f9fa',
              color: filterGenre === '' ? 'white' : 'black',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre._id}
              onClick={() => setFilterGenre(genre._id)}
              style={{
                padding: '5px 14px',
                borderRadius: '20px',
                border: '1px solid #ccc',
                backgroundColor: filterGenre === genre._id ? '#333' : '#f8f9fa',
                color: filterGenre === genre._id ? 'white' : 'black',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </section>

      {/* MOVIE DISPLAY */}
      <section>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {filteredMovies.length === 0 && (
            <p style={{ color: '#666' }}>No movies found for this genre.</p>
          )}
          {filteredMovies.map((movie) => (
            <div key={movie._id} style={{
              border: '1px solid #ccc',
              padding: '15px',
              borderRadius: '8px',
              width: '250px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              {editingId === movie._id ? (
                <>
                  <div>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{ width: '100%', marginBottom: '5px', padding: '4px', boxSizing: 'border-box' }}
                    />
                    <input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      style={{ width: '100%', marginBottom: '5px', padding: '4px', boxSizing: 'border-box' }}
                    />
                    <input
                      type="number"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      style={{ width: '100%', marginBottom: '5px', padding: '4px', boxSizing: 'border-box' }}
                    />
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Genres:</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '4px' }}>
                        {genres.map((genre) => (
                          <button
                            type="button"
                            key={genre._id}
                            onClick={() => toggleEditGenre(genre._id)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              border: '1px solid #ccc',
                              backgroundColor: editGenres.includes(genre._id)
                                ? '#007bff'
                                : '#f8f9fa',
                              color: editGenres.includes(genre._id) ? 'white' : 'black',
                              cursor: 'pointer',
                              fontSize: '11px',
                            }}
                          >
                            {genre.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
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
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 style={{ marginTop: '0' }}>{movie.title}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                      {movie.genres && movie.genres.map((g) => (
                        <span key={g._id} style={{
                          backgroundColor: '#e9ecef',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#495057',
                        }}>
                          {g.name}
                        </span>
                      ))}
                    </div>
                    <p style={{ color: '#555', fontSize: '14px' }}>{movie.description}</p>
                    <p style={{ fontSize: '13px', color: '#888' }}>{movie.duration} min</p>
                  </div>

                  <div>
                    <button
                      onClick={() => navigate(`/book/${movie._id}`)}
                      style={{
                        width: '100%',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px',
                        marginBottom: '10px',
                        cursor: 'pointer',
                      }}
                    >
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
                  </div>
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
