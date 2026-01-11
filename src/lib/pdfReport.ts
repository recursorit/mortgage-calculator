import { pdf } from '@react-pdf/renderer';

import {
  MortgageReportPdfDocument,
  type MortgageReportPdfData,
} from '../pdf/MortgageReportPdf';

export async function createMortgageReportPdfBlob(
  data: MortgageReportPdfData,
): Promise<Blob> {
  // MortgageReportPdfDocument returns the <Document /> element that pdf() expects.
  const doc = MortgageReportPdfDocument(data);
  return await pdf(doc).toBlob();
}

export function printPdfBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);

  // Try a hidden iframe so printing stays in the same tab.
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = url;

  const cleanup = () => {
    try {
      iframe.remove();
    } catch {
      // ignore
    }
    URL.revokeObjectURL(url);
  };

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      // Give the print dialog a moment to open before cleanup.
      window.setTimeout(cleanup, 500);
    }
  };

  document.body.appendChild(iframe);
}
