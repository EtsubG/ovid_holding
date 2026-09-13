const { Vacancy, Company } = require('../models');
const { Op } = require('sequelize');

exports.getAllVacancies = async (req, res) => {
  try {
    const { company, location, department, type, search, featured } = req.query;
    
    const where = {};
    
    if (company && company !== 'all') {
      where.companyId = company;
    }
    if (location && location !== 'all') {
      where.location = location;
    }
    if (department && department !== 'all') {
      where.department = department;
    }
    if (type && type !== 'all') {
      where.type = type;
    }
    if (featured === 'true') {
      where.featured = true;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { summary: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const vacancies = await Vacancy.findAll({
      where,
      include: [{
        model: Company,
        as: 'company'
      }],
      order: [['featured', 'DESC'], ['postedDate', 'DESC']]
    });
    
    res.json(vacancies);
  } catch (error) {
    console.error('Get vacancies error:', error);
    res.status(500).json({ error: 'Failed to fetch vacancies' });
  }
};

exports.getVacancyById = async (req, res) => {
  try {
    const { id } = req.params;
    const vacancy = await Vacancy.findByPk(id, {
      include: [{
        model: Company,
        as: 'company'
      }]
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

// Create vacancy
exports.createVacancy = async (req, res) => {
  try {
    const vacancyData = req.body;
    const vacancy = await Vacancy.create(vacancyData);
    res.status(201).json(vacancy);
  } catch (error) {
    console.error('Create vacancy error:', error);
    res.status(500).json({ error: 'Failed to create vacancy' });
  }
};

// Update vacancy
exports.updateVacancy = async (req, res) => {
  try {
    const { id } = req.params;
    const vacancy = await Vacancy.findByPk(id);
    
    if (!vacancy) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }
    
    await vacancy.update(req.body);
    res.json(vacancy);
  } catch (error) {
    console.error('Update vacancy error:', error);
    res.status(500).json({ error: 'Failed to update vacancy' });
  }
};

// Delete vacancy
exports.deleteVacancy = async (req, res) => {
  try {
    const { id } = req.params;
    const vacancy = await Vacancy.findByPk(id);
    
    if (!vacancy) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }
    
    await vacancy.destroy();
    res.json({ message: 'Vacancy deleted successfully' });
  } catch (error) {
    console.error('Delete vacancy error:', error);
    res.status(500).json({ error: 'Failed to delete vacancy' });
  }
};