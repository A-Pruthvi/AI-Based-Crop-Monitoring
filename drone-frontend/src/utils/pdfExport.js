import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate PDF from HTML element
 * @param {HTMLElement} element - The DOM element to convert to PDF
 * @param {string} filename - The name of the PDF file
 * @param {object} options - Additional options
 */
export const generatePDF = async (element, filename = 'report.pdf', options = {}) => {
  const {
    orientation = 'portrait',
    unit = 'mm',
    format = 'a4',
    title = 'CropMonitor Report',
    addHeader = true,
    addFooter = true,
  } = options;

  try {
    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF(orientation, unit, format);
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = addHeader ? 30 : 10;

    // Add header
    if (addHeader) {
      pdf.setFontSize(18);
      pdf.setTextColor(22, 163, 74); // Green-600
      pdf.text(title, pdfWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139); // Slate-500
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pdfWidth / 2, 22, { align: 'center' });
    }

    // Add the image
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

    // Add footer
    if (addFooter) {
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184); // Slate-400
      pdf.text('CropMonitor - Crop Health Analysis System', pdfWidth / 2, pdfHeight - 10, { align: 'center' });
    }

    // Save the PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
};

/**
 * Export report data as PDF
 * @param {object} reportData - The report data to export
 */
export const exportReportToPDF = async (reportData) => {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  try {
    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(22, 163, 74);
    pdf.text('CropMonitor Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Date
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Report Details
    pdf.setFontSize(12);
    pdf.setTextColor(51, 65, 85);
    pdf.text('Report Details', 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
    
    const details = [
      ['Crop Type:', reportData.cropType || 'N/A'],
      ['Disease:', reportData.diseaseName || 'N/A'],
      ['Confidence:', `${Math.round((reportData.confidenceScore || reportData.confidence || 0) * 100)}%`],
      ['Severity:', reportData.severity || 'N/A'],
      ['Status:', reportData.isHealthy ? 'Healthy' : 'Diseased'],
      ['Field Location:', reportData.fieldLocation || 'N/A'],
      ['Date:', new Date(reportData.createdAt).toLocaleDateString()],
    ];

    details.forEach(([label, value]) => {
      pdf.setFont(undefined, 'bold');
      pdf.text(label, 25, yPos);
      pdf.setFont(undefined, 'normal');
      pdf.text(value, 70, yPos);
      yPos += 7;
    });

    // Treatment Recommendations
    if (reportData.treatmentRecommendations && reportData.treatmentRecommendations.length > 0) {
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(51, 65, 85);
      pdf.text('Treatment Recommendations', 20, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      
      reportData.treatmentRecommendations.forEach((treatment, index) => {
        if (yPos > 260) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(`${index + 1}. ${treatment}`, 25, yPos);
        yPos += 7;
      });
    }

    // Notes
    if (reportData.notes) {
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(51, 65, 85);
      pdf.text('Additional Notes', 20, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      const notesLines = pdf.splitTextToSize(reportData.notes, pageWidth - 50);
      pdf.text(notesLines, 25, yPos);
    }

    // Footer
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        'CropMonitor - Crop Health Analysis System',
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 20,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    }

    const filename = `cropmonitor-report-${reportData.id || Date.now()}.pdf`;
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to export report');
  }
};

/**
 * Export multiple reports as PDF
 * @param {Array} reports - Array of report data
 */
export const exportMultipleReportsToPDF = async (reports) => {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  try {
    // Cover Page
    pdf.setFontSize(24);
    pdf.setTextColor(22, 163, 74);
    pdf.text('CropMonitor', pageWidth / 2, 40, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setTextColor(71, 85, 105);
    pdf.text('Multiple Reports Summary', pageWidth / 2, 55, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Total Reports: ${reports.length}`, pageWidth / 2, 70, { align: 'center' });
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 80, { align: 'center' });

    // Reports Summary
    pdf.addPage();
    let yPos = 20;
    
    pdf.setFontSize(16);
    pdf.setTextColor(22, 163, 74);
    pdf.text('Reports Summary', 20, yPos);
    yPos += 15;

    reports.forEach((report, index) => {
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(12);
      pdf.setTextColor(51, 65, 85);
      pdf.text(`${index + 1}. ${report.diseaseName || 'Unknown'}`, 20, yPos);
      yPos += 7;

      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Crop: ${report.cropType || 'N/A'}  |  Confidence: ${Math.round((report.confidenceScore || report.confidence || 0) * 100)}%  |  Date: ${new Date(report.createdAt).toLocaleDateString()}`, 25, yPos);
      yPos += 10;
    });

    // Footer on all pages
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        'CropMonitor - Crop Health Analysis System',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 20,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    const filename = `cropmonitor-reports-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to export multiple reports');
  }
};

export default {
  generatePDF,
  exportReportToPDF,
  exportMultipleReportsToPDF,
};
