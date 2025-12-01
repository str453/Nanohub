import React from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

export const AddProduct = () => {
  return (
    <div className='addproduct'>
        <div className="addproduct-itemfield">
            <p>Product title</p>
            <input type="text" placeholder='Type here'/>
        </div>
        <div className="addproduct-price">
            <div className="addproduct-itemfield">
                <p>Price</p>
                <input type="text" name="old_price" placeholder='Type here'/>    
            </div>
            <div className="addproduct-itemfield">
                <p>Offer Price</p>
                <input type="text" name="new_price" placeholder='Type here'/>    
            </div>
        </div>
        <div className="addproduct-itemfield">
            <p>Product Caterogy</p>
            <select name="category" className='add-product-selector'>
                <option value="PC Parts">Pc Parts</option>
                <option value="GPUs">GPUs</option>
                <option value="Monitor">Monitor</option>
            </select>
        </div>
        <div className="addproduct-itemfield">
            <label htmlFor="file-input">
                <img src={upload_area} className='addproduct-thumbnail-img' alt="" />
            </label>
            <input type="file" name='image' id='file-input'/>
        </div>
        <button className='addproduct-btn'>ADD</button>
    </div>
  )
}

export default AddProduct