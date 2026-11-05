/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

/**
 * Check if email is already taken
 */
export const isEmailTaken = (email, existingUsers, currentUserId = null) => {
  if (!email || !existingUsers) return false;
  const normalized = email.trim().toLowerCase();
  return existingUsers.some(
    (u) => u.email.toLowerCase() === normalized && u.id !== currentUserId
  );
};

/**
 * Validate password requirements and confirmation match
 */
export const validatePassword = (password, confirmPassword = undefined) => {
  const errors = {};

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  if (confirmPassword !== undefined) {
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user registration/creation data
 */
export const validateUserData = (
  { name, email, password, confirmPassword, role },
  existingUsers,
  currentUserId = null
) => {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Full name is required.';
  }

  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  } else if (isEmailTaken(email, existingUsers, currentUserId)) {
    errors.email = 'This email address is already registered.';
  }

  if (password !== undefined) {
    const pwCheck = validatePassword(password, confirmPassword);
    if (!pwCheck.isValid) {
      Object.assign(errors, pwCheck.errors);
    }
  }

  if (role && !['admin', 'voter'].includes(role)) {
    errors.role = 'Role must be either admin or voter.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate election creation data
 */
export const validateElectionData = ({ title }) => {
  const errors = {};

  if (!title || !title.trim()) {
    errors.title = 'Election title is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
