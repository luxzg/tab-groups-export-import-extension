# Tab Groups Export / Import (Chromium MV3)

Minimal Manifest V3 extension for exporting **open tab groups** from one Chromium browser (Chrome, Edge, etc.) and importing them into another (e.g. Brave).

## Purpose

When migrating between Chromium-based browsers, there is no native way to transfer:

- Tab groups (with title, color, collapsed state)
- Window structure
- Grouped vs ungrouped tabs

This extension solves that by:

1. Reading all **currently open tab groups**
2. Reading open tab groups into popup JSON text area for immediate copy/paste
3. Optionally downloading that same JSON via a separate download button
4. Recreating them in another browser from that JSON (to new windows or into the current window)

It does **not** attempt to integrate with Brave Sync or Chrome Sync.  
It is a clean, one-time migration tool.

---

## What Gets Exported

For every open window:

- Window structure
- All tab groups:
  - Title
  - Color
  - Collapsed state
  - Group order within each window
  - All tab URLs
  - Tab order inside each group
  - Pinned state
- All ungrouped tabs

Export format:

```json
{
  "exportedAt": "ISO timestamp",
  "version": 1,
  "windows": [
    {
      "focused": true,
      "groups": [
        {
          "title": "Servers",
          "color": "blue",
          "collapsed": true,
          "tabs": [
            { "url": "https://example.com", "pinned": false, "active": false }
          ]
        }
      ],
      "ungroupedTabs": []
    }
  ]
}
```

---

## What Is NOT Supported

Due to Chromium security restrictions:

* ❌ Saved-but-closed tab groups (must be opened first)
* ❌ Passwords
* ❌ Autofill data
* ❌ Extensions
* ❌ Chrome/Brave internal URLs (`chrome://`, `brave://`)
* ❌ Sync integration

This tool only works with **currently open tabs and open tab groups**.

---

## Browser Compatibility

Works on:

* Google Chrome (Manifest V3)
* Brave
* Microsoft Edge
* Any modern Chromium-based browser supporting:

  * `chrome.tabs`
  * `chrome.tabGroups`
  * `chrome.windows`

---

## Permissions Used

* `tabs`
* `tabGroups`
* `downloads`
* `storage`
* `<all_urls>`

No external network communication.
Everything is local.

---

## Architecture

* `popup.html` – UI (Export / Import buttons)
* `popup.js` – UI logic
* `service-worker.js` – Core export/import logic
* `manifest.json` – MV3 configuration

All logic runs locally in the browser.

---

## Intended Use Case

Migration scenario:

Chrome → JSON → Brave

1. Open all saved groups in Chrome
2. Read JSON into popup text area
   - No file dialog opens
   - JSON is immediately available for copy/paste
3. (Optional) click download button to save JSON file
4. Import in Brave (paste JSON text into popup, then choose import mode button)
5. Close tab groups in Brave and Chrome (they will be saved automatically)
6. Done

No manual regrouping or renaming required.

---

## Design Philosophy

* Minimal
* Transparent JSON format
* No external dependencies
* No sync protocol abuse
* No profile database manipulation

Safe, controlled migration only.
