import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext'
import { useParams } from 'react-router-dom'
import { Breadcrum } from '../Components/Breadcrums/Breadcrum.jsx'
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay.jsx'

export const Product = () => {
  const {all_product}= useContext(ShopContext);
  const {productId} = useParams();
  const product = all_product.find((e)=> e.id === Number(productId));

  if (!product) {
        // You can return a loading indicator or null while the data loads
        // Returning 'null' prevents a crash while React waits for the next render
        return null; 
    }
    
  return (
    <div>
        <Breadcrum product={product}/>
        <ProductDisplay product={product}/>
    </div>
  )
}

export default Product