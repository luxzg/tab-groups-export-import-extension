const exportBtn = document.getElementById("exportBtn");
const importNewBtn = document.getElementById("importNewBtn");
const importCurrentBtn = document.getElementById("importCurrentBtn");
const jsonInput = document.getElementById("jsonInput");
const statusEl = document.getElementById("status");

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

exportBtn.addEventListener("click", async () => {
  setStatus("Exporting...");
  chrome.runtime.sendMessage({ type: "EXPORT" }, (resp) => {
    if (chrome.runtime.lastError) {
      setStatus("Error: " + chrome.runtime.lastError.message);
      return;
    }
    setStatus(resp?.ok ? `Exported:\n${resp.filename}` : `Export failed:\n${resp?.error || "unknown error"}`);
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
