let tableCount = 0;

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TABLE_COUNT') {
    tableCount = message.count;
    chrome.action.setBadgeText({ text: tableCount.toString() });
  }
});

// Reset badge when the user leaves the page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '' });
  }
});
