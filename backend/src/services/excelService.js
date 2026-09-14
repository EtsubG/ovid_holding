// backend/src/services/excelService.js
const ExcelJS = require('exceljs');

/**
 * Generate an Excel workbook from candidate data
 * @param {Array} candidates - array of candidate objects
 * @param {Object} filters - active filters (for filename/summary sheet)
 * @returns {Promise<Buffer>} - Excel file as buffer
 */
async function generateCandidatesExcel(candidates, filters = {}) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'Ovid Holding';
  workbook.created = new Date();
  workbook.title = 'Candidates Export';

  // ─────────────────────────────────────────────
  // Sheet 1: Candidates (main data)
  // ─────────────────────────────────────────────
  const sheet = workbook.addWorksheet('Candidates', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = [
    { header: 'Reference', key: 'reference', width: 18 },
    { header: 'Full Name', key: 'fullName', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 20 },
    { header: 'City', key: 'city', width: 18 },
    { header: 'Nationality', key: 'nationality', width: 15 },
    { header: 'Qualification', key: 'highestQualification', width: 18 },
    { header: 'Field of Study', key: 'fieldOfStudy', width: 25 },
    { header: 'Institution', key: 'institution', width: 25 },
    { header: 'Graduation Year', key: 'graduationYear', width: 15 },
    { header: 'CGPA', key: 'cgpa', width: 12 },
    { header: 'Current Status', key: 'currentStatus', width: 15 },
    { header: 'Current Employer', key: 'currentEmployer', width: 22 },
    { header: 'Current Role', key: 'currentRole', width: 22 },
    { header: 'Total Experience', key: 'totalExperience', width: 15 },
    { header: 'Relevant Experience', key: 'relevantExperience', width: 18 },
    { header: 'Expected Salary', key: 'expectedSalary', width: 20 },
    { header: 'Availability', key: 'availability', width: 15 },
    { header: 'Applied For', key: 'vacancyTitle', width: 30 },
    { header: 'Company', key: 'companyName', width: 22 },
    { header: 'Department', key: 'preferredDepartment', width: 22 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Submitted', key: 'submittedAt', width: 14 },
    { header: 'Documents', key: 'documentsCount', width: 12 },
    { header: 'Notes', key: 'notesCount', width: 10 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Primary color
    };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // Add data rows
  candidates.forEach((c, idx) => {
    const row = sheet.addRow({
      reference: c.reference || '',
      fullName: c.fullName || '',
      email: c.email || '',
      phone: c.phone || '',
      city: c.city || '',
      nationality: c.nationality || '',
      highestQualification: c.highestQualification || '',
      fieldOfStudy: c.fieldOfStudy || '',
      institution: c.institution || '',
      graduationYear: c.graduationYear || '',
      cgpa: c.cgpa || '',
      currentStatus: c.currentStatus || '',
      currentEmployer: c.currentEmployer || '',
      currentRole: c.currentRole || '',
      totalExperience: c.totalExperience || '',
      relevantExperience: c.relevantExperience || '',
      expectedSalary: c.expectedSalary || '',
      availability: c.availability || '',
      vacancyTitle: c.vacancy?.title || 'Talent Pool',
      companyName: c.company?.name || '',
      preferredDepartment: c.preferredDepartment || '',
      status: c.status || '',
      submittedAt: c.submittedAt
        ? new Date(c.submittedAt).toLocaleDateString('en-GB')
        : '',
      documentsCount: (c.documents || []).length,
      notesCount: (c.notes || []).length,
    });

    // Alternating row color
    if (idx % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      });
    }

    // Color-code status
    const statusCell = row.getCell('status');
    const statusColors = {
      Submitted: 'FF64748B',
      'Under Review': 'FF3B82F6',
      Shortlisted: 'FF06B6D4',
      'Interview Scheduled': 'FF8B5CF6',
      'Reference Check': 'FFF59E0B',
      'Offer Issued': 'FF10B981',
      Hired: 'FF10B981',
      'Talent Pool': 'FF14B8A6',
      Rejected: 'FFF43F5E',
    };
    if (statusColors[c.status]) {
      statusCell.font = {
        color: { argb: statusColors[c.status] },
        bold: true,
      };
    }
  });

  // Add auto-filter on header row
  sheet.autoFilter = {
    from: 'A1',
    to: `Y${candidates.length + 1}`,
  };

  // ─────────────────────────────────────────────
  // Sheet 2: Summary
  // ─────────────────────────────────────────────
  const summary = workbook.addWorksheet('Summary');
  summary.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Count', key: 'count', width: 15 },
  ];

  const summaryHeader = summary.getRow(1);
  summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summaryHeader.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    };
  });

  const byStatus = (s) => candidates.filter((c) => c.status === s).length;

  summary.addRows([
    { metric: 'Total Candidates', count: candidates.length },
    { metric: '', count: '' },
    { metric: '── By Status ──', count: '' },
    { metric: 'Submitted', count: byStatus('Submitted') },
    { metric: 'Under Review', count: byStatus('Under Review') },
    { metric: 'Shortlisted', count: byStatus('Shortlisted') },
    { metric: 'Interview Scheduled', count: byStatus('Interview Scheduled') },
    { metric: 'Reference Check', count: byStatus('Reference Check') },
    { metric: 'Offer Issued', count: byStatus('Offer Issued') },
    { metric: 'Hired', count: byStatus('Hired') },
    { metric: 'Talent Pool', count: byStatus('Talent Pool') },
    { metric: 'Rejected', count: byStatus('Rejected') },
    { metric: '', count: '' },
    { metric: '── Metadata ──', count: '' },
    { metric: 'Exported On', count: new Date().toLocaleString('en-GB') },
    { metric: 'Filters Applied', count: Object.keys(filters).length > 0 ? 'Yes' : 'None' },
  ]);

  Object.entries(filters).forEach(([k, v]) => {
    if (v && v !== 'all') {
      summary.addRow({ metric: `  ${k}`, count: v });
    }
  });

  // Freeze header
  summary.views = [{ state: 'frozen', ySplit: 1 }];

  // Return as buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateCandidatesExcel };