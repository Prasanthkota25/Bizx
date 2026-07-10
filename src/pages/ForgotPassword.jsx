import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';
import '../styles/auth.css';

function ForgotPassword() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleResetPassword = async () => {

    if (
      !formData.username ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert('All fields are required');
      return;
    }

    if (formData.password.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {

      const response = await API.put(
        '/users/resetpassword',
        {
          username: formData.username,
          password: formData.password
        }
      );

      alert(response.data.message);

      navigate('/');

    } catch (error) {

      alert(
      error.response?.data?.message ||
        'Password Reset Failed'
      );

    }
  };

  return (

    <div className="auth-container">

      <div className="auth-card">

        <h2 className="text-center mb-4">
          Forgot Password
        </h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          className="form-control mb-3"
          value={formData.username}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="New Password"
          className="form-control mb-3"
          value={formData.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="form-control mb-3"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <button
          className="btn btn-warning w-100 mb-3"
          onClick={handleResetPassword}
        >
          Reset Password
        </button>

        <Link to="/">
          <button className="btn btn-primary w-100">
            Back To Login
          </button>
        </Link>

      </div>

    </div>
  );
}

export default ForgotPassword;