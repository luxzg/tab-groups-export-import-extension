const exportBtn = document.getElementById("exportBtn");
const downloadBtn = document.getElementById("downloadBtn");
const importNewBtn = document.getElementById("importNewBtn");
const importCurrentBtn = document.getElementById("importCurrentBtn");
const jsonInput = document.getElementById("jsonInput");
const statusEl = document.getElementById("status");

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function fetchLatestExportJson(onDone) {
  setStatus("Reading open tab groups...");
  chrome.runtime.sendMessage({ type: "EXPORT" }, (resp) => {
    if (chrome.runtime.lastError) {
      setStatus("Error: " + chrome.runtime.lastError.message);
      onDone(null);
      return;
    }
    if (resp?.ok) {
      const jsonText = String(resp.jsonText || "");
      jsonInput.value = jsonText;
      onDone(jsonText);
      return;
    }
    setStatus(`Export failed:\n${resp?.error || "unknown error"}`);
    onDone(null);
  });
}

exportBtn.addEventListener("click", () => {
  fetchLatestExportJson((jsonText) => {
    if (jsonText != null) {
      setStatus("JSON loaded into text area.");
    }
  });
});

downloadBtn.addEventListener("click", () => {
  fetchLatestExportJson((jsonText) => {
    if (jsonText == null) return;
    setStatus("Downloading JSON...");
    chrome.runtime.sendMessage({ type: "DOWNLOAD_JSON", jsonText }, (resp) => {
      if (chrome.runtime.lastError) {
        setStatus("Error: " + chrome.runtime.lastError.message);
        return;
      }
      setStatus(resp?.ok ? `Downloaded:\n${resp.filename}` : `Download failed:\n${resp?.error || "unknown error"}`);
    });
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
