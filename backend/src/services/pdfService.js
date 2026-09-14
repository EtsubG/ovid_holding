// backend/src/services/pdfService.js
const PDFDocument = require('pdfkit');

/**
 * Generate a PDF report from candidate data
 * @param {Array} candidates - array of candidate objects
 * @param {Object} filters - active filters
 * @returns {Promise<Buffer>} - PDF file as buffer
 */
function generateCandidatesPDF(candidates, filters = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 40,
        info: {
          Title: 'Candidates Report',
          Author: 'Ovid Holding',
          Subject: 'Recruitment Report',
          CreationDate: new Date(),
        },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;

      // ─────────────────────────────────────────────
      // Header
      // ─────────────────────────────────────────────
      doc
        .fillColor('#1E293B')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Ovid Holding', margin, margin);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748B')
        .text('Careers Hub — Recruitment Report', margin, margin + 26);

      // Right side: date
      doc
        .fontSize(9)
        .fillColor('#64748B')
        .text(
          `Generated: ${new Date().toLocaleString('en-GB')}`,
          margin,
          margin,
          { align: 'right', width: contentWidth }
        );

      // Horizontal line
      doc
        .strokeColor('#CBD5E1')
        .lineWidth(1)
        .moveTo(margin, margin + 50)
        .lineTo(pageWidth - margin, margin + 50)
        .stroke();

      // ─────────────────────────────────────────────
      // Title + Summary
      // ─────────────────────────────────────────────
      let y = margin + 65;

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1E293B')
        .text('Candidate List', margin, y);
      y += 22;

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748B')
        .text(
          `Total: ${candidates.length} candidate${candidates.length === 1 ? '' : 's'}`,
          margin,
          y
        );
      y += 14;

      // Filters summary
      const activeFilters = Object.entries(filters).filter(
        ([, v]) => v && v !== 'all'
      );
      if (activeFilters.length > 0) {
        doc.text(
          `Filters: ${activeFilters.map(([k, v]) => `${k}="${v}"`).join(', ')}`,
          margin,
          y
        );
        y += 14;
      }

      y += 10;

      // ─────────────────────────────────────────────
      // Table headers
      // ─────────────────────────────────────────────
      const columns = [
        { label: 'Reference', key: 'reference', width: 80 },
        { label: 'Name', key: 'fullName', width: 120 },
        { label: 'Email', key: 'email', width: 160 },
        { label: 'City', key: 'city', width: 80 },
        { label: 'Experience', key: 'totalExperience', width: 65 },
        { label: 'Position', key: 'vacancyTitle', width: 140 },
        { label: 'Company', key: 'companyName', width: 100 },
        { label: 'Status', key: 'status', width: 90 },
      ];

      const rowHeight = 20;
      const headerHeight = 24;

      const drawTableHeader = (top) => {
        // Header background
        doc
          .rect(margin, top, contentWidth, headerHeight)
          .fillColor('#1E293B')
          .fill();

        // Header text
        let x = margin;
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
        columns.forEach((col) => {
          doc.text(col.label, x + 5, top + 8, {
            width: col.width - 10,
            height: headerHeight,
            ellipsis: true,
          });
          x += col.width;
        });
      };

      drawTableHeader(y);
      y += headerHeight;

      // ─────────────────────────────────────────────
      // Table rows
      // ─────────────────────────────────────────────
      candidates.forEach((c, idx) => {
        // Check if we need a new page
        if (y + rowHeight > pageHeight - margin - 30) {
          doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
          y = margin;
          drawTableHeader(y);
          y += headerHeight;
        }

        // Row background (alternating)
        if (idx % 2 === 1) {
          doc
            .rect(margin, y, contentWidth, rowHeight)
            .fillColor('#F8FAFC')
            .fill();
        }

        // Row border bottom
        doc
          .strokeColor('#E2E8F0')
          .lineWidth(0.5)
          .moveTo(margin, y + rowHeight)
          .lineTo(pageWidth - margin, y + rowHeight)
          .stroke();

        // Row data
        const rowData = {
          reference: c.reference || '',
          fullName: c.fullName || '',
          email: c.email || '',
          city: c.city || '',
          totalExperience: c.totalExperience || '',
          vacancyTitle: c.vacancy?.title || 'Talent Pool',
          companyName: c.company?.shortName || c.company?.name || '',
          status: c.status || '',
        };

        let x = margin;
        doc.font('Helvetica').fontSize(8).fillColor('#334155');

        columns.forEach((col) => {
          let value = rowData[col.key] || '';
          // Truncate long text
          if (value.length > 40) value = value.slice(0, 38) + '…';

          doc.text(String(value), x + 5, y + 6, {
            width: col.width - 10,
            height: rowHeight,
            ellipsis: true,
            lineBreak: false,
          });
          x += col.width;
        });

        y += rowHeight;
      });

      // ─────────────────────────────────────────────
      // Footer
      // ─────────────────────────────────────────────
      doc
        .fontSize(8)
        .fillColor('#94A3B8')
        .text(
          'Ovid Holding — Confidential Recruitment Document',
          margin,
          pageHeight - 30,
          { align: 'center', width: contentWidth }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateCandidatesPDF };