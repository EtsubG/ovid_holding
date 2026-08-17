export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export type ExperienceLevel = 'Entry Level' | 'Junior' | 'Mid Level' | 'Senior' | 'Lead' | 'Executive';

export type ApplicationStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Reference Check'
  | 'Offer Issued'
  | 'Hired'
  | 'Talent Pool'
  | 'Rejected';

export interface Company {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  industry: string;
  location: string;
  employees: string;
  founded: string;
  accent: string;
  icon: string;
}

export interface Vacancy {
  id: string;
  title: string;
  companyId: string;
  department: string;
  location: string;
  type: EmploymentType;
  experienceLevel: ExperienceLevel;
  experienceYears: string;
  salaryRange: string;
  postedDate: string;
  closingDate: string;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
  documents: string[];
  featured: boolean;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  altPhone?: string;
  city: string;
  nationality: string;
  highestQualification: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
  cgpa: string;
  currentStatus: string;
  currentEmployer?: string;
  currentRole?: string;
  totalExperience: string;
  relevantExperience: string;
  expectedSalary: string;
  availability: string;
  preferredCompany: string;
  preferredDepartment: string;
  vacancyId?: string;
  status: ApplicationStatus;
  submittedAt: string;
  documents: { name: string; type: string; size: string }[];
  notes: { author: string; date: string; text: string }[];
  reference: string;
}

export const companies: Company[] = [
  {
    id: 'ovid-realestate',
    name: 'Ovid Real Estate',
    shortName: 'ORE',
    tagline: 'Premier property development & investment',
    description: 'Ovid Real Estate is the flagship property arm of Ovid Holding, specializing in luxury residential developments, commercial complexes, and strategic land investments across the region.',
    industry: 'Real Estate Development',
    location: 'Dubai, UAE',
    employees: '450+',
    founded: '2009',
    accent: 'from-amber-500/20 to-amber-700/10',
    icon: 'Building2',
  },
  {
    id: 'ovid-hospitality',
    name: 'Ovid Hospitality',
    shortName: 'OHL',
    tagline: 'World-class hotels & resorts',
    description: 'Ovid Hospitality manages a curated portfolio of five-star hotels, boutique resorts, and premium dining experiences, delivering unmatched guest journeys.',
    industry: 'Hospitality & Leisure',
    location: 'Riyadh, KSA',
    employees: '1,200+',
    founded: '2012',
    accent: 'from-rose-500/20 to-rose-700/10',
    icon: 'Hotel',
  },
  {
    id: 'ovid-capital',
    name: 'Ovid Capital',
    shortName: 'OCP',
    tagline: 'Strategic investments & advisory',
    description: 'Ovid Capital provides investment management, corporate advisory, and private equity services, deploying capital across high-growth sectors and emerging markets.',
    industry: 'Financial Services',
    location: 'Abu Dhabi, UAE',
    employees: '180+',
    founded: '2015',
    accent: 'from-emerald-500/20 to-emerald-700/10',
    icon: 'TrendingUp',
  },
  {
    id: 'ovid-construction',
    name: 'Ovid Construction',
    shortName: 'OCL',
    tagline: 'Engineering excellence at scale',
    description: 'Ovid Construction delivers complex civil, infrastructure, and MEP projects with a reputation for precision, safety, and on-time delivery.',
    industry: 'Construction & Engineering',
    location: 'Doha, Qatar',
    employees: '780+',
    founded: '2011',
    accent: 'from-sky-500/20 to-sky-700/10',
    icon: 'HardHat',
  },
  {
    id: 'ovid-tech',
    name: 'Ovid Technologies',
    shortName: 'OTL',
    tagline: 'Digital transformation & proptech',
    description: 'Ovid Technologies builds proprietary platforms and smart-building solutions that power the group\'s operations and redefine the proptech landscape.',
    industry: 'Technology & Software',
    location: 'Cairo, Egypt',
    employees: '220+',
    founded: '2018',
    accent: 'from-violet-500/20 to-violet-700/10',
    icon: 'Cpu',
  },
  {
    id: 'ovid-retail',
    name: 'Ovid Retail Group',
    shortName: 'ORG',
    tagline: 'Curated luxury & lifestyle brands',
    description: 'Ovid Retail Group operates exclusive franchises and owned-brand stores across fashion, beauty, and home living, with a rapidly expanding regional footprint.',
    industry: 'Retail & Franchising',
    location: 'Manama, Bahrain',
    employees: '540+',
    founded: '2014',
    accent: 'from-teal-500/20 to-teal-700/10',
    icon: 'ShoppingBag',
  },
];

