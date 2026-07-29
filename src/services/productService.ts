// src/services/productService.ts
// Business Logic & Product Engine for Build 49 - Qwik E-Commerce Product Page.
// Updated: 2026-07-29 for Iteration 7 (Qwik Interactive Sound Profile Equalizer)

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
  ledColor?: string;
}

export interface LedPreset {
  id: string;
  name: string;
  hex: string;
  glowShadow: string;
}

export interface SocialProofPurchase {
  id: string;
  location: string;
  variantName: string;
  timeAgo: string;
}

export interface AudioDemoTrack {
  id: string;
  title: string;
  genre: string;
  durationSec: number;
  waveformPeaks: number[];
  description: string;
}

export interface ComparisonModel {
  id: string;
  name: string;
  tagline: string;
  priceUSD: number;
  driver: string;
  frequency: string;
  ancLevel: string;
  battery: string;
  weight: string;
  latency: string;
  isCurrentProduct?: boolean;
}

export interface EqPreset {
  id: string;
  name: string;
  description: string;
  gains: number[]; // 5 band gains in dB (-12 to +12)
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // relative to USD
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78 },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.0 }
};

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
  ledPresets: LedPreset[];
  socialPurchases: SocialProofPurchase[];
  audioTracks: AudioDemoTrack[];
  eqPresets: EqPreset[];
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
    ledPresets: [
      { id: 'led-cyan', name: 'Cyber Cyan', hex: '#00f6ff', glowShadow: '0 0 25px rgba(0, 246, 255, 0.8)' },
      { id: 'led-magenta', name: 'Neon Magenta', hex: '#ff007f', glowShadow: '0 0 25px rgba(255, 0, 127, 0.8)' },
      { id: 'led-gold', name: 'Solar Amber', hex: '#fbbf24', glowShadow: '0 0 25px rgba(251, 191, 36, 0.8)' },
      { id: 'led-emerald', name: 'Matrix Emerald', hex: '#10b981', glowShadow: '0 0 25px rgba(16, 185, 129, 0.8)' },
      { id: 'led-purple', name: 'Plasma Violet', hex: '#a855f7', glowShadow: '0 0 25px rgba(168, 85, 247, 0.8)' }
    ],
    socialPurchases: [
      { id: 'sp-1', location: 'Tokyo, Japan 🇯🇵', variantName: 'Neon Cyberpunk', timeAgo: '2 mins ago' },
      { id: 'sp-2', location: 'Berlin, Germany 🇩🇪', variantName: 'Cyber Onyx', timeAgo: '6 mins ago' },
      { id: 'sp-3', location: 'San Francisco, USA 🇺🇸', variantName: 'Solar Alpine', timeAgo: '12 mins ago' },
      { id: 'sp-4', location: 'London, UK 🇬🇧', variantName: 'Neon Cyberpunk', timeAgo: '18 mins ago' }
    ],
    audioTracks: [
      {
        id: 'tr-bass',
        title: 'Cyberpunk Sub-Bass Pressure Test',
        genre: 'Synthwave / Industrial',
        durationSec: 180,
        waveformPeaks: [40, 85, 95, 60, 100, 90, 75, 45, 90, 100, 80, 50],
        description: 'Deep 20Hz sub-bass sweeps testing planar magnetic driver displacement without distortion.'
      },
      {
        id: 'tr-anc',
        title: 'Hybrid ANC Noise Isolation Demo',
        genre: 'Acoustic / Field Recording',
        durationSec: 140,
        waveformPeaks: [30, 45, 60, 35, 70, 50, 40, 65, 80, 60, 45, 30],
        description: '-45dB active noise cancellation filtering low-frequency airplane engine rumble.'
      },
      {
        id: 'tr-spatial',
        title: '3D Binaural Spatial Audio Test',
        genre: 'Orchestral / Cinema',
        durationSec: 210,
        waveformPeaks: [50, 70, 85, 90, 65, 80, 95, 100, 85, 70, 60, 40],
        description: 'Immersive 7.1.4 Dolby Atmos spatial positioning and crystal clear vocal separation.'
      }
    ],
    eqPresets: [
      { id: 'eq-flat', name: 'Audiophile Neutral', description: 'Harmon curve flat tuning for uncolored reference sound.', gains: [0, 0, 0, 0, 0] },
      { id: 'eq-bass', name: 'Cyber Sub-Bass Boost', description: '+8dB low-shelf bump at 60Hz for deep sub-bass impact.', gains: [8, 5, 1, 0, 2] },
      { id: 'eq-vocal', name: 'Vocal & Acoustic Clarity', description: 'Midrange boost at 1kHz-3kHz for crisp podcasts & vocals.', gains: [-2, 1, 6, 4, 1] },
      { id: 'eq-game', name: 'FPS Gaming Spatial', description: 'High-frequency treble boost for footstep audio cues.', gains: [4, -2, 0, 6, 8] }
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
 * Calculates SVG path coordinates for Equalizer frequency response curve visualization.
 */
export function calculateEqCurve(gains: number[], width = 600, height = 120): string {
  if (!gains || gains.length === 0) return '';
  const points = gains.map((gain, idx) => {
    const x = (idx / (gains.length - 1)) * width;
    // Map gain (-12dB to +12dB) to Y coordinate (0 to height)
    const y = (height / 2) - (gain / 12) * (height / 2.4);
    return `${Math.round(x)},${Math.round(y)}`;
  });
  return `M ${points.join(' L ')}`;
}

/**
 * Returns list of Nexus headphone models for side-by-side comparison.
 */
export function getComparisonModels(): ComparisonModel[] {
  return [
    {
      id: 'apex-air',
      name: 'Nexus Apex Air',
      tagline: 'Lightweight everyday wireless listening',
      priceUSD: 199.99,
      driver: '40mm Dynamic Driver',
      frequency: '20 Hz - 20,000 Hz',
      ancLevel: '-25dB Standard ANC',
      battery: '35 Hours',
      weight: '220g',
      latency: '45ms',
      isCurrentProduct: false
    },
    {
      id: 'apex-pro',
      name: 'Nexus Apex Pro (This Model)',
      tagline: 'Flagship audiophile planar magnetic + ANC',
      priceUSD: 349.99,
      driver: '50mm Planar Magnetic',
      frequency: '5 Hz - 48,000 Hz',
      ancLevel: '-45dB Hybrid Dual-Mic ANC',
      battery: '65 Hours',
      weight: '285g',
      latency: '15ms Ultra-Low',
      isCurrentProduct: true
    },
    {
      id: 'apex-studio',
      name: 'Nexus Apex Studio Master',
      tagline: 'Reference studio mastering grade wireless',
      priceUSD: 599.99,
      driver: '60mm Beryllium Planar Driver',
      frequency: '2 Hz - 96,000 Hz',
      ancLevel: '-50dB Adaptive AI ANC',
      battery: '80 Hours',
      weight: '340g',
      latency: '8ms Ultra-Zero',
      isCurrentProduct: false
    }
  ];
}

/**
 * Converts USD price to target currency code and formats symbol.
 */
export function convertCurrency(usdAmount: number, targetCurrency: CurrencyCode = 'USD'): {
  convertedAmount: number;
  formatted: string;
} {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.USD;
  const convertedAmount = usdAmount * config.rate;

  let formatted = '';
  if (targetCurrency === 'JPY') {
    formatted = `${config.symbol}${Math.round(convertedAmount).toLocaleString()}`;
  } else {
    formatted = `${config.symbol}${convertedAmount.toFixed(2)}`;
  }

  return {
    convertedAmount: Number(convertedAmount.toFixed(2)),
    formatted
  };
}

/**
 * Calculates audio frequency bar heights dynamically based on time and audio track peaks.
 */
export function calculateFrequencyBars(peaks: number[], timeOffsetSec: number): number[] {
  return peaks.map((peak, idx) => {
    const wave = Math.sin(timeOffsetSec * 4 + idx * 0.5);
    const height = Math.min(100, Math.max(15, peak + wave * 25));
    return Math.round(height);
  });
}

/**
 * Calculates remaining Flash Sale time format (HH:MM:SS) from target seconds.
 */
export function calculateFlashSaleCountdown(totalSeconds: number): {
  hours: string;
  minutes: string;
  seconds: string;
  formatted: string;
  isExpired: boolean;
} {
  if (totalSeconds <= 0) {
    return { hours: '00', minutes: '00', seconds: '00', formatted: '00:00:00', isExpired: true };
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const hoursStr = h.toString().padStart(2, '0');
  const minutesStr = m.toString().padStart(2, '0');
  const secondsStr = s.toString().padStart(2, '0');

  return {
    hours: hoursStr,
    minutes: minutesStr,
    seconds: secondsStr,
    formatted: `${hoursStr}:${minutesStr}:${secondsStr}`,
    isExpired: false
  };
}

/**
 * Calculates the current 360 degree rotation angle and frame index from drag delta.
 */
export function calculate360Rotation(currentAngle: number, deltaX: number, sensitivity = 0.5): {
  angle: number;
  frameIndex: number;
  normalizedDeg: string;
} {
  let newAngle = (currentAngle + deltaX * sensitivity) % 360;
  if (newAngle < 0) newAngle += 360;
  
  const totalFrames = 24; // 24 angles around 360deg
  const frameIndex = Math.floor((newAngle / 360) * totalFrames) % totalFrames;

  return {
    angle: Number(newAngle.toFixed(1)),
    frameIndex,
    normalizedDeg: `${Math.round(newAngle)}°`
  };
}

/**
 * Calculates cart totals including subtotal, tax, discounts, and final total in target currency.
 */
export function calculateCartTotals(cartItems: CartItem[], promoCode = '', currency: CurrencyCode = 'USD'): {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedShipping: string;
  formattedTotal: string;
} {
  const subtotalUSD = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  let discountPercent = 0;

  if (promoCode.trim().toUpperCase() === 'QWIK15') {
    discountPercent = 0.15;
  } else if (promoCode.trim().toUpperCase() === 'NEXUS20') {
    discountPercent = 0.20;
  }

  const discountUSD = subtotalUSD * discountPercent;
  const shippingUSD = subtotalUSD > 200 || subtotalUSD === 0 ? 0 : 15.00;
  const taxableAmount = Math.max(0, subtotalUSD - discountUSD);
  const taxUSD = taxableAmount * 0.08; // 8% sales tax
  const totalUSD = taxableAmount + taxUSD + shippingUSD;

  const subtotal = convertCurrency(subtotalUSD, currency).convertedAmount;
  const discount = convertCurrency(discountUSD, currency).convertedAmount;
  const tax = convertCurrency(taxUSD, currency).convertedAmount;
  const shipping = convertCurrency(shippingUSD, currency).convertedAmount;
  const total = convertCurrency(totalUSD, currency).convertedAmount;

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total,
    formattedSubtotal: convertCurrency(subtotalUSD, currency).formatted,
    formattedDiscount: convertCurrency(discountUSD, currency).formatted,
    formattedShipping: shippingUSD === 0 ? 'FREE' : convertCurrency(shippingUSD, currency).formatted,
    formattedTotal: convertCurrency(totalUSD, currency).formatted
  };
}

/**
 * Formats a numeric price to USD string.
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  return convertCurrency(amount, currency).formatted;
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
export function getResumableSnapshot(cartItems: CartItem[], selectedVariantId: string, ledColor = 'led-cyan', rotationAngle = 0, flashSaleSeconds = 14400, activeAudioTrack = 'tr-bass', currency: CurrencyCode = 'USD', isCompareOpen = false, eqPreset = 'eq-flat'): {
  serializedObjectsCount: number;
  resumabilityKey: string;
  hydrationCostMs: number;
  payloadSizeBytes: number;
} {
  const payload = JSON.stringify({ cartItems, selectedVariantId, ledColor, rotationAngle, flashSaleSeconds, activeAudioTrack, currency, isCompareOpen, eqPreset });
  return {
    serializedObjectsCount: cartItems.length + 8,
    resumabilityKey: `qwik:store:${Date.now().toString(36)}`,
    hydrationCostMs: 0.0, // Qwik zero hydration delay
    payloadSizeBytes: new Blob([payload]).size
  };
}
