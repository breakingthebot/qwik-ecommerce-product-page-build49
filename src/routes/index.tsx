import { component$, useStore, useSignal, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import {
  getProductData,
  calculateCartTotals,
  formatCurrency,
  filterReviews,
  getResumableSnapshot,
  type CartItem
} from '../services/productService';

export default component$(() => {
  const product = getProductData();

  // Qwik Resumable Reactive State
  const selectedVariantId = useSignal(product.variants[0].id);
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
        quantity: 1
      }
    ]
  });

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId.value) || product.variants[0];

  // Resumable Action Handlers ($ serializes function boundaries for Qwik resumability)
  const addToCart$ = $(() => {
    const existingIndex = cartStore.items.findIndex(item => item.variantId === selectedVariant.id);
    if (existingIndex > -1) {
      cartStore.items[existingIndex].quantity += 1;
    } else {
      cartStore.items.push({
        variantId: selectedVariant.id,
        name: `${product.title} (${selectedVariant.name})`,
        price: selectedVariant.price,
        image: selectedVariant.image,
        quantity: 1
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

  const totals = calculateCartTotals(cartStore.items, appliedPromo.value);
  const filteredReviews = filterReviews(product.reviews, ratingFilter.value);
  const snapshot = getResumableSnapshot(cartStore.items, selectedVariantId.value);
  const totalCartCount = cartStore.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div class="container" style="padding-bottom: 60px;">
      {/* Header Navbar */}
      <header class="navbar">
        <a href="#" class="brand-logo">
          ⚡ NEXUS<span style="color: var(--accent-cyan);">CYBER</span>
          <span class="brand-badge">Qwik Resumable</span>
        </a>
        <div class="nav-actions">
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
        {/* Media Gallery Showcase */}
        <div class="product-gallery">
          <div class="main-image-frame">
            <img
              src={selectedVariant.image}
              alt={selectedVariant.name}
              width="800"
              height="600"
              loading="eager"
            />
            {selectedVariant.badge && (
              <span class="image-badge-tag">🔥 {selectedVariant.badge}</span>
            )}
          </div>
        </div>

        {/* Product Purchase Controls */}
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
            <span class="current-price">{formatCurrency(selectedVariant.price)}</span>
            <span class="original-price">{formatCurrency(selectedVariant.originalPrice)}</span>
            <span class="stock-indicator">
              🟢 {selectedVariant.stock} items in stock (Ready for Instant Dispatch)
            </span>
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

          {/* Add to Cart Action Bar */}
          <div class="action-buttons">
            <button
              type="button"
              class="btn-primary"
              onClick$={addToCart$}
            >
              🛒 Add to Resumable Cart ({formatCurrency(selectedVariant.price)})
            </button>
          </div>
        </div>
      </main>

      {/* Instant Qwik Resumability State Audit Banner */}
      <section class="resumability-card">
        <div class="resumability-header">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--accent-cyan);">
              ⚡ Qwik Resumable State Engine Audit
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
            <div style="font-size: 18px; font-weight: 700; color: var(--accent-magenta);">{selectedVariant.name}</div>
            <div style="font-size: 11px; color: var(--text-muted);">Active Variant Store</div>
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
                  <span style="font-size: 13px; color: var(--accent-cyan); font-weight: 700;">{formatCurrency(item.price)}</span>
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
              <strong style="color: #fff;">{formatCurrency(totals.subtotal)}</strong>
            </div>
            {totals.discount > 0 && (
              <div style="display: flex; justify-content: space-between; color: #10b981;">
                <span>Discount (QWIK15):</span>
                <strong>-{formatCurrency(totals.discount)}</strong>
              </div>
            )}
            <div style="display: flex; justify-content: space-between;">
              <span>Shipping:</span>
              <strong style="color: #fff;">{totals.shipping === 0 ? 'FREE' : formatCurrency(totals.shipping)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #fff; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; margin-top: 4px;">
              <span>Total:</span>
              <span style="color: var(--accent-cyan);">{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <button
            type="button"
            class="btn-primary"
            style="width: 100%; margin-top: 16px;"
            onClick$={$(() => alert(`Order placed for ${formatCurrency(totals.total)}!`))}
          >
            Checkout Instant
          </button>
        </div>
      </aside>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Nexus Apex Pro Wireless ANC Headphones | Qwik E-Commerce',
  meta: [
    {
      name: 'description',
      content: 'Instant load, resumable state Qwik E-commerce product page with zero hydration delay.'
    }
  ]
};
