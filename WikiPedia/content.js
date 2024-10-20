// Find all tables on the Wikipedia page
const tables = document.querySelectorAll('table.wikitable');

// Send the number of tables found to the background script
chrome.runtime.sendMessage({ type: 'TABLE_COUNT', count: tables.length });

// Collect table data and respond when requested
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TABLES') {
    const tablesData = Array.from(tables).map(table => table.outerHTML);
    sendResponse(tablesData);
  }
});
