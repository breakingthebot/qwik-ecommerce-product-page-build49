// src/services/productService.ts
// Business Logic & Product Engine for Build 49 - Qwik E-Commerce Product Page.
// Created: 2026-07-28

export interface ProductVariant {
  id: string;
  name: string;
  colorHex: string;
  price: number;
  originalPrice: number;
  stock: number;
  image: string;
  badge?: string;
}

export interface ProductReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

export interface CartItem {
  variantId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ProductData {
  id: string;
  title: string;
  tagline: string;
  sku: string;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  features: string[];
  specs: Record<string, string>;
  reviews: ProductReview[];
}

/**
 * Returns complete product catalog data for Apex Pro Cyber Headphones.
 */
export function getProductData(): ProductData {
  return {
    id: 'apex-pro-cyber-v1',
    title: 'Nexus Apex Pro Wireless ANC Headphones',
    tagline: 'Ultra-low latency, planar magnetic audiophile drivers with active noise cancellation and glassmorphism design.',
    sku: 'NXS-APEX-2026-PRO',
    rating: 4.9,
    reviewCount: 328,
    variants: [
      {
        id: 'var-cyber-black',
        name: 'Cyber Onyx',
        colorHex: '#0f172a',
        price: 349.99,
        originalPrice: 429.99,
        stock: 14,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        badge: 'Popular Choice'
      },
      {
        id: 'var-neon-magenta',
        name: 'Neon Cyberpunk',
        colorHex: '#ff007f',
        price: 369.99,
        originalPrice: 449.99,
        stock: 5,
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
        badge: 'Limited Edition'
      },
      {
        id: 'var-solar-white',
        name: 'Solar Alpine',
        colorHex: '#e2e8f0',
        price: 349.99,
        originalPrice: 429.99,
        stock: 22,
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
      }
    ],
    features: [
      '⚡ Qwik Instant Load Resumable State Architecture (0ms Hydration Delay)',
      '🎧 50mm Custom Planar Magnetic Drivers with Sub-Bass Boost',
      '🔇 Hybrid Active Noise Cancellation (ANC) up to -45dB',
      '🔋 65 Hours Battery Life with Superfast USB-C Charge (10 min = 8 hrs)',
      '📶 Ultra-Low Latency Bluetooth 5.4 + 2.4GHz Wireless USB-C Dongle'
    ],
    specs: {
      'Driver Size': '50mm Planar Magnetic Neodymium',
      'Frequency Response': '5 Hz - 48,000 Hz',
      'Impedance': '32 Ohms',
      'Battery Life': '65 Hours (ANC Off) / 45 Hours (ANC On)',
      'Weight': '285 grams',
      'Microphone': 'Quad-Beamforming AI Noise Canceling Mic',
      'Connectivity': 'Bluetooth 5.4, 2.4GHz Dongle, 3.5mm AUX'
    },
    reviews: [
      {
        id: 'rev-1',
        author: 'Alexander Vance',
        avatar: '👨‍💻',
        rating: 5,
        date: 'July 24, 2026',
        title: 'Mind-blowing soundstage and instant UI responsiveness!',
        comment: 'The audio clarity is astonishing. Plus, navigating this product page feels ridiculously fast—zero lag or delay when adding to cart!',
        verified: true
      },
      {
        id: 'rev-2',
        author: 'Elena Rostova',
        avatar: '👩‍🎨',
        rating: 5,
        date: 'July 20, 2026',
        title: 'Sleek Cyberpunk aesthetic & insane battery life',
        comment: 'I charged them once last week and haven\'t plugged them in since. The ANC blocks out all office background noise effortlessly.',
        verified: true
      },
      {
        id: 'rev-3',
        author: 'Marcus Brody',
        avatar: '🎮',
        rating: 4,
        date: 'July 15, 2026',
        title: 'Zero audio delay in gaming mode',
        comment: 'Using the 2.4GHz USB-C dongle yields imperceptible latency for competitive gaming. Highly recommended!',
        verified: true
      }
    ]
  };
}

/**
 * Calculates cart totals including subtotal, tax, discounts, and final total.
 */
export function calculateCartTotals(cartItems: CartItem[], promoCode = ''): {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
} {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  let discountPercent = 0;

  if (promoCode.trim().toUpperCase() === 'QWIK15') {
    discountPercent = 0.15;
  } else if (promoCode.trim().toUpperCase() === 'NEXUS20') {
    discountPercent = 0.20;
  }

  const discount = subtotal * discountPercent;
  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 15.00;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.08; // 8% sales tax
  const total = taxableAmount + tax + shipping;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}

/**
 * Formats a numeric price to USD string.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Filters product reviews by minimum star rating.
 */
export function filterReviews(reviews: ProductReview[], minRating = 0): ProductReview[] {
  if (minRating === 0) return reviews;
  return reviews.filter(r => r.rating >= minRating);
}

/**
 * Generates serialized resumable state metadata snapshot.
 */
export function getResumableSnapshot(cartItems: CartItem[], selectedVariantId: string): {
  serializedObjectsCount: number;
  resumabilityKey: string;
  hydrationCostMs: number;
  payloadSizeBytes: number;
} {
  const payload = JSON.stringify({ cartItems, selectedVariantId });
  return {
    serializedObjectsCount: cartItems.length + 2,
    resumabilityKey: `qwik:store:${Date.now().toString(36)}`,
    hydrationCostMs: 0.0, // Qwik zero hydration delay
    payloadSizeBytes: new Blob([payload]).size
  };
}
