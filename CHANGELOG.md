# Changelog

All notable changes to **Build 49 (Qwik E-Commerce Product Page)** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
