import React, { createContext, useState, useEffect } from "react";
import { productAPI } from '../services/api';

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
    const [all_product, setAllProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState({});

    // Fetch products from API on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await productAPI.getAllProducts();
                
                // Transform MongoDB products to match expected structure
                const transformedProducts = response.products.map((product, index) => ({
                    id: product._id,
                    name: product.name,
                    category: product.category,
                    image: product.images && product.images.length > 0 
                        ? product.images[0].url 
                        : '/placeholder.png',
                    new_price: parseFloat(product.price.toFixed(2)), // Round to 2 decimals
                    old_price: parseFloat((product.price * 1.2).toFixed(2)), // 20% markup, rounded
                    brand: product.brand,
                    description: product.description,
                    inStock: product.inStock,
                    images: product.images || [],
                    stockQuantity: product.stockQuantity
                }));
                
                setAllProduct(transformedProducts);
                
                // Initialize cart
                const cart = {};
                transformedProducts.forEach(product => {
                    cart[product.id] = 0;
                });
                setCartItems(cart);
                
            } catch (error) {
                console.error('Error fetching products:', error);
                setAllProduct([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        console.log(cartItems);
    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = all_product.find((product) => product.id === item);
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    }

    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalItem += cartItems[item];
            }
        }
        return totalItem;
    }

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
        loading
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;