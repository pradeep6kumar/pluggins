document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    if (activeTab.url && activeTab.url.includes('wikipedia.org')) {
      console.log("Active tab URL: ", activeTab.url);
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          func: () => {
            return Array.from(document.querySelectorAll('table.wikitable, table.infobox')).map((table, index) => {
              return { name: `Table${index + 1}` };
            });
          }
        },
        (results) => {
          const response = results[0].result;

          if (chrome.runtime.lastError) {
            console.warn('Could not establish connection: ', chrome.runtime.lastError.message);
            document.getElementById('tableCount').textContent = 'No tables found or not a Wikipedia page.';
            return;
          }

          console.log("Response from content script: ", response); // Add this line

          if (response) {
            const tableCount = response.length;
            document.getElementById('tableCount').textContent = `${tableCount} tables found.`;

            const tableButtons = document.getElementById('tableButtons');
            tableButtons.innerHTML = ''; // Clear previous buttons

            // Adjust layout if there are more than 5 tables
            if (tableCount > 5) {
              tableButtons.style.display = 'grid';
              tableButtons.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100px, 1fr))';
              tableButtons.style.gap = '10px';
            }

            response.forEach((table, index) => {
              const button = document.createElement('button');
              button.textContent = `${table.name}`;
              button.addEventListener('click', () => {
                chrome.tabs.sendMessage(activeTab.id, { type: 'DOWNLOAD_TABLE', tableIndex: index });
              });
              tableButtons.appendChild(button);
            });
          }
        }
      );
    } else {
      document.getElementById('tableCount').textContent = 'Not a Wikipedia page.';
    }
  });
});
