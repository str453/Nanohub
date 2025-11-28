import React, { useContext, useState, useEffect } from 'react'
import './Navbar.css'

import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'
import { useAuth } from '../../Context/AuthContext'

export const Navbar = () => {

    const[menu,setMenu] = useState("shop");
    const {getTotalCartItems} = useContext(ShopContext);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const current = location.pathname;

        if(current === '/'){
            setMenu("shop");
        } else if(current === '/PC-Parts'){
            setMenu("PC-Parts");
        } else if(current === '/GPU'){
            setMenu("GPU");
        } else if(current === '/Monitor'){
            setMenu("Monitor");
        }
    }, [location.pathname])

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
  return (
    <div className='navbar'>
        <div className='nav-logo'>
            <img src={logo} alt=""/>
            <p>NANOHUB</p>
        </div>
        <ul className="nav-menu">
            <li onClick={()=>{setMenu("shop")}}><Link style={{ textDecoration: 'none' }} to='/'>Shop</Link>{menu==="shop"?<hr/>:<></>}</li>
            <li onClick={()=>{setMenu("PC-Parts")}}><Link style={{ textDecoration: 'none' }} to='/PC-Parts'>PC Parts</Link>{menu==="PC-Parts"?<hr/>:<></>}</li>
            <li onClick={()=>{setMenu("GPU")}}><Link style={{ textDecoration: 'none' }} to='/GPU'>GPUs</Link>{menu==="GPU"?<hr/>:<></>}</li>
            <li onClick={()=>{setMenu("Monitor")}}><Link style={{ textDecoration: 'none' }} to='/Monitor'>Monitor</Link>{menu==="Monitor"?<hr/>:<></>}</li>
        </ul>
        <div className="nav-login-cart">
            {user ? (
                <button onClick={handleLogout}>Logout</button>
            ) : (
                <Link style={{ textDecoration: 'none' }} to='/login' onClick={(e) => {if(location.pathname === '/login') {e.preventDefault(); window.location.reload();}}}><button>Login</button></Link>
            )}
            <Link style={{ textDecoration: 'none' }} to={user ? '/orders' : '/login'}>
                <div className="nav-user-icon">
                    <div className="user-icon-circle">
                        {user ? (
                            <span className="user-initial">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                        ) : (
                            <span className="guest-icon">👤</span>
                        )}
                    </div>
                    {user && (
                        <span className="user-name">{user.name ? user.name.split(' ')[0] : 'User'}</span>
                    )}
                </div>
            </Link>
            <Link style={{ textDecoration: 'none' }} to='/cart'><img src={cart_icon} alt=""/></Link>
            <div className="nav-cart-count">{getTotalCartItems()}</div>
            
        </div>
    </div>
  )
}
