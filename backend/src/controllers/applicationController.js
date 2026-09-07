const { Candidate, Company, Vacancy } = require('../models');
const { applicationSchema, statusUpdateSchema, noteSchema } = require('../validators');
const { Op } = require('sequelize');

// Generate reference number
function generateReference() {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `OVID-${year}-${num}`;
}

exports.submitApplication = async (req, res) => {
  try {
    const { error, value } = applicationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details.map(d => d.message) });
    }
    
    // Check if vacancy exists (if provided)
    if (value.vacancyId) {
      const vacancy = await Vacancy.findByPk(value.vacancyId);
      if (!vacancy) {
        return res.status(404).json({ error: 'Vacancy not found' });
      }
    }
    
    // Check if company exists
    const company = await Company.findByPk(value.preferredCompany);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const reference = generateReference();
    
    // Build documents array
    const documents = [];
    if (value.fullName) {
      documents.push({
        name: `${value.fullName.replace(/\s/g, '_')}_CV.pdf`,
        type: 'PDF',
        size: '284 KB'
      });
    }
    documents.push({
      name: 'Cover_Letter.pdf',
      type: 'PDF',
      size: '112 KB'
    });
    
    const candidate = await Candidate.create({
      ...value,
      reference,
      documents,
      submittedAt: new Date(),
      status: 'Submitted',
      notes: []
    });
    
    res.status(201).json({
      id: candidate.id,
      reference: candidate.reference,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    const { company, department, location, status, search } = req.query;
    
    const where = {};
    
    if (company && company !== 'all') {
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
        { reference: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const candidates = await Candidate.findAll({
      where,
      include: [
        { model: Company, as: 'company' },
        { model: Vacancy, as: 'vacancy' }
      ],
      order: [['submittedAt', 'DESC']]
    });
    
    res.json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByPk(id, {
      include: [
        { model: Company, as: 'company' },
        { model: Vacancy, as: 'vacancy' }
      ]
    });
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = statusUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ errors: error.details.map(d => d.message) });
    }
    
    const candidate = await Candidate.findByPk(id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    await candidate.update({ status: value.status });
    
    // Add to notes
    const note = {
      author: 'HR Team',
      date: new Date().toISOString().split('T')[0],
      text: `Status updated to "${value.status}"`
    };
    const notes = [...candidate.notes, note];
    await candidate.update({ notes });
    
    res.json({ 
      id: candidate.id,
      status: candidate.status,
      message: 'Status updated successfully' 
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

exports.addCandidateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = noteSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ errors: error.details.map(d => d.message) });
    }
    
    const candidate = await Candidate.findByPk(id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    const note = {
      author: 'You',
      date: new Date().toISOString().split('T')[0],
      text: value.text
    };
    const notes = [...candidate.notes, note];
    await candidate.update({ notes });
    
    res.json({ 
      id: candidate.id,
      notes: candidate.notes,
      message: 'Note added successfully' 
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const candidates = await Candidate.findAll();
    
    const stats = {
      total: candidates.length,
      submitted: candidates.filter(c => c.status === 'Submitted').length,
      underReview: candidates.filter(c => c.status === 'Under Review' || c.status === 'Shortlisted').length,
      shortlisted: candidates.filter(c => c.status === 'Shortlisted').length,
      interviews: candidates.filter(c => c.status === 'Interview Scheduled').length,
      offers: candidates.filter(c => c.status === 'Offer Issued').length,
      hired: candidates.filter(c => c.status === 'Hired').length,
      rejected: candidates.filter(c => c.status === 'Rejected').length,
      pool: candidates.filter(c => c.status === 'Talent Pool').length,
      conversionRate: candidates.length > 0 
        ? Math.round(((candidates.filter(c => c.status === 'Offer Issued' || c.status === 'Hired').length) / candidates.length) * 100)
        : 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};