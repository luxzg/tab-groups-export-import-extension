const exportBtn = document.getElementById("exportBtn");
const downloadBtn = document.getElementById("downloadBtn");
const importNewBtn = document.getElementById("importNewBtn");
const importCurrentBtn = document.getElementById("importCurrentBtn");
const jsonInput = document.getElementById("jsonInput");
const statusEl = document.getElementById("status");

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

exportBtn.addEventListener("click", async () => {
  setStatus("Reading open tab groups...");
  chrome.runtime.sendMessage({ type: "EXPORT" }, (resp) => {
    if (chrome.runtime.lastError) {
      setStatus("Error: " + chrome.runtime.lastError.message);
      return;
    }
    if (resp?.ok) {
      if (resp.jsonText) {
        jsonInput.value = resp.jsonText;
      }
      setStatus("JSON loaded into text area. Use Download button if you want a file.");
      return;
    }
    setStatus(`Export failed:\n${resp?.error || "unknown error"}`);
  });
});

downloadBtn.addEventListener("click", () => {
  const text = (jsonInput.value || "").trim();
  if (!text) {
    setStatus("Text area is empty. Export first or paste JSON.");
    return;
  }

  setStatus("Downloading JSON...");
  chrome.runtime.sendMessage({ type: "DOWNLOAD_JSON", jsonText: text }, (resp) => {
    if (chrome.runtime.lastError) {
      setStatus("Error: " + chrome.runtime.lastError.message);
      return;
    }
    setStatus(resp?.ok ? `Downloaded:\n${resp.filename}` : `Download failed:\n${resp?.error || "unknown error"}`);
  });
});

function startImport(target) {
  const text = (jsonInput.value || "").trim();
  if (!text) {
    setStatus("Paste exported JSON first.");
    return;
  }

  setStatus("Importing...");

  chrome.runtime.sendMessage({ type: "IMPORT", jsonText: text, targetWindow: target }, (resp) => {
    if (chrome.runtime.lastError) {
      setStatus("Error: " + chrome.runtime.lastError.message);
      return;
    }
    setStatus(resp?.ok ? `Imported:\n${resp.summary}` : `Import failed:\n${resp?.error || "unknown error"}`);
  });
}

importNewBtn.addEventListener("click", () => startImport("new"));
importCurrentBtn.addEventListener("click", () => startImport("current"));
