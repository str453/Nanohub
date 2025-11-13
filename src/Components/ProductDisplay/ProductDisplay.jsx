import React, { useContext, useState, useEffect, useMemo } from 'react'
import './ProductDisplay.css'
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from '../../Context/ShopContext';

const ProductDisplay = (props) => {
      const {product} = props;
      const {addToCart} = useContext(ShopContext);
      
      // Extract all image URLs - handles multiple formats
      const productImages = useMemo(() => {
        // Case 1: images is an array of objects with url property
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          return product.images.map(img => (typeof img === 'string' ? img : img.url)).filter(url => url);
        }
        
        // Case 2: images is stored as a pipe-separated string (check if product.image_urls exists)
        if (product.image_urls && typeof product.image_urls === 'string') {
          return product.image_urls.split('|').map(url => url.trim()).filter(url => url);
        }
        
        // Case 3: product.image might be a pipe-separated string
        if (product.image && typeof product.image === 'string' && product.image.includes('|')) {
          return product.image.split('|').map(url => url.trim()).filter(url => url);
        }
        
        // Case 4: Fallback to single image
        return product.image ? [product.image] : ['/placeholder.png'];
      }, [product.images, product.image_urls, product.image]);
      
      // State to track which image is currently displayed
      const [mainImage, setMainImage] = useState(productImages[0] || product.image || '/placeholder.png');
      
      // Update mainImage when product changes
      useEffect(() => {
        if (productImages.length > 0) {
          setMainImage(productImages[0]);
        }
      }, [product.id, productImages]);

    return (
        <div className='productdisplay'>
            <div className="productdisplay-left">
                <div className="productdisplay-img-list">
                  {productImages.length > 1 && productImages.map((imgUrl, index) => (
                    <img 
                      key={index}
                      src={imgUrl} 
                      alt={`${product.name} - view ${index + 1}`}
                      onClick={() => setMainImage(imgUrl)}
                      className={mainImage === imgUrl ? 'active' : ''}
                      style={{
                        cursor: 'pointer',
                        opacity: mainImage === imgUrl ? 1 : 0.6,
                        border: mainImage === imgUrl ? '2px solid #ff4141' : '2px solid transparent',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>
              <div className="productdisplay-img">
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