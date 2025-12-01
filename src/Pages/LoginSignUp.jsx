/* 
Functional Requirement #2-4 Login Page
*/

import React, {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {authAPI} from '../services/api';
import {useAuth} from '../Context/AuthContext';
import './CSS/LoginSignup.css'

export const LoginSignUp = () => {
  const [isLogin, setIsLogin] = useState(true); // Default to login mode
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
    date_of_birth: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Password requirements
  const passwordRequirements = {
    minLength: 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  const passwordValid = 
    formData.password.length >= passwordRequirements.minLength &&
    passwordRequirements.hasUpperCase &&
    passwordRequirements.hasLowerCase &&
    passwordRequirements.hasNumber &&
    passwordRequirements.hasSpecialChar;

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length >= 3 && !isLogin) {
        setCheckingUsername(true);
        try {
          const response = await authAPI.checkUsername(formData.username);
          console.log('Username check response:', response); // Debug log
          setUsernameAvailable(response.available);
        } catch (error) {
          console.error('Username check error:', error); // Debug log
          setUsernameAvailable(null);
        } finally {
          setCheckingUsername(false);
        }
      } else {
        setUsernameAvailable(null);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.username, isLogin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!isLogin) {
      // Sign up validation
      if (!formData.username || formData.username.length < 3) {
        setError('Username must be at least 3 characters');
        return false;
      }
      if (usernameAvailable === false) {
        setError('Username is already taken');
        return false;
      }
      if (!formData.firstName.trim()) {
        setError('First name is required');
        return false;
      }
      if (!formData.lastName.trim()) {
        setError('Last name is required');
        return false;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        return false;
      }
      if (!passwordValid) {
        setError('Password does not meet requirements');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (!formData.address.trim()) {
        setError('Address is required');
        return false;
      }
      if (!formData.city.trim()) {
        setError('City is required');
        return false;
      }
      if (!formData.state.trim()) {
        setError('State is required');
        return false;
      }
      if (!formData.postal_code.trim()) {
        setError('Postal code is required');
        return false;
      }
      if (!formData.phone.trim()) {
        setError('Phone number is required');
        return false;
      }
    } else {
      // Login validation
      if (!formData.email.trim()) {
        setError('Email is required');
        return false;
      }
      if (!formData.password) {
        setError('Password is required');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try{
      let response;
      
      if(isLogin){
        response = await authAPI.login(formData.email, formData.password);
        setSuccess('Successfully Logged in!');

        // Use AuthContext to update global state
        login(response.user, response.token);

        console.log('User logged in:', response.user);
        
        // Redirect based on user role
        setTimeout(() => {
          if (response.user.role === 'admin') {
            // Redirect admins to admin panel (separate app on port 5173)
            // Pass token and user data via URL parameters
            const token = response.token;
            const userData = JSON.stringify(response.user);
            window.location.href = `http://localhost:5173?token=${encodeURIComponent(token)}&user=${encodeURIComponent(userData)}`;
          } else {
            // Redirect regular users to home page
            navigate('/');
          }
        }, 1000);
      } else{
        // Prepare registration data
        const registrationData = {
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth || undefined
        };

        response = await authAPI.register(registrationData);
        setSuccess('Successful signup! Please login.');

        setIsLogin(true);
        // Clear form except email
        setFormData({
          ...formData,
          username: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: '',
          address: '',
          city: '',
          state: '',
          postal_code: '',
          phone: '',
          date_of_birth: ''
        });
      }
    
    } catch(e){
      console.log('Error occured');
      console.log('   - Error object:', e);
      console.log('   - Response data:', e.response?.data);
      console.log('   - Status code:', e.response?.status);
      console.log('   - Request made:', e.request);
      
       if (e.response) {
        // Server responded with error status
        setError(e.response.data?.error || `Server error: ${e.response.status}`);
      } else if (e.request) {
        // Request was made but no response received
        setError('No response from server. Check if backend is running on port 5000.');
      } else {
        // Something else happened
        setError(e.message || 'Something went wrong');
      }

    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setUsernameAvailable(null);
    setFormData({
      username: '',
      firstName: '',
      lastName: '',
      email: formData.email, // Keep email
      password: '',
      confirmPassword: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      phone: '',
      date_of_birth: ''
    });
  };

  return (
    <div className='loginsignup'>
      <div className={`loginsignup-container ${!isLogin ? 'signup-mode' : ''}`}>
        <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className='success-message'>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="loginsignup-fields">
            {!isLogin && (
              <>
                {/* Username */}
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder='Username (3-30 characters)'
                    value={formData.username}
                    onChange={handleChange}
                    required
                    pattern="[a-zA-Z0-9_]{3,30}"
                    style={{
                      borderColor: formData.username.length >= 3 
                        ? (usernameAvailable === true ? '#2e7d32' : usernameAvailable === false ? '#ff4141' : '#c9c9c9')
                        : '#c9c9c9'
                    }}
                  />
                  {formData.username.length >= 3 && (
                    <div className={`username-status ${usernameAvailable === true ? 'available' : usernameAvailable === false ? 'taken' : ''}`}>
                      {checkingUsername ? 'Checking...' : 
                       usernameAvailable === true ? '✓ Username available' : 
                       usernameAvailable === false ? '✗ Username taken' : ''}
                    </div>
                  )}
                </div>

                {/* First Name */}
                <input
                  type="text"
                  name="firstName"
                  placeholder='First Name'
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />

                {/* Last Name */}
              <input
                type="text"
                  name="lastName"
                  placeholder='Last Name'
                  value={formData.lastName}
                onChange={handleChange}
                required
                />
              </>
            )}

            {/* Email */}
          <input 
            type="email" 
            name="email"
            placeholder='Email Address'
            value={formData.email}
            onChange={handleChange}
            required
          />

            {/* Password */}
            <div>
          <input 
            type="password"
            name="password" 
            placeholder='Password'
            value={formData.password}
            onChange={handleChange}
            required
                minLength="8"
          />
              {!isLogin && formData.password && (
                <div className="password-requirements">
                  <div className={formData.password.length >= 8 ? 'requirement-met' : 'requirement-unmet'}>
                    At least 8 characters
                  </div>
                  <div className={passwordRequirements.hasUpperCase ? 'requirement-met' : 'requirement-unmet'}>
                    One uppercase letter
                  </div>
                  <div className={passwordRequirements.hasLowerCase ? 'requirement-met' : 'requirement-unmet'}>
                    One lowercase letter
                  </div>
                  <div className={passwordRequirements.hasNumber ? 'requirement-met' : 'requirement-unmet'}>
                    One number
                  </div>
                  <div className={passwordRequirements.hasSpecialChar ? 'requirement-met' : 'requirement-unmet'}>
                    One special character
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password (Sign up only) */}
            {!isLogin && (
              <input 
                type="password"
                name="confirmPassword" 
                placeholder='Confirm Password'
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  borderColor: formData.confirmPassword 
                    ? (formData.password === formData.confirmPassword ? '#2e7d32' : '#ff4141')
                    : '#c9c9c9'
                }}
              />
            )}

            {!isLogin && (
              <>
                {/* Address */}
                <input
                  type="text"
                  name="address"
                  placeholder='Street Address'
                  value={formData.address}
                  onChange={handleChange}
                  required
                />

                {/* City */}
                <input
                  type="text"
                  name="city"
                  placeholder='City'
                  value={formData.city}
                  onChange={handleChange}
                  required
                />

                {/* State */}
                <input
                  type="text"
                  name="state"
                  placeholder='State'
                  value={formData.state}
                  onChange={handleChange}
                  required
                />

                {/* Postal Code */}
                <input
                  type="text"
                  name="postal_code"
                  placeholder='Postal Code'
                  value={formData.postal_code}
                  onChange={handleChange}
                  required
                />

                {/* Phone */}
                <input
                  type="tel"
                  name="phone"
                  placeholder='Phone Number (10-15 digits)'
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10,15}"
                />

                {/* Date of Birth */}
                <input
                  type="date"
                  name="date_of_birth"
                  placeholder='Date of Birth'
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </>
            )}
        </div>
          <button type="submit" disabled={loading || (!isLogin && (!passwordValid || formData.password !== formData.confirmPassword || usernameAvailable === false))}>
          {loading ? 'Processing...' : 'Continue'}
        </button>
      </form>

        <p className="loginsignup-login">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleMode}>
             {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        
        {!isLogin && (
          <div className="loginsignup-agree">
          <input type="checkbox" name='' id='' required/>
          <p>By continuing, you agree to the terms and privacy policy.</p>        
        </div>
        )}
      </div>
    </div>
  );
};

export default LoginSignUp;
