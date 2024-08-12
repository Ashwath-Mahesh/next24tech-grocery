import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { toast, Toaster } from 'react-hot-toast';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgF9ieIhZlQltxXZXk7yvEdBbgkj3-2XI",
  authDomain: "ecom-674a8.firebaseapp.com",
  projectId: "ecom-674a8",
  storageBucket: "ecom-674a8.appspot.com",
  messagingSenderId: "975921817921",
  appId: "1:975921817921:web:6de76e7916338bb6b019c0",
  measurementId: "G-60HP08XS7L",
  databaseURL: "https://ecom-674a8-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchCartData(storedUser.uid);
    }
  }, []);

  const fetchCartData = (userId) => {
    const cartRef = ref(db, `users/${userId}/cart`);
    onValue(cartRef, (snapshot) => {
      const cartData = snapshot.val() || {};
      const cartItems = Object.keys(cartData).map(key => ({
        dbKey: key, // The key used in the database
        ...cartData[key]
      }));
      setCart(cartItems);
    });
  };

  const handleRemoveFromCart = (dbKey) => {
    if (user) {
      const itemRef = ref(db, `users/${user.uid}/cart/${dbKey}`);
      remove(itemRef).then(() => {
        toast.success('Removed from cart!');
        fetchCartData(user.uid);
      }).catch((error) => {
        console.error("Error removing from cart:", error);
        toast.error('Failed to remove from cart. Please try again.');
      });
    }
  };

  if (!user) return <p>Please log in to view your cart.</p>;

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <Toaster />
      <h2 className="text-3xl font-bold mb-6 text-center">Your Cart</h2>
      {cart.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <ul className="mb-4">
            {cart.map((item) => (
              <li key={item.dbKey} className="mb-2 flex justify-between">
                <span>{item.name} - ₹{item.price.toFixed(2)}</span>
                <button
                  onClick={() => handleRemoveFromCart(item.dbKey)}
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
          <p className="mt-2 mb-4">Total Items: {cart.length}</p>
          
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </section>
  );
};

export default CartPage;
