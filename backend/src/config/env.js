const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env or root .env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';

const INSECURE_PLACEHOLDERS = new Set([
  'temporary_dev_secret_change_in_production',
  'your_jwt_secret_key_here_min_32_characters',
  'your_strong_jwt_secret_key_min_32_chars_placeholder',
  'your_jwt_secret_min_32_characters_placeholder_change_me',
  'your_jwt_secret_here',
  'changeme',
  'secret',
  'password',
]);

function isPlaceholderOrPredictable(secret) {
  const lower = secret.toLowerCase();
  if (INSECURE_PLACEHOLDERS.has(lower)) return true;
  if (
    lower.includes('placeholder') ||
    lower.includes('change_me') ||
    lower.includes('changeme') ||
    lower.includes('your_jwt_secret')
  ) {
    return true;
  }
  return false;
}

function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : '';

  if (NODE_ENV === 'test') {
    // Isolated test configuration
    return secret || 'test_isolated_suite_secret_key_min_32_characters_long';
  }

  // Non-test environments: enforce strict security requirements
  if (!secret) {
    console.error('CRITICAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing.');
    throw new Error('FATAL: A secure JWT_SECRET of at least 32 characters must be configured in environment variables.');
  }

  if (secret.length < 32) {
    console.error('CRITICAL CONFIGURATION ERROR: JWT_SECRET must be at least 32 characters long.');
    throw new Error('FATAL: JWT_SECRET is too short. Minimum length is 32 characters.');
  }

  if (isPlaceholderOrPredictable(secret)) {
    console.error('CRITICAL CONFIGURATION ERROR: Predictable or placeholder JWT_SECRET is not permitted.');
    throw new Error('FATAL: Insecure JWT_SECRET placeholder detected. You must set a unique, unguessable secret.');
  }

  return secret;
}

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  JWT_SECRET: resolveJwtSecret(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

module.exports = env;
