import React, { useState } from 'react';

function Dashboard() {
  const [movies, setMovies] = useState([
    { id: 1, title: "The Batman", genre: "Action" },
    { id: 2, title: "Dune: Part Two", genre: "Sci-Fi" }
  ]);

  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newMovieGenre, setNewMovieGenre] = useState("");

  const user = { username: "Nati", role: "admin" }; // Toggle to 'standard' to test

  const handleAddMovie = (e) => {
    e.preventDefault();
    if (!newMovieTitle || !newMovieGenre) return;
    const newMovie = {
      id: Date.now(), // Using timestamp for a unique ID
      title: newMovieTitle,
      genre: newMovieGenre
    };
    setMovies([...movies, newMovie]);
    setNewMovieTitle("");
    setNewMovieGenre("");
  };

  // --- NEW: THE 'DELETE' FUNCTION (Requirement #5) ---
  const handleDeleteMovie = (id) => {
    // Filter out the movie that matches the ID we clicked
    const updatedMovies = movies.filter(movie => movie.id !== id);
    setMovies(updatedMovies);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>🎬 MoviePass Dashboard</h1>
      <hr />

      {/* ADMIN PANEL */}
      {user.role === 'admin' && (
        <section style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <h2>Admin Panel: Add New Movie</h2>
          <form onSubmit={handleAddMovie} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Movie Title" 
              value={newMovieTitle}
              onChange={(e) => setNewMovieTitle(e.target.value)}
              style={{ padding: '8px' }}
            />
            <input 
              type="text" 
              placeholder="Genre" 
              value={newMovieGenre}
              onChange={(e) => setNewMovieGenre(e.target.value)}
              style={{ padding: '8px' }}
            />
            <button type="submit" style={{ padding: '8px 20px', cursor: 'pointer' }}>Add Movie</button>
          </form>
        </section>
      )}

      {/* MOVIE DISPLAY */}
      <section>
        <h2>Now Playing</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {movies.map((movie) => (
            <div key={movie.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', width: '220px', position: 'relative' }}>
              <h3>{movie.title}</h3>
              <p>Genre: {movie.genre}</p>
              
              <button style={{ width: '100%', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', padding: '8px', marginBottom: '10px' }}>
                Book Ticket
              </button>

              {/* --- NEW: DELETE BUTTON (Admin Only) --- */}
              {user.role === 'admin' && (
                <button 
                  onClick={() => handleDeleteMovie(movie.id)}
                  style={{ width: '100%', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '5px', cursor: 'pointer' }}
                >
                  Delete Movie
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard; 