import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext'
import { useParams } from 'react-router-dom'
import { Breadcrum } from '../Components/Breadcrums/Breadcrum.jsx'
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay.jsx'
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox.jsx'
import { RelatedProducts } from '../Components/RelatedProducts/RelatedProducts.jsx'

export const Product = () => {
  const {all_product, loading}= useContext(ShopContext);
  const {productId} = useParams();
  
  // MongoDB uses string IDs, not numbers
  const product = all_product.find((e)=> e.id === productId);

  // Show loading state
  if (loading) {
    return <div style={{textAlign: 'center', padding: '100px'}}>Loading product...</div>;
  }

  // Show error if product not found
  if (!product) {
    return (
      <div style={{textAlign: 'center', padding: '100px'}}>
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <a href="/PC-Parts" style={{color: '#667eea'}}>← Back to Products</a>
      </div>
    );
  }
    
  return (
    <div>
        <Breadcrum product={product}/>
        <ProductDisplay product={product}/>
        <DescriptionBox/>
        <RelatedProducts currentProduct={product}/>
    </div>
  )
}

export default Product