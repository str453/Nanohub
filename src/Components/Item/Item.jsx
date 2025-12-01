import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'

export const Item = (props) => {
  const handleClick = () => {
    window.scrollTo(0,0);
  };

  return (
    <div className='item'>
        <Link to={`/product/${props.id}`}><img onClick={handleClick} src={props.image} alt="" /></Link>
        {props.category && (
          <div className="item-category">
            {props.category}
          </div>
        )}
        <p>{props.name}</p>
        <div className="item-prices">
            <div className="item-price">
                ${props.price?.toFixed(2) || '0.00'}
            </div>
        </div>
    </div>    
  )
}

export default Item