// src/services/productService.spec.ts
// Vitest unit tests for Build 49 Product Service.
// Updated: 2026-07-29 for Iteration 9

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
  calculateEqCurve,
  getArMetadata,
  filterQnaItems
} from './productService';

describe('productService', () => {
  it('retrieves valid product catalog data with variants, specs, audio tracks, eq presets, ar lighting presets, and qna list', () => {
    const data = getProductData();
    expect(data.id).toBe('nexus-apex-pro-01');
    expect(data.variants.length).toBe(3);
    expect(data.specs['Driver Size']).toBeDefined();
    expect(data.reviews.length).toBeGreaterThan(0);
    expect(data.ledPresets.length).toBe(5);
    expect(data.socialPurchases.length).toBe(4);
    expect(data.audioTracks.length).toBe(3);
    expect(data.eqPresets.length).toBe(4);
    expect(data.arLightingPresets.length).toBe(3);
    expect(data.qnaList.length).toBe(5);
  });

  it('filters Community Q&A items by search query and category filter', () => {
    const data = getProductData();
    const all = filterQnaItems(data.qnaList, '', 'ALL');
    expect(all.length).toBe(5);

    const ancCategory = filterQnaItems(data.qnaList, '', 'Audio & ANC');
    expect(ancCategory.length).toBe(2);
    expect(ancCategory.every(q => q.category === 'Audio & ANC')).toBe(true);

    const searched = filterQnaItems(data.qnaList, 'dongle', 'ALL');
    expect(searched.length).toBe(1);
    expect(searched[0].id).toBe('qna-2');
  });

  it('retrieves AR metadata for WebXR and USDZ/GLB model previewing', () => {
    const arMeta = getArMetadata('var-cyber-onyx');
    expect(arMeta.usdzUrl).toContain('var-cyber-onyx.usdz');
    expect(arMeta.glbUrl).toContain('var-cyber-onyx.glb');
    expect(arMeta.scaleRatio).toContain('1:1 True Real-Scale');
    expect(arMeta.arQrCodeUrl).toContain('qrserver.com');
  });

  it('calculates SVG path curve coordinates for Equalizer response curves', () => {
    const flatCurve = calculateEqCurve([0, 0, 0, 0, 0], 600, 100);
    expect(flatCurve).toContain('M 0,50');

    const bassCurve = calculateEqCurve([8, 5, 1, 0, 2], 600, 100);
    expect(bassCurve).not.toEqual(flatCurve);
  });

  it('retrieves comparison matrix models comparing Apex Air, Apex Pro, and Apex Studio', () => {
    const models = getComparisonModels();
    expect(models.length).toBe(3);
    const pro = models.find(m => m.id === 'nexus-apex-pro-01');
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
    expect(timer1.hours).toBe(1);
    expect(timer1.minutes).toBe(1);
    expect(timer1.seconds).toBe(5);
    expect(timer1.formatted).toBe('01:01:05');

    const expired = calculateFlashSaleCountdown(0);
    expect(expired.formatted).toBe('00:00:00');
  });

  it('calculates 360-degree rotation angles and frame indices from drag delta', () => {
    const rot1 = calculate360Rotation(0, 180, 0.5);
    expect(rot1.angle).toBe(90);
    expect(rot1.frameIndex).toBe(6); // 90/360 * 24 = 6

    const rot2 = calculate360Rotation(350, 40, 0.5);
    expect(rot2.angle).toBe(10); // (350 + 20) % 360 = 10
  });

  it('calculates cart totals and promo discounts accurately in USD and EUR', () => {
    const items = [
      { variantId: 'var-cyber-onyx', name: 'Cyber Onyx', price: 349.99, image: '', quantity: 1, ledColor: 'Cyber Cyan' }
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

  it('generates serialized resumable state snapshot with 0ms hydration cost and Q&A state', () => {
    const items = [
      { variantId: 'var-cyber-onyx', name: 'Cyber Onyx', price: 349.99, image: '', quantity: 1, ledColor: 'Cyber Cyan' }
    ];
    const snapshot = getResumableSnapshot(items, 'var-cyber-onyx', 'led-magenta', 180, 14400, 'tr-bass', 'EUR', true, 'eq-bass', true, true);

    expect(snapshot.hydrationCostMs).toBe(0.0);
    expect(snapshot.serializedObjectsCount).toBe(11);
    expect(snapshot.payloadSizeBytes).toBeGreaterThan(0);
  });
});
