// backend/src/controllers/exportController.js
const { Candidate, Company, Vacancy } = require('../models');
const { Op } = require('sequelize');
const { generateCandidatesExcel } = require('../services/excelService');
const { generateCandidatesPDF } = require('../services/pdfService');

// ─────────────────────────────────────────────
// Helper — build WHERE clause from filters + user scope
// ─────────────────────────────────────────────
function buildScopedWhere(req) {
  const { company, department, location, status, search } = req.query;
  const where = {};

  // 🔒 COMPANY SCOPE — company_hr only sees their own company
  if (req.companyScope) {
    where.preferredCompany = req.companyScope;
  } else if (company && company !== 'all') {
    // Only apply URL-provided company filter for global roles
    where.preferredCompany = company;
  }

  if (department && department !== 'all') {
    where.preferredDepartment = department;
  }
  if (location && location !== 'all') {
    where.city = location;
  }
  if (status && status !== 'all') {
    where.status = status;
  }
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { fieldOfStudy: { [Op.iLike]: `%${search}%` } },
      { reference: { [Op.iLike]: `%${search}%` } },
    ];
  }

  return where;
}

// ─────────────────────────────────────────────
// GET /api/exports/candidates/excel
// ─────────────────────────────────────────────
exports.exportCandidatesExcel = async (req, res) => {
  try {
    const where = buildScopedWhere(req);

    // 🔒 Extra safety: if company_hr, force their company
    if (req.companyScope) {
      where.preferredCompany = req.companyScope;
    }

    const candidates = await Candidate.findAll({
      where,
      include: [
        { model: Company, as: 'company' },
        { model: Vacancy, as: 'vacancy' },
      ],
      order: [['submittedAt', 'DESC']],
    });

    console.log(
      `📊 Excel export by ${req.user?.email} (${req.user?.role}) — ` +
        `${candidates.length} candidates` +
        (req.companyScope ? ` [scoped to ${req.companyScope}]` : ' [all companies]')
    );

    const buffer = await generateCandidatesExcel(
      candidates.map((c) => c.toJSON()),
      {
        ...req.query,
        // Include scope info in the "Filters Applied" section of the summary sheet
        ...(req.companyScope ? { scopedTo: req.companyScope } : {}),
      }
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
    const where = buildScopedWhere(req);

    if (req.companyScope) {
      where.preferredCompany = req.companyScope;
    }

    const candidates = await Candidate.findAll({
      where,
      include: [
        { model: Company, as: 'company' },
        { model: Vacancy, as: 'vacancy' },
      ],
      order: [['submittedAt', 'DESC']],
    });

    console.log(
      `📊 PDF export by ${req.user?.email} (${req.user?.role}) — ` +
        `${candidates.length} candidates` +
        (req.companyScope ? ` [scoped to ${req.companyScope}]` : ' [all companies]')
    );

    const buffer = await generateCandidatesPDF(
      candidates.map((c) => c.toJSON()),
      {
        ...req.query,
        ...(req.companyScope ? { scopedTo: req.companyScope } : {}),
      }
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