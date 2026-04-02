import React from 'react';
import { Link } from 'react-router-dom';

function Register() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Create an Account</h1>
      <form>
        <input type="text" placeholder="Full Name" /><br/><br/>
        <input type="text" placeholder="Username" /><br/><br/>
        <input type="password" placeholder="Password" /><br/><br/>
        <button type="submit">Register</button>
      </form>
      
      {/* This is the magic link that sends them back to Login */}
      <p>Already have an account? <Link to="/">Login here</Link></p>
    </div>
  );
}

export default Register;