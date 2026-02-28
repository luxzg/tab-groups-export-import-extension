# CHANGELOG

## [1.1.0] - 2026-02-28 10:13:25 CET
- Added import target prompt in popup:
  - OK imports into current window
  - Cancel recreates exported windows
- Added support for preserving `file://` URLs during import sanitization.
- Preserved tab group order in each window based on tab strip position.
- Preserved tab order inside each tab group during export/import workflow.
- Updated documentation to reflect new import behavior and URL handling.

## [1.0.0] - 2026-02-28
- Initial version, by ChatGPT 5.2.
- Files:
  - `manifest.json`
  - `popup.html`
  - `popup.js`
  - `service-worker.js`
  - `README.md`
  - `USAGE.md`
