// backend/src/controllers/companyController.js
const { Company, Vacancy, Candidate } = require('../models');
const { companySchema } = require('../validators');

// ─────────────────────────────────────────────
// PUBLIC: Get all companies
// ─────────────────────────────────────────────
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      order: [['name', 'ASC']],
    });
    res.json(companies);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

// ─────────────────────────────────────────────
// PUBLIC: Get single company
// ─────────────────────────────────────────────
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id, {
      include: [
        {
          model: Vacancy,
          as: 'vacancies',
          required: false,
          where: { isActive: true },
        },
      ],
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Create company
// ─────────────────────────────────────────────
exports.createCompany = async (req, res) => {
  try {
    const { error, value } = companySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    // Check if ID already exists
    const existing = await Company.findByPk(value.id);
    if (existing) {
      return res.status(409).json({
        error: `Company ID "${value.id}" already exists`,
      });
    }

    const company = await Company.create(value);

    console.log(`✅ Company created: ${company.name} (${company.id})`);
    res.status(201).json(company);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Update company
// ─────────────────────────────────────────────
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Partial validation — ID cannot change
    const { error, value } = companySchema
      .fork(['id'], (schema) => schema.optional())
      .validate(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    // ID can't be updated
    delete value.id;

    await company.update(value);

    console.log(`✅ Company updated: ${company.name}`);
    res.json(company);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Delete company (with safety checks)
// ─────────────────────────────────────────────
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Safety check: does the company have active vacancies?
    const activeVacancies = await Vacancy.count({
      where: {
        companyId: company.id,
        isActive: true,
      },
    });

    if (activeVacancies > 0) {
      return res.status(400).json({
        error: `Cannot delete: company has ${activeVacancies} active vacancy(ies). Unpublish or delete them first.`,
      });
    }

    // Safety check: does the company have candidates?
    const candidateCount = await Candidate.count({
      where: { preferredCompany: company.id },
    });

    if (candidateCount > 0) {
      return res.status(400).json({
        error: `Cannot delete: company has ${candidateCount} candidate record(s). Reassign or remove them first.`,
      });
    }

    // Also count all vacancies (even inactive) for info
    const totalVacancies = await Vacancy.count({
      where: { companyId: company.id },
    });

    await company.destroy();

    console.log(`🗑️  Company deleted: ${company.name}`);

    res.json({
      message: 'Company deleted successfully',
      id: company.id,
      deletedVacancies: totalVacancies,
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Check what would be deleted (dry run)
// ─────────────────────────────────────────────
exports.checkCompanyDeletion = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const activeVacancies = await Vacancy.count({
      where: { companyId: company.id, isActive: true },
    });
    const totalVacancies = await Vacancy.count({
      where: { companyId: company.id },
    });
    const candidates = await Candidate.count({
      where: { preferredCompany: company.id },
    });

    res.json({
      canDelete: activeVacancies === 0 && candidates === 0,
      activeVacancies,
      totalVacancies,
      candidates,
      reasons: [
        activeVacancies > 0 && `${activeVacancies} active vacancies`,
        candidates > 0 && `${candidates} candidate records`,
      ].filter(Boolean),
    });
  } catch (error) {
    console.error('Check deletion error:', error);
    res.status(500).json({ error: 'Failed to check' });
  }
};