import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <div style={cardStyle}>
      {/* Movie Poster */}
      <img
        src={movie.posterUrl || 'https://via.placeholder.com/280x400?text=No+Poster'}
        alt={movie.title}
        style={imageStyle}
      />

      <div style={contentStyle}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{movie.title}</h3>

        {/* Genre Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
          {movie.genres && movie.genres.map((g) => (
            <span key={g._id} style={genreTagStyle}>
              {g.name}
            </span>
          ))}
        </div>

        <p style={descriptionStyle}>
          {movie.description}
        </p>

        {/* Spacer pushes duration + button to the bottom */}
        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontSize: '0.8rem', color: '#999', margin: '0 0 12px 0' }}>
            {movie.duration} min
          </p>

          <Link
            to={`/movie/${movie._id}/showtimes`}
            style={buttonStyle}
          >
            Book Ticket
          </Link>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  width: '260px',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#fff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
};

const contentStyle = {
  padding: '15px',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
};

const imageStyle = {
  width: '100%',
  height: '340px',
  objectFit: 'cover',
  display: 'block',
};

const descriptionStyle = {
  color: '#666',
  fontSize: '0.85rem',
  margin: '0 0 10px 0',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const genreTagStyle = {
  backgroundColor: '#e9ecef',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  color: '#495057',
};

const buttonStyle = {
  display: 'inline-block',
  padding: '8px 16px',
  backgroundColor: '#e74c3c',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  fontSize: '0.85rem',
};

export default MovieCard;
