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