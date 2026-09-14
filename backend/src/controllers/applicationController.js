// backend/src/controllers/applicationController.js
const { Candidate, Company, Vacancy } = require('../models');
const { applicationSchema, statusUpdateSchema, noteSchema } = require('../validators');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function generateReference() {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `OVID-${year}-${num}`;
}

function formatFileSize(bytes) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

// ─────────────────────────────────────────────
// Applications
// ─────────────────────────────────────────────
exports.submitApplication = async (req, res) => {
  try {
    const { error, value } = applicationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details.map((d) => d.message) });
    }

    // If no preferredCompany, use the first company in the DB
    if (!value.preferredCompany) {
      const firstCompany = await Company.findOne({ order: [['name', 'ASC']] });
      if (!firstCompany) {
        return res.status(400).json({ error: 'No companies available for talent pool submission' });
      }
      value.preferredCompany = firstCompany.id;
    }

    // If no preferredDepartment, use a default
    if (!value.preferredDepartment) {
      value.preferredDepartment = 'Administration';
    }

    // If no city, use a default
    if (!value.city) {
      value.city = 'Dubai, UAE';
    }

    // If vacancyId is empty string, convert to null
    if (!value.vacancyId) {
      value.vacancyId = null;
    }

    // Validate vacancy if provided
    if (value.vacancyId) {
      const vacancy = await Vacancy.findByPk(value.vacancyId);
      if (!vacancy) return res.status(404).json({ error: 'Vacancy not found' });
    }

    // Validate company exists
    const company = await Company.findByPk(value.preferredCompany);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const reference = value.reference || generateReference();

    // Set talent pool status if no vacancy
    const status = value.vacancyId ? 'Submitted' : 'Talent Pool';

    const candidate = await Candidate.create({
      ...value,
      reference,
      documents: [],
      submittedAt: new Date(),
      status: value.status || status,
      notes: [],
    });

    res.status(201).json({
      id: candidate.id,
      reference: candidate.reference,
      message: 'Application submitted successfully',
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

    if (company && company !== 'all') where.preferredCompany = company;
    if (department && department !== 'all') where.preferredDepartment = department;
    if (location && location !== 'all') where.city = location;
    if (status && status !== 'all') where.status = status;
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { fieldOfStudy: { [Op.iLike]: `%${search}%` } },
        { reference: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const candidates = await Candidate.findAll({
      where,
      include: [
        { model: Company, as: 'company' },
        { model: Vacancy, as: 'vacancy' },
      ],
      order: [['submittedAt', 'DESC']],
    });

    res.json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id, {
      include: [
        { model: Company, as: 'company' },
        { model: Vacancy, as: 'vacancy' },
      ],
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { error, value } = statusUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ errors: error.details.map((d) => d.message) });

    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    await candidate.update({ status: value.status });

    const note = {
      author: 'HR Team',
      date: new Date().toISOString().split('T')[0],
      text: `Status updated to "${value.status}"`,
    };
    const notes = [...(candidate.notes || []), note];
    await candidate.update({ notes });

    res.json({ id: candidate.id, status: candidate.status, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

exports.addCandidateNote = async (req, res) => {
  try {
    const { error, value } = noteSchema.validate(req.body);
    if (error) return res.status(400).json({ errors: error.details.map((d) => d.message) });

    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const note = {
      author: 'You',
      date: new Date().toISOString().split('T')[0],
      text: value.text,
    };
    const notes = [...(candidate.notes || []), note];
    await candidate.update({ notes });

    res.json({ id: candidate.id, notes: candidate.notes, message: 'Note added successfully' });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const candidates = await Candidate.findAll();
    const byStatus = (s) => candidates.filter((c) => c.status === s).length;

    const stats = {
      total: candidates.length,
      submitted: byStatus('Submitted'),
      underReview: byStatus('Under Review') + byStatus('Longlisted'),
      longlisted: byStatus('Longlisted'),                // 🆕
      shortlisted: byStatus('Shortlisted'),
      interviews: byStatus('Interview Scheduled'),
      referenceCheck: byStatus('Reference Check'),
      selected: byStatus('Selected'),                    // 🆕
      offers: byStatus('Offer Issued'),
      hired: byStatus('Hired'),
      rejected: byStatus('Rejected'),
      pool: byStatus('Talent Pool'),
      conversionRate:
        candidates.length > 0
          ? Math.round(
              ((byStatus('Offer Issued') + byStatus('Hired')) / candidates.length) * 100
            )
          : 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// ─────────────────────────────────────────────
// File Uploads
// ─────────────────────────────────────────────
exports.uploadDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const candidate = await Candidate.findByPk(id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const newDocuments = [];

    if (files.cv && files.cv[0]) {
      const file = files.cv[0];
      newDocuments.push({
        name: file.originalname,
        type: path.extname(file.originalname).replace('.', '').toUpperCase(),
        size: formatFileSize(file.size),
        filename: file.filename,
        path: file.path,
        fieldname: 'cv',
      });
    }

    if (files.documents) {
      files.documents.forEach((file) => {
        newDocuments.push({
          name: file.originalname,
          type: path.extname(file.originalname).replace('.', '').toUpperCase(),
          size: formatFileSize(file.size),
          filename: file.filename,
          path: file.path,
          fieldname: file.fieldname,
        });
      });
    }

    const existingDocs = candidate.documents || [];
    await candidate.update({ documents: [...existingDocs, ...newDocuments] });

    res.json({ message: 'Files uploaded successfully', documents: newDocuments });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const { id, filename } = req.params;
    const candidate = await Candidate.findByPk(id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const doc = (candidate.documents || []).find((d) => d.filename === filename);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    if (!fs.existsSync(doc.path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    const ext = path.extname(doc.name).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.zip': 'application/zip',
    };

    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.name}"`);
    res.sendFile(path.resolve(doc.path));
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const { id, filename } = req.params;
    const candidate = await Candidate.findByPk(id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const doc = (candidate.documents || []).find((d) => d.filename === filename);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    if (!fs.existsSync(doc.path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(doc.path, doc.name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
};