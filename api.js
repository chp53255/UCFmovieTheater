// src/services/api.js
const API_URL = 'http://localhost:5000/api'; // This will be provided by your teammate

export const fetchMovies = async () => {
  const response = await fetch(`${API_URL}/movies`);
  return response.json();
};