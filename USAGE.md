# Usage Guide

This guide explains how to load and use the extension in Chrome and Brave.

---

# 1. Folder Structure

Your extension folder should contain:

- CHANGELOG.md
- manifest.json
- popup.html
- popup.js
- service-worker.js
- README.md
- USAGE.md

No build step required.

---

# 2. Load Extension in Chrome (Export Side)

## Step 1 — Enable Developer Mode

1. Open:
   chrome://extensions
2. Enable **Developer Mode** (top right)

## Step 2 — Load Extension

1. Click **Load unpacked**
2. Select the extension folder
3. The extension icon will appear in the toolbar

---

# 3. Prepare Chrome for Export

IMPORTANT:

Chrome does not allow extensions to access saved-but-closed tab groups.

You must:

1. Open every saved tab group
2. Make sure all groups you want exported are visible and open

Once they are open, proceed.

---

# 4. Export Tab Groups

1. Click the extension icon
2. Click:
   **Export open tab groups → JSON**
3. Save the generated JSON file
4. The same JSON content is also automatically placed in the popup text area for copy/paste use

You now have a portable snapshot.

After export you can close all tab groups inside Chrome, and the Chrome browser itself as well.

---

# 5. Load Extension in Brave (Import Side)

Repeat the same loading steps in Brave:

1. Open:
   brave://extensions
2. Enable Developer Mode
3. Click **Load unpacked**
4. Select the same folder

---

# 6. Import Tab Groups into Brave

1. Click extension icon
2. Open the exported JSON file in a text editor
3. Copy all JSON text
4. Paste JSON into the extension popup text area
5. Click one of:
   - **Import pasted JSON → recreate windows**
   - **Import pasted JSON → current window**

The extension will:

- Create windows (or use current window, based on your choice)
- Recreate tab groups
- Restore group title (with compatibility fallback logic)
- Restore group color
- Restore collapsed state
- Restore pinned tabs
- Preserve tab order inside groups
- Preserve group order inside each restored window

After import you can close all tab groups inside Brave, and the Brave browser itself as well.
If the Brave sync is enabled tab groups will sync to other devices in your sync chain.

---

# 7. Important Notes

## Internal URLs

Tabs such as:

- chrome://*
- brave://*

Cannot be recreated by extensions.

They will be converted to a search query fallback.
`file://` URLs are preserved, but opening them depends on browser file URL permissions.

---

## Windows Behavior

The importer:

- Recreates windows by default
- Removes the initial blank tab
- Preserves grouping per window
- Can import everything into the current window when selected in the popup

---

## Security Model

- No data leaves your machine
- JSON is local
- No background sync in extension
- No server communication from extension

---

# 8. Optional Cleanup

After migration:

- Remove extension from Chrome
- Remove extension from Brave
- Keep JSON as backup if desired

---

# 9. Troubleshooting

If import fails:

- Ensure JSON file was not edited
- Ensure version field is:
  `"version": 1`
- Ensure browser supports tabGroups API
  (Chromium 88+)

If some tabs fail to open:

- They may be restricted internal browser URLs (settigns, flags, history, and similar)
- Check browser console:
  extensions → service worker → inspect

---

# 10. One-Time Migration Strategy (Recommended)

Best workflow:

1. Open all Chrome tab groups
2. Export
3. Close Chrome
4. Import in Brave
5. Verify
6. Remove extension

Migration complete.
