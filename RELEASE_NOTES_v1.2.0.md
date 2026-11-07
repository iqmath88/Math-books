# Math-books v1.2.0 — Classroom & design release

## Delivered
- Redesigned library: cleaner navy/gold identity, flat accessible cards, responsive two-column phone layout, search by Arabic chapter text.
- Classroom tools on every implemented chapter: red/blue pen, stroke eraser, clear annotations, focus mode, larger text, fullscreen where browser permits, hide/restore toolbar.
- Pointer Events support for stylus, finger, and mouse; annotations remain temporary and clear on chapter navigation.
- Preserved all six original lesson files and mathematics content; added only shared CSS/JS references.
- Shared cache version updated to 1.2.0; classroom assets included in offline precache.

## Important limits
- Existing teacher mode and interactive question flaps are retained, not replaced.
- iPad Safari fullscreen API may not be available; use Add to Home Screen for standalone presentation.
- Pen annotations are intentionally not persisted or exported. No new textbook exercises were fabricated.
- Run `node tests/stability.test.cjs` and `node tests/release.test.cjs` before deployment.
- Real-device browser QA remains necessary.
