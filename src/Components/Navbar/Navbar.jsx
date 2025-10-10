import React, { useState } from 'react'
import './Navbar.css'

import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import { Link } from 'react-router-dom'

export const Navbar = () => {

    const[menu,setMenu] = useState("shop");

  return (
    <div className='navbar'>
        <div className='nav-logo'>
            <img src={logo} alt=""/>
            <p>NANOHUB</p>
        </div>
        <ul className="nav-menu">
            <li onClick={()=>{setMenu("shop")}}><Link style={{ textDecoration: 'none' }} to='/'>Shop</Link>{menu==="shop"?<hr/>:<></>}</li>
            <li onClick={()=>{setMenu("PC-Parts")}}><Link style={{ textDecoration: 'none' }} to='/PC-Parts'>PC Parts</Link>{menu==="PC-Parts"?<hr/>:<></>}</li>
            <li onClick={()=>{setMenu("Apple")}}><Link style={{ textDecoration: 'none' }} to='/Apple'>Apple</Link>{menu==="Apple"?<hr/>:<></>}</li>
            <li onClick={()=>{setMenu("Computers")}}><Link style={{ textDecoration: 'none' }} to='/Computers'>Computers</Link>{menu==="Computers"?<hr/>:<></>}</li>
        </ul>
        <div className="nav-login-cart">
            <Link style={{ textDecoration: 'none' }} to='/login'><button>Login</button></Link>
            <Link style={{ textDecoration: 'none' }} to='/cart'><img src={cart_icon} alt=""/></Link>
            <div className="nav-cart-count">0</div>
            
        </div>
    </div>
  )
}
