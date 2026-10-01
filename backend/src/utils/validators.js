function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Name is required' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return { valid: false, message: 'Name must be between 20 and 60 characters long.' };
  }
  return { valid: true };
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Please provide a valid email address.' };
  }
  return { valid: true };
}

function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return { valid: false, message: 'Address is required' };
  }
  const trimmed = address.trim();
  if (trimmed.length === 0 || trimmed.length > 400) {
    return { valid: false, message: 'Address must be non-empty and max 400 characters long.' };
  }
  return { valid: true };
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8 || password.length > 16) {
    return { valid: false, message: 'Password must be between 8 and 16 characters long.' };
  }
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-\+\=]/.test(password);
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain at least one special character (e.g. !@#$%^&*).' };
  }
  return { valid: true };
}

function validateRating(rating) {
  const num = Number(rating);
  if (isNaN(num) || num < 1 || num > 5 || !Number.isInteger(num)) {
    return { valid: false, message: 'Rating must be an integer between 1 and 5.' };
  }
  return { valid: true };
}

module.exports = {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRating
};
