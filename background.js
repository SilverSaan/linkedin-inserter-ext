const parentMenuId = 'insertables-parent';
const itemMenuPrefix = 'insertable-';

function getInsertables(result) {
  if (Array.isArray(result.insertables)) {
    return result.insertables;
  }

}

function rebuildContextMenu() {
  chrome.storage.sync.get(['insertables'], (result) => {
    const insertables = getInsertables(result);

    chrome.contextMenus.removeAll(() => {
      if (insertables.length === 0) return;

      chrome.contextMenus.create({
        id: parentMenuId,
        title: 'Insert saved text',
        contexts: ['editable']
      });

      insertables.forEach((insertable) => {
        const id = insertable.id ;
        chrome.contextMenus.create({
          id: `${itemMenuPrefix}${id}`,
          parentId: parentMenuId,
          title: insertable.key || 'Untitled',
          contexts: ['editable']
        });
      });
    });
  });
}

chrome.runtime.onInstalled.addListener(rebuildContextMenu);
chrome.runtime.onStartup.addListener(rebuildContextMenu);

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && (changes.insertables)) {
    rebuildContextMenu();
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (typeof info.menuItemId !== 'string' || !info.menuItemId.startsWith(itemMenuPrefix)) {
    return;
  }

  const insertableId = info.menuItemId.slice(itemMenuPrefix.length);
  chrome.storage.sync.get(['insertables'], (result) => {
    const insertable = getInsertables(result).find((item, index) =>
      (item.id || `legacy-${index}`) === insertableId
    );

    if (!insertable || typeof tab.id !== 'number') return;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => {
        const element = document.activeElement;
        if (!element) return;

        if (element.isContentEditable) {
          element.textContent = text;
        } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.value = text;
        } else {
          return;
        }

        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      },
      args: [insertable.value]
    });
  });
});
