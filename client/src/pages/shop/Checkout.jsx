import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Checkout() {
  const { cart, cartCount, cartTotalPrice } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center pt-28">
        <div className="max-w-xl p-8 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-4">Please login to continue to checkout</h2>
          <p className="mb-6">You need an account to complete purchases and track orders.</p>
          <div className="flex gap-3">
            <Link to="/auth" className="px-4 py-2 bg-black text-white rounded">Login / Signup</Link>
            <Link to="/cart" className="px-4 py-2 border rounded">Back to Cart</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f7f4ef] text-[#1a1a1a] pt-28 pb-24 px-6 md:px-16">
      <div className="max-w-[900px] mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="mb-4">Hello, {currentUser.name || currentUser.email}. Review your order below.</p>

        <div className="mb-6">
          <h3 className="font-semibold">Items ({cartCount})</h3>
          <ul className="mt-3 space-y-2">
            {cart.map(item => (
              <li key={item.id} className="flex justify-between">
                <span>{item.products?.name} x {item.quantity}</span>
                <span>Rs. {((item.products?.price||0) * item.quantity).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center font-bold text-lg">
          <span>Total</span>
          <span>Rs. {cartTotalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="px-6 py-3 bg-[#1a1a1a] text-white rounded">Proceed to Payment</button>
          <Link to="/cart" className="px-6 py-3 border rounded">Back</Link>
        </div>
      </div>
    </div>
  );
}
