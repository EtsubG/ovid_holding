// backend/src/controllers/authController.js
const { User, Company } = require('../models');
const { generateToken } = require('../middleware/auth');

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

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is disabled. Contact admin.' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
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
  // JWT is stateless — just tell the client to delete the token
  res.json({ message: 'Logged out successfully' });
};

// ─────────────────────────────────────────────
// POST /api/auth/change-password
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
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
// POST /api/auth/register  (ADMIN ONLY)
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { email, password, fullName, role, companyId } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // In register function, replace the validRoles array:
const validRoles = ['system_admin', 'holding_hr', 'company_hr', 'management'];

// Validation: company_hr must have a company
if (role === 'company_hr' && !companyId) {
  return res.status(400).json({
    error: 'Company HR must be assigned to a company',
  });
}

// Only system_admin can create users
// (Already handled by route middleware, but let's be explicit)
if (req.user && req.user.role !== 'system_admin') {
  return res.status(403).json({ error: 'Only system admins can create users' });
}

    const existing = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      fullName,
      role,
      companyId: companyId || null,
    });

    const created = await User.findByPk(user.id, {
      include: [{ model: Company, as: 'company' }],
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/users  (ADMIN ONLY)
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
// PATCH /api/auth/users/:id  (ADMIN ONLY)
// ─────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, role, companyId, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from disabling themselves
    if (req.user.id === id && isActive === false) {
      return res.status(400).json({ error: 'You cannot disable your own account' });
    }

    await user.update({
      fullName: fullName ?? user.fullName,
      role: role ?? user.role,
      companyId: companyId !== undefined ? companyId : user.companyId,
      isActive: isActive !== undefined ? isActive : user.isActive,
    });

    const updated = await User.findByPk(id, {
      include: [{ model: Company, as: 'company' }],
    });

    res.json(updated);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/auth/users/:id  (ADMIN ONLY)
// ─────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/users/:id/reset-password  (ADMIN ONLY)
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};