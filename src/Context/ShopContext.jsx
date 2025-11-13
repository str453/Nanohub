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
                const transformedProducts = response.products.map((product, index) => {
                    // Handle images - could be array, pipe-separated string, or single string
                    let imagesArray = [];
                    
                    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                        // Images are already in array format
                        imagesArray = product.images.map(img => 
                            typeof img === 'string' ? { url: img, alt: product.name } : img
                        );
                    } else if (product.image_urls && typeof product.image_urls === 'string') {
                        // Images stored as pipe-separated string
                        imagesArray = product.image_urls.split('|')
                            .map(url => url.trim())
                            .filter(url => url)
                            .map((url, idx) => ({ url, alt: `${product.name} - Image ${idx + 1}` }));
                    } else if (product.images && typeof product.images === 'string' && product.images.includes('|')) {
                        // Images field is a pipe-separated string
                        imagesArray = product.images.split('|')
                            .map(url => url.trim())
                            .filter(url => url)
                            .map((url, idx) => ({ url, alt: `${product.name} - Image ${idx + 1}` }));
                    }
                    
                    // Get the first image for the main image display
                    const firstImage = imagesArray.length > 0 
                        ? (typeof imagesArray[0] === 'string' ? imagesArray[0] : imagesArray[0].url)
                        : '/placeholder.png';
                    
                    return {
                        id: product._id,
                        name: product.name,
                        category: product.category,
                        image: firstImage,
                        price: parseFloat(product.price.toFixed(2)), // Round to 2 decimals
                        brand: product.brand,
                        description: product.description,
                        inStock: product.inStock,
                        images: imagesArray,
                        image_urls: product.image_urls, // Pass through in case it's needed
                        stockQuantity: product.stockQuantity
                    };
                });
                
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
        setCartItems((prev) => {
            const currentQuantity = prev[itemId] || 0;
            // Prevent quantity from going below 0
            if (currentQuantity <= 0) {
                return prev;
            }
            return { ...prev, [itemId]: currentQuantity - 1 };
        });
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = all_product.find((product) => product.id === item);
                if (itemInfo) {
                    // Use price field (not new_price which doesn't exist)
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return parseFloat(totalAmount.toFixed(2));
    }

    const getTaxAmount = (taxRate = 0.0875) => {
        // Default tax rate: 8.75% (California average sales tax)
        const subtotal = getTotalCartAmount();
        return parseFloat((subtotal * taxRate).toFixed(2));
    }

    const getFinalTotal = (taxRate = 0.0875) => {
        const subtotal = getTotalCartAmount();
        const tax = getTaxAmount(taxRate);
        return parseFloat((subtotal + tax).toFixed(2));
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
        getTaxAmount,
        getFinalTotal,
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