export const departments = [
  'Finance & Accounting',
  'Sales & Marketing',
  'Engineering',
  'Operations',
  'Human Resources',
  'Information Technology',
  'Legal & Compliance',
  'Customer Experience',
  'Project Management',
  'Design & Architecture',
  'Procurement',
  'Administration',
];

export const jobCategories = [
  'Engineering',
  'Sales',
  'Marketing',
  'Finance',
  'Operations',
  'Technology',
  'Hospitality',
  'Construction',
  'Design',
  'Administration',
  'Customer Service',
  'Management',
];

export const locations = [
  'Dubai, UAE',
  'Abu Dhabi, UAE',
  'Riyadh, KSA',
  'Jeddah, KSA',
  'Doha, Qatar',
  'Manama, Bahrain',
  'Cairo, Egypt',
  'Amman, Jordan',
  'Kuwait City, Kuwait',
  'Muscat, Oman',
];

export const vacancies: Vacancy[] = [
  {
    id: 'v-001',
    title: 'Senior Property Development Manager',
    companyId: 'ovid-realestate',
    department: 'Project Management',
    location: 'Dubai, UAE',
    type: 'Full-time',
    experienceLevel: 'Senior',
    experienceYears: '8+ years',
    salaryRange: 'AED 28,000 - 38,000 / mo',
    postedDate: '2026-07-28',
    closingDate: '2026-09-15',
    summary: 'Lead high-value residential and mixed-use development projects from concept to handover, managing cross-functional teams and stakeholder relationships.',
    description: 'As a Senior Property Development Manager at Ovid Real Estate, you will own the full lifecycle of flagship developments — from land acquisition analysis and feasibility studies through design, construction oversight, and final delivery. You will collaborate with architects, contractors, sales teams, and government authorities to ensure projects are delivered on budget, on time, and to the quality standards that define the Ovid brand.',
    responsibilities: [
      'Oversee end-to-end development of assigned real estate projects',
      'Conduct feasibility studies, financial modeling, and ROI analysis',
      'Manage relationships with contractors, consultants, and authorities',
      'Lead project planning, scheduling, and risk mitigation',
      'Coordinate with sales and marketing on launch strategies',
      'Ensure compliance with local regulations and Ovid quality standards',
    ],
    requirements: [
      'Bachelor\'s degree in Civil Engineering, Architecture, or Real Estate',
      '8+ years in property development, with 3+ in a leadership role',
      'Proven track record delivering projects valued at AED 100M+',
      'Strong financial acumen and project management certification (PMP preferred)',
      'Deep knowledge of UAE real estate regulations and approval processes',
    ],
    preferred: [
      'MBA or postgraduate qualification in Real Estate',
      'Experience with mixed-use and luxury residential developments',
      'Bilingual: Arabic and English',
    ],
    documents: ['CV / Resume', 'Cover Letter', 'Professional Certificates', 'Portfolio of Past Projects'],
    featured: true,
  },
  {
    id: 'v-002',
    title: 'Hotel General Manager',
    companyId: 'ovid-hospitality',
    department: 'Operations',
    location: 'Riyadh, KSA',
    type: 'Full-time',
    experienceLevel: 'Executive',
    experienceYears: '12+ years',
    salaryRange: 'SAR 45,000 - 60,000 / mo',
    postedDate: '2026-07-20',
    closingDate: '2026-09-01',
    summary: 'Drive the strategic and operational excellence of a flagship five-star property, elevating guest experience and team performance.',
    description: 'The Hotel General Manager will provide visionary leadership for one of Ovid Hospitality\'s flagship properties. You will be responsible for all aspects of hotel operations — guest satisfaction, financial performance, brand standards, talent development, and community engagement — while fostering a culture of warm, anticipatory service.',
    responsibilities: [
      'Lead overall hotel strategy, P&L, and operational performance',
      'Champion guest experience and brand service standards',
      'Develop and mentor department heads and emerging talent',
      'Drive revenue optimization across rooms, F&B, and ancillary services',
      'Maintain compliance with health, safety, and regulatory requirements',
      'Cultivate relationships with VIP guests and key corporate accounts',
    ],
    requirements: [
      'Bachelor\'s degree in Hospitality Management or related field',
      '12+ years in hospitality, with 5+ as GM or EAM in 5-star properties',
      'Demonstrated P&L ownership and revenue growth achievements',
      'Exceptional leadership, communication, and guest-recovery skills',
      'Fluency in English; Arabic strongly preferred',
    ],
    preferred: [
      'MBA or executive leadership program completion',
      'Experience opening or repositioning luxury properties',
    ],
    documents: ['CV / Resume', 'Cover Letter', 'Professional Certificates'],
    featured: true,
  },
  {
    id: 'v-003',
    title: 'Investment Analyst',
    companyId: 'ovid-capital',
    department: 'Finance & Accounting',
    location: 'Abu Dhabi, UAE',
    type: 'Full-time',
    experienceLevel: 'Junior',
    experienceYears: '2-4 years',
    salaryRange: 'AED 12,000 - 18,000 / mo',
    postedDate: '2026-08-01',
    closingDate: '2026-09-20',
    summary: 'Support deal teams with financial analysis, market research, and investment memo preparation across diverse asset classes.',
    description: 'As an Investment Analyst at Ovid Capital, you will work closely with senior investment professionals to evaluate opportunities across private equity, real estate, and credit. You will build financial models, conduct industry research, and contribute to investment committee materials, gaining broad exposure to the group\'s investment activities.',
    responsibilities: [
      'Build and maintain detailed financial models for investment opportunities',
      'Conduct market, industry, and competitor research',
      'Prepare investment memos and presentation materials',
      'Support due diligence processes alongside deal teams',
      'Monitor portfolio performance and prepare reporting',
    ],
    requirements: [
      'Bachelor\'s degree in Finance, Economics, or related discipline',
      '2-4 years in investment banking, PE, or equity research',
      'Strong financial modeling and valuation skills',
      'CFA Level I or commitment to pursue CFA',
      'Excellent written and verbal communication',
    ],
    preferred: [
      'Experience in MENA markets',
      'Proficiency in Bloomberg and similar data platforms',
    ],
    documents: ['CV / Resume', 'Cover Letter', 'Academic Transcripts'],
    featured: true,
  },
  {
    id: 'v-004',
    title: 'Senior Civil Engineer',
    companyId: 'ovid-construction',
    department: 'Engineering',
    location: 'Doha, Qatar',
    type: 'Full-time',
    experienceLevel: 'Senior',
    experienceYears: '7+ years',
    salaryRange: 'QAR 22,000 - 30,000 / mo',
    postedDate: '2026-07-15',
    closingDate: '2026-08-30',
    summary: 'Oversee structural design coordination and on-site execution for large-scale infrastructure projects.',
    description: 'The Senior Civil Engineer will play a critical role in delivering major infrastructure projects, coordinating between design consultants and site teams, ensuring structural integrity, quality, and compliance with international standards.',
    responsibilities: [
      'Review and approve structural drawings and method statements',
      'Supervise site activities and ensure QA/QC compliance',
      'Coordinate with consultants, subcontractors, and client representatives',
      'Manage project documentation and reporting',
      'Identify and resolve technical issues during construction',
    ],
    requirements: [
      'Bachelor\'s degree in Civil Engineering',
      '7+ years in construction, with infrastructure experience',
      'Proficient in AutoCAD, Primavera, and structural analysis software',
      'Qatar Engineering Committee registration or eligibility',
    ],
    preferred: [
      'Master\'s degree in Structural Engineering',
      'Experience with metro or highway projects',
    ],
    documents: ['CV / Resume', 'Professional Certificates', 'Experience Letters'],
    featured: false,
  },
  {
    id: 'v-005',
    title: 'Full-Stack Software Engineer',
    companyId: 'ovid-tech',
    department: 'Information Technology',
    location: 'Cairo, Egypt',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    experienceYears: '4-6 years',
    salaryRange: 'EGP 45,000 - 65,000 / mo',
    postedDate: '2026-08-05',
    closingDate: '2026-09-25',
    summary: 'Build and scale proptech platforms serving the entire Ovid group, from property management to smart-building IoT integrations.',
    description: 'Join Ovid Technologies to architect and build end-to-end platforms that power real estate, hospitality, and retail operations across the group. You will work across the stack — from robust backend services to polished, responsive frontends — in a collaborative, product-focused team.',
    responsibilities: [
      'Design, develop, and maintain web applications using React and Node.js',
      'Build scalable APIs and microservices',
      'Collaborate with product and design on feature development',
      'Implement CI/CD pipelines and automated testing',
      'Optimize applications for performance and scalability',
    ],
    requirements: [
      'Bachelor\'s degree in Computer Science or equivalent',
      '4-6 years of full-stack development experience',
      'Strong proficiency in React, TypeScript, and Node.js',
      'Experience with PostgreSQL and cloud platforms (AWS/GCP)',
    ],
    preferred: [
      'Experience with IoT or smart-building systems',
      'Familiarity with microservices and event-driven architecture',
    ],
    documents: ['CV / Resume', 'Portfolio / GitHub Link'],
    featured: true,
  },
  {
    id: 'v-006',
    title: 'Retail Operations Manager',
    companyId: 'ovid-retail',
    department: 'Operations',
    location: 'Manama, Bahrain',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    experienceYears: '5-7 years',
    salaryRange: 'BHD 2,200 - 3,000 / mo',
    postedDate: '2026-07-22',
    closingDate: '2026-09-10',
    summary: 'Oversee multi-store retail operations, driving sales performance, visual merchandising, and customer experience.',
    description: 'The Retail Operations Manager will be responsible for the performance of a portfolio of stores across Bahrain, ensuring consistent brand execution, sales growth, and exceptional customer service.',
    responsibilities: [
      'Manage day-to-day operations across assigned stores',
      'Drive sales targets and KPI achievement',
      'Ensure visual merchandising and brand standards compliance',
      'Recruit, train, and develop store teams',
      'Analyze performance data and implement improvement plans',
    ],
    requirements: [
      'Bachelor\'s degree in Business or related field',
      '5-7 years in retail, with 2+ in multi-store management',
      'Strong analytical and people leadership skills',
      'Willingness to travel across store locations',
    ],
    preferred: [
      'Experience with luxury or fashion retail',
      'Arabic language proficiency',
    ],
    documents: ['CV / Resume', 'Cover Letter'],
    featured: false,
  },
  {
    id: 'v-007',
    title: 'Marketing & Brand Manager',
    companyId: 'ovid-realestate',
    department: 'Sales & Marketing',
    location: 'Dubai, UAE',
    type: 'Full-time',
    experienceLevel: 'Senior',
    experienceYears: '6+ years',
    salaryRange: 'AED 20,000 - 27,000 / mo',
    postedDate: '2026-07-30',
    closingDate: '2026-09-18',
    summary: 'Shape the Ovid Real Estate brand and drive demand through integrated marketing campaigns and digital innovation.',
    description: 'Lead the marketing function for Ovid Real Estate, developing brand strategy, campaign execution, and digital presence. You will work closely with sales, development, and external agencies to build a distinctive premium brand.',
    responsibilities: [
      'Develop and execute annual marketing and brand strategies',
      'Manage digital marketing, content, and social media presence',
      'Oversee campaign creative and agency relationships',
      'Support sales with lead generation and CRM initiatives',
      'Track and report on marketing ROI and KPIs',
    ],
    requirements: [
      'Bachelor\'s degree in Marketing or related field',
      '6+ years in marketing, with real estate or luxury brand experience',
      'Strong digital marketing and campaign management skills',
      'Excellent storytelling and presentation abilities',
    ],
    preferred: [
      'Experience with premium or luxury real estate brands',
      'Arabic language skills',
    ],
    documents: ['CV / Resume', 'Cover Letter', 'Portfolio of Campaigns'],
    featured: false,
  },
  {
    id: 'v-008',
    title: 'Guest Experience Supervisor',
    companyId: 'ovid-hospitality',
    department: 'Customer Experience',
    location: 'Riyadh, KSA',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    experienceYears: '3-5 years',
    salaryRange: 'SAR 9,000 - 13,000 / mo',
    postedDate: '2026-08-02',
    closingDate: '2026-09-12',
    summary: 'Elevate every guest touchpoint, from arrival to departure, leading a team of experience ambassadors.',
    description: 'The Guest Experience Supervisor ensures that every guest interaction reflects the warmth and excellence of Ovid Hospitality. You will lead the front office and guest relations team, handle escalations, and continuously refine service procedures.',
    responsibilities: [
      'Supervise front office and guest relations daily operations',
      'Handle guest feedback, complaints, and service recovery',
      'Train and coach guest experience team members',
      'Collaborate with housekeeping and F&B on seamless service',
      'Monitor guest satisfaction scores and drive improvements',
    ],
    requirements: [
      'Diploma or Bachelor\'s in Hospitality or related field',
      '3-5 years in luxury hotel front office or guest relations',
      'Exceptional interpersonal and problem-solving skills',
      'Fluency in English; Arabic preferred',
    ],
    preferred: [
      'Experience with opera or similar PMS systems',
    ],
    documents: ['CV / Resume', 'Cover Letter'],
    featured: false,
  },
];

