const mongoose = require('mongoose');
const readline = require('readline');
const path = require('path');
const env = require('../config/env');
const User = require('../models/user.model');

/**
 * Safe Local Administrator Setup & Recovery Utility
 * 
 * Capabilities:
 * - Detects existing administrator accounts in the database.
 * - Confirms whether an existing account is a disposable test fixture (e.g. @*test.com).
 * - Safe Mode A: Reclaims / Updates the confirmed test account with real administrator credentials
 *   (preserving relational integrity with existing ParentStudent records).
 * - Safe Mode B: Creates a brand-new administrator account (supporting multi-admin environments).
 * - Prevents accidental overwrites of unknown or real administrator accounts.
 * - Uses production bcrypt hashing via User.hashPassword.
 * - Never prints passwords, hashes, or secrets.
 * - Does not touch or delete students, teachers, or academic records.
 * 
 * Usage:
 *   Interactive mode:
 *     node src/scripts/setupAdmin.js
 * 
 *   Automated / Non-Interactive mode:
 *     ADMIN_NAME="Your Name" ADMIN_EMAIL="your.email@example.com" ADMIN_PASSWORD="YourSecurePassword" node src/scripts/setupAdmin.js --action=update
 *     (or --action=create)
 */

function isDisposableTestAccount(user) {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase();
  const name = (user.name || '').toLowerCase();
  
  const testDomains = ['@p2test.com', '@e2etest.com', '@test.com', '@example.com', '@p5mobile.com'];
  const testPatterns = ['admin_p2@', 'admin_test@', 'admin_e2e@', 'test_', 'p2 admin'];

  const hasTestDomain = testDomains.some((d) => email.endsWith(d));
  const hasTestPattern = testPatterns.some((p) => email.includes(p) || name.includes(p));

  return hasTestDomain || hasTestPattern;
}

function prompt(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function runSetup(options = {}) {
  const isCli = require.main === module;

  if (isCli) {
    console.log('========================================================================');
    console.log('🛡️  School Management System — Administrator Setup & Recovery');
    console.log('========================================================================\n');
  }

  const shouldDisconnect = mongoose.connection.readyState === 0;
  if (shouldDisconnect) {
    await mongoose.connect(env.MONGODB_URI);
    if (isCli) {
      console.log(`[CONNECTED] MongoDB database: "${mongoose.connection.name}"\n`);
    }
  }

  try {
    // 1. Audit existing administrator accounts
    const existingAdmins = await User.find({ role: 'admin' }).select('name email role status createdAt');

    let targetTestAdmin = null;

    if (existingAdmins.length > 0) {
      if (isCli) {
        console.log(`Found ${existingAdmins.length} existing administrator account(s):`);
        existingAdmins.forEach((adm, idx) => {
          const isTest = isDisposableTestAccount(adm);
          console.log(
            `  [${idx + 1}] Name: "${adm.name}" | Email: "${adm.email}" | Status: "${adm.status}" | Test Account: ${isTest ? 'YES (disposable fixture)' : 'NO (potential real account)'}`
          );
        });
        console.log('');
      }

      // Check if any admin is a confirmed test fixture
      targetTestAdmin = existingAdmins.find((a) => isDisposableTestAccount(a));
    } else {
      if (isCli) {
        console.log('No administrator accounts found. Proceeding with fresh setup.\n');
      }
    }

    // 2. Determine Action: update vs create
    let action = options.action || (process.argv.find((a) => a.startsWith('--action=')) || '').split('=')[1];

    if (!action && targetTestAdmin && isCli) {
      console.log('Options:');
      console.log(`  1. [RECOMMENDED] Update test account "${targetTestAdmin.email}" with your credentials`);
      console.log('     (Preserves existing linked records without leaving orphaned test accounts)');
      console.log('  2. Create a new administrator account (keeps existing test account unchanged)\n');

      const choice = await prompt('Select option (1 or 2, default: 1): ');
      action = choice === '2' ? 'create' : 'update';
    } else if (!action) {
      action = targetTestAdmin ? 'update' : 'create';
    }

    // 3. Collect Credentials
    let name = options.name || process.env.ADMIN_NAME;
    let email = options.email || process.env.ADMIN_EMAIL;
    let password = options.password || process.env.ADMIN_PASSWORD;

    if (!name && isCli) {
      name = await prompt('Enter your Administrator Name (e.g. Principal Jane Doe): ');
    }
    if (!name || !name.trim()) {
      throw new Error('Administrator name is required.');
    }

    if (!email && isCli) {
      email = await prompt('Enter your Administrator Email: ');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new Error('A valid email address is required.');
    }
    const normalizedEmail = email.trim().toLowerCase();

    if (!password && isCli) {
      password = await prompt('Enter your secure Password (minimum 8 characters): ');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    // Check email collision
    const emailConflict = await User.findOne({ email: normalizedEmail });
    if (emailConflict) {
      if (action === 'update' && targetTestAdmin && emailConflict._id.equals(targetTestAdmin._id)) {
        // Email is the same as the account being updated - permitted
      } else {
        throw new Error(`An account with email "${normalizedEmail}" already exists in the system.`);
      }
    }

    // 4. Secure Password Hashing
    const passwordHash = await User.hashPassword(password);

    // 5. Execute Safe Setup
    let resultAdmin;

    if (action === 'update' && targetTestAdmin) {
      targetTestAdmin.name = name.trim();
      targetTestAdmin.email = normalizedEmail;
      targetTestAdmin.passwordHash = passwordHash;
      targetTestAdmin.status = 'active';
      await targetTestAdmin.save();

      resultAdmin = targetTestAdmin;

      if (isCli) {
        console.log('\n========================================================================');
        console.log('✅ Administrator account successfully reclaimed and updated!');
        console.log(`👤 Name:   ${resultAdmin.name}`);
        console.log(`📧 Email:  ${resultAdmin.email}`);
        console.log(`🔑 Role:   ${resultAdmin.role}`);
        console.log(`🛡️ Status: ${resultAdmin.status}`);
        console.log('========================================================================\n');
      }
    } else {
      const newAdmin = new User({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'admin',
        status: 'active',
      });
      await newAdmin.save();

      resultAdmin = newAdmin;

      if (isCli) {
        console.log('\n========================================================================');
        console.log('✅ New Administrator account created successfully!');
        console.log(`👤 Name:   ${resultAdmin.name}`);
        console.log(`📧 Email:  ${resultAdmin.email}`);
        console.log(`🔑 Role:   ${resultAdmin.role}`);
        console.log(`🛡️ Status: ${resultAdmin.status}`);
        console.log('========================================================================\n');
      }
    }

    return {
      success: true,
      action,
      admin: {
        id: resultAdmin._id,
        name: resultAdmin.name,
        email: resultAdmin.email,
        role: resultAdmin.role,
        status: resultAdmin.status,
      },
    };
  } finally {
    if (shouldDisconnect) {
      await mongoose.disconnect();
    }
  }
}

if (require.main === module) {
  runSetup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`\n❌ Setup failed: ${err.message}\n`);
      process.exit(1);
    });
}

module.exports = { runSetup, isDisposableTestAccount };
