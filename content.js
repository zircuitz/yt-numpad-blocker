// YouTube maps Numpad0-9 (and Digit0-9) to "seek to N0% of video" shortcuts.
// This intercepts numpad key events before YouTube's player sees them, so a
// stray numpad press can't jump playback position. Digit keys on the top row
// are left untouched. Typing in real inputs (search box, comments, etc.) is
// also left untouched so the numpad still works for entering text.

(function () {
  let enabled = true;

  chrome.storage.sync.get({ enabled: true }, (data) => {
    enabled = data.enabled;
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && "enabled" in changes) {
      enabled = changes.enabled.newValue;
    }
  });

  function isEditableTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable === true;
  }

  function blockNumpad(e) {
    if (!enabled) return;
    // e.code is stable regardless of NumLock state, unlike e.key.
    if (!e.code || !e.code.startsWith("Numpad")) return;
    if (isEditableTarget(e.target)) return;

    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
  }

  // Capture phase, ahead of YouTube's own listeners.
  document.addEventListener("keydown", blockNumpad, true);
  document.addEventListener("keypress", blockNumpad, true);
  document.addEventListener("keyup", blockNumpad, true);
})();
