const mongoose = require('mongoose');
const readline = require('readline');
const env = require('../config/env');
const User = require('../models/user.model');

/**
 * Controlled CLI Seed / Bootstrap Script for the Initial Administrator
 * 
 * Usage:
 *   Option A (via Environment Variables):
 *     ADMIN_NAME="System Administrator" ADMIN_EMAIL="admin@school.edu" ADMIN_PASSWORD="YourSecurePassword123" node src/scripts/bootstrapAdmin.js
 * 
 *   Option B (Interactive Prompt):
 *     node src/scripts/bootstrapAdmin.js
 */

async function promptInput(question, isPassword = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function bootstrapAdmin(options = null) {
  const isCli = require.main === module && !options;
  if (isCli) {
    console.log('====================================================');
    console.log('🛡️  School Management System — Administrator Bootstrap');
    console.log('====================================================');
  }

  const shouldDisconnect = mongoose.connection.readyState === 0;
  if (shouldDisconnect) {
    await mongoose.connect(env.MONGODB_URI);
    if (isCli) console.log(`Connected to database: ${mongoose.connection.name}`);
  }

  try {
    // Check if ANY administrator already exists in the system
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      if (isCli) {
        console.log(`\n⚠️  An administrator account already exists: "${existingAdmin.email}".`);
        console.log('Refusing to overwrite or duplicate existing administrator account.');
        console.log('To modify credentials, use verified in-app administrator settings.');
      }
      return {
        success: true,
        created: false,
        message: `An administrator account already exists: ${existingAdmin.email}`,
      };
    }

    // Retrieve credentials from options, environment variables, or interactive prompt
    let name = options?.name || process.env.ADMIN_NAME;
    let email = options?.email || process.env.ADMIN_EMAIL;
    let password = options?.password || process.env.ADMIN_PASSWORD;

    if (!name && isCli) {
      name = await promptInput('Enter Administrator Full Name (e.g. System Admin): ');
    }
    if (!name) {
      name = 'System Administrator';
    }

    if (!email && isCli) {
      email = await promptInput('Enter Administrator Email Address: ');
    }
    if (!email || !email.includes('@')) {
      const err = 'A valid email address is required.';
      if (isCli) console.error(`❌ Error: ${err}`);
      return { success: false, created: false, message: err };
    }

    if (!password && isCli) {
      password = await promptInput('Enter Secure Administrator Password (min 8 characters): ', true);
    }
    if (!password || password.length < 8) {
      const err = 'Password must be at least 8 characters long.';
      if (isCli) console.error(`❌ Error: ${err}`);
      return { success: false, created: false, message: err };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if a user with this email already exists
    const emailExists = await User.findOne({ email: normalizedEmail });
    if (emailExists) {
      const err = `An account with email "${normalizedEmail}" already exists.`;
      if (isCli) console.error(`❌ Error: ${err}`);
      return { success: false, created: false, message: err };
    }

    // Securely hash password
    const passwordHash = await User.hashPassword(password);

    // Create the initial Administrator
    const newAdmin = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'admin',
      status: 'active',
    });

    await newAdmin.save();

    if (isCli) {
      console.log('\n====================================================');
      console.log('✅ Initial Administrator account created successfully!');
      console.log(`👤 Name:  ${newAdmin.name}`);
      console.log(`📧 Email: ${newAdmin.email}`);
      console.log(`🔑 Role:  ${newAdmin.role}`);
      console.log('====================================================\n');
    }

    return {
      success: true,
      created: true,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    };
  } finally {
    if (shouldDisconnect) {
      await mongoose.disconnect();
    }
  }
}

// Automatically invoke if executed directly via CLI
if (require.main === module) {
  bootstrapAdmin()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error('❌ Bootstrap failed with error:', err.message);
      process.exit(1);
    });
}

module.exports = {
  bootstrapAdmin,
};
