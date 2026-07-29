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

export interface LedPreset {
  id: string;
  name: string;
  hex: string;
  glowShadow: string;
}

export interface SocialPurchase {
  id: string;
  location: string;
  variantName: string;
  timeAgo: string;
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

export interface AudioTrack {
  id: string;
  title: string;
  genre: string;
  durationSec: number;
  waveformPeaks: number[];
  description: string;
}

export interface EqPreset {
  id: string;
  name: string;
  description: string;
  gains: number[];
}

export interface ArLightingPreset {
  id: string;
  name: string;
  ambientHex: string;
  shadowIntensity: number;
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

export interface QnaItem {
  id: string;
  category: 'Audio & ANC' | 'Connectivity' | 'Battery & Charge' | 'Warranty & Shipping';
  question: string;
  answer: string;
  author: string;
  upvotes: number;
  date: string;
}

export interface ProductData {
  id: string;
  title: string;
  tagline: string;
  basePrice: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  sku: string;
  variants: ProductVariant[];
  ledPresets: LedPreset[];
  socialPurchases: SocialPurchase[];
  audioTracks: AudioTrack[];
  eqPresets: EqPreset[];
  arLightingPresets: ArLightingPreset[];
  qnaList: QnaItem[];
  features: string[];
  specs: Record<string, string>;
  reviews: ProductReview[];
}

export interface CartItem {
  variantId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  ledColor: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateVsUSD: number;
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rateVsUSD: 1.0, label: '🇺🇸 USD ($)' },
  EUR: { code: 'EUR', symbol: '€', rateVsUSD: 0.92, label: '🇪🇺 EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rateVsUSD: 0.78, label: '🇬🇧 GBP (£)' },
  JPY: { code: 'JPY', symbol: '¥', rateVsUSD: 155.0, label: '🇯🇵 JPY (¥)' }
};

export function getProductData(): ProductData {
  return {
    id: 'nexus-apex-pro-01',
    title: 'Nexus Apex Pro Wireless ANC Headphones',
    tagline: 'Ultra-low latency, planar magnetic audiophile drivers with active noise cancellation and glassmorphism design.',
    basePrice: 349.99,
    originalPrice: 429.99,
    rating: 4.9,
    reviewCount: 128,
    sku: 'NEXUS-APEX-PRO-01',
    variants: [
      {
        id: 'var-cyber-onyx',
        name: 'Cyber Onyx',
        colorHex: '#0f172a',
        price: 349.99,
        originalPrice: 429.99,
        stock: 14,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        badge: 'Popular Choice'
      },
      {
        id: 'var-neon-cyan',
        name: 'Neon Cyberpunk',
        colorHex: '#38bdf8',
        price: 369.99,
        originalPrice: 449.99,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
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
    arLightingPresets: [
      { id: 'ar-neon', name: 'Cyber Neon Studio', ambientHex: '#00f6ff', shadowIntensity: 0.8 },
      { id: 'ar-daylight', name: 'Studio Daylight', ambientHex: '#f8fafc', shadowIntensity: 0.4 },
      { id: 'ar-dark', name: 'Darkroom Ambient', ambientHex: '#8b5cf6', shadowIntensity: 0.9 }
    ],
    qnaList: [
      {
        id: 'qna-1',
        category: 'Audio & ANC',
        question: 'Does the Active Noise Cancellation (ANC) work in wired 3.5mm mode?',
        answer: 'Yes! The internal DSP and Hybrid ANC engine operate independently in both wireless and wired 3.5mm AUX mode as long as power is turned on.',
        author: 'Marcus K.',
        upvotes: 42,
        date: 'July 18, 2026'
      },
      {
        id: 'qna-2',
        category: 'Connectivity',
        question: 'Can I connect simultaneously to my PC via 2.4GHz dongle and phone via Bluetooth?',
        answer: 'Absolutely. Multipoint Dual-Stream Bluetooth 5.4 and 2.4GHz ultra-low latency wireless dongle operate concurrently with seamless audio priority switching.',
        author: 'David S.',
        upvotes: 38,
        date: 'July 21, 2026'
      },
      {
        id: 'qna-3',
        category: 'Battery & Charge',
        question: 'How fast does the USB-C fast charging replenish the battery?',
        answer: 'A short 10-minute fast charge via USB-C PD delivers up to 8 hours of playback. A complete full charge takes only 45 minutes.',
        author: 'Sarah L.',
        upvotes: 29,
        date: 'July 22, 2026'
      },
      {
        id: 'qna-4',
        category: 'Warranty & Shipping',
        question: 'What warranty is included and what is the return policy?',
        answer: 'Nexus Apex Pro includes a 2-Year International Express Hardware Warranty and a 30-day money-back satisfaction guarantee with free return shipping.',
        author: 'Brandon T.',
        upvotes: 19,
        date: 'July 25, 2026'
      },
      {
        id: 'qna-5',
        category: 'Audio & ANC',
        question: 'Are the memory foam ear cushions replaceable?',
        answer: 'Yes, the magnetic snap-on ear cups are easily user-replaceable. Replacement leatherette and cooling gel ear cushions can be ordered directly.',
        author: 'Jessica M.',
        upvotes: 15,
        date: 'July 27, 2026'
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
        author: 'Marcus Chen',
        avatar: '🎧',
        rating: 4,
        date: 'July 15, 2026',
        title: 'Planar magnetic bass precision',
        comment: 'Sub-bass extension down to 5Hz is unreal for wireless cans. Very comfortable for long coding sessions.',
        verified: true
      }
    ]
  };
}

export function getComparisonModels(): ComparisonModel[] {
  return [
    {
      id: 'apex-air',
      name: 'Nexus Apex Air',
      tagline: 'Lightweight Portable Wireless',
      priceUSD: 199.99,
      driver: '40mm Dynamic Transducer',
      frequency: '15 Hz - 25,000 Hz',
      ancLevel: 'Hybrid ANC (-35dB)',
      battery: '40 Hours',
      weight: '220g',
      latency: '45ms'
    },
    {
      id: 'nexus-apex-pro-01',
      name: 'Nexus Apex Pro (Selected)',
      tagline: 'Flagship Planar ANC Audiophile',
      priceUSD: 349.99,
      driver: '50mm Planar Magnetic',
      frequency: '5 Hz - 48,000 Hz',
      ancLevel: 'Adaptive Smart ANC (-48dB)',
      battery: '65 Hours',
      weight: '285g',
      latency: '15ms (Ultra-Low)',
      isCurrentProduct: true
    },
    {
      id: 'apex-studio',
      name: 'Nexus Apex Studio Master',
      tagline: 'Reference Electrostatic Master',
      priceUSD: 599.99,
      driver: '50mm Beryllium Electrostatic',
      frequency: '2 Hz - 96,000 Hz',
      ancLevel: 'Ultra Silent ANC (-52dB)',
      battery: '80 Hours',
      weight: '310g',
      latency: '8ms (Zero-Lag)',
      isCurrentProduct: false
    }
  ];
}

export function getArMetadata(variantId: string) {
  return {
    scaleRatio: '1:1 True Real-Scale (285g)',
    glbUrl: `https://nexus-cyber.assets/models/${variantId}.glb`,
    usdzUrl: `https://nexus-cyber.assets/models/${variantId}.usdz`,
    arQrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://qwik-ecommerce-product-page-build49.vercel.app/ar/${variantId}`
  };
}

/**
 * Filter Q&A Knowledge Base items by query and category.
 */
export function filterQnaItems(items: QnaItem[], query = '', category = 'ALL'): QnaItem[] {
  return items.filter((item) => {
    const matchesCategory = category === 'ALL' || item.category === category;
    const cleanQuery = query.trim().toLowerCase();
    const matchesQuery = cleanQuery === '' ||
      item.question.toLowerCase().includes(cleanQuery) ||
      item.answer.toLowerCase().includes(cleanQuery) ||
      item.author.toLowerCase().includes(cleanQuery);
    return matchesCategory && matchesQuery;
  });
}

/**
 * Calculates 360-degree rotation angle based on user drag delta.
 */
export function calculate360Rotation(currentAngle: number, deltaX: number, sensitivity = 0.5): { angle: number; frameIndex: number } {
  let newAngle = (currentAngle + deltaX * sensitivity) % 360;
  if (newAngle < 0) newAngle += 360;
  const frameIndex = Math.floor((newAngle / 360) * 24) % 24;
  return { angle: newAngle, frameIndex };
}

/**
 * Converts USD base price to selected target currency.
 */
export function convertCurrency(priceUSD: number, targetCurrency: CurrencyCode): { convertedAmount: number; formatted: string; symbol: string } {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.USD;
  const amount = priceUSD * config.rateVsUSD;

  let formatted = '';
  if (targetCurrency === 'JPY') {
    formatted = `${config.symbol}${Math.round(amount).toLocaleString()}`;
  } else {
    formatted = `${config.symbol}${amount.toFixed(2)}`;
  }

  return {
    convertedAmount: amount,
    formatted,
    symbol: config.symbol
  };
}

/**
 * Calculates countdown time string (HH:MM:SS) from seconds.
 */
export function calculateFlashSaleCountdown(totalSeconds: number): { hours: number; minutes: number; seconds: number; formatted: string } {
  const s = Math.max(0, totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = Math.floor(s % 60);

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hh}:${mm}:${ss}`
  };
}

/**
 * Generates dynamic frequency bar spectrum heights based on audio time offset.
 */
export function calculateFrequencyBars(peaks: number[], timeOffset = 0): number[] {
  return peaks.map((p, i) => {
    const wave = Math.sin(timeOffset * 3 + i) * 15;
    return Math.min(100, Math.max(15, Math.round(p + wave)));
  });
}

/**
 * Calculates SVG path coordinates string for EQ response curve.
 */
export function calculateEqCurve(gains: number[], width = 600, height = 100): string {
  const points = gains.map((g, i) => {
    const x = (i / (gains.length - 1)) * width;
    const y = (height / 2) - (g * 3.5); // 3.5px per dB
    return { x, y };
  });

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const cx = (p1.x + p2.x) / 2;
    d += ` C ${cx},${p1.y} ${cx},${p2.y} ${p2.x},${p2.y}`;
  }
  return d;
}

/**
 * Computes cart subtotal, shipping, discount, and total in target currency.
 */
export function calculateCartTotals(
  items: CartItem[],
  promoCode = '',
  currency: CurrencyCode = 'USD'
): {
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
  const subtotalUSD = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountUSD = 0;
  if (promoCode.toUpperCase() === 'QWIK15') {
    discountUSD = subtotalUSD * 0.15;
  }

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
export function getResumableSnapshot(cartItems: CartItem[], selectedVariantId: string, ledColor = 'led-cyan', rotationAngle = 0, flashSaleSeconds = 14400, activeAudioTrack = 'tr-bass', currency: CurrencyCode = 'USD', isCompareOpen = false, eqPreset = 'eq-flat', isArOpen = false, isQnaOpen = false): {
  serializedObjectsCount: number;
  resumabilityKey: string;
  hydrationCostMs: number;
  payloadSizeBytes: number;
} {
  const payload = JSON.stringify({ cartItems, selectedVariantId, ledColor, rotationAngle, flashSaleSeconds, activeAudioTrack, currency, isCompareOpen, eqPreset, isArOpen, isQnaOpen });
  return {
    serializedObjectsCount: cartItems.length + 10,
    resumabilityKey: `qwik:store:${Date.now().toString(36)}`,
    hydrationCostMs: 0.0, // Qwik zero hydration delay
    payloadSizeBytes: new Blob([payload]).size
  };
}
