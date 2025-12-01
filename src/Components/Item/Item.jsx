import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'

export const Item = (props) => {
  const handleClick = () => {
    window.scrollTo(0,0);
  };

  // Calculate discounted price if applicable
  const getDisplayPrice = () => {
    if (props.discount?.isActive && props.discount?.percentage) {
      return (props.price * (1 - props.discount.percentage / 100)).toFixed(2);
    }
    return props.price?.toFixed(2) || '0.00';
  };

  const hasDiscount = props.discount?.isActive && props.discount?.percentage;

  return (
    <div className='item'>
        <Link to={`/product/${props.id}`}><img onClick={handleClick} src={props.image} alt="" /></Link>
        {hasDiscount && (
          <span className="item-discount-badge">-{props.discount.percentage}%</span>
        )}
        {props.category && (
          <div className="item-category">
            {props.category}
          </div>
        )}
        <p>{props.name}</p>
        <div className="item-prices">
            {hasDiscount ? (
              <>
                <div className="item-price discount-price">
                    ${getDisplayPrice()}
                </div>
                <div className="item-original-price">
                    ${props.price?.toFixed(2) || '0.00'}
                </div>
              </>
            ) : (
              <div className="item-price">
                  ${props.price?.toFixed(2) || '0.00'}
              </div>
            )}
        </div>
    </div>    
  )
}

export default Item