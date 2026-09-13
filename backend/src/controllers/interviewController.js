const { Interview, Candidate } = require('../models');

exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.findAll({
      include: [{
        model: Candidate,
        as: 'candidate'
      }],
      order: [['scheduledDate', 'ASC']]
    });
    res.json(interviews);
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

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
      notes: interviewNotes // Renamed to avoid shadowing/conflict with candidate notes
    } = req.body;
    
    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    const interview = await Interview.create({
      candidateId,
      title,
      type,
      scheduledDate,
      duration,
      location,
      meetingLink,
      interviewerName,
      interviewerEmail,
      notes: interviewNotes,
      status: 'Scheduled'
    });
    
    // Update candidate status
    await candidate.update({ status: 'Interview Scheduled' });
    
    // Add note to candidate (handling safe fallback if notes is null/undefined)
    const candidateNotes = [
      ...(candidate.notes || []),
      {
        author: 'HR Team',
        date: new Date().toISOString().split('T')[0],
        text: `Interview scheduled: ${title} on ${new Date(scheduledDate).toLocaleDateString()}`
      }
    ];
    await candidate.update({ notes: candidateNotes });
    
    res.status(201).json(interview);
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ error: 'Failed to create interview' });
  }
};

exports.updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, notes, scheduledDate } = req.body;
    
    const interview = await Interview.findByPk(id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    await interview.update({ status, feedback, notes, scheduledDate });
    res.json(interview);
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ error: 'Failed to update interview' });
  }
};

exports.getCandidateInterviews = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const interviews = await Interview.findAll({
      where: { candidateId },
      order: [['scheduledDate', 'ASC']]
    });
    res.json(interviews);
  } catch (error) {
    console.error('Get candidate interviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};