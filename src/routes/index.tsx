import { component$, useStore, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import {
  getProductData,
  calculateCartTotals,
  formatCurrency,
  filterReviews,
  filterQnaItems,
  getResumableSnapshot,
  calculate360Rotation,
  calculateFlashSaleCountdown,
  calculateFrequencyBars,
  calculateEqCurve,
  getComparisonModels,
  getArMetadata,
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
  const selectedEqPresetId = useSignal(product.eqPresets[0].id);
  const selectedArLightingId = useSignal(product.arLightingPresets[0].id);
  const eqGains = useStore<number[]>([0, 0, 0, 0, 0]);

  const selectedCurrency = useSignal<CurrencyCode>('USD');
  const isCompareOpen = useSignal<boolean>(false);
  const isArOpen = useSignal<boolean>(false);
  const isQnaOpen = useSignal<boolean>(false);
  const qnaSearchQuery = useSignal<string>('');
  const qnaCategoryFilter = useSignal<string>('ALL');
  const userQuestionInput = useSignal<string>('');
  const qnaListStore = useStore({ items: product.qnaList });

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
  const selectedEqPreset = product.eqPresets.find(e => e.id === selectedEqPresetId.value) || product.eqPresets[0];
  const selectedArLighting = product.arLightingPresets.find(a => a.id === selectedArLightingId.value) || product.arLightingPresets[0];
  const arMeta = getArMetadata(selectedVariant.id);
  const frequencyBars = calculateFrequencyBars(selectedAudio.waveformPeaks, isAudioPlaying.value ? audioTimeOffset.value : 0);
  const eqCurveSvg = calculateEqCurve(eqGains, 600, 100);
  const countdown = calculateFlashSaleCountdown(flashSaleSeconds.value);
  const currentSocial = product.socialPurchases[activeSocialPurchaseIndex.value];
  const filteredQnaList = filterQnaItems(qnaListStore.items, qnaSearchQuery.value, qnaCategoryFilter.value);

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

  const selectEqPreset$ = $((presetId: string) => {
    selectedEqPresetId.value = presetId;
    const found = product.eqPresets.find(p => p.id === presetId);
    if (found) {
      found.gains.forEach((g, i) => eqGains[i] = g);
    }
  });

  const updateGain$ = $((index: number, val: number) => {
    eqGains[index] = val;
  });

  const upvoteQuestion$ = $((qnaId: string) => {
    const found = qnaListStore.items.find(q => q.id === qnaId);
    if (found) {
      found.upvotes += 1;
    }
  });

  const submitUserQuestion$ = $(() => {
    if (!userQuestionInput.value.trim()) return;
    qnaListStore.items.unshift({
      id: `qna-${Date.now()}`,
      category: 'Audio & ANC',
      question: userQuestionInput.value.trim(),
      answer: 'Our Cyber Support team will answer this question shortly!',
      author: 'You (Verified Buyer)',
      upvotes: 1,
      date: 'Just now'
    });
    userQuestionInput.value = '';
  });

  const totals = calculateCartTotals(cartStore.items, appliedPromo.value, selectedCurrency.value);
  const filteredReviews = filterReviews(product.reviews, ratingFilter.value);
  const snapshot = getResumableSnapshot(cartStore.items, selectedVariantId.value, selectedLedId.value, rotationAngle.value, flashSaleSeconds.value, selectedAudioTrackId.value, selectedCurrency.value, isCompareOpen.value, selectedEqPresetId.value, isArOpen.value, isQnaOpen.value);
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
          <span class="brand-badge">Qwik Resumable Engine v0.9.0</span>
        </a>

        <div class="nav-actions" style="display: flex; gap: 12px; align-items: center;">
          <button
            type="button"
            class="variant-btn"
            style="padding: 8px 14px; font-size: 13px; border-color: var(--accent-cyan);"
            onClick$={$(() => isArOpen.value = true)}
          >
            🥽 View in AR / 3D
          </button>

          <button
            type="button"
            class="variant-btn"
            style="padding: 8px 14px; font-size: 13px;"
            onClick$={$(() => isCompareOpen.value = true)}
          >
            ⚖️ Compare Models
          </button>

          <button
            type="button"
            class="variant-btn"
            style="padding: 8px 14px; font-size: 13px; border-color: var(--accent-purple);"
            onClick$={$(() => isQnaOpen.value = true)}
          >
            💬 Community Q&A ({qnaListStore.items.length})
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
            style={`box-shadow: ${selectedLed.glowShadow}; cursor: ${isDragging.value ? 'grabbing' : 'grab'}; user-select: none;`}
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
              style={`transform: rotateY(${rotationAngle.value}deg); transition: ${isDragging.value ? 'none' : 'transform 0.1s ease'};`}
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
              style={`position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 50% 50%, ${selectedLed.hex}25 0%, transparent 70%);`}
            ></div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 16px;">
            <span style="font-size: 13px; color: var(--text-muted);">👉 Drag horizontally to rotate 360°</span>
            <div style="display: flex; gap: 8px;">
              <button
                type="button"
                class="variant-btn"
                style="padding: 4px 12px; font-size: 12px; border-color: var(--accent-cyan);"
                onClick$={$(() => isArOpen.value = true)}
              >
                🥽 Launch AR
              </button>
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
              style={`width: ${(selectedVariant.stock / 25) * 100}%; height: 100%; background: linear-gradient(90deg, #ff007f, #f59e0b); transition: width 0.4s ease;`}
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
                  <span class="color-dot" style={`background-color: ${v.colorHex};`}></span>
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          {/* LED Accent Light Customizer */}
          <div class="variant-section">
            <span class="variant-label">Custom LED Accent Light: <strong style={`color: ${selectedLed.hex};`}>{selectedLed.name}</strong></span>
            <div class="variant-options" style="flex-wrap: wrap;">
              {product.ledPresets.map((led) => (
                <button
                  key={led.id}
                  type="button"
                  class={`variant-btn ${led.id === selectedLedId.value ? 'active' : ''}`}
                  style={`border-color: ${led.id === selectedLedId.value ? led.hex : 'rgba(255,255,255,0.1)'}; box-shadow: ${led.id === selectedLedId.value ? led.glowShadow : 'none'};`}
                  onClick$={$(() => selectedLedId.value = led.id)}
                >
                  <span class="color-dot" style={`background-color: ${led.hex}; box-shadow: 0 0 8px ${led.hex};`}></span>
                  {led.name}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart, Compare, & Q&A Action Bar */}
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

      {/* Interactive Sound Profile Equalizer Section */}
      <section style="background: var(--bg-card); border: 1px solid var(--accent-magenta); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 40px; box-shadow: 0 0 25px rgba(255, 0, 127, 0.15);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 20px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 10px;">
              🎛️ Interactive Sound Profile Equalizer & DSP Curve Customizer
            </h2>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
              Customize frequency gains (-12dB to +12dB) across 5 acoustic bands or choose a hardware DSP preset.
            </p>
          </div>
        </div>

        {/* EQ Presets Row */}
        <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
          {product.eqPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              class={`variant-btn ${preset.id === selectedEqPresetId.value ? 'active' : ''}`}
              style="flex: 1; min-width: 200px; text-align: left; padding: 12px 16px; display: block;"
              onClick$={$(() => selectEqPreset$(preset.id))}
            >
              <strong style="font-size: 14px; color: #fff; display: block;">{preset.name}</strong>
              <span style="font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px;">{preset.description}</span>
            </button>
          ))}
        </div>

        {/* Interactive Response Curve SVG Visualization */}
        <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; position: relative;">
          <svg width="100%" height="100" viewBox="0 0 600 100" style="overflow: visible;">
            <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.2)" stroke-dasharray="4 4" />
            <path d={eqCurveSvg} fill="none" stroke="var(--accent-magenta)" stroke-width="3" />
          </svg>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 8px;">
            <span>60Hz (Sub-Bass)</span>
            <span>250Hz (Low-Mid)</span>
            <span>1kHz (Mid)</span>
            <span>4kHz (Presence)</span>
            <span>12kHz (Treble)</span>
          </div>
        </div>

        {/* 5-Band Gain Sliders */}
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px;">
          {['60Hz', '250Hz', '1kHz', '4kHz', '12kHz'].map((label, idx) => (
            <div key={label} style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; text-align: center;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 6px;">{label}</span>
              <div style={`font-size: 16px; font-weight: 800; color: ${eqGains[idx] > 0 ? '#10b981' : eqGains[idx] < 0 ? '#ef4444' : '#fff'}; margin-bottom: 8px;`}>
                {eqGains[idx] > 0 ? `+${eqGains[idx]}` : eqGains[idx]} dB
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eqGains[idx]}
                onInput$={$((e) => updateGain$(idx, parseInt((e.target as HTMLInputElement).value, 10)))}
                style="width: 100%; accent-color: var(--accent-magenta); cursor: pointer;"
              />
            </div>
          ))}
        </div>
      </section>

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
                style={`flex: 1; height: ${height}%; background: ${isAudioPlaying.value ? 'linear-gradient(to top, var(--accent-cyan), var(--accent-magenta))' : 'rgba(255, 255, 255, 0.15)'}; border-radius: 4px 4px 0 0; transition: height 0.1s ease;`}
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
              ⚡ Qwik Resumable State Engine Audit (Community Q&A & AR Engine)
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
            <div style={`font-size: 18px; font-weight: 700; color: ${isQnaOpen.value ? '#10b981' : 'var(--accent-purple)'};`}>
              {isQnaOpen.value ? 'Q&A OPEN' : `${qnaListStore.items.length} Q&As`}
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">Community Q&A Store</div>
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

      {/* Community Q&A Knowledge Base Drawer Overlay */}
      {isQnaOpen.value && (
        <div style="position: fixed; inset: 0; z-index: 340; background: rgba(0,0,0,0.85); backdrop-filter: blur(14px); display: flex; align-items: center; justify-content: center; padding: 20px;">
          <div style="background: var(--bg-dark); border: 1px solid var(--accent-purple); border-radius: var(--radius-lg); width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto; padding: 28px; box-shadow: 0 0 45px rgba(139, 92, 246, 0.35);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
              <div>
                <h2 style="font-size: 22px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 10px;">
                  💬 Community Q&A & Knowledge Base
                </h2>
                <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
                  Search pre-purchase questions answered by engineers and verified owners.
                </p>
              </div>
              <button
                type="button"
                style="background: transparent; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;"
                onClick$={$(() => isQnaOpen.value = false)}
              >
                ✕
              </button>
            </div>

            {/* Search & Category Filter Row */}
            <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
              <input
                type="text"
                placeholder="🔍 Search questions (e.g., ANC, battery, dongle, warranty)..."
                value={qnaSearchQuery.value}
                onInput$={$((e) => qnaSearchQuery.value = (e.target as HTMLInputElement).value)}
                style="flex: 2; min-width: 260px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glow); color: #fff; padding: 10px 14px; border-radius: 8px; font-size: 14px; outline: none;"
              />
              <div style="display: flex; gap: 8px; flex: 3; flex-wrap: wrap;">
                {['ALL', 'Audio & ANC', 'Connectivity', 'Battery & Charge', 'Warranty & Shipping'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    class={`variant-btn ${qnaCategoryFilter.value === cat ? 'active' : ''}`}
                    style="padding: 6px 12px; font-size: 12px;"
                    onClick$={$(() => qnaCategoryFilter.value = cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Q&A Accordion Items */}
            <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
              {filteredQnaList.length === 0 ? (
                <p style="text-align: center; color: var(--text-muted); padding: 30px;">No questions matched your search query.</p>
              ) : (
                filteredQnaList.map((item) => (
                  <div key={item.id} style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
                      <div>
                        <span style="font-size: 11px; font-weight: 700; background: rgba(139, 92, 246, 0.2); color: var(--accent-purple); padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                          {item.category}
                        </span>
                        <h3 style="font-size: 15px; font-weight: 700; color: #fff; margin-top: 6px;">❓ {item.question}</h3>
                      </div>
                      <button
                        type="button"
                        class="variant-btn"
                        style="padding: 4px 10px; font-size: 12px; flex-shrink: 0;"
                        onClick$={$(() => upvoteQuestion$(item.id))}
                      >
                        👍 Upvote ({item.upvotes})
                      </button>
                    </div>

                    <p style="font-size: 14px; color: var(--text-muted); background: rgba(0,0,0,0.3); border-left: 3px solid var(--accent-cyan); padding: 10px 14px; border-radius: 0 6px 6px 0; margin-top: 8px;">
                      💬 <strong>Answer:</strong> {item.answer}
                    </p>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px; text-align: right;">
                      Asked by {item.author} • {item.date}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ask a Question Input Box */}
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px;">
              <h4 style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 8px;">Have a question about Nexus Apex Pro?</h4>
              <div style="display: flex; gap: 10px;">
                <input
                  type="text"
                  placeholder="Type your question here..."
                  value={userQuestionInput.value}
                  onInput$={$((e) => userQuestionInput.value = (e.target as HTMLInputElement).value)}
                  style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 14px; border-radius: 8px; font-size: 13px; outline: none;"
                />
                <button
                  type="button"
                  class="btn-primary"
                  style="padding: 10px 20px; font-size: 13px; flex-shrink: 0;"
                  onClick$={submitUserQuestion$}
                >
                  Submit Question
                </button>
              </div>
            </div>

            <div style="text-align: right; margin-top: 20px;">
              <button
                type="button"
                class="variant-btn"
                style="padding: 10px 20px; font-size: 14px;"
                onClick$={$(() => isQnaOpen.value = false)}
              >
                Close Q&A Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AR Spatial Model Viewer Modal Overlay */}
      {isArOpen.value && (
        <div style="position: fixed; inset: 0; z-index: 350; background: rgba(0,0,0,0.9); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; padding: 20px;">
          <div style="background: var(--bg-dark); border: 1px solid var(--accent-cyan); border-radius: var(--radius-lg); width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto; padding: 28px; box-shadow: 0 0 50px rgba(0, 246, 255, 0.35);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
              <div>
                <h2 style="font-size: 22px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 10px;">
                  🥽 WebXR Augmented Reality (AR) Spatial Viewer
                </h2>
                <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
                  Project 1:1 true-scale model in your physical room or preview 3D environment lighting.
                </p>
              </div>
              <button
                type="button"
                style="background: transparent; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;"
                onClick$={$(() => isArOpen.value = false)}
              >
                ✕
              </button>
            </div>

            {/* AR Viewport Frame */}
            <div style={`position: relative; background: radial-gradient(circle at 50% 50%, ${selectedArLighting.ambientHex}30 0%, #070913 80%); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 20px;`}>
              <img
                src={selectedVariant.image}
                alt={selectedVariant.name}
                style={`width: 60%; height: 60%; object-fit: contain; filter: drop-shadow(0 20px 30px rgba(0,0,0,${selectedArLighting.shadowIntensity})); transform: rotateY(${rotationAngle.value}deg);`}
              />
              <span class="image-badge-tag" style="top: 16px; left: 16px;">
                📐 {arMeta.scaleRatio}
              </span>
              <span class="image-badge-tag" style="top: 16px; left: auto; right: 16px; background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #10b981;">
                ● WebXR Tracking Active
              </span>
            </div>

            {/* Controls & QR Code Row */}
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: center;">
              <div>
                <span style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 8px;">Studio Environment Lighting:</span>
                <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                  {product.arLightingPresets.map((lp) => (
                    <button
                      key={lp.id}
                      type="button"
                      class={`variant-btn ${lp.id === selectedArLightingId.value ? 'active' : ''}`}
                      onClick$={$(() => selectedArLightingId.value = lp.id)}
                    >
                      <span class="color-dot" style={`background-color: ${lp.ambientHex};`}></span>
                      {lp.name}
                    </button>
                  ))}
                </div>

                <div style="font-size: 13px; color: var(--text-muted); display: flex; gap: 16px;">
                  <span>📦 GLB Model: <a href={arMeta.glbUrl} target="_blank" style="color: var(--accent-cyan); font-weight: 700;">Download .GLB</a></span>
                  <span>🍏 USDZ Model: <a href={arMeta.usdzUrl} target="_blank" style="color: var(--accent-magenta); font-weight: 700;">Download .USDZ</a></span>
                </div>
              </div>

              {/* Mobile Scan QR Code */}
              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; text-align: center;">
                <img src={arMeta.arQrCodeUrl} alt="AR QR Code" width="120" height="120" style="border-radius: 8px; margin: 0 auto; display: block;" />
                <span style="font-size: 11px; color: var(--text-muted); margin-top: 6px; display: block;">Scan with Mobile Camera for iOS / Android AR</span>
              </div>
            </div>

            <div style="text-align: right; margin-top: 20px;">
              <button
                type="button"
                class="btn-primary"
                style="padding: 10px 20px; font-size: 14px;"
                onClick$={$(() => isArOpen.value = false)}
              >
                Close AR Viewport
              </button>
            </div>
          </div>
        </div>
      )}

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
                        style={`padding: 12px; color: ${m.isCurrentProduct ? 'var(--accent-cyan)' : '#fff'}; background: ${m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent'}; border-radius: 8px 8px 0 0;`}
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
                      <td key={m.id} style={`padding: 12px; background: ${m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent'};`}>{m.driver}</td>
                    ))}
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px; font-weight: 700; color: var(--text-muted);">Frequency Response</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} style={`padding: 12px; background: ${m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent'};`}>{m.frequency}</td>
                    ))}
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px; font-weight: 700; color: var(--text-muted);">Noise Cancellation</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} style={`padding: 12px; background: ${m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent'};`}>{m.ancLevel}</td>
                    ))}
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px; font-weight: 700; color: var(--text-muted);">Battery Life</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} style={`padding: 12px; background: ${m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent'};`}>{m.battery}</td>
                    ))}
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px; font-weight: 700; color: var(--text-muted);">Weight</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} style={`padding: 12px; background: ${m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent'};`}>{m.weight}</td>
                    ))}
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px; font-weight: 700; color: var(--text-muted);">Wireless Latency</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} style={`padding: 12px; background: ${m.isCurrentProduct ? 'rgba(0, 246, 255, 0.08)' : 'transparent'};`}>{m.latency}</td>
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
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #fff; border-top: 1px solid rgba(255,255,255,0.1); paddingTop: 8px; margin-top: 4px;">
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
  title: 'Nexus Apex Pro Wireless ANC Headphones | Qwik Community Q&A Engine',
  meta: [
    {
      name: 'description',
      content: 'Instant load, resumable state Qwik E-commerce product page with searchable Community Q&A Knowledge Base drawer.'
    }
  ]
};
