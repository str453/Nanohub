import React, { useContext, useState } from 'react'
import './ProductDisplay.css'
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from '../../Context/ShopContext';

const ProductDisplay = (props) => {
      const {product} = props;
      const {addToCart} = useContext(ShopContext);
      
      // State to track which image is currently displayed
      const [mainImage, setMainImage] = useState(product.image);
      
      // Get all images (use images array if available, otherwise fallback to single image)
      const productImages = product.images && product.images.length > 0 
        ? product.images.map(img => img.url) 
        : [product.image];

    return (
        <div className='productdisplay'>
            <div className="productdisplay-left">
                <div className="productdisplay-img-list">
                  {productImages.slice(0, 4).map((imgUrl, index) => (
                    <img 
                      key={index}
                      src={imgUrl} 
                      alt={`${product.name} - view ${index + 1}`}
                      onClick={() => setMainImage(imgUrl)}
                      style={{cursor: 'pointer', opacity: mainImage === imgUrl ? 1 : 0.6}}
                    />
                  ))}
              </div>
              <div className="productdisplay=img">
                <img className='productdisplay-main-img' src={mainImage} alt={product.name} />
              </div>
            </div>
            <div className="productdisplay-right">
                <h1>{product.name}</h1>
                <div className="productdisplay-right-stars">
                  <img src={star_icon} alt="" />
                  <img src={star_icon} alt="" />
                  <img src={star_icon} alt="" />
                  <img src={star_icon} alt="" />
                  <img src={star_dull_icon} alt="" />
                  <p>(122)</p>
                </div>
                <div className="productdisplay-right-prices">
                  <div className="productdisplay-right-price">${product.price?.toFixed(2)}</div>
                </div>
                <div className="productdisplay-right-descrption">
                  {product.description || 'No description available.'}
                </div>
                <div className="productdisplay-right-size">
                  <h1>Product Details</h1>
                  <div className="productdisplay-right-info">
                    <p><strong>Brand:</strong> {product.brand || 'N/A'}</p>
                    <p><strong>Stock:</strong> {product.inStock ? 'In Stock' : 'Out of Stock'}</p>
                    {product.stockQuantity && <p><strong>Available:</strong> {product.stockQuantity} units</p>}
                  </div>
                </div>
                <button onClick={()=>{addToCart(product.id)}}>Add To Cart</button>
                <p className='productdisplay-right-category'><span>Category: </span>{product.category}</p>
                {product.brand && <p className='productdisplay-right-category'><span>Brand: </span>{product.brand}</p>}
            </div>
        </div>
    )

}

export default ProductDisplay