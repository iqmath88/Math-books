# Math-books v1.3.0 — Interactive whiteboard release

Built on v1.2.0. The six chapter HTML files retain all mathematical content and diagrams.

## New classroom controls
- **عرض صفي** opens the existing single-page teacher mode; click again to return to reading.
- **غطاء الحل** places a movable vertical reveal mask over the current teaching area; drag down to uncover gradually. This is a generic screen mask, not a semantic step-by-step solver.
- **تراجع** removes the most recent annotation stroke; **إعادة** resets the reveal mask.
- Larger touch targets and a centered teaching toolbar, with keyboard access to the reveal slider.
- Cache version and precache list updated to include the new shared script.

## Quality checks
Run `node tests/classroom-v1.3.test.cjs` and `node tests/stability.test.cjs`.

## Notes
- For iPad Safari, fullscreen API support depends on browser/version. Teacher mode works without fullscreen.
- Reveal mask uses viewport geometry and may need repositioning after complex in-page animations; tap mask again to reset.
- Drawing remains a screen overlay; strokes are not saved between sessions.
- Device testing on a physical interactive board is still needed.
- Upload all archive contents to the repository root; do not upload the ZIP itself.
