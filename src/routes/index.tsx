import { component$, useStore, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import {
  getProductData,
  calculateCartTotals,
  formatCurrency,
  filterReviews,
  getResumableSnapshot,
  calculate360Rotation,
  calculateFlashSaleCountdown,
  calculateFrequencyBars,
  getComparisonModels,
  CURRENCIES,
  type CurrencyCode,
  type CartItem
} from '../services/productService';

export default component$(() => {
  const product = getProductData();
  const comparisonModels = getComparisonModels();

  // Qwik Resumable Reactive State
  const selectedVariantId = useSignal(product.variants[0].id);
  const selectedLedId = useSignal(product.ledPresets[0].id);
  const selectedAudioTrackId = useSignal(product.audioTracks[0].id);
  const selectedCurrency = useSignal<CurrencyCode>('USD');
  const isCompareOpen = useSignal<boolean>(false);
  const isAudioPlaying = useSignal<boolean>(false);
  const audioTimeOffset = useSignal<number>(0);

  const rotationAngle = useSignal<number>(0);
  const isAutoSpinning = useSignal<boolean>(false);
  const flashSaleSeconds = useSignal<number>(14400); // 4 Hours Flash Sale Countdown
  const activeSocialPurchaseIndex = useSignal<number>(0);
  const showToast = useSignal<boolean>(true);
  const activeTab = useSignal<'features' | 'specs' | 'reviews'>('features');
  const ratingFilter = useSignal<number>(0);
  const isCartOpen = useSignal(false);
  const promoCodeInput = useSignal('');
  const appliedPromo = useSignal('');

  const cartStore = useStore<{ items: CartItem[] }>({
    items: [
      {
        variantId: product.variants[0].id,
        name: `${product.title} (${product.variants[0].name})`,
        price: product.variants[0].price,
        image: product.variants[0].image,
        quantity: 1,
        ledColor: product.ledPresets[0].name
      }
    ]
  });

  // LocalStorage Syncer & Live Timer Task
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup, track }) => {
    track(() => cartStore.items);
    track(() => selectedCurrency.value);

    // Initial Load from LocalStorage
    try {
      const savedCart = localStorage.getItem('nexus_cart_build49');
      const savedCurrency = localStorage.getItem('nexus_currency_build49');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cartStore.items = parsed;
        }
      }
      if (savedCurrency && (savedCurrency in CURRENCIES)) {
        selectedCurrency.value = savedCurrency as CurrencyCode;
      }
    } catch {
      // LocalStorage fallback
    }

    const timer = setInterval(() => {
      if (flashSaleSeconds.value > 0) {
        flashSaleSeconds.value -= 1;
      }
      if (isAudioPlaying.value) {
        audioTimeOffset.value += 0.1;
      }
    }, 100);

    const socialTimer = setInterval(() => {
      showToast.value = false;
      setTimeout(() => {
        activeSocialPurchaseIndex.value = (activeSocialPurchaseIndex.value + 1) % product.socialPurchases.length;
        showToast.value = true;
      }, 500);
    }, 6000);

    cleanup(() => {
      clearInterval(timer);
      clearInterval(socialTimer);
    });
  });

  // Sync state to LocalStorage on changes
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => cartStore.items.length);
    track(() => selectedCurrency.value);
    try {
      localStorage.setItem('nexus_cart_build49', JSON.stringify(cartStore.items));
      localStorage.setItem('nexus_currency_build49', selectedCurrency.value);
    } catch {
      // LocalStorage fallback
    }
  });

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId.value) || product.variants[0];
  const selectedLed = product.ledPresets.find(l => l.id === selectedLedId.value) || product.ledPresets[0];
  const selectedAudio = product.audioTracks.find(a => a.id === selectedAudioTrackId.value) || product.audioTracks[0];
  const frequencyBars = calculateFrequencyBars(selectedAudio.waveformPeaks, isAudioPlaying.value ? audioTimeOffset.value : 0);
  const countdown = calculateFlashSaleCountdown(flashSaleSeconds.value);
  const currentSocial = product.socialPurchases[activeSocialPurchaseIndex.value];

  // Drag 360 state
  const isDragging = useSignal(false);
  const startX = useSignal(0);

  // Resumable Action Handlers ($ serializes function boundaries for Qwik resumability)
  const addToCart$ = $(() => {
    const existingIndex = cartStore.items.findIndex(item => item.variantId === selectedVariant.id);
    if (existingIndex > -1) {
      cartStore.items[existingIndex].quantity += 1;
    } else {
      cartStore.items.push({
        variantId: selectedVariant.id,
        name: `${product.title} (${selectedVariant.name} + ${selectedLed.name} LED)`,
        price: selectedVariant.price,
        image: selectedVariant.image,
        quantity: 1,
        ledColor: selectedLed.name
      });
    }
    isCartOpen.value = true;
  });

  const removeItem$ = $((variantId: string) => {
    cartStore.items = cartStore.items.filter(item => item.variantId !== variantId);
  });

  const updateQuantity$ = $((variantId: string, delta: number) => {
    const item = cartStore.items.find(i => i.variantId === variantId);
    if (item) {
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        removeItem$(variantId);
      } else {
        item.quantity = newQty;
      }
    }
  });

  const applyPromo$ = $(() => {
    appliedPromo.value = promoCodeInput.value.trim();
  });

  const handleMouseDown$ = $((e: MouseEvent) => {
    isDragging.value = true;
    startX.value = e.clientX;
  });

  const handleMouseMove$ = $((e: MouseEvent) => {
    if (!isDragging.value) return;
    const deltaX = e.clientX - startX.value;
    startX.value = e.clientX;
    const rot = calculate360Rotation(rotationAngle.value, deltaX, 0.8);
    rotationAngle.value = rot.angle;
  });

  const handleMouseUp$ = $(() => {
    isDragging.value = false;
  });

  const totals = calculateCartTotals(cartStore.items, appliedPromo.value, selectedCurrency.value);
  const filteredReviews = filterReviews(product.reviews, ratingFilter.value);
  const snapshot = getResumableSnapshot(cartStore.items, selectedVariantId.value, selectedLedId.value, rotationAngle.value, flashSaleSeconds.value, selectedAudioTrackId.value, selectedCurrency.value, isCompareOpen.value);
  const totalCartCount = cartStore.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div class="container" style="padding-bottom: 60px;">
      {/* Flash Sale Countdown Announcement Ticker */}
      <div style="background: linear-gradient(90deg, var(--accent-magenta), var(--accent-purple)); color: #fff; text-align: center; padding: 10px 16px; border-radius: var(--radius-md); font-weight: 700; font-size: 13px; margin: 16px 0 20px 0; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 4px 20px rgba(255, 0, 127, 0.3);">
        <span>⚡ CYBER FLASH SALE ENDS IN:</span>
        <span style="background: rgba(0, 0, 0, 0.4); padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 15px; color: var(--accent-cyan);">
          {countdown.formatted}
        </span>
        <span>• Use Code <strong style="color: var(--accent-cyan);">QWIK15</strong> for 15% OFF</span>
      </div>

      {/* Header Navbar */}
      <header class="navbar">
        <a href="#" class="brand-logo">
          ⚡ NEXUS<span style="color: var(--accent-cyan);">CYBER</span>
          <span class="brand-badge">Qwik Matrix Engine</span>
        </a>

        <div class="nav-actions" style="display: flex; gap: 12px; align-items: center;">
          <button
            type="button"
            class="variant-btn"
            style="padding: 8px 14px; font-size: 13px;"
            onClick$={$(() => isCompareOpen.value = true)}
          >
            ⚖️ Compare Models
          </button>

          {/* Multi-Currency Switcher */}
          <select
            value={selectedCurrency.value}
            onChange$={$((e) => selectedCurrency.value = (e.target as HTMLSelectElement).value as CurrencyCode)}
            style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-glow); color: var(--text-main); padding: 8px 12px; border-radius: var(--radius-md); font-size: 13px; font-weight: 700; cursor: pointer; outline: none;"
          >
            <option value="USD">🇺🇸 USD ($)</option>
            <option value="EUR">🇪🇺 EUR (€)</option>
            <option value="GBP">🇬🇧 GBP (£)</option>
            <option value="JPY">🇯🇵 JPY (¥)</option>
          </select>

          <button
            type="button"
            class="cart-icon-btn"
            onClick$={$(() => isCartOpen.value = true)}
          >
            🛒 Cart
            {totalCartCount > 0 && <span class="cart-badge">{totalCartCount}</span>}
          </button>
        </div>
      </header>

      {/* Main Product Showcase Grid */}
      <main class="product-grid">
        {/* 360 Degree Interactive Media Gallery */}
        <div class="product-gallery">
          <div
            class="main-image-frame"
            style={{
              boxShadow: selectedLed.glowShadow,
              cursor: isDragging.value ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
            onMouseDown$={handleMouseDown$}
            onMouseMove$={handleMouseMove$}
            onMouseUp$={handleMouseUp$}
            onMouseLeave$={handleMouseUp$}
          >
            <img
              src={selectedVariant.image}
              alt={selectedVariant.name}
              width="800"
              height="600"
              loading="eager"
              style={{
                transform: `rotateY(${rotationAngle.value}deg)`,
                transition: isDragging.value ? 'none' : 'transform 0.1s ease'
              }}
            />
            {selectedVariant.badge && (
              <span class="image-badge-tag">🔥 {selectedVariant.badge}</span>
            )}
            <span
              class="image-badge-tag"
              style="left: auto; right: 16px; background: rgba(139, 92, 246, 0.2); border-color: var(--accent-purple); color: var(--accent-purple);"
            >
              🔄 360° Angle: {Math.round(rotationAngle.value)}°
            </span>

            {/* LED Accent Glow Canvas Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: `radial-gradient(circle at 50% 50%, ${selectedLed.hex}25 0%, transparent 70%)`
              }}
            ></div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 16px;">
            <span style="font-size: 13px; color: var(--text-muted);">👉 Drag horizontally to rotate 360°</span>
            <button
              type="button"
              class={`variant-btn ${isAutoSpinning.value ? 'active' : ''}`}
              style="padding: 4px 12px; font-size: 12px;"
              onClick$={$(() => {
                isAutoSpinning.value = !isAutoSpinning.value;
                if (isAutoSpinning.value) {
                  rotationAngle.value = (rotationAngle.value + 45) % 360;
                }
              })}
            >
              ↺ {isAutoSpinning.value ? 'Auto-Spin Active' : 'Spin 45°'}
            </button>
          </div>
        </div>

        {/* Product Purchase & Controls */}
        <div class="product-details">
          <div>
            <h1 class="product-title">{product.title}</h1>
            <p class="product-tagline" style="margin-top: 8px;">{product.tagline}</p>
          </div>

          <div class="rating-row">
            <span class="stars">★★★★★</span>
            <strong style="color: #fff;">{product.rating}</strong>
            <span>({product.reviewCount} customer reviews)</span>
            <span>• SKU: {product.sku}</span>
          </div>

          <div class="price-row">
            <span class="current-price">{formatCurrency(selectedVariant.price, selectedCurrency.value)}</span>
            <span class="original-price">{formatCurrency(selectedVariant.originalPrice, selectedCurrency.value)}</span>
            <span class="stock-indicator">
              🔴 Only {selectedVariant.stock} items left in stock (High Demand!)
            </span>
          </div>

          {/* Live Inventory Bar */}
          <div style="background: rgba(255,255,255,0.05); border-radius: 6px; height: 8px; overflow: hidden; margin-top: -10px;">
            <div
              style={{
                width: `${(selectedVariant.stock / 25) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ff007f, #f59e0b)',
                transition: 'width 0.4s ease'
              }}
            ></div>
          </div>

          {/* Colorway / Variant Selector */}
          <div class="variant-section">
            <span class="variant-label">Select Colorway: <strong>{selectedVariant.name}</strong></span>
            <div class="variant-options">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  class={`variant-btn ${v.id === selectedVariantId.value ? 'active' : ''}`}
                  onClick$={$(() => selectedVariantId.value = v.id)}
                >
                  <span class="color-dot" style={{ backgroundColor: v.colorHex }}></span>
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          {/* LED Accent Light Customizer */}
          <div class="variant-section">
            <span class="variant-label">Custom LED Accent Light: <strong style={{ color: selectedLed.hex }}>{selectedLed.name}</strong></span>
            <div class="variant-options" style="flex-wrap: wrap;">
              {product.ledPresets.map((led) => (
                <button
                  key={led.id}
                  type="button"
                  class={`variant-btn ${led.id === selectedLedId.value ? 'active' : ''}`}
                  style={{
                    borderColor: led.id === selectedLedId.value ? led.hex : 'rgba(255,255,255,0.1)',
                    boxShadow: led.id === selectedLedId.value ? led.glowShadow : 'none'
                  }}
                  onClick$={$(() => selectedLedId.value = led.id)}
                >
                  <span class="color-dot" style={{ backgroundColor: led.hex, boxShadow: `0 0 8px ${led.hex}` }}></span>
                  {led.name}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart & Compare Action Bar */}
          <div class="action-buttons">
            <button
              type="button"
              class="btn-primary"
              onClick$={addToCart$}
            >
              🛒 Add to Resumable Cart ({formatCurrency(selectedVariant.price, selectedCurrency.value)})
            </button>
            <button
              type="button"
              class="variant-btn"
              style="padding: 16px 20px; font-size: 15px;"
              onClick$={$(() => isCompareOpen.value = true)}
            >
              ⚖️ Compare Specs
            </button>
          </div>
        </div>
      </main>

      {/* Audio Frequency Visualizer & Sound Demo Player Section */}
      <section style="background: var(--bg-card); border: 1px solid var(--accent-cyan); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 40px; box-shadow: 0 0 25px rgba(0, 246, 255, 0.15);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 20px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 10px;">
              🎵 Interactive Audio Frequency Visualizer & Sound Demo Player
            </h2>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
              Test planar magnetic bass response, ANC isolation, and 3D spatial surround sound directly in your browser.
            </p>
          </div>
          <button
            type="button"
            class="variant-btn active"
            style="padding: 10px 20px; font-size: 15px; border-color: var(--accent-cyan);"
            onClick$={$(() => isAudioPlaying.value = !isAudioPlaying.value)}
          >
            {isAudioPlaying.value ? '⏸ Pause Demo' : '▶ Play Sound Demo'}
          </button>
        </div>

        {/* Track Selector Row */}
        <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
          {product.audioTracks.map((tr) => (
            <button
              key={tr.id}
              type="button"
              class={`variant-btn ${tr.id === selectedAudioTrackId.value ? 'active' : ''}`}
              style="flex: 1; min-width: 240px; text-align: left; display: block; padding: 12px 16px;"
              onClick$={$(() => {
                selectedAudioTrackId.value = tr.id;
                isAudioPlaying.value = true;
              })}
            >
              <strong style="font-size: 14px; color: #fff; display: block;">{tr.title}</strong>
              <span style="font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px;">{tr.genre}</span>
            </button>
          ))}
        </div>

        {/* Interactive Audio Frequency Equalizer Canvas Bar Spectrum */}
        <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-align: center;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 100px; gap: 8px; max-width: 700px; margin: 0 auto;">
            {frequencyBars.map((height, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: `${height}%`,
                  background: isAudioPlaying.value
                    ? `linear-gradient(to top, var(--accent-cyan), var(--accent-magenta))`
                    : 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.1s ease'
                }}
              ></div>
            ))}
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 11px; color: var(--text-muted); max-width: 700px; margin: 12px auto 0 auto;">
            <span>20Hz Sub-Bass</span>
            <span>250Hz Mid-Bass</span>
            <span>1kHz Midrange</span>
            <span>4kHz Treble</span>
            <span>20kHz Ultra-High</span>
          </div>

          <p style="font-size: 13px; color: var(--accent-cyan); font-weight: 600; margin-top: 16px;">
            ℹ️ {selectedAudio.description}
          </p>
        </div>
      </section>

      {/* Social Proof Live Purchase Toast Popup */}
      {showToast.value && currentSocial && (
        <div style="position: fixed; bottom: 20px; left: 20px; z-index: 150; background: rgba(15, 23, 42, 0.95); border: 1px solid var(--accent-cyan); border-radius: 12px; padding: 12px 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); backdrop-filter: blur(12px); display: flex; align-items: center; gap: 12px; transition: opacity 0.3s ease;">
          <span style="font-size: 24px;">🔥</span>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: #fff;">
              Someone in <span style="color: var(--accent-cyan);">{currentSocial.location}</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">
              Purchased <strong>{currentSocial.variantName}</strong> • {currentSocial.timeAgo}
            </div>
          </div>
        </div>
      )}

      {/* Instant Qwik Resumability State Audit Banner */}
      <section class="resumability-card">
        <div class="resumability-header">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--accent-cyan);">
              ⚡ Qwik Resumable State Engine Audit (Comparison Matrix Engine)
            </h2>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
              Zero Hydration Delay — HTML contains pre-serialized application state without downloading JS hydration bundles!
            </p>
          </div>
          <span class="brand-badge" style="background: rgba(0, 246, 255, 0.2); color: var(--accent-cyan); border: 1px solid var(--accent-cyan);">
            0.0 ms Hydration Delay
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 14px; text-align: center;">
          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px;">
            <div style="font-size: 18px; font-weight: 700; color: #10b981;">{snapshot.hydrationCostMs} ms</div>
            <div style="font-size: 11px; color: var(--text-muted);">Hydration Execution Time</div>
          </div>
          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px;">
            <div style="font-size: 18px; font-weight: 700; color: var(--accent-cyan);">{snapshot.serializedObjectsCount}</div>
            <div style="font-size: 11px; color: var(--text-muted);">Serialized Qwik Stores</div>
          </div>
          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px;">
            <div style="font-size: 18px; font-weight: 700; color: var(--accent-purple);">{snapshot.payloadSizeBytes} B</div>
            <div style="font-size: 11px; color: var(--text-muted);">Resumable JSON Payload</div>
          </div>
          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px;">
            <div style="font-size: 18px; font-weight: 700; color: isCompareOpen.value ? '#10b981' : 'var(--text-muted)';">
              {isCompareOpen.value ? 'OPEN' : 'CLOSED'}
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">Comparison Drawer Store</div>
          </div>
        </div>
      </section>

      {/* Tabbed Information Section (Features, Specs, Reviews) */}
      <section style="background: var(--bg-card); border: 1px solid var(--border-glow); border-radius: var(--radius-lg); padding: 24px; backdrop-filter: blur(16px);">
        <div style="display: flex; gap: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
          <button
            type="button"
            class={`variant-btn ${activeTab.value === 'features' ? 'active' : ''}`}
            onClick$={$(() => activeTab.value = 'features')}
          >
            🔥 Features & Highlights
          </button>
          <button
            type="button"
            class={`variant-btn ${activeTab.value === 'specs' ? 'active' : ''}`}
            onClick$={$(() => activeTab.value = 'specs')}
          >
            📋 Technical Specifications
          </button>
          <button
            type="button"
            class={`variant-btn ${activeTab.value === 'reviews' ? 'active' : ''}`}
            onClick$={$(() => activeTab.value = 'reviews')}
          >
            ⭐ Customer Reviews ({filteredReviews.length})
          </button>
        </div>

        {activeTab.value === 'features' && (
          <ul style="display: flex; flex-direction: column; gap: 12px; list-style: none;">
            {product.features.map((feat, idx) => (
              <li key={idx} style="display: flex; align-items: center; gap: 10px; font-size: 15px; color: var(--text-main);">
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab.value === 'specs' && (
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            {Object.entries(product.specs).map(([key, val]) => (
              <div key={key} style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px;">
                <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); display: block; text-transform: uppercase;">{key}</span>
                <strong style="font-size: 14px; color: #fff; margin-top: 4px; display: block;">{val}</strong>
              </div>
            ))}
          </div>
        )}

        {activeTab.value === 'reviews' && (
          <div>
            {/* Star Filter */}
            <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 20px;">
              <span style="font-size: 13px; font-weight: 700; color: var(--text-muted);">Filter by Rating:</span>
              <button type="button" class={`variant-btn ${ratingFilter.value === 0 ? 'active' : ''}`} onClick$={$(() => ratingFilter.value = 0)}>All Stars</button>
              <button type="button" class={`variant-btn ${ratingFilter.value === 5 ? 'active' : ''}`} onClick$={$(() => ratingFilter.value = 5)}>5 Stars Only</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px;">
              {filteredReviews.map((rev) => (
                <div key={rev.id} style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 20px;">{rev.avatar}</span>
                      <strong style="font-size: 15px; color: #fff;">{rev.author}</strong>
                      {rev.verified && <span style="font-size: 11px; background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 6px; border-radius: 4px;">Verified Purchaser</span>}
                    </div>
                    <span style="font-size: 13px; color: var(--text-muted);">{rev.date}</span>
                  </div>
                  <div class="stars" style="margin-bottom: 6px;">{'★'.repeat(rev.rating)}</div>
                  <strong style="font-size: 15px; color: #fff; display: block; margin-bottom: 4px;">{rev.title}</strong>
                  <p style="font-size: 14px; color: var(--text-muted);">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Comparison Matrix Modal Overlay Drawer */}
      {isCompareOpen.value && (
        <div style="position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 20px;">
          <div style="background: var(--bg-dark); border: 1px solid var(--accent-cyan); border-radius: var(--radius-lg); width: 100%; max-width: 960px; max-height: 90vh; overflow-y: auto; padding: 28px; box-shadow: 0 0 40px rgba(0, 246, 255, 0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 24px;">
              <div>
                <h2 style="font-size: 22px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 10px;">
                  ⚖️ Nexus Headphone Lineup Comparison Matrix
                </h2>
                <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
                  Side-by-side specification breakdown across Apex Air, Apex Pro, and Apex Studio models.
                </p>
              </div>
              <button
                type="button"
                style="background: transparent; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;"
                onClick$={$(() => isCompareOpen.value = false)}
              >
                ✕
              </button>
            </div>

            {/* Matrix Breakdown Table */}
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                <thead>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.15);">
                    <th style="padding: 12px; color: var(--text-muted);">Feature / Spec</th>
                    {comparisonModels.map((m) => (
                      <th
                        key={m.id}
                        style={{
                          padding: '12px',
                          color: m.isCurrentProduct ? 'var(--accent-cyan)' : '#fff',
                          background: m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent',
                          borderRadius: '8px 8px 0 0'
                        }}
                      >
                        <div style="font-size: 16px; font-weight: 800;">{m.name}</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">{m.tagline}</div>
                        <div style="font-size: 18px; font-weight: 800; color: var(--accent-magenta); margin-top: 6px;">
                          {formatCurrency(m.priceUSD, selectedCurrency.value)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px; font-weight: 700; color: var(--text-muted);">Driver Type</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} style={{ padding: '12px', background: m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent' }}>{m.driver}</td>
                    ))}
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px; font-weight: 700; color: var(--text-muted);">Frequency Response</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} style={{ padding: '12px', background: m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent' }}>{m.frequency}</td>
                    ))}
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px; font-weight: 700; color: var(--text-muted);">Noise Cancellation</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} style={{ padding: '12px', background: m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent' }}>{m.ancLevel}</td>
                    ))}
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px; font-weight: 700; color: var(--text-muted);">Battery Life</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} style={{ padding: '12px', background: m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent' }}>{m.battery}</td>
                    ))}
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px; font-weight: 700; color: var(--text-muted);">Weight</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} style={{ padding: '12px', background: m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent' }}>{m.weight}</td>
                    ))}
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px; font-weight: 700; color: var(--text-muted);">Wireless Latency</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} style={{ padding: '12px', background: m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent' }}>{m.latency}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="text-align: right; margin-top: 24px;">
              <button
                type="button"
                class="btn-primary"
                style="padding: 12px 24px; font-size: 14px;"
                onClick$={$(() => isCompareOpen.value = false)}
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Overlay */}
      <div
        class={`cart-backdrop ${isCartOpen.value ? 'open' : ''}`}
        onClick$={$(() => isCartOpen.value = false)}
      ></div>

      <aside class={`cart-drawer ${isCartOpen.value ? 'open' : ''}`}>
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #fff;">🛒 Your Cyber Cart</h2>
          <button
            type="button"
            style="background: transparent; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer;"
            onClick$={$(() => isCartOpen.value = false)}
          >
            ✕
          </button>
        </div>

        <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px;">
          {cartStore.items.length === 0 ? (
            <p style="text-align: center; color: var(--text-muted); margin-top: 40px;">Your cart is empty.</p>
          ) : (
            cartStore.items.map((item) => (
              <div key={item.variantId} style="display: flex; gap: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px; align-items: center;">
                <img src={item.image} alt={item.name} width="50" height="50" style="object-fit: cover; border-radius: 6px;" />
                <div style="flex: 1;">
                  <strong style="font-size: 13px; color: #fff; display: block;">{item.name}</strong>
                  <span style="font-size: 13px; color: var(--accent-cyan); font-weight: 700;">{formatCurrency(item.price, selectedCurrency.value)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <button type="button" style="background: rgba(255,255,255,0.1); border: none; color: #fff; width: 24px; height: 24px; border-radius: 4px; cursor: pointer;" onClick$={$(() => updateQuantity$(item.variantId, -1))}>-</button>
                  <span style="font-size: 13px; font-weight: 700;">{item.quantity}</span>
                  <button type="button" style="background: rgba(255,255,255,0.1); border: none; color: #fff; width: 24px; height: 24px; border-radius: 4px; cursor: pointer;" onClick$={$(() => updateQuantity$(item.variantId, 1))}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo Code Input */}
        <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <input
              type="text"
              placeholder="Promo Code (QWIK15)"
              value={promoCodeInput.value}
              onInput$={$((e) => promoCodeInput.value = (e.target as HTMLInputElement).value)}
              style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 13px; outline: none;"
            />
            <button
              type="button"
              class="variant-btn"
              onClick$={applyPromo$}
            >
              Apply
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--text-muted);">
            <div style="display: flex; justify-content: space-between;">
              <span>Subtotal:</span>
              <strong style="color: #fff;">{totals.formattedSubtotal}</strong>
            </div>
            {totals.discount > 0 && (
              <div style="display: flex; justify-content: space-between; color: #10b981;">
                <span>Discount (QWIK15):</span>
                <strong>-{totals.formattedDiscount}</strong>
              </div>
            )}
            <div style="display: flex; justify-content: space-between;">
              <span>Shipping:</span>
              <strong style="color: #fff;">{totals.formattedShipping}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #fff; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; margin-top: 4px;">
              <span>Total ({selectedCurrency.value}):</span>
              <span style="color: var(--accent-cyan);">{totals.formattedTotal}</span>
            </div>
          </div>

          <button
            type="button"
            class="btn-primary"
            style="width: 100%; margin-top: 16px;"
            onClick$={$(() => alert(`Order placed for ${totals.formattedTotal}!`))}
          >
            Checkout Instant
          </button>
        </div>
      </aside>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Nexus Apex Pro Wireless ANC Headphones | Qwik Matrix Engine',
  meta: [
    {
      name: 'description',
      content: 'Instant load, resumable state Qwik E-commerce product page with product comparison matrix drawer.'
    }
  ]
};
