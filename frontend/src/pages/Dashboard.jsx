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
    <div className="page-wrapper">
      <div className="dashboard-header">
        <h1>MoviePass Dashboard</h1>
        <p>Welcome, {user.username} ({user.role})</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {/* ADMIN PANEL — Add Movie */}
      {user.role === 'admin' && (
        <section className="admin-add-panel">
          <h2>Add New Movie</h2>
          <form onSubmit={handleAddMovie}>
            <div className="admin-form-row">
              <input
                type="text"
                className="admin-input"
                placeholder="Movie Title"
                value={newMovieTitle}
                onChange={(e) => setNewMovieTitle(e.target.value)}
                style={{ flex: '1', minWidth: '150px' }}
              />
              <input
                type="text"
                className="admin-input"
                placeholder="Description"
                value={newMovieDescription}
                onChange={(e) => setNewMovieDescription(e.target.value)}
                style={{ flex: '2', minWidth: '200px' }}
              />
              <input
                type="number"
                className="admin-input"
                placeholder="Duration (min)"
                value={newMovieDuration}
                onChange={(e) => setNewMovieDuration(e.target.value)}
                style={{ width: '120px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                className="admin-input"
                placeholder="Poster URL (optional)"
                value={newMoviePosterUrl}
                onChange={(e) => setNewMoviePosterUrl(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label className="admin-label">Genres:</label>
              <div className="genre-select-group">
                {genres.map((genre) => (
                  <button
                    type="button"
                    key={genre._id}
                    onClick={() => toggleNewGenre(genre._id)}
                    className={newMovieGenres.includes(genre._id) ? 'genre-pill active' : 'genre-pill'}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-add">
              Add Movie
            </button>
          </form>
        </section>
      )}

      {/* GENRE FILTER */}
      <section style={{ marginBottom: '20px' }}>
        <h2 className="section-heading">Now Playing</h2>
        <div className="genre-filter-bar">
          <button
            onClick={() => setFilterGenre('')}
            className={filterGenre === '' ? 'genre-pill active' : 'genre-pill'}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre._id}
              onClick={() => setFilterGenre(genre._id)}
              className={filterGenre === genre._id ? 'genre-pill active' : 'genre-pill'}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </section>

      {/* MOVIE DISPLAY */}
      <section>
        <div className="movie-grid">
          {filteredMovies.length === 0 && (
            <p className="empty-text">No movies found for this genre.</p>
          )}
          {filteredMovies.map((movie) => (
            <div key={movie._id} className="movie-grid-cell">
              {editingId === movie._id ? (
                /* ---- INLINE EDIT FORM ---- */
                <div className="edit-form">
                  <input
                    className="admin-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                  />
                  <input
                    className="admin-input"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                  />
                  <input
                    className="admin-input"
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    placeholder="Duration (min)"
                  />
                  <input
                    className="admin-input"
                    value={editPosterUrl}
                    onChange={(e) => setEditPosterUrl(e.target.value)}
                    placeholder="Poster URL"
                  />
                  <div>
                    <label className="admin-label" style={{ fontSize: '12px' }}>Genres:</label>
                    <div className="genre-select-group">
                      {genres.map((genre) => (
                        <button
                          type="button"
                          key={genre._id}
                          onClick={() => toggleEditGenre(genre._id)}
                          className={editGenres.includes(genre._id) ? 'genre-pill active' : 'genre-pill'}
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          {genre.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => handleUpdateMovie(movie._id)} className="btn-save">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-cancel">
                    Cancel
                  </button>
                </div>
              ) : (
                /* ---- MOVIE CARD + ADMIN BUTTONS ---- */
                <div className="movie-card-wrapper">
                  <MovieCard movie={movie} />
                  {user.role === 'admin' && (
                    <div className="admin-actions">
                      <button onClick={() => startEditing(movie)} className="btn-edit">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteMovie(movie._id)} className="btn-delete">
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
