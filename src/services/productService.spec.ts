// src/services/productService.spec.ts
// Vitest unit tests for Build 49 Product Service.
// Updated: 2026-07-29 for Iteration 2

import { describe, it, expect } from 'vitest';
import {
  getProductData,
  calculateCartTotals,
  formatCurrency,
  filterReviews,
  getResumableSnapshot,
  calculate360Rotation
} from './productService';

describe('productService', () => {
  it('retrieves valid product catalog data with variants and specs', () => {
    const data = getProductData();
    expect(data.id).toBe('apex-pro-cyber-v1');
    expect(data.variants.length).toBe(3);
    expect(data.specs['Driver Size']).toBeDefined();
    expect(data.reviews.length).toBeGreaterThan(0);
    expect(data.ledPresets.length).toBe(5);
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

  it('calculates cart totals and promo discounts accurately', () => {
    const items = [
      { variantId: 'var-cyber-black', name: 'Cyber Onyx', price: 349.99, image: '', quantity: 1 }
    ];

    const standard = calculateCartTotals(items, '');
    expect(standard.subtotal).toBe(349.99);
    expect(standard.shipping).toBe(0); // Free shipping over $200
    expect(standard.discount).toBe(0);

    const discounted = calculateCartTotals(items, 'QWIK15');
    expect(discounted.discount).toBe(52.50); // 15% of 349.99
    expect(discounted.total).toBeLessThan(standard.total);
  });

  it('formats currency numbers correctly', () => {
    expect(formatCurrency(349.99)).toBe('$349.99');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('filters product reviews by star rating', () => {
    const data = getProductData();
    const all = filterReviews(data.reviews, 0);
    const fiveStars = filterReviews(data.reviews, 5);

    expect(all.length).toBe(3);
    expect(fiveStars.length).toBe(2);
    expect(fiveStars.every(r => r.rating >= 5)).toBe(true);
  });

  it('generates serialized resumable state snapshot with 0ms hydration cost and LED state', () => {
    const items = [
      { variantId: 'var-cyber-black', name: 'Cyber Onyx', price: 349.99, image: '', quantity: 1 }
    ];
    const snapshot = getResumableSnapshot(items, 'var-cyber-black', 'led-magenta', 180);

    expect(snapshot.hydrationCostMs).toBe(0.0);
    expect(snapshot.serializedObjectsCount).toBe(4);
    expect(snapshot.payloadSizeBytes).toBeGreaterThan(0);
  });
});
