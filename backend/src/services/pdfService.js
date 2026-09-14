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
        margin: 30,
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

      const pageWidth = doc.page.width;   // 842
      const pageHeight = doc.page.height; // 595
      const margin = 30;
      const contentWidth = pageWidth - margin * 2; // 782

      // ─────────────────────────────────────────────
      // Columns — TOTAL MUST BE <= 782
      // ─────────────────────────────────────────────
      // Sum: 75+110+175+75+60+160+90+70 = 815 → still too much
      // New sum: 70+105+165+70+55+150+80+70 = 765 ✅
      const columns = [
        { label: 'Reference', key: 'reference', width: 70 },
        { label: 'Name', key: 'fullName', width: 105 },
        { label: 'Email', key: 'email', width: 165 },
        { label: 'City', key: 'city', width: 70 },
        { label: 'Exp.', key: 'totalExperience', width: 55 },
        { label: 'Position', key: 'vacancyTitle', width: 150 },
        { label: 'Company', key: 'companyName', width: 80 },
        { label: 'Status', key: 'status', width: 70 },
      ];

      // Safety check — log warning if overflow
      const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
      if (totalWidth > contentWidth) {
        console.warn(
          `⚠️ PDF columns (${totalWidth}) exceed content width (${contentWidth}) — will be cut off`
        );
      }

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

      doc
        .fontSize(9)
        .fillColor('#64748B')
        .text(
          `Generated: ${new Date().toLocaleString('en-GB')}`,
          margin,
          margin,
          { align: 'right', width: contentWidth }
        );

      doc
        .strokeColor('#CBD5E1')
        .lineWidth(1)
        .moveTo(margin, margin + 50)
        .lineTo(pageWidth - margin, margin + 50)
        .stroke();

      // ─────────────────────────────────────────────
      // Title
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
        ([, v]) => v && v !== 'all' && v !== ''
      );
      if (activeFilters.length > 0) {
        doc.text(
          `Filters: ${activeFilters.map(([k, v]) => `${k}="${v}"`).join(', ')}`,
          margin,
          y,
          { width: contentWidth }
        );
        y += 14;
      }

      y += 10;

      // ─────────────────────────────────────────────
      // Table — helper functions
      // ─────────────────────────────────────────────
      const rowHeight = 22;
      const headerHeight = 26;

      const drawTableHeader = (top) => {
        // Background
        doc
          .rect(margin, top, totalWidth, headerHeight)
          .fillColor('#1E293B')
          .fill();

        // Text
        let x = margin;
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
        columns.forEach((col) => {
          doc.text(col.label, x + 5, top + 9, {
            width: col.width - 10,
            height: headerHeight - 6,
            ellipsis: true,
            lineBreak: false,
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
        // Check for page break
        if (y + rowHeight > pageHeight - margin - 25) {
          doc.addPage({ size: 'A4', layout: 'landscape', margin });
          y = margin;
          drawTableHeader(y);
          y += headerHeight;
        }

        // Alternating row
        if (idx % 2 === 1) {
          doc
            .rect(margin, y, totalWidth, rowHeight)
            .fillColor('#F8FAFC')
            .fill();
        }

        // Bottom border
        doc
          .strokeColor('#E2E8F0')
          .lineWidth(0.5)
          .moveTo(margin, y + rowHeight)
          .lineTo(margin + totalWidth, y + rowHeight)
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
          let value = String(rowData[col.key] || '');

          // Truncate based on column width (approx 4.5px per char at fontSize 8)
          const maxChars = Math.floor((col.width - 10) / 4.5);
          if (value.length > maxChars) {
            value = value.slice(0, maxChars - 1) + '…';
          }

          doc.text(value, x + 5, y + 7, {
            width: col.width - 10,
            height: rowHeight - 4,
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
          pageHeight - 25,
          { align: 'center', width: contentWidth }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateCandidatesPDF };