import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportToPNG(element: HTMLElement): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
  });

  const link = document.createElement("a");
  link.download = "pertamina-receipt.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export async function exportToPDF(element: HTMLElement): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");
  const imgWidth = 58;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [imgWidth, imgHeight],
  });

  doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  doc.save("pertamina-receipt.pdf");
}

export function printReceipt(element: HTMLElement): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules || [])
          .map((rule) => rule.cssText)
          .join("");
      } catch {
        return "";
      }
    })
    .join("");

  const printStyles = `
    @page {
      size: 58mm auto;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      background: white;
    }
  `;

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Receipt</title>
        <style>${styles}</style>
        <style>${printStyles}</style>
      </head>
      <body>${element.outerHTML}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}
