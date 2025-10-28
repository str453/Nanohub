/* 
Functional Requirement #2-4 Login Page
*/

import React, {useState} from 'react'
import {authAPI} from '../services/api';
import './CSS/LoginSignup.css'

export const LoginSignUp = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try{
      let response;
      
      if(isLogin){
        response = await authAPI.login(formData.email, formData.password);
        setSuccess('Successfully Logged in!');

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        console.log('User logged in:', response.user);
      } else{
        response = await authAPI.resgister(formData);
        setSuccess('Successful signup! Please login.');

        setIsLogin(true);
      }

      setFormData({name: '', email: '', password: ''});
    
    } catch(e){
      setError(e.response?.data?.error || 'Error occured');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({name: '', email: '', password: ''});
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className='success-message'>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="loginsignup-fields">
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder='Name'
                value={formData.name}
                onChange={handleChange}
                required
                />
            )}
          <input 
            type="email" 
            name="email"
            placeholder='Email Address'
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input 
            type="password"
            name="password" 
            placeholder='Password'
            value={formData.password}
            onChange={handleChange}
            required
            minLenth="8" 
          />
        </div>
        <button type="submit" disabled={loading}>
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