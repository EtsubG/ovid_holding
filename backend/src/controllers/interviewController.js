// backend/src/controllers/interviewController.js
const { Interview, Candidate, Vacancy, Company } = require('../models');
const { Op } = require('sequelize');

// ─────────────────────────────────────────────
// GET /api/interviews
// List all interviews (with optional filters)
// ─────────────────────────────────────────────
exports.getAllInterviews = async (req, res) => {
  try {
    const { status, upcoming, candidateId } = req.query;
    const where = {};

    if (status && status !== 'all') where.status = status;
    if (candidateId) where.candidateId = candidateId;

    if (upcoming === 'true') {
      where.scheduledDate = { [Op.gte]: new Date() };
      where.status = 'Scheduled';
    }

    const interviews = await Interview.findAll({
      where,
      include: [
        {
          model: Candidate,
          as: 'candidate',
          include: [
            { model: Vacancy, as: 'vacancy' },
            { model: Company, as: 'company' },
          ],
        },
      ],
      order: [['scheduledDate', 'ASC']],
    });

    res.json(interviews);
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

// ─────────────────────────────────────────────
// GET /api/interviews/:id
// ─────────────────────────────────────────────
exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id, {
      include: [
        {
          model: Candidate,
          as: 'candidate',
          include: [
            { model: Vacancy, as: 'vacancy' },
            { model: Company, as: 'company' },
          ],
        },
      ],
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
};

// ─────────────────────────────────────────────
// GET /api/interviews/candidate/:candidateId
// ─────────────────────────────────────────────
exports.getCandidateInterviews = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const interviews = await Interview.findAll({
      where: { candidateId },
      order: [['scheduledDate', 'DESC']],
    });

    res.json(interviews);
  } catch (error) {
    console.error('Get candidate interviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

// ─────────────────────────────────────────────
// POST /api/interviews
// Create new interview
// ─────────────────────────────────────────────
exports.createInterview = async (req, res) => {
  try {
    const {
      candidateId,
      title,
      type,
      scheduledDate,
      duration,
      location,
      meetingLink,
      interviewerName,
      interviewerEmail,
      notes,
    } = req.body;

    // Validate
    if (!candidateId || !title || !type || !scheduledDate) {
      return res.status(400).json({
        error: 'Missing required fields: candidateId, title, type, scheduledDate',
      });
    }

    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const interview = await Interview.create({
      candidateId,
      title,
      type,
      scheduledDate,
      duration: duration || 60,
      location,
      meetingLink,
      interviewerName,
      interviewerEmail,
      notes,
      status: 'Scheduled',
    });

    // Auto-update candidate status to "Interview Scheduled"
    if (candidate.status !== 'Interview Scheduled') {
      await candidate.update({ status: 'Interview Scheduled' });
    }

    // Add note to candidate timeline
    const candidateNotes = [
      ...(candidate.notes || []),
      {
        author: 'HR Team',
        date: new Date().toISOString().split('T')[0],
        text: `Interview scheduled: ${title} on ${new Date(scheduledDate).toLocaleString('en-GB')}`,
      },
    ];
    await candidate.update({ notes: candidateNotes });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ error: 'Failed to create interview' });
  }
};

// ─────────────────────────────────────────────
// PUT /api/interviews/:id
// Update interview
// ─────────────────────────────────────────────
// backend/src/controllers/interviewController.js

// Replace the updateInterview function with this:

exports.updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const {
      title,
      type,
      scheduledDate,
      duration,
      location,
      meetingLink,
      interviewerName,
      interviewerEmail,
      status,
      notes,
      feedback,
      rating,
      decision,   // 🆕 'pass' | 'fail' | 'maybe' | null
    } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (type !== undefined) updates.type = type;
    if (scheduledDate !== undefined) updates.scheduledDate = scheduledDate;
    if (duration !== undefined) updates.duration = duration;
    if (location !== undefined) updates.location = location;
    if (meetingLink !== undefined) updates.meetingLink = meetingLink;
    if (interviewerName !== undefined) updates.interviewerName = interviewerName;
    if (interviewerEmail !== undefined) updates.interviewerEmail = interviewerEmail;
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (feedback !== undefined) updates.feedback = feedback;
    if (rating !== undefined) updates.rating = rating;

    await interview.update(updates);

    const candidate = await Candidate.findByPk(interview.candidateId);

    // ─────────────────────────────────────────
    // If marked as Completed, log it + apply decision
    // ─────────────────────────────────────────
    if (status === 'Completed' && candidate) {
      let candidateStatusUpdate = null;
      let decisionText = '';

      if (decision === 'pass') {
        // Move to next stage
        candidateStatusUpdate = 'Reference Check';
        decisionText = ' ✅ PASSED';
      } else if (decision === 'fail') {
        candidateStatusUpdate = 'Rejected';
        decisionText = ' ❌ NOT SELECTED';
      } else if (decision === 'maybe') {
        candidateStatusUpdate = 'Under Review';
        decisionText = ' 🤔 ON HOLD';
      }

      // Add timeline note
      const candidateNotes = [
        ...(candidate.notes || []),
        {
          author: 'HR Team',
          date: new Date().toISOString().split('T')[0],
          text:
            `Interview completed: ${interview.title}${decisionText}` +
            (feedback ? ` — ${feedback}` : '') +
            (rating ? ` (Rating: ${'⭐'.repeat(rating)})` : ''),
        },
      ];

      const candidateUpdates = { notes: candidateNotes };
      if (candidateStatusUpdate) {
        candidateUpdates.status = candidateStatusUpdate;
      }

      await candidate.update(candidateUpdates);
    }

    res.json(interview);
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ error: 'Failed to update interview' });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/interviews/:id
// ─────────────────────────────────────────────
exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const candidateId = interview.candidateId;
    await interview.destroy();

    // Log deletion in candidate notes
    const candidate = await Candidate.findByPk(candidateId);
    if (candidate) {
      const candidateNotes = [
        ...(candidate.notes || []),
        {
          author: 'HR Team',
          date: new Date().toISOString().split('T')[0],
          text: `Interview cancelled: ${interview.title}`,
        },
      ];
      await candidate.update({ notes: candidateNotes });
    }

    res.json({ message: 'Interview deleted successfully', id: interview.id });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({ error: 'Failed to delete interview' });
  }
};

// ─────────────────────────────────────────────
// GET /api/interviews/stats
// Dashboard stats
// ─────────────────────────────────────────────
exports.getInterviewStats = async (req, res) => {
  try {
    const all = await Interview.findAll();
    const now = new Date();

    const stats = {
      total: all.length,
      scheduled: all.filter((i) => i.status === 'Scheduled').length,
      completed: all.filter((i) => i.status === 'Completed').length,
      cancelled: all.filter((i) => i.status === 'Cancelled').length,
      upcoming: all.filter(
        (i) => i.status === 'Scheduled' && new Date(i.scheduledDate) > now
      ).length,
      today: all.filter((i) => {
        const d = new Date(i.scheduledDate);
        return (
          i.status === 'Scheduled' &&
          d.toDateString() === now.toDateString()
        );
      }).length,
      thisWeek: all.filter((i) => {
        const d = new Date(i.scheduledDate);
        const diff = (d - now) / (1000 * 60 * 60 * 24);
        return i.status === 'Scheduled' && diff >= 0 && diff <= 7;
      }).length,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get interview stats error:', error);
    res.status(500).json({ error: 'Failed to fetch interview stats' });
  }
};