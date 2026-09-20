// backend/src/controllers/authController.js
const { User, Company } = require('../models');
const { generateToken } = require('../middleware/auth');
const {
  userCreateSchema,
  userUpdateSchema,
  passwordResetSchema,
} = require('../validators');

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [{ model: Company, as: 'company' }],
    });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is disabled. Contact admin.' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    await user.update({ lastLogin: new Date() });

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyId: user.companyId,
        company: user.company
          ? { id: user.company.id, name: user.company.name }
          : null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Company, as: 'company' }],
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      companyId: user.companyId,
      company: user.company
        ? { id: user.company.id, name: user.company.name }
        : null,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────
exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// ─────────────────────────────────────────────
// POST /api/auth/change-password (self)
// ─────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/register (ADMIN ONLY)
// Create a new user
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { error, value } = userCreateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    // Check if email exists
    const existing = await User.findOne({
      where: { email: value.email.toLowerCase() },
    });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // company_hr must have a company
    if (value.role === 'company_hr' && !value.companyId) {
      return res.status(400).json({
        error: 'Company HR must be assigned to a company',
      });
    }

    // Non-company_hr roles cannot have a company
    if (value.role !== 'company_hr' && value.companyId) {
      value.companyId = null;
    }

    // Validate company exists if provided
    if (value.companyId) {
      const company = await Company.findByPk(value.companyId);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
    }

    const user = await User.create({
      email: value.email.toLowerCase(),
      password: value.password,
      fullName: value.fullName,
      role: value.role,
      companyId: value.companyId || null,
      isActive: value.isActive !== false,
    });

    const created = await User.findByPk(user.id, {
      include: [{ model: Company, as: 'company' }],
    });

    console.log(`✅ User created: ${created.email} (${created.role})`);
    res.status(201).json(created);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/users (ADMIN ONLY)
// List all users
// ─────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Company, as: 'company' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/auth/users/:id (ADMIN ONLY)
// Update user details (name, role, company, active)
// ─────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { error, value } = userUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prevent admin from disabling or demoting themselves
    if (req.user.id === user.id) {
      if (value.isActive === false) {
        return res.status(400).json({ error: 'You cannot disable your own account' });
      }
      if (value.role && value.role !== user.role) {
        return res.status(400).json({ error: 'You cannot change your own role' });
      }
    }

    // Enforce company assignment rules
    const newRole = value.role ?? user.role;
    const newCompanyId = value.companyId !== undefined ? value.companyId : user.companyId;

    if (newRole === 'company_hr' && !newCompanyId) {
      return res.status(400).json({
        error: 'Company HR must be assigned to a company',
      });
    }
    if (newRole !== 'company_hr' && newCompanyId) {
      // Non-company roles can't have a company
      value.companyId = null;
    }

    // Validate company exists
    if (value.companyId) {
      const company = await Company.findByPk(value.companyId);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
    }

    await user.update(value);

    const updated = await User.findByPk(user.id, {
      include: [{ model: Company, as: 'company' }],
    });

    console.log(`✅ User updated: ${updated.email}`);
    res.json(updated);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/auth/users/:id (ADMIN ONLY)
// ─────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prevent deleting the last system admin
    if (user.role === 'system_admin') {
      const adminCount = await User.count({ where: { role: 'system_admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({
          error: 'Cannot delete the last system administrator',
        });
      }
    }

    const email = user.email;
    await user.destroy();

    console.log(`🗑️  User deleted: ${email}`);
    res.json({ message: 'User deleted successfully', id: user.id });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/users/:id/reset-password (ADMIN ONLY)
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { error, value } = passwordResetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.password = value.newPassword;
    await user.save();

    console.log(`🔑 Password reset for: ${user.email}`);
    res.json({ message: 'Password reset successfully', id: user.id });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/auth/users/:id/toggle-active (ADMIN ONLY)
// Quick activate/deactivate toggle
// ─────────────────────────────────────────────
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (req.user.id === user.id) {
      return res.status(400).json({ error: 'You cannot disable your own account' });
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      id: user.id,
      isActive: user.isActive,
      message: user.isActive ? 'User activated' : 'User deactivated',
    });
  } catch (error) {
    console.error('Toggle user active error:', error);
    res.status(500).json({ error: 'Failed to toggle user' });
  }
};