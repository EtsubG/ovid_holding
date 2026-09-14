// backend/src/controllers/vacancyController.js
const { Vacancy, Company } = require('../models');
const { vacancySchema } = require('../validators');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────
// PUBLIC: Get all vacancies (filters, search, sort)
// ─────────────────────────────────────────────
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

    // Public users only see active vacancies
    // HR can pass `includeInactive=true` to see drafts
    if (includeInactive !== 'true') {
      where.isActive = true;
    }

    if (company && company !== 'all') where.companyId = company;
    if (location && location !== 'all') where.location = location;
    if (department && department !== 'all') where.department = department;
    if (type && type !== 'all') where.type = type;
    if (featured === 'true') where.featured = true;

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { summary: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    let order = [['featured', 'DESC'], ['postedDate', 'DESC']];

    switch (sortBy) {
      case 'newest': order = [['postedDate', 'DESC']]; break;
      case 'oldest': order = [['postedDate', 'ASC']]; break;
      case 'title-asc': order = [['title', 'ASC']]; break;
      case 'title-desc': order = [['title', 'DESC']]; break;
      case 'closing-asc': order = [['closingDate', 'ASC']]; break;
      case 'closing-desc': order = [['closingDate', 'DESC']]; break;
      default: break;
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

    // Verify company exists
    const company = await Company.findByPk(value.companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Auto-generate ID if not provided
    if (!value.id) {
      value.id = `v-${uuidv4().slice(0, 8)}`;
    }

    // Ensure ID is unique
    const existing = await Vacancy.findByPk(value.id);
    if (existing) {
      return res.status(409).json({ error: 'Vacancy ID already exists' });
    }

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