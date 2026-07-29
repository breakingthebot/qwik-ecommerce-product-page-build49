# Changelog

All notable changes to **Build 49 (Qwik E-Commerce Product Page)** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-07-29

### Added
- Integrated **Qwik Persistent Cart LocalStorage Syncer & Multi-Currency Switcher** in `src/services/productService.ts` and `src/routes/index.tsx`.
- Added currency exchange rates (`CURRENCIES`: USD, EUR, GBP, JPY) and conversion logic (`convertCurrency`).
- Added Multi-Currency Switcher dropdown to navbar and Qwik `useVisibleTask$` LocalStorage syncer (`nexus_cart_build49`, `nexus_currency_build49`).
- Updated unit tests in `src/services/productService.spec.ts` (9 passing unit tests).

## [0.4.0] - 2026-07-29

### Added
- Integrated **Qwik Audio Frequency Visualizer & Sound Demo Player** in `src/services/productService.ts` and `src/routes/index.tsx`.
- Added audio frequency spectrum calculation math (`calculateFrequencyBars`) and audio demo tracks array (`audioTracks`).
- Rendered Sound Demo Player card, animated frequency spectrum visualizer bars, track switcher (*Cyberpunk Sub-Bass*, *Hybrid ANC Isolation*, *3D Spatial Surround*), and play/pause toggle state.
- Updated unit tests in `src/services/productService.spec.ts` (8 passing unit tests).

## [0.3.0] - 2026-07-29

### Added
- Integrated **Real-Time Live Stock & Flash Sale Countdown Engine** in `src/services/productService.ts` and `src/routes/index.tsx`.
- Added Flash Sale countdown formatter (`calculateFlashSaleCountdown`) and social proof purchase data array (`socialPurchases`).
- Rendered top Flash Sale countdown ticker banner (`⚡ CYBER FLASH SALE ENDS IN: 03:59:52`), live inventory stock progress bar, and rotating social proof purchase toast notifications.
- Updated unit tests in `src/services/productService.spec.ts` (7 passing unit tests).

## [0.2.0] - 2026-07-29

### Added
- Integrated **Product 360-Degree Interactive 3D Model & Color Customizer** in `src/services/productService.ts` and `src/routes/index.tsx`.
- Added 360-degree rotation angle and frame index calculation math (`calculate360Rotation`).
- Added LED Accent Light preset metadata (`Cyber Cyan`, `Neon Magenta`, `Solar Amber`, `Matrix Emerald`, `Plasma Violet`).
- Rendered 360 drag rotator canvas with live angle badge (`🔄 360° Angle: 180°`), Spin 45° shortcut, LED color swatches, and ambient LED glow overlay.
- Updated unit tests in `src/services/productService.spec.ts` (6 passing unit tests).

## [0.1.0] - 2026-07-28

### Added
- Initialized **Build 49 — Qwik E-Commerce Product Page** with Qwik City, Vite, Express, and Vitest.
- Created `productService.ts` domain service providing catalog metadata, cart totals calculator, promo discount logic, star rating filters, and resumable state snapshot metadata.
- Built interactive Qwik product page in `src/routes/index.tsx` featuring colorway variant picker, price/stock indicators, resumable cart drawer, tabbed spec drawers, and Qwik Resumability Audit Banner (0ms hydration execution delay).
- Built modern cyberpunk glassmorphism design system in `src/global.css`.
- Added 5 passing Vitest unit tests in `src/services/productService.spec.ts`.
