// Export format:
// {
//   "exportedAt": "...ISO...",
//   "version": 1,
//   "windows": [
//     {
//       "focused": true/false,
//       "groups": [
//         {
//           "title": "...",
//           "color": "blue|red|...",
//           "collapsed": true/false,
//           "tabs": [{ "url": "...", "pinned": false, "active": false }]
//         }
//       ],
//       "ungroupedTabs": [{ "url": "...", "pinned": false, "active": false }]
//     }
//   ]
// }

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg?.type === "EXPORT") {
        const data = await exportOpenGroups();
        const json = JSON.stringify(data, null, 2);
        sendResponse({ ok: true, jsonText: json });
        return;
      }

      if (msg?.type === "DOWNLOAD_JSON") {
        const json = String(msg.jsonText || "");
        if (!json.trim()) throw new Error("No JSON provided.");

        // Validate format before download so exported files stay consistent.
        JSON.parse(json);

        const filename = `tab-groups-export-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
        const dataUrl = "data:application/json;charset=utf-8," + encodeURIComponent(json);

        await chrome.downloads.download({
          url: dataUrl,
          filename,
          saveAs: true
        });

        sendResponse({ ok: true, filename });
        return;
      }

      if (msg?.type === "IMPORT") {
        const parsed = JSON.parse(msg.jsonText);
        const summary = await importGroups(parsed, { targetWindow: msg.targetWindow });
        sendResponse({ ok: true, summary });
        return;
      }

      sendResponse({ ok: false, error: "Unknown message type" });
    } catch (e) {
      sendResponse({ ok: false, error: String(e?.message || e) });
    }
  })();

  // Keep message channel open for async response.
  return true;
});

async function exportOpenGroups() {
  const wins = await chrome.windows.getAll({ populate: true });
  const out = {
    exportedAt: new Date().toISOString(),
    version: 1,
    windows: []
  };

  for (const w of wins) {
    // Group tabs by groupId
    const tabList = w.tabs || [];
    const groupsMap = new Map(); // groupId -> {firstIndex, tabs: []}
    const ungrouped = [];

    for (let i = 0; i < tabList.length; i++) {
      const t = tabList[i];
      const tabEntry = {
        url: t.url || t.pendingUrl || "about:blank",
        pinned: !!t.pinned,
        active: !!t.active
      };

      if (t.groupId != null && t.groupId !== -1) {
        if (!groupsMap.has(t.groupId)) groupsMap.set(t.groupId, { firstIndex: i, tabs: [] });
        groupsMap.get(t.groupId).tabs.push(tabEntry);
      } else {
        ungrouped.push(tabEntry);
      }
    }

    // Fetch group metadata
    const groups = [];
    for (const [groupId, v] of groupsMap.entries()) {
      let meta;
      try {
        meta = await chrome.tabGroups.get(groupId);
      } catch {
        // Group might be gone; skip safely
        continue;
      }

      groups.push({
        firstIndex: v.firstIndex,
        title: meta.title || "",
        color: meta.color || "grey",
        collapsed: !!meta.collapsed,
        tabs: v.tabs
      });
    }

    // Preserve group ordering as seen in the tab strip (first tab position per group).
    groups.sort((a, b) => a.firstIndex - b.firstIndex);

    out.windows.push({
      focused: !!w.focused,
      groups: groups.map(({ firstIndex: _firstIndex, ...g }) => g),
      ungroupedTabs: ungrouped
    });
  }

  return out;
}

async function importGroups(data, options = {}) {
  if (!data || data.version !== 1 || !Array.isArray(data.windows)) {
    throw new Error("Invalid JSON format (expected version=1 and windows[]).");
  }

  const importIntoCurrentWindow = options.targetWindow === "current";
  let windowsCreated = 0;
  let groupsCreated = 0;
  let tabsCreated = 0;
  let tabsFailed = 0;

  let currentWindowId = null;
  if (importIntoCurrentWindow) {
    const currentWin = await chrome.windows.getLastFocused();
    if (!currentWin?.id) throw new Error("Could not determine current window.");
    currentWindowId = currentWin.id;
  }

  async function importWindowData(targetWindowId, w, removeInitialTabIfNeeded) {
    const initialTabs = await chrome.tabs.query({ windowId: targetWindowId });
    const initialTabId = removeInitialTabIfNeeded ? initialTabs?.[0]?.id : null;

    async function createTabsInWindow(tabSpecs) {
      const ids = [];
      for (let i = 0; i < tabSpecs.length; i++) {
        const spec = tabSpecs[i];
        const url = sanitizeUrl(spec.url);
        try {
          const t = await chrome.tabs.create({
            windowId: targetWindowId,
            url,
            pinned: !!spec.pinned,
            active: false
          });
          ids.push(t.id);
          tabsCreated++;
        } catch {
          tabsFailed++;
        }

        // Yield periodically to keep browser responsive during large imports.
        if ((i + 1) % 20 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      return ids;
    }

    // Groups
    for (const g of (w.groups || [])) {
      const tabIds = await createTabsInWindow(g.tabs || []);
      if (tabIds.length) {
        const groupId = await chrome.tabs.group({ tabIds, createProperties: { windowId: targetWindowId } });
        await restoreGroupMetadata(groupId, g);
        groupsCreated++;
      }
    }

    // Ungrouped
    if (Array.isArray(w.ungroupedTabs) && w.ungroupedTabs.length) {
      await createTabsInWindow(w.ungroupedTabs);
    }

    // Activate one tab if requested (pick first group first tab, else first ungrouped)
    // (Optional behavior; safe default)
    // Remove initial blank tab if we created anything else
    const totalTabsNow = await chrome.tabs.query({ windowId: targetWindowId });
    if (totalTabsNow.length > 1 && initialTabId) {
      try { await chrome.tabs.remove(initialTabId); } catch {}
    }
  }

  for (const w of data.windows) {
    if (importIntoCurrentWindow) {
      await importWindowData(currentWindowId, w, false);
      continue;
    }

    // Create a new window with a single blank tab (Chromium requires at least one)
    const createdWin = await chrome.windows.create({ focused: !!w.focused });
    windowsCreated++;
    await importWindowData(createdWin.id, w, true);
  }

  if (importIntoCurrentWindow) {
    windowsCreated = 1;
  }

  return `windows=${windowsCreated}, groups=${groupsCreated}, tabs=${tabsCreated}, failedTabs=${tabsFailed}`;
}

async function restoreGroupMetadata(groupId, groupData) {
  const title = typeof groupData?.title === "string" ? groupData.title : "";
  const color = typeof groupData?.color === "string" ? groupData.color : "grey";
  const collapsed = !!groupData?.collapsed;

  try {
    await chrome.tabGroups.update(groupId, { title, color, collapsed });
  } catch {}
}

function sanitizeUrl(url) {
  if (!url) return "about:blank";
  // Many internal URLs (chrome://, brave://) are blocked for extensions.
  // Keep http(s), file (may be blocked by policy), and about:blank.
  const u = String(url).trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("file://")) return u;
  if (u === "about:blank") return u;
  // Fallback: store as a search query if it's not a supported scheme
  return "https://www.google.com/search?q=" + encodeURIComponent(u);
}