export const candidates: Candidate[] = [
  {
    id: 'c-001',
    fullName: 'Layla Al-Mansoori',
    email: 'layla.mansoori@email.com',
    phone: '+971 50 234 5678',
    altPhone: '+971 55 890 1234',
    city: 'Dubai, UAE',
    nationality: 'Emirati',
    highestQualification: "Master's Degree",
    fieldOfStudy: 'Real Estate Development',
    institution: 'American University of Sharjah',
    graduationYear: '2019',
    cgpa: '3.8 / 4.0',
    currentStatus: 'Employed',
    currentEmployer: 'Emaar Properties',
    currentRole: 'Development Manager',
    totalExperience: '9 years',
    relevantExperience: '7 years',
    expectedSalary: 'AED 32,000 / mo',
    availability: '1 month notice',
    preferredCompany: 'ovid-realestate',
    preferredDepartment: 'Project Management',
    vacancyId: 'v-001',
    status: 'Shortlisted',
    submittedAt: '2026-08-10T09:30:00Z',
    documents: [
      { name: 'Layla_Almansoori_CV.pdf', type: 'PDF', size: '284 KB' },
      { name: 'Cover_Letter.pdf', type: 'PDF', size: '112 KB' },
      { name: 'PMP_Certificate.pdf', type: 'PDF', size: '198 KB' },
    ],
    notes: [
      { author: 'Sara K.', date: '2026-08-11', text: 'Strong profile — 9 years at Emaar, directly relevant. Schedule technical interview.' },
    ],
    reference: 'OVID-2026-8942',
  },
  {
    id: 'c-002',
    fullName: 'James Okoro',
    email: 'j.okoro@email.com',
    phone: '+974 66 123 456',
    city: 'Doha, Qatar',
    nationality: 'Nigerian',
    highestQualification: "Bachelor's Degree",
    fieldOfStudy: 'Civil Engineering',
    institution: 'University of Lagos',
    graduationYear: '2014',
    cgpa: '3.6 / 4.0',
    currentStatus: 'Employed',
    currentEmployer: 'Arabtec Construction',
    currentRole: 'Project Engineer',
    totalExperience: '11 years',
    relevantExperience: '8 years',
    expectedSalary: 'QAR 26,000 / mo',
    availability: '2 months notice',
    preferredCompany: 'ovid-construction',
    preferredDepartment: 'Engineering',
    vacancyId: 'v-004',
    status: 'Interview Scheduled',
    submittedAt: '2026-08-08T14:15:00Z',
    documents: [
      { name: 'James_Okoro_CV.pdf', type: 'PDF', size: '312 KB' },
      { name: 'Experience_Letters.zip', type: 'ZIP', size: '1.2 MB' },
    ],
    notes: [
      { author: 'Omar F.', date: '2026-08-09', text: 'Solid infrastructure background. Technical interview scheduled for Aug 20.' },
    ],
    reference: 'OVID-2026-8917',
  },
  {
    id: 'c-003',
    fullName: 'Fatima Hassan',
    email: 'fatima.h@email.com',
    phone: '+966 55 678 9012',
    city: 'Riyadh, KSA',
    nationality: 'Saudi',
    highestQualification: "Master's Degree",
    fieldOfStudy: 'Hospitality Management',
    institution: 'École hôtelière de Lausanne',
    graduationYear: '2012',
    cgpa: '3.9 / 4.0',
    currentStatus: 'Employed',
    currentEmployer: 'Four Seasons Hotels',
    currentRole: 'Director of Operations',
    totalExperience: '14 years',
    relevantExperience: '12 years',
    expectedSalary: 'SAR 52,000 / mo',
    availability: '3 months notice',
    preferredCompany: 'ovid-hospitality',
    preferredDepartment: 'Operations',
    vacancyId: 'v-002',
    status: 'Under Review',
    submittedAt: '2026-08-12T11:00:00Z',
    documents: [
      { name: 'Fatima_Hassan_CV.pdf', type: 'PDF', size: '256 KB' },
      { name: 'Cover_Letter.pdf', type: 'PDF', size: '98 KB' },
      { name: 'EHL_Diploma.pdf', type: 'PDF', size: '342 KB' },
    ],
    notes: [],
    reference: 'OVID-2026-8956',
  },
  {
    id: 'c-004',
    fullName: 'Daniel Chen',
    email: 'd.chen@email.com',
    phone: '+20 100 456 7890',
    city: 'Cairo, Egypt',
    nationality: 'Chinese',
    highestQualification: "Bachelor's Degree",
    fieldOfStudy: 'Computer Science',
    institution: 'University of Waterloo',
    graduationYear: '2018',
    cgpa: '3.7 / 4.0',
    currentStatus: 'Employed',
    currentEmployer: 'Microsoft',
    currentRole: 'Senior Software Engineer',
    totalExperience: '6 years',
    relevantExperience: '5 years',
    expectedSalary: 'EGP 58,000 / mo',
    availability: '1 month notice',
    preferredCompany: 'ovid-tech',
    preferredDepartment: 'Information Technology',
    vacancyId: 'v-005',
    status: 'Submitted',
    submittedAt: '2026-08-14T16:45:00Z',
    documents: [
      { name: 'Daniel_Chen_CV.pdf', type: 'PDF', size: '198 KB' },
      { name: 'github_portfolio.pdf', type: 'PDF', size: '520 KB' },
    ],
    notes: [],
    reference: 'OVID-2026-8971',
  },
  {
    id: 'c-005',
    fullName: 'Aisha Abdullah',
    email: 'aisha.abdullah@email.com',
    phone: '+971 52 345 6789',
    city: 'Abu Dhabi, UAE',
    nationality: 'Emirati',
    highestQualification: "Bachelor's Degree",
    fieldOfStudy: 'Finance',
    institution: 'NYU Abu Dhabi',
    graduationYear: '2022',
    cgpa: '3.8 / 4.0',
    currentStatus: 'Employed',
    currentEmployer: 'Goldman Sachs',
    currentRole: 'Analyst',
    totalExperience: '3 years',
    relevantExperience: '3 years',
    expectedSalary: 'AED 16,000 / mo',
    availability: 'Immediate',
    preferredCompany: 'ovid-capital',
    preferredDepartment: 'Finance & Accounting',
    vacancyId: 'v-003',
    status: 'Submitted',
    submittedAt: '2026-08-15T08:20:00Z',
    documents: [
      { name: 'Aisha_Abdullah_CV.pdf', type: 'PDF', size: '220 KB' },
      { name: 'Cover_Letter.pdf', type: 'PDF', size: '105 KB' },
      { name: 'Transcripts.pdf', type: 'PDF', size: '410 KB' },
    ],
    notes: [],
    reference: 'OVID-2026-8983',
  },
  {
    id: 'c-006',
    fullName: 'Marco Rossi',
    email: 'marco.rossi@email.com',
    phone: '+973 36 456 789',
    city: 'Manama, Bahrain',
    nationality: 'Italian',
    highestQualification: "Bachelor's Degree",
    fieldOfStudy: 'Business Administration',
    institution: 'Bocconi University',
    graduationYear: '2016',
    cgpa: '3.5 / 4.0',
    currentStatus: 'Employed',
    currentEmployer: 'Max Mara',
    currentRole: 'Store Manager',
    totalExperience: '7 years',
    relevantExperience: '6 years',
    expectedSalary: 'BHD 2,700 / mo',
    availability: '1 month notice',
    preferredCompany: 'ovid-retail',
    preferredDepartment: 'Operations',
    vacancyId: 'v-006',
    status: 'Rejected',
    submittedAt: '2026-08-06T10:30:00Z',
    documents: [
      { name: 'Marco_Rossi_CV.pdf', type: 'PDF', size: '187 KB' },
      { name: 'Cover_Letter.pdf', type: 'PDF', size: '88 KB' },
    ],
    notes: [
      { author: 'Huda M.', date: '2026-08-07', text: 'Good retail background but lacks multi-store management experience required for this role.' },
    ],
    reference: 'OVID-2026-8901',
  },
  {
    id: 'c-007',
    fullName: 'Yusuf Khan',
    email: 'yusuf.khan@email.com',
    phone: '+971 50 567 8901',
    altPhone: '+971 54 234 5678',
    city: 'Dubai, UAE',
    nationality: 'Pakistani',
    highestQualification: "Master's Degree",
    fieldOfStudy: 'Marketing',
    institution: 'London Business School',
    graduationYear: '2017',
    cgpa: '3.7 / 4.0',
    currentStatus: 'Employed',
    currentEmployer: 'Damac Properties',
    currentRole: 'Senior Brand Manager',
    totalExperience: '8 years',
    relevantExperience: '7 years',
    expectedSalary: 'AED 24,000 / mo',
    availability: '2 months notice',
    preferredCompany: 'ovid-realestate',
    preferredDepartment: 'Sales & Marketing',
    vacancyId: 'v-007',
    status: 'Reference Check',
    submittedAt: '2026-08-03T13:20:00Z',
    documents: [
      { name: 'Yusuf_Khan_CV.pdf', type: 'PDF', size: '295 KB' },
      { name: 'Campaign_Portfolio.pdf', type: 'PDF', size: '1.8 MB' },
    ],
    notes: [
      { author: 'Sara K.', date: '2026-08-05', text: 'Excellent campaign portfolio. Moved to interview stage.' },
      { author: 'Sara K.', date: '2026-08-13', text: 'Great interviews. Initiating reference checks.' },
    ],
    reference: 'OVID-2026-8884',
  },
  {
    id: 'c-008',
    fullName: 'Sofia Garcia',
    email: 'sofia.garcia@email.com',
    phone: '+966 56 789 0123',
    city: 'Riyadh, KSA',
    nationality: 'Spanish',
    highestQualification: "Bachelor's Degree",
    fieldOfStudy: 'Tourism & Hospitality',
    institution: 'University of Las Palmas',
    graduationYear: '2019',
    cgpa: '3.6 / 4.0',
    currentStatus: 'Employed',
    currentEmployer: 'Ritz-Carlton Riyadh',
    currentRole: 'Guest Relations Manager',
    totalExperience: '5 years',
    relevantExperience: '4 years',
    expectedSalary: 'SAR 11,500 / mo',
    availability: '1 month notice',
    preferredCompany: 'ovid-hospitality',
    preferredDepartment: 'Customer Experience',
    vacancyId: 'v-008',
    status: 'Offer Issued',
    submittedAt: '2026-07-28T09:00:00Z',
    documents: [
      { name: 'Sofia_Garcia_CV.pdf', type: 'PDF', size: '210 KB' },
      { name: 'Cover_Letter.pdf', type: 'PDF', size: '95 KB' },
    ],
    notes: [
      { author: 'Omar F.', date: '2026-08-01', text: 'Perfect fit for guest experience role. Strong references.' },
      { author: 'Omar F.', date: '2026-08-12', text: 'Offer extended. Awaiting candidate response.' },
    ],
    reference: 'OVID-2026-8850',
  },
  {
    id: 'c-009',
    fullName: 'Omar Al-Farsi',
    email: 'omar.alfarsi@email.com',
    phone: '+968 99 012 345',
    city: 'Muscat, Oman',
    nationality: 'Omani',
    highestQualification: "Bachelor's Degree",
    fieldOfStudy: 'Architecture',
    institution: 'Sultan Qaboos University',
    graduationYear: '2020',
    cgpa: '3.5 / 4.0',
    currentStatus: 'Unemployed',
    totalExperience: '4 years',
    relevantExperience: '3 years',
    expectedSalary: 'AED 15,000 / mo',
    availability: 'Immediate',
    preferredCompany: 'ovid-realestate',
    preferredDepartment: 'Design & Architecture',
    status: 'Talent Pool',
    submittedAt: '2026-07-20T10:15:00Z',
    documents: [
      { name: 'Omar_AlFarsi_CV.pdf', type: 'PDF', size: '340 KB' },
    ],
    notes: [
      { author: 'Sara K.', date: '2026-07-22', text: 'No matching vacancy currently. Added to talent pool for future design roles.' },
    ],
    reference: 'OVID-2026-8799',
  },
  {
    id: 'c-010',
    fullName: 'Priya Nair',
    email: 'priya.nair@email.com',
    phone: '+971 54 678 9012',
    city: 'Dubai, UAE',
    nationality: 'Indian',
    highestQualification: "Master's Degree",
    fieldOfStudy: 'Data Science',
    institution: 'IIT Bombay',
    graduationYear: '2021',
    cgpa: '3.9 / 4.0',
    currentStatus: 'Employed',
    currentEmployer: 'Noon.com',
    currentRole: 'Data Scientist',
    totalExperience: '5 years',
    relevantExperience: '4 years',
    expectedSalary: 'EGP 62,000 / mo',
    availability: '1 month notice',
    preferredCompany: 'ovid-tech',
    preferredDepartment: 'Information Technology',
    status: 'Talent Pool',
    submittedAt: '2026-07-18T15:40:00Z',
    documents: [
      { name: 'Priya_Nair_CV.pdf', type: 'PDF', size: '260 KB' },
      { name: 'Project_Showcase.pdf', type: 'PDF', size: '890 KB' },
    ],
    notes: [
      { author: 'Omar F.', date: '2026-07-19', text: 'Impressive data science background. Kept in talent pool — no current data role open.' },
    ],
    reference: 'OVID-2026-8772',
  },
];

export const pipelineStages: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: 'Submitted', label: 'Submitted / Received', color: 'bg-slate-500' },
  { key: 'Under Review', label: 'Under Review', color: 'bg-blue-500' },
  { key: 'Shortlisted', label: 'Shortlisted', color: 'bg-cyan-500' },
  { key: 'Interview Scheduled', label: 'Interview Scheduled', color: 'bg-violet-500' },
  { key: 'Reference Check', label: 'Reference Check', color: 'bg-amber-500' },
  { key: 'Offer Issued', label: 'Offer Issued / Hired', color: 'bg-emerald-500' },
  { key: 'Talent Pool', label: 'Kept in Talent Pool', color: 'bg-teal-500' },
  { key: 'Rejected', label: 'Rejected / Withdrawn', color: 'bg-rose-500' },
];

export function generateReference(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `OVID-${year}-${num}`;
}

export function getCompany(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getVacancy(id: string): Vacancy | undefined {
  return vacancies.find((v) => v.id === id);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
