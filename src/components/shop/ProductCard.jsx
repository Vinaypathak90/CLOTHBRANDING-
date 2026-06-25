import React, { useContext } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../../context/WishlistContext';

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="flex flex-col gap-3 bg-white p-3 rounded-lg border border-[#e8e2d8]/50 shadow-[0_4px_15px_rgba(0,0,0,0.02)] group hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all duration-400">
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] bg-[#e8e4dc] overflow-hidden rounded-md">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-103 brightness-[0.99]"
        />

        {/* Wishlist Heart Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 shadow-sm ${
            inWishlist
              ? 'bg-[#b5862a] text-white'
              : 'bg-[#f7f4ef]/90 hover:bg-[#1a1a1a] text-[#b5862a] hover:text-white'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={13} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Product Information */}
      <div className="flex flex-col gap-3 text-center mt-1 font-['DM_Sans'] flex-grow justify-between">
        <div>
          <h4 className="text-[0.88rem] font-bold text-[#1a1a1a] tracking-wide line-clamp-1 capitalize">
            {product.name}
          </h4>
          <p className="text-[0.85rem] font-semibold text-[#b5862a] mt-0.5">
            Rs. {Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* View Product Link */}
        <Link
          to={`/shop/product/${product.id}`}
          className="w-full py-2.5 bg-neutral-900 text-white text-[0.68rem] tracking-[0.2em] font-bold uppercase rounded-md hover:bg-[#b5862a] transition-colors duration-400"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
