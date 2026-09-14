// backend/src/controllers/exportController.js
const { Candidate, Company, Vacancy } = require('../models');
const { Op } = require('sequelize');
const { generateCandidatesExcel } = require('../services/excelService');
const { generateCandidatesPDF } = require('../services/pdfService');

// Helper — build query from filters
function buildWhereFromFilters(query) {
  const where = {};

  if (query.company && query.company !== 'all') {
    where.preferredCompany = query.company;
  }
  if (query.department && query.department !== 'all') {
    where.preferredDepartment = query.department;
  }
  if (query.location && query.location !== 'all') {
    where.city = query.location;
  }
  if (query.status && query.status !== 'all') {
    where.status = query.status;
  }
  if (query.search) {
    where[Op.or] = [
      { fullName: { [Op.iLike]: `%${query.search}%` } },
      { email: { [Op.iLike]: `%${query.search}%` } },
      { fieldOfStudy: { [Op.iLike]: `%${query.search}%` } },
      { reference: { [Op.iLike]: `%${query.search}%` } },
    ];
  }

  return where;
}

// ─────────────────────────────────────────────
// GET /api/exports/candidates/excel
// ─────────────────────────────────────────────
exports.exportCandidatesExcel = async (req, res) => {
  try {
    const where = buildWhereFromFilters(req.query);

    const candidates = await Candidate.findAll({
      where,
      include: [
        { model: Company, as: 'company' },
        { model: Vacancy, as: 'vacancy' },
      ],
      order: [['submittedAt', 'DESC']],
    });

    const buffer = await generateCandidatesExcel(
      candidates.map((c) => c.toJSON()),
      req.query
    );

    const filename = `candidates-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(Buffer.from(buffer));
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to generate Excel export' });
  }
};

// ─────────────────────────────────────────────
// GET /api/exports/candidates/pdf
// ─────────────────────────────────────────────
exports.exportCandidatesPDF = async (req, res) => {
  try {
    const where = buildWhereFromFilters(req.query);

    const candidates = await Candidate.findAll({
      where,
      include: [
        { model: Company, as: 'company' },
        { model: Vacancy, as: 'vacancy' },
      ],
      order: [['submittedAt', 'DESC']],
    });

    const buffer = await generateCandidatesPDF(
      candidates.map((c) => c.toJSON()),
      req.query
    );

    const filename = `candidates-${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to generate PDF export' });
  }
};