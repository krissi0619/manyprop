import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Registration attempt:', formData);
  };

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '60px' }}>
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="name">Full Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="phone">Phone:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginTop: '5px' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;