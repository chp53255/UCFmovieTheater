import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import MovieCard from '../components/MovieCard.jsx';
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
  const [newMoviePosterUrl, setNewMoviePosterUrl] = useState('');
  const [newMovieGenres, setNewMovieGenres] = useState([]);

  // Edit movie state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editPosterUrl, setEditPosterUrl] = useState('');
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
        posterUrl: newMoviePosterUrl,
        genres: newMovieGenres,
      };
      await createMovie(movieData, token);
      const updatedMovies = await fetchMovies();
      setMovies(updatedMovies);
      setNewMovieTitle('');
      setNewMovieDescription('');
      setNewMovieDuration('');
      setNewMoviePosterUrl('');
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
    setEditPosterUrl(movie.posterUrl || '');
    setEditGenres(movie.genres.map((g) => g._id));
  };

  const handleUpdateMovie = async (id) => {
    try {
      const updatedData = {
        title: editTitle,
        description: editDescription,
        duration: Number(editDuration),
        posterUrl: editPosterUrl,
        genres: editGenres,
      };
      await updateMovie(id, updatedData, token);
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

      {/* ADMIN PANEL — Add Movie */}
      {user.role === 'admin' && (
        <section style={{
          backgroundColor: '#fff3cd',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
        }}>
          <h2>Admin: Add New Movie</h2>
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
              <input
                type="text"
                placeholder="Poster URL (optional)"
                value={newMoviePosterUrl}
                onChange={(e) => setNewMoviePosterUrl(e.target.value)}
                style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
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
            <div key={movie._id}>
              {editingId === movie._id ? (
                /* ---- INLINE EDIT FORM ---- */
                <div style={{
                  border: '1px solid #ccc', padding: '15px', borderRadius: '8px',
                  width: '260px', display: 'flex', flexDirection: 'column', gap: '8px',
                }}>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                    style={{ padding: '6px', width: '100%', boxSizing: 'border-box' }}
                  />
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    style={{ padding: '6px', width: '100%', boxSizing: 'border-box' }}
                  />
                  <input
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    placeholder="Duration (min)"
                    style={{ padding: '6px', width: '100%', boxSizing: 'border-box' }}
                  />
                  <input
                    value={editPosterUrl}
                    onChange={(e) => setEditPosterUrl(e.target.value)}
                    placeholder="Poster URL"
                    style={{ padding: '6px', width: '100%', boxSizing: 'border-box' }}
                  />
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Genres:</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                      {genres.map((genre) => (
                        <button
                          type="button"
                          key={genre._id}
                          onClick={() => toggleEditGenre(genre._id)}
                          style={{
                            padding: '3px 8px', borderRadius: '12px', border: '1px solid #ccc',
                            backgroundColor: editGenres.includes(genre._id) ? '#007bff' : '#f8f9fa',
                            color: editGenres.includes(genre._id) ? 'white' : 'black',
                            cursor: 'pointer', fontSize: '11px',
                          }}
                        >
                          {genre.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateMovie(movie._id)}
                    style={{
                      backgroundColor: '#28a745', color: 'white', border: 'none',
                      borderRadius: '4px', padding: '8px', cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      backgroundColor: '#6c757d', color: 'white', border: 'none',
                      borderRadius: '4px', padding: '8px', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                /* ---- MOVIE CARD + ADMIN BUTTONS ---- */
                <div>
                  <MovieCard movie={movie} />
                  {user.role === 'admin' && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', width: '260px' }}>
                      <button
                        onClick={() => startEditing(movie)}
                        style={{
                          flex: 1, padding: '6px', backgroundColor: '#ffc107', color: 'black',
                          border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(movie._id)}
                        style={{
                          flex: 1, padding: '6px', backgroundColor: '#dc3545', color: 'white',
                          border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
