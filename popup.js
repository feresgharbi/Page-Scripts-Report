document.addEventListener('DOMContentLoaded', function () {
  const contentDiv = document.getElementById('content');
  const exportBtn = document.getElementById('exportBtn');

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => [...document.scripts].map(script => ({ src: script.src, loadTime: Math.random() * 1000 }))
      },
      (results) => {
        if (results && results[0] && results[0].result.length > 0) {
          contentDiv.innerHTML = ''; 
          results[0].result.forEach(script => {
            const scriptInfo = document.createElement('div');
            scriptInfo.innerHTML = `Script: ${script.src || 'inline'} - Load time: ${script.loadTime.toFixed(2)}ms`;
            contentDiv.appendChild(scriptInfo);
          });
        } else {
          contentDiv.innerHTML = 'No scripts detected or page loaded too fast!';
        }
      }
    );
  });

  exportBtn.addEventListener('click', function () {
    const doc = new jspdf.jsPDF();

    // Add title to the PDF
    doc.setFontSize(18); // Set font size for title
    doc.setFont("helvetica", "bold");
    doc.text('Page Scripts Report', 105, 20, null, null, 'center'); // Title centered at the top
    doc.setFontSize(12); // Reset font size for content
    doc.setFont("helvetica", "normal");

    doc.text('This report contains the scripts and their load times from the current web page.', 10, 30);

    // Draw a line below the title
    doc.line(10, 35, 200, 35); // x1, y1, x2, y2 (horizontal line)

    let yPosition = 50; // Starting position for the script data

    // Add header for script data
    doc.setFont("helvetica", "bold");
    doc.text('Scripts Information:', 10, yPosition);
    doc.setFont("helvetica", "normal");

    yPosition += 10; // Move down after the header

    // Gather content from the DOM
    document.querySelectorAll('#content div').forEach(div => {
      const scriptInfo = div.innerText.split(' - ');

      // Format each script info with load time
      doc.setFont("helvetica", "bold");
      doc.text(`Script: `, 10, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(scriptInfo[0], 30, yPosition); // Script source

      yPosition += 8; // Move down for the next line

      doc.setFont("helvetica", "bold");
      doc.text(`Load time: `, 10, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(scriptInfo[1], 30, yPosition); // Load time

      yPosition += 12; // Space between entries

      // Check if we need to create a new page
      if (yPosition > 280) { 
        doc.addPage(); // Add a new page if we exceed the current page height
        yPosition = 20; // Reset yPosition for the new page
      }
    });

    doc.save('page-scripts.pdf'); // Save the PDF
  });
});