// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "insert-linkedin",
    title: "Insert LinkedIn URL",
    contexts: ["editable"] // Only shows up when right-clicking text boxes
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "insert-linkedin") {
    chrome.storage.sync.get(["linkedinUrl"], (result) => {
      if (!result.linkedinUrl) return;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (url) => {
          const el = document.activeElement;
          if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
            el.value = url;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        },
        args: [result.linkedinUrl]
      });
    });
  }
});
