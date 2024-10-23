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

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text('Page Scripts Report', 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text('This report contains the scripts and their load times from the current web page.', 10, 30);
    doc.line(10, 35, 200, 35);

    let yPosition = 50;

    doc.setFont("helvetica", "bold");
    doc.text('Scripts Information:', 10, yPosition);
    doc.setFont("helvetica", "normal");

    yPosition += 10;

    document.querySelectorAll('#content div').forEach(div => {
      const scriptInfo = div.innerText.split(' - ');

      doc.setFont("helvetica", "bold");
      doc.text(`Script: `, 10, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(scriptInfo[0], 30, yPosition);

      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.text(`Load time: `, 10, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(scriptInfo[1], 30, yPosition);

      yPosition += 12;

      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
    });

    doc.save('page-scripts.pdf');
  });
});
