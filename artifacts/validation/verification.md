# Validation record

Date: 2026-08-11 (Asia/Shanghai)

## Automated checks

- Goal lint: passed.
- `pnpm validate:assets`: passed; 9 WebP files, 768×768, SHA-256 verified.
- `pnpm typecheck`: passed.
- `pnpm test`: passed, 7/7 tests across 2 files.
- `pnpm build`: passed.
- Browser console warnings/errors during validation: 0.

## Asset evidence

- Ages: 5, 12, 20, 30, 40, 50, 62, 75, 88.
- Total WebP payload: 832,006 bytes.
- Source screenshot and stable project copy share SHA-256:
  `B47EC62EF27553F7C9106DBA26E41B776DF5F3098A498127DB569DF0AB6F749E`.

## Chromium interaction checks

- Desktop viewport: 1200×1189.
- Initial state: Age 5, Mono selected.
- Color mode: selected state read back as `aria-pressed=true`.
- Keyboard states: Age 24, Age 65 and End→Age 88 read back from `aria-valuenow`.
- Pointer click: Age 5→7.
- Pointer drag left by three tick intervals: Age 7→10.
- Home/End and PageUp/PageDown were exercised.
- A running click animation was interrupted by End and remained at Age 88 after settling.
- A running click animation was interrupted by a new drag and remained at Age 12 after settling.
- Server-render regression checks confirm a zero-frame terminal error replaces the Canvas and removes misleading `role="img"` semantics; normal state retains the Canvas image role.
- No horizontal overflow was observed at the mobile viewport.

## Responsive check

- Mobile viewport: 390×844.
- Document size: 390×844.
- Canvas bounds: x 62.40, y 201.68, width 265.20, height 265.20.
- Slider bounds: x 23.79, y 540.53, width 342.42, height 92.
- Mode switch right edge: 376.00, within the 390px viewport.
- Mono target: 61.25×44 CSS px; Color target: 58×44 CSS px.
- Color left-edge midpoint and Mono right-edge midpoint both switched state successfully.

## Screenshots

- `age-05-mono-desktop.png`
- `age-24-color-desktop.png`
- `age-65-color-desktop.png`
- `age-88-mono-desktop.png`
- `age-05-mono-mobile.png`

## Explicitly not verified

- Safari and Firefox.
- A physical touch device or mobile browser.
- Performance, frame rate, input latency or memory use.
- Scientific or biometric validity of the artistic age simulation.

The localhost validation server was stopped after browser checks.
