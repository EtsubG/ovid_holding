// backend/src/seeders/seed-admin.js
const { sequelize, User } = require('../models');

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const existing = await User.findOne({ where: { email: 'admin@ovidholding.com' } });
    if (existing) {
      console.log('ℹ️  Admin user already exists:', existing.email);
      console.log('   Use that email to log in.');
      process.exit(0);
    }

    const admin = await User.create({
      email: 'admin@ovidholding.com',
      password: 'Admin@12345',
      fullName: 'System Administrator',
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin user created:');
    console.log('   Email:    admin@ovidholding.com');
    console.log('   Password: Admin@12345');
    console.log('   ⚠️  Change this password after first login!');

    // Optional: create a demo HR user
    const hrEmail = 'hr@ovidholding.com';
    const existingHr = await User.findOne({ where: { email: hrEmail } });
    if (!existingHr) {
      await User.create({
        email: hrEmail,
        password: 'Hr@12345',
        fullName: 'Holding HR Manager',
        role: 'holding_hr',
        isActive: true,
      });
      console.log('✅ HR user created:');
      console.log('   Email:    hr@ovidholding.com');
      console.log('   Password: Hr@12345');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedAdmin();