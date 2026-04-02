import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate

function Login() {
  const navigate = useNavigate(); // Initialize the navigation function

  const handleLogin = (e) => {
    e.preventDefault();
    // This is where you'll eventually check their username/password
    // For now, it just sends them straight to the dashboard
    navigate('/dashboard');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Project Login</h1>
      <form onSubmit={handleLogin}> {/* Added onSubmit handler */}
        <div>
          <input type="text" placeholder="Username" required />
        </div>
        <br />
        <div>
          <input type="password" placeholder="Password" required />
        </div>
        <br />
        <button type="submit">Login</button>
      </form>
      <p>New user? <Link to="/register">Create an account</Link></p>
    </div>
  );
}

export default Login;