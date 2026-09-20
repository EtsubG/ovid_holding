// backend/src/controllers/vacancyController.js
const { Vacancy, Company } = require('../models');
const { vacancySchema } = require('../validators');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────
// PUBLIC: Get all vacancies (filters, search, sort)
// ─────────────────────────────────────────────
// backend/src/controllers/vacancyController.js

exports.getAllVacancies = async (req, res) => {
  try {
    const {
      company,
      location,
      department,
      type,
      search,
      featured,
      includeInactive,
      sortBy,
    } = req.query;

    const where = {};

    // ─────────────────────────────────────────────
    // 🔒 COMPANY SCOPE
    // Applied ONLY for company_hr users (set by applyCompanyScope middleware)
    // Public visitors get req.companyScope = undefined → no filter
    // ─────────────────────────────────────────────
    if (req.companyScope) {
      where.companyId = req.companyScope;
    } else {
      // No scope → only apply URL-provided company filter
      if (company && company !== 'all') where.companyId = company;
    }

    // Public users only see active vacancies
    // HR can pass includeInactive=true to see drafts
    if (includeInactive !== 'true') {
      where.isActive = true;
    }

    if (location && location !== 'all') where.location = location;
    if (department && department !== 'all') where.department = department;
    if (type && type !== 'all') where.type = type;
    if (featured === 'true') where.featured = true;

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { summary: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    let order = [['featured', 'DESC'], ['postedDate', 'DESC']];
    switch (sortBy) {
      case 'newest':
        order = [['postedDate', 'DESC']];
        break;
      case 'oldest':
        order = [['postedDate', 'ASC']];
        break;
      case 'title-asc':
        order = [['title', 'ASC']];
        break;
      case 'title-desc':
        order = [['title', 'DESC']];
        break;
      case 'closing-asc':
        order = [['closingDate', 'ASC']];
        break;
      case 'closing-desc':
        order = [['closingDate', 'DESC']];
        break;
    }

    const vacancies = await Vacancy.findAll({
      where,
      include: [{ model: Company, as: 'company' }],
      order,
    });

    res.json(vacancies);
  } catch (error) {
    console.error('Get vacancies error:', error);
    res.status(500).json({ error: 'Failed to fetch vacancies' });
  }
};

// ─────────────────────────────────────────────
// PUBLIC: Get single vacancy
// ─────────────────────────────────────────────
exports.getVacancyById = async (req, res) => {
  try {
    const vacancy = await Vacancy.findByPk(req.params.id, {
      include: [{ model: Company, as: 'company' }],
    });

    if (!vacancy) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }

    res.json(vacancy);
  } catch (error) {
    console.error('Get vacancy error:', error);
    res.status(500).json({ error: 'Failed to fetch vacancy' });
  }
};

// ─────────────────────────────────────────────
// HR: Create vacancy
// ─────────────────────────────────────────────
exports.createVacancy = async (req, res) => {
  try {
    const { error, value } = vacancySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    // 🆕 Company HR can only create vacancies for their own company
    const { canAccessCompany } = require('../middleware/auth');
    if (!canAccessCompany(req, value.companyId)) {
      return res.status(403).json({
        error: 'You can only create vacancies for your own company',
      });
    }

    // Verify company exists
    const company = await Company.findByPk(value.companyId);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    if (!value.id) value.id = `v-${uuidv4().slice(0, 8)}`;

    const existing = await Vacancy.findByPk(value.id);
    if (existing) return res.status(409).json({ error: 'Vacancy ID already exists' });

    // 🆕 New vacancies start as drafts pending approval
    value.isActive = false;
    value.approvalStatus = 'Pending';

    const vacancy = await Vacancy.create(value);

    const created = await Vacancy.findByPk(vacancy.id, {
      include: [{ model: Company, as: 'company' }],
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Create vacancy error:', error);
    res.status(500).json({ error: 'Failed to create vacancy' });
  }
};

// ─────────────────────────────────────────────
// HR: Update vacancy
// ─────────────────────────────────────────────
exports.updateVacancy = async (req, res) => {
  try {
    const vacancy = await Vacancy.findByPk(req.params.id);
    if (!vacancy) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }

    // Add this check to updateVacancy, deleteVacancy, toggleVacancyActive:
const { canAccessCompany } = require('../middleware/auth');
if (!canAccessCompany(req, vacancy.companyId)) {
  return res.status(403).json({ error: 'You do not have access to this vacancy' });
}

    // Partial update — validate only provided fields
    const { error, value } = vacancySchema
      .fork(
        ['title', 'companyId', 'department', 'location', 'type', 'experienceLevel',
         'experienceYears', 'salaryRange', 'closingDate', 'summary', 'description'],
        (schema) => schema.optional()
      )
      .validate(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    // Don't allow ID changes
    delete value.id;

    await vacancy.update(value);

    const updated = await Vacancy.findByPk(vacancy.id, {
      include: [{ model: Company, as: 'company' }],
    });

    res.json(updated);
  } catch (error) {
    console.error('Update vacancy error:', error);
    res.status(500).json({ error: 'Failed to update vacancy' });
  }
};

// ─────────────────────────────────────────────
// HR: Delete vacancy
// ─────────────────────────────────────────────
exports.deleteVacancy = async (req, res) => {
  try {
    const vacancy = await Vacancy.findByPk(req.params.id);
    if (!vacancy) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }
    // Add this check to updateVacancy, deleteVacancy, toggleVacancyActive:
const { canAccessCompany } = require('../middleware/auth');
if (!canAccessCompany(req, vacancy.companyId)) {
  return res.status(403).json({ error: 'You do not have access to this vacancy' });
}

    await vacancy.destroy();
    res.json({ message: 'Vacancy deleted successfully', id: vacancy.id });
  } catch (error) {
    console.error('Delete vacancy error:', error);
    res.status(500).json({ error: 'Failed to delete vacancy' });
  }
};

// ─────────────────────────────────────────────
// HR: Toggle publish/unpublish
// ─────────────────────────────────────────────
exports.toggleVacancyActive = async (req, res) => {
  try {
    const vacancy = await Vacancy.findByPk(req.params.id);
    if (!vacancy) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }

    // Can only publish if approved
    if (!vacancy.isActive && vacancy.approvalStatus !== 'Approved') {
      return res.status(400).json({
        error: 'Vacancy must be approved before it can be published',
      });
    }

    // Add this check to updateVacancy, deleteVacancy, toggleVacancyActive:
const { canAccessCompany } = require('../middleware/auth');
if (!canAccessCompany(req, vacancy.companyId)) {
  return res.status(403).json({ error: 'You do not have access to this vacancy' });
}

    await vacancy.update({ isActive: !vacancy.isActive });

    res.json({
      id: vacancy.id,
      isActive: vacancy.isActive,
      message: vacancy.isActive ? 'Vacancy published' : 'Vacancy unpublished',
    });
  } catch (error) {
    console.error('Toggle vacancy error:', error);
    res.status(500).json({ error: 'Failed to update vacancy' });
  }
};

