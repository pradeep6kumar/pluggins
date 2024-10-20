document.addEventListener('DOMContentLoaded', () => {
    // Query the active tab and send a message to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_TABLES' }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Could not establish connection: ', chrome.runtime.lastError.message);
          document.getElementById('tableCount').textContent = 'No tables found or not a Wikipedia page.';
          return;
        }
        if (response) {
          const tableCount = response.length;
          document.getElementById('tableCount').textContent = `${tableCount} tables found.`;
  
          const tableButtons = document.getElementById('tableButtons');
          response.forEach((table, index) => {
            const button = document.createElement('button');
            button.textContent = `Download Table ${index + 1}`;
            button.addEventListener('click', () => downloadTable(table, index + 1));
            tableButtons.appendChild(button);
          });
  
          if (tableCount > 0) {
            const downloadAllButton = document.getElementById('downloadAll');
            downloadAllButton.style.display = 'block';
            downloadAllButton.addEventListener('click', () => downloadAllTables(response));
          }
        }
      });
    });
  });
  
  function tableToCSV(tableHTML) {
    const rows = Array.from(new DOMParser().parseFromString(tableHTML, 'text/html').querySelectorAll('tr'));
    return rows.map(row => 
      Array.from(row.querySelectorAll('th, td')).map(cell => cell.textContent.trim()).join(',')
    ).join('\n');
  }
  
  function downloadTable(tableHTML, tableNumber) {
    const csv = tableToCSV(tableHTML);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `table${tableNumber}.csv`;
    link.click();
  }
  
  function downloadAllTables(tables) {
    tables.forEach((table, index) => downloadTable(table, index + 1));
  }
  