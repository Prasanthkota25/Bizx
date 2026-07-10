import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';
import '../styles/auth.css';

function Login() {

  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {

    if (!loginData.username || !loginData.password) {
      alert('Please enter Username and Password');
      return;
    }

    try {

      await API.post('/users/login', loginData);

      localStorage.setItem(
        'username',
        loginData.username
      );

      navigate('/home');

    } catch (error) {

      alert(
        error.response?.data ||
        'Login Failed'
      );

    }
  };

  return (

    <div className="auth-container">

      <div className="auth-card">

        <h2 className="text-center mb-4">
          Login
        </h2>

        <input
          type="text"
          name="username"
          className="form-control mb-3"
          placeholder="Username"
          value={loginData.username}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          className="form-control mb-3"
          placeholder="Password"
          value={loginData.password}
          onChange={handleChange}
        />

        <button
          className="btn btn-primary w-100"
          onClick={handleLogin}
        >
          Login
        </button>

        <div className="d-flex justify-content-between mt-3">

          <Link to="/register">
            Register
          </Link>

          <Link to="/forgot-password">
            Forgot Password?
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;