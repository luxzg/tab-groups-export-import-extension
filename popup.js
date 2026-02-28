const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const fileInput = document.getElementById("file");
const statusEl = document.getElementById("status");
let importTarget = "new";

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

importBtn.addEventListener("click", () => {
  importTarget = window.confirm("Import into current window?\n\nOK = current window\nCancel = recreate exported windows")
    ? "current"
    : "new";
  fileInput.value = "";
  fileInput.click();
});

fileInput.addEventListener("change", async () => {
  const f = fileInput.files?.[0];
  if (!f) return;

  setStatus("Reading JSON...");
  const text = await f.text();

  chrome.runtime.sendMessage({ type: "IMPORT", jsonText: text, targetWindow: importTarget }, (resp) => {
    if (chrome.runtime.lastError) {
      setStatus("Error: " + chrome.runtime.lastError.message);
      return;
    }
    setStatus(resp?.ok ? `Imported:\n${resp.summary}` : `Import failed:\n${resp?.error || "unknown error"}`);
  });
});
