import React, {useState, useEffect, useCallback} from 'react'
import './RelatedProducts.css'
import { Item } from './../Item/Item';
import { productAPI } from '../../services/api';


export const RelatedProducts = (props) => {
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const currentProduct = props.currentProduct 

  const fetchRelatedProducts = useCallback(async () => {
    try{
      setLoading(true)

      if(!currentProduct){
        setLoading(false)
        return
      }
      
      const response = await productAPI.getProductsByCategoryPaginated(currentProduct.category, 1, 100, 'random');
      
      if(response.success && response.products){
        const filteredProducts = response.products.filter(product => {const productId = product._id || product.id;
                                                                      const currProductId = currentProduct._id || currentProduct.id;
                                                                      console.log(`Filtering: ${productId} vs ${currProductId} - Match: ${productId === currProductId}`);
                                                                      return productId !== currProductId;
        });
      
      const shuffle = (array) => {
        const shuffled = [...array];
        for(let i = shuffled.length -1; i > 0; i--){
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const shuffledProducts = shuffle(filteredProducts);
        const random = shuffledProducts.slice(0,4)
        .map(product => ({
          id: product._id || product.id,
          name: product.name,
          image: product.images?.[0]?.url || '',
          price: product.price,
          category: product.category
        }))

        setRelatedProducts(random)
      }
    } catch(e){
      console.error('Error fetching products, make sure backend is running', e)
      setRelatedProducts([])
    } finally{
      setLoading(false)
    }
  }, [currentProduct])

  useEffect(() => {
    fetchRelatedProducts()
  }, [fetchRelatedProducts])

  if(loading){
    return(
      <div className='relatedproducts'>
        <h1>Related Products</h1>
        <hr/>
        <div className='loading-message'>Loading Related Products..</div>
      </div>
    )
  }
  return (
    <div className='relatedproducts'>
        <h1>Related Products</h1>
        <hr />
        <div className="relatedproducts-item">
            {relatedProducts.map((item,i)=>{
                return <Item key={i} id={item.id} name={item.name} image={item.image} price={item.price} discount={item.discount}/>
            })}
        </div>

        {relatedProducts.length === 0 && !loading && (
          <div className='no-products-message'>
            <p>No Products found, make sure backend is running..</p>
          </div>
        )}
    </div>
  )
}


export default RelatedProducts
