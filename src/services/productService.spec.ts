// src/services/productService.spec.ts
// Vitest unit tests for Build 49 Product Service.
// Updated: 2026-07-29 for Iteration 7

import { describe, it, expect } from 'vitest';
import {
  getProductData,
  calculateCartTotals,
  formatCurrency,
  filterReviews,
  getResumableSnapshot,
  calculate360Rotation,
  calculateFlashSaleCountdown,
  calculateFrequencyBars,
  convertCurrency,
  getComparisonModels,
  calculateEqCurve
} from './productService';

describe('productService', () => {
  it('retrieves valid product catalog data with variants, specs, social purchases, audio tracks, and eq presets', () => {
    const data = getProductData();
    expect(data.id).toBe('apex-pro-cyber-v1');
    expect(data.variants.length).toBe(3);
    expect(data.specs['Driver Size']).toBeDefined();
    expect(data.reviews.length).toBeGreaterThan(0);
    expect(data.ledPresets.length).toBe(5);
    expect(data.socialPurchases.length).toBe(4);
    expect(data.audioTracks.length).toBe(3);
    expect(data.eqPresets.length).toBe(4);
  });

  it('calculates SVG path curve coordinates for Equalizer response curves', () => {
    const flatCurve = calculateEqCurve([0, 0, 0, 0, 0], 600, 120);
    expect(flatCurve).toContain('M 0,60');
    expect(flatCurve).toContain('L 600,60');

    const bassCurve = calculateEqCurve([8, 5, 1, 0, 2], 600, 120);
    expect(bassCurve).not.toEqual(flatCurve);
  });

  it('retrieves comparison matrix models comparing Apex Air, Apex Pro, and Apex Studio', () => {
    const models = getComparisonModels();
    expect(models.length).toBe(3);
    const pro = models.find(m => m.id === 'apex-pro');
    expect(pro?.isCurrentProduct).toBe(true);
    expect(pro?.priceUSD).toBe(349.99);
  });

  it('converts currencies (USD, EUR, GBP, JPY) with accurate rates and symbols', () => {
    const usd = convertCurrency(100, 'USD');
    expect(usd.formatted).toBe('$100.00');

    const eur = convertCurrency(100, 'EUR');
    expect(eur.formatted).toBe('€92.00');

    const gbp = convertCurrency(100, 'GBP');
    expect(gbp.formatted).toBe('£78.00');

    const jpy = convertCurrency(100, 'JPY');
    expect(jpy.formatted).toBe('¥15,500');
  });

  it('calculates audio frequency visualizer bar heights dynamically', () => {
    const peaks = [40, 85, 95, 60];
    const bars1 = calculateFrequencyBars(peaks, 0);
    expect(bars1.length).toBe(4);
    expect(bars1.every(b => b >= 15 && b <= 100)).toBe(true);

    const bars2 = calculateFrequencyBars(peaks, 1.5);
    expect(bars2).not.toEqual(bars1);
  });

  it('calculates Flash Sale countdown time formats correctly', () => {
    const timer1 = calculateFlashSaleCountdown(3665); // 1 hr, 1 min, 5 sec
    expect(timer1.hours).toBe('01');
    expect(timer1.minutes).toBe('01');
    expect(timer1.seconds).toBe('05');
    expect(timer1.formatted).toBe('01:01:05');
    expect(timer1.isExpired).toBe(false);

    const expired = calculateFlashSaleCountdown(0);
    expect(expired.isExpired).toBe(true);
    expect(expired.formatted).toBe('00:00:00');
  });

  it('calculates 360-degree rotation angles and frame indices from drag delta', () => {
    const rot1 = calculate360Rotation(0, 180, 0.5);
    expect(rot1.angle).toBe(90);
    expect(rot1.frameIndex).toBe(6); // 90/360 * 24 = 6
    expect(rot1.normalizedDeg).toBe('90°');

    const rot2 = calculate360Rotation(350, 40, 0.5);
    expect(rot2.angle).toBe(10); // (350 + 20) % 360 = 10
    expect(rot2.normalizedDeg).toBe('10°');
  });

  it('calculates cart totals and promo discounts accurately in USD and EUR', () => {
    const items = [
      { variantId: 'var-cyber-black', name: 'Cyber Onyx', price: 349.99, image: '', quantity: 1 }
    ];

    const standardUSD = calculateCartTotals(items, '', 'USD');
    expect(standardUSD.subtotal).toBe(349.99);
    expect(standardUSD.formattedSubtotal).toBe('$349.99');
    expect(standardUSD.shipping).toBe(0);

    const discountedEUR = calculateCartTotals(items, 'QWIK15', 'EUR');
    expect(discountedEUR.formattedDiscount).toBe('€48.30'); // $52.50 * 0.92 = €48.30
    expect(discountedEUR.total).toBeLessThan(standardUSD.total);
  });

  it('formats currency numbers correctly for target currency', () => {
    expect(formatCurrency(349.99, 'USD')).toBe('$349.99');
    expect(formatCurrency(349.99, 'EUR')).toBe('€321.99');
  });

  it('filters product reviews by star rating', () => {
    const data = getProductData();
    const all = filterReviews(data.reviews, 0);
    const fiveStars = filterReviews(data.reviews, 5);

    expect(all.length).toBe(3);
    expect(fiveStars.length).toBe(2);
    expect(fiveStars.every(r => r.rating >= 5)).toBe(true);
  });

  it('generates serialized resumable state snapshot with 0ms hydration cost and EQ state', () => {
    const items = [
      { variantId: 'var-cyber-black', name: 'Cyber Onyx', price: 349.99, image: '', quantity: 1 }
    ];
    const snapshot = getResumableSnapshot(items, 'var-cyber-black', 'led-magenta', 180, 14400, 'tr-bass', 'EUR', true, 'eq-bass');

    expect(snapshot.hydrationCostMs).toBe(0.0);
    expect(snapshot.serializedObjectsCount).toBe(9);
    expect(snapshot.payloadSizeBytes).toBeGreaterThan(0);
  });
});
