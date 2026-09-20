// backend/src/config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '../../uploads');
const resumesDir = path.join(uploadDir, 'resumes');
const documentsDir = path.join(uploadDir, 'documents');

[uploadDir, resumesDir, documentsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'cv' ? resumesDir : documentsDir;
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'application/zip',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type'), false);
};

// backend/src/config/multer.js
module.exports = multer({
  storage,
  limits: { 
    fileSize: 25 * 1024 * 1024,  // ← Changed from 10MB to 25MB
    files: 11,                    // ← Max 11 files total (1 CV + 10 docs)
  },
  fileFilter,
});