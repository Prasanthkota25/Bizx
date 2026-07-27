import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';
import '../styles/auth.css';

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    password: '',
    phone: '',
    email: '',
    gender: ''
  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    // Phone number validation (numbers only + max 10)
    if (name === 'phone') {

      const onlyNumbers = value.replace(/\D/g, '');

      if (onlyNumbers.length <= 10) {

        setFormData({
          ...formData,
          [name]: onlyNumbers
        });
      }

      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {

    // Required fields
    if (
      !formData.firstname ||
      !formData.lastname ||
      !formData.username ||
      !formData.password ||
      !formData.phone ||
      !formData.email ||
      !formData.gender
    ) {

      alert('All fields are required');
      return false;
    }

    // Phone validation
    if (formData.phone.length !== 10) {

      alert('Phone number must be 10 digits');
      return false;
    }

    // Email validation
    if (
      !formData.email.includes('@') ||
      !formData.email.includes('.com')
    ) {

      alert('Enter valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 4) {

      alert('Password must be at least 4 characters');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {

    if (!validateForm()) {
      return;
    }

    try {

     const response = await API.post('/users/register', formData);

     alert(response.data.message);

      navigate('/');

    } catch (error) {

      alert(error.response?.data || 'Registration Failed');
    }
  };

//   return (

//     <div className='auth-container'>

//       <div className='auth-card'>

//         <h2 className='text-center mb-4'>
//           Register
//         </h2>

//         <input
//           type='text'
//           name='firstname'
//           placeholder='First Name'
//           className='form-control mb-3'
//           onChange={handleChange}
//         />

//         <input
//           type='text'
//           name='lastname'
//           placeholder='Last Name'
//           className='form-control mb-3'
//           onChange={handleChange}
//         />

//         <input
//           type='text'
//           name='username'
//           placeholder='Username'
//           className='form-control mb-3'
//           onChange={handleChange}
//         />

//         <input
//           type='password'
//           name='password'
//           placeholder='Password'
//           className='form-control mb-3'
//           onChange={handleChange}
//         />

//         <input
//           type='text'
//           name='phone'
//           placeholder='Phone Number'
//           className='form-control mb-3'
//           value={formData.phone}
//           onChange={handleChange}
//         />

//         <input
//           type='email'
//           name='email'
//           placeholder='Email'
//           className='form-control mb-3'
//           onChange={handleChange}
//         />
//         <select
//   name="gender"
//   className="form-control mb-3"
//   value={formData.gender}
//   onChange={handleChange}
// >
//   <option value="">Select Gender</option>
//   <option value="MALE">Male</option>
//   <option value="FEMALE">Female</option>
// </select>


//         <button
//           className='btn btn-success w-100 mb-3'
//           onClick={handleRegister}
//         >
//           Register
//         </button>

//         <Link to='/'>
//           <button className='btn btn-primary w-100'>
//             Go To Login
//           </button>
//         </Link>

//       </div>

//     </div>
//   );
// }




return (
  <div className="auth-container">
    <form
      className="form register-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleRegister();
      }}
    >
      <div className="form-title">
        <span>create your</span>
      </div>

      <div className="title-2">
        <span>Bizx</span>
      </div>


      <section className="bg-stars">
        <span className="star"></span>
        <span className="star"></span>
        <span className="star"></span>
        <span className="star"></span>
      </section>
      <div className="input-container">
        <input
          className="input-mail"
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
        />
      </div>

      <div className="input-container">
        <input
          className="input-mail"
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
        />
      </div>

      <div className="input-container">
        <input
          className="input-mail"
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      <div className="input-container">
        <input
          className="input-pwd"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div className="input-container">
        <input
          className="input-mail"
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="input-container">
        <input
          className="input-mail"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="input-container">
        <select
          name="gender"
          className="input-mail gender-select"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
      </div>



      <button type="submit" className="submit">
        <span className="sign-text">
          Register
        </span>
      </button>

      <p className="signup-link">
        Already have an account?{" "}
        <Link to="/" className="up">
          Login
        </Link>
      </p>
    </form>
  </div>
);
}

export default Register;