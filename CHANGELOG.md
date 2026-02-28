# CHANGELOG

## [1.5.0] - 2026-02-28 16:19:33 CET
- Internal/special URLs are now ignored (not converted to Google search fallbacks):
  - `about:*` / `about:blank`
  - `chrome://*`, `brave://*`, `edge://*`, `vivaldi://*`, `opera://*`
  - `devtools://*`, `chrome-extension://*`, `view-source:*`, `data:*`, `javascript:*`
- Export status now reports detailed summary in popup:
  - `Exported: windows=..., groups=..., tabs=..., skippedTabs=...`
- Added popup warning when more than 100 tabs are exported.
- `Download JSON` continues to refresh export data first, then downloads the fresh JSON.
- Updated README and USAGE with:
  - internal-page ignore behavior
  - 100+ tabs warning
  - real-world 91 tabs / 20+ groups benchmark notes and memory guidance

## [1.4.0] - 2026-02-28 12:03:58 CET
- Renamed popup buttons for clarity:
  - `Export tab data`
  - `Download JSON`
  - `Import to new window`
  - `Import to current window`
- `Download JSON` now always re-reads current open tab data before saving (ignores stale/edited textarea content).
- Removed experimental retitle/refresh logic that did not reliably solve Chromium group-title persistence behavior.
- Added explicit warnings in README and USAGE:
  - manual one-time group-name edit may be required for title retention on some Chromium builds
  - large imports can cause high memory usage/out-of-memory pressure

## [1.3.1] - 2026-02-28 11:12:08 CET
- Split export into two separate actions:
  - Read open tab groups into popup JSON text area
  - Download JSON from text area
- Prevented popup from closing during export read step so copy/paste can be done immediately.
- Added `DOWNLOAD_JSON` service-worker action that validates JSON before saving.
- Updated README and USAGE to document the new two-button export flow.

## [1.3.0] - 2026-02-28 11:06:15 CET
- Export now also returns JSON text to popup and auto-populates the text area for direct copy/paste.
- File download export flow is kept unchanged (`saveAs` dialog still shown).
- Improved tab group metadata restoration with compatibility fallbacks:
  - try `title + color + collapsed`
  - fallback to `title + color`
  - fallback to `title` only
- This fixes cases where group names were not restored on import destination.

## [1.2.0] - 2026-02-28 10:50:03 CET
- Fixed export failure in MV3 service worker by replacing `URL.createObjectURL(...)` download flow with a `data:` URL download.
- Reworked import UI to avoid popup file chooser crashes by switching to paste-based JSON import.
- Replaced modal import target prompt with explicit import mode buttons in popup UI.
- Added import progress resilience details to status summary (`failedTabs` counter).
- Updated documentation to match the new paste-based import workflow.

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
