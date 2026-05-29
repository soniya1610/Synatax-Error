const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables. Database connection deferred.');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create demo user on startup
    setTimeout(async () => {
      try {
        const User = require('../models/User');
        const bcrypt = require('bcryptjs');
        const demoEmail = process.env.DEMO_EMAIL || 'demo@startupiq.ai';
        const demoPassword = process.env.DEMO_PASSWORD || 'Demo@12345';
        
        let demo = await User.findOne({ email: demoEmail });
        if (!demo) {
          await User.create({
            fullName: 'Demo User',
            email: demoEmail,
            password: demoPassword, // pre-save hook will hash it correctly
            isDemo: true,
            isVerified: true,
            role: 'demo',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
          });
          console.log('✅ Demo user created successfully');
        } else {
          // If demo user exists, make sure password works.
          // If mismatch (due to double-hashing or changes), reset it.
          const isMatch = await bcrypt.compare(demoPassword, demo.password || '');
          if (!isMatch) {
            console.log('🔄 Demo user password mismatch or double-hashed, updating/resetting...');
            demo.password = demoPassword; // pre-save hook will hash it correctly
            await demo.save();
            console.log('✅ Demo user password updated and single-hashed successfully');
          }
        }
      } catch (e) {
        console.log('Demo user setup error:', e.message);
      }
    }, 2000);

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

module.exports = connectDB;