// ─────────────────────────────────────────────
// HR: Toggle featured
// ─────────────────────────────────────────────
exports.toggleVacancyFeatured = async (req, res) => {
  try {
    const vacancy = await Vacancy.findByPk(req.params.id);
    if (!vacancy) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }

    await vacancy.update({ featured: !vacancy.featured });

    res.json({
      id: vacancy.id,
      featured: vacancy.featured,
      message: vacancy.featured ? 'Marked as featured' : 'Removed from featured',
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ error: 'Failed to update vacancy' });
  }
};

// ─────────────────────────────────────────────
// HR: Submit vacancy for approval
// ─────────────────────────────────────────────
exports.submitForApproval = async (req, res) => {
  try {
    const vacancy = await Vacancy.findByPk(req.params.id);
    if (!vacancy) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }

    if (vacancy.approvalStatus === 'Approved') {
      return res.status(400).json({ error: 'Vacancy is already approved' });
    }

    await vacancy.update({
      approvalStatus: 'Pending',
      isActive: false,   // Can't be public until approved
      rejectionReason: null,
    });

    res.json({
      id: vacancy.id,
      approvalStatus: vacancy.approvalStatus,
      message: 'Submitted for approval',
    });
  } catch (error) {
    console.error('Submit for approval error:', error);
    res.status(500).json({ error: 'Failed to submit for approval' });
  }
};

// ─────────────────────────────────────────────
// Manager/Admin: Approve vacancy
// ─────────────────────────────────────────────
exports.approveVacancy = async (req, res) => {
  try {
    const { notes } = req.body;

    const vacancy = await Vacancy.findByPk(req.params.id);
    if (!vacancy) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }

    if (vacancy.approvalStatus === 'Approved') {
      return res.status(400).json({ error: 'Vacancy is already approved' });
    }

    await vacancy.update({
      approvalStatus: 'Approved',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      approvalNotes: notes || null,
      rejectionReason: null,
    });

    res.json({
      id: vacancy.id,
      approvalStatus: 'Approved',
      message: 'Vacancy approved. Ready to publish.',
    });
  } catch (error) {
    console.error('Approve vacancy error:', error);
    res.status(500).json({ error: 'Failed to approve vacancy' });
  }
};

// ─────────────────────────────────────────────
// Manager/Admin: Reject vacancy
// ─────────────────────────────────────────────
exports.rejectVacancy = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        error: 'Rejection reason is required (min 10 characters)',
      });
    }

    const vacancy = await Vacancy.findByPk(req.params.id);
    if (!vacancy) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }

    await vacancy.update({
      approvalStatus: 'Rejected',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      rejectionReason: reason.trim(),
      isActive: false,
    });

    res.json({
      id: vacancy.id,
      approvalStatus: 'Rejected',
      message: 'Vacancy rejected',
    });
  } catch (error) {
    console.error('Reject vacancy error:', error);
    res.status(500).json({ error: 'Failed to reject vacancy' });
  }
};

// ─────────────────────────────────────────────
// Get pending approvals
// ─────────────────────────────────────────────
exports.getPendingApprovals = async (req, res) => {
  try {
    const vacancies = await Vacancy.findAll({
      where: { approvalStatus: 'Pending' },
      include: [{ model: Company, as: 'company' }],
      order: [['createdAt', 'DESC']],
    });

    res.json(vacancies);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
};