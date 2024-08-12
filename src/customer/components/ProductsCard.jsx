import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, remove, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast, Toaster } from 'react-hot-toast';

// Firebase configuration
const firebaseConfig = {
  apiKey: 
  authDomain: 
  projectId: 
  storageBucket: 
  messagingSenderId: 
  appId: 
  measurementId: 
  databaseURL: 
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);


const ProductCard = ({ name, price, image, onAddToCart }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <img src={image} alt={name} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-gray-600">₹{price.toFixed(2)}</p>
      <button
        onClick={onAddToCart}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Add to Cart
      </button>
    </div>
  </div>
);

// ProductSection component
const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      setLoading(true);
      if (snapshot.exists()) {
        const productsData = snapshot.val();
        const productsArray = Object.keys(productsData).map(key => ({
          id: key,
          ...productsData[key]
        }));
        setProducts(productsArray);
      } else {
        setProducts([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products. Please try again later.");
      setLoading(false);
    });


    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const cartRef = ref(db, `users/${user.uid}/cart`);
        onValue(cartRef, (snapshot) => {
          const cartData = snapshot.val() || {};
          const cartItems = Object.keys(cartData).map(key => ({
            id: key,
            ...cartData[key]
          }));
          setCart(cartItems);
          setCartItemCount(cartItems.length);
        });
      } else {
        setUser(null);
        setCart([]);
        setCartItemCount(0);
      }
    });
  }, []);

  const handleAddToCart = (product) => {
    if (user) {
      const cartRef = ref(db, `users/${user.uid}/cart`);
      push(cartRef, product).then(() => {
        toast.success('Added to cart!');
      }).catch((error) => {
        console.error("Error adding to cart:", error);
        toast.error('Failed to add to cart. Please try again.');
      });
    } else {
      toast.error('Please login to add items to cart.');
    }
  };

  const handleRemoveFromCart = (itemId) => {
    if (user) {
      const itemRef = ref(db, `users/${user.uid}/cart/${itemId}`);
      remove(itemRef).then(() => {
        
        toast.success('Removed from cart!');
      }).catch((error) => {
        console.error("Error removing from cart:", error);
        toast.error('Failed to remove from cart. Please try again.');
      });
    }
  };

  const handleCompletePurchase = () => {
    if (user) {
      const cartRef = ref(db, `users/${user.uid}/cart`);
      set(cartRef, {}).then(() => {
        setPurchaseComplete(true);
        setCart([]);
        setCartItemCount(0);
        toast.success('Purchase completed successfully!');


        setTimeout(() => {
          setPurchaseComplete(false);
        }, 3000);
      }).catch((error) => {
        console.error("Error completing purchase:", error);
        toast.error('Failed to complete purchase. Please try again.');
      });
    } else {
      toast.error('Please login to complete purchase.');
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <Toaster />
      <h2 className="text-3xl font-bold mb-6 text-center">Our Products</h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>
      ) : (
        <p>No products found</p>
      )}
      {cart.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold mb-4">Cart</h3>
          <ul className="mb-4">
            {cart.map((item) => (
              <li key={item.id} className="mb-2 flex justify-between">
                <span>{item.name} - ₹{item.price.toFixed(2)}</span>
                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xl font-semibold">
            Total: ₹{cart.reduce((total, product) => total + product.price, 0).toFixed(2)}
          </p>
          <p className="mt-2 mb-4">Total Items: {cartItemCount}</p>
          <button
            onClick={handleCompletePurchase}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Complete Purchase
          </button>
        </div>
      )}
      {purchaseComplete && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
          Purchase completed successfully! Thank you for your order.
        </div>
      )}
    </section>
  );
};

export default ProductSection;
