import { storageService } from './storageService';
import { auditService } from './auditService';
import { uid } from '../utils/helpers';
import { validateUserData, validatePassword, isValidEmail, isEmailTaken } from '../utils/validation';
import { hashPassword, verifyPassword } from '../utils/crypto';

export const authService = {
  getCurrentUser() {
    return storageService.getCurrentUser();
  },

  async login(email, password) {
    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    const users = storageService.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // Verify password cryptographically with PBKDF2 or legacy plain fallback
    const { valid, needsUpgrade } = await verifyPassword(password, user.password);

    if (!valid) {
      throw new Error('Invalid email or password.');
    }

    // Transparently upgrade legacy plain-text password to PBKDF2
    if (needsUpgrade) {
      try {
        const secureHash = await hashPassword(password);
        user.password = secureHash;
        storageService.saveUsers(users);
      } catch (err) {
        console.warn('[authService] Could not upgrade legacy password hash:', err);
      }
    }

    // Session user safe copy
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'active',
      createdAt: user.createdAt || Date.now()
    };

    storageService.setCurrentUser(sessionUser);
    auditService.log('login', { email: sessionUser.email }, sessionUser);
    return sessionUser;
  },

  async signup({ name, email, password, confirmPassword, role = 'voter' }) {
    const users = storageService.getUsers();
    const validation = validateUserData({ name, email, password, confirmPassword, role }, users);

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      id: uid('u'),
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'voter',
      status: 'active',
      createdAt: Date.now()
    };

    const updatedUsers = [...users, newUser];
    storageService.saveUsers(updatedUsers);

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt
    };

    storageService.setCurrentUser(sessionUser);
    auditService.log('signup', { email: newUser.email, role: newUser.role }, sessionUser);
    return sessionUser;
  },

  async createDemoAccount(role = 'admin') {
    const users = storageService.getUsers();
    const isRoleAdmin = role === 'admin';
    const email = isRoleAdmin ? 'admin@example.com' : 'voter@example.com';
    const name = isRoleAdmin ? 'Administrator' : 'Sample Voter';
    const rawPassword = isRoleAdmin ? 'admin' : 'voter';

    let demoUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!demoUser) {
      const hashedPassword = await hashPassword(rawPassword);
      demoUser = {
        id: uid('u'),
        name,
        email,
        password: hashedPassword,
        role: isRoleAdmin ? 'admin' : 'voter',
        status: 'active',
        createdAt: Date.now()
      };
      storageService.saveUsers([...users, demoUser]);
    } else {
      demoUser.role = isRoleAdmin ? 'admin' : 'voter';
    }

    const sessionUser = {
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      role: demoUser.role,
      status: demoUser.status || 'active',
      createdAt: demoUser.createdAt || Date.now()
    };

    storageService.setCurrentUser(sessionUser);
    auditService.log('create_account', { role: sessionUser.role, email: sessionUser.email }, sessionUser);
    return sessionUser;
  },

  async changePassword({ userId, currentPassword, newPassword, confirmPassword, isAdminBypass = false, actorUser = null }) {
    const users = storageService.getUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      throw new Error('User not found.');
    }

    // If not bypassed by an admin, verify current password
    if (!isAdminBypass) {
      if (!currentPassword) {
        throw new Error('Please enter your current password.');
      }
      const { valid } = await verifyPassword(currentPassword, user.password);
      if (!valid) {
        throw new Error('Current password is incorrect.');
      }
    }

    // Validate new password
    const pwCheck = validatePassword(newPassword, confirmPassword);
    if (!pwCheck.isValid) {
      const firstError = Object.values(pwCheck.errors)[0];
      throw new Error(firstError);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    storageService.saveUsers(users);

    const activeUser = actorUser || storageService.getCurrentUser();
    auditService.log(
      'change_password',
      { targetUserId: userId, targetEmail: user.email, adminBypass: isAdminBypass },
      activeUser
    );

    return true;
  },

  updateProfile(userId, { name, email }, actorUser = null) {
    if (!name || !name.trim()) {
      throw new Error('Name cannot be empty.');
    }
    if (!email || !email.trim() || !isValidEmail(email)) {
      throw new Error('Please enter a valid email address.');
    }

    const users = storageService.getUsers();
    if (isEmailTaken(email, users, userId)) {
      throw new Error('This email address is already registered to another account.');
    }

    let updatedSession = null;
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        const modified = { ...u, name: name.trim(), email: email.trim() };
        return modified;
      }
      return u;
    });

    storageService.saveUsers(updatedUsers);

    // If updating current user's session, sync
    const current = storageService.getCurrentUser();
    if (current && current.id === userId) {
      updatedSession = { ...current, name: name.trim(), email: email.trim() };
      storageService.setCurrentUser(updatedSession);
    }

    const activeUser = actorUser || current;
    auditService.log('update_profile', { userId, name, email }, activeUser);
    return updatedSession;
  },

  logout() {
    const currentUser = storageService.getCurrentUser();
    if (currentUser) {
      auditService.log('logout', { email: currentUser.email }, currentUser);
    }
    storageService.setCurrentUser(null);
  }
};
