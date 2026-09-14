// backend/src/seeders/seed-admin.js
const { sequelize, User, Company } = require('../models');

const seedUsers = [
  {
    email: 'admin@ovidholding.com',
    password: 'Admin@12345',
    fullName: 'System Administrator',
    role: 'system_admin',
    companyId: null,
  },
  {
    email: 'hr@ovidholding.com',
    password: 'Hr@12345',
    fullName: 'Holding HR Manager',
    role: 'holding_hr',
    companyId: null,
  },
  {
    email: 'hr.realestate@ovidholding.com',
    password: 'Hr@12345',
    fullName: 'Real Estate HR',
    role: 'company_hr',
    companyId: 'ovid-realestate',
  },
  {
    email: 'hr.tech@ovidholding.com',
    password: 'Hr@12345',
    fullName: 'Tech HR',
    role: 'company_hr',
    companyId: 'ovid-tech',
  },
  {
    email: 'hr.construction@ovidholding.com',
    password: 'Hr@12345',
    fullName: 'Construction HR',
    role: 'company_hr',
    companyId: 'ovid-construction',
  },
  {
    email: 'management@ovidholding.com',
    password: 'Mgmt@12345',
    fullName: 'Executive Viewer',
    role: 'management',
    companyId: null,
  },
];

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.\n');

    // Verify companies exist first
    const companyCount = await Company.count();
    if (companyCount === 0) {
      console.error('❌ No companies found! Run `npm run seed` first.');
      process.exit(1);
    }
    console.log(`ℹ️  Found ${companyCount} companies.\n`);

    for (const data of seedUsers) {
      // Validate companyId exists
      if (data.companyId) {
        const company = await Company.findByPk(data.companyId);
        if (!company) {
          console.warn(`⚠️  Skipping ${data.email}: company "${data.companyId}" not found`);
          continue;
        }
      }

      const existing = await User.findOne({ where: { email: data.email } });

      if (existing) {
        // Update role + company + password to match seeder
        existing.password = data.password; // will be re-hashed in beforeUpdate
        existing.fullName = data.fullName;
        existing.role = data.role;
        existing.companyId = data.companyId;
        existing.isActive = true;
        await existing.save();
        console.log(`🔄 Updated:  ${data.email}  (${data.role})`);
      } else {
        await User.create({
          ...data,
          isActive: true,
        });
        console.log(`✅ Created:  ${data.email}  (${data.role})`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📋 LOGIN CREDENTIALS');
    console.log('═'.repeat(60));
    console.log('🛡️  System Admin     admin@ovidholding.com               / Admin@12345');
    console.log('🏢 Holding HR        hr@ovidholding.com                  / Hr@12345');
    console.log('🏗️  Company HR (RE)  hr.realestate@ovidholding.com       / Hr@12345');
    console.log('💻 Company HR (Tech) hr.tech@ovidholding.com             / Hr@12345');
    console.log('🔨 Company HR (Cons) hr.construction@ovidholding.com     / Hr@12345');
    console.log('👔 Management        management@ovidholding.com          / Mgmt@12345');
    console.log('═'.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedAdmin();