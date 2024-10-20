chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DOWNLOAD_TABLE') {
    const tables = document.querySelectorAll('table.wikitable, table.infobox');
    if (tables[message.tableIndex]) {
      const tableHTML = tables[message.tableIndex].outerHTML;
      const tableName = `Table${message.tableIndex + 1}`;
      downloadTable(tableHTML, tableName);
    }
  }
});

function tableToCSV(tableHTML) {
  const rows = Array.from(new DOMParser().parseFromString(tableHTML, 'text/html').querySelectorAll('tr'));
  return rows.map(row =>
    Array.from(row.querySelectorAll('th, td')).map(cell => cell.textContent.trim()).join(',')
  ).join('\n');
}

function downloadTable(tableHTML, tableName) {
  const csv = tableToCSV(tableHTML);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${tableName}.csv`;
  link.click();
}

function downloadAllTablesAsZip(tables) {
    const zip = new JSZip();
    console.log("Starting to download all tables as ZIP. Total tables: ", tables.length);

    tables.forEach((table, index) => {
        const tableHTML = table.outerHTML;
        const tableName = `Table${index + 1}`;
        const csv = tableToCSV(tableHTML);
        zip.file(`${tableName}.csv`, csv);
    });

    // Debug: Verify ZIP file generation
    console.log("Generating ZIP...");

    zip.generateAsync({ type: 'blob' }).then(content => {
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Wikipedia_Tables.zip';
        link.click();

        // Debug: Verify download trigger
        console.log("ZIP Download triggered.");
    }).catch(error => {
        console.error("Error generating ZIP: ", error);
    });
}

console.log("Content script loaded on: ", window.location.href);
const tables = document.querySelectorAll('table.wikitable, table.infobox');
console.log("Tables found: ", tables.length); // Add this line